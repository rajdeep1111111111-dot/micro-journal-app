"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const handleReset = async () => {
    if (!password.trim()) {
      setMessage("Enter a new password.");
      setIsError(true);
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      setIsError(true);
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage("Password updated! Redirecting...");
      setIsError(false);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#E8E2D9",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "var(--app-width)",
          minHeight: "100vh",
          background: "var(--cream)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <Image
          src="/apple-touch-icon.png"
          alt="Reflecto"
          width={52}
          height={52}
          priority
          style={{ borderRadius: "14px", marginBottom: "24px" }}
        />
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "28px",
            color: "var(--ink)",
            marginBottom: "6px",
          }}
        >
          Set new password
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "var(--ink-muted)",
            marginBottom: "32px",
          }}
        >
          Choose a strong password for your account.
        </div>

        <label htmlFor="reset-password" className="sr-only">
          New password
        </label>
        <input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid var(--cream-dark)",
            background: "white",
            borderRadius: "14px",
            padding: "14px 16px",
            fontSize: "15px",
            color: "var(--ink)",
            marginBottom: "12px",
            outline: "none",
          }}
        />
        <label htmlFor="reset-password-confirm" className="sr-only">
          Confirm new password
        </label>
        <input
          id="reset-password-confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid var(--cream-dark)",
            background: "white",
            borderRadius: "14px",
            padding: "14px 16px",
            fontSize: "15px",
            color: "var(--ink)",
            marginBottom: "12px",
            outline: "none",
          }}
        />

        {message && (
          <p
            style={{
              fontSize: "13px",
              color: isError ? "#DC2626" : "var(--green)",
              marginBottom: "12px",
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? "var(--ink-soft)" : "var(--ink)",
            color: "white",
            border: "none",
            borderRadius: "14px",
            padding: "14px",
            fontSize: "15px",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </div>
    </div>
  );
}
