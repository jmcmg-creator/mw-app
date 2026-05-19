import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for server-side Storage operations.
 * Bypasses Storage RLS — callers MUST enforce ownership themselves.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
