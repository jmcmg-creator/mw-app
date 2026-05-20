"use server";

import { cache } from "react";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export type HistoricalPoint = {
  /** Unix epoch in milliseconds for client-side serialization. */
  t: number;
  close: number;
};

export type HistoricalRange = "1y" | "3y" | "5y";

const YEARS: Record<HistoricalRange, number> = { "1y": 1, "3y": 3, "5y": 5 };

/**
 * Fetches close prices for a symbol over the requested range.
 * Returns an empty array on error so the chart silently degrades.
 */
export const fetchHistorical = cache(
  async (
    symbol: string,
    range: HistoricalRange,
  ): Promise<HistoricalPoint[]> => {
    const trimmed = symbol.trim();
    if (!trimmed) return [];

    const period1 = new Date();
    period1.setFullYear(period1.getFullYear() - YEARS[range]);

    // Weekly resolution keeps 5y series small and responsive on mobile.
    const interval = range === "1y" ? "1d" : "1wk";

    try {
      const result = await yahooFinance.chart(trimmed, {
        period1,
        interval,
      });
      const out: HistoricalPoint[] = [];
      for (const q of result.quotes) {
        const close = q.adjclose ?? q.close;
        if (typeof close === "number" && Number.isFinite(close) && q.date) {
          out.push({ t: q.date.getTime(), close });
        }
      }
      return out;
    } catch {
      return [];
    }
  },
);
