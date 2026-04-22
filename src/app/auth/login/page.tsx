"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup" | "magic">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (searchParams.get("mode") === "signup") setMode("signup");
  }, [searchParams]);

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");
    setIsError(false);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage(error.message);
      setIsError(true);
    } else window.location.href = "/dashboard";
    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    setMessage("");
    setIsError(false);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
      setIsError(true);
    } else {
      setMessage("Account created! Check your email to confirm.");
      setIsError(false);
    }
    setLoading(false);
  };

  const handleMagicLink = async () => {
    setLoading(true);
    setMessage("");
    setIsError(false);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setMessage(error.message);
      setIsError(true);
    } else {
      setMessage("Magic link sent — check your email.");
      setIsError(false);
    }
    setLoading(false);
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
          maxWidth: "430px",
          minHeight: "100vh",
          background: "var(--cream)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "40px 40px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/apple-touch-icon.png"
          alt="Reflecto"
          style={{
            width: 52,
            height: 52,
            borderRadius: "14px",
            marginBottom: "24px",
          }}
        />
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "28px",
            color: "var(--ink)",
            marginBottom: "6px",
          }}
        >
          {mode === "signup"
            ? "Create your account"
            : mode === "magic"
              ? "Magic link"
              : "Welcome back"}
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "var(--ink-muted)",
            marginBottom: "32px",
          }}
        >
          {mode === "signup"
            ? "Start your journaling journey today."
            : mode === "magic"
              ? "We'll send you a sign-in link."
              : "Good to see you again."}
        </div>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

        {mode !== "magic" && (
          <input
            type="password"
            placeholder="Password"
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
        )}

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
          onClick={
            mode === "login"
              ? handleLogin
              : mode === "signup"
                ? handleSignup
                : handleMagicLink
          }
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
            marginBottom: "24px",
          }}
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Sign in"
              : mode === "signup"
                ? "Create account"
                : "Send magic link"}
        </button>

        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          {(["login", "signup", "magic"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              style={{
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                color: mode === m ? "var(--ink)" : "var(--ink-muted)",
                fontWeight: mode === m ? 500 : 400,
                padding: "4px 8px",
                borderRadius: "8px",
                background: mode === m ? "var(--cream-dark)" : "transparent",
              }}
            >
              {m === "login" ? "Sign in" : m === "signup" ? "Sign up" : "Magic link"}
            </button>
          ))}
        </div>

        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <a
            href="/"
            style={{
              fontSize: "13px",
              color: "var(--ink-muted)",
              textDecoration: "none",
            }}
          >
            ← Back
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
