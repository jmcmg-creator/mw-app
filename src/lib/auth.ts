import { createClient } from "@/lib/supabase/server";

/** Returns the authenticated user's id, throwing when not signed in. */
export async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated.");
  }
  return user.id;
}
