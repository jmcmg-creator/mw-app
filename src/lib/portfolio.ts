import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import type { HolderType } from "@/generated/prisma/enums";

const ACTIVE_COOKIE = "active_portfolio_id";

export type HolderInput = {
  holderName: string | null;
  holderType: HolderType | null;
  holderTaxId: string | null;
};

/** Returns the user's default portfolio, creating one on first use. */
export async function getDefaultPortfolio(userId: string) {
  const existing = await prisma.portfolio.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  return prisma.portfolio.create({
    data: { userId, name: "Mon portefeuille", isDefault: true },
  });
}

/**
 * Returns the portfolio the user is currently viewing, based on the
 * `active_portfolio_id` cookie. Falls back to the default portfolio when no
 * cookie is set or it points at a portfolio the user no longer owns.
 */
export async function getActivePortfolio(userId: string) {
  const store = await cookies();
  const id = store.get(ACTIVE_COOKIE)?.value;
  if (id) {
    const found = await prisma.portfolio.findFirst({
      where: { id, userId },
    });
    if (found) return found;
  }
  return getDefaultPortfolio(userId);
}

/** Returns every portfolio owned by a user, oldest first. */
export async function listPortfolios(userId: string) {
  return prisma.portfolio.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
}

/**
 * Finds the portfolio for a holder (case-insensitive match on name + matching
 * type/taxId when provided), creating one if no match exists. Used by the
 * import flow so uploading "Jean Dupont"'s statement always lands in his
 * own portfolio, separate from "ACME SAS".
 */
export async function findOrCreateHolderPortfolio(
  userId: string,
  holder: HolderInput,
  fallback: { name?: string },
): Promise<{ id: string; baseCurrency: string; isNew: boolean }> {
  if (holder.holderName?.trim()) {
    const name = holder.holderName.trim();
    const existing = await prisma.portfolio.findFirst({
      where: {
        userId,
        holderName: { equals: name, mode: "insensitive" },
      },
    });
    if (existing) {
      // Backfill type/taxId if the doc revealed new info.
      const patch: Partial<HolderInput> = {};
      if (!existing.holderType && holder.holderType)
        patch.holderType = holder.holderType;
      if (!existing.holderTaxId && holder.holderTaxId)
        patch.holderTaxId = holder.holderTaxId;
      if (Object.keys(patch).length > 0) {
        await prisma.portfolio.update({
          where: { id: existing.id },
          data: patch,
        });
      }
      return {
        id: existing.id,
        baseCurrency: existing.baseCurrency,
        isNew: false,
      };
    }

    const created = await prisma.portfolio.create({
      data: {
        userId,
        name: fallback.name?.trim() || name,
        holderName: name,
        holderType: holder.holderType,
        holderTaxId: holder.holderTaxId,
      },
    });
    return {
      id: created.id,
      baseCurrency: created.baseCurrency,
      isNew: true,
    };
  }

  const fallbackPortfolio = await getDefaultPortfolio(userId);
  return {
    id: fallbackPortfolio.id,
    baseCurrency: fallbackPortfolio.baseCurrency,
    isNew: false,
  };
}

export const ACTIVE_PORTFOLIO_COOKIE = ACTIVE_COOKIE;
