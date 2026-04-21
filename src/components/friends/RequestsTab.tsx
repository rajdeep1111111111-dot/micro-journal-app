"use client";

import { useState } from "react";

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

export default function RequestsTab() {
  const [requests, setRequests] = useState(mockRequests);
  const [search, setSearch] = useState("");
  const [searchMsg, setSearchMsg] = useState("");

  const handleAccept = (id: string) =>
    setRequests((prev) => prev.filter((r) => r.id !== id));
  const handleDecline = (id: string) =>
    setRequests((prev) => prev.filter((r) => r.id !== id));

  const handleSendRequest = () => {
    if (!search.trim()) return;
    setSearchMsg(`Friend request sent to @${search}!`);
    setSearch("");
    setTimeout(() => setSearchMsg(""), 3000);
  };

  return (
    <div style={{ padding: "0 28px 24px" }}>
      {requests.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "24px 0",
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            onClick={handleSendRequest}
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
        {searchMsg && (
          <p style={{ marginTop: "8px", fontSize: "13px", color: "var(--green)" }}>
            {searchMsg}
          </p>
        )}
      </div>
    </div>
  );
}
