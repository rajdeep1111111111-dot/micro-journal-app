"use client";

import { useState } from "react";

const mockEntries = ["A slow morning in April", "Untitled", "Testing"];

export default function ShareTab() {
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");

  const handleShare = () => {
    if (selected === null) {
      setMsg("Select an entry first.");
      return;
    }
    setMsg("Shared with your friends! ✓");
    setSelected(null);
    setNote("");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
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
        {mockEntries.map((title, i) => (
          <div
            key={title}
            role="button"
            tabIndex={0}
            onClick={() => setSelected(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setSelected(i);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 0",
              borderBottom:
                i < mockEntries.length - 1 ? "1px solid var(--cream-dark)" : "none",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                border: selected === i ? "none" : "2px solid var(--ink-muted)",
                background: selected === i ? "var(--accent)" : "transparent",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selected === i && (
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
              {title}
            </span>
          </div>
        ))}
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
  );
}
