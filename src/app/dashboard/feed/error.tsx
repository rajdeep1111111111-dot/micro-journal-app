"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div style={{ padding: "52px 28px 24px", textAlign: "center" }}>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "20px",
          color: "var(--ink)",
          marginBottom: "12px",
        }}
      >
        Couldn&apos;t load feed
      </div>
      <button
        type="button"
        onClick={reset}
        style={{
          background: "var(--ink)",
          color: "white",
          border: "none",
          borderRadius: "14px",
          padding: "12px 24px",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
