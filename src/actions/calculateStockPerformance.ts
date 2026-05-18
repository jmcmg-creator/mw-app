"use server";

import { prisma } from "@/lib/prisma";

export type StockPerformance = {
  assetId: string;
  /** Net quantity currently held. */
  quantity: number;
  /** Exact unit cost, fees included, in the portfolio base currency. */
  pru: number;
  /** Cost basis of the current holding (base currency). */
  costBasis: number;
  marketPrice: number;
  marketValue: number;
  /** Market value minus cost basis. */
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  /** Gains/losses already crystallised by past sells. */
  realizedPnl: number;
  dividends: number;
  totalFees: number;
  /** Unrealized + realized + dividends. */
  totalReturn: number;
  totalReturnPct: number;
};

/** Coerces a Prisma Decimal | number | null into a finite number. */
function num(value: unknown): number {
  if (value == null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Recomputes the exact unit cost (PRU, fees included) of a market asset
 * from its full transaction history, refreshes the cached PRU on the asset
 * and returns its absolute and relative performance.
 *
 * Every amount is converted to the portfolio base currency using each
 * transaction's stored exchange rate. The PRU uses a moving-average cost:
 * sells remove cost at the running average and crystallise realized P&L.
 */
export async function calculateStockPerformance(
  assetId: string,
  options: { marketPrice?: number } = {},
): Promise<StockPerformance> {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: { transactions: { orderBy: { date: "asc" } } },
  });
  if (!asset) {
    throw new Error(`Asset ${assetId} not found.`);
  }

  let quantity = 0;
  let costBasis = 0;
  let realizedPnl = 0;
  let dividends = 0;
  let totalFees = 0;

  for (const tx of asset.transactions) {
    const rate = num(tx.exchangeRate) || 1;
    const txQuantity = num(tx.quantity);
    const amountBase = num(tx.amount) * rate;
    const feesBase = num(tx.fees) * rate;

    switch (tx.type) {
      case "BUY": {
        costBasis += amountBase + feesBase;
        quantity += txQuantity;
        totalFees += feesBase;
        break;
      }
      case "SELL": {
        const runningPru = quantity > 0 ? costBasis / quantity : 0;
        const costRemoved = runningPru * txQuantity;
        const proceeds = amountBase - feesBase;
        realizedPnl += proceeds - costRemoved;
        costBasis -= costRemoved;
        quantity -= txQuantity;
        totalFees += feesBase;
        break;
      }
      case "DIVIDEND": {
        dividends += amountBase - feesBase;
        totalFees += feesBase;
        break;
      }
      case "FEE": {
        totalFees += amountBase + feesBase;
        break;
      }
    }
  }

  // A fully-sold position can drift slightly negative through rounding.
  if (quantity <= 0) {
    quantity = 0;
    costBasis = 0;
  }

  const pru = quantity > 0 ? costBasis / quantity : 0;
  const marketPrice = options.marketPrice ?? num(asset.cachedMarketPrice);
  const marketValue = quantity * marketPrice;
  const unrealizedPnl = marketValue - costBasis;
  const unrealizedPnlPct = costBasis > 0 ? unrealizedPnl / costBasis : 0;
  const totalReturn = unrealizedPnl + realizedPnl + dividends;
  const totalReturnPct = costBasis > 0 ? totalReturn / costBasis : 0;

  await prisma.asset.update({
    where: { id: assetId },
    data: {
      cachedPru: pru,
      cachedQuantity: quantity,
      cachedMarketPrice: marketPrice,
      pruUpdatedAt: new Date(),
    },
  });

  return {
    assetId,
    quantity,
    pru,
    costBasis,
    marketPrice,
    marketValue,
    unrealizedPnl,
    unrealizedPnlPct,
    realizedPnl,
    dividends,
    totalFees,
    totalReturn,
    totalReturnPct,
  };
}
