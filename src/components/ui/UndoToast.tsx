// src/components/ui/UndoToast.tsx
"use client";

import { useEffect, useState } from "react";

type Props = {
  message: string;
  onUndo: () => void | Promise<void>;
  onExpire?: () => void;
  durationMs?: number; // default 10000
};

export default function UndoToast({ message, onUndo, onExpire, durationMs = 10000 }: Props) {
  const [visible, setVisible] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(durationMs / 1000));
  const [undoing, setUndoing] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    const timeout = setTimeout(() => {
      setVisible(false);
      onExpire?.();
    }, durationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [visible, durationMs, onExpire]);

  if (!visible) return null;

  const handleUndo = async () => {
    setUndoing(true);
    try {
      await onUndo();
    } finally {
      setVisible(false);
    }
  };

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        bottom: "calc(88px + env(safe-area-inset-bottom, 0px))",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 40px)",
        maxWidth: "calc(var(--app-width) - 40px)",
        background: "var(--ink)",
        color: "var(--cream)",
        borderRadius: "16px",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        zIndex: 250,
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        animation: "undo-toast-slide-up 0.25s ease",
      }}
    >
      <style>{`
        @keyframes undo-toast-slide-up {
          from { transform: translate(-50%, 16px); opacity: 0; }
          to   { transform: translate(-50%, 0);    opacity: 1; }
        }
      `}</style>
      <span style={{ fontSize: "13px", lineHeight: 1.4, flex: 1 }}>{message}</span>
      <button
        type="button"
        onClick={() => void handleUndo()}
        disabled={undoing}
        style={{
          background: "var(--cream)",
          color: "var(--ink)",
          border: "none",
          borderRadius: "10px",
          padding: "8px 14px",
          fontSize: "12px",
          fontWeight: 600,
          cursor: undoing ? "not-allowed" : "pointer",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {undoing ? "Undoing..." : `Undo (${secondsLeft}s)`}
      </button>
    </div>
  );
}
