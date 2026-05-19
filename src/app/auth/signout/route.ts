import { clearSupabaseAuthCookies } from "@/lib/supabase/cookies";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}/auth/login`, { status: 303 });

  const supabase = createRouteHandlerClient(request, response);
  await supabase.auth.signOut();
  clearSupabaseAuthCookies(request, response);

  return response;
}
