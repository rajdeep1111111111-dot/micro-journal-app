"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Home", icon: "⌂", href: "/dashboard" },
  { label: "Journal", icon: "✍", href: "/dashboard/journal" },
  { label: "Friends", icon: "◎", href: "/dashboard/friends" },
  { label: "Settings", icon: "⚙", href: "/dashboard/settings" },
];

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
                padding: "8px 20px",
                borderRadius: "16px",
                background: active ? "rgba(255,255,255,0.12)" : "transparent",
                transition: "all 0.15s",
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
                userSelect: "none",
              }}
            >
              <span style={{ fontSize: "20px", color: "white" }}>
                {tab.icon}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  color: active ? "#fff" : "rgba(255,255,255,0.5)",
                  fontWeight: active ? "500" : "400",
                  letterSpacing: "0.05em",
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
