import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entryId, content } = body;

    if (!entryId || typeof entryId !== "string") {
      return NextResponse.json({ error: "Invalid entry ID" }, { status: 400 });
    }
    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length < 10
    ) {
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

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: entry, error: entryError } = await supabase
      .from("journal_entries")
      .select("id")
      .eq("id", entryId)
      .eq("user_id", user.id)
      .single();

    if (entryError || !entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content: `You are a warm, thoughtful journaling companion. When someone shares a journal entry, you offer a brief, genuine reflection — 2-3 sentences that help them see their thoughts from a new angle. Be empathetic, not clinical. Never give advice unless asked. Write in second person, present tense.`,
        },
        {
          role: "user",
          content: `Here is my journal entry:\n\n${content.trim()}`,
        },
      ],
    });

    const reflection = response.choices[0]?.message.content ?? "";

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
