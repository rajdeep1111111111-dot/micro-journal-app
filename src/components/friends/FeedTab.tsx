"use client";

import { useState } from "react";

const mockPosts = [
  {
    id: "1",
    initials: "JL",
    color: "#4A7C59",
    name: "Jamie L.",
    time: "2 hours ago",
    title: "Finding peace in routines",
    preview:
      "Something about doing the same small things every morning makes the big things feel less overwhelming. I made coffee, sat by the window, and just breathed.",
    likes: 3,
    comments: 1,
  },
  {
    id: "2",
    initials: "AM",
    color: "#7C4A6E",
    name: "Alex M.",
    time: "Yesterday",
    title: "On feeling stuck",
    preview:
      "I keep starting things I don't finish. Not sure if that's a discipline problem or a clarity problem. Maybe both. Either way, today felt heavy.",
    likes: 7,
    comments: 4,
  },
  {
    id: "3",
    initials: "SK",
    color: "#C4622D",
    name: "Sarah K.",
    time: "2 days ago",
    title: "Small wins",
    preview:
      "Finished a book I'd been putting off for months. It wasn't even that long. I think I just needed to give myself permission to sit still for an hour.",
    likes: 12,
    comments: 2,
  },
];

export default function FeedTab() {
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [showPostModal, setShowPostModal] = useState(false);
  const [postNote, setPostNote] = useState("");
  const [postMsg, setPostMsg] = useState("");

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

  return (
    <>
      <div style={{ padding: "0 28px 16px" }}>
        <button
          type="button"
          onClick={() => setShowPostModal(true)}
          style={{
            width: "100%",
            background: "white",
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
              background: "var(--ink)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "12px",
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            R
          </div>
          Share a journal entry...
        </button>
      </div>

      <div style={{ paddingBottom: "24px" }}>
      {mockPosts.map((post) => (
        <div
          key={post.id}
          style={{
            margin: "0 28px 12px",
            background: "white",
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
                background: post.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 500,
                color: "white",
                flexShrink: 0,
              }}
            >
              {post.initials}
            </div>
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--ink)",
                }}
              >
                {post.name}
              </div>
              <div style={{ fontSize: "11px", color: "var(--ink-muted)" }}>
                {post.time}
              </div>
            </div>
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
            {post.preview}
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
                transition: "all 0.15s",
              }}
            >
              {liked[post.id] ? "♥" : "♡"}{" "}
              {post.likes + (liked[post.id] ? 1 : 0)}
            </button>
            <button
              type="button"
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
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                color: "var(--ink-muted)",
                marginLeft: "auto",
              }}
            >
              ✦ React
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
              background: "var(--cream)",
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
            <textarea
              placeholder="What's on your mind? Select a journal entry to share..."
              value={postNote}
              onChange={(e) => setPostNote(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                border: "1px solid var(--cream-dark)",
                background: "white",
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
