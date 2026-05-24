import type { StructuredStatus } from "@/lib/structured";
import { STATUS_LABEL } from "@/lib/structured";

const STYLES: Record<StructuredStatus, string> = {
  NORMAL: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  WATCHLIST: "bg-sky-50 text-sky-700 ring-sky-200",
  NEAR_BARRIER: "bg-amber-50 text-amber-700 ring-amber-200",
  BREACHED_COUPON: "bg-orange-50 text-orange-700 ring-orange-200",
  BREACHED_CAPITAL: "bg-rose-50 text-rose-700 ring-rose-200",
  AUTOCALLED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  MATURED: "bg-slate-50 text-slate-700 ring-slate-200",
};

export function StatusBadge({ status }: { status: StructuredStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ring-1 ring-inset ${STYLES[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}
