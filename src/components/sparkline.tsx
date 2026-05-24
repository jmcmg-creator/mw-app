"use client";

type Point = { t: number; close: number };

/**
 * Inline mini chart with no axes — rendered as a single SVG path so it stays
 * crisp at any size and adds zero runtime overhead. A subtle gradient and an
 * end-point marker give it a finished, dashboard-grade feel.
 */
export function Sparkline({
  data,
  width = 88,
  height = 32,
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
        className="bg-muted/40 rounded-md"
        aria-hidden
      />
    );
  }

  const closes = data.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const pad = 2;
  const innerH = height - pad * 2;

  const stepX = width / (data.length - 1);
  const pts = data.map((p, i) => ({
    x: i * stepX,
    y: pad + innerH - ((p.close - min) / span) * innerH,
  }));

  // Catmull-Rom → cubic Bezier for a smooth curve without library overhead.
  let line = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    line += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  const auto = data[data.length - 1].close >= data[0].close;
  const isPositive = positive ?? auto;
  const stroke = isPositive ? "var(--success)" : "var(--destructive)";
  const gradId = `spark-${isPositive ? "u" : "d"}-${Math.round(width)}`;
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${height} L0,${height} Z`;

  const last = pts[pts.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Historique du cours"
      className="block overflow-visible"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} stroke="none" />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r={2.2} fill={stroke} />
      <circle
        cx={last.x}
        cy={last.y}
        r={4.5}
        fill={stroke}
        fillOpacity={0.18}
      />
    </svg>
  );
}
