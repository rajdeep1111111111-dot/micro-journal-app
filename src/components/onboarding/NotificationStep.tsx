// src/components/onboarding/NotificationStep.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell } from "lucide-react";

type Props = {
  onContinue: (time: string) => void;
  onSkip: () => void;
};

const PRESETS = [
  { label: "Morning", time: "08:00", description: "Start the day with intention" },
  { label: "Afternoon", time: "13:00", description: "A midday check-in" },
  { label: "Evening", time: "20:00", description: "Wind down and reflect" },
  { label: "Night", time: "22:00", description: "Before you sleep" },
];

export default function NotificationStep({ onContinue, onSkip }: Props) {
  const [selected, setSelected] = useState<string>("20:00");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const handleContinue = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("users")
        .update({ notification_time: selected })
        .eq("id", user.id);

      onContinue(selected);
    } catch (err) {
      console.error("Failed to save notification time:", err);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}:${String(m).padStart(2, "0")} ${period}`;
  };

  return (
    <div style={{
      padding: "60px 28px 40px",
      display: "flex",
      flexDirection: "column",
      minHeight: "100dvh",
    }}>
      {/* Skip */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "48px" }}>
        <button
          type="button"
          onClick={onSkip}
          style={{
            background: "none",
            border: "none",
            fontSize: "14px",
            color: "var(--ink-muted)",
            cursor: "pointer",
            padding: "4px 0",
          }}
        >
          Skip
        </button>
      </div>

      {/* Title */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: "10px" }}>
          4 of 4
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "var(--ink)", lineHeight: 1.25, marginBottom: "10px" }}>
          When should we remind you?
        </div>
        <div style={{ fontSize: "14px", color: "var(--ink-muted)", lineHeight: 1.6 }}>
          A daily nudge goes a long way. Pick a time that fits your routine.
        </div>
      </div>

      {/* Preset options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
        {PRESETS.map((preset) => {
          const isSelected = selected === preset.time;
          return (
            <button
              key={preset.time}
              type="button"
              onClick={() => setSelected(preset.time)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                background: isSelected ? "var(--ink)" : "white",
                border: `1.5px solid ${isSelected ? "var(--ink)" : "var(--cream-dark)"}`,
                borderRadius: "16px",
                padding: "14px 18px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.18s",
              }}
            >
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                flexShrink: 0,
                background: isSelected ? "rgba(255,255,255,0.12)" : "var(--cream-dark)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Bell
                  size={18}
                  color={isSelected ? "white" : "var(--ink-muted)"}
                  strokeWidth={1.5}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: isSelected ? "white" : "var(--ink)",
                  marginBottom: "2px",
                }}>
                  {preset.label}
                  <span style={{
                    marginLeft: "8px",
                    fontSize: "13px",
                    fontWeight: 400,
                    color: isSelected ? "rgba(255,255,255,0.65)" : "var(--ink-muted)",
                  }}>
                    {formatTime(preset.time)}
                  </span>
                </div>
                <div style={{
                  fontSize: "12px",
                  color: isSelected ? "rgba(255,255,255,0.65)" : "var(--ink-muted)",
                }}>
                  {preset.description}
                </div>
              </div>
              {isSelected && (
                <div style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ink)" }} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom time */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ fontSize: "12px", color: "var(--ink-muted)", marginBottom: "8px" }}>
          Or pick a custom time
        </div>
        <input
          type="time"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "14px",
            border: `1.5px solid var(--cream-dark)`,
            background: "white",
            fontSize: "16px",
            color: "var(--ink)",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Continue */}
      <button
        type="button"
        onClick={() => void handleContinue()}
        disabled={saving}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "14px",
          border: "none",
          background: !saving ? "var(--ink)" : "var(--cream-dark)",
          color: !saving ? "white" : "var(--ink-muted)",
          fontSize: "15px",
          fontWeight: 500,
          cursor: !saving ? "pointer" : "not-allowed",
          transition: "background 0.2s, color 0.2s",
        }}
      >
        {saving ? "Saving…" : "Continue"}
      </button>
    </div>
  );
}
