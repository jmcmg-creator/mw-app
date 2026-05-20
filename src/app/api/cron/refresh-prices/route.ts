import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { fetchQuote } from "@/actions/fetchQuote";
import { fetchFundamentals } from "@/actions/fetchFundamentals";
import { calculateStockPerformance } from "@/actions/calculateStockPerformance";

/**
 * Background price refresh. Triggered by Vercel Cron (see vercel.json) and
 * authenticated via Bearer ${CRON_SECRET}. Refreshes every asset that has
 * a ticker, across all users.
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const assets = await prisma.asset.findMany({
    where: { ticker: { not: null } },
    select: { id: true, ticker: true },
  });

  const results = await Promise.all(
    assets.map(async (asset) => {
      if (!asset.ticker) return false;
      const quote = await fetchQuote(asset.ticker);
      if (!quote) return false;
      await calculateStockPerformance(asset.id, { marketPrice: quote.price });
      await fetchFundamentals(asset.id);
      return true;
    }),
  );

  return NextResponse.json({
    total: assets.length,
    updated: results.filter(Boolean).length,
  });
}
