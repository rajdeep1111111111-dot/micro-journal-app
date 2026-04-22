"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import ProfileHeader from "@/components/settings/ProfileHeader";
import AccountSection from "@/components/settings/AccountSection";
import AppSettingsSection from "@/components/settings/AppSettingsSection";

const privacyContent: Record<string, { title: string; content: string }> = {
  "Friend settings": {
    title: "Friend settings",
    content:
      "Only people you accept as friends can see your shared entries. You can remove friends at any time and their access to your shared content will be revoked immediately.",
  },
  "Saved posts": {
    title: "Saved posts",
    content:
      "You have no saved posts yet. When you save a friend's post, it will appear here for easy access.",
  },
  "Shared posts": {
    title: "Shared posts",
    content:
      "These are the journal entries you've chosen to share with friends. You can unshare any entry at any time from the Journal page.",
  },
};

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<string | null>(
    null,
  );

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
      <ProfileHeader
        username={username}
        email={email}
        message={message}
        isError={isError}
      />
      <AccountSection
        email={email}
        username={username}
        onUsernameUpdate={(u, err) => {
          if (err || u === null) {
            setIsError(true);
            setMessage(err ?? "Failed to update username.");
          } else {
            setUsername(u);
            setMessage("Username updated!");
            setIsError(false);
          }
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
              <button
                type="button"
                key={label}
                onClick={() => setShowPrivacyModal(label)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "14px 16px",
                  borderBottom:
                    i < 2 ? "1px solid var(--cream-dark)" : "none",
                  cursor: "pointer",
                  background: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  borderTop: "none",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: "14px", color: "var(--ink)" }}>
                  {label}
                </span>
                <span style={{ fontSize: "14px", color: "var(--ink-muted)" }}>
                  ›
                </span>
              </button>
            ),
          )}
        </div>
      </div>

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
          About
        </div>
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid var(--cream-dark)",
          }}
        >
          {[
            { label: "Version", value: "v1.0.0" },
            { label: "Built with", value: "Next.js + Supabase" },
          ].map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                borderBottom:
                  i === 0 ? "1px solid var(--cream-dark)" : "none",
              }}
            >
              <span style={{ fontSize: "14px", color: "var(--ink)" }}>
                {row.label}
              </span>
              <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>
                {row.value}
              </span>
            </div>
          ))}
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

      {showPrivacyModal && privacyContent[showPrivacyModal] && (
        <div
          role="presentation"
          onClick={() => setShowPrivacyModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "430px",
              background: "var(--cream)",
              borderRadius: "28px 28px 0 0",
              padding: "28px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "4px",
                background: "var(--cream-dark)",
                borderRadius: "2px",
                margin: "0 auto 20px",
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "20px",
                color: "var(--ink)",
                marginBottom: "12px",
              }}
            >
              {privacyContent[showPrivacyModal].title}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "var(--ink-soft)",
                lineHeight: 1.7,
                marginBottom: "24px",
              }}
            >
              {privacyContent[showPrivacyModal].content}
            </div>
            <button
              type="button"
              onClick={() => setShowPrivacyModal(null)}
              style={{
                width: "100%",
                background: "var(--ink)",
                color: "white",
                border: "none",
                borderRadius: "14px",
                padding: "14px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
