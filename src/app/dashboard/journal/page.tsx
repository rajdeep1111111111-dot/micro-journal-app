"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

type Entry = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export default function JournalPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = useMemo(() => createClient(), []);

  const fetchEntries = useCallback(async () => {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setEntries(data);
  }, [supabase]);

  useEffect(() => {
    void fetchEntries();
  }, [fetchEntries]);

  const handleSave = async () => {
    if (!content.trim()) {
      setMessage("Content cannot be empty.");
      return;
    }
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      title: title.trim() || "Untitled",
      content: content.trim(),
      is_private: true,
    });

    if (error) setMessage(error.message);
    else {
      setTitle("");
      setContent("");
      setMessage("Entry saved!");
      void fetchEntries();
    }
    setLoading(false);
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
          <p style={{ marginTop: 8, color: "#555", fontSize: 14 }}>{message}</p>
        )}
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            marginTop: 12,
            padding: "10px 24px",
            borderRadius: 8,
            background: "#000",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          {loading ? "Saving..." : "Save entry"}
        </button>
      </div>

      <h2 style={{ marginBottom: 16 }}>Past entries</h2>
      {entries.length === 0 && (
        <p style={{ color: "#888" }}>No entries yet. Write your first one above.</p>
      )}
      {entries.map((entry) => (
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
            {new Date(entry.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
