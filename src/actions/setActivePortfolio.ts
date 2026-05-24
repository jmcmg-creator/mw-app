"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { ACTIVE_PORTFOLIO_COOKIE } from "@/lib/portfolio";

/** Switches which holder/portfolio the dashboard and analyse views show. */
export async function setActivePortfolio(portfolioId: string): Promise<void> {
  const userId = await requireUserId();
  const portfolio = await prisma.portfolio.findFirst({
    where: { id: portfolioId, userId },
    select: { id: true },
  });
  if (!portfolio) {
    throw new Error("Portfolio not found.");
  }

  const store = await cookies();
  store.set(ACTIVE_PORTFOLIO_COOKIE, portfolio.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/dashboard");
  revalidatePath("/analyse");
}
