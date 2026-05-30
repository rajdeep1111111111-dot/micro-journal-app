"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import ProfileHeader from "@/components/settings/ProfileHeader";
import AccountSection from "@/components/settings/AccountSection";
import AppSettingsSection from "@/components/settings/AppSettingsSection";
import { ProfileHeaderSkeleton } from "@/components/ui/Skeleton";

const privacyContent: Record<string, { title: string; content: string }> = {
  "Privacy policy": {
    title: "Privacy Policy for Reflecto",
    content: `Last updated: May 27, 2026

Welcome to Reflecto.

Reflecto is built to be a calm, personal space for reflection. Your privacy matters deeply to us, and we aim to handle your data with care, transparency, and respect.

By using Reflecto, you agree to this Privacy Policy.

1. Information We Collect

When you use Reflecto, we may collect:

• Account information such as your email address and username
• Journal entries you create
• AI-generated reflections related to your entries
• Shared posts, comments, reactions, and social interactions
• Voice recordings or dictated journal input when using dictation features
• Basic device, browser, and usage information
• Waitlist or newsletter email submissions

2. How We Use Your Information

We use your information to:

• Provide and improve Reflecto
• Generate AI reflections and journaling features
• Maintain streaks and account functionality
• Enable social and sharing features
• Send important updates or account-related emails
• Improve reliability, security, and performance
• Prevent abuse or misuse of the platform

We do not sell your personal data.

3. Privacy of Journal Entries

Journal entries are private by default.

Only you can access your private entries unless you explicitly choose to share content through Reflecto's social features.

You control what is shared and with whom.

4. AI Processing

Some content you create may be securely processed by AI providers to generate reflections or app features.

We currently use:

• OpenAI

We aim to minimize the amount of information shared and only send the data necessary to provide the feature requested.

5. Voice & Dictation Features

Reflecto may allow users to create journal entries using voice dictation.

Audio recordings may be temporarily processed by trusted speech-to-text providers to convert speech into text. These recordings are only processed as necessary to provide dictation functionality.

Generated transcripts may be stored as journal entries within your account.

We do not use voice recordings for advertising purposes.

You can choose not to use dictation features at any time.

6. Third-Party Services

Reflecto relies on trusted third-party providers to operate the service, including:

• Supabase — authentication and database infrastructure
• Vercel — hosting and deployment
• Resend — email delivery
• OpenAI — AI-generated reflections and speech processing

These providers may process limited data required to operate Reflecto.

7. Data Security

We take reasonable measures to protect your information, including:

• encrypted HTTPS connections
• authenticated access controls
• secure database policies
• restricted internal access

However, no internet service can guarantee absolute security.

8. Data Retention

We retain your information only as long as necessary to provide Reflecto and related services.

You may request deletion of your account and associated data at any time.

9. Your Rights

Depending on your location, you may have rights to:

• access your data
• correct inaccurate data
• request deletion of your data
• withdraw consent for certain processing

To make a request, contact:

hello@reflecto.it.com

10. Children's Privacy

Reflecto is not intended for children under 13 years old.

If we become aware that we have collected personal data from a child under 13, we will take reasonable steps to remove it.

11. Changes to This Policy

We may update this Privacy Policy from time to time.

If changes are significant, we may notify users through the app or by email.

Continued use of Reflecto after updates means you accept the revised policy.

12. Contact

If you have questions about this Privacy Policy or your data, contact:

hello@reflecto.it.com`,
  },
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

export default function SettingsPageClient() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      setUserId(user.id);
      const { data } = await supabase
        .from("users")
        .select("username, is_public, avatar_url")
        .eq("id", user.id)
        .single();
      if (data) {
        setUsername(data.username);
        setIsPublic(data.is_public ?? false);
        setAvatarUrl(data.avatar_url ?? null);
      }
    };
    void load();
  }, [supabase]);

  const handleSignOut = async () => {
    await fetch("/auth/signout", { method: "POST", credentials: "same-origin" });
    window.location.assign("/auth/login");
  };

  const handlePrivacyToggle = async () => {
    const newValue = !isPublic;
    setIsPublic(newValue);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("users").update({ is_public: newValue }).eq("id", user.id);
  };

  return (
    <div>
      {userId ? (
        <ProfileHeader
          username={username}
          email={email}
          userId={userId}
          avatarUrl={avatarUrl}
          message={message}
          isError={isError}
        />
      ) : (
        <ProfileHeaderSkeleton />
      )}
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
            background: "var(--surface)",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid var(--cream-dark)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "1px solid var(--cream-dark)",
            }}
          >
            <div>
              <div style={{ fontSize: "14px", color: "var(--ink)" }}>
                Private account
              </div>
              <div style={{ fontSize: "11px", color: "var(--ink-muted)", marginTop: "2px" }}>
                {isPublic
                  ? "Anyone can see your shared entries"
                  : "Only friends can see your entries"}
              </div>
            </div>
            <button
              type="button"
              aria-label={`Private account: ${isPublic ? "off" : "on"}`}
              aria-pressed={!isPublic}
              onClick={() => void handlePrivacyToggle()}
              style={{
                width: "36px",
                height: "20px",
                background: !isPublic ? "var(--green)" : "var(--cream-dark)",
                borderRadius: "10px",
                position: "relative",
                cursor: "pointer",
                transition: "all 0.2s",
                border: "none",
                padding: 0,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  width: "16px",
                  height: "16px",
                  background: "white",
                  borderRadius: "50%",
                  top: "2px",
                  left: !isPublic ? "18px" : "2px",
                  transition: "all 0.2s",
                }}
              />
            </button>
          </div>

          {["Friend settings", "Saved posts", "Shared posts"].map((label, i) => (
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
                borderBottom: i < 2 ? "1px solid var(--cream-dark)" : "none",
                cursor: "pointer",
                background: "none",
                border: "none",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: "14px", color: "var(--ink)" }}>{label}</span>
              <span style={{ fontSize: "14px", color: "var(--ink-muted)" }}>›</span>
            </button>
          ))}
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
            background: "var(--surface)",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid var(--cream-dark)",
          }}
        >
          {[
            { label: "Version", value: "v1.2.0" },
            { label: "Built with", value: "Next.js + Supabase" },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                borderBottom: "1px solid var(--cream-dark)",
              }}
            >
              <span style={{ fontSize: "14px", color: "var(--ink)" }}>{row.label}</span>
              <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>{row.value}</span>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setShowPrivacyModal("Privacy policy")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "14px 16px",
              cursor: "pointer",
              background: "none",
              border: "none",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: "14px", color: "var(--ink)" }}>Privacy policy</span>
            <span style={{ fontSize: "14px", color: "var(--ink-muted)" }}>›</span>
          </button>
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
              background: "var(--surface)",
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
                maxHeight: "min(60vh, 420px)",
                overflowY: "auto",
                whiteSpace: "pre-line",
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
