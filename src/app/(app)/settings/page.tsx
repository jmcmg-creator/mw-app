import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./_components/profile-form";
import { TwoFactorCard } from "./_components/two-factor-card";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });

  return (
    <div className="flex flex-col gap-6 pt-2">
      <h1 className="text-2xl font-semibold tracking-tight">Réglages</h1>

      <ProfileForm
        email={user?.email ?? dbUser?.email ?? ""}
        fullName={dbUser?.fullName ?? ""}
        baseCurrency={dbUser?.baseCurrency ?? "EUR"}
      />

      <TwoFactorCard />
    </div>
  );
}
