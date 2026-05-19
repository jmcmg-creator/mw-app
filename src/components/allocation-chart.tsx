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
}: {
  data: AllocationSlice[];
  total: number;
}) {
  if (data.length === 0 || total <= 0) return null;

  return (
    <div className="flex items-center gap-5">
      <div className="size-28 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="100%"
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((slice) => (
                <Cell key={slice.label} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="flex flex-1 flex-col gap-1.5">
        {data.map((slice) => (
          <li key={slice.label} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-muted-foreground flex-1 truncate">
              {slice.label}
            </span>
            <span className="font-medium">
              {Math.round((slice.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
