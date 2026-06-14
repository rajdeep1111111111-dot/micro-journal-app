// src/components/onboarding/FirstEntryPrompt.tsx
"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateStreak } from "@/lib/streaks";

type Props = {
  onDone: () => void;
};

const PROMPTS = [
  "What's on your mind right now?",
  "How has today been so far?",
  "What's one thing you're looking forward to?",
];

export default function FirstEntryPrompt({ onDone }: Props) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const supabase = useMemo(() => createClient(), []);

  const prompt = useMemo(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)], []);

  const handleSave = async () => {
    if (!content.trim()) {
      onDone(); // allow skipping without writing
      return;
    }

    setSaving(true);
    setError("");
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not authenticated");

      const { error: insertError } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        title: "My first entry",
        content: content.trim(),
        is_private: true,
        source: "manual",
      });
      if (insertError) throw insertError;

      await updateStreak(user.id);
      onDone();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "60px 28px 40px", display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "13px", color: "var(--ink-muted)", marginBottom: "8px" }}>
          Let&apos;s write your first entry
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "26px", color: "var(--ink)", lineHeight: 1.25 }}>
          {prompt}
        </div>
        <div style={{ fontSize: "13px", color: "var(--ink-muted)", marginTop: "8px", lineHeight: 1.6 }}>
          A sentence or two is plenty. This starts your streak.
        </div>
      </div>

      <label htmlFor="first-entry-content" className="sr-only">Your first journal entry</label>
      <textarea
        id="first-entry-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing..."
        rows={6}
        autoFocus
        style={{
          width: "100%",
          border: "1px solid var(--cream-dark)",
          background: "var(--input-bg)",
          borderRadius: "16px",
          padding: "14px 16px",
          fontSize: "14px",
          color: "var(--ink)",
          resize: "vertical",
          outline: "none",
          lineHeight: 1.7,
        }}
      />

      {error && <p style={{ fontSize: "13px", color: "#DC2626", marginTop: "10px" }}>{error}</p>}

      <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          style={{
            width: "100%",
            background: saving ? "var(--ink-soft)" : "var(--btn-primary)",
            color: "var(--btn-primary-text)",
            border: "none",
            borderRadius: "14px",
            padding: "14px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : content.trim() ? "Save and continue" : "Skip for now"}
        </button>
      </div>
    </div>
  );
}
