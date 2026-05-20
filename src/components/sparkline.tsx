"use client";

type Point = { t: number; close: number };

/**
 * Inline mini chart with no axes — rendered as a single SVG path so it stays
 * crisp at any size and adds zero runtime overhead compared to recharts.
 */
export function Sparkline({
  data,
  width = 96,
  height = 28,
  positive,
}: {
  data: Point[];
  width?: number;
  height?: number;
  positive?: boolean;
}) {
  if (data.length < 2) {
    return (
      <div
        style={{ width, height }}
        className="bg-muted/40 rounded-sm"
        aria-hidden
      />
    );
  }

  const closes = data.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;

  const stepX = width / (data.length - 1);
  const points = data
    .map((p, i) => {
      const x = i * stepX;
      const y = height - ((p.close - min) / span) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const auto = data[data.length - 1].close >= data[0].close;
  const isPositive = positive ?? auto;
  const stroke = isPositive ? "#10b981" : "#ef4444";
  const fill = isPositive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)";

  const area = `M0,${height} L${points} L${width},${height} Z`;
  const line = `M${points}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Historique du cours"
      className="block"
    >
      <path d={area} fill={fill} stroke="none" />
      <path d={line} fill="none" stroke={stroke} strokeWidth={1.5} />
    </svg>
  );
}
