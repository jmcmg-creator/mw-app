import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { CashFlow, CashFlowMonth } from "@/lib/cashflows";

const KIND_LABELS: Record<CashFlow["kind"], string> = {
  BOND_COUPON: "Coupon",
  BOND_REDEMPTION: "Remboursement",
  STRUCTURED_OBSERVATION: "Constatation",
};

const KIND_STYLES: Record<CashFlow["kind"], string> = {
  BOND_COUPON: "text-success bg-success/10",
  BOND_REDEMPTION: "text-primary bg-primary/10",
  STRUCTURED_OBSERVATION: "text-warning bg-warning/10",
};

export function CashFlowCalendar({
  months,
  baseCurrency,
}: {
  months: CashFlowMonth[];
  baseCurrency: string;
}) {
  if (months.length === 0) {
    return (
      <Card className="py-5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wide uppercase">
            Flux à venir
          </CardTitle>
          <CardDescription>
            Aucune obligation ni constatation programmée. Renseigne les détails
            (coupon, échéance) sur tes obligations pour voir les cash flows.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const grandTotal = months.reduce((s, m) => s + m.total, 0);
  const firstDate = months[0]?.flows[0]?.date;
  const lastDate = months[months.length - 1]?.flows.at(-1)?.date;

  return (
    <Card className="py-5">
      <CardHeader>
        <div className="flex items-baseline justify-between gap-2">
          <CardTitle className="text-sm font-semibold tracking-wide uppercase">
            Flux à venir
          </CardTitle>
          <span className="text-muted-foreground text-[11px]">
            {firstDate && lastDate
              ? `${formatDate(firstDate)} → ${formatDate(lastDate)}`
              : null}
          </span>
        </div>
        <CardDescription>
          Total projeté · {formatCurrency(grandTotal, baseCurrency)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {months.map((month) => (
          <div key={month.key} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold tracking-wide uppercase">
                {month.label}
              </span>
              <span className="text-sm font-semibold tabular-nums">
                {formatCurrency(month.total, baseCurrency)}
              </span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {month.flows.map((f, i) => (
                <li
                  key={`${f.assetId}-${f.kind}-${f.date.toISOString()}-${i}`}
                  className="flex items-center gap-2"
                >
                  <span className="text-muted-foreground w-12 shrink-0 text-[11px] tabular-nums">
                    {String(f.date.getUTCDate()).padStart(2, "0")}/
                    {String(f.date.getUTCMonth() + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${KIND_STYLES[f.kind]}`}
                  >
                    {KIND_LABELS[f.kind]}
                  </span>
                  <Link
                    href={`/assets/${f.assetId}`}
                    className="min-w-0 flex-1 truncate text-xs hover:underline"
                  >
                    {f.assetName}
                  </Link>
                  <span className="shrink-0 text-xs font-semibold tabular-nums">
                    {f.conditional ? "≈ " : ""}
                    {formatCurrency(f.amount, f.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {months.some((m) => m.flows.some((f) => f.conditional)) && (
          <p className="text-muted-foreground text-[10px]">
            ≈ : coupon conditionnel (versé si la barrière du produit structuré
            est respectée à la constatation).
          </p>
        )}
      </CardContent>
    </Card>
  );
}
