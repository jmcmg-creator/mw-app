import { toNumber } from "@/lib/format";

export type RawAsset = {
  id: string;
  name: string;
  type: string;
  currency: string;
  ticker: string | null;
  cachedQuantity: unknown;
  cachedPru: unknown;
  cachedMarketPrice: unknown;
  transactions: { type: string; amountInBaseCurrency: unknown; date: Date }[];
};

export type Holding = {
  id: string;
  name: string;
  type: string;
  currency: string;
  ticker: string | null;
  quantity: number;
  pru: number;
  marketPrice: number;
  invested: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  dividends: number;
};

export function buildHolding(asset: RawAsset): Holding {
  const quantity = toNumber(asset.cachedQuantity);
  const pru = toNumber(asset.cachedPru);
  const marketPrice = toNumber(asset.cachedMarketPrice);
  const invested = quantity * pru;
  const marketValue = quantity * marketPrice;
  const unrealizedPnl = marketValue - invested;
  const unrealizedPnlPct = invested > 0 ? unrealizedPnl / invested : 0;

  let dividends = 0;
  for (const tx of asset.transactions) {
    if (tx.type === "DIVIDEND") {
      dividends += toNumber(tx.amountInBaseCurrency);
    }
  }

  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    currency: asset.currency,
    ticker: asset.ticker,
    quantity,
    pru,
    marketPrice,
    invested,
    marketValue,
    unrealizedPnl,
    unrealizedPnlPct,
    dividends,
  };
}

export type PortfolioMetrics = {
  totalValue: number;
  totalInvested: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  totalDividends: number;
  byType: Record<string, number>;
  byCurrency: Record<string, number>;
  winners: Holding[];
  losers: Holding[];
  topByValue: Holding[];
  topConcentration: number;
  hhi: number;
};

export function computePortfolioMetrics(holdings: Holding[]): PortfolioMetrics {
  const totalInvested = holdings.reduce((s, h) => s + h.invested, 0);
  const computedValue = holdings.reduce((s, h) => s + h.marketValue, 0);
  // Fall back to cost basis when no market price is known.
  const totalValue =
    computedValue > 0
      ? holdings.reduce(
          (s, h) => s + (h.marketValue > 0 ? h.marketValue : h.invested),
          0,
        )
      : totalInvested;
  const unrealizedPnl = totalValue - totalInvested;
  const unrealizedPnlPct =
    totalInvested > 0 ? unrealizedPnl / totalInvested : 0;
  const totalDividends = holdings.reduce((s, h) => s + h.dividends, 0);

  const byType: Record<string, number> = {};
  const byCurrency: Record<string, number> = {};
  for (const h of holdings) {
    const value = h.marketValue > 0 ? h.marketValue : h.invested;
    byType[h.type] = (byType[h.type] ?? 0) + value;
    byCurrency[h.currency] = (byCurrency[h.currency] ?? 0) + value;
  }

  const withPerf = holdings.filter((h) => h.invested > 0);
  const sortedByPct = [...withPerf].sort(
    (a, b) => b.unrealizedPnlPct - a.unrealizedPnlPct,
  );
  const winners = sortedByPct.slice(0, 3);
  const losers = [...sortedByPct].reverse().slice(0, 3);

  const sortedByValue = [...holdings].sort(
    (a, b) =>
      (b.marketValue > 0 ? b.marketValue : b.invested) -
      (a.marketValue > 0 ? a.marketValue : a.invested),
  );
  const topByValue = sortedByValue.slice(0, 5);
  const top5Sum = topByValue.reduce(
    (s, h) => s + (h.marketValue > 0 ? h.marketValue : h.invested),
    0,
  );
  const topConcentration = totalValue > 0 ? top5Sum / totalValue : 0;

  const hhi = holdings.reduce((s, h) => {
    const value = h.marketValue > 0 ? h.marketValue : h.invested;
    const w = totalValue > 0 ? value / totalValue : 0;
    return s + w * w;
  }, 0);

  return {
    totalValue,
    totalInvested,
    unrealizedPnl,
    unrealizedPnlPct,
    totalDividends,
    byType,
    byCurrency,
    winners,
    losers,
    topByValue,
    topConcentration,
    hhi,
  };
}
