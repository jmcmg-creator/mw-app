import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { MFA_COOKIE_NAME, isMfaCookieFresh } from "@/lib/mfa";

/**
 * Refreshes the Supabase auth session on every request, exposes the current
 * user, and computes whether a fresh 2FA challenge is required.
 *
 * `needsMfa` is true when:
 *  - the user has a TOTP factor enrolled but the current session is still aal1, OR
 *  - the user is already aal2 but the `mfa_verified_at` cookie is missing/stale.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let needsMfa = false;
  if (user) {
    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal) {
      const has2fa = aal.nextLevel === "aal2";
      const current2fa = aal.currentLevel === "aal2";
      if (has2fa && !current2fa) {
        // 2FA configured but not yet verified in this session.
        needsMfa = true;
      } else if (current2fa) {
        // Re-prompt after the inactivity window.
        const cookie = request.cookies.get(MFA_COOKIE_NAME)?.value;
        if (!isMfaCookieFresh(cookie)) {
          needsMfa = true;
        }
      }
    }
  }

  return { response, user, needsMfa };
}
