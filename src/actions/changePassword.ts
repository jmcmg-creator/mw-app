"use server";

import { createClient } from "@/lib/supabase/server";

export type ChangePasswordResult = { ok: true } | { ok: false; error: string };

/**
 * Updates the currently logged-in user's password via Supabase Auth.
 * The client must already be authenticated — there's no current-password
 * verification (Supabase manages session-based reauth on the cookie).
 */
export async function changePassword(
  newPassword: string,
): Promise<ChangePasswordResult> {
  if (newPassword.length < 6) {
    return {
      ok: false,
      error: "Le mot de passe doit faire au moins 6 caractères.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Session expirée. Reconnecte-toi." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
