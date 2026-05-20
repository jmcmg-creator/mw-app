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
  currency: Currency;
  date: string | null;
};

export type ImportResult = {
  assetsCreated: number;
  assetsExisting: number;
  transactions: number;
};

/**
 * Bulk-imports positions from a parsed portfolio statement. Existing
 * assets are matched by ISIN then ticker; new ones are created. Each
 * position creates a BUY transaction and the PRU is recomputed.
 */
export async function importPortfolio(
  positions: PortfolioImportInput[],
): Promise<ImportResult> {
  const userId = await requireUserId();
  const portfolio = await getDefaultPortfolio(userId);

  const result: ImportResult = {
    assetsCreated: 0,
    assetsExisting: 0,
    transactions: 0,
  };
  const touched = new Set<string>();

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
    touched.add(asset.id);
    result.transactions += 1;
  }

  for (const id of touched) {
    await calculateStockPerformance(id);
  }
  return result;
}
