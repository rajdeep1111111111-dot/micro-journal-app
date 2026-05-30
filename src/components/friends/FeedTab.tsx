"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { JournalEntry } from "@/lib/types/database";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

type FeedTab = "foryou" | "following" | "public";

type Post = {
  id: string;
  entry_id: string;
  shared_by: string;
  created_at: string;
  username: string;
  avatar_url: string | null;
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
  avatar_url: string | null;
  is_public: boolean;
};

function entryFrom(row: SharedEntryRow) {
  const je = row.journal_entries;
  if (Array.isArray(je)) return je[0] ?? null;
  return je;
}

export default function FeedTab() {
  const [activeTab, setActiveTab] = useState<FeedTab>("foryou");
  const [posts, setPosts] = useState<Post[]>([]);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postNote, setPostNote] = useState("");
  const [postMsg, setPostMsg] = useState("");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
    avatar_url: string | null;
  } | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const loadFeed = useCallback(
    async (tab: FeedTab) => {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: currentProfile } = await supabase
          .from("users")
          .select("id, username, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        setCurrentUser({
          id: user.id,
          username:
            currentProfile?.username ?? user.email?.split("@")[0] ?? "me",
          avatar_url: currentProfile?.avatar_url ?? null,
        });

        const { data: friendships } = await supabase
          .from("friendships")
          .select("requester_id, recipient_id")
          .eq("status", "accepted")
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

        const friendIds = (friendships ?? []).map((f) =>
          f.requester_id === user.id ? f.recipient_id : f.requester_id,
        );

        let query = supabase
          .from("shared_entries")
          .select(
            `id, entry_id, shared_by, created_at, journal_entries (title, content)`,
          )
          .order("created_at", { ascending: false })
          .limit(20);

        if (tab === "following") {
          if (friendIds.length === 0) {
            setPosts([]);
            setLoading(false);
            return;
          }
          query = query.in("shared_by", [...friendIds, user.id]);
        } else if (tab === "public") {
          const { data: publicUsers } = await supabase
            .from("users")
            .select("id")
            .eq("is_public", true);
          const publicIds = (publicUsers ?? []).map((u) => u.id);
          if (publicIds.length === 0) {
            setPosts([]);
            setLoading(false);
            return;
          }
          query = query.in("shared_by", publicIds);
        }

        const { data: sharedEntries, error: sharedError } = await query;
        if (sharedError) throw sharedError;
        if (!sharedEntries?.length) {
          setPosts([]);
          return;
        }

        const rows = sharedEntries as SharedEntryRow[];
        const sharerIds = [...new Set(rows.map((se) => se.shared_by))];

        const { data: userRows, error: usersError } = await supabase
          .from("users")
          .select("id, username, avatar_url, is_public")
          .in("id", sharerIds);

        if (usersError) throw usersError;

        const usersById = Object.fromEntries(
          ((userRows as UserRow[] | null) ?? []).map((u) => [u.id, u]),
        );

        const filtered =
          tab === "foryou"
            ? rows.filter((se) => {
                const isMyFriend = friendIds.includes(se.shared_by);
                const isPublic = usersById[se.shared_by]?.is_public === true;
                const isMe = se.shared_by === user.id;
                return isMyFriend || isPublic || isMe;
              })
            : rows;

        const mapped: Post[] = filtered.map((se) => {
          const entry = entryFrom(se);
          const author = usersById[se.shared_by];
          return {
            id: se.id,
            entry_id: se.entry_id,
            shared_by: se.shared_by,
            created_at: se.created_at,
            username: author?.username ?? "Unknown",
            avatar_url: author?.avatar_url ?? null,
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
    },
    [supabase],
  );

  useEffect(() => {
    void loadFeed(activeTab);
  }, [loadFeed, activeTab]);

  const toggleLike = (id: string) =>
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleBookmark = (id: string) =>
    setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }));

  const closePostModal = () => {
    setShowPostModal(false);
    setPostNote("");
    setPostMsg("");
  };

  const handlePost = () => {
    if (!postNote.trim()) return;
    setPostMsg("Posted! ✓");
    setPostNote("");
    setTimeout(() => closePostModal(), 2000);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const tabs: { key: FeedTab; label: string }[] = [
    { key: "foryou", label: "For you" },
    { key: "following", label: "Following" },
    { key: "public", label: "Public" },
  ];

  return (
    <>
      <div style={{ padding: "0 20px 12px" }}>
        <button
          type="button"
          onClick={() => setShowPostModal(true)}
          style={{
            width: "100%",
            background: "var(--surface)",
            border: "1px solid var(--cream-dark)",
            borderRadius: "16px",
            padding: "12px 14px",
            textAlign: "left",
            fontSize: "14px",
            color: "var(--ink-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Avatar
            username={currentUser?.username ?? "me"}
            avatarUrl={currentUser?.avatar_url}
            size={34}
          />
          <span style={{ flex: 1 }}>What&apos;s on your mind today?</span>
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "6px",
          padding: "0 20px 16px",
          borderBottom: "1px solid var(--cream-dark)",
          marginBottom: "4px",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: "none",
              fontSize: "13px",
              fontWeight: activeTab === t.key ? 600 : 400,
              background:
                activeTab === t.key ? "var(--ink)" : "transparent",
              color:
                activeTab === t.key ? "var(--cream)" : "var(--ink-muted)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 20px 100px" }}>
        {loading && (
          <p
            style={{
              color: "var(--ink-muted)",
              fontSize: "14px",
              paddingTop: "12px",
            }}
          >
            Loading...
          </p>
        )}

        {!loading && posts.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 0",
              color: "var(--ink-muted)",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>✦</div>
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
            <p
              style={{
                fontSize: "14px",
                marginBottom: "20px",
                lineHeight: 1.6,
              }}
            >
              Add friends to see their reflections, or follow public accounts.
            </p>
            <a
              href="/dashboard/friends"
              style={{
                display: "inline-block",
                background: "var(--ink)",
                color: "var(--cream)",
                borderRadius: "14px",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Find friends
            </a>
          </div>
        )}

        {!loading &&
          posts.map((post) => (
            <div
              key={post.id}
              style={{
                background: "var(--surface)",
                borderRadius: "20px",
                padding: "16px",
                marginBottom: "12px",
                border: "1px solid var(--cream-dark)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <Avatar
                  username={post.username}
                  avatarUrl={post.avatar_url}
                  size={38}
                  bgColor="var(--accent)"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--ink)",
                    }}
                  >
                    {post.username}
                    {post.shared_by === currentUser?.id && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: "var(--ink-muted)",
                          fontWeight: 400,
                          marginLeft: "6px",
                        }}
                      >
                        you
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--ink-muted)",
                      marginTop: "1px",
                    }}
                  >
                    {timeAgo(post.created_at)}
                    {post.is_public && (
                      <span
                        style={{
                          marginLeft: "6px",
                          fontSize: "9px",
                          background: "var(--cream-dark)",
                          color: "var(--ink-muted)",
                          padding: "1px 6px",
                          borderRadius: "6px",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Public
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={
                    bookmarked[post.id] ? "Remove bookmark" : "Bookmark post"
                  }
                  onClick={() => toggleBookmark(post.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: bookmarked[post.id]
                      ? "var(--accent)"
                      : "var(--ink-muted)",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Bookmark
                    size={15}
                    fill={bookmarked[post.id] ? "currentColor" : "none"}
                  />
                </button>
              </div>

              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "15px",
                  color: "var(--ink)",
                  marginBottom: "6px",
                  lineHeight: 1.4,
                }}
              >
                {post.title}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--ink-soft)",
                  lineHeight: 1.65,
                  marginBottom: "12px",
                }}
              >
                {post.content.slice(0, 180)}
                {post.content.length > 180 ? "..." : ""}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  paddingTop: "10px",
                  borderTop: "1px solid var(--cream-dark)",
                }}
              >
                <button
                  type="button"
                  aria-label={liked[post.id] ? "Unlike" : "Like"}
                  aria-pressed={liked[post.id]}
                  onClick={() => toggleLike(post.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    color: liked[post.id]
                      ? "var(--accent)"
                      : "var(--ink-muted)",
                    fontSize: "12px",
                    fontWeight: liked[post.id] ? 500 : 400,
                    padding: 0,
                  }}
                >
                  <Heart
                    size={15}
                    fill={liked[post.id] ? "currentColor" : "none"}
                    strokeWidth={1.5}
                  />
                  {post.likes + (liked[post.id] ? 1 : 0)}
                </button>
                <button
                  type="button"
                  aria-label={`Comments (${post.comments})`}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    color: "var(--ink-muted)",
                    fontSize: "12px",
                    padding: 0,
                  }}
                >
                  <MessageCircle size={15} strokeWidth={1.5} />
                  {post.comments}
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
              Share a journal entry
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
                fontFamily: "inherit",
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
                  background: "var(--btn-primary)",
                  color: "var(--btn-primary-text)",
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
