"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { RequestsTabSkeleton } from "@/components/ui/Skeleton";

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
        {/* Title */}
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

        {/* Tab pills + message icon on the same row */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                background: tab === t.key ? "var(--ink)" : "var(--surface)",
                color: tab === t.key ? "var(--cream)" : "var(--ink-soft)",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}

          {/* Spacer pushes icon to the right */}
          <div style={{ flex: 1 }} />

          <Link
            href="/dashboard/messages"
            aria-label="Messages"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "var(--surface)",
              border: "1px solid var(--cream-dark)",
              color: "var(--ink)",
              textDecoration: "none",
            }}
          >
            <MessageCircle size={17} strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      <Suspense fallback={<RequestsTabSkeleton />}>
        {tab === "friends" && <RequestsTab />}
        {tab === "share" && <ShareTab />}
      </Suspense>
    </div>
  );
}
