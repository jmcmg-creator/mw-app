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
import { buildPortfolioHistory } from "@/lib/portfolio-history";
import {
  fetchFundamentals,
  type Fundamentals,
} from "@/actions/fetchFundamentals";
import {
  fetchHistorical,
  type HistoricalPoint,
  type HistoricalRange,
} from "@/actions/fetchHistorical";
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
import { Sparkline } from "@/components/sparkline";
import {
  PortfolioHistoryChart,
  type PortfolioHistorySeries,
} from "@/components/portfolio-history-chart";
import { AutoRefresh } from "@/components/auto-refresh";

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

const SECTOR_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
  "#84cc16",
  "#ec4899",
  "#14b8a6",
  "#a855f7",
  "#f97316",
  "#64748b",
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

function formatBigNumber(value: number | null, currency?: string): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const fmt = (n: number, suffix: string) =>
    `${sign}${n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2)}${suffix}`;
  let body: string;
  if (abs >= 1e12)
    body = fmt(abs / 1e12, " B"); // billion (FR) = 10^12
  else if (abs >= 1e9) body = fmt(abs / 1e9, " Mds");
  else if (abs >= 1e6) body = fmt(abs / 1e6, " M");
  else if (abs >= 1e3) body = fmt(abs / 1e3, " k");
  else body = `${sign}${abs.toFixed(0)}`;
  return currency ? `${body} ${currency}` : body;
}

