import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { getActivePortfolio } from "@/lib/portfolio";
import { formatCurrency, formatDate, toNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/structured/product-card";
import { DEMO_STRUCTURED_PRODUCTS } from "@/lib/structured-mock";
import {
  computeMetrics,
  STATUS_LABEL,
  type ProductMetrics,
  type StructuredProduct,
  type StructuredStatus,
} from "@/lib/structured";

const PCT = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

const FILTERS: Array<{
  key: StatusFilter;
  label: string;
  statuses: StructuredStatus[];
}> = [
  {
    key: "ALL",
    label: "Tous",
    statuses: [
      "NORMAL",
      "WATCHLIST",
      "NEAR_BARRIER",
      "BREACHED_COUPON",
      "BREACHED_CAPITAL",
      "AUTOCALLED",
      "MATURED",
    ],
  },
  { key: "WATCH", label: "Watchlist", statuses: ["WATCHLIST"] },
  {
    key: "RISK",
    label: "Proche barrière",
    statuses: ["NEAR_BARRIER"],
  },
  {
    key: "BREACHED",
    label: "Barrière franchie",
    statuses: ["BREACHED_COUPON", "BREACHED_CAPITAL"],
  },
  {
    key: "CLOSED",
    label: "Autocallés / matures",
    statuses: ["AUTOCALLED", "MATURED"],
  },
];

type StatusFilter = "ALL" | "WATCH" | "RISK" | "BREACHED" | "CLOSED";

async function loadRealProducts(
  portfolioId: string,
): Promise<StructuredProduct[]> {
  const assets = await prisma.asset.findMany({
    where: {
      portfolioId,
      type: "STRUCTURE",
    },
    include: {
      structuredDetails: {
        include: {
          observationDates: { orderBy: { observationDate: "asc" } },
        },
      },
    },
  });

  const products: StructuredProduct[] = [];
  for (const asset of assets) {
    const sd = asset.structuredDetails;
    if (!sd) continue;
    const nominal =
      toNumber(sd.nominalAmount) ||
      toNumber(asset.cachedQuantity) * toNumber(asset.cachedPru);
    const strike = toNumber(sd.strike_price);
    if (nominal <= 0 || strike <= 0) continue;
    const marketPrice = toNumber(asset.cachedMarketPrice);
    products.push({
      id: asset.id,
      name: asset.name,
      isin: sd.isin ?? asset.isin ?? null,
      issuer: sd.issuer ?? null,
      currency: asset.currency,
      custodian: asset.custodian,
      legalEntity: asset.legalEntity,
      nominalAmount: nominal,
      currentValue:
        marketPrice > 0 ? toNumber(asset.cachedQuantity) * marketPrice : null,
      couponRatePerYear: toNumber(sd.coupon_rate),
      couponFrequency: "ANNUAL", // Schema has no explicit frequency yet.
      couponType: "CONTINGENT",
      capitalBarrierPct:
        sd.capital_barrier == null ? null : Number(sd.capital_barrier),
      couponBarrierPct:
        sd.coupon_barrier == null ? null : Number(sd.coupon_barrier),
      autocallBarrierPct:
        sd.autocall_barrier == null ? null : Number(sd.autocall_barrier),
      issueDate: sd.issueDate ?? asset.createdAt,
      maturityDate: sd.maturityDate ?? asset.createdAt,
      underlyings: [
        {
          ticker: sd.underlying_ticker,
          name: sd.underlying_ticker,
          strikePrice: strike,
          spotPrice: marketPrice > 0 ? marketPrice : strike,
        },
      ],
      observations: sd.observationDates.map((o) => ({
        sequence: o.sequence,
        date: o.observationDate,
        outcome: o.outcome,
        couponPaid: o.couponPaid == null ? null : Number(o.couponPaid),
      })),
      demo: false,
    });
  }
  return products;
}

function KpiTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "positive" | "negative" | "neutral";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-700"
      : tone === "negative"
        ? "text-rose-700"
        : "text-slate-900";
  return (
    <div className="flex flex-col gap-1 border-l border-slate-200 px-4 first:border-l-0 first:pl-0">
      <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
        {label}
      </span>
      <span
        className={`text-xl font-semibold tracking-tight tabular-nums ${toneClass}`}
      >
        {value}
      </span>
      {hint && (
        <span className="text-[11px] text-slate-500 tabular-nums">{hint}</span>
      )}
    </div>
  );
}

