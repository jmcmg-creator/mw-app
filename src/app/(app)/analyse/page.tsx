import Link from "next/link";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { getActivePortfolio } from "@/lib/portfolio";
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
import {
  PortfolioHistoryChart,
  type PortfolioHistorySeries,
} from "@/components/portfolio-history-chart";
import { HoldingRow } from "@/components/holding-row";
import { FundamentalsCard } from "@/components/fundamentals-card";
import { AutoRefresh } from "@/components/auto-refresh";
import { CashFlowCalendar } from "@/components/cash-flow-calendar";
import {
  groupByMonth,
  projectBondCashFlows,
  projectStructuredCashFlows,
} from "@/lib/cashflows";
import { backfillBondDetails } from "@/actions/backfillBondDetails";

const ALLOCATION_COLORS: Record<string, string> = {
  ACTION: "oklch(0.55 0.18 264)",
  ETF: "oklch(0.65 0.16 162)",
  OBLIGATION: "oklch(0.75 0.16 70)",
  STRUCTURE: "oklch(0.6 0.2 303)",
  IMMO: "oklch(0.65 0.13 184)",
  SECURISE: "oklch(0.55 0.04 257)",
};

const PALETTE = [
  "oklch(0.55 0.18 264)",
  "oklch(0.65 0.16 162)",
  "oklch(0.75 0.16 70)",
  "oklch(0.6 0.2 303)",
  "oklch(0.65 0.13 184)",
  "oklch(0.62 0.22 27)",
  "oklch(0.7 0.16 130)",
  "oklch(0.6 0.22 350)",
  "oklch(0.7 0.14 195)",
  "oklch(0.55 0.2 285)",
  "oklch(0.66 0.2 45)",
  "oklch(0.55 0.04 257)",
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
    <div className="bg-card flex flex-col gap-1 rounded-xl border px-3 py-3">
      <span className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
        {label}
      </span>
      <span className="text-base font-bold tracking-tight tabular-nums">
        {value}
      </span>
      {delta && (
        <span
          className={
            positive === undefined
              ? "text-muted-foreground text-[11px] tabular-nums"
              : positive
                ? "text-success text-[11px] font-medium tabular-nums"
                : "text-destructive text-[11px] font-medium tabular-nums"
          }
        >
          {delta}
        </span>
      )}
    </div>
  );
}

