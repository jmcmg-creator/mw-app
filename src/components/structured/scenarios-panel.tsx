import type { ScenarioOutcome } from "@/lib/structured";

const PCT = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

export function ScenariosPanel({
  scenarios,
}: {
  scenarios: ScenarioOutcome[];
}) {
  if (scenarios.length === 0) return null;
  return (
    <ul className="flex flex-col divide-y rounded-lg border">
      {scenarios.map((s) => {
        const positive = s.totalReturnPct >= 0;
        return (
          <li key={s.key} className="flex items-start gap-3 px-3 py-2.5">
            <div
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                positive ? "bg-emerald-500" : "bg-rose-500"
              }`}
              aria-hidden
            />
            <div className="flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium">{s.label}</p>
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    positive ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {PCT.format(s.totalReturnPct)}
                </span>
              </div>
              <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
                {s.description}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
