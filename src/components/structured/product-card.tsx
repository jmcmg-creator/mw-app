import { AlertTriangle, ChevronRight, Info, ShieldAlert } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { BarrierGauge } from "@/components/structured/barrier-gauge";
import { BasketTable } from "@/components/structured/basket-table";
import { ObservationTimeline } from "@/components/structured/observation-timeline";
import { ScenariosPanel } from "@/components/structured/scenarios-panel";
import { StatusBadge } from "@/components/structured/status-badge";
import { formatCurrency } from "@/lib/format";
import type { ProductMetrics } from "@/lib/structured";

const PCT = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const COUPON_TYPE_LABEL: Record<string, string> = {
  FIXED: "Coupon fixe",
  CONTINGENT: "Coupon conditionnel",
  PHOENIX_MEMORY: "Phoenix avec mémoire",
};

const FREQ_LABEL: Record<string, string> = {
  ANNUAL: "annuel",
  SEMI_ANNUAL: "semestriel",
  QUARTERLY: "trimestriel",
  MONTHLY: "mensuel",
};

function Metric({
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
        : "text-foreground";
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
        {label}
      </span>
      <span className={`text-base font-semibold tabular-nums ${toneClass}`}>
        {value}
      </span>
      {hint && (
        <span className="text-muted-foreground text-[11px]">{hint}</span>
      )}
    </div>
  );
}

export function ProductCard({ metrics }: { metrics: ProductMetrics }) {
  const p = metrics.product;
  const currentValue = p.currentValue ?? p.nominalAmount;
  const worstOfName = metrics.worstOf?.name ?? "Worst-of";

  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="flex flex-col gap-5 p-0">
        {/* Header */}
        <header className="flex flex-col gap-3 border-b bg-slate-50/60 px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-semibold tracking-tight">
                  {p.name}
                </h3>
                {p.demo && (
                  <span className="inline-flex shrink-0 items-center rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white uppercase">
                    Demo
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-0.5 truncate text-xs">
                {p.isin && <span className="font-mono">{p.isin}</span>}
                {p.issuer && <span> · {p.issuer}</span>}
                {p.custodian && <span> · {p.custodian}</span>}
              </p>
            </div>
            <StatusBadge status={metrics.status} />
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px]">
            <span className="text-muted-foreground">
              {COUPON_TYPE_LABEL[p.couponType]} ·{" "}
              <span className="text-foreground font-medium">
                {(p.couponRatePerYear * 100).toFixed(2).replace(".", ",")} %
              </span>{" "}
              {FREQ_LABEL[p.couponFrequency]}
            </span>
            <span className="text-muted-foreground">
              Émission ·{" "}
              <span className="text-foreground">
                {DATE_FMT.format(p.issueDate)}
              </span>
            </span>
            <span className="text-muted-foreground">
              Maturité ·{" "}
              <span className="text-foreground">
                {DATE_FMT.format(p.maturityDate)}
              </span>
            </span>
            {p.legalEntity && (
              <span className="text-muted-foreground">
                Entité ·{" "}
                <span className="text-foreground">{p.legalEntity}</span>
              </span>
            )}
          </div>
        </header>

        {/* Alerts */}
        {metrics.alerts.length > 0 && (
          <div className="mx-5 flex flex-col gap-1.5">
            {metrics.alerts.map((a, i) => {
              const palette =
                a.severity === "CRITICAL"
                  ? "border-rose-200 bg-rose-50 text-rose-900"
                  : a.severity === "WARNING"
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-sky-200 bg-sky-50 text-sky-900";
              const Icon =
                a.severity === "CRITICAL"
                  ? ShieldAlert
                  : a.severity === "WARNING"
                    ? AlertTriangle
                    : Info;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-2 rounded-md border px-3 py-2 text-xs ${palette}`}
                >
                  <Icon className="mt-0.5 size-3.5 shrink-0" />
                  <span>{a.message}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-4 px-5 sm:grid-cols-4">
          <Metric
            label="Nominal"
            value={formatCurrency(p.nominalAmount, p.currency)}
          />
          <Metric
            label="Valeur actuelle"
            value={formatCurrency(currentValue, p.currency)}
            hint={
              p.currentValue == null
                ? "Estimé au nominal"
                : `MtM ${DATE_FMT.format(new Date())}`
            }
          />
          <Metric
            label="P&L latent"
            value={PCT.format(metrics.performanceVsNominal)}
            hint={formatCurrency(currentValue - p.nominalAmount, p.currency)}
            tone={metrics.performanceVsNominal >= 0 ? "positive" : "negative"}
          />
          <Metric
            label="Coupons encaissés"
            value={formatCurrency(metrics.paidCoupons, p.currency)}
            hint={`Reste estimé · ${formatCurrency(metrics.expectedRemainingCoupons, p.currency)}`}
          />
        </div>

        <div className="grid gap-5 px-5 lg:grid-cols-2">
          {/* Barrier gauge */}
          <div className="flex flex-col gap-3">
            <h4 className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Barrières & worst-of
            </h4>
            <BarrierGauge
              worstOfPct={metrics.worstOfPct}
              capital={metrics.capital}
              coupon={metrics.coupon}
              autocallBarrierPct={p.autocallBarrierPct}
              worstOfName={worstOfName}
            />
          </div>

          {/* Basket */}
          <div className="flex flex-col gap-3">
            <h4 className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Panier {p.underlyings.length > 1 ? "(worst-of)" : ""}
            </h4>
            <BasketTable
              underlyings={p.underlyings}
              worstOfTicker={metrics.worstOf?.ticker ?? null}
            />
          </div>
        </div>

        {/* Observations */}
        <div className="px-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h4 className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Constatations
            </h4>
            <span className="text-muted-foreground text-[11px]">
              {metrics.nextObservation
                ? `Prochaine · ${DATE_FMT.format(metrics.nextObservation.date)}`
                : metrics.daysToMaturity > 0
                  ? `Maturité · ${metrics.daysToMaturity} j`
                  : "Clôturé"}
            </span>
          </div>
          <ObservationTimeline observations={p.observations} />
        </div>

        {/* Scenarios */}
        <div className="px-5 pb-5">
          <h4 className="text-muted-foreground mb-3 text-[10px] font-semibold tracking-wider uppercase">
            Scénarios à la prochaine constatation / maturité
          </h4>
          <ScenariosPanel scenarios={metrics.scenarios} />
        </div>

        {/* Footer link */}
        <a
          href={`/assets/${p.id}`}
          className="border-t bg-slate-50/60 px-5 py-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          <span className="flex items-center justify-between">
            Détail de l&apos;actif
            <ChevronRight className="size-4" />
          </span>
        </a>
      </CardContent>
    </Card>
  );
}
