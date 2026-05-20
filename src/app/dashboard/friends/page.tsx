"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

type Tab = "feed" | "requests" | "share";

const FeedTab = dynamic(() => import("@/components/friends/FeedTab"), {
  loading: () => <TabLoading />,
});
const RequestsTab = dynamic(() => import("@/components/friends/RequestsTab"), {
  loading: () => <TabLoading />,
});
const ShareTab = dynamic(() => import("@/components/friends/ShareTab"), {
  loading: () => <TabLoading />,
});

function TabLoading() {
  return (
    <div
      style={{
        padding: "24px 28px",
        color: "var(--ink-muted)",
        fontSize: "14px",
      }}
    >
      Loading...
    </div>
  );
}

export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>("feed");

  return (
    <div>
      <div style={{ padding: "52px 28px 20px" }}>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "26px",
            color: "var(--ink)",
            marginBottom: "16px",
          }}
        >
          Friends
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {(["feed", "requests", "share"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                border: "1px solid var(--cream-dark)",
                background: tab === t ? "var(--ink)" : "white",
                color: tab === t ? "white" : "var(--ink-soft)",
                transition: "all 0.15s",
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {tab === "feed" && <FeedTab />}
      {tab === "requests" && <RequestsTab />}
      {tab === "share" && <ShareTab />}
    </div>
  );
}
