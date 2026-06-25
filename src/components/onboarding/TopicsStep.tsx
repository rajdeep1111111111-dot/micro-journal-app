// src/components/onboarding/TopicsStep.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  onContinue: (topics: string[]) => void;
  onSkip: () => void;
};

const TOPICS = [
  { id: "gratitude", label: "Gratitude", emoji: "🙏" },
  { id: "mental-health", label: "Mental health", emoji: "🧠" },
  { id: "fitness", label: "Fitness", emoji: "💪" },
  { id: "travel", label: "Travel", emoji: "✈️" },
  { id: "creativity", label: "Creativity", emoji: "🎨" },
  { id: "relationships", label: "Relationships", emoji: "❤️" },
  { id: "work", label: "Work", emoji: "💼" },
  { id: "food", label: "Food", emoji: "🍜" },
  { id: "spirituality", label: "Spirituality", emoji: "✨" },
  { id: "learning", label: "Learning", emoji: "📚" },
  { id: "nature", label: "Nature", emoji: "🌿" },
  { id: "family", label: "Family", emoji: "🏡" },
];

export default function TopicsStep({ onContinue, onSkip }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("users")
        .update({ topic_interests: selected })
        .eq("id", user.id);

      onContinue(selected);
    } catch (err) {
      console.error("Failed to save topics:", err);
    } finally {
      setSaving(false);
    }
  };

  const canContinue = selected.length > 0;

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
      <div style={{ marginBottom: "36px" }}>
        <div style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: "10px" }}>
          3 of 4
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "var(--ink)", lineHeight: 1.25, marginBottom: "10px" }}>
          What do you write about?
        </div>
        <div style={{ fontSize: "14px", color: "var(--ink-muted)", lineHeight: 1.6 }}>
          Pick a few topics — we&apos;ll tailor your prompts around them.
        </div>
      </div>

      {/* Topic chips */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        marginBottom: "40px",
      }}>
        {TOPICS.map((topic) => {
          const isSelected = selected.includes(topic.id);
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => toggle(topic.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                borderRadius: "100px",
                border: `1.5px solid ${isSelected ? "var(--ink)" : "var(--cream-dark)"}`,
                background: isSelected ? "var(--ink)" : "white",
                color: isSelected ? "white" : "var(--ink)",
                fontSize: "14px",
                fontWeight: isSelected ? 500 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "16px", lineHeight: 1 }}>{topic.emoji}</span>
              {topic.label}
            </button>
          );
        })}
      </div>

      {/* Selection count */}
      <div style={{
        fontSize: "12px",
        color: "var(--ink-muted)",
        marginBottom: "16px",
        minHeight: "18px",
      }}>
        {selected.length > 0 ? `${selected.length} selected` : "Select at least one to continue"}
      </div>

      {/* Continue */}
      <button
        type="button"
        onClick={() => void handleContinue()}
        disabled={!canContinue || saving}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "14px",
          border: "none",
          background: canContinue && !saving ? "var(--ink)" : "var(--cream-dark)",
          color: canContinue && !saving ? "white" : "var(--ink-muted)",
          fontSize: "15px",
          fontWeight: 500,
          cursor: canContinue && !saving ? "pointer" : "not-allowed",
          transition: "background 0.2s, color 0.2s",
        }}
      >
        {saving ? "Saving…" : "Continue"}
      </button>
    </div>
  );
}
