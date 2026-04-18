import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { JournalEntry, Streak } from "@/lib/types/database";

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
        .order("created_at", { ascending: false })
        .limit(3),
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
  const weekEntries =
    (entries as JournalEntry[] | null)?.filter((e) => {
      const d = new Date(e.created_at);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo;
    }).length ?? 0;

  const now = new Date();
  const monthName = now.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const today = now.getDate();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const entryDates = new Set(
    (entries as JournalEntry[] | null)?.map((e) =>
      new Date(e.created_at).getDate(),
    ) ?? [],
  );

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
        style={{ display: "flex", gap: "12px", padding: "24px 28px 0" }}
      >
        <div
          style={{
            flex: 1,
            background: "var(--accent)",
            borderRadius: "20px",
            padding: "18px",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-16px",
              top: "-16px",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
            }}
          />
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "42px",
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            {currentStreak}
          </div>
          <div
            style={{
              fontSize: "11px",
              opacity: 0.8,
              marginTop: "4px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Day streak
          </div>
        </div>
        <div
          style={{
            flex: 1,
            background: "var(--green)",
            borderRadius: "20px",
            padding: "18px",
            color: "white",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "42px",
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            {weekEntries}
          </div>
          <div
            style={{
              fontSize: "11px",
              opacity: 0.8,
              marginTop: "4px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            This week
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
          padding: "24px 28px 12px",
        }}
      >
        {monthName}
      </div>
      <div style={{ padding: "0 28px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "4px",
            marginBottom: "4px",
          }}
        >
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                fontSize: "10px",
                color: "var(--ink-muted)",
                fontWeight: 500,
                padding: "4px 0",
              }}
            >
              {d}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "4px",
          }}
        >
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = day === today;
            const haEntry = entryDates.has(day);
            return (
              <div
                key={day}
                style={{
                  aspectRatio: "1",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  background: isToday
                    ? "var(--ink)"
                    : haEntry
                      ? "var(--accent-light)"
                      : "transparent",
                  color: isToday
                    ? "white"
                    : haEntry
                      ? "var(--accent)"
                      : "var(--ink-soft)",
                  fontWeight: isToday || haEntry ? 500 : 400,
                }}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
          padding: "24px 28px 12px",
        }}
      >
        Recent entries
      </div>
      <div style={{ padding: "0 28px 24px" }}>
        {(!entries || entries.length === 0) && (
          <p style={{ color: "var(--ink-muted)", fontSize: "14px" }}>
            No entries yet. Start journaling!
          </p>
        )}
        {(entries as JournalEntry[] | null)?.map((entry) => (
          <div
            key={entry.id}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "16px",
              marginBottom: "10px",
              border: "1px solid var(--cream-dark)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "15px",
                color: "var(--ink)",
                marginBottom: "4px",
              }}
            >
              {entry.title}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--ink-muted)",
                lineHeight: 1.5,
              }}
            >
              {entry.content.slice(0, 80)}...
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--ink-muted)",
                marginTop: "8px",
              }}
            >
              {new Date(entry.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
