"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { getActivePortfolio } from "@/lib/portfolio";
import type { Currency } from "@/generated/prisma/enums";

/** Sets (creates or updates) the cash balance for a currency. */
export async function setCashBalance(
  currency: Currency,
  amount: number,
): Promise<void> {
  const userId = await requireUserId();
  const portfolio = await getActivePortfolio(userId);

  await prisma.cashBalance.upsert({
    where: {
      portfolioId_currency: { portfolioId: portfolio.id, currency },
    },
    create: { portfolioId: portfolio.id, currency, amount },
    update: { amount },
  });
}

/** Removes a cash balance line. */
export async function deleteCashBalance(id: string): Promise<void> {
  const userId = await requireUserId();
  const balance = await prisma.cashBalance.findFirst({
    where: { id, portfolio: { userId } },
  });
  if (!balance) {
    throw new Error("Cash balance not found.");
  }
  await prisma.cashBalance.delete({ where: { id } });
}
