"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";

const DARK_MODE_KEY = "reflecto:settings:darkMode";

function readDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  const v = localStorage.getItem(DARK_MODE_KEY);
  return v === "1" || v === "true";
}

function writeDarkMode(value: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DARK_MODE_KEY, value ? "1" : "0");
}

function applyDarkMode(dark: boolean) {
  if (typeof document === "undefined") return;
  if (dark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

function subscribeToTheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getThemeSnapshot(): "light" | "dark" {
  return readDarkMode() ? "dark" : "light";
}

function getServerThemeSnapshot(): "light" | "dark" {
  return "light";
}

function MiniCard({ dark }: { dark: boolean }) {
  const bg = dark ? "#1e1c1a" : "#ffffff";
  const pageBg = dark ? "#111110" : "#f5f0e8";
  const ink = dark ? "#f5f0e8" : "#1c1917";
  const inkMuted = dark ? "#a8a29e" : "#78716c";
  const inkSoft = dark ? "#d6d3d1" : "#44403c";
  const border = dark ? "#292524" : "#ede7d9";
  const avatarBg = dark ? "#2c2825" : "#1c1917";
  const navBg = dark ? "#0f0e0d" : "#1c1917";
  const accent = dark ? "#e07848" : "#c4622d";

  return (
    <div style={{ background: pageBg, borderRadius: "14px", padding: "10px", flex: 1 }}>
      <div
        style={{
          fontSize: "9px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          color: inkMuted,
          textAlign: "center" as const,
          marginBottom: "8px",
        }}
      >
        {dark ? "Dark" : "Light"}
      </div>

      <div
        style={{
          background: bg,
          borderRadius: "10px",
          padding: "10px",
          border: `1px solid ${border}`,
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
          <div>
            <div style={{ fontSize: "8px", fontWeight: 600, color: ink }}>
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
            borderTop: `1px solid ${border}`,
          }}
        >
          <span style={{ fontSize: "7px", color: inkMuted }}>♡ 0</span>
          <span style={{ fontSize: "7px", color: inkMuted }}>◻ 0</span>
        </div>
      </div>

      <div
        style={{
          marginTop: "6px",
          background: navBg,
          borderRadius: "8px",
          padding: "5px 8px",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        {[true, false, false, false, false].map((active, i) => (
          <span
            key={i}
            style={{
              fontSize: "8px",
              color: active ? accent : "rgba(255,255,255,0.3)",
            }}
          >
            {["◎", "☀", "▣", "⚇", "⚙"][i]}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AppearancePage() {
  const router = useRouter();
  const storedMode = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const [selected, setSelected] = useState<"light" | "dark" | null>(null);

  const handleSelect = useCallback((mode: "light" | "dark") => {
    setSelected(mode);
    const isDark = mode === "dark";
    writeDarkMode(isDark);
    applyDarkMode(isDark);
  }, []);

  const activeMode = selected ?? storedMode;
  const isDark = activeMode === "dark";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        paddingBottom: "40px",
      }}
    >
      <div
        style={{
          padding: "52px 20px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back to settings"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--cream-dark)",
            borderRadius: "50%",
            width: "38px",
            height: "38px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={16} color="var(--ink)" />
        </button>
        <div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "22px",
              color: "var(--ink)",
              lineHeight: 1.2,
            }}
          >
            Appearance
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "var(--ink-muted)",
              marginTop: "2px",
            }}
          >
            Choose how Reflecto looks
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px 24px", display: "flex", gap: "12px" }}>
        {(["light", "dark"] as const).map((mode) => {
          const isSelected = activeMode === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => handleSelect(mode)}
              aria-pressed={isSelected}
              aria-label={`Select ${mode} mode`}
              style={{
                flex: 1,
                background: "none",
                border: `2px solid ${isSelected ? "var(--accent)" : "var(--cream-dark)"}`,
                borderRadius: "18px",
                padding: "4px",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
            >
              <MiniCard dark={mode === "dark"} />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  marginTop: "10px",
                  marginBottom: "6px",
                  height: "20px",
                }}
              >
                {isSelected ? (
                  <>
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "var(--accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Check size={10} color="white" strokeWidth={3} />
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--accent)",
                      }}
                    >
                      Selected
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: "11px", color: "var(--ink-muted)" }}>
                    {mode === "light" ? "Light" : "Dark"}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div
        style={{
          margin: "0 20px",
          background: "var(--surface)",
          border: "1px solid var(--cream-dark)",
          borderRadius: "16px",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "var(--green)",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: "14px", color: "var(--ink)" }}>
          {isDark ? "Dark" : "Light"} mode is active
        </span>
      </div>
    </div>
  );
}
