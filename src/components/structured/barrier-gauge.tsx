import type { BarrierState } from "@/lib/structured";

/**
 * Horizontal barrier gauge: a 0–130 % rail with the worst-of marker, the
 * capital and coupon barriers, the autocall threshold, and a cushion band.
 *
 * Kept SVG-based — no chart library — so it stays crisp at every density
 * and renders the same in PDF exports later.
 */
export function BarrierGauge({
  worstOfPct,
  capital,
  coupon,
  autocallBarrierPct,
  worstOfName,
}: {
  worstOfPct: number;
  capital: BarrierState | null;
  coupon: BarrierState | null;
  autocallBarrierPct: number | null;
  worstOfName: string;
}) {
  const min = 0.3;
  const max = 1.3;
  const toX = (pct: number) =>
    `${((Math.max(min, Math.min(max, pct)) - min) / (max - min)) * 100}%`;

  const markers: Array<{
    pct: number;
    label: string;
    color: string;
    above?: boolean;
  }> = [];
  if (capital) {
    markers.push({
      pct: capital.barrierPct,
      label: `Capital ${Math.round(capital.barrierPct * 100)}%`,
      color: "rgb(225 29 72)",
    });
  }
  if (coupon) {
    markers.push({
      pct: coupon.barrierPct,
      label: `Coupon ${Math.round(coupon.barrierPct * 100)}%`,
      color: "rgb(245 158 11)",
      above: true,
    });
  }
  if (autocallBarrierPct != null) {
    markers.push({
      pct: autocallBarrierPct,
      label: `Autocall ${Math.round(autocallBarrierPct * 100)}%`,
      color: "rgb(99 102 241)",
    });
  }

  const worstSafe = !capital?.breached && !capital?.threatened;
  const worstColor = capital?.breached
    ? "rgb(225 29 72)"
    : capital?.threatened
      ? "rgb(245 158 11)"
      : "rgb(15 23 42)";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">Worst-of · {worstOfName}</span>
        <span
          className="font-semibold tabular-nums"
          style={{ color: worstColor }}
        >
          {Math.round(worstOfPct * 100)}% du strike
        </span>
      </div>

      <div className="relative h-14">
        {/* Rail */}
        <div className="bg-muted absolute top-7 right-0 left-0 h-1.5 rounded-full" />
        {/* Safe zone above capital barrier */}
        {capital && (
          <div
            className="absolute top-7 h-1.5 rounded-full bg-emerald-200"
            style={{
              left: toX(capital.barrierPct),
              right: 0,
            }}
          />
        )}
        {/* Threatened zone (5 pts cushion above capital barrier) */}
        {capital && !capital.breached && (
          <div
            className="absolute top-7 h-1.5 bg-amber-200"
            style={{
              left: toX(capital.barrierPct),
              right: `calc(100% - ${toX(capital.barrierPct + 0.05)})`,
            }}
          />
        )}
        {/* Breached zone */}
        {capital && (
          <div
            className="absolute top-7 h-1.5 rounded-l-full bg-rose-200"
            style={{
              left: 0,
              right: `calc(100% - ${toX(capital.barrierPct)})`,
            }}
          />
        )}

        {/* Barrier ticks */}
        {markers.map((m) => (
          <div
            key={m.label}
            className="absolute"
            style={{
              left: toX(m.pct),
              top: m.above ? "0" : "auto",
              bottom: m.above ? "auto" : "0",
              transform: "translateX(-50%)",
            }}
          >
            <div
              className="mx-auto h-3 w-px"
              style={{ backgroundColor: m.color }}
            />
            <div
              className="mt-0.5 -translate-x-1/2 text-[9px] font-medium whitespace-nowrap"
              style={{ color: m.color, transform: "translateX(0)" }}
            >
              {m.label}
            </div>
          </div>
        ))}

        {/* Worst-of marker */}
        <div
          className="absolute top-[18px]"
          style={{
            left: toX(worstOfPct),
            transform: "translateX(-50%)",
          }}
        >
          <div
            className="size-4 rounded-full ring-2 ring-white"
            style={{ backgroundColor: worstColor }}
          />
        </div>

        {/* Strike marker (always at 100%) */}
        <div
          className="text-muted-foreground absolute right-0 bottom-0 left-0 flex justify-between text-[10px]"
          style={{ top: "44px" }}
        >
          <span style={{ marginLeft: toX(min) }}>—</span>
          <span style={{ marginLeft: toX(1), position: "absolute" }}>
            Strike 100 %
          </span>
        </div>
      </div>

      {capital && (
        <p
          className={`text-xs ${
            capital.breached
              ? "text-rose-700"
              : capital.threatened
                ? "text-amber-700"
                : "text-emerald-700"
          }`}
        >
          {capital.breached
            ? `Barrière capital franchie de ${Math.round(Math.abs(capital.distance) * 100)} pts.`
            : `Cushion capital · ${Math.round(capital.distance * 100)} pts au-dessus de la barrière.`}
          {worstSafe ? null : null}
        </p>
      )}
    </div>
  );
}
