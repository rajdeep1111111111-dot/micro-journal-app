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

const mockRequests = [
  {
    id: "1",
    initials: "TN",
    color: "#2D6AC4",
    name: "Tom N.",
    sub: "Wants to be your friend",
  },
  {
    id: "2",
    initials: "PR",
    color: "#7C4A6E",
    name: "Priya R.",
    sub: "Wants to be your friend",
  },
];

type Tab = "feed" | "requests" | "share";

export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>("feed");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [requests, setRequests] = useState(mockRequests);
  const [shareText, setShareText] = useState("");
  const [shareMsg, setShareMsg] = useState("");

  const toggleLike = (id: string) =>
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleAccept = (id: string) =>
    setRequests((prev) => prev.filter((r) => r.id !== id));
  const handleDecline = (id: string) =>
    setRequests((prev) => prev.filter((r) => r.id !== id));

  const handleShare = () => {
    if (!shareText.trim()) {
      setShareMsg("Write something to share first.");
      return;
    }
    setShareMsg("Shared with your friends! ✓");
    setShareText("");
    setTimeout(() => setShareMsg(""), 3000);
  };

  return (
    <div>
      <div style={{ padding: "52px 28px 20px" }}>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "26px",
            color: "var(--ink)",
            marginBottom: "16px",
          }}
        >
          Friends
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {(["feed", "requests", "share"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                border: "1px solid var(--cream-dark)",
                background: tab === t ? "var(--ink)" : "white",
                color: tab === t ? "white" : "var(--ink-soft)",
                transition: "all 0.15s",
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === "requests" && requests.length > 0 && (
                <span
                  style={{
                    marginLeft: "6px",
                    background: "var(--accent)",
                    color: "white",
                    borderRadius: "10px",
                    padding: "1px 6px",
                    fontSize: "10px",
                  }}
                >
                  {requests.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === "feed" && (
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
                  <div
                    style={{ fontSize: "11px", color: "var(--ink-muted)" }}
                  >
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
      )}

      {tab === "requests" && (
        <div style={{ padding: "0 28px 24px" }}>
          {requests.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "var(--ink-muted)",
                fontSize: "14px",
              }}
            >
              No pending requests
            </div>
          )}
          {requests.map((req) => (
            <div
              key={req.id}
              style={{
                background: "var(--accent-light)",
                borderRadius: "16px",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: req.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "white",
                  flexShrink: 0,
                }}
              >
                {req.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--ink)",
                  }}
                >
                  {req.name}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--ink-muted)",
                    marginTop: "2px",
                  }}
                >
                  {req.sub}
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => handleAccept(req.id)}
                  style={{
                    background: "var(--ink)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "6px 12px",
                    fontSize: "11px",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => handleDecline(req.id)}
                  style={{
                    background: "transparent",
                    color: "var(--ink-muted)",
                    border: "1px solid var(--cream-dark)",
                    borderRadius: "10px",
                    padding: "6px 12px",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: "24px" }}>
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
              Add a friend
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                placeholder="Search by username"
                style={{
                  flex: 1,
                  border: "1px solid var(--cream-dark)",
                  background: "white",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  fontSize: "14px",
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
              <button
                type="button"
                style={{
                  background: "var(--ink)",
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "share" && (
        <div style={{ padding: "0 28px 24px" }}>
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
            Share a journal entry
          </div>
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "18px",
              border: "1px solid var(--cream-dark)",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "var(--ink-muted)",
                marginBottom: "12px",
              }}
            >
              Select an entry to share with friends
            </div>
            {["A slow morning in April", "Untitled", "Testing"].map(
              (title, i) => (
                <div
                  key={title}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 0",
                    borderBottom:
                      i < 2 ? "1px solid var(--cream-dark)" : "none",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      border: "2px solid var(--ink-muted)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      color: "var(--ink)",
                      fontFamily: "var(--font-serif)",
                    }}
                  >
                    {title}
                  </span>
                </div>
              ),
            )}
          </div>

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
            Add a note (optional)
          </div>
          <textarea
            placeholder="Say something to your friends..."
            value={shareText}
            onChange={(e) => setShareText(e.target.value)}
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
          {shareMsg && (
            <p
              style={{
                fontSize: "13px",
                color: shareMsg.includes("✓") ? "var(--green)" : "#DC2626",
                marginBottom: "10px",
              }}
            >
              {shareMsg}
            </p>
          )}
          <button
            type="button"
            onClick={handleShare}
            style={{
              width: "100%",
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
            Share with friends
          </button>
        </div>
      )}
    </div>
  );
}
