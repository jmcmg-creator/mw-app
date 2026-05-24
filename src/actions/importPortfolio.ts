"use server";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import {
  ACTIVE_PORTFOLIO_COOKIE,
  findOrCreateHolderPortfolio,
  getActivePortfolio,
  type HolderInput,
} from "@/lib/portfolio";
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
  portfolioId: string;
  portfolioCreated: boolean;
  holderName: string | null;
  assetsCreated: number;
  assetsExisting: number;
  transactions: number;
  cashBalances: number;
};

/**
 * Bulk-imports positions from a parsed portfolio statement. The target
 * portfolio is selected based on the detected holder identity: if the doc
 * names a holder (individual or company), the matching portfolio is used
 * (created on first sight), so each holder's positions stay isolated.
 * Existing assets within the portfolio are matched by ISIN then ticker.
 */
export async function importPortfolio(
  positions: PortfolioImportInput[],
  options: {
    cashBalances?: CashImportInput[];
    holder?: HolderInput;
  } = {},
): Promise<ImportResult> {
  const userId = await requireUserId();
  const cashBalances = options.cashBalances ?? [];
  const holder = options.holder;

  const target =
    holder && holder.holderName?.trim()
      ? await findOrCreateHolderPortfolio(userId, holder, {
          name: holder.holderName,
        })
      : await (async () => {
          const current = await getActivePortfolio(userId);
          return {
            id: current.id,
            baseCurrency: current.baseCurrency,
            isNew: false,
          };
        })();

  const result: ImportResult = {
    portfolioId: target.id,
    portfolioCreated: target.isNew,
    holderName: holder?.holderName?.trim() || null,
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
        where: { portfolioId: target.id, isin: position.isin },
      });
      if (found) asset = { id: found.id, currency: found.currency };
    }
    if (!asset && position.ticker) {
      const found = await prisma.asset.findFirst({
        where: { portfolioId: target.id, ticker: position.ticker },
      });
      if (found) asset = { id: found.id, currency: found.currency };
    }
    if (!asset) {
      const created = await prisma.asset.create({
        data: {
          portfolioId: target.id,
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
          portfolioId: target.id,
          currency: cash.currency,
        },
      },
      create: {
        portfolioId: target.id,
        currency: cash.currency,
        amount: cash.amount,
      },
      update: { amount: cash.amount },
    });
    result.cashBalances += 1;
  }

  // Switch the UI to the portfolio we just wrote into.
  const store = await cookies();
  store.set(ACTIVE_PORTFOLIO_COOKIE, target.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return result;
}
