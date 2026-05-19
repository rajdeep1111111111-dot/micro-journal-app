import type { AuthError } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export function isStaleSessionError(
  error: Pick<AuthError, "code" | "message"> | null | undefined,
): boolean {
  if (!error) return false;
  return (
    error.code === "refresh_token_not_found" ||
    error.message.includes("Refresh Token Not Found") ||
    error.message.includes("Invalid Refresh Token")
  );
}

/** Returns the current user; clears auth cookies if the refresh token is invalid. */
export async function getUserWithSessionCleanup(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && isStaleSessionError(error)) {
    await supabase.auth.signOut();
    return { user: null, clearedStaleSession: true };
  }

  return { user: user ?? null, clearedStaleSession: false };
}
