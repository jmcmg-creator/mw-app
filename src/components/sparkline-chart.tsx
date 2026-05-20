"use client";

import { useEffect, useState } from "react";

import { LineChart, Line, ResponsiveContainer } from "recharts";

import { fetchSparkline, type SparklinePoint } from "@/actions/fetchSparkline";

function MiniLine({ data }: { data: SparklinePoint[] }) {
  if (data.length < 2) return <div className="bg-muted/20 h-8 w-16 rounded" />;
  const first = data[0].c;
  const last = data[data.length - 1].c;
  const color = last >= first ? "#22c55e" : "#ef4444";
  return (
    <ResponsiveContainer width={72} height={32}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="c"
          dot={false}
          strokeWidth={1.5}
          stroke={color}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SparklineChart({ ticker }: { ticker: string }) {
  const [data, setData] = useState<SparklinePoint[]>([]);

  useEffect(() => {
    fetchSparkline(ticker, 30)
      .then(setData)
      .catch(() => {});
  }, [ticker]);

  return <MiniLine data={data} />;
}
