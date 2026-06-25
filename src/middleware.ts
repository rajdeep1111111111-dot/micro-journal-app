import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|favicon-96x96\\.png|favicon-16x16\\.png|favicon-32x32\\.png|apple-touch-icon\\.png|web-app-manifest-192x192\\.png|web-app-manifest-512x512\\.png|android-chrome-192x192\\.png|android-chrome-512x512\\.png|og-image\\.png|robots\\.txt|site\\.webmanifest|auth|api|$).*)",
  ],
};
