"use client";

import { useState } from "react";
import FeedTab from "@/components/friends/FeedTab";
import RequestsTab from "@/components/friends/RequestsTab";
import ShareTab from "@/components/friends/ShareTab";

type Tab = "feed" | "requests" | "share";

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
