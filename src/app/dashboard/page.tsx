import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div style={{ maxWidth: 800, margin: "60px auto", padding: "0 24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Welcome back 👋</h1>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #ddd",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </form>
      </div>
      <p style={{ color: "#888" }}>{user.email}</p>
      <a
        href="/dashboard/journal"
        style={{
          display: "inline-block",
          marginTop: 24,
          padding: "10px 20px",
          borderRadius: 8,
          background: "#000",
          color: "#fff",
          textDecoration: "none",
        }}
      >
        Go to journal
      </a>
    </div>
  );
}
