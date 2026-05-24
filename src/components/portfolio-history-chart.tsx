"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/format";
import type { HistoricalRange } from "@/actions/fetchHistorical";

export type PortfolioHistoryPoint = { t: number; value: number };

export type PortfolioHistorySeries = Record<
  HistoricalRange,
  PortfolioHistoryPoint[]
>;

const RANGES: { key: HistoricalRange; label: string }[] = [
  { key: "1y", label: "1A" },
  { key: "3y", label: "3A" },
  { key: "5y", label: "5A" },
];

/**
 * Hero portfolio chart: the big patrimoine value, period delta and an area
 * chart with 1A/3A/5A tabs, designed to feel like the top section of a
 * proper wealth-management dashboard.
 */
export function PortfolioHistoryChart({
  series,
  currency,
  currentValue,
}: {
  series: PortfolioHistorySeries;
  currency: string;
  /** Today's portfolio value, used when the historical series can't reach it. */
  currentValue?: number;
}) {
  const [range, setRange] = useState<HistoricalRange>("1y");
  const data = series[range];

  const stats = useMemo(() => {
    if (data.length < 2) return null;
    const first = data[0].value;
    const last = currentValue ?? data[data.length - 1].value;
    if (!first) return null;
    return {
      first,
      last,
      delta: last - first,
      pct: (last - first) / first,
      positive: last >= first,
    };
  }, [data, currentValue]);

  const isPositive = stats?.positive ?? true;
  const stroke = isPositive ? "var(--success)" : "var(--destructive)";
  const fillId = `portfolioFill-${range}-${isPositive ? "u" : "d"}`;

  const headline = currentValue ?? stats?.last ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
            Patrimoine
          </span>
          <span className="text-3xl font-bold tracking-tight tabular-nums">
            {formatCurrency(headline, currency)}
          </span>
          {stats && (
            <div className="flex items-center gap-2">
              <span
                className={
                  isPositive
                    ? "bg-success/10 text-success rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
                    : "bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
                }
              >
                {isPositive ? "▲" : "▼"} {Math.abs(stats.pct * 100).toFixed(1)}%
              </span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {stats.delta >= 0 ? "+" : "−"}
                {formatCurrency(Math.abs(stats.delta), currency)}
              </span>
            </div>
          )}
        </div>

        <div className="bg-muted/60 flex gap-0.5 rounded-lg p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={
                range === r.key
                  ? "bg-card text-foreground rounded-md px-2.5 py-1 text-xs font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground rounded-md px-2.5 py-1 text-xs font-medium"
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-44 w-full">
        {data.length < 2 ? (
          <div className="bg-muted/30 text-muted-foreground flex h-full items-center justify-center rounded-lg text-sm">
            Historique indisponible.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="t"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(t) =>
                  new Date(t).toLocaleDateString("fr-FR", {
                    month: "short",
                    year: "2-digit",
                  })
                }
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={["dataMin", "dataMax"]}
                tickFormatter={(v) => {
                  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
                  return v.toFixed(0);
                }}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                  padding: "6px 10px",
                }}
                labelStyle={{
                  color: "var(--muted-foreground)",
                  fontSize: 11,
                  marginBottom: 2,
                }}
                cursor={{
                  stroke: "var(--muted-foreground)",
                  strokeDasharray: "3 3",
                  strokeOpacity: 0.6,
                }}
                labelFormatter={(t) =>
                  new Date(Number(t)).toLocaleDateString("fr-FR", {
                    dateStyle: "medium",
                  })
                }
                formatter={(value) => [
                  formatCurrency(Number(value) || 0, currency),
                  "Portefeuille",
                ]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={stroke}
                strokeWidth={2}
                fill={`url(#${fillId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
