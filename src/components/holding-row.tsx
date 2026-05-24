import Link from "next/link";

import { ASSET_TYPE_LABELS, formatCurrency, formatPercent } from "@/lib/format";
import { Sparkline } from "@/components/sparkline";
import type { HistoricalPoint } from "@/actions/fetchHistorical";

export type HoldingRowData = {
  id: string;
  name: string;
  type: string;
  ticker: string | null;
  currency: string;
  quantity: number;
  marketValue: number;
  invested: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  hasMarketPrice: boolean;
};

const TYPE_COLORS: Record<string, string> = {
  ACTION: "var(--chart-3)",
  ETF: "var(--success)",
  OBLIGATION: "var(--warning)",
  STRUCTURE: "var(--chart-4)",
  IMMO: "var(--chart-2)",
  SECURISE: "var(--muted-foreground)",
};

/**
 * Sleek single-row card with a colored type stripe, sparkline and aligned
 * value/perf column. Designed for tight mobile layouts.
 */
export function HoldingRow({
  holding,
  history,
  href,
}: {
  holding: HoldingRowData;
  history?: HistoricalPoint[];
  href: string;
}) {
  const value = holding.hasMarketPrice ? holding.marketValue : holding.invested;
  const positive = holding.unrealizedPnl >= 0;
  const stripeColor = TYPE_COLORS[holding.type] ?? TYPE_COLORS.SECURISE;

  let perfClass = "text-muted-foreground text-xs tabular-nums";
  if (holding.hasMarketPrice && holding.invested > 0) {
    perfClass = positive
      ? "text-success text-xs font-medium tabular-nums"
      : "text-destructive text-xs font-medium tabular-nums";
  }

  return (
    <Link
      href={href}
      className="bg-card hover:bg-accent/40 group relative flex items-center gap-3 overflow-hidden rounded-xl border px-3 py-3 transition-colors"
    >
      <span
        aria-hidden
        className="absolute top-2 bottom-2 left-0 w-1 rounded-r-full"
        style={{ backgroundColor: stripeColor }}
      />

      <div className="min-w-0 flex-1 pl-2">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold">{holding.name}</p>
        </div>
        <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 truncate text-[11px]">
          <span
            className="bg-muted text-foreground rounded px-1 py-px text-[10px] font-medium tracking-wide uppercase"
            style={{ color: stripeColor }}
          >
            {ASSET_TYPE_LABELS[holding.type] ?? holding.type}
          </span>
          {holding.ticker && <span className="truncate">{holding.ticker}</span>}
        </p>
      </div>

      {history && history.length >= 2 && (
        <div className="xs:block hidden">
          <Sparkline data={history} positive={positive} />
        </div>
      )}

      <div className="flex flex-col items-end">
        <span className="text-sm font-semibold tabular-nums">
          {formatCurrency(value, holding.currency)}
        </span>
        {holding.invested > 0 && (
          <span className={perfClass}>
            {formatPercent(holding.unrealizedPnlPct)}
          </span>
        )}
      </div>
    </Link>
  );
}
