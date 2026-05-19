"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import type { LoanRateType, ReferenceRate } from "@/generated/prisma/enums";

export type CreateLoanInput = {
  assetId: string;
  lender?: string;
  rateType: LoanRateType;
  /** Fraction (0.034 = 3.4%). Used when rateType is FIXE. */
  fixedRate?: number;
  referenceRate?: ReferenceRate;
  /** Fraction. Added to the reference rate when rateType is VARIABLE. */
  marginRate?: number;
  insuranceRate?: number;
  principal: number;
  durationMonths: number;
  startDate: string;
};

/** Attaches a mortgage to a real-estate asset owned by the user. */
export async function createLoan(input: CreateLoanInput): Promise<void> {
  const userId = await requireUserId();

  const asset = await prisma.asset.findFirst({
    where: { id: input.assetId, portfolio: { userId } },
  });
  if (!asset) {
    throw new Error("Asset not found.");
  }

  await prisma.loan.create({
    data: {
      assetId: input.assetId,
      lender: input.lender?.trim() || null,
      rateType: input.rateType,
      fixedRate: input.fixedRate ?? null,
      reference_rate: input.referenceRate ?? null,
      margin_rate: input.marginRate ?? null,
      insuranceRate: input.insuranceRate ?? null,
      principal: input.principal,
      currency: asset.currency,
      durationMonths: input.durationMonths,
      startDate: new Date(input.startDate),
    },
  });
}
