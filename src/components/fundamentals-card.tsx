import Link from "next/link";

import { formatPercent } from "@/lib/format";
import type { Fundamentals } from "@/actions/fetchFundamentals";

export type FundamentalsCardData = {
  id: string;
  name: string;
  ticker: string | null;
  fundamentals: Fundamentals | null;
};

function formatBigNumber(value: number | null, currency?: string): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  const fmt = (n: number, suffix: string) =>
    `${sign}${n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2)}${suffix}`;
  let body: string;
  if (abs >= 1e12) body = fmt(abs / 1e12, "T");
  else if (abs >= 1e9) body = fmt(abs / 1e9, "B");
  else if (abs >= 1e6) body = fmt(abs / 1e6, "M");
  else if (abs >= 1e3) body = fmt(abs / 1e3, "k");
  else body = `${sign}${abs.toFixed(0)}`;
  return currency ? `${body} ${currency}` : body;
}

function formatRatio(value: number | null, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toFixed(digits);
}

function Metric({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-muted/50 flex flex-col gap-0.5 rounded-lg px-2.5 py-2">
      <span className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
        {label}
      </span>
      <span
        className={
          positive === undefined
            ? "text-sm font-semibold tabular-nums"
            : positive
              ? "text-success text-sm font-semibold tabular-nums"
              : "text-destructive text-sm font-semibold tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Per-holding fundamentals card: name + sector chip + 3×2 grid of metric
 * tiles (market cap, PER, debt/equity, cash flow, YTD, fwd PE). Replaces
 * the overflowing table on narrow screens.
 */
export function FundamentalsCard({ data }: { data: FundamentalsCardData }) {
  const f = data.fundamentals;
  const fcur = f?.currency ?? undefined;
  const debtRatio = f?.debtToEquity != null ? f.debtToEquity / 100 : null;

  return (
    <Link
      href={`/assets/${data.id}`}
      className="bg-card hover:border-foreground/20 flex flex-col gap-3 rounded-xl border px-3 py-3 transition-colors"
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{data.name}</p>
          {(f?.sector || data.ticker) && (
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {f?.sector && (
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium">
                  {f.sector}
                </span>
              )}
              {data.ticker && (
                <span className="text-muted-foreground text-[11px]">
                  {data.ticker}
                </span>
              )}
            </div>
          )}
        </div>
        {f?.ytdReturn != null && (
          <span
            className={
              f.ytdReturn >= 0
                ? "bg-success/10 text-success rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap tabular-nums"
                : "bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap tabular-nums"
            }
          >
            YTD {formatPercent(f.ytdReturn)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <Metric
          label="Market cap"
          value={formatBigNumber(f?.marketCap ?? null, fcur)}
        />
        <Metric label="PER" value={formatRatio(f?.trailingPE ?? null, 1)} />
        <Metric label="D/E" value={formatRatio(debtRatio, 2)} />
        <Metric
          label="Cash flow"
          value={formatBigNumber(f?.operatingCashflow ?? null, fcur)}
        />
        <Metric
          label="Free CF"
          value={formatBigNumber(f?.freeCashflow ?? null, fcur)}
        />
        <Metric label="PER fwd" value={formatRatio(f?.forwardPE ?? null, 1)} />
      </div>
    </Link>
  );
}
