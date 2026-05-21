"use server";

import { cookies } from "next/headers";

import { MFA_COOKIE_MAX_AGE, MFA_COOKIE_NAME } from "@/lib/mfa";

/** Records a successful 2FA verification in a long-lived cookie. */
export async function recordMfaVerified(): Promise<void> {
  const store = await cookies();
  store.set(MFA_COOKIE_NAME, String(Date.now()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MFA_COOKIE_MAX_AGE,
  });
}
