// src/app/api/import-journal/route.ts
//
// Accepts one or more images of handwritten journal pages, sends them to
// Gemini's vision model for transcription, and returns structured results
// for the user to review before saving as journal entries.
//
// Falls back gracefully with a clear error if GEMINI_API_KEY is not set —
// this lets the feature ship now and "switch on" later by adding the key.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

const GEMINI_MODEL = "gemini-2.5-flash";
const MAX_IMAGES = 10;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB per image, matches storage limits

type ImportResult = {
  index: number;
  success: boolean;
  title?: string;
  content?: string;
  suggestedDate?: string; // ISO date string, AI's best guess if visible (e.g. dated entries)
  error?: string;
};

const TRANSCRIPTION_PROMPT = `You are transcribing a photo of a handwritten journal page.

Instructions:
- Transcribe the handwritten text as accurately as possible, fixing only obvious OCR artifacts (not spelling/grammar choices the writer made).
- If the page has a visible date written on it, extract it and return it as "suggestedDate" in YYYY-MM-DD format. If no date is visible or legible, omit this field.
- Suggest a short title (3-6 words) that captures the entry's theme, based on the content. Do not just say "Journal Entry".
- If the image does not appear to contain handwritten journal text (e.g. it's blank, a random photo, or unreadable), set "success" to false and provide a brief "error" explaining why.

Respond ONLY with a JSON object in this exact shape, no markdown formatting, no code fences:
{
  "success": true,
  "title": "string",
  "content": "string",
  "suggestedDate": "YYYY-MM-DD" (optional, omit if unknown)
}

or if the image can't be transcribed:
{
  "success": false,
  "error": "string"
}`;

async function transcribeImage(
  base64Data: string,
  mimeType: string,
  apiKey: string,
): Promise<{ title?: string; content?: string; suggestedDate?: string; success: boolean; error?: string }> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: TRANSCRIPTION_PROMPT },
              { inline_data: { mime_type: mimeType, data: base64Data } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error("Gemini API error:", response.status, errText);
    return { success: false, error: "AI transcription service error. Try again later." };
  }

  const data = await response.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    return { success: false, error: "No transcription returned. Try a clearer photo." };
  }

  try {
    const parsed = JSON.parse(text);
    if (parsed.success === false) {
      return { success: false, error: parsed.error ?? "Could not read this image." };
    }
    return {
      success: true,
      title: typeof parsed.title === "string" ? parsed.title.slice(0, 100) : "Untitled",
      content: typeof parsed.content === "string" ? parsed.content : "",
      suggestedDate: typeof parsed.suggestedDate === "string" ? parsed.suggestedDate : undefined,
    };
  } catch (err) {
    console.error("Failed to parse Gemini response:", err, text);
    return { success: false, error: "Could not process this image. Try again." };
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: allowed, error: rateLimitError } = await supabase.rpc(
      "check_rate_limit",
      {
        key: `import:${user.id}`,
        max_count: 20,
        window_seconds: 60 * 60,
      },
    );
    if (rateLimitError || allowed !== true) {
      return NextResponse.json(
        { error: "Too many import requests. Please try again later." },
        { status: 429 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "AI import is temporarily unavailable. Please try again later, or write this entry manually for now.",
          unavailable: true,
        },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No images provided." }, { status: 400 });
    }
    if (files.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `You can import up to ${MAX_IMAGES} photos at a time.` },
        { status: 400 },
      );
    }

    const validMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    const results: ImportResult[] = await Promise.all(
      files.map(async (file, index): Promise<ImportResult> => {
        if (!validMimeTypes.includes(file.type)) {
          return { index, success: false, error: "Unsupported file type. Use JPG, PNG, or WebP." };
        }
        if (file.size > MAX_IMAGE_BYTES) {
          return { index, success: false, error: "Image too large (max 5MB)." };
        }

        try {
          const buffer = await file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          const result = await transcribeImage(base64, file.type, apiKey);

          if (!result.success) {
            return { index, success: false, error: result.error };
          }

          return {
            index,
            success: true,
            title: result.title,
            content: result.content,
            suggestedDate: result.suggestedDate,
          };
        } catch (err) {
          console.error("Error processing image", index, err);
          return { index, success: false, error: "Failed to process this image." };
        }
      }),
    );

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Import journal error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
