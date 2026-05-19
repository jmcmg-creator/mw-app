"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { fetchQuote } from "@/actions/fetchQuote";
import { calculateStockPerformance } from "@/actions/calculateStockPerformance";

export type RefreshResult = {
  ok: boolean;
  price?: number;
  reason?: "no-ticker" | "quote-failed";
};

/** Fetches the live price for an asset's ticker and refreshes its PRU. */
export async function refreshAssetPrice(
  assetId: string,
): Promise<RefreshResult> {
  const userId = await requireUserId();

  const asset = await prisma.asset.findFirst({
    where: { id: assetId, portfolio: { userId } },
  });
  if (!asset) {
    throw new Error("Asset not found.");
  }
  if (!asset.ticker) {
    return { ok: false, reason: "no-ticker" };
  }

  const quote = await fetchQuote(asset.ticker);
  if (!quote) {
    return { ok: false, reason: "quote-failed" };
  }

  await calculateStockPerformance(assetId, { marketPrice: quote.price });
  return { ok: true, price: quote.price };
}
