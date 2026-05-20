"use client";

import { ResponsiveContainer, Treemap } from "recharts";

export type TreemapCell = {
  name: string;
  value: number;
  pnlPct: number;
};

function colorFor(pnlPct: number): string {
  if (pnlPct > 0.05) return "#10b981";
  if (pnlPct > 0) return "#34d399";
  if (pnlPct > -0.05) return "#fb923c";
  return "#ef4444";
}

type CellRenderProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  pnlPct?: number;
};

function Cell(props: CellRenderProps) {
  const { x = 0, y = 0, width = 0, height = 0, name = "", pnlPct = 0 } = props;
  const fill = colorFor(pnlPct);
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{ fill, stroke: "#ffffff", strokeWidth: 2 }}
      />
      {width > 50 && height > 30 && (
        <>
          <text
            x={x + 6}
            y={y + 16}
            fontSize={11}
            fontWeight={600}
            fill="white"
          >
            {name.length > 18 ? name.slice(0, 17) + "…" : name}
          </text>
          <text x={x + 6} y={y + 30} fontSize={10} fill="white" opacity={0.85}>
            {(pnlPct * 100).toFixed(1)}%
          </text>
        </>
      )}
    </g>
  );
}

export function HoldingsTreemap({ data }: { data: TreemapCell[] }) {
  if (data.length === 0) return null;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="value"
          nameKey="name"
          stroke="#ffffff"
          content={<Cell />}
        />
      </ResponsiveContainer>
    </div>
  );
}
