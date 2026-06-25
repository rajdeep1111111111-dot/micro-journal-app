// src/components/onboarding/UsernameStep.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  initialUsername: string;
  onContinue: (username: string) => void;
  onSkip: () => void;
};

export default function UsernameStep({ initialUsername, onContinue, onSkip }: Props) {
  const [value, setValue] = useState(initialUsername);
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken" | "error">("idle");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const trimmed = value.trim().toLowerCase();

    if (!trimmed || trimmed === initialUsername.toLowerCase()) {
      setStatus("idle");
      return;
    }

    if (trimmed.length < 3) {
      setStatus("idle");
      return;
    }

    setStatus("checking");
    const timeout = setTimeout(async () => {
      try {
        const { data, error } = await supabase.rpc("find_user_profile_by_username", {
          search_username: trimmed,
        });

        if (error) {
          setStatus("error");
          return;
        }

        setStatus(data && data.length > 0 ? "taken" : "available");
      } catch {
        setStatus("error");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [value, initialUsername, supabase]);

  const handleContinue = async () => {
    const trimmed = value.trim();
    if (!trimmed || status === "taken" || status === "checking") return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("users")
        .update({ username: trimmed })
        .eq("id", user.id);

      onContinue(trimmed);
    } catch (err) {
      console.error("Failed to save username:", err);
    } finally {
      setSaving(false);
    }
  };

  const canContinue =
    value.trim().length >= 3 &&
    status !== "taken" &&
    status !== "checking";

  const borderColor =
    status === "taken" ? "#DC2626" :
    status === "available" ? "var(--green)" :
    "var(--cream-dark)";

  const statusColor =
    status === "available" ? "var(--green)" :
    status === "taken" ? "#DC2626" :
    "var(--ink-muted)";

  const statusText =
    status === "checking" ? "Checking availability…" :
    status === "available" ? "✓ Available" :
    status === "taken" ? "That username is already taken" :
    status === "error" ? "Could not check — try again" :
    "";

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
          1 of 4
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "var(--ink)", lineHeight: 1.25, marginBottom: "10px" }}>
          Choose your username
        </div>
        <div style={{ fontSize: "14px", color: "var(--ink-muted)", lineHeight: 1.6 }}>
          This is how friends find you on Reflecto. You can change it later.
        </div>
      </div>

      {/* Input */}
      <div style={{ marginBottom: "8px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          background: "white",
          border: `1.5px solid ${borderColor}`,
          borderRadius: "14px",
          padding: "0 16px",
          transition: "border-color 0.2s",
        }}>
          <span style={{ fontSize: "16px", color: "var(--ink-muted)", marginRight: "2px", userSelect: "none" }}>@</span>
          <input
            type="text"
            value={value}
            onChange={(e) =>
              setValue(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))
            }
            placeholder="yourname"
            maxLength={30}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="username"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "16px",
              color: "var(--ink)",
              background: "transparent",
              padding: "16px 0",
            }}
          />
        </div>
      </div>

      {/* Status message */}
      <div style={{
        fontSize: "12px",
        color: statusColor,
        minHeight: "18px",
        marginBottom: "40px",
        transition: "color 0.2s",
      }}>
        {statusText}
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
