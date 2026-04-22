"use client";

import { useState } from "react";
import type { JournalEntry } from "@/lib/types/database";

type Props = {
  entries: JournalEntry[];
};

export default function CalendarWithModal({ entries }: Props) {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const now = new Date();
  const today = now.getDate();
  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const entriesByDay: Record<number, JournalEntry[]> = {};
  entries.forEach((entry) => {
    const d = new Date(entry.created_at);
    if (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    ) {
      const day = d.getDate();
      if (!entriesByDay[day]) entriesByDay[day] = [];
      entriesByDay[day].push(entry);
    }
  });

  const handleDayClick = (day: number) => {
    if (!entriesByDay[day]) return;
    setSelectedDate(day);
    setShowModal(true);
  };

  const selectedEntries = selectedDate
    ? (entriesByDay[selectedDate] ?? [])
    : [];
  const selectedDateStr = selectedDate
    ? new Date(
        now.getFullYear(),
        now.getMonth(),
        selectedDate,
      ).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  return (
    <>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
          padding: "24px 28px 12px",
        }}
      >
        {monthName}
      </div>
      <div style={{ padding: "0 28px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "4px",
            marginBottom: "4px",
          }}
        >
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                fontSize: "10px",
                color: "var(--ink-muted)",
                fontWeight: 500,
                padding: "4px 0",
              }}
            >
              {d}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "4px",
          }}
        >
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = day === today;
            const hasEntry = !!entriesByDay[day];
            const entryCount = entriesByDay[day]?.length ?? 0;
            return (
              <button
                type="button"
                key={day}
                onClick={() => handleDayClick(day)}
                disabled={!hasEntry}
                style={{
                  aspectRatio: "1",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  position: "relative",
                  background: isToday
                    ? "var(--ink)"
                    : hasEntry
                      ? "var(--accent-light)"
                      : "transparent",
                  color: isToday
                    ? "white"
                    : hasEntry
                      ? "var(--accent)"
                      : "var(--ink-soft)",
                  fontWeight: isToday || hasEntry ? 500 : 400,
                  cursor: hasEntry ? "pointer" : "default",
                  transition: "all 0.15s",
                  border: "none",
                  padding: 0,
                  fontFamily: "inherit",
                }}
              >
                {day}
                {entryCount > 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "1px",
                      right: "1px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "var(--accent)",
                      fontSize: "6px",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {entryCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
          padding: "24px 28px 12px",
        }}
      >
        Recent entries
      </div>
      <div style={{ padding: "0 28px 24px" }}>
        {entries.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>📖</div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "18px",
                color: "var(--ink)",
                marginBottom: "8px",
              }}
            >
              Your journal awaits
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "var(--ink-muted)",
                lineHeight: 1.6,
              }}
            >
              Tap Journal below to write your first entry.
            </div>
          </div>
        )}
        {entries.slice(0, 3).map((entry) => (
          <div
            key={entry.id}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "16px",
              marginBottom: "10px",
              border: "1px solid var(--cream-dark)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "15px",
                color: "var(--ink)",
                marginBottom: "4px",
              }}
            >
              {entry.title}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--ink-muted)",
                lineHeight: 1.5,
              }}
            >
              {entry.content.slice(0, 80)}
              {entry.content.length > 80 ? "..." : ""}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--ink-muted)",
                marginTop: "8px",
              }}
            >
              {new Date(entry.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
              })}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div
          role="presentation"
          onClick={() => setShowModal(false)}
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
              maxHeight: "70vh",
              overflowY: "auto",
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
                marginBottom: "4px",
              }}
            >
              {selectedDateStr}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--ink-muted)",
                marginBottom: "20px",
              }}
            >
              {selectedEntries.length}{" "}
              {selectedEntries.length === 1 ? "entry" : "entries"}
            </div>
            {selectedEntries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "16px",
                  marginBottom: "10px",
                  border: "1px solid var(--cream-dark)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "15px",
                    color: "var(--ink)",
                    marginBottom: "6px",
                  }}
                >
                  {entry.title}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--ink-soft)",
                    lineHeight: 1.6,
                  }}
                >
                  {entry.content}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--ink-muted)",
                    marginTop: "10px",
                  }}
                >
                  {new Date(entry.created_at).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setShowModal(false)}
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
                marginTop: "8px",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
