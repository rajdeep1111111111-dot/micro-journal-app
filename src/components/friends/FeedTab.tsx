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
  const toggleLike = (id: string) =>
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={{ padding: "0 28px 24px" }}>
      {mockPosts.map((post) => (
        <div
          key={post.id}
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "18px",
            marginBottom: "12px",
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
  );
}
