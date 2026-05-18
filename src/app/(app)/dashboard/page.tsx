import Link from "next/link";
import { ShieldAlert, Wallet } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: factors } = await supabase.auth.mfa.listFactors();

  const has2fa =
    factors?.totp?.some((factor) => factor.status === "verified") ?? false;
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ?? user?.email;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <header className="flex flex-col gap-1">
        <span className="text-muted-foreground text-sm">Bonjour</span>
        <h1 className="text-2xl font-semibold tracking-tight">{displayName}</h1>
      </header>

      {!has2fa && (
        <Link href="/settings">
          <Card className="border-warning/40 bg-warning/5">
            <CardHeader>
              <ShieldAlert className="text-warning size-5" />
              <CardTitle className="mt-2 text-base">
                Activez la double authentification
              </CardTitle>
              <CardDescription>
                Protégez votre patrimoine avec un code à 6 chiffres. Touchez
                pour configurer.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      )}

      <Card>
        <CardHeader>
          <Wallet className="text-primary size-5" />
          <CardTitle className="mt-2 text-base">Aucun portefeuille</CardTitle>
          <CardDescription>
            Vos portefeuilles d&apos;investissement apparaîtront ici.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            La création de portefeuilles arrive dans la prochaine étape.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
