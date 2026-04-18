"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/lib/types/database";

export default function SettingsPage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

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
      if (data) {
        setProfile(data as User);
        setUsername((data as User).username);
      }
    };
    void load();
  }, [supabase]);

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("users")
        .update({ username: newUsername.trim() })
        .eq("id", user.id);
      if (error) throw error;
      setUsername(newUsername.trim());
      setProfile((prev) =>
        prev ? { ...prev, username: newUsername.trim() } : prev,
      );
      setEditingUsername(false);
      setMessage("Username updated!");
      setIsError(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err: unknown) {
      setMessage(
        err instanceof Error ? err.message : "Failed to update username.",
      );
      setIsError(true);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) throw error;
      setPasswordMsg("Password reset email sent! Check your inbox.");
    } catch (err: unknown) {
      setPasswordMsg(
        err instanceof Error ? err.message : "Failed to send reset email.",
      );
    }
    setTimeout(() => setPasswordMsg(""), 4000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  const displayName = username || profile?.username || "User";
  const initials =
    (username || profile?.username)?.[0]?.toUpperCase() ?? "R";

  return (
    <div>
      <div style={{ padding: "52px 28px 24px" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "var(--ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-serif)",
            fontSize: "26px",
            color: "white",
            marginBottom: "12px",
          }}
        >
          {initials}
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "22px",
            color: "var(--ink)",
          }}
        >
          {displayName}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "var(--ink-muted)",
            marginTop: "2px",
          }}
        >
          {email}
        </div>
        {message && (
          <p
            style={{
              marginTop: "8px",
              fontSize: "13px",
              color: isError ? "#DC2626" : "var(--green)",
            }}
          >
            {message}
          </p>
        )}
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
          Account
        </div>
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid var(--cream-dark)",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--cream-dark)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "14px", color: "var(--ink)" }}>
                Email
              </span>
              <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>
                {email}
              </span>
            </div>
          </div>
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--cream-dark)",
            }}
          >
            {editingUsername ? (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder={username}
                  style={{
                    flex: 1,
                    border: "1px solid var(--cream-dark)",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    outline: "none",
                    color: "var(--ink)",
                  }}
                />
                <button
                  type="button"
                  onClick={handleUpdateUsername}
                  style={{
                    background: "var(--ink)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUsername(false)}
                  style={{
                    background: "none",
                    border: "1px solid var(--cream-dark)",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    cursor: "pointer",
                    color: "var(--ink-muted)",
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "14px", color: "var(--ink)" }}>
                  Username
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{ fontSize: "12px", color: "var(--ink-muted)" }}
                  >
                    {username}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUsername(true);
                      setNewUsername(username);
                    }}
                    style={{
                      background: "none",
                      border: "1px solid var(--cream-dark)",
                      borderRadius: "8px",
                      padding: "4px 8px",
                      fontSize: "11px",
                      cursor: "pointer",
                      color: "var(--ink-muted)",
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "14px", color: "var(--ink)" }}>
                Update password
              </span>
              <button
                type="button"
                onClick={handlePasswordReset}
                style={{
                  background: "none",
                  border: "1px solid var(--cream-dark)",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  cursor: "pointer",
                  color: "var(--ink-soft)",
                  fontWeight: 500,
                }}
              >
                Send reset email
              </button>
            </div>
            {passwordMsg && (
              <p
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "var(--green)",
                }}
              >
                {passwordMsg}
              </p>
            )}
          </div>
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
          App settings
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
            {
              label: "Dark mode",
              value: darkMode,
              toggle: () => setDarkMode((p) => !p),
            },
            {
              label: "Notifications",
              value: notifications,
              toggle: () => setNotifications((p) => !p),
            },
          ].map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                borderBottom: i === 0 ? "1px solid var(--cream-dark)" : "none",
              }}
            >
              <span style={{ fontSize: "14px", color: "var(--ink)" }}>
                {row.label}
              </span>
              <button
                type="button"
                aria-pressed={row.value}
                onClick={row.toggle}
                style={{
                  width: "36px",
                  height: "20px",
                  background: row.value ? "var(--green)" : "var(--cream-dark)",
                  borderRadius: "10px",
                  position: "relative",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: "none",
                  padding: 0,
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
                    left: row.value ? "18px" : "2px",
                    transition: "all 0.2s",
                  }}
                />
              </button>
            </div>
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
