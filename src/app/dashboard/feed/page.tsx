import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import FeedTab from "@/components/friends/FeedTab";
import { Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "Feed",
  description: "See what your friends are reflecting on.",
};

export default async function FeedPage() {
  const supabase = await createClient();
  await supabase.auth.getUser();

  // Placeholder unread count — will be real when notifications table is built
  const unreadCount = 0;

  return (
    <div>
      <div style={{ padding: "52px 20px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "26px",
                color: "var(--ink)",
              }}
            >
              Feed
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "var(--ink-muted)",
                marginTop: "2px",
              }}
            >
              Journal entries from friends & public accounts
            </div>
          </div>
          <a
            href="/dashboard/notifications"
            aria-label={
              unreadCount > 0
                ? `${unreadCount} unread notifications`
                : "Notifications"
            }
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "var(--surface)",
              border: "1px solid var(--cream-dark)",
              color: "var(--ink)",
              textDecoration: "none",
              marginTop: "4px",
            }}
          >
            <Bell size={18} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                }}
              />
            )}
          </a>
        </div>
      </div>
      <FeedTab />
    </div>
  );
}
