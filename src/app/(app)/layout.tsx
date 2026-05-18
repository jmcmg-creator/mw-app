import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings, Wallet } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";

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

  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel === "aal1" && aal.nextLevel === "aal2") {
    redirect("/verify-2fa");
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="flex items-center justify-between px-5 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <Wallet className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">Patrimoine</span>
        </Link>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild aria-label="Réglages">
            <Link href="/settings">
              <Settings />
            </Link>
          </Button>
          <SignOutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col px-5 pb-10">{children}</main>
    </div>
  );
}
