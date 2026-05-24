import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 30 days, matches the middleware. Without this @supabase/ssr emits session
// cookies that vanish when the browser closes.
const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Supabase client for use in Server Components, Server Actions and routes. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, {
                ...options,
                maxAge: options?.maxAge ?? SESSION_COOKIE_MAX_AGE_SECONDS,
              });
            }
          } catch {
            // Called from a Server Component — ignored: the middleware
            // refreshes the session cookie on every request.
          }
        },
      },
    },
  );
}
