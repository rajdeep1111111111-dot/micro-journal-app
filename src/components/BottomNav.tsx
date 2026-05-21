"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Feed", icon: "◎", href: "/dashboard/feed" },
  { label: "Daily", icon: "⌂", href: "/dashboard" },
  {
    label: "Journal",
    href: "/dashboard/journal",
    customIcon: (active: boolean) => (
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "5px",
          border: `2px solid ${active ? "white" : "rgba(255,255,255,0.5)"}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "3px",
          padding: "3px 4px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: "2px",
              background: active ? "white" : "rgba(255,255,255,0.5)",
              borderRadius: "1px",
              width: i === 2 ? "70%" : "100%",
            }}
          />
        ))}
      </div>
    ),
  },
  { label: "Friends", icon: "👥", href: "/dashboard/friends" },
  { label: "Settings", icon: "⚙", href: "/dashboard/settings" },
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
              {"customIcon" in tab ? (
                tab.customIcon(active)
              ) : (
                <span style={{ fontSize: "18px", color: "white" }}>
                  {tab.icon}
                </span>
              )}
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
