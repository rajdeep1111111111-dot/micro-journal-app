"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";
import { ArrowLeft } from "lucide-react";

type Friend = {
  id: string;
  username: string;
  avatar_url: string | null;
};

export default function NewMessagePage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const load = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: friendships } = await supabase
        .from("friendships")
        .select("requester_id, recipient_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (!friendships?.length) {
        setFriends([]);
        return;
      }

      const ids = friendships.map((f) =>
        f.requester_id === user.id ? f.recipient_id : f.requester_id,
      );

      const { data: profiles } = await supabase
        .from("users")
        .select("id, username, avatar_url")
        .in("id", ids);

      setFriends((profiles ?? []) as Friend[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <div
        style={{
          padding: "52px 20px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid var(--cream-dark)",
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ArrowLeft size={20} color="var(--ink)" />
        </button>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "22px",
            color: "var(--ink)",
          }}
        >
          New message
        </div>
      </div>

      <div style={{ padding: "16px 20px 100px" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            color: "var(--ink-muted)",
            marginBottom: "12px",
          }}
        >
          Friends
        </div>

        {loading && (
          <p style={{ color: "var(--ink-muted)", fontSize: "14px" }}>
            Loading...
          </p>
        )}

        {!loading && friends.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "var(--ink-muted)",
              fontSize: "14px",
            }}
          >
            Add some friends first to start messaging.
          </div>
        )}

        {friends.map((friend) => (
          <button
            key={friend.id}
            type="button"
            onClick={() => router.push(`/dashboard/messages/${friend.id}`)}
            style={{
              width: "100%",
              background: "var(--surface)",
              border: "1px solid var(--cream-dark)",
              borderRadius: "16px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <Avatar
              username={friend.username}
              avatarUrl={friend.avatar_url}
              size={40}
              bgColor="var(--accent)"
            />
            <span
              style={{ fontSize: "15px", fontWeight: 500, color: "var(--ink)" }}
            >
              {friend.username}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
