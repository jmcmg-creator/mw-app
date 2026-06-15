import Link from "next/link";
import { redirect } from "next/navigation";
import { Wallet } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getActivePortfolio, listPortfolios } from "@/lib/portfolio";
import { SignOutButton } from "@/components/sign-out-button";
import { BottomNav } from "@/components/bottom-nav";
import { PortfolioSwitcher } from "@/components/portfolio-switcher";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2FA enforcement temporarily disabled during the redesign — accounts
  // that already enrolled a TOTP factor can still use it, we just don't
  // force the verification step. Re-enable once /settings 2FA tooling is
  // hardened.
  // const { data: aal } =
  //   await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  // if (aal?.currentLevel === "aal1" && aal.nextLevel === "aal2") {
  //   redirect("/verify-2fa");
  // }

  const [active, portfolios] = await Promise.all([
    getActivePortfolio(user.id),
    listPortfolios(user.id),
  ]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col lg:max-w-7xl">
      <header className="flex items-center justify-between gap-2 px-5 py-4 lg:px-8 lg:py-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <Wallet className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">Patrimoine</span>
        </Link>
        <div className="flex items-center gap-2">
          <PortfolioSwitcher
            portfolios={portfolios.map((p) => ({
              id: p.id,
              name: p.name,
              holderName: p.holderName,
              holderType: p.holderType,
            }))}
            activeId={active.id}
          />
          <SignOutButton />
        </div>
      </header>

      <main className="flex flex-1 flex-col px-5 pb-8 lg:px-8">{children}</main>

      <BottomNav />
    </div>
  );
}
