"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const STORAGE = {
  notifications: "reflecto:settings:notifications",
  darkMode: "reflecto:settings:darkMode",
} as const;

function readBool(key: string, defaultValue: boolean): boolean {
  if (typeof window === "undefined") return defaultValue;
  const v = localStorage.getItem(key);
  if (v === null) return defaultValue;
  return v === "1" || v === "true";
}

function writeBool(key: string, value: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value ? "1" : "0");
}

export default function AppSettingsSection() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setNotifications(readBool(STORAGE.notifications, true));
      setDarkMode(readBool(STORAGE.darkMode, false));
      setHydrated(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof document === "undefined") return;
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode, hydrated]);

  useEffect(() => {
    const onFocus = () => {
      const latest = readBool(STORAGE.darkMode, false);
      setDarkMode(latest);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const setNotificationsPersist = useCallback((value: boolean) => {
    setNotifications(value);
    writeBool(STORAGE.notifications, value);
  }, []);

  return (
    <div style={{ padding: "0 28px", marginBottom: "24px" }}>
      <div
        style={{
          fontSize: "10px",
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
          marginBottom: "8px",
        }}
      >
        App settings
      </div>
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid var(--cream-dark)",
        }}
      >
        <Link
          href="/dashboard/settings/appearance"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: "1px solid var(--cream-dark)",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <span style={{ fontSize: "14px", color: "var(--ink)" }}>Appearance</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>
              {hydrated ? (darkMode ? "Dark" : "Light") : ""}
            </span>
            <ChevronRight size={15} color="var(--ink-muted)" strokeWidth={1.5} />
          </div>
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
          }}
        >
          <span style={{ fontSize: "14px", color: "var(--ink)" }}>Notifications</span>
          <button
            type="button"
            aria-label={`Notifications: ${notifications ? "on" : "off"}`}
            aria-pressed={notifications}
            onClick={() => setNotificationsPersist(!notifications)}
            style={{
              width: "36px",
              height: "20px",
              background: notifications ? "var(--green)" : "var(--cream-dark)",
              borderRadius: "10px",
              position: "relative",
              cursor: "pointer",
              transition: "all 0.2s",
              border: "none",
              padding: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                width: "16px",
                height: "16px",
                background: "white",
                borderRadius: "50%",
                top: "2px",
                left: notifications ? "18px" : "2px",
                transition: "all 0.2s",
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
