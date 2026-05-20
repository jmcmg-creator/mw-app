import Link from "next/link";
import {
  BarChart3,
  Building2,
  ChevronRight,
  LineChart,
  Plus,
  ShieldAlert,
  Upload,
  Wallet,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { getDefaultPortfolio } from "@/lib/portfolio";
import { createClient } from "@/lib/supabase/server";
import { deleteCashBalance } from "@/actions/setCashBalance";
import {
  ASSET_TYPE_LABELS,
  PROPERTY_TYPE_LABELS,
  formatCurrency,
  formatPercent,
  toNumber,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteButton } from "@/components/delete-button";
import {
  AllocationChart,
  type AllocationSlice,
} from "@/components/allocation-chart";

const ALLOCATION_COLORS: Record<string, string> = {
  ACTION: "#3b82f6",
  ETF: "#10b981",
  OBLIGATION: "#f59e0b",
  STRUCTURE: "#8b5cf6",
  IMMO: "#06b6d4",
  SECURISE: "#64748b",
};

type Row = {
  id: string;
  name: string;
  subtitle: string;
  value: number;
  currency: string;
  href: string;
};

export default async function DashboardPage() {
  const userId = await requireUserId();
  const portfolio = await getDefaultPortfolio(userId);
  const assets = await prisma.asset.findMany({
    where: { portfolioId: portfolio.id },
    orderBy: { createdAt: "desc" },
  });
  const cashBalances = await prisma.cashBalance.findMany({
    where: { portfolioId: portfolio.id },
    orderBy: { currency: "asc" },
  });

  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const has2fa =
    factors?.totp?.some((factor) => factor.status === "verified") ?? false;

  const marketRows: Row[] = [];
  const immoRows: Row[] = [];
  const totals = { value: 0, invested: 0 };
  const byType: Record<string, number> = {};

  for (const asset of assets) {
    if (asset.type === "IMMO") {
      const value = toNumber(asset.currentValuation);
      immoRows.push({
        id: asset.id,
        name: asset.name,
        subtitle: asset.propertyType
          ? PROPERTY_TYPE_LABELS[asset.propertyType]
          : (asset.address ?? "Bien immobilier"),
        value,
        currency: asset.currency,
        href: `/properties/${asset.id}`,
      });
      totals.value += value;
      totals.invested += toNumber(asset.purchasePrice);
      byType.IMMO = (byType.IMMO ?? 0) + value;
    } else {
      const quantity = toNumber(asset.cachedQuantity);
      const invested = quantity * toNumber(asset.cachedPru);
      const marketValue = quantity * toNumber(asset.cachedMarketPrice);
      const value = marketValue > 0 ? marketValue : invested;
      marketRows.push({
        id: asset.id,
        name: asset.name,
        subtitle:
          ASSET_TYPE_LABELS[asset.type] +
          (quantity > 0 ? ` · ${quantity} u.` : ""),
        value,
        currency: asset.currency,
        href: `/assets/${asset.id}`,
      });
      totals.value += value;
      totals.invested += invested;
      byType[asset.type] = (byType[asset.type] ?? 0) + value;
    }
  }

  const totalCash = cashBalances.reduce(
    (sum, balance) => sum + toNumber(balance.amount),
    0,
  );
  // Cash is value-neutral for P&L: count it in both sides.
  totals.value += totalCash;
  totals.invested += totalCash;

  const pnl = totals.value - totals.invested;
  const pnlPct = totals.invested > 0 ? pnl / totals.invested : 0;
  const currency = portfolio.baseCurrency;

  const allocation: AllocationSlice[] = Object.entries(byType)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => ({
      label: ASSET_TYPE_LABELS[type],
      value,
      color: ALLOCATION_COLORS[type] ?? "#64748b",
    }));
  if (totalCash > 0) {
    allocation.push({
      label: "Liquidités",
      value: totalCash,
      color: "#84cc16",
    });
  }
  allocation.sort((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col gap-6 pt-2">
      <header className="flex flex-col gap-1">
        <span className="text-muted-foreground text-sm">Patrimoine total</span>
        <h1 className="text-3xl font-semibold tracking-tight">
          {formatCurrency(totals.value, currency)}
        </h1>
        {totals.invested > 0 && (
          <span
            className={
              pnl >= 0 ? "text-success text-sm" : "text-destructive text-sm"
            }
          >
            {formatCurrency(pnl, currency)} ({formatPercent(pnlPct)})
          </span>
        )}
      </header>

      <div className="grid grid-cols-2 gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/analyse">
            <BarChart3 className="size-4" />
            Analyse
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/import/portfolio">
            <Upload className="size-4" />
            Importer
          </Link>
        </Button>
      </div>

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

      {allocation.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Répartition</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart data={allocation} total={totals.value} />
          </CardContent>
        </Card>
      )}

      <Section
        title="Marchés"
        icon={<LineChart className="size-4" />}
        addHref="/assets/new"
        rows={marketRows}
        emptyLabel="Aucun actif boursier."
      />

      <Section
        title="Immobilier"
        icon={<Building2 className="size-4" />}
        addHref="/properties/new"
        rows={immoRows}
        emptyLabel="Aucun bien immobilier."
      />

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-medium">
            <Wallet className="size-4" />
            Liquidités
          </h2>
          <Button size="sm" variant="outline" asChild>
            <Link href="/cash/new">
              <Plus />
              Ajouter
            </Link>
          </Button>
        </div>

        {cashBalances.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-5 text-center text-sm">
              Aucune liquidité.
            </CardContent>
          </Card>
        ) : (
          cashBalances.map((balance) => (
            <Card
              key={balance.id}
              className="flex-row items-center justify-between gap-3 px-4 py-3"
            >
              <span className="text-sm font-medium">{balance.currency}</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">
                  {formatCurrency(toNumber(balance.amount), balance.currency)}
                </span>
                <DeleteButton
                  onConfirm={deleteCashBalance.bind(null, balance.id)}
                  confirmText="Supprimer cette liquidité ?"
                />
              </div>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}

function Section({
  title,
  icon,
  addHref,
  rows,
  emptyLabel,
}: {
  title: string;
  icon: React.ReactNode;
  addHref: string;
  rows: Row[];
  emptyLabel: string;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-medium">
          {icon}
          {title}
        </h2>
        <Button size="sm" variant="outline" asChild>
          <Link href={addHref}>
            <Plus />
            Ajouter
          </Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-5 text-center text-sm">
            {emptyLabel}
          </CardContent>
        </Card>
      ) : (
        rows.map((row) => (
          <Link key={row.id} href={row.href}>
            <Card className="flex-row items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{row.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {row.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">
                  {formatCurrency(row.value, row.currency)}
                </span>
                <ChevronRight className="text-muted-foreground size-4" />
              </div>
            </Card>
          </Link>
        ))
      )}
    </section>
  );
}
