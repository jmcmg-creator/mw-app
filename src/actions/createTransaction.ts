"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { calculateStockPerformance } from "@/actions/calculateStockPerformance";
import type { Currency, TransactionType } from "@/generated/prisma/enums";

export type CreateTransactionInput = {
  assetId: string;
  type: TransactionType;
  date: string;
  quantity?: number;
  unitPrice?: number;
  fees?: number;
  /** Explicit gross amount; defaults to quantity * unitPrice. */
  amount?: number;
  currency: Currency;
  exchangeRate?: number;
  note?: string;
};

/** Records a transaction for an asset and refreshes its cached PRU. */
export async function createTransaction(
  input: CreateTransactionInput,
): Promise<void> {
  const userId = await requireUserId();

  const asset = await prisma.asset.findFirst({
    where: { id: input.assetId, portfolio: { userId } },
  });
  if (!asset) {
    throw new Error("Asset not found.");
  }

  const quantity = input.quantity ?? null;
  const unitPrice = input.unitPrice ?? null;
  const fees = input.fees ?? 0;
  const exchangeRate = input.exchangeRate ?? 1;
  const amount = input.amount ?? (quantity ?? 0) * (unitPrice ?? 0);

  await prisma.transaction.create({
    data: {
      assetId: input.assetId,
      type: input.type,
      date: new Date(input.date),
      quantity,
      unitPrice,
      fees,
      currency: input.currency,
      amount,
      exchangeRate,
      amountInBaseCurrency: amount * exchangeRate,
      note: input.note?.trim() || null,
    },
  });

  await calculateStockPerformance(input.assetId);
}
