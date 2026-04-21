"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import ProfileHeader from "@/components/settings/ProfileHeader";
import AccountSection from "@/components/settings/AccountSection";
import AppSettingsSection from "@/components/settings/AppSettingsSection";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) setUsername(data.username);
    };
    void load();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return (
    <div>
      <ProfileHeader username={username} email={email} message={message} />
      <AccountSection
        email={email}
        username={username}
        onUsernameUpdate={(u) => {
          setUsername(u);
          setMessage("Username updated!");
          setTimeout(() => setMessage(""), 3000);
        }}
      />
      <AppSettingsSection />

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
          Privacy
        </div>
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid var(--cream-dark)",
          }}
        >
          {["Friend settings", "Saved posts", "Shared posts"].map(
            (label, i) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderBottom:
                    i < 2 ? "1px solid var(--cream-dark)" : "none",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: "14px", color: "var(--ink)" }}>
                  {label}
                </span>
                <span style={{ fontSize: "14px", color: "var(--ink-muted)" }}>
                  ›
                </span>
              </div>
            ),
          )}
        </div>
      </div>

      <div style={{ padding: "0 28px 40px" }}>
        <button
          type="button"
          onClick={handleSignOut}
          style={{
            width: "100%",
            background: "#FEE2E2",
            color: "#DC2626",
            border: "none",
            borderRadius: "14px",
            padding: "14px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
