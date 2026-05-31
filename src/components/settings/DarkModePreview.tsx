"use client";

import { useEffect, useRef } from "react";

type Props = {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
};

function MiniCard({ dark }: { dark: boolean }) {
  const bg = dark ? "#1e1c1a" : "#ffffff";
  const ink = dark ? "#f5f0e8" : "#1c1917";
  const inkMuted = dark ? "#a8a29e" : "#78716c";
  const inkSoft = dark ? "#d6d3d1" : "#44403c";
  const creamDark = dark ? "#292524" : "#ede7d9";
  const accent = dark ? "#e07848" : "#c4622d";
  const avatarBg = dark ? "#2c2825" : "#1c1917";

  return (
    <div
      style={{
        background: dark ? "#111110" : "#f5f0e8",
        borderRadius: "16px",
        padding: "10px",
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: "9px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: inkMuted,
          marginBottom: "8px",
          textAlign: "center",
        }}
      >
        {dark ? "Dark" : "Light"}
      </div>

      <div
        style={{
          background: bg,
          borderRadius: "10px",
          padding: "10px",
          border: `1px solid ${creamDark}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: avatarBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "8px",
              color: "#f5f0e8",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            K
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "8px",
                fontWeight: 600,
                color: ink,
                marginBottom: "2px",
              }}
            >
              kavya.nair
            </div>
            <div style={{ fontSize: "7px", color: inkMuted }}>1d ago</div>
          </div>
        </div>

        <div
          style={{
            fontSize: "9px",
            fontWeight: 600,
            color: ink,
            marginBottom: "5px",
            lineHeight: 1.3,
            fontFamily: "Georgia, serif",
          }}
        >
          Homesick in a city I chose
        </div>

        <div
          style={{
            fontSize: "7.5px",
            color: inkSoft,
            lineHeight: 1.5,
            marginBottom: "8px",
          }}
        >
          Called my mum for the third time this week. Sometimes love is just
          staying on the line.
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            paddingTop: "6px",
            borderTop: `1px solid ${creamDark}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke={inkMuted}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span style={{ fontSize: "7px", color: inkMuted }}>0</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke={inkMuted}
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span style={{ fontSize: "7px", color: inkMuted }}>0</span>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "8px",
          background: dark ? "#0f0e0d" : "#1c1917",
          borderRadius: "8px",
          padding: "6px 8px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {["◎", "☀", "▣", "⚇", "⚙"].map((icon, i) => (
          <span
            key={i}
            style={{
              fontSize: "8px",
              color: i === 0 ? accent : "rgba(255,255,255,0.4)",
            }}
          >
            {icon}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DarkModePreview({ visible, isDark, onClose }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [visible, onClose]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [visible, onClose]);

  return (
    <>
      <style>{`
        @keyframes dm-slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes dm-slide-down {
          from { transform: translateY(0);    opacity: 1; }
          to   { transform: translateY(100%); opacity: 0; }
        }
        .dm-preview-sheet {
          animation: dm-slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {visible && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            ref={sheetRef}
            className="dm-preview-sheet"
            style={{
              width: "100%",
              maxWidth: "430px",
              background: "var(--surface)",
              borderRadius: "24px 24px 0 0",
              padding: "20px 20px 32px",
              border: "1px solid var(--cream-dark)",
              borderBottom: "none",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
              pointerEvents: "all",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "4px",
                background: "var(--cream-dark)",
                borderRadius: "2px",
                margin: "0 auto 16px",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-serif, Georgia, serif)",
                    fontSize: "16px",
                    color: "var(--ink)",
                    fontWeight: 600,
                  }}
                >
                  {isDark ? "Dark mode on" : "Light mode on"}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--ink-muted)",
                    marginTop: "2px",
                  }}
                >
                  Here&apos;s how Reflecto looks
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close preview"
                style={{
                  background: "var(--cream-dark)",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "var(--ink-muted)",
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <MiniCard dark={false} />
              <MiniCard dark={true} />
            </div>

            <div
              style={{
                marginTop: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontSize: "12px",
                color: "var(--ink-muted)",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--green)",
                }}
              />
              {isDark ? "Dark" : "Light"} mode is active
            </div>
          </div>
        </div>
      )}
    </>
  );
}
