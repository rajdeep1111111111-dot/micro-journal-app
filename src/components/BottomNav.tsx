"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Friends", icon: "◎", href: "/dashboard/friends" },
  { label: "Home", icon: "⌂", href: "/dashboard" },
  {
    label: "Journal",
    href: "/dashboard/journal",
    customIcon: (active: boolean) => (
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          border: `2px solid ${active ? "white" : "rgba(255,255,255,0.5)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "3px",
            left: "4px",
            right: "4px",
            height: "2px",
            background: active ? "white" : "rgba(255,255,255,0.5)",
            borderRadius: "1px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "8px",
            left: "4px",
            right: "4px",
            height: "2px",
            background: active ? "white" : "rgba(255,255,255,0.5)",
            borderRadius: "1px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "13px",
            left: "4px",
            right: "8px",
            height: "2px",
            background: active ? "white" : "rgba(255,255,255,0.5)",
            borderRadius: "1px",
          }}
        />
      </div>
    ),
  },
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
                padding: "8px 16px",
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
                <span style={{ fontSize: "20px", color: "white" }}>
                  {tab.icon}
                </span>
              )}
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
