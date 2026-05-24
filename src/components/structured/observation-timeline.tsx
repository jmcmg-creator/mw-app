import type { ObservationEvent } from "@/lib/structured";

const OUTCOME_STYLES: Record<
  ObservationEvent["outcome"],
  { color: string; ring: string; label: string }
> = {
  COUPON_PAID: {
    color: "bg-emerald-500",
    ring: "ring-emerald-100",
    label: "Coupon payé",
  },
  COUPON_MISSED: {
    color: "bg-amber-500",
    ring: "ring-amber-100",
    label: "Coupon manqué",
  },
  AUTOCALLED: {
    color: "bg-indigo-500",
    ring: "ring-indigo-100",
    label: "Autocallé",
  },
  CAPITAL_LOSS: {
    color: "bg-rose-500",
    ring: "ring-rose-100",
    label: "Perte capital",
  },
  MATURED_FULL_REPAYMENT: {
    color: "bg-slate-500",
    ring: "ring-slate-100",
    label: "Maturité",
  },
  PENDING: {
    color: "bg-white border-2 border-slate-300",
    ring: "ring-slate-100",
    label: "À venir",
  },
};

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "2-digit",
});

export function ObservationTimeline({
  observations,
}: {
  observations: ObservationEvent[];
}) {
  const sorted = [...observations].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  if (sorted.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex items-center justify-between">
        {/* Connector line */}
        <div className="absolute top-2 right-0 left-0 h-px bg-slate-200" />
        {sorted.map((o) => {
          const styles = OUTCOME_STYLES[o.outcome];
          return (
            <div
              key={`${o.sequence}-${o.date.toISOString()}`}
              className="relative z-10 flex flex-col items-center gap-1"
              title={`#${o.sequence} · ${DATE_FMT.format(o.date)} · ${styles.label}`}
            >
              <div
                className={`size-4 rounded-full ring-4 ${styles.color} ${styles.ring}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>{DATE_FMT.format(sorted[0].date)}</span>
        <span>{DATE_FMT.format(sorted[sorted.length - 1].date)}</span>
      </div>
    </div>
  );
}
