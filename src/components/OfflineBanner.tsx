"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "430px",
        background: "#DC2626",
        color: "white",
        textAlign: "center",
        padding: "10px 16px",
        fontSize: "13px",
        fontWeight: 500,
        zIndex: 200,
      }}
    >
      You are offline. Check your connection.
    </div>
  );
}
