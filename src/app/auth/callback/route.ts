import { clearSupabaseAuthCookies } from "@/lib/supabase/cookies";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  const successPath =
    type === "recovery" ? "/auth/reset-password" : "/dashboard";
  const response = NextResponse.redirect(`${origin}${successPath}`);

  if (!code) {
    return response;
  }

  const supabase = createRouteHandlerClient(request, response);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    clearSupabaseAuthCookies(request, response);
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  return response;
}