export default async function StructuredProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const userId = await requireUserId();
  const portfolio = await getActivePortfolio(userId);
  const baseCurrency = portfolio.baseCurrency;

  const params = await searchParams;
  const activeFilter: StatusFilter = (params.filter as StatusFilter) || "ALL";

  const now = new Date();
  const realProducts = await loadRealProducts(portfolio.id);
  const products = [...realProducts, ...DEMO_STRUCTURED_PRODUCTS];
  const allMetrics: ProductMetrics[] = products.map((p) =>
    computeMetrics(p, now),
  );

  const active = FILTERS.find((f) => f.key === activeFilter) ?? FILTERS[0];
  const filtered = allMetrics.filter((m) => active.statuses.includes(m.status));
  const counts: Record<StatusFilter, number> = {
    ALL: allMetrics.length,
    WATCH: 0,
    RISK: 0,
    BREACHED: 0,
    CLOSED: 0,
  };
  for (const m of allMetrics) {
    for (const f of FILTERS) {
      if (f.key === "ALL") continue;
      if (f.statuses.includes(m.status)) counts[f.key]++;
    }
  }

  const totalNominal = allMetrics.reduce(
    (s, m) => s + m.product.nominalAmount,
    0,
  );
  const totalValue = allMetrics.reduce(
    (s, m) => s + (m.product.currentValue ?? m.product.nominalAmount),
    0,
  );
  const totalPaidCoupons = allMetrics.reduce((s, m) => s + m.paidCoupons, 0);
  const totalExpected = allMetrics.reduce(
    (s, m) => s + m.expectedRemainingCoupons,
    0,
  );
  const totalPnl = totalValue - totalNominal;
  const totalPnlPct = totalNominal > 0 ? totalPnl / totalNominal : 0;

  const nextEvent = allMetrics
    .map((m) => m.nextObservation)
    .filter((o): o is NonNullable<typeof o> => !!o)
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

  const criticalAlerts = allMetrics.flatMap((m) =>
    m.alerts
      .filter((a) => a.severity !== "INFO")
      .map((a) => ({
        productName: m.product.name,
        productId: m.product.id,
        ...a,
      })),
  );

  const breachedCount =
    counts.BREACHED +
    allMetrics.filter((m) => m.status === "NEAR_BARRIER").length;

  // Sort: critical / near-barrier first, then watchlist, then normal, then closed
  const statusRank: Record<StructuredStatus, number> = {
    BREACHED_CAPITAL: 0,
    BREACHED_COUPON: 1,
    NEAR_BARRIER: 2,
    WATCHLIST: 3,
    NORMAL: 4,
    AUTOCALLED: 5,
    MATURED: 6,
  };
  const sorted = [...filtered].sort(
    (a, b) =>
      statusRank[a.status] - statusRank[b.status] ||
      b.product.nominalAmount - a.product.nominalAmount,
  );

  return (
    <div className="flex flex-col gap-6 pt-2">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild aria-label="Retour">
            <Link href="/analyse">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Structured Products
            </h1>
            <span className="text-sm text-slate-500">
              {allMetrics.length} produit{allMetrics.length > 1 ? "s" : ""}
              {breachedCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200 ring-inset">
                  <ShieldAlert className="size-3" />
                  {breachedCount} à surveiller
                </span>
              )}
            </span>
          </div>
        </div>
        <p className="ml-10 text-sm text-slate-500">
          Suivi des barrières, des coupons à venir et des scénarios à maturité
          pour chaque produit structuré du portefeuille.
        </p>
      </div>

      {/* Hero KPI strip */}
      <Card className="py-0">
        <CardContent className="grid grid-cols-2 gap-y-5 px-6 py-5 sm:flex sm:flex-wrap sm:justify-between">
          <KpiTile
            label="Nominal investi"
            value={formatCurrency(totalNominal, baseCurrency)}
            hint={`${allMetrics.length} produits`}
          />
          <KpiTile
            label="Valeur actuelle"
            value={formatCurrency(totalValue, baseCurrency)}
            hint="Marked-to-market"
          />
          <KpiTile
            label="P&L latent"
            value={`${formatCurrency(totalPnl, baseCurrency)}`}
            hint={PCT.format(totalPnlPct)}
            tone={totalPnl >= 0 ? "positive" : "negative"}
          />
          <KpiTile
            label="Coupons encaissés"
            value={formatCurrency(totalPaidCoupons, baseCurrency)}
            hint={`+${formatCurrency(totalExpected, baseCurrency)} attendus`}
          />
          <KpiTile
            label="Prochaine constatation"
            value={nextEvent ? formatDate(nextEvent.date) : "—"}
            hint={
              nextEvent
                ? `Dans ${Math.max(
                    0,
                    Math.ceil(
                      (nextEvent.date.getTime() - now.getTime()) / 86_400_000,
                    ),
                  )} jours`
                : "Aucune"
            }
          />
        </CardContent>
      </Card>

      {/* Critical alerts strip */}
      {criticalAlerts.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-rose-200 bg-rose-50/40 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-rose-800 uppercase">
            <ShieldAlert className="size-4" />
            Alertes à traiter cette semaine
          </div>
          <ul className="flex flex-col gap-1.5">
            {criticalAlerts.slice(0, 4).map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span
                  className={`mt-0.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full ${
                    a.severity === "CRITICAL" ? "bg-rose-500" : "bg-amber-500"
                  }`}
                />
                <span className="text-slate-800">
                  <span className="font-medium">{a.productName}</span>
                  <span className="text-slate-500"> · </span>
                  {a.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filter tabs */}
      <div className="-mb-2 flex flex-wrap gap-1 border-b border-slate-200">
        {FILTERS.map((f) => {
          const count = f.key === "ALL" ? counts.ALL : counts[f.key];
          const isActive = f.key === activeFilter;
          return (
            <Link
              key={f.key}
              href={`/structured-products${f.key === "ALL" ? "" : `?filter=${f.key}`}`}
              className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {f.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Products grid */}
      {sorted.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-500">
            Aucun produit dans cette catégorie ·{" "}
            {STATUS_LABEL[active.statuses[0]] ?? active.label}.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {sorted.map((m) => (
            <ProductCard key={m.product.id} metrics={m} />
          ))}
        </div>
      )}
    </div>
  );
}