function formatRatio(value: number | null, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toFixed(digits);
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

  // Tickerable assets (those we can ask Yahoo about). Skip fully-sold positions.
  const tickered = rawAssets.filter(
    (a) => a.ticker && toNumber(a.cachedQuantity) > 0,
  );

  // Fundamentals + historical for each tickered asset, all in parallel.
  type Enriched = {
    assetId: string;
    ticker: string;
    fundamentals: Fundamentals | null;
    history1y: HistoricalPoint[];
    history3y: HistoricalPoint[];
    history5y: HistoricalPoint[];
  };

  const enriched: Enriched[] = await Promise.all(
    tickered.map(async (a) => {
      const ticker = a.ticker!;
      const [fundamentals, h1, h3, h5] = await Promise.all([
        fetchFundamentals(ticker),
        fetchHistorical(ticker, "1y"),
        fetchHistorical(ticker, "3y"),
        fetchHistorical(ticker, "5y"),
      ]);
      return {
        assetId: a.id,
        ticker,
        fundamentals,
        history1y: h1,
        history3y: h3,
        history5y: h5,
      };
    }),
  );

  const enrichedById = new Map(enriched.map((e) => [e.assetId, e]));

  // Sector allocation (weighted by current market value).
  const bySector: Record<string, number> = {};
  let sectorClassified = 0;
  for (const h of holdings) {
    const value = h.marketValue > 0 ? h.marketValue : h.invested;
    if (value <= 0) continue;
    const e = enrichedById.get(h.id);
    const sector = e?.fundamentals?.sector ?? null;
    if (sector) {
      bySector[sector] = (bySector[sector] ?? 0) + value;
      sectorClassified += value;
    }
  }
  const sectorSlices: AllocationSlice[] = Object.entries(bySector)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({
      label,
      value,
      color: SECTOR_COLORS[i % SECTOR_COLORS.length],
    }));

  // Portfolio history (1Y / 3Y / 5Y) reconstructed from transactions × prices.
  const historyAssets = (range: HistoricalRange) =>
    tickered.map((a) => {
      const e = enrichedById.get(a.id)!;
      const series =
        range === "1y"
          ? e.history1y
          : range === "3y"
            ? e.history3y
            : e.history5y;
      return {
        id: a.id,
        ticker: a.ticker,
        currency: a.currency,
        transactions: a.transactions.map((tx) => ({
          type: tx.type,
          date: tx.date,
          quantity: tx.quantity,
          exchangeRate: tx.exchangeRate,
        })),
        history: series,
      };
    });

  const portfolioHistory: PortfolioHistorySeries = {
    "1y": buildPortfolioHistory(historyAssets("1y"), baseCurrency),
    "3y": buildPortfolioHistory(historyAssets("3y"), baseCurrency),
    "5y": buildPortfolioHistory(historyAssets("5y"), baseCurrency),
  };

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

  // Holdings sorted by current value, for the fundamentals table.
  const holdingsByValue = [...holdings].sort(
    (a, b) =>
      (b.marketValue > 0 ? b.marketValue : b.invested) -
      (a.marketValue > 0 ? a.marketValue : a.invested),
  );

  const hasAnyFundamentals = enriched.some(
    (e) =>
      e.fundamentals &&
      (e.fundamentals.sector ||
        e.fundamentals.trailingPE != null ||
        e.fundamentals.marketCap != null),
  );

  return (
    <div className="flex flex-col gap-6 pt-2">
      <AutoRefresh />
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Historique du portefeuille
          </CardTitle>
          <CardDescription>
            Valeur reconstruite à partir des transactions et des cours
            historiques.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PortfolioHistoryChart
            series={portfolioHistory}
            currency={baseCurrency}
          />
        </CardContent>
      </Card>

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

      {sectorSlices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exposition sectorielle</CardTitle>
            <CardDescription>
              Sur{" "}
              {formatPercent(
                metrics.totalValue > 0
                  ? sectorClassified / metrics.totalValue
                  : 0,
              )}{" "}
              du portefeuille (positions tickerées uniquement).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AllocationChart data={sectorSlices} total={sectorClassified} />
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

      {hasAnyFundamentals && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fondamentaux</CardTitle>
            <CardDescription>
              PER · ratio dette/fonds propres · cash flow · capitalisation ·
              YTD. Source : Yahoo Finance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="-mx-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-xs">
                <thead className="text-muted-foreground">
                  <tr className="border-border border-b">
                    <th className="py-2 pr-2 pl-4 text-left font-medium">
                      Position
                    </th>
                    <th className="px-2 py-2 text-left font-medium">Secteur</th>
                    <th className="px-2 py-2 text-right font-medium">
                      Market cap
                    </th>
                    <th className="px-2 py-2 text-right font-medium">PER</th>
                    <th className="px-2 py-2 text-right font-medium">D/E</th>
                    <th className="px-2 py-2 text-right font-medium">
                      Cash flow op.
                    </th>
                    <th className="px-2 py-2 text-right font-medium">YTD</th>
                  </tr>
                </thead>
                <tbody>
                  {holdingsByValue.map((h) => {
                    const e = enrichedById.get(h.id);
                    const f = e?.fundamentals;
                    const fcur = f?.currency ?? h.currency;
                    return (
                      <tr
                        key={h.id}
                        className="border-border/60 border-b last:border-b-0"
                      >
                        <td className="py-2 pr-2 pl-4">
                          <Link
                            href={`/assets/${h.id}`}
                            className="font-medium hover:underline"
                          >
                            {h.name}
                          </Link>
                          {h.ticker && (
                            <span className="text-muted-foreground ml-1">
                              {h.ticker}
                            </span>
                          )}
                        </td>
                        <td className="text-muted-foreground px-2 py-2">
                          {f?.sector ?? "—"}
                        </td>
                        <td className="px-2 py-2 text-right">
                          {formatBigNumber(f?.marketCap ?? null, fcur)}
                        </td>
                        <td className="px-2 py-2 text-right">
                          {formatRatio(f?.trailingPE ?? null, 1)}
                        </td>
                        <td className="px-2 py-2 text-right">
                          {f?.debtToEquity != null
                            ? formatRatio(f.debtToEquity / 100, 2)
                            : "—"}
                        </td>
                        <td className="px-2 py-2 text-right">
                          {formatBigNumber(f?.operatingCashflow ?? null, fcur)}
                        </td>
                        <td
                          className={
                            f?.ytdReturn == null
                              ? "text-muted-foreground px-2 py-2 text-right"
                              : f.ytdReturn >= 0
                                ? "text-success px-2 py-2 text-right font-medium"
                                : "text-destructive px-2 py-2 text-right font-medium"
                          }
                        >
                          {f?.ytdReturn != null
                            ? formatPercent(f.ytdReturn)
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mt-3 px-1 text-[11px]">
              D/E exprimé en multiple (Yahoo le publie en %). Cash flow et
              capitalisation dans la devise de reporting de la société.
            </p>
          </CardContent>
        </Card>
      )}

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
            holdings.map((h) => {
              const e = enrichedById.get(h.id);
              return (
                <Link
                  key={h.id}
                  href={`/assets/${h.id}`}
                  className="bg-card flex items-center gap-3 rounded-lg border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{h.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {ASSET_TYPE_LABELS[h.type]} ·{" "}
                      {formatNumber(h.quantity, 4)} u. · PRU{" "}
                      {formatCurrency(h.pru, h.currency)}
                    </p>
                  </div>
                  {e && e.history1y.length >= 2 && (
                    <Sparkline
                      data={e.history1y}
                      positive={h.unrealizedPnl >= 0}
                    />
                  )}
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
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Keep static rendering off — fundamentals/historicals come from Yahoo on demand.
export const dynamic = "force-dynamic";
