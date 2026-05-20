"use server";

import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export type SparklinePoint = { t: number; c: number };

/** Returns the last `days` days of daily closing prices for a ticker. */
export async function fetchSparkline(
  ticker: string,
  days = 30,
): Promise<SparklinePoint[]> {
  const period1 = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  try {
    const result = await yahooFinance.chart(ticker, {
      period1,
      interval: "1d",
    });
    return (result.quotes ?? [])
      .filter((q) => q.close != null)
      .map((q) => ({ t: q.date.getTime(), c: q.close! }));
  } catch {
    return [];
  }
}
