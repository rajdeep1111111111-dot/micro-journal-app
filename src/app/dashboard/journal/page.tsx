"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { JournalEntry, AiReflection } from "@/lib/types/database";
import { updateStreak } from "@/lib/streaks";

type EntryRow = JournalEntry & {
  ai_reflections?: AiReflection[] | null;
};

export default function JournalPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [reflecting, setReflecting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchEntries = useCallback(async () => {
    try {
      setFetching(true);
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*, ai_reflections(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data as EntryRow[] | null) ?? [];
      setEntries(rows);
      const refs: Record<string, string> = {};
      rows.forEach((e) => {
        if (e.ai_reflections?.[0]) refs[e.id] = e.ai_reflections[0].reflection;
      });
      setReflections(refs);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load entries.");
      setIsError(true);
    } finally {
      setFetching(false);
    }
  }, [supabase]);

  useEffect(() => {
    void fetchEntries();
  }, [fetchEntries]);

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

      setSavedEntryId(data.id);
      await updateStreak(user.id);
      setTitle("");
      setContent("");
      setMessage("Entry saved! Hit ✦ Reflect for an AI reflection.");
      setIsError(false);
      await fetchEntries();
    } catch (err: unknown) {
      setMessage(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReflect = async () => {
    if (!savedEntryId) {
      setMessage("Save an entry first before reflecting.");
      setIsError(true);
      return;
    }

    const entry = entries.find((e) => e.id === savedEntryId);
    if (!entry) return;

    setReflecting(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryId: entry.id,
          content: entry.content,
        }),
      });

      if (!response.ok) throw new Error("Reflection failed");
      const { reflection } = (await response.json()) as {
        reflection: string;
      };

      setReflections((prev) => ({ ...prev, [entry.id]: reflection }));
      setMessage("Reflection saved!");
      setIsError(false);
    } catch (err: unknown) {
      setMessage(
        err instanceof Error ? err.message : "Reflection failed.",
      );
      setIsError(true);
    } finally {
      setReflecting(false);
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
          <button
            type="button"
            onClick={handleReflect}
            disabled={reflecting || !savedEntryId}
            style={{
              background:
                reflecting || !savedEntryId
                  ? "var(--cream-dark)"
                  : "var(--accent-light)",
              color:
                reflecting || !savedEntryId
                  ? "var(--ink-muted)"
                  : "var(--accent)",
              border: "none",
              borderRadius: "14px",
              padding: "14px 18px",
              fontSize: "14px",
              fontWeight: 500,
              cursor:
                reflecting || !savedEntryId ? "not-allowed" : "pointer",
            }}
          >
            {reflecting ? "..." : "✦ Reflect"}
          </button>
        </div>
      </div>

      <div
        style={{
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
          padding: "24px 28px 12px",
        }}
      >
        Past entries
      </div>
      <div style={{ padding: "0 28px 24px" }}>
        {fetching && (
          <p style={{ color: "var(--ink-muted)", fontSize: "14px" }}>
            Loading...
          </p>
        )}
        {!fetching && entries.length === 0 && (
          <p style={{ color: "var(--ink-muted)", fontSize: "14px" }}>
            No entries yet.
          </p>
        )}
        {entries.map((entry) => (
          <div
            key={entry.id}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "16px",
              marginBottom: "10px",
              border: "1px solid var(--cream-dark)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "15px",
                color: "var(--ink)",
                marginBottom: "4px",
              }}
            >
              {entry.title}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--ink-muted)",
                lineHeight: 1.5,
                marginBottom: "8px",
              }}
            >
              {entry.content.slice(0, 100)}...
            </div>
            {reflections[entry.id] && (
              <div
                style={{
                  background: "var(--ink)",
                  borderRadius: "12px",
                  padding: "12px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: "6px",
                  }}
                >
                  AI Reflection
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.9)",
                    fontStyle: "italic",
                    lineHeight: 1.6,
                  }}
                >
                  {reflections[entry.id]}
                </div>
              </div>
            )}
            <div style={{ fontSize: "11px", color: "var(--ink-muted)" }}>
              {new Date(entry.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
