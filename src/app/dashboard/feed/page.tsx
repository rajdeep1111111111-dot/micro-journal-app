import type { Metadata } from "next";
import FeedTab from "@/components/friends/FeedTab";

export const metadata: Metadata = {
  title: "Feed",
  description: "See what your friends are reflecting on.",
};

export default function FeedPage() {
  return (
    <div>
      <div style={{ padding: "52px 28px 20px" }}>
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
            marginTop: "4px",
          }}
        >
          Journal entries from friends & public accounts
        </div>
      </div>
      <FeedTab />
    </div>
  );
}
