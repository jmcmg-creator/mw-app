"use server";

import { prisma } from "@/lib/prisma";
import { parseBondName } from "@/lib/bond";

/**
 * Walks every OBLIGATION asset in the portfolio that has no BondDetails
 * yet and, when the name encodes a coupon + maturity (e.g. "Foo 4% 12082030"),
 * creates a minimal BondDetails row. Idempotent.
 */
export async function backfillBondDetails(
  portfolioId: string,
): Promise<number> {
  const bonds = await prisma.asset.findMany({
    where: {
      portfolioId,
      type: "OBLIGATION",
      bondDetails: null,
    },
    select: { id: true, name: true, cachedQuantity: true, cachedPru: true },
  });

  let created = 0;
  for (const bond of bonds) {
    const parsed = parseBondName(bond.name);
    if (!parsed) continue;
    const nominalGuess =
      Number(bond.cachedQuantity ?? 0) * Number(bond.cachedPru ?? 0) || null;
    await prisma.bondDetails.create({
      data: {
        assetId: bond.id,
        couponRate: parsed.couponRate,
        couponFrequency: parsed.couponRate === 0 ? "ZERO_COUPON" : "ANNUAL",
        nominalAmount: nominalGuess,
        maturityDate: parsed.maturityDate,
      },
    });
    created++;
  }
  return created;
}
