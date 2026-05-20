import { toNumber } from "@/lib/format";
import type { HistoricalPoint } from "@/actions/fetchHistorical";

export type HistoryAsset = {
  id: string;
  ticker: string | null;
  currency: string;
  transactions: {
    type: string;
    date: Date;
    quantity: unknown;
    exchangeRate: unknown;
  }[];
  history: HistoricalPoint[];
};

export type FxRates = Record<string, number>;

/**
 * Builds a portfolio value time series by aggregating per-asset historical
 * prices weighted by the quantity actually held at each date.
 *
 * The quantity at date `t` is reconstructed from the transaction log: every
 * BUY before `t` adds, every SELL subtracts. Prices come back in each
 * asset's native currency, so we convert to base currency using the latest
 * exchange rate stored on a transaction (best-effort — these tend to be
 * stable enough for a multi-year visual).
 */
export function buildPortfolioHistory(
  assets: HistoryAsset[],
  baseCurrency: string,
): { t: number; value: number }[] {
  // Union of all timestamps so the curve has a point everywhere any asset moves.
  const tset = new Set<number>();
  for (const a of assets) {
    for (const p of a.history) tset.add(p.t);
  }
  if (tset.size === 0) return [];

  const timestamps = [...tset].sort((a, b) => a - b);

  // Per-asset: pre-compute (sorted transactions, fx rate, sorted history map).
  const prepared = assets.map((a) => {
    const txs = [...a.transactions]
      .filter((tx) => tx.type === "BUY" || tx.type === "SELL")
      .sort((x, y) => x.date.getTime() - y.date.getTime())
      .map((tx) => ({
        ts: tx.date.getTime(),
        signed: (tx.type === "BUY" ? 1 : -1) * Math.abs(toNumber(tx.quantity)),
      }));

    const fx =
      a.currency === baseCurrency ? 1 : findLatestFxRate(a.transactions) || 1;

    return { txs, fx, history: a.history, currency: a.currency };
  });

  const result: { t: number; value: number }[] = [];

  for (const t of timestamps) {
    let total = 0;
    for (const a of prepared) {
      // Quantity at t = sum of signed transactions with ts <= t.
      let qty = 0;
      for (const tx of a.txs) {
        if (tx.ts <= t) qty += tx.signed;
        else break;
      }
      if (qty <= 0) continue;

      const price = priceAt(a.history, t);
      if (price == null) continue;

      total += qty * price * a.fx;
    }
    result.push({ t, value: total });
  }

  // Drop the leading zeros from before any holdings existed.
  const firstNonZero = result.findIndex((p) => p.value > 0);
  return firstNonZero >= 0 ? result.slice(firstNonZero) : result;
}

/** Last close at or before `t`, using linear scan (history is sorted). */
function priceAt(history: HistoricalPoint[], t: number): number | null {
  let last: number | null = null;
  for (const p of history) {
    if (p.t > t) break;
    last = p.close;
  }
  return last;
}

function findLatestFxRate(
  transactions: HistoryAsset["transactions"],
): number | null {
  for (let i = transactions.length - 1; i >= 0; i--) {
    const r = toNumber(transactions[i].exchangeRate);
    if (r > 0) return r;
  }
  return null;
}
