import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import BottomNav from "@/components/BottomNav";
import OfflineBanner from "@/components/OfflineBanner";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        background: "#E8E2D9",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          minHeight: "100vh",
          background: "var(--cream)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <OfflineBanner />
        <main style={{ flex: 1, paddingBottom: "80px" }}>{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
