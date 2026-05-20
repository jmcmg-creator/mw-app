"use server";

import YahooFinance from "yahoo-finance2";

import { prisma } from "@/lib/prisma";

const yahooFinance = new YahooFinance();

const STALE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Refreshes Yahoo Finance fundamentals for a single asset. Skips if data is fresh. */
export async function fetchFundamentals(assetId: string): Promise<boolean> {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { ticker: true, fundamentalsUpdatedAt: true },
  });
  if (!asset?.ticker) return false;

  if (
    asset.fundamentalsUpdatedAt &&
    Date.now() - asset.fundamentalsUpdatedAt.getTime() < STALE_MS
  ) {
    return false;
  }

  try {
    const summary = await yahooFinance.quoteSummary(asset.ticker, {
      modules: ["assetProfile", "summaryDetail", "financialData"],
    });

    const profile = summary.assetProfile;
    const detail = summary.summaryDetail;
    const financial = summary.financialData;

    await prisma.asset.update({
      where: { id: assetId },
      data: {
        sector: profile?.sector ?? null,
        industry: profile?.industry ?? null,
        marketCap: detail?.marketCap != null ? detail.marketCap : null,
        peRatio: detail?.trailingPE != null ? detail.trailingPE : null,
        debtToEquity:
          financial?.debtToEquity != null ? financial.debtToEquity : null,
        freeCashflow:
          financial?.freeCashflow != null ? financial.freeCashflow : null,
        ytdReturn: detail?.ytdReturn != null ? detail.ytdReturn : null,
        fundamentalsUpdatedAt: new Date(),
      },
    });
    return true;
  } catch {
    return false;
  }
}
