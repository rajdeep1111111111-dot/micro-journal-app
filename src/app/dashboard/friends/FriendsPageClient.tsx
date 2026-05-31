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
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "26px",
              color: "var(--ink)",
            }}
          >
            Friends
          </div>
          <Link
            href="/dashboard/messages"
            aria-label="Messages"
            style={{
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
            <MessageCircle size={18} strokeWidth={1.5} />
          </Link>
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
                background: tab === t.key ? "var(--ink)" : "var(--surface)",
                color: tab === t.key ? "var(--cream)" : "var(--ink-soft)",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Suspense fallback={<RequestsTabSkeleton />}>
        {tab === "friends" && <RequestsTab />}
        {tab === "share" && <ShareTab />}
      </Suspense>
    </div>
  );
}
