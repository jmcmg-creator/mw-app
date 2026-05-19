import { prisma } from "@/lib/prisma";

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
