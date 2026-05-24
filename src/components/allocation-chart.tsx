"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

export type AllocationSlice = {
  label: string;
  value: number;
  color: string;
};

export function AllocationChart({
  data,
  total,
  centerLabel,
  centerValue,
}: {
  data: AllocationSlice[];
  total: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  if (data.length === 0 || total <= 0) return null;

  const top = data[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative mx-auto size-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="68%"
              outerRadius="100%"
              stroke="var(--background)"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              paddingAngle={data.length > 1 ? 1.5 : 0}
            >
              {data.map((slice) => (
                <Cell key={slice.label} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
            {centerLabel ?? top.label}
          </span>
          <span className="text-lg font-bold tracking-tight tabular-nums">
            {centerValue ?? `${Math.round((top.value / total) * 100)}%`}
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {data.map((slice) => {
          const pct = (slice.value / total) * 100;
          return (
            <li key={slice.label} className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-foreground flex-1 truncate font-medium">
                  {slice.label}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {pct >= 1 ? pct.toFixed(0) : pct.toFixed(1)}%
                </span>
              </div>
              <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(2, pct)}%`,
                    backgroundColor: slice.color,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
