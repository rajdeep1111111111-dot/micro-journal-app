import { createClient } from "@/lib/supabase/client";

export async function updateStreak(userId: string) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user || user.id !== userId) {
    console.error("Streak update failed: unauthorized user");
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  try {
    const { data: streak, error } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    if (streak.last_entry_date === todayStr) return;

    let newStreak = 1;
    if (streak.last_entry_date === yesterdayStr) {
      newStreak = streak.current_streak + 1;
    }

    await supabase
      .from("streaks")
      .update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, streak.longest_streak),
        last_entry_date: todayStr,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } catch (err) {
    console.error("Streak update failed:", err);
  }
}
