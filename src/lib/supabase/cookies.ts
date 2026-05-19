import { NextResponse, type NextRequest } from "next/server";

/** Remove all Supabase auth cookies (Safari needs explicit expiry, not only empty values). */
export function clearSupabaseAuthCookies(
  request: NextRequest,
  response: NextResponse,
) {
  for (const { name } of request.cookies.getAll()) {
    if (name.startsWith("sb-")) {
      response.cookies.set(name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        sameSite: "lax",
      });
    }
  }
}
