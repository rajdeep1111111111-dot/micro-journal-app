"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { JournalEntry } from "@/lib/types/database";

type Post = {
  id: string;
  entry_id: string;
  shared_by: string;
  created_at: string;
  username: string;
  is_public: boolean;
  title: string;
  content: string;
  likes: number;
  comments: number;
};

type SharedEntryRow = {
  id: string;
  entry_id: string;
  shared_by: string;
  created_at: string;
  journal_entries:
    | Pick<JournalEntry, "title" | "content">
    | Pick<JournalEntry, "title" | "content">[]
    | null;
};

type UserRow = {
  id: string;
  username: string;
  is_public: boolean;
};

function entryFrom(row: SharedEntryRow) {
  const je = row.journal_entries;
  if (Array.isArray(je)) return je[0] ?? null;
  return je;
}

export default function FeedTab() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postNote, setPostNote] = useState("");
  const [postMsg, setPostMsg] = useState("");
  const [composerInitial, setComposerInitial] = useState("R");

  const supabase = useMemo(() => createClient(), []);

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setComposerInitial(
        user.email?.[0]?.toUpperCase() ?? user.id[0]?.toUpperCase() ?? "R",
      );

      const { data: friendships } = await supabase
        .from("friendships")
        .select("requester_id, recipient_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      const friendIds = (friendships ?? []).map((f) =>
        f.requester_id === user.id ? f.recipient_id : f.requester_id,
      );

      const { data: sharedEntries, error: sharedError } = await supabase
        .from("shared_entries")
        .select(
          `
          id,
          entry_id,
          shared_by,
          created_at,
          journal_entries (title, content)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(20);

      if (sharedError) throw sharedError;
      if (!sharedEntries?.length) {
        setPosts([]);
        return;
      }

      const rows = sharedEntries as SharedEntryRow[];
      const sharerIds = [...new Set(rows.map((se) => se.shared_by))];

      const { data: userRows, error: usersError } = await supabase
        .from("users")
        .select("id, username, is_public")
        .in("id", sharerIds);

      if (usersError) throw usersError;

      const usersById = Object.fromEntries(
        ((userRows as UserRow[] | null) ?? []).map((u) => [u.id, u]),
      );

      const filtered = rows.filter((se) => {
        const isMyFriend = friendIds.includes(se.shared_by);
        const isPublic = usersById[se.shared_by]?.is_public === true;
        const isMe = se.shared_by === user.id;
        return isMyFriend || isPublic || isMe;
      });

      const mapped: Post[] = filtered.map((se) => {
        const entry = entryFrom(se);
        const author = usersById[se.shared_by];
        return {
          id: se.id,
          entry_id: se.entry_id,
          shared_by: se.shared_by,
          created_at: se.created_at,
          username: author?.username ?? "Unknown",
          is_public: author?.is_public ?? false,
          title: entry?.title ?? "Untitled",
          content: entry?.content ?? "",
          likes: 0,
          comments: 0,
        };
      });

      setPosts(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  const toggleLike = (id: string) =>
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

  const closePostModal = () => {
    setShowPostModal(false);
    setPostNote("");
    setPostMsg("");
  };

  const handlePost = () => {
    if (!postNote.trim()) return;
    setPostMsg("Posted! ✓");
    setPostNote("");
    setTimeout(() => {
      closePostModal();
    }, 2000);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <>
      <div style={{ padding: "0 28px 16px" }}>
        <button
          type="button"
          onClick={() => setShowPostModal(true)}
          style={{
            width: "100%",
            background: "var(--surface)",
            border: "1px solid var(--cream-dark)",
            borderRadius: "16px",
            padding: "14px 16px",
            textAlign: "left",
            fontSize: "14px",
            color: "var(--ink-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--avatar-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--cream)",
              fontSize: "12px",
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {composerInitial}
          </div>
          Share a journal entry...
        </button>
      </div>

      {loading && (
        <p
          style={{
            padding: "0 28px",
            color: "var(--ink-muted)",
            fontSize: "14px",
          }}
        >
          Loading feed...
        </p>
      )}

      {!loading && posts.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 28px" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>◎</div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "18px",
              color: "var(--ink)",
              marginBottom: "8px",
            }}
          >
            Nothing here yet
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "var(--ink-muted)",
              lineHeight: 1.6,
            }}
          >
            Add friends or follow public accounts to see their entries here.
          </div>
        </div>
      )}

      <div style={{ paddingBottom: "24px" }}>
        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              margin: "0 28px 12px",
              background: "var(--surface)",
              borderRadius: "20px",
              padding: "18px",
              border: "1px solid var(--cream-dark)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "white",
                  flexShrink: 0,
                }}
              >
                {post.username?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--ink)",
                  }}
                >
                  {post.username}
                </div>
                <div style={{ fontSize: "11px", color: "var(--ink-muted)" }}>
                  {timeAgo(post.created_at)}
                </div>
              </div>
              {post.is_public && (
                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--ink-muted)",
                    background: "var(--cream-dark)",
                    borderRadius: "8px",
                    padding: "2px 8px",
                  }}
                >
                  Public
                </div>
              )}
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "15px",
                color: "var(--ink)",
                marginBottom: "6px",
              }}
            >
              {post.title}
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "var(--ink-soft)",
                lineHeight: 1.6,
              }}
            >
              {post.content.slice(0, 150)}
              {post.content.length > 150 ? "..." : ""}
            </div>
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginTop: "14px",
                paddingTop: "12px",
                borderTop: "1px solid var(--cream-dark)",
              }}
            >
              <button
                type="button"
                aria-label={
                  liked[post.id]
                    ? `Unlike post (${post.likes + 1} likes)`
                    : `Like post (${post.likes} likes)`
                }
                aria-pressed={liked[post.id]}
                onClick={() => toggleLike(post.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: liked[post.id] ? "var(--accent)" : "var(--ink-muted)",
                  fontWeight: liked[post.id] ? 500 : 400,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {liked[post.id] ? "♥" : "♡"}{" "}
                {post.likes + (liked[post.id] ? 1 : 0)}
              </button>
              <button
                type="button"
                aria-label={`View comments (${post.comments})`}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "var(--ink-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                💬 {post.comments}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showPostModal && (
        <div
          role="presentation"
          onClick={closePostModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "430px",
              background: "var(--surface)",
              borderRadius: "28px 28px 0 0",
              padding: "28px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "4px",
                background: "var(--cream-dark)",
                borderRadius: "2px",
                margin: "0 auto 20px",
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "20px",
                color: "var(--ink)",
                marginBottom: "16px",
              }}
            >
              Share an entry
            </div>
            <label htmlFor="feed-post-note" className="sr-only">
              Share a journal entry with your friends
            </label>
            <textarea
              id="feed-post-note"
              placeholder="Share a journal entry with your friends..."
              value={postNote}
              onChange={(e) => setPostNote(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                border: "1px solid var(--cream-dark)",
                background: "var(--input-bg)",
                borderRadius: "16px",
                padding: "14px",
                fontSize: "14px",
                color: "var(--ink)",
                resize: "none",
                outline: "none",
                lineHeight: 1.6,
                marginBottom: "12px",
              }}
            />
            {postMsg && (
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--green)",
                  marginBottom: "10px",
                }}
              >
                {postMsg}
              </p>
            )}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={handlePost}
                style={{
                  flex: 1,
                  background: "var(--ink)",
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  padding: "14px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Post
              </button>
              <button
                type="button"
                onClick={closePostModal}
                style={{
                  background: "none",
                  border: "1px solid var(--cream-dark)",
                  borderRadius: "14px",
                  padding: "14px 18px",
                  fontSize: "14px",
                  cursor: "pointer",
                  color: "var(--ink-muted)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
