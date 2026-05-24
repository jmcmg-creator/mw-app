/**
 * Projects future cash flows from bonds and structured products.
 *
 * - Bonds: every remaining coupon plus the redemption at maturity, derived
 *   from BondDetails (couponRate, couponFrequency, nominalAmount).
 * - Structured products: each pending ProductObservationDate (i.e. status
 *   PENDING, not yet observed). Expected coupon = nominalAmount *
 *   coupon_rate per observation.
 */

import { toNumber } from "@/lib/format";
import { periodCouponAmount, projectCouponDates } from "@/lib/bond";

export type CashFlowKind =
  | "BOND_COUPON"
  | "BOND_REDEMPTION"
  | "STRUCTURED_OBSERVATION";

export type CashFlow = {
  assetId: string;
  assetName: string;
  assetType: "OBLIGATION" | "STRUCTURE";
  currency: string;
  date: Date;
  kind: CashFlowKind;
  amount: number;
  /** Whether the amount is certain (contractual coupon) or conditional
   * (structured product coupon — pays only if barrier holds). */
  conditional: boolean;
};

type BondAssetInput = {
  id: string;
  name: string;
  currency: string;
  bondDetails: {
    couponRate: unknown;
    couponFrequency:
      | "ANNUAL"
      | "SEMI_ANNUAL"
      | "QUARTERLY"
      | "MONTHLY"
      | "ZERO_COUPON";
    nominalAmount: unknown;
    maturityDate: Date;
  } | null;
  cachedQuantity: unknown;
  cachedPru: unknown;
};

type StructuredAssetInput = {
  id: string;
  name: string;
  currency: string;
  structuredDetails: {
    coupon_rate: unknown;
    nominalAmount: unknown;
    maturityDate: Date | null;
    observationDates: {
      observationDate: Date;
      outcome: string;
      couponPaid: unknown;
    }[];
  } | null;
  cachedQuantity: unknown;
  cachedPru: unknown;
};

export function projectBondCashFlows(
  asset: BondAssetInput,
  from: Date = new Date(),
): CashFlow[] {
  const bd = asset.bondDetails;
  if (!bd) return [];
  // Nominal: fall back to invested (qty * PRU) when not stored explicitly.
  const nominal =
    toNumber(bd.nominalAmount) ||
    toNumber(asset.cachedQuantity) * toNumber(asset.cachedPru);
  if (nominal <= 0) return [];
  const rate = toNumber(bd.couponRate);
  const dates = projectCouponDates(bd.maturityDate, bd.couponFrequency, from);
  if (dates.length === 0) return [];

  const flows: CashFlow[] = [];
  const couponAmount = periodCouponAmount(nominal, rate, bd.couponFrequency);
  const maturityMs = bd.maturityDate.getTime();
  for (const d of dates) {
    if (couponAmount > 0) {
      flows.push({
        assetId: asset.id,
        assetName: asset.name,
        assetType: "OBLIGATION",
        currency: asset.currency,
        date: d,
        kind: "BOND_COUPON",
        amount: couponAmount,
        conditional: false,
      });
    }
    if (d.getTime() === maturityMs) {
      flows.push({
        assetId: asset.id,
        assetName: asset.name,
        assetType: "OBLIGATION",
        currency: asset.currency,
        date: d,
        kind: "BOND_REDEMPTION",
        amount: nominal,
        conditional: false,
      });
    }
  }
  return flows;
}

export function projectStructuredCashFlows(
  asset: StructuredAssetInput,
  from: Date = new Date(),
): CashFlow[] {
  const sd = asset.structuredDetails;
  if (!sd) return [];
  const nominal =
    toNumber(sd.nominalAmount) ||
    toNumber(asset.cachedQuantity) * toNumber(asset.cachedPru);
  if (nominal <= 0) return [];
  const rate = toNumber(sd.coupon_rate);
  const expected = nominal * rate;
  return sd.observationDates
    .filter((o) => o.outcome === "PENDING" && o.observationDate > from)
    .map((o) => ({
      assetId: asset.id,
      assetName: asset.name,
      assetType: "STRUCTURE" as const,
      currency: asset.currency,
      date: o.observationDate,
      kind: "STRUCTURED_OBSERVATION" as const,
      amount: toNumber(o.couponPaid) || expected,
      conditional: true,
    }));
}

export type CashFlowMonth = {
  /** Key in YYYY-MM. */
  key: string;
  label: string;
  flows: CashFlow[];
  total: number;
};

const MONTH_LABEL = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
});

export function groupByMonth(flows: CashFlow[]): CashFlowMonth[] {
  const buckets = new Map<string, CashFlowMonth>();
  for (const f of flows) {
    const key = `${f.date.getUTCFullYear()}-${String(
      f.date.getUTCMonth() + 1,
    ).padStart(2, "0")}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        key,
        label: MONTH_LABEL.format(f.date),
        flows: [],
        total: 0,
      };
      buckets.set(key, bucket);
    }
    bucket.flows.push(f);
    bucket.total += f.amount;
  }
  for (const bucket of buckets.values()) {
    bucket.flows.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  return [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key));
}
