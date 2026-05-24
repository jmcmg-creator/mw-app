"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { getActivePortfolio } from "@/lib/portfolio";
import type { PropertyType } from "@/generated/prisma/enums";

export type CreateImmoAssetInput = {
  name: string;
  propertyType?: PropertyType;
  address?: string;
  surfaceSqm?: number;
  personalEquity?: number;
  purchasePrice?: number;
  currentValuation?: number;
  monthlyRent?: number;
  monthlyCharges?: number;
};

/** Creates a real-estate (IMMO) asset in the user's default portfolio. */
export async function createImmoAsset(
  input: CreateImmoAssetInput,
): Promise<string> {
  const userId = await requireUserId();
  const portfolio = await getActivePortfolio(userId);

  const asset = await prisma.asset.create({
    data: {
      portfolioId: portfolio.id,
      type: "IMMO",
      name: input.name.trim(),
      currency: portfolio.baseCurrency,
      propertyType: input.propertyType ?? null,
      address: input.address?.trim() || null,
      surface_sqm: input.surfaceSqm ?? null,
      personal_equity: input.personalEquity ?? null,
      purchasePrice: input.purchasePrice ?? null,
      currentValuation: input.currentValuation ?? null,
      monthlyRent: input.monthlyRent ?? null,
      monthlyCharges: input.monthlyCharges ?? null,
    },
  });

  return asset.id;
}
