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
  toNumber,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoRefresh } from "@/components/auto-refresh";
import { DeleteButton } from "@/components/delete-button";
import {
  AllocationChart,
  type AllocationSlice,
} from "@/components/allocation-chart";
import { Sparkline } from "@/components/sparkline";
import {
  fetchHistorical,
  type HistoricalPoint,
} from "@/actions/fetchHistorical";

const ALLOCATION_COLORS: Record<string, string> = {
  ACTION: "oklch(0.55 0.18 264)",
  ETF: "oklch(0.65 0.16 162)",
  OBLIGATION: "oklch(0.75 0.16 70)",
  STRUCTURE: "oklch(0.6 0.2 303)",
  IMMO: "oklch(0.65 0.13 184)",
  SECURISE: "oklch(0.55 0.04 257)",
};

const TYPE_STRIPE: Record<string, string> = {
  ACTION: "oklch(0.55 0.18 264)",
  ETF: "var(--success)",
  OBLIGATION: "var(--warning)",
  STRUCTURE: "oklch(0.6 0.2 303)",
  IMMO: "oklch(0.65 0.13 184)",
  SECURISE: "var(--muted-foreground)",
};

type MarketRow = {
  id: string;
  name: string;
  type: string;
  ticker: string | null;
  subtitle: string;
  value: number;
  currency: string;
  href: string;
  spark?: HistoricalPoint[];
  positive: boolean;
};

type ImmoRow = {
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

  const marketRows: MarketRow[] = [];
  const immoRows: ImmoRow[] = [];
  const totals = { value: 0, invested: 0 };
  const byType: Record<string, number> = {};

  const sparklines = new Map<string, HistoricalPoint[]>(
    await Promise.all(
      assets
        .filter((a) => a.type !== "IMMO" && a.ticker)
        .map(
          async (a) => [a.id, await fetchHistorical(a.ticker!, "1y")] as const,
        ),
    ),
  );

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
        type: asset.type,
        ticker: asset.ticker,
        subtitle:
          ASSET_TYPE_LABELS[asset.type] +
          (quantity > 0 ? ` · ${quantity} u.` : ""),
        value,
        currency: asset.currency,
        href: `/assets/${asset.id}`,
        spark: sparklines.get(asset.id),
        positive: marketValue - invested >= 0,
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
      color: ALLOCATION_COLORS[type] ?? "oklch(0.55 0.04 257)",
    }));
  if (totalCash > 0) {
    allocation.push({
      label: "Liquidités",
      value: totalCash,
      color: "oklch(0.7 0.16 130)",
    });
  }
  allocation.sort((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col gap-5 pt-2">
      <AutoRefresh />

      <header className="flex flex-col gap-2">
        <span className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
          Patrimoine total
        </span>
        <span className="text-4xl font-bold tracking-tight tabular-nums">
          {formatCurrency(totals.value, currency)}
        </span>
        {totals.invested > 0 && (
          <div className="flex items-center gap-2">
            <span
              className={
                pnl >= 0
                  ? "bg-success/10 text-success rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
                  : "bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
              }
            >
              {pnl >= 0 ? "▲" : "▼"} {Math.abs(pnlPct * 100).toFixed(1)}%
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {pnl >= 0 ? "+" : "−"}
              {formatCurrency(Math.abs(pnl), currency)}
            </span>
          </div>
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
        <Card className="py-5">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-wide uppercase">
              Répartition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart
              data={allocation}
              total={totals.value}
              centerLabel="Total"
              centerValue={formatCurrency(totals.value, currency).replace(
                /\s+€$/,
                " €",
              )}
            />
          </CardContent>
        </Card>
      )}

      <section className="flex flex-col gap-2">
        <SectionHeader
          icon={<LineChart className="size-4" />}
          title="Marchés"
          count={marketRows.length}
          addHref="/assets/new"
        />
        {marketRows.length === 0 ? (
          <EmptyCard label="Aucun actif boursier." />
        ) : (
          <div className="flex flex-col gap-2">
            {marketRows.map((row) => (
              <MarketRowCard key={row.id} row={row} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <SectionHeader
          icon={<Building2 className="size-4" />}
          title="Immobilier"
          count={immoRows.length}
          addHref="/properties/new"
        />
        {immoRows.length === 0 ? (
          <EmptyCard label="Aucun bien immobilier." />
        ) : (
          <div className="flex flex-col gap-2">
            {immoRows.map((row) => (
              <Link key={row.id} href={row.href}>
                <Card className="hover:bg-accent/40 flex-row items-center gap-3 px-4 py-3 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{row.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {row.subtitle}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatCurrency(row.value, row.currency)}
                  </span>
                  <ChevronRight className="text-muted-foreground size-4" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <SectionHeader
          icon={<Wallet className="size-4" />}
          title="Liquidités"
          count={cashBalances.length}
          addHref="/cash/new"
        />
        {cashBalances.length === 0 ? (
          <EmptyCard label="Aucune liquidité." />
        ) : (
          <div className="flex flex-col gap-2">
            {cashBalances.map((balance) => (
              <Card
                key={balance.id}
                className="flex-row items-center justify-between px-4 py-3"
              >
                <span className="text-sm font-semibold">
                  {balance.currency}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums">
                    {formatCurrency(toNumber(balance.amount), balance.currency)}
                  </span>
                  <DeleteButton
                    onConfirm={deleteCashBalance.bind(null, balance.id)}
                    confirmText="Supprimer cette liquidité ?"
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  count,
  addHref,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  addHref: string;
}) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="text-muted-foreground flex items-center gap-1.5 text-sm font-semibold tracking-wide uppercase">
        {icon}
        {title}
        <span className="text-muted-foreground/70 ml-1 text-xs tabular-nums">
          {count}
        </span>
      </h2>
      <Button size="sm" variant="ghost" className="h-7 px-2" asChild>
        <Link href={addHref}>
          <Plus className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

function EmptyCard({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="text-muted-foreground py-5 text-center text-sm">
        {label}
      </CardContent>
    </Card>
  );
}

function MarketRowCard({ row }: { row: MarketRow }) {
  const stripe = TYPE_STRIPE[row.type] ?? TYPE_STRIPE.SECURISE;
  return (
    <Link
      href={row.href}
      className="bg-card hover:bg-accent/40 group relative flex items-center gap-3 overflow-hidden rounded-xl border px-3 py-3 transition-colors"
    >
      <span
        aria-hidden
        className="absolute top-2 bottom-2 left-0 w-1 rounded-r-full"
        style={{ backgroundColor: stripe }}
      />
      <div className="min-w-0 flex-1 pl-2">
        <p className="truncate text-sm font-semibold">{row.name}</p>
        <p className="text-muted-foreground flex items-center gap-1.5 truncate text-[11px]">
          <span
            className="bg-muted rounded px-1 py-px text-[10px] font-medium tracking-wide uppercase"
            style={{ color: stripe }}
          >
            {ASSET_TYPE_LABELS[row.type] ?? row.type}
          </span>
          {row.ticker && <span className="truncate">{row.ticker}</span>}
        </p>
      </div>
      {row.spark && row.spark.length >= 2 && (
        <div className="xs:block hidden">
          <Sparkline data={row.spark} positive={row.positive} />
        </div>
      )}
      <div className="flex flex-col items-end">
        <span className="text-sm font-semibold tabular-nums">
          {formatCurrency(row.value, row.currency)}
        </span>
        <span className="text-muted-foreground text-[11px]">
          <ChevronRight className="inline size-3" />
        </span>
      </div>
    </Link>
  );
}
