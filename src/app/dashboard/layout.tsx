import { createClient } from "@/lib/supabase/server";
import { getUserWithSessionCleanup } from "@/lib/supabase/session";
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
  const { user } = await getUserWithSessionCleanup(supabase);
  if (!user) redirect("/auth/login");

  // Redirect new users to the get-started flow until they've completed it
  const { data: profile } = await supabase
    .from("users")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/get-started");
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        background: "var(--cream-dark)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "var(--app-width)",
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
