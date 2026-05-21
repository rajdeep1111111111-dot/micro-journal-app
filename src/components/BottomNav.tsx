"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookText, Rss, Settings, Sun, Users } from "lucide-react";

const tabs = [
  { label: "Feed", icon: Rss, href: "/dashboard/feed" },
  { label: "Daily", icon: Sun, href: "/dashboard" },
  { label: "Journal", icon: BookText, href: "/dashboard/journal" },
  { label: "Friends", icon: Users, href: "/dashboard/friends" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        maxWidth: "430px",
        height: "72px",
        background: "var(--ink)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 100,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            prefetch={true}
            style={{
              textDecoration: "none",
              flex: 1,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "6px 8px",
                borderRadius: "16px",
                background: active ? "rgba(255,255,255,0.12)" : "transparent",
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
                userSelect: "none",
              }}
            >
              <Icon
                size={22}
                color={active ? "white" : "rgba(255,255,255,0.5)"}
                strokeWidth={active ? 2 : 1.5}
              />
              <span
                style={{
                  fontSize: "9px",
                  color: active ? "#fff" : "rgba(255,255,255,0.5)",
                  fontWeight: active ? 500 : 400,
                  letterSpacing: "0.04em",
                }}
              >
                {tab.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
