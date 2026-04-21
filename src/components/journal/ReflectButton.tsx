"use client";

import { useState } from "react";

type Props = {
  entryId: string | null;
  onReflection: (entryId: string, reflection: string) => void;
};

export default function ReflectButton({ entryId, onReflection }: Props) {
  const [reflecting, setReflecting] = useState(false);
  const [message, setMessage] = useState("");
  const [msgIsError, setMsgIsError] = useState(false);

  const handleReflect = async () => {
    if (!entryId) {
      setMessage("Save an entry first.");
      setMsgIsError(true);
      return;
    }
    setReflecting(true);
    setMessage("");
    setMsgIsError(false);
    try {
      const response = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId }),
      });
      if (!response.ok) throw new Error("Reflection failed");
      const { reflection } = (await response.json()) as { reflection: string };
      onReflection(entryId, reflection);
      setMessage("Reflection saved!");
      setMsgIsError(false);
    } catch (err: unknown) {
      setMessage(
        err instanceof Error ? err.message : "Reflection failed.",
      );
      setMsgIsError(true);
    } finally {
      setReflecting(false);
    }
  };

  return (
    <div style={{ padding: "0 28px", marginTop: "10px" }}>
      <button
        type="button"
        onClick={handleReflect}
        disabled={reflecting || !entryId}
        style={{
          width: "100%",
          background:
            reflecting || !entryId ? "var(--cream-dark)" : "var(--accent-light)",
          color:
            reflecting || !entryId ? "var(--ink-muted)" : "var(--accent)",
          border: "none",
          borderRadius: "14px",
          padding: "14px",
          fontSize: "14px",
          fontWeight: 500,
          cursor: reflecting || !entryId ? "not-allowed" : "pointer",
        }}
      >
        {reflecting ? "Reflecting..." : "✦ Get AI Reflection"}
      </button>
      {message && (
        <p
          style={{
            marginTop: "8px",
            fontSize: "13px",
            color: msgIsError ? "#DC2626" : "var(--green)",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
