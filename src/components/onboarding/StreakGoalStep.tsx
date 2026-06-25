// src/components/onboarding/StreakGoalStep.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Flame } from "lucide-react";

type Props = {
  onContinue: (goal: number) => void;
  onSkip: () => void;
};

const GOALS = [
  { value: 3, label: "3 days", description: "Just getting started" },
  { value: 7, label: "7 days", description: "A solid weekly habit" },
  { value: 14, label: "14 days", description: "Building momentum" },
  { value: 30, label: "30 days", description: "All in" },
];

export default function StreakGoalStep({ onContinue, onSkip }: Props) {
  const [selected, setSelected] = useState<number | null>(7);
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
        .update({ streak_goal: selected })
        .eq("id", user.id);

      onContinue(selected);
    } catch (err) {
      console.error("Failed to save streak goal:", err);
    } finally {
      setSaving(false);
    }
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
          2 of 4
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "var(--ink)", lineHeight: 1.25, marginBottom: "10px" }}>
          Set a streak goal
        </div>
        <div style={{ fontSize: "14px", color: "var(--ink-muted)", lineHeight: 1.6 }}>
          How many days in a row do you want to journal? We&apos;ll cheer you on.
        </div>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "40px" }}>
        {GOALS.map((goal) => {
          const isSelected = selected === goal.value;
          return (
            <button
              key={goal.value}
              type="button"
              onClick={() => setSelected(goal.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                background: isSelected ? "var(--ink)" : "white",
                border: `1.5px solid ${isSelected ? "var(--ink)" : "var(--cream-dark)"}`,
                borderRadius: "16px",
                padding: "16px 18px",
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
                background: isSelected ? "rgba(255,255,255,0.12)" : "var(--accent-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Flame
                  size={18}
                  color={isSelected ? "white" : "var(--accent)"}
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
                  {goal.label}
                </div>
                <div style={{
                  fontSize: "12px",
                  color: isSelected ? "rgba(255,255,255,0.65)" : "var(--ink-muted)",
                }}>
                  {goal.description}
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

      {/* Continue */}
      <button
        type="button"
        onClick={() => void handleContinue()}
        disabled={!selected || saving}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "14px",
          border: "none",
          background: selected && !saving ? "var(--ink)" : "var(--cream-dark)",
          color: selected && !saving ? "white" : "var(--ink-muted)",
          fontSize: "15px",
          fontWeight: 500,
          cursor: selected && !saving ? "pointer" : "not-allowed",
          transition: "background 0.2s, color 0.2s",
        }}
      >
        {saving ? "Saving…" : "Continue"}
      </button>
    </div>
  );
}
