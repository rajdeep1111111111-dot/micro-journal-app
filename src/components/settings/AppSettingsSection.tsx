"use client";

import { useCallback, useEffect, useState } from "react";

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
    setNotifications(readBool(STORAGE.notifications, true));
    setDarkMode(readBool(STORAGE.darkMode, false));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof document === "undefined") return;
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
  }, [darkMode, hydrated]);

  const setNotificationsPersist = useCallback((value: boolean) => {
    setNotifications(value);
    writeBool(STORAGE.notifications, value);
  }, []);

  const setDarkModePersist = useCallback((value: boolean) => {
    setDarkMode(value);
    writeBool(STORAGE.darkMode, value);
  }, []);

  const rows = [
    {
      label: "Dark mode",
      value: darkMode,
      toggle: () => setDarkModePersist(!darkMode),
    },
    {
      label: "Notifications",
      value: notifications,
      toggle: () => setNotificationsPersist(!notifications),
    },
  ];

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
          background: "white",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid var(--cream-dark)",
        }}
      >
        {rows.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: i === 0 ? "1px solid var(--cream-dark)" : "none",
            }}
          >
            <span style={{ fontSize: "14px", color: "var(--ink)" }}>
              {row.label}
            </span>
            <button
              type="button"
              aria-pressed={row.value}
              onClick={row.toggle}
              style={{
                width: "36px",
                height: "20px",
                background: row.value ? "var(--green)" : "var(--cream-dark)",
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
                  left: row.value ? "18px" : "2px",
                  transition: "all 0.2s",
                }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
