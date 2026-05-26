import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Likes, comments, and friend requests.",
};

export default function NotificationsPage() {
  return (
    <div style={{ padding: "52px 28px 24px" }}>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "26px",
          color: "var(--ink)",
          marginBottom: "8px",
        }}
      >
        Notifications
      </div>
      <p
        style={{
          fontSize: "14px",
          color: "var(--ink-muted)",
          lineHeight: 1.6,
        }}
      >
        Notifications are coming soon — likes, comments, and friend requests
        will appear here.
      </p>
    </div>
  );
}
