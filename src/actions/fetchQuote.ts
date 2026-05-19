"use server";

import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export type Quote = {
  symbol: string;
  price: number;
  currency: string | null;
};

/** Fetches the current market price for a symbol via Yahoo Finance. */
export async function fetchQuote(symbol: string): Promise<Quote | null> {
  const trimmed = symbol.trim();
  if (!trimmed) return null;

  try {
    const result = await yahooFinance.quote(trimmed);
    const price = result?.regularMarketPrice;
    if (typeof price !== "number" || !Number.isFinite(price)) {
      return null;
    }
    return {
      symbol: trimmed,
      price,
      currency: result?.currency ?? null,
    };
  } catch {
    return null;
  }
}
