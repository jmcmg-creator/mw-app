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
  hasMarketPrice: boolean;
  dividends: number;
};

export function buildHolding(asset: RawAsset): Holding {
  const quantity = toNumber(asset.cachedQuantity);
  const pru = toNumber(asset.cachedPru);
  const marketPrice = toNumber(asset.cachedMarketPrice);
  const invested = quantity * pru;
  const hasMarketPrice = marketPrice > 0;
  const marketValue = hasMarketPrice ? quantity * marketPrice : 0;
  const unrealizedPnl = hasMarketPrice ? marketValue - invested : 0;
  const unrealizedPnlPct =
    hasMarketPrice && invested > 0 ? unrealizedPnl / invested : 0;

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
    hasMarketPrice,
    dividends,
  };
}

export type PortfolioMetrics = {
  totalValue: number;
  totalInvested: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  hasAnyMarketPrice: boolean;
  pricedCoverage: number;
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
  const hasAnyMarketPrice = holdings.some((h) => h.hasMarketPrice);
  // Fall back to cost basis on holdings without a live market price so the
  // portfolio total still reflects the position size.
  const totalValue = holdings.reduce(
    (s, h) => s + (h.hasMarketPrice ? h.marketValue : h.invested),
    0,
  );
  // Only count the PnL of holdings that actually have a market price — the
  // others are unknown and shouldn't be assumed flat against cost basis.
  const pricedInvested = holdings.reduce(
    (s, h) => s + (h.hasMarketPrice ? h.invested : 0),
    0,
  );
  const pricedValue = holdings.reduce(
    (s, h) => s + (h.hasMarketPrice ? h.marketValue : 0),
    0,
  );
  const unrealizedPnl = pricedValue - pricedInvested;
  const unrealizedPnlPct =
    pricedInvested > 0 ? unrealizedPnl / pricedInvested : 0;
  const pricedCoverage = totalInvested > 0 ? pricedInvested / totalInvested : 0;
  const totalDividends = holdings.reduce((s, h) => s + h.dividends, 0);

  const byType: Record<string, number> = {};
  const byCurrency: Record<string, number> = {};
  for (const h of holdings) {
    const value = h.hasMarketPrice ? h.marketValue : h.invested;
    byType[h.type] = (byType[h.type] ?? 0) + value;
    byCurrency[h.currency] = (byCurrency[h.currency] ?? 0) + value;
  }

  const withPerf = holdings.filter((h) => h.hasMarketPrice && h.invested > 0);
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
    hasAnyMarketPrice,
    pricedCoverage,
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
