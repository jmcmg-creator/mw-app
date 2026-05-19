"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { getDefaultPortfolio } from "@/lib/portfolio";
import type { AssetType, Currency } from "@/generated/prisma/enums";

export type CreateAssetInput = {
  type: AssetType;
  name: string;
  ticker?: string;
  isin?: string;
  currency: Currency;
  notes?: string;
  /** Required when type is STRUCTURE. */
  structured?: {
    underlyingTicker: string;
    strikePrice: number;
    couponRate: number;
    capitalBarrier?: number;
    couponBarrier?: number;
    autocallBarrier?: number;
    issuer?: string;
    maturityDate?: string;
  };
};

/** Creates a market asset in the user's default portfolio. */
export async function createAsset(input: CreateAssetInput): Promise<string> {
  const userId = await requireUserId();
  const portfolio = await getDefaultPortfolio(userId);

  const asset = await prisma.asset.create({
    data: {
      portfolioId: portfolio.id,
      type: input.type,
      name: input.name.trim(),
      ticker: input.ticker?.trim() || null,
      isin: input.isin?.trim() || null,
      currency: input.currency,
      notes: input.notes?.trim() || null,
    },
  });

  if (input.type === "STRUCTURE" && input.structured) {
    const details = input.structured;
    await prisma.structuredProductDetails.create({
      data: {
        assetId: asset.id,
        underlying_ticker: details.underlyingTicker.trim(),
        strike_price: details.strikePrice,
        coupon_rate: details.couponRate,
        capital_barrier: details.capitalBarrier ?? null,
        coupon_barrier: details.couponBarrier ?? null,
        autocall_barrier: details.autocallBarrier ?? null,
        issuer: details.issuer?.trim() || null,
        maturityDate: details.maturityDate
          ? new Date(details.maturityDate)
          : null,
      },
    });
  }

  return asset.id;
}
