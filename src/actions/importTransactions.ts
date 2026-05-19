"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { calculateStockPerformance } from "@/actions/calculateStockPerformance";
import type { TransactionType } from "@/generated/prisma/enums";

export type ImportedTransaction = {
  type: TransactionType;
  date: string;
  quantity: number | null;
  unitPrice: number | null;
  amount: number;
  fees: number | null;
};

/**
 * Bulk-creates transactions (e.g. from an extracted document) on an asset
 * and refreshes its cached PRU. Amounts use the asset's own currency.
 */
export async function importTransactions(
  assetId: string,
  transactions: ImportedTransaction[],
): Promise<number> {
  const userId = await requireUserId();

  const asset = await prisma.asset.findFirst({
    where: { id: assetId, portfolio: { userId } },
  });
  if (!asset) {
    throw new Error("Asset not found.");
  }
  if (transactions.length === 0) return 0;

  await prisma.transaction.createMany({
    data: transactions.map((tx) => ({
      assetId,
      type: tx.type,
      date: new Date(tx.date),
      quantity: tx.quantity,
      unitPrice: tx.unitPrice,
      fees: tx.fees ?? 0,
      currency: asset.currency,
      amount: tx.amount,
      exchangeRate: 1,
      amountInBaseCurrency: tx.amount,
    })),
  });

  await calculateStockPerformance(assetId);
  return transactions.length;
}
