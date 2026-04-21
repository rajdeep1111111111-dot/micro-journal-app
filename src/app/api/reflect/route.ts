import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { entryId } = await request.json();

    if (!entryId || typeof entryId !== "string") {
      return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
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
      .select("id, user_id, content")
      .eq("id", entryId)
      .single();

    if (entryError || !entry || entry.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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
          content: `Here is my journal entry:\n\n${entry.content}`,
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
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