export default async function AnalysePage() {
  const userId = await requireUserId();
  const portfolio = await getActivePortfolio(userId);
  const baseCurrency = portfolio.baseCurrency;

  // Best-effort: parse coupon/maturity from bond names so the cash flow
  // calendar surfaces something on first load without manual editing.
  await backfillBondDetails(portfolio.id);

  const rawAssets = await prisma.asset.findMany({
    where: {
      portfolioId: portfolio.id,
      type: { in: ["ACTION", "ETF", "STRUCTURE", "OBLIGATION", "SECURISE"] },
    },
    include: {
      transactions: { orderBy: { date: "desc" } },
      structuredDetails: {
        include: {
          observationDates: { orderBy: { observationDate: "asc" } },
        },
      },
      bondDetails: true,
    },
  });

  const holdings = rawAssets.map((asset) => buildHolding(asset as RawAsset));
  const metrics = computePortfolioMetrics(holdings);

  const now = new Date();
  const cashFlows = rawAssets.flatMap((a) => {
    if (a.type === "OBLIGATION")
      return projectBondCashFlows(
        {
          id: a.id,
          name: a.name,
          currency: a.currency,
          bondDetails: a.bondDetails,
          cachedQuantity: a.cachedQuantity,
          cachedPru: a.cachedPru,
        },
        now,
      );
    if (a.type === "STRUCTURE")
      return projectStructuredCashFlows(
        {
          id: a.id,
          name: a.name,
          currency: a.currency,
          structuredDetails: a.structuredDetails,
          cachedQuantity: a.cachedQuantity,
          cachedPru: a.cachedPru,
        },
        now,
      );
    return [];
  });
  const cashFlowMonths = groupByMonth(cashFlows);

  // Tickerable assets (those we can ask Yahoo about). Skip fully-sold positions.
  const tickered = rawAssets.filter(
    (a) => a.ticker && toNumber(a.cachedQuantity) > 0,
  );

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
      color: PALETTE[i % PALETTE.length],
    }));

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
      color: ALLOCATION_COLORS[type] ?? PALETTE[0],
    }))
    .sort((a, b) => b.value - a.value);

  const currencySlices: AllocationSlice[] = Object.entries(metrics.byCurrency)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([code, value], index) => ({
      label: code,
      value,
      color: PALETTE[index % PALETTE.length],
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
    <div className="flex flex-col gap-5 pt-2">
      <AutoRefresh />
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild aria-label="Retour">
          <Link href="/dashboard">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">Analyse</h1>
      </div>

      <Card className="py-5">
        <CardContent>
          <PortfolioHistoryChart
            series={portfolioHistory}
            currency={baseCurrency}
            currentValue={metrics.totalValue}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi
          label="Investi"
          value={formatCurrency(metrics.totalInvested, baseCurrency)}
        />
        <Kpi
          label="+/- value"
          value={formatCurrency(metrics.unrealizedPnl, baseCurrency)}
          delta={
            metrics.hasAnyMarketPrice && metrics.pricedCoverage < 0.999
              ? `${formatPercent(metrics.unrealizedPnlPct)} · sur ${formatPercent(metrics.pricedCoverage)}`
              : formatPercent(metrics.unrealizedPnlPct)
          }
          positive={
            metrics.unrealizedPnl > 0
              ? true
              : metrics.unrealizedPnl < 0
                ? false
                : undefined
          }
        />
        <Kpi
          label="Dividendes"
          value={formatCurrency(metrics.totalDividends, baseCurrency)}
        />
        <Kpi
          label="Positions"
          value={String(holdings.length)}
          delta={`Top 5 · ${(metrics.topConcentration * 100).toLocaleString(
            "fr-FR",
            { maximumFractionDigits: 0 },
          )} %`}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {allocation.length > 0 && (
          <Card className="py-5">
            <CardHeader>
              <CardTitle className="text-sm font-semibold tracking-wide uppercase">
                Classe d&apos;actif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AllocationChart
                data={allocation}
                total={metrics.totalValue}
                centerLabel="Total"
                centerValue={formatCurrency(
                  metrics.totalValue,
                  baseCurrency,
                ).replace(/\s+€$/, " €")}
              />
            </CardContent>
          </Card>
        )}

        {sectorSlices.length > 0 && (
          <Card className="py-5">
            <CardHeader>
              <CardTitle className="text-sm font-semibold tracking-wide uppercase">
                Secteur
              </CardTitle>
              <CardDescription>
                Sur{" "}
                {formatPercent(
                  metrics.totalValue > 0
                    ? sectorClassified / metrics.totalValue
                    : 0,
                )}{" "}
                des positions tickerées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AllocationChart
                data={sectorSlices}
                total={sectorClassified}
                centerLabel="Classifiés"
                centerValue={`${sectorSlices.length}`}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {currencySlices.length > 0 && (
        <Card className="py-5">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-wide uppercase">
              Devise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart
              data={currencySlices}
              total={metrics.totalValue}
              centerLabel="Devises"
              centerValue={`${currencySlices.length}`}
            />
          </CardContent>
        </Card>
      )}

      {treemap.length > 0 && (
        <Card className="py-5">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-wide uppercase">
              Cartographie
            </CardTitle>
            <CardDescription>
              Taille = poids · couleur = performance
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
            <Card className="py-5">
              <CardHeader>
                <CardTitle className="text-success flex items-center gap-1.5 text-sm font-semibold tracking-wide uppercase">
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
                    <span className="text-success font-semibold tabular-nums">
                      {formatPercent(h.unrealizedPnlPct)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {metrics.losers.length > 0 && (
            <Card className="py-5">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-1.5 text-sm font-semibold tracking-wide uppercase">
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
                    <span className="text-destructive font-semibold tabular-nums">
                      {formatPercent(h.unrealizedPnlPct)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="py-5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wide uppercase">
            Concentration
          </CardTitle>
          <CardDescription>
            HHI {formatNumber(metrics.hhi * 10000, 0)} sur 10 000
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {metrics.topByValue.map((h, i) => {
            const value = h.marketValue > 0 ? h.marketValue : h.invested;
            const share =
              metrics.totalValue > 0 ? value / metrics.totalValue : 0;
            return (
              <div key={h.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <Link
                    href={`/assets/${h.id}`}
                    className="text-foreground/90 flex min-w-0 items-center gap-2 truncate hover:underline"
                  >
                    <span className="bg-muted text-muted-foreground inline-flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold">
                      {i + 1}
                    </span>
                    <span className="truncate">{h.name}</span>
                  </Link>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {formatPercent(share)}
                  </span>
                </div>
                <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${Math.min(100, share * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            Positions
          </h2>
          <span className="text-muted-foreground text-xs tabular-nums">
            {holdings.length}
          </span>
        </div>
        {holdings.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-6 text-center text-sm">
              Aucune position. Importe ton portefeuille depuis le dashboard.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {holdingsByValue.map((h) => {
              const e = enrichedById.get(h.id);
              return (
                <HoldingRow
                  key={h.id}
                  holding={h}
                  history={e?.history1y}
                  href={`/assets/${h.id}`}
                />
              );
            })}
          </div>
        )}
      </section>

      <CashFlowCalendar months={cashFlowMonths} baseCurrency={baseCurrency} />

      {hasAnyFundamentals && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-sm font-semibold tracking-wide uppercase">
              Fondamentaux
            </h2>
            <span className="text-muted-foreground text-[11px]">
              Source · Yahoo Finance
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {holdingsByValue
              .filter((h) => enrichedById.get(h.id)?.fundamentals)
              .map((h) => {
                const e = enrichedById.get(h.id)!;
                return (
                  <FundamentalsCard
                    key={h.id}
                    data={{
                      id: h.id,
                      name: h.name,
                      ticker: h.ticker,
                      fundamentals: e.fundamentals,
                    }}
                  />
                );
              })}
          </div>
        </section>
      )}

      {structured.length > 0 && (
        <Card className="py-5">
          <CardHeader>
            <div className="flex items-baseline justify-between gap-2">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase">
                Produits structurés
              </CardTitle>
              <Link
                href="/structured-products"
                className="text-xs font-medium text-slate-700 hover:underline"
              >
                Vue dédiée →
              </Link>
            </div>
            <CardDescription>
              Évaluation live sur la page de chaque produit
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {structured.map((asset) => {
              const details = asset.structuredDetails!;
              return (
                <Link
                  key={asset.id}
                  href={`/assets/${asset.id}`}
                  className="bg-card hover:bg-accent/40 flex flex-col gap-1.5 rounded-lg border px-3 py-2.5 text-xs transition-colors"
                >
                  <span className="text-sm font-semibold">{asset.name}</span>
                  <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 tabular-nums">
                    <span>Sous-jacent {details.underlying_ticker}</span>
                    <span>
                      Strike {formatNumber(toNumber(details.strike_price))}
                    </span>
                    <span>
                      Coupon {formatPercent(toNumber(details.coupon_rate))}
                    </span>
                    {details.capital_barrier != null && (
                      <span>
                        Capital{" "}
                        {formatPercent(toNumber(details.capital_barrier))}
                      </span>
                    )}
                    {details.autocall_barrier != null && (
                      <span>
                        Autocall{" "}
                        {formatPercent(toNumber(details.autocall_barrier))}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
