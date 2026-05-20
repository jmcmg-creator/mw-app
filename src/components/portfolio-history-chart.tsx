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

export function PortfolioHistoryChart({
  series,
  currency,
}: {
  series: PortfolioHistorySeries;
  currency: string;
}) {
  const [range, setRange] = useState<HistoricalRange>("1y");
  const data = series[range];

  const stats = useMemo(() => {
    if (data.length < 2) return null;
    const first = data[0].value;
    const last = data[data.length - 1].value;
    if (!first) return null;
    return {
      delta: last - first,
      pct: (last - first) / first,
      positive: last >= first,
    };
  }, [data]);

  const isPositive = stats?.positive ?? true;
  const stroke = isPositive ? "#10b981" : "#ef4444";
  const fillId = isPositive ? "portfolioFillUp" : "portfolioFillDown";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={
                range === r.key
                  ? "bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs font-medium"
                  : "text-muted-foreground hover:bg-muted rounded-md px-2 py-1 text-xs font-medium"
              }
            >
              {r.label}
            </button>
          ))}
        </div>
        {stats && (
          <span
            className={
              isPositive
                ? "text-success text-xs font-medium"
                : "text-destructive text-xs font-medium"
            }
          >
            {formatCurrency(stats.delta, currency)} (
            {(stats.pct * 100).toFixed(1)}%)
          </span>
        )}
      </div>

      <div className="h-56 w-full">
        {data.length < 2 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            Historique indisponible.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
            >
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
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
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
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
