import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function evictExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore) {
    if (value.resetAt <= now) rateLimitStore.delete(key);
  }
}

function isRateLimited(key: string) {
  evictExpiredEntries();
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const body = await request.json();
    const { entryId } = body;

    if (!entryId || typeof entryId !== "string") {
      return NextResponse.json({ error: "Invalid entry ID" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitKey = `${user.id}:${getClientIp(request)}`;
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: "Too many reflection requests. Please try again shortly." },
        { status: 429 },
      );
    }

    const { data: entry, error: entryError } = await supabase
      .from("journal_entries")
      .select("id, content")
      .eq("id", entryId)
      .eq("user_id", user.id)
      .single();

    if (entryError || !entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const content = entry.content.trim();
    if (content.length < 10) {
      return NextResponse.json(
        { error: "Entry content too short" },
        { status: 400 },
      );
    }
    if (content.length > 10000) {
      return NextResponse.json(
        { error: "Entry content too long" },
        { status: 400 },
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: `You are a warm, thoughtful journaling companion. When someone shares a journal entry, you offer a brief, genuine reflection — 2-3 sentences that help them see their thoughts from a new angle. Be empathetic, not clinical. Never give advice unless asked. Write in second person, present tense.`,
    });

    const result = await model.generateContent(`Here is my journal entry:\n\n${content}`);
    const reflection = result.response.text();

    const { error: insertError } = await supabase.from("ai_reflections").upsert(
      {
        entry_id: entryId,
        reflection,
      },
      { onConflict: "entry_id" },
    );

    if (insertError) throw insertError;

    return NextResponse.json({ reflection });
  } catch (err) {
    console.error("Reflect API error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
