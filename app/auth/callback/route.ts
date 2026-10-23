import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles OAuth and email-confirmation redirects (PKCE code exchange).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";
  // Only allow same-site relative paths (prevents open redirects)
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const base =
        process.env.NODE_ENV !== "development" && forwardedHost
          ? `https://${forwardedHost}`
          : origin;
      return NextResponse.redirect(`${base}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Could not sign you in.")}`);
}
