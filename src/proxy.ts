import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon\\.ico|favicon-16x16\\.png|favicon-32x32\\.png|apple-touch-icon\\.png|site\\.webmanifest|android-chrome-192x192\\.png|android-chrome-512x512\\.png|robots\\.txt|sitemap\\.xml|api/|auth).*)",
  ],
};
