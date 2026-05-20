import Link from "next/link";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { getDefaultPortfolio } from "@/lib/portfolio";
import {
  ASSET_TYPE_LABELS,
  formatCurrency,
  formatNumber,
  formatPercent,
  toNumber,
} from "@/lib/format";
import {
  buildHolding,
  computePortfolioMetrics,
  type RawAsset,
} from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AllocationChart,
  type AllocationSlice,
} from "@/components/allocation-chart";
import {
  HoldingsTreemap,
  type TreemapCell,
} from "@/components/holdings-treemap";

const ALLOCATION_COLORS: Record<string, string> = {
  ACTION: "#3b82f6",
  ETF: "#10b981",
  OBLIGATION: "#f59e0b",
  STRUCTURE: "#8b5cf6",
  IMMO: "#06b6d4",
  SECURISE: "#64748b",
};

const CURRENCY_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
  "#84cc16",
];

function Kpi({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}) {
  return (
    <Card className="gap-1 py-4">
      <CardContent className="flex flex-col gap-0.5 px-4">
        <span className="text-muted-foreground text-xs">{label}</span>
        <span className="text-lg font-semibold">{value}</span>
        {delta && (
          <span
            className={
              positive ? "text-success text-xs" : "text-destructive text-xs"
            }
          >
            {delta}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export default async function AnalysePage() {
  const userId = await requireUserId();
  const portfolio = await getDefaultPortfolio(userId);
  const baseCurrency = portfolio.baseCurrency;

  const rawAssets = await prisma.asset.findMany({
    where: {
      portfolioId: portfolio.id,
      type: { in: ["ACTION", "ETF", "STRUCTURE", "OBLIGATION", "SECURISE"] },
    },
    include: {
      transactions: { orderBy: { date: "desc" } },
      structuredDetails: true,
    },
  });

  const holdings = rawAssets.map((asset) => buildHolding(asset as RawAsset));
  const metrics = computePortfolioMetrics(holdings);

  const allocation: AllocationSlice[] = Object.entries(metrics.byType)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => ({
      label: ASSET_TYPE_LABELS[type],
      value,
      color: ALLOCATION_COLORS[type] ?? "#64748b",
    }))
    .sort((a, b) => b.value - a.value);

  const currencySlices: AllocationSlice[] = Object.entries(metrics.byCurrency)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([code, value], index) => ({
      label: code,
      value,
      color: CURRENCY_COLORS[index % CURRENCY_COLORS.length],
    }));

  const treemap: TreemapCell[] = holdings
    .filter((h) => (h.marketValue > 0 ? h.marketValue : h.invested) > 0)
    .map((h) => ({
      name: h.name,
      value: h.marketValue > 0 ? h.marketValue : h.invested,
      pnlPct: h.unrealizedPnlPct,
    }));

  const structured = rawAssets.filter(
    (a) => a.type === "STRUCTURE" && a.structuredDetails,
  );

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild aria-label="Retour">
          <Link href="/dashboard">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">
          Analyse du portefeuille
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Kpi
          label="Valeur"
          value={formatCurrency(metrics.totalValue, baseCurrency)}
        />
        <Kpi
          label="Investi"
          value={formatCurrency(metrics.totalInvested, baseCurrency)}
        />
        <Kpi
          label="+/- value latente"
          value={formatCurrency(metrics.unrealizedPnl, baseCurrency)}
          delta={formatPercent(metrics.unrealizedPnlPct)}
          positive={metrics.unrealizedPnl >= 0}
        />
        <Kpi
          label="Dividendes"
          value={formatCurrency(metrics.totalDividends, baseCurrency)}
        />
      </div>

      {allocation.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition par classe</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart data={allocation} total={metrics.totalValue} />
          </CardContent>
        </Card>
      )}

      {currencySlices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exposition par devise</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart data={currencySlices} total={metrics.totalValue} />
          </CardContent>
        </Card>
      )}

      {treemap.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Cartographie des positions
            </CardTitle>
            <CardDescription>
              Taille = poids dans le portefeuille · couleur = performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HoldingsTreemap data={treemap} />
          </CardContent>
        </Card>
      )}

      {(metrics.winners.length > 0 || metrics.losers.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {metrics.winners.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-success flex items-center gap-2 text-base">
                  <TrendingUp className="size-4" />
                  Meilleures perfs
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {metrics.winners.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <Link
                      href={`/assets/${h.id}`}
                      className="truncate hover:underline"
                    >
                      {h.name}
                    </Link>
                    <span className="text-success font-medium">
                      {formatPercent(h.unrealizedPnlPct)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {metrics.losers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2 text-base">
                  <TrendingDown className="size-4" />
                  Pires perfs
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {metrics.losers.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <Link
                      href={`/assets/${h.id}`}
                      className="truncate hover:underline"
                    >
                      {h.name}
                    </Link>
                    <span className="text-destructive font-medium">
                      {formatPercent(h.unrealizedPnlPct)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Concentration</CardTitle>
          <CardDescription>
            Top 5 = {formatPercent(metrics.topConcentration)} · indice HHI{" "}
            {formatNumber(metrics.hhi * 10000, 0)} (10 000 = monopole)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {metrics.topByValue.map((h) => {
            const value = h.marketValue > 0 ? h.marketValue : h.invested;
            const share =
              metrics.totalValue > 0 ? value / metrics.totalValue : 0;
            return (
              <div
                key={h.id}
                className="flex items-center justify-between text-sm"
              >
                <Link
                  href={`/assets/${h.id}`}
                  className="truncate hover:underline"
                >
                  {h.name}
                </Link>
                <span className="text-muted-foreground">
                  {formatCurrency(value, h.currency)} ({formatPercent(share)})
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {structured.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produits structurés</CardTitle>
            <CardDescription>
              Barrières configurées · évaluation live sur la page de chaque
              produit
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {structured.map((asset) => {
              const details = asset.structuredDetails!;
              return (
                <div
                  key={asset.id}
                  className="border-border flex flex-col gap-1 rounded-lg border px-3 py-2 text-xs"
                >
                  <Link
                    href={`/assets/${asset.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {asset.name}
                  </Link>
                  <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                    <span>Sous-jacent: {details.underlying_ticker}</span>
                    <span>
                      Strike: {formatNumber(toNumber(details.strike_price))}
                    </span>
                    <span>
                      Coupon: {formatPercent(toNumber(details.coupon_rate))}
                    </span>
                    {details.capital_barrier != null && (
                      <span>
                        Capital:{" "}
                        {formatPercent(toNumber(details.capital_barrier))}
                      </span>
                    )}
                    {details.autocall_barrier != null && (
                      <span>
                        Autocall:{" "}
                        {formatPercent(toNumber(details.autocall_barrier))}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Détail des positions ({holdings.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {holdings.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              Aucune position. Importe ton portefeuille depuis le dashboard.
            </p>
          ) : (
            holdings.map((h) => (
              <Link
                key={h.id}
                href={`/assets/${h.id}`}
                className="bg-card flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{h.name}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {ASSET_TYPE_LABELS[h.type]} · {formatNumber(h.quantity, 4)}{" "}
                    u. · PRU {formatCurrency(h.pru, h.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatCurrency(
                      h.marketValue > 0 ? h.marketValue : h.invested,
                      h.currency,
                    )}
                  </p>
                  {h.invested > 0 && (
                    <p
                      className={
                        h.unrealizedPnl >= 0
                          ? "text-success text-xs"
                          : "text-destructive text-xs"
                      }
                    >
                      {formatPercent(h.unrealizedPnlPct)}
                    </p>
                  )}
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
