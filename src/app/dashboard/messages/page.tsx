"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";
import { MessageInboxSkeleton } from "@/components/ui/Skeleton";
import { ArrowLeft, Pencil } from "lucide-react";

type Conversation = {
  userId: string;
  username: string;
  avatar_url: string | null;
  lastMessage: string;
  lastAt: string;
  unread: number;
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function MessagesPage() {
  const router = useRouter();
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: msgs } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, read_at, created_at")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!msgs?.length) {
        setConvos([]);
        return;
      }

      const partnerIds = [
        ...new Set(
          msgs.map((m) =>
            m.sender_id === user.id ? m.receiver_id : m.sender_id,
          ),
        ),
      ];

      const { data: profiles } = await supabase
        .from("users")
        .select("id, username, avatar_url")
        .in("id", partnerIds);

      const profileMap = Object.fromEntries(
        (profiles ?? []).map((p) => [p.id, p]),
      );

      const seen = new Set<string>();
      const result: Conversation[] = [];

      for (const msg of msgs) {
        const partnerId =
          msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (seen.has(partnerId)) continue;
        seen.add(partnerId);

        const profile = profileMap[partnerId];
        if (!profile) continue;

        const unread = msgs.filter(
          (m) =>
            m.sender_id === partnerId &&
            m.receiver_id === user.id &&
            !m.read_at,
        ).length;

        result.push({
          userId: partnerId,
          username: profile.username,
          avatar_url: profile.avatar_url ?? null,
          lastMessage: msg.content,
          lastAt: msg.created_at,
          unread,
        });
      }

      setConvos(result);
    } catch (err) {
      console.error(err);
    } finally {
      await new Promise((r) => setTimeout(r, 2000));
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
          padding: "52px 20px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--cream-dark)",
              borderRadius: "50%",
              width: "38px",
              height: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={16} color="var(--ink)" />
          </button>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "26px",
              color: "var(--ink)",
            }}
          >
            Messages
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/messages/new")}
          aria-label="New message"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "var(--surface)",
            border: "1px solid var(--cream-dark)",
            cursor: "pointer",
          }}
        >
          <Pencil size={16} strokeWidth={1.5} color="var(--ink)" />
        </button>
      </div>

      <div style={{ padding: "0 20px 100px" }}>
        {loading && <MessageInboxSkeleton />}

        {!loading && convos.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>✦</div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "18px",
                color: "var(--ink)",
                marginBottom: "8px",
              }}
            >
              No messages yet
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "var(--ink-muted)",
                marginBottom: "20px",
              }}
            >
              Send a message to a friend to start a conversation.
            </p>
            <button
              type="button"
              onClick={() => router.push("/dashboard/messages/new")}
              style={{
                background: "var(--ink)",
                color: "var(--cream)",
                border: "none",
                borderRadius: "14px",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Start a conversation
            </button>
          </div>
        )}

        {!loading &&
          convos.map((convo) => (
            <button
              key={convo.userId}
              type="button"
              onClick={() => router.push(`/dashboard/messages/${convo.userId}`)}
              style={{
                width: "100%",
                background: "var(--surface)",
                border: "1px solid var(--cream-dark)",
                borderRadius: "18px",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "10px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Avatar
                  username={convo.username}
                  avatarUrl={convo.avatar_url}
                  size={46}
                  bgColor="var(--accent)"
                />
                {convo.unread > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: "var(--accent)",
                      border: "2px solid var(--cream)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "9px",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    {convo.unread > 9 ? "9+" : convo.unread}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "3px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: convo.unread > 0 ? 600 : 500,
                      color: "var(--ink)",
                    }}
                  >
                    {convo.username}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--ink-muted)",
                      flexShrink: 0,
                    }}
                  >
                    {timeAgo(convo.lastAt)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color:
                      convo.unread > 0 ? "var(--ink-soft)" : "var(--ink-muted)",
                    fontWeight: convo.unread > 0 ? 500 : 400,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {convo.lastMessage}
                </div>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
