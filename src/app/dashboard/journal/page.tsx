"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { JournalEntry } from "@/lib/types/database";

export default function JournalPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchEntries = useCallback(async () => {
    try {
      setFetching(true);
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setEntries((data as JournalEntry[]) ?? []);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load entries. Please refresh.");
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
      setMessage("Content cannot be empty.");
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

      const { error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        title: title.trim() || "Untitled",
        content: content.trim(),
        is_private: true,
      });
      if (error) throw error;

      setTitle("");
      setContent("");
      setMessage("Entry saved!");
      setIsError(false);
      await fetchEntries();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setMessage(msg);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "60px auto", padding: "0 24px" }}>
      <h1 style={{ marginBottom: 32 }}>Your journal</h1>

      <div style={{ marginBottom: 40 }}>
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ddd",
            marginBottom: 12,
            fontSize: 16,
          }}
        />
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 16,
            resize: "vertical",
          }}
        />
        {message && (
          <p
            style={{
              marginTop: 8,
              fontSize: 14,
              color: isError ? "#e53e3e" : "#555",
            }}
          >
            {message}
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            marginTop: 12,
            padding: "10px 24px",
            borderRadius: 8,
            background: loading ? "#666" : "#000",
            color: "#fff",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 16,
          }}
        >
          {loading ? "Saving..." : "Save entry"}
        </button>
      </div>

      <h2 style={{ marginBottom: 16 }}>Past entries</h2>
      {fetching && <p style={{ color: "#888" }}>Loading entries...</p>}
      {!fetching && entries.length === 0 && (
        <p style={{ color: "#888" }}>No entries yet. Write your first one above.</p>
      )}
      {!fetching &&
        entries.map((entry) => (
          <div
            key={entry.id}
            style={{
              padding: 16,
              borderRadius: 8,
              border: "1px solid #eee",
              marginBottom: 12,
            }}
          >
            <p style={{ fontWeight: 500, marginBottom: 4 }}>{entry.title}</p>
            <p style={{ color: "#555", fontSize: 14, marginBottom: 8 }}>
              {entry.content}
            </p>
            <p style={{ color: "#aaa", fontSize: 12 }}>
              {new Date(entry.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        ))}
    </div>
  );
}
