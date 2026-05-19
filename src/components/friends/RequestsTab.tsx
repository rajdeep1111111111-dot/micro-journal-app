"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Friendship, User } from "@/lib/types/database";

type FriendRequest = Friendship & {
  requester?: Pick<User, "id" | "username" | "email" | "avatar_url"> | null;
};

function initialsFor(request: FriendRequest) {
  const label =
    request.requester?.username ??
    request.requester?.email?.split("@")[0] ??
    request.requester_id;

  return label
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function nameFor(request: FriendRequest) {
  return (
    request.requester?.username ??
    request.requester?.email?.split("@")[0] ??
    `User ${request.requester_id.slice(0, 8)}`
  );
}

export default function RequestsTab() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const showMessage = useCallback((text: string, error = false) => {
    setMessage(text);
    setIsError(error);
    setTimeout(() => setMessage(""), 3500);
  }, []);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not authenticated");

      const { data: friendshipRows, error: friendshipError } = await supabase
        .from("friendships")
        .select("*")
        .eq("recipient_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (friendshipError) throw friendshipError;

      const rows = (friendshipRows as Friendship[] | null) ?? [];
      const requesterIds = rows.map((row) => row.requester_id);

      let usersById: Record<string, FriendRequest["requester"]> = {};
      if (requesterIds.length > 0) {
        const { data: userRows, error: usersError } = await supabase
          .from("users")
          .select("id, username, email, avatar_url")
          .in("id", requesterIds);

        if (!usersError && userRows) {
          usersById = Object.fromEntries(
            (userRows as Pick<User, "id" | "username" | "email" | "avatar_url">[]).map(
              (profile) => [profile.id, profile],
            ),
          );
        }
      }

      setRequests(
        rows.map((row) => ({
          ...row,
          requester: usersById[row.requester_id] ?? null,
        })),
      );
    } catch (err) {
      console.error(err);
      showMessage(
        err instanceof Error ? err.message : "Failed to load requests.",
        true,
      );
    } finally {
      setLoading(false);
    }
  }, [showMessage, supabase]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const handleAccept = async (id: string) => {
    setSavingId(id);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("friendships")
        .update({
          status: "accepted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("recipient_id", user.id);
      if (error) throw error;

      setRequests((prev) => prev.filter((request) => request.id !== id));
      showMessage("Friend request accepted!");
    } catch (err) {
      console.error(err);
      showMessage(
        err instanceof Error ? err.message : "Failed to accept request.",
        true,
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleDecline = async (id: string) => {
    setSavingId(id);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("friendships")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("recipient_id", user.id);
      if (error) throw error;

      setRequests((prev) => prev.filter((request) => request.id !== id));
      showMessage("Friend request declined.");
    } catch (err) {
      console.error(err);
      showMessage(
        err instanceof Error ? err.message : "Failed to decline request.",
        true,
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleSendRequest = async () => {
    const username = search.trim();
    if (!username) return;

    setSending(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not authenticated");

      const { data: target, error: targetError } = await supabase
        .from("users")
        .select("id, username")
        .ilike("username", username)
        .maybeSingle();
      if (targetError) throw targetError;
      if (!target) throw new Error("No user found with that username.");
      if (target.id === user.id) throw new Error("You cannot add yourself.");

      const { data: existing, error: existingError } = await supabase
        .from("friendships")
        .select("id, status")
        .or(
          `and(requester_id.eq.${user.id},recipient_id.eq.${target.id}),and(requester_id.eq.${target.id},recipient_id.eq.${user.id})`,
        )
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing) {
        throw new Error(
          existing.status === "accepted"
            ? "You are already friends."
            : "A friend request already exists.",
        );
      }

      const { error: insertError } = await supabase.from("friendships").insert({
        requester_id: user.id,
        recipient_id: target.id,
        status: "pending",
      });
      if (insertError) throw insertError;

      setSearch("");
      showMessage(`Friend request sent to @${target.username}!`);
    } catch (err) {
      console.error(err);
      showMessage(
        err instanceof Error ? err.message : "Failed to send request.",
        true,
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: "0 28px 24px" }}>
      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "24px 0",
            color: "var(--ink-muted)",
            fontSize: "14px",
          }}
        >
          Loading requests...
        </div>
      )}

      {!loading && requests.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "24px 0",
            color: "var(--ink-muted)",
            fontSize: "14px",
          }}
        >
          No pending requests
        </div>
      )}

      {requests.map((req) => (
        <div
          key={req.id}
          style={{
            background: "var(--accent-light)",
            borderRadius: "16px",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "var(--ink)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 500,
              color: "white",
              flexShrink: 0,
            }}
          >
            {initialsFor(req) || "?"}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--ink)",
              }}
            >
              {nameFor(req)}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--ink-muted)",
                marginTop: "2px",
              }}
            >
              Wants to be your friend
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              onClick={() => void handleAccept(req.id)}
              disabled={savingId === req.id}
              style={{
                background: "var(--ink)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "6px 12px",
                fontSize: "11px",
                cursor: savingId === req.id ? "not-allowed" : "pointer",
                fontWeight: 500,
              }}
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => void handleDecline(req.id)}
              disabled={savingId === req.id}
              style={{
                background: "transparent",
                color: "var(--ink-muted)",
                border: "1px solid var(--cream-dark)",
                borderRadius: "10px",
                padding: "6px 12px",
                fontSize: "11px",
                cursor: savingId === req.id ? "not-allowed" : "pointer",
              }}
            >
              Decline
            </button>
          </div>
        </div>
      ))}

      <div style={{ marginTop: "24px" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-muted)",
            marginBottom: "12px",
          }}
        >
          Add a friend
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            placeholder="Search by username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: "1px solid var(--cream-dark)",
              background: "white",
              borderRadius: "14px",
              padding: "12px 16px",
              fontSize: "14px",
              color: "var(--ink)",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => void handleSendRequest()}
            disabled={sending}
            style={{
              background: sending ? "var(--ink-soft)" : "var(--ink)",
              color: "white",
              border: "none",
              borderRadius: "14px",
              padding: "12px 16px",
              fontSize: "14px",
              cursor: sending ? "not-allowed" : "pointer",
              fontWeight: 500,
            }}
          >
            {sending ? "Sending" : "Send"}
          </button>
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
    </div>
  );
}
