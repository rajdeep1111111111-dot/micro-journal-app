"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";

const RequestsTab = dynamic(() => import("@/components/friends/RequestsTab"));
const ShareTab = dynamic(() => import("@/components/friends/ShareTab"));

type Tab = "friends" | "share";

export default function FriendsPageClient() {
  const [tab, setTab] = useState<Tab>("friends");

  const tabs: { key: Tab; label: string }[] = [
    { key: "friends", label: "Friends" },
    { key: "share", label: "Share" },
  ];

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
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                border: "1px solid var(--cream-dark)",
                background: tab === t.key ? "var(--ink)" : "white",
                color: tab === t.key ? "white" : "var(--ink-soft)",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <Suspense
        fallback={
          <p
            style={{
              padding: "0 28px",
              color: "var(--ink-muted)",
              fontSize: "14px",
            }}
          >
            Loading...
          </p>
        }
      >
        {tab === "friends" && <RequestsTab />}
        {tab === "share" && <ShareTab />}
      </Suspense>
    </div>
  );
}
