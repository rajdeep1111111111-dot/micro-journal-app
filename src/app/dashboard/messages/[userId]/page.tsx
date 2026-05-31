"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";
import { ArrowLeft, Send } from "lucide-react";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

type Partner = {
  id: string;
  username: string;
  avatar_url: string | null;
};

function timeLabel(date: string) {
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ThreadPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params?.userId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const loadThread = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data: profile } = await supabase
        .from("users")
        .select("id, username, avatar_url")
        .eq("id", partnerId)
        .maybeSingle();
      if (profile) setPartner(profile);

      const { data: msgs } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, created_at, read_at")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      setMessages((msgs as Message[]) ?? []);

      // Use RPC — direct UPDATE on messages is blocked by RLS
      const hasUnread = (msgs ?? []).some(
        (m) => m.sender_id === partnerId && m.receiver_id === user.id && !m.read_at
      );
      if (hasUnread) {
        await supabase.rpc("mark_messages_read", { partner_id: partnerId });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase, partnerId]);

  useEffect(() => { void loadThread(); }, [loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => void loadThread(), 15000);
    return () => clearInterval(interval);
  }, [loadThread]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !currentUserId) return;
    setSending(true);

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      sender_id: currentUserId,
      receiver_id: partnerId,
      content: text,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: currentUserId,
        receiver_id: partnerId,
        content: text,
      });
      if (error) throw error;
      await loadThread();
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "var(--cream)",
        maxWidth: "430px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "52px 20px 14px",
          background: "var(--cream)",
          borderBottom: "1px solid var(--cream-dark)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
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
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={20} color="var(--ink)" />
        </button>
        {partner && (
          <>
            <Avatar
              username={partner.username}
              avatarUrl={partner.avatar_url}
              size={36}
              bgColor="var(--accent)"
            />
            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--ink)" }}>
              {partner.username}
            </div>
          </>
        )}
      </div>

      {/* Messages — scrollable middle */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {loading && (
          <p style={{ color: "var(--ink-muted)", fontSize: "14px" }}>Loading...</p>
        )}

        {!loading && messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-muted)", fontSize: "14px" }}>
            Say hello to {partner?.username ?? "your friend"} ✦
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.sender_id === currentUserId;
          const showTime =
            i === messages.length - 1 ||
            new Date(messages[i + 1].created_at).getTime() -
              new Date(msg.created_at).getTime() > 300000;

          return (
            <div key={msg.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  alignItems: "flex-end",
                  gap: "8px",
                }}
              >
                {!isMe && partner && (
                  <Avatar
                    username={partner.username}
                    avatarUrl={partner.avatar_url}
                    size={26}
                    bgColor="var(--accent)"
                  />
                )}
                <div
                  style={{
                    maxWidth: "72%",
                    background: isMe ? "var(--ink)" : "var(--surface)",
                    color: isMe ? "var(--cream)" : "var(--ink)",
                    borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    padding: "10px 14px",
                    fontSize: "14px",
                    lineHeight: 1.5,
                    border: isMe ? "none" : "1px solid var(--cream-dark)",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>
              </div>
              {showTime && (
                <div
                  style={{
                    textAlign: isMe ? "right" : "left",
                    fontSize: "10px",
                    color: "var(--ink-muted)",
                    marginTop: "4px",
                    paddingLeft: isMe ? 0 : "34px",
                    paddingRight: isMe ? "4px" : 0,
                  }}
                >
                  {timeLabel(msg.created_at)}
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar — sticks to bottom via flexbox, not position:fixed */}
      <div
        style={{
          borderTop: "1px solid var(--cream-dark)",
          padding: "12px 16px 20px",
          display: "flex",
          gap: "10px",
          alignItems: "flex-end",
          background: "var(--cream)",
          flexShrink: 0,
        }}
      >
        <label htmlFor="message-input" className="sr-only">
          Message {partner?.username ?? ""}
        </label>
        <textarea
          id="message-input"
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${partner?.username ?? ""}...`}
          rows={1}
          style={{
            flex: 1,
            border: "1px solid var(--cream-dark)",
            background: "var(--surface)",
            borderRadius: "20px",
            padding: "10px 16px",
            fontSize: "14px",
            color: "var(--ink)",
            resize: "none",
            outline: "none",
            lineHeight: 1.5,
            overflow: "hidden",
            minHeight: "42px",
            maxHeight: "120px",
            fontFamily: "inherit",
          }}
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!input.trim() || sending}
          aria-label="Send message"
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: input.trim() ? "var(--ink)" : "var(--cream-dark)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: input.trim() ? "pointer" : "not-allowed",
            transition: "background 0.15s",
            flexShrink: 0,
          }}
        >
          <Send
            size={16}
            color={input.trim() ? "var(--cream)" : "var(--ink-muted)"}
            strokeWidth={1.5}
          />
        </button>
      </div>
    </div>
  );
}
