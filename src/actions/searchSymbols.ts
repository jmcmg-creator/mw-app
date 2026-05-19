"use server";

import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export type SymbolResult = {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
};

/** Searches securities by name, ticker or ISIN via Yahoo Finance. */
export async function searchSymbols(query: string): Promise<SymbolResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const result = await yahooFinance.search(trimmed);
    const quotes = (result.quotes ?? []) as unknown as Array<{
      symbol?: string;
      shortname?: string;
      longname?: string;
      exchange?: string;
      quoteType?: string;
      typeDisp?: string;
    }>;

    const out: SymbolResult[] = [];
    for (const quote of quotes) {
      if (!quote.symbol) continue;
      out.push({
        symbol: quote.symbol,
        name: quote.shortname ?? quote.longname ?? quote.symbol,
        exchange: quote.exchange ?? "",
        type: quote.typeDisp ?? quote.quoteType ?? "",
      });
      if (out.length >= 8) break;
    }
    return out;
  } catch {
    return [];
  }
}
