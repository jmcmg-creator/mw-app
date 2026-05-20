"use client";

import { useEffect, useState, useTransition } from "react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  fetchPortfolioHistory,
  type HistoryPoint,
  type Period,
} from "@/actions/fetchPortfolioHistory";

const PERIODS: Period[] = ["1y", "3y", "5y"];

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);

const fmtDate = (t: number) =>
  new Date(t).toLocaleDateString("fr-FR", {
    month: "short",
    year: "2-digit",
  });

export function PortfolioHistoryChart() {
  const [period, setPeriod] = useState<Period>("1y");
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      fetchPortfolioHistory(period)
        .then(setData)
        .catch(() => {});
    });
  }, [period]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
              period === p
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {pending || data.length === 0 ? (
        <div className="bg-muted/20 h-44 animate-pulse rounded-lg" />
      ) : (
        <ResponsiveContainer width="100%" height={176}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="hist-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="t"
              tickFormatter={fmtDate}
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              minTickGap={60}
            />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              formatter={(v) => [fmtCurrency(v as number), "Valeur"]}
              labelFormatter={(v) =>
                new Date(v).toLocaleDateString("fr-FR", { dateStyle: "medium" })
              }
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
              }}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke="#3b82f6"
              fill="url(#hist-fill)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
