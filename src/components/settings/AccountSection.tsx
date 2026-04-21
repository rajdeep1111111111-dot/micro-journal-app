"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  email: string;
  username: string;
  onUsernameUpdate: (username: string) => void;
};

export default function AccountSection({
  email,
  username,
  onUsernameUpdate,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const supabase = useMemo(() => createClient(), []);

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
      onUsernameUpdate(newUsername.trim());
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) throw error;
      setPasswordMsg("Password reset email sent!");
    } catch {
      setPasswordMsg("Failed to send reset email.");
    }
    setTimeout(() => setPasswordMsg(""), 4000);
  };

  return (
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
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "14px", color: "var(--ink)" }}>Email</span>
          <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>
            {email}
          </span>
        </div>
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--cream-dark)",
          }}
        >
          {editing ? (
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
                onClick={() => setEditing(false)}
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
                <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>
                  {username}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
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
                color: passwordMsg.includes("Failed")
                  ? "#DC2626"
                  : "var(--green)",
              }}
            >
              {passwordMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
