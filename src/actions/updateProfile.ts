"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Currency } from "@/generated/prisma/enums";

export type UpdateProfileInput = {
  fullName: string;
  baseCurrency: Currency;
};

/** Updates the user's display name and base reporting currency. */
export async function updateProfile(input: UpdateProfileInput): Promise<void> {
  const userId = await requireUserId();
  const fullName = input.fullName.trim();

  await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: fullName || null,
      baseCurrency: input.baseCurrency,
    },
  });

  await prisma.portfolio.updateMany({
    where: { userId },
    data: { baseCurrency: input.baseCurrency },
  });

  const supabase = await createClient();
  await supabase.auth.updateUser({ data: { full_name: fullName } });
}
