import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { JournalEntry, Streak } from "@/lib/types/database";
import CalendarWithModal from "@/components/home/CalendarWithModal";
import StreakCards from "@/components/home/StreakCards";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: entries }, { data: streak }, { data: profile }] =
    await Promise.all([
      supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("streaks").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("users")
        .select("username")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

  const rawUsername =
    profile?.username ?? user.email?.split("@")[0] ?? "there";
  const username =
    rawUsername.length > 12 ? rawUsername.slice(0, 12) : rawUsername;
  const currentStreak = (streak as Streak | null)?.current_streak ?? 0;
  const longestStreak = (streak as Streak | null)?.longest_streak ?? 0;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div
        style={{
          padding: "52px 28px 24px",
          background: "var(--ink)",
          borderRadius: "0 0 32px 32px",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              {dateStr}
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "28px",
                fontWeight: 400,
                lineHeight: 1.2,
                marginBottom: "4px",
              }}
            >
              Hi, {username} 👋
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.55)",
                fontWeight: 300,
              }}
            >
              Welcome back. Ready to reflect?
            </div>
          </div>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-serif)",
              fontSize: "18px",
              color: "white",
              fontWeight: 600,
              flexShrink: 0,
              marginTop: "4px",
            }}
          >
            {username?.[0]?.toUpperCase() ?? "R"}
          </div>
        </div>
      </div>

      <StreakCards
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        entries={(entries as JournalEntry[] | null) ?? []}
      />
      <CalendarWithModal entries={(entries as JournalEntry[] | null) ?? []} />
    </div>
  );
}
