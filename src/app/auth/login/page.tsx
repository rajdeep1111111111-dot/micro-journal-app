"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup" | "magic">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setMessage(error.message);
    else window.location.href = "/dashboard";
    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage("Check your email to confirm your account.");
    setLoading(false);
  };

  const handleMagicLink = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setMessage(error.message);
    else setMessage("Magic link sent — check your email.");
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: "0 24px" }}>
      <h1 style={{ marginBottom: 8 }}>Reflecto</h1>
      <p style={{ marginBottom: 32, color: "#555" }}>Your personal journal</p>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          marginBottom: 12,
          padding: 10,
          borderRadius: 8,
          border: "1px solid #ddd",
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
            marginBottom: 12,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        />
      )}

      {mode === "login" && (
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            background: "#000",
            color: "#fff",
            marginBottom: 8,
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      )}

      {mode === "signup" && (
        <button
          onClick={handleSignup}
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            background: "#000",
            color: "#fff",
            marginBottom: 8,
          }}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      )}

      {mode === "magic" && (
        <button
          onClick={handleMagicLink}
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            background: "#000",
            color: "#fff",
            marginBottom: 8,
          }}
        >
          {loading ? "Sending..." : "Send magic link"}
        </button>
      )}

      {message && <p style={{ marginTop: 12, color: "#555" }}>{message}</p>}

      <div style={{ marginTop: 20, display: "flex", gap: 12, fontSize: 14 }}>
        <button
          onClick={() => setMode("login")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: mode === "login" ? "#000" : "#888",
          }}
        >
          Sign in
        </button>
        <button
          onClick={() => setMode("signup")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: mode === "signup" ? "#000" : "#888",
          }}
        >
          Sign up
        </button>
        <button
          onClick={() => setMode("magic")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: mode === "magic" ? "#000" : "#888",
          }}
        >
          Magic link
        </button>
      </div>
    </div>
  );
}
