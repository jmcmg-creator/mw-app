/**
 * Bond-specific helpers: parse the "X% DDMMYYYY" pattern that brokers
 * encode into the asset name (e.g. "Absol ASD 243 0% 29082025") so we
 * can pre-fill the BondDetails fields without manual entry.
 */

import type { CouponFrequency } from "@/generated/prisma/enums";

export type ParsedBondName = {
  couponRate: number; // fraction, e.g. 0.04 for 4%
  maturityDate: Date;
};

const COUPON_AND_DATE = /(\d+(?:[.,]\d+)?)\s*%\s+(\d{2})(\d{2})(\d{4})/;
const COUPON_AND_SLASH_DATE =
  /(\d+(?:[.,]\d+)?)\s*%\s+(\d{2})[/-](\d{2})[/-](\d{4})/;

/**
 * Try to extract coupon + maturity from a bond name.
 * Accepts "X% DDMMYYYY" and "X% DD/MM/YYYY" or "DD-MM-YYYY".
 */
export function parseBondName(name: string): ParsedBondName | null {
  const m = name.match(COUPON_AND_SLASH_DATE) ?? name.match(COUPON_AND_DATE);
  if (!m) return null;
  const rate = Number(m[1].replace(",", ".")) / 100;
  const day = Number(m[2]);
  const month = Number(m[3]);
  const year = Number(m[4]);
  if (!Number.isFinite(rate) || rate < 0 || rate > 1) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return null;
  return { couponRate: rate, maturityDate: date };
}

const FREQUENCY_MONTHS: Record<CouponFrequency, number> = {
  ANNUAL: 12,
  SEMI_ANNUAL: 6,
  QUARTERLY: 3,
  MONTHLY: 1,
  ZERO_COUPON: 0,
};

/**
 * Walks backwards from the maturity date by the coupon period until landing
 * just after `from`. Returns every payment date strictly after `from` up to
 * and including `maturity`.
 *
 * A zero-coupon bond only pays at maturity, so we return [maturity] when
 * applicable. For a non-zero coupon bond we always include the maturity
 * date because that's when the last coupon is paid alongside the redemption.
 */
export function projectCouponDates(
  maturity: Date,
  frequency: CouponFrequency,
  from: Date,
): Date[] {
  if (maturity <= from) return [];
  if (frequency === "ZERO_COUPON") return [maturity];

  const monthsPerCoupon = FREQUENCY_MONTHS[frequency];
  const dates: Date[] = [];
  // Walk back from maturity in coupon-sized steps, but stop as soon as the
  // candidate date falls on or before `from`. We need a hard cap because a
  // misconfigured frequency on a far-future bond could otherwise loop a lot.
  const MAX_STEPS = 2000;
  let cursor = new Date(maturity);
  for (let i = 0; i < MAX_STEPS; i++) {
    if (cursor <= from) break;
    dates.push(new Date(cursor));
    cursor = shiftMonths(cursor, -monthsPerCoupon);
  }
  return dates.reverse();
}

function shiftMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const targetMonth = d.getUTCMonth() + months;
  const newDate = new Date(
    Date.UTC(
      d.getUTCFullYear(),
      targetMonth,
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds(),
    ),
  );
  return newDate;
}

/**
 * Per-period coupon amount. Annual rate divided by the number of payments
 * per year and applied to the nominal amount. Zero-coupon bonds have no
 * intermediate payment.
 */
export function periodCouponAmount(
  nominal: number,
  annualRate: number,
  frequency: CouponFrequency,
): number {
  if (frequency === "ZERO_COUPON") return 0;
  const periodsPerYear = 12 / FREQUENCY_MONTHS[frequency];
  return (nominal * annualRate) / periodsPerYear;
}
