"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookText, Rss, Settings, Sun, Users } from "lucide-react";

const tabs = [
  { label: "Feed",     icon: Rss,      href: "/dashboard/feed" },
  { label: "Daily",   icon: Sun,      href: "/dashboard" },
  { label: "Journal", icon: BookText, href: "/dashboard/journal" },
  { label: "Friends", icon: Users,    href: "/dashboard/friends" },
  { label: "Settings",icon: Settings, href: "/dashboard/settings" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "720px",
        background: "var(--nav-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 100,
        WebkitTapHighlightColor: "transparent",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        height: "calc(72px + env(safe-area-inset-bottom, 0px))",
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
            aria-label={tab.label}
            aria-current={active ? "page" : undefined}
            style={{
              textDecoration: "none",
              flex: 1,
              height: "72px",
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
                color={active ? "var(--nav-icon-active)" : "var(--nav-icon)"}
                strokeWidth={active ? 2 : 1.5}
                aria-hidden
              />
              <span
                style={{
                  fontSize: "9px",
                  color: active ? "var(--nav-icon-active)" : "var(--nav-icon)",
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
