/**
 * Persistent cookie that records the last successful 2FA verification.
 * Used by the middleware to decide when to re-prompt for the TOTP code.
 */
export const MFA_COOKIE_NAME = "mfa_verified_at";

/** Re-prompt for 2FA after this many days of inactivity. */
export const MFA_INACTIVITY_DAYS = 7;

export const MFA_INACTIVITY_MS = MFA_INACTIVITY_DAYS * 24 * 60 * 60 * 1000;

/** Cookie lifetime — long, so a returning browser doesn't get a fresh prompt. */
export const MFA_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

export function isMfaCookieFresh(value: string | undefined | null): boolean {
  if (!value) return false;
  const ts = Number(value);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < MFA_INACTIVITY_MS;
}
