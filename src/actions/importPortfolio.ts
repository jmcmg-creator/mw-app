"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { getDefaultPortfolio } from "@/lib/portfolio";
import { calculateStockPerformance } from "@/actions/calculateStockPerformance";
import type { AssetType, Currency } from "@/generated/prisma/enums";

export type PortfolioImportInput = {
  name: string;
  ticker: string | null;
  isin: string | null;
  type: AssetType | null;
  quantity: number;
  unitPrice: number | null;
  /** Last known market price — seeds `cachedMarketPrice` on creation. */
  currentPrice?: number | null;
  currency: Currency;
  date: string | null;
};

export type CashImportInput = {
  currency: Currency;
  amount: number;
};

export type ImportResult = {
  assetsCreated: number;
  assetsExisting: number;
  transactions: number;
  cashBalances: number;
};

/**
 * Bulk-imports positions from a parsed portfolio statement. Existing
 * assets are matched by ISIN then ticker; new ones are created. Each
 * position creates a BUY transaction and the PRU is recomputed.
 */
export async function importPortfolio(
  positions: PortfolioImportInput[],
  cashBalances: CashImportInput[] = [],
): Promise<ImportResult> {
  const userId = await requireUserId();
  const portfolio = await getDefaultPortfolio(userId);

  const result: ImportResult = {
    assetsCreated: 0,
    assetsExisting: 0,
    transactions: 0,
    cashBalances: 0,
  };
  const touched = new Map<string, number | null>();

  for (const position of positions) {
    if (!position.name?.trim() || position.quantity <= 0) continue;

    let asset: { id: string; currency: Currency } | null = null;
    if (position.isin) {
      const found = await prisma.asset.findFirst({
        where: { portfolioId: portfolio.id, isin: position.isin },
      });
      if (found) asset = { id: found.id, currency: found.currency };
    }
    if (!asset && position.ticker) {
      const found = await prisma.asset.findFirst({
        where: { portfolioId: portfolio.id, ticker: position.ticker },
      });
      if (found) asset = { id: found.id, currency: found.currency };
    }
    if (!asset) {
      const created = await prisma.asset.create({
        data: {
          portfolioId: portfolio.id,
          type: position.type ?? "ACTION",
          name: position.name.trim(),
          ticker: position.ticker?.trim() || null,
          isin: position.isin?.trim() || null,
          currency: position.currency,
        },
      });
      asset = { id: created.id, currency: created.currency };
      result.assetsCreated += 1;
    } else {
      result.assetsExisting += 1;
    }

    const unitPrice = position.unitPrice ?? 0;
    const amount = position.quantity * unitPrice;
    await prisma.transaction.create({
      data: {
        assetId: asset.id,
        type: "BUY",
        date: position.date ? new Date(position.date) : new Date(),
        quantity: position.quantity,
        unitPrice,
        fees: 0,
        currency: asset.currency,
        amount,
        exchangeRate: 1,
        amountInBaseCurrency: amount,
      },
    });
    // Last-seen market price wins; null means "no override".
    const previous = touched.get(asset.id);
    const next =
      position.currentPrice != null && Number.isFinite(position.currentPrice)
        ? position.currentPrice
        : (previous ?? null);
    touched.set(asset.id, next);
    result.transactions += 1;
  }

  for (const [id, marketPrice] of touched) {
    await calculateStockPerformance(
      id,
      marketPrice != null ? { marketPrice } : undefined,
    );
  }

  for (const cash of cashBalances) {
    if (!cash.amount || !Number.isFinite(cash.amount)) continue;
    await prisma.cashBalance.upsert({
      where: {
        portfolioId_currency: {
          portfolioId: portfolio.id,
          currency: cash.currency,
        },
      },
      create: {
        portfolioId: portfolio.id,
        currency: cash.currency,
        amount: cash.amount,
      },
      update: { amount: cash.amount },
    });
    result.cashBalances += 1;
  }

  return result;
}
