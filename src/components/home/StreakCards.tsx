"use client";

import { useEffect, useState } from "react";
import type { JournalEntry } from "@/lib/types/database";

type Props = {
  currentStreak: number;
  longestStreak: number;
  entries: JournalEntry[];
};

const MILESTONES = [3, 7, 14, 21, 30, 60, 100];

export default function StreakCards({
  currentStreak,
  longestStreak,
  entries,
}: Props) {
  const [toast, setToast] = useState<string | null>(null);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekEntries = entries.filter(
    (e) => new Date(e.created_at) >= weekAgo,
  ).length;

  useEffect(() => {
    const hit = MILESTONES.find((m) => currentStreak === m);
    if (hit) {
      setToast(`🔥 ${hit}-day streak! You're on fire!`);
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
    setToast(null);
  }, [currentStreak]);

  return (
    <>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--accent)",
            color: "white",
            borderRadius: "16px",
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: 500,
            zIndex: 999,
            whiteSpace: "nowrap",
            maxWidth: "360px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          {toast}
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", padding: "24px 28px 0" }}>
        <div
          style={{
            flex: 1,
            background: "var(--accent)",
            borderRadius: "20px",
            padding: "18px",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-16px",
              top: "-16px",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
            }}
          />
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "42px",
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            {currentStreak}
          </div>
          <div
            style={{
              fontSize: "11px",
              opacity: 0.8,
              marginTop: "4px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Day streak
          </div>
          <div style={{ fontSize: "10px", opacity: 0.6, marginTop: "4px" }}>
            Best: {longestStreak} days
          </div>
        </div>
        <div
          style={{
            flex: 1,
            background: "var(--green)",
            borderRadius: "20px",
            padding: "18px",
            color: "white",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "42px",
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            {weekEntries}
          </div>
          <div
            style={{
              fontSize: "11px",
              opacity: 0.8,
              marginTop: "4px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            This week
          </div>
          <div style={{ fontSize: "10px", opacity: 0.6, marginTop: "4px" }}>
            entries written
          </div>
        </div>
      </div>
    </>
  );
}
