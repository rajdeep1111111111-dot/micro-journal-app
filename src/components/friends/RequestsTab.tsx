"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";
import { RequestsTabSkeleton } from "@/components/ui/Skeleton";

type Friend = {
  id: string;
  username: string;
  avatar_url: string | null;
  friendship_id: string;
};

type Request = {
  id: string;
  requester_id: string;
  username: string;
  avatar_url: string | null;
};

export default function RequestsTab() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [search, setSearch] = useState("");
  const [searchMsg, setSearchMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setFriends([]);
      setRequests([]);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: friendships } = await supabase
        .from("friendships")
        .select("id, requester_id, recipient_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (friendships?.length) {
        const friendUserIds = friendships.map((f) =>
          f.requester_id === user.id ? f.recipient_id : f.requester_id,
        );
        if (friendUserIds.length > 0) {
          const { data: friendProfiles } = await supabase
            .from("users")
            .select("id, username, avatar_url")
            .in("id", friendUserIds);

          const mapped = (friendProfiles ?? []).map((p) => ({
            id: p.id,
            username: p.username,
            avatar_url: p.avatar_url ?? null,
            friendship_id:
              friendships.find(
                (f) => f.requester_id === p.id || f.recipient_id === p.id,
              )?.id ?? "",
          }));
          setFriends(mapped);
        }
      }

      const { data: pending } = await supabase
        .from("friendships")
        .select("id, requester_id")
        .eq("recipient_id", user.id)
        .eq("status", "pending");

      if (pending?.length) {
        const requesterIds = pending.map((p) => p.requester_id);
        const { data: requesterProfiles } = await supabase
          .from("users")
          .select("id, username, avatar_url")
          .in("id", requesterIds);

        const mappedRequests = (requesterProfiles ?? []).map((p) => ({
          id: pending.find((r) => r.requester_id === p.id)?.id ?? "",
          requester_id: p.id,
          username: p.username,
          avatar_url: p.avatar_url ?? null,
        }));
        setRequests(mappedRequests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAccept = async (requestId: string) => {
    setSavingId(requestId);
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", requestId);
      if (error) throw error;
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    setSavingId(requestId);
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", requestId);
      if (error) throw error;
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    if (!window.confirm("Remove this friend?")) return;
    setSavingId(friendshipId);
    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);
      if (error) throw error;
      setFriends((prev) => prev.filter((f) => f.friendship_id !== friendshipId));
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleSendRequest = async () => {
    const username = search.trim();
    if (!username) return;

    setSending(true);
    setSearchMsg("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: target, error: targetError } = await supabase
        .from("users")
        .select("id, username")
        .ilike("username", username)
        .maybeSingle();

      if (targetError) throw targetError;
      if (!target) {
        setSearchMsg("User not found.");
        return;
      }
      if (target.id === user.id) {
        setSearchMsg("You can't add yourself.");
        return;
      }

      const { data: existing, error: existingError } = await supabase
        .from("friendships")
        .select("id, status")
        .or(
          `and(requester_id.eq.${user.id},recipient_id.eq.${target.id}),and(requester_id.eq.${target.id},recipient_id.eq.${user.id})`,
        )
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing) {
        setSearchMsg(
          existing.status === "accepted"
            ? "You are already friends."
            : "Request already sent.",
        );
        return;
      }

      const { error } = await supabase.from("friendships").insert({
        requester_id: user.id,
        recipient_id: target.id,
        status: "pending",
      });

      if (error?.code === "23505") {
        setSearchMsg("Request already sent.");
      } else if (error) {
        setSearchMsg("Failed to send request.");
      } else {
        setSearchMsg(`Request sent to @${target.username}!`);
        setSearch("");
      }
    } catch {
      setSearchMsg("Something went wrong.");
    } finally {
      setSending(false);
      setTimeout(() => setSearchMsg(""), 3000);
    }
  };

  if (loading) return <RequestsTabSkeleton />;

  return (
    <div style={{ padding: "0 28px 24px" }}>
      {requests.length > 0 && (
        <>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--ink-muted)",
              marginBottom: "10px",
            }}
          >
            Requests
          </div>
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
              <Avatar
                username={req.username}
                avatarUrl={req.avatar_url}
                size={40}
                bgColor="var(--accent)"
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--ink)",
                  }}
                >
                  {req.username}
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
        </>
      )}

      <div
        style={{
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
          marginBottom: "10px",
        }}
      >
        Friends {friends.length > 0 ? `(${friends.length})` : ""}
      </div>

      {friends.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "20px 0 24px",
            color: "var(--ink-muted)",
            fontSize: "14px",
          }}
        >
          No friends yet. Add someone below.
        </div>
      )}

      {friends.map((friend) => (
        <div
          key={friend.id}
          style={{
            background: "var(--surface)",
            borderRadius: "14px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
            border: "1px solid var(--cream-dark)",
          }}
        >
          <Avatar
            username={friend.username}
            avatarUrl={friend.avatar_url}
            size={36}
            bgColor="var(--green)"
          />
          <div
            style={{
              flex: 1,
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--ink)",
            }}
          >
            @{friend.username}
          </div>
          <button
            type="button"
            onClick={() => void handleRemoveFriend(friend.friendship_id)}
            disabled={savingId === friend.friendship_id}
            style={{
              background: "none",
              border: "1px solid var(--cream-dark)",
              borderRadius: "8px",
              padding: "4px 10px",
              fontSize: "11px",
              cursor:
                savingId === friend.friendship_id ? "not-allowed" : "pointer",
              color: "var(--ink-muted)",
            }}
          >
            Remove
          </button>
        </div>
      ))}

      <div style={{ marginTop: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-muted)",
            marginBottom: "10px",
          }}
        >
          Add a friend
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <label htmlFor="friend-search" className="sr-only">
            Search by username
          </label>
          <input
            id="friend-search"
            placeholder="Search by username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSendRequest();
            }}
            style={{
              flex: 1,
              border: "1px solid var(--cream-dark)",
              background: "var(--input-bg)",
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
              background: sending ? "var(--ink-soft)" : "var(--btn-primary)",
              color: "var(--btn-primary-text)",
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
        {searchMsg && (
          <p
            style={{
              marginTop: "8px",
              fontSize: "13px",
              color: searchMsg.includes("!") ? "var(--green)" : "#DC2626",
            }}
          >
            {searchMsg}
          </p>
        )}
      </div>
    </div>
  );
}
