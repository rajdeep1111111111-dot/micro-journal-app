"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateStreak } from "@/lib/streaks";

type Props = {
  onSaved: (entryId: string) => void;
};

export default function EntryForm({ onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const handleSave = async () => {
    if (!content.trim()) {
      setMessage("Write something first.");
      setIsError(true);
      return;
    }
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          title: title.trim() || "Untitled",
          content: content.trim(),
          is_private: true,
        })
        .select()
        .single();
      if (error) throw error;
      await updateStreak(user.id);
      setTitle("");
      setContent("");
      setMessage("Entry saved! Hit ✦ Reflect for an AI reflection.");
      setIsError(false);
      onSaved(data.id);
    } catch (err: unknown) {
      setMessage(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      <div style={{ padding: "52px 28px 20px" }}>
        <div
          style={{
            fontSize: "12px",
            color: "var(--ink-muted)",
            marginBottom: "4px",
          }}
        >
          {dateStr}
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "26px",
            color: "var(--ink)",
          }}
        >
          Your Daily Journal
        </div>
      </div>
      <div style={{ padding: "0 28px" }}>
        <input
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid var(--cream-dark)",
            background: "white",
            borderRadius: "16px",
            padding: "14px 16px",
            fontSize: "15px",
            color: "var(--ink)",
            marginBottom: "10px",
            outline: "none",
          }}
        />
        <textarea
          placeholder="What's on your mind today?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          style={{
            width: "100%",
            border: "1px solid var(--cream-dark)",
            background: "white",
            borderRadius: "16px",
            padding: "14px 16px",
            fontSize: "14px",
            color: "var(--ink)",
            resize: "vertical",
            outline: "none",
            lineHeight: 1.7,
          }}
        />
        {message && (
          <p
            style={{
              marginTop: "8px",
              fontSize: "13px",
              color: isError ? "#DC2626" : "var(--green)",
            }}
          >
            {message}
          </p>
        )}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            style={{
              flex: 1,
              background: loading ? "var(--ink-soft)" : "var(--ink)",
              color: "white",
              border: "none",
              borderRadius: "14px",
              padding: "14px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Saving..." : "Save entry"}
          </button>
        </div>
      </div>
    </div>
  );
}
