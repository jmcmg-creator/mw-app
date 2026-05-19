"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { calculateStockPerformance } from "@/actions/calculateStockPerformance";

/** Deletes an asset (and its cascading transactions, loans, documents). */
export async function deleteAsset(assetId: string): Promise<void> {
  const userId = await requireUserId();
  const asset = await prisma.asset.findFirst({
    where: { id: assetId, portfolio: { userId } },
  });
  if (!asset) {
    throw new Error("Asset not found.");
  }
  await prisma.asset.delete({ where: { id: assetId } });
}

/** Deletes a transaction and recomputes the asset's cached PRU. */
export async function deleteTransaction(transactionId: string): Promise<void> {
  const userId = await requireUserId();
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, asset: { portfolio: { userId } } },
  });
  if (!transaction) {
    throw new Error("Transaction not found.");
  }
  await prisma.transaction.delete({ where: { id: transactionId } });
  await calculateStockPerformance(transaction.assetId);
}

/** Deletes a loan attached to a real-estate asset. */
export async function deleteLoan(loanId: string): Promise<void> {
  const userId = await requireUserId();
  const loan = await prisma.loan.findFirst({
    where: { id: loanId, asset: { portfolio: { userId } } },
  });
  if (!loan) {
    throw new Error("Loan not found.");
  }
  await prisma.loan.delete({ where: { id: loanId } });
}
