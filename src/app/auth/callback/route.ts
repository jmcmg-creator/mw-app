import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Exchanges email-confirmation / recovery codes for a session.
 *
 * Supabase appends `type=recovery` to the link in password-reset emails,
 * so we route those to /reset-password (a one-time form that calls
 * supabase.auth.updateUser with the new password) instead of sending the
 * user straight to /dashboard while still in a recovery-only session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const requestedNext = searchParams.get("next");

  const defaultNext = type === "recovery" ? "/reset-password" : "/dashboard";
  const next = requestedNext ?? defaultNext;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
