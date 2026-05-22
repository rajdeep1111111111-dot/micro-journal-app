"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { JournalEntry } from "@/lib/types/database";

export default function ShareTab() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not authenticated");

      const { data: entryRows, error: entriesError } = await supabase
        .from("journal_entries")
        .select("id, user_id, title, content, is_private, created_at, updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (entriesError) throw entriesError;
      setEntries((entryRows as JournalEntry[] | null) ?? []);

      const { data: friendships, error: friendsError } = await supabase
        .from("friendships")
        .select("requester_id, recipient_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);
      if (friendsError) throw friendsError;

      const ids = (friendships ?? []).map((f) =>
        f.requester_id === user.id ? f.recipient_id : f.requester_id,
      );
      setFriendIds(ids);
    } catch (err) {
      console.error(err);
      setMsg(err instanceof Error ? err.message : "Failed to load entries.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleShare = async () => {
    if (!selectedId) {
      setMsg("Select an entry first.");
      return;
    }
    if (friendIds.length === 0) {
      setMsg("Add a friend before sharing entries.");
      return;
    }

    setSharing(true);
    setMsg("");
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not authenticated");

      const rows = friendIds.map((friendId) => ({
        entry_id: selectedId,
        shared_by: user.id,
        shared_with: friendId,
      }));

      const { error } = await supabase.from("shared_entries").insert(rows);
      if (error) throw error;

      setMsg("Shared with your friends! ✓");
      setSelectedId(null);
      setNote("");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setMsg(err instanceof Error ? err.message : "Failed to share entry.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div style={{ padding: "0 28px 24px" }}>
      {loading && (
        <p style={{ color: "var(--ink-muted)", fontSize: "14px" }}>
          Loading entries...
        </p>
      )}

      {!loading && (
        <>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--ink-muted)",
              marginBottom: "12px",
            }}
          >
            Select an entry to share
          </div>
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "18px",
              border: "1px solid var(--cream-dark)",
              marginBottom: "16px",
            }}
          >
            {entries.length === 0 ? (
              <p style={{ fontSize: "14px", color: "var(--ink-muted)" }}>
                No journal entries yet.
              </p>
            ) : (
              entries.map((entry, i) => (
                <div
                  key={entry.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(entry.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedId(entry.id);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 0",
                    borderBottom:
                      i < entries.length - 1
                        ? "1px solid var(--cream-dark)"
                        : "none",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border:
                        selectedId === entry.id
                          ? "none"
                          : "2px solid var(--ink-muted)",
                      background:
                        selectedId === entry.id ? "var(--accent)" : "transparent",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selectedId === entry.id && (
                      <span style={{ color: "white", fontSize: "10px" }}>✓</span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "var(--ink)",
                      fontFamily: "var(--font-serif)",
                    }}
                  >
                    {entry.title || "Untitled"}
                  </span>
                </div>
              ))
            )}
          </div>

          <label
            htmlFor="share-note"
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--ink-muted)",
              marginBottom: "12px",
            }}
          >
            Add a note (optional)
          </label>
          <textarea
            id="share-note"
            placeholder="Say something to your friends..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              border: "1px solid var(--cream-dark)",
              background: "white",
              borderRadius: "16px",
              padding: "14px 16px",
              fontSize: "14px",
              color: "var(--ink)",
              resize: "none",
              outline: "none",
              lineHeight: 1.7,
              marginBottom: "10px",
            }}
          />
          {msg && (
            <p
              style={{
                fontSize: "13px",
                color: msg.includes("✓") ? "var(--green)" : "#DC2626",
                marginBottom: "10px",
              }}
            >
              {msg}
            </p>
          )}
          <button
            type="button"
            onClick={() => void handleShare()}
            disabled={sharing || entries.length === 0}
            style={{
              width: "100%",
              background:
                sharing || entries.length === 0
                  ? "var(--ink-soft)"
                  : "var(--ink)",
              color: "white",
              border: "none",
              borderRadius: "14px",
              padding: "14px",
              fontSize: "14px",
              fontWeight: 500,
              cursor:
                sharing || entries.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            {sharing ? "Sharing..." : "Share with friends"}
          </button>
        </>
      )}
    </div>
  );
}
