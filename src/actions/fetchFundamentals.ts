"use server";

import { cache } from "react";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export type Fundamentals = {
  symbol: string;
  sector: string | null;
  industry: string | null;
  marketCap: number | null;
  trailingPE: number | null;
  forwardPE: number | null;
  debtToEquity: number | null;
  operatingCashflow: number | null;
  freeCashflow: number | null;
  ytdReturn: number | null;
  fiftyTwoWeekLow: number | null;
  fiftyTwoWeekHigh: number | null;
  currency: string | null;
};

/**
 * Fetches sector, valuation and balance-sheet ratios for a symbol.
 * Cached per render via React's request-level cache.
 */
export const fetchFundamentals = cache(
  async (symbol: string): Promise<Fundamentals | null> => {
    const trimmed = symbol.trim();
    if (!trimmed) return null;

    try {
      const result = await yahooFinance.quoteSummary(trimmed, {
        modules: ["summaryProfile", "summaryDetail", "financialData", "price"],
      });

      const profile = result.summaryProfile;
      const detail = result.summaryDetail;
      const fin = result.financialData;
      const price = result.price;

      const ytd = computeYtdReturn(trimmed).catch(() => null);

      return {
        symbol: trimmed,
        sector: profile?.sectorDisp ?? profile?.sector ?? null,
        industry: profile?.industryDisp ?? profile?.industry ?? null,
        marketCap: detail?.marketCap ?? price?.marketCap ?? null,
        trailingPE: detail?.trailingPE ?? null,
        forwardPE: detail?.forwardPE ?? null,
        debtToEquity: fin?.debtToEquity ?? null,
        operatingCashflow: fin?.operatingCashflow ?? null,
        freeCashflow: fin?.freeCashflow ?? null,
        ytdReturn: detail?.ytdReturn ?? (await ytd),
        fiftyTwoWeekLow: detail?.fiftyTwoWeekLow ?? null,
        fiftyTwoWeekHigh: detail?.fiftyTwoWeekHigh ?? null,
        currency: price?.currency ?? null,
      };
    } catch {
      return null;
    }
  },
);

/** Computes YTD return from chart history when Yahoo doesn't return it directly. */
async function computeYtdReturn(symbol: string): Promise<number | null> {
  try {
    const start = new Date(new Date().getFullYear(), 0, 1);
    const result = await yahooFinance.chart(symbol, {
      period1: start,
      interval: "1d",
    });
    const quotes = result.quotes.filter(
      (q) => typeof q.close === "number" && Number.isFinite(q.close),
    );
    if (quotes.length < 2) return null;
    const first = quotes[0].close as number;
    const last = quotes[quotes.length - 1].close as number;
    if (!first) return null;
    return (last - first) / first;
  } catch {
    return null;
  }
}
