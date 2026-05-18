"use server";

import { prisma } from "@/lib/prisma";

/** Status of a downside protection barrier relative to the underlying. */
export type BarrierStatus = {
  /** Barrier expressed as a fraction of the strike (e.g. 0.6 = 60%). */
  barrierPct: number;
  /** Price level of the barrier (strike * barrierPct). */
  level: number;
  /** Underlying distance to the barrier: price / level - 1. */
  distance: number;
  breached: boolean;
  /** Not breached, but within the alert threshold above the barrier. */
  threatened: boolean;
};

export type StructuredProductEvaluation = {
  assetId: string;
  underlyingTicker: string;
  underlyingPrice: number;
  strikePrice: number;
  /** Underlying performance vs strike: price / strike - 1. */
  performanceVsStrike: number;
  capitalBarrier: BarrierStatus | null;
  couponBarrier: BarrierStatus | null;
  autocall: {
    barrierPct: number;
    level: number;
    distance: number;
    triggered: boolean;
  } | null;
  /** The coupon condition is met at the current underlying level. */
  couponDue: boolean;
  /** The capital protection barrier is breached. */
  capitalAtRisk: boolean;
  nextObservationDate: Date | null;
};

function num(value: unknown): number {
  if (value == null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function downsideBarrier(
  price: number,
  strike: number,
  barrierPct: number,
  threshold: number,
): BarrierStatus {
  const level = strike * barrierPct;
  const distance = level > 0 ? price / level - 1 : 0;
  const breached = price < level;
  return {
    barrierPct,
    level,
    distance,
    breached,
    threatened: !breached && distance <= threshold,
  };
}

/**
 * Evaluates a structured product against its underlying: compares the
 * underlying price to the strike and reports whether the capital, coupon
 * and autocall barriers are safe, threatened or breached.
 *
 * The underlying price must be supplied by the caller (e.g. fetched via
 * yahoo-finance2 from `underlying_ticker`).
 */
export async function evaluateStructuredProduct(
  assetId: string,
  underlyingPrice: number,
  options: { threatenedThresholdPct?: number } = {},
): Promise<StructuredProductEvaluation> {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: {
      structuredDetails: {
        include: { observationDates: { orderBy: { observationDate: "asc" } } },
      },
    },
  });
  if (!asset?.structuredDetails) {
    throw new Error(`Structured product ${assetId} not found.`);
  }

  const details = asset.structuredDetails;
  const strike = num(details.strike_price);
  const threshold = options.threatenedThresholdPct ?? 0.05;

  const performanceVsStrike = strike > 0 ? underlyingPrice / strike - 1 : 0;

  const capitalBarrier =
    details.capital_barrier == null
      ? null
      : downsideBarrier(
          underlyingPrice,
          strike,
          Number(details.capital_barrier),
          threshold,
        );

  const couponBarrier =
    details.coupon_barrier == null
      ? null
      : downsideBarrier(
          underlyingPrice,
          strike,
          Number(details.coupon_barrier),
          threshold,
        );

  let autocall: StructuredProductEvaluation["autocall"] = null;
  if (details.autocall_barrier != null) {
    const barrierPct = Number(details.autocall_barrier);
    const level = strike * barrierPct;
    autocall = {
      barrierPct,
      level,
      distance: level > 0 ? underlyingPrice / level - 1 : 0,
      triggered: underlyingPrice >= level,
    };
  }

  const now = Date.now();
  const nextObservation = details.observationDates.find(
    (observation) =>
      observation.outcome === "PENDING" &&
      observation.observationDate.getTime() >= now,
  );

  return {
    assetId,
    underlyingTicker: details.underlying_ticker,
    underlyingPrice,
    strikePrice: strike,
    performanceVsStrike,
    capitalBarrier,
    couponBarrier,
    autocall,
    couponDue: couponBarrier ? !couponBarrier.breached : true,
    capitalAtRisk: capitalBarrier ? capitalBarrier.breached : false,
    nextObservationDate: nextObservation?.observationDate ?? null,
  };
}
