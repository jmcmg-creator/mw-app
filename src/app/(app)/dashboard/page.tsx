import Link from "next/link";
import { ChevronRight, Plus, ShieldAlert } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { getDefaultPortfolio } from "@/lib/portfolio";
import { createClient } from "@/lib/supabase/server";
import {
  ASSET_TYPE_LABELS,
  formatCurrency,
  formatPercent,
  toNumber,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const portfolio = await getDefaultPortfolio(userId);
  const assets = await prisma.asset.findMany({
    where: { portfolioId: portfolio.id },
    orderBy: { createdAt: "desc" },
  });

  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const has2fa =
    factors?.totp?.some((factor) => factor.status === "verified") ?? false;

  const rows = assets.map((asset) => {
    const quantity = toNumber(asset.cachedQuantity);
    const invested = quantity * toNumber(asset.cachedPru);
    const marketValue = quantity * toNumber(asset.cachedMarketPrice);
    const value = marketValue > 0 ? marketValue : invested;
    return { asset, quantity, invested, value };
  });

  const totalInvested = rows.reduce((sum, row) => sum + row.invested, 0);
  const totalValue = rows.reduce((sum, row) => sum + row.value, 0);
  const pnl = totalValue - totalInvested;
  const pnlPct = totalInvested > 0 ? pnl / totalInvested : 0;
  const currency = portfolio.baseCurrency;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <header className="flex flex-col gap-1">
        <span className="text-muted-foreground text-sm">{portfolio.name}</span>
        <h1 className="text-3xl font-semibold tracking-tight">
          {formatCurrency(totalValue, currency)}
        </h1>
        {totalInvested > 0 && (
          <span
            className={
              pnl >= 0 ? "text-success text-sm" : "text-destructive text-sm"
            }
          >
            {formatCurrency(pnl, currency)} ({formatPercent(pnlPct)})
          </span>
        )}
      </header>

      {!has2fa && (
        <Link href="/settings">
          <Card className="border-warning/40 bg-warning/5 py-4">
            <CardHeader>
              <ShieldAlert className="text-warning size-5" />
              <CardTitle className="mt-1 text-sm">
                Activez la double authentification
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Mes actifs</h2>
        <Button size="sm" variant="outline" asChild>
          <Link href="/assets/new">
            <Plus />
            Ajouter
          </Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aucun actif</CardTitle>
            <CardDescription>
              Ajoutez votre première action, ETF, obligation ou produit
              structuré pour suivre sa performance.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map(({ asset, quantity, value }) => (
            <Link key={asset.id} href={`/assets/${asset.id}`}>
              <Card className="flex-row items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{asset.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {ASSET_TYPE_LABELS[asset.type]}
                    {quantity > 0 && ` · ${quantity} u.`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {formatCurrency(value, asset.currency)}
                  </span>
                  <ChevronRight className="text-muted-foreground size-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
