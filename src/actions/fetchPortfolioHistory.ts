"use server";

import YahooFinance from "yahoo-finance2";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { toNumber } from "@/lib/format";

const yahooFinance = new YahooFinance();

export type HistoryPoint = { t: number; v: number };
export type Period = "1y" | "3y" | "5y";

const PERIOD_DAYS: Record<Period, number> = {
  "1y": 365,
  "3y": 1095,
  "5y": 1825,
};

/** Computes portfolio market value at each trading day over the given period. */
export async function fetchPortfolioHistory(
  period: Period = "1y",
): Promise<HistoryPoint[]> {
  const userId = await requireUserId();
  const days = PERIOD_DAYS[period];
  const period1 = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const assets = await prisma.asset.findMany({
    where: { portfolio: { userId }, ticker: { not: null } },
    select: {
      ticker: true,
      transactions: {
        where: { type: { in: ["BUY", "SELL"] }, quantity: { not: null } },
        orderBy: { date: "asc" },
        select: { type: true, date: true, quantity: true },
      },
    },
  });

  if (assets.length === 0) return [];

  // Fetch historical prices for all tickers in parallel.
  const resolved = await Promise.all(
    assets.map(async (asset) => {
      try {
        const result = await yahooFinance.chart(asset.ticker!, {
          period1,
          interval: "1d",
        });
        const prices: Record<string, number> = {};
        for (const q of result.quotes ?? []) {
          if (q.close != null) {
            prices[q.date.toISOString().slice(0, 10)] = q.close;
          }
        }
        return { asset, prices };
      } catch {
        return null;
      }
    }),
  );

  const valid = resolved.filter(Boolean) as {
    asset: (typeof assets)[0];
    prices: Record<string, number>;
  }[];

  if (valid.length === 0) return [];

  const allDates = new Set<string>();
  for (const { prices } of valid) {
    for (const d of Object.keys(prices)) allDates.add(d);
  }
  const sortedDates = Array.from(allDates).sort();

  return sortedDates.map((dateStr) => {
    const date = new Date(dateStr + "T12:00:00Z");
    let total = 0;

    for (const { asset, prices } of valid) {
      // Look up price — fall back to most recent known price before this date.
      let price = prices[dateStr];
      if (price == null) {
        const prev = Object.keys(prices)
          .filter((d) => d <= dateStr)
          .sort();
        if (prev.length > 0) price = prices[prev[prev.length - 1]];
      }
      if (price == null) continue;

      let qty = 0;
      for (const tx of asset.transactions) {
        if (tx.date > date) break;
        const q = toNumber(tx.quantity);
        qty += tx.type === "BUY" ? q : -q;
      }
      if (qty > 0) total += qty * price;
    }

    return { t: date.getTime(), v: total };
  });
}
