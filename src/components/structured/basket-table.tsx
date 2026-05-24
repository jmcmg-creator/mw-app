import type { Underlying } from "@/lib/structured";

const PCT = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

const NUM = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

export function BasketTable({
  underlyings,
  worstOfTicker,
}: {
  underlyings: Underlying[];
  worstOfTicker: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
          <tr>
            <th className="px-3 py-2 text-left">Sous-jacent</th>
            <th className="px-3 py-2 text-right">Strike</th>
            <th className="px-3 py-2 text-right">Spot</th>
            <th className="px-3 py-2 text-right">Perf. vs strike</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {underlyings.map((u) => {
            const perf =
              u.strikePrice > 0 ? u.spotPrice / u.strikePrice - 1 : 0;
            const isWorst = u.ticker === worstOfTicker;
            return (
              <tr
                key={u.ticker}
                className={isWorst ? "bg-rose-50/40" : undefined}
              >
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {isWorst && (
                      <span className="inline-flex items-center rounded bg-rose-100 px-1 py-px text-[9px] font-semibold tracking-wide text-rose-700 uppercase">
                        Worst
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{u.name}</p>
                      <p className="text-muted-foreground truncate text-[11px]">
                        {u.ticker}
                        {u.sector ? ` · ${u.sector}` : ""}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {NUM.format(u.strikePrice)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {NUM.format(u.spotPrice)}
                </td>
                <td
                  className={`px-3 py-2 text-right font-semibold tabular-nums ${
                    perf >= 0 ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {PCT.format(perf)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
