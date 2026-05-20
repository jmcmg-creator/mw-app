"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { fetchQuote } from "@/actions/fetchQuote";
import { calculateStockPerformance } from "@/actions/calculateStockPerformance";

/** Refreshes every tracked market price for the current user's portfolios. */
export async function refreshAllPrices(): Promise<{ updated: number }> {
  const userId = await requireUserId();

  const assets = await prisma.asset.findMany({
    where: { portfolio: { userId }, ticker: { not: null } },
    select: { id: true, ticker: true },
  });

  const results = await Promise.all(
    assets.map(async (asset) => {
      if (!asset.ticker) return false;
      const quote = await fetchQuote(asset.ticker);
      if (!quote) return false;
      await calculateStockPerformance(asset.id, { marketPrice: quote.price });
      return true;
    }),
  );

  return { updated: results.filter(Boolean).length };
}
