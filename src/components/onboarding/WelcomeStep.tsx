// src/components/onboarding/WelcomeStep.tsx
"use client";

import { BookOpen, Sparkles } from "lucide-react";

type Props = {
  username: string;
  onChooseImport: () => void;
  onChooseFresh: () => void;
};

export default function WelcomeStep({ username, onChooseImport, onChooseFresh }: Props) {
  return (
    <div style={{ padding: "60px 28px 40px", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ marginBottom: "40px" }}>
        <div style={{ fontSize: "13px", color: "var(--ink-muted)", marginBottom: "8px" }}>
          Welcome, {username || "there"}
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "var(--ink)", lineHeight: 1.25 }}>
          Do you already keep a journal?
        </div>
        <div style={{ fontSize: "14px", color: "var(--ink-muted)", marginTop: "10px", lineHeight: 1.6 }}>
          We can bring your past entries into Reflecto so you don&apos;t lose your streak — or your story.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "auto" }}>
        <button
          type="button"
          onClick={onChooseImport}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            background: "var(--surface)",
            border: "1px solid var(--cream-dark)",
            borderRadius: "16px",
            padding: "18px 16px",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
              background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <BookOpen size={20} color="var(--accent)" strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--ink)", marginBottom: "2px" }}>
              Yes, import my entries
            </div>
            <div style={{ fontSize: "12px", color: "var(--ink-muted)", lineHeight: 1.5 }}>
              Snap photos of your journal pages and we&apos;ll bring them in
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={onChooseFresh}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            background: "var(--surface)",
            border: "1px solid var(--cream-dark)",
            borderRadius: "16px",
            padding: "18px 16px",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
              background: "var(--green-light)", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Sparkles size={20} color="var(--green)" strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--ink)", marginBottom: "2px" }}>
              No, I&apos;ll start fresh
            </div>
            <div style={{ fontSize: "12px", color: "var(--ink-muted)", lineHeight: 1.5 }}>
              Write your first entry and begin your streak today
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
