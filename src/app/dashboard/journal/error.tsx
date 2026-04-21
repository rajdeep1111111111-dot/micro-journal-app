"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: "52px 28px 24px", textAlign: "center" }}>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "22px",
          color: "var(--ink)",
          marginBottom: "12px",
        }}
      >
        Something went wrong
      </div>
      <p
        style={{
          fontSize: "14px",
          color: "var(--ink-muted)",
          marginBottom: "24px",
          lineHeight: 1.6,
        }}
      >
        We couldn&apos;t load this page. Check your connection and try again.
      </p>
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
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
