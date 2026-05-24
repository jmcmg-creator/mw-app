/**
 * Domain logic for the Structured Products dashboard: worst-of mechanics,
 * barrier distances, status derivation, end-of-life scenarios.
 *
 * Kept framework-agnostic and pure so it can be unit-tested and reused
 * across server actions, the dashboard card and the future per-product
 * detail page.
 */

export type Underlying = {
  ticker: string;
  name: string;
  /** Strike level fixed at issuance, in the underlying's quote currency. */
  strikePrice: number;
  /** Live spot price (e.g. last Yahoo close). */
  spotPrice: number;
  sector?: string | null;
};

export type StructuredProduct = {
  id: string;
  name: string;
  isin: string | null;
  issuer: string | null;
  currency: string;
  custodian: string | null;
  legalEntity: string | null;
  nominalAmount: number;
  /** Mark-to-market estimate — when unknown we fall back on nominal in UI. */
  currentValue: number | null;
  couponRatePerYear: number;
  /** ANNUAL | SEMI_ANNUAL | QUARTERLY | MONTHLY — used to derive period yield. */
  couponFrequency: "ANNUAL" | "SEMI_ANNUAL" | "QUARTERLY" | "MONTHLY";
  /** Phoenix (memory) / fixed / contingent — drives the scenarios narrative. */
  couponType: "FIXED" | "CONTINGENT" | "PHOENIX_MEMORY";
  capitalBarrierPct: number | null;
  couponBarrierPct: number | null;
  autocallBarrierPct: number | null;
  issueDate: Date;
  maturityDate: Date;
  underlyings: Underlying[];
  observations: ObservationEvent[];
  /** Demo flag — set true on mocked items so the UI can badge them. */
  demo?: boolean;
};

export type ObservationEvent = {
  sequence: number;
  date: Date;
  outcome:
    | "PENDING"
    | "AUTOCALLED"
    | "COUPON_PAID"
    | "COUPON_MISSED"
    | "CAPITAL_LOSS"
    | "MATURED_FULL_REPAYMENT";
  couponPaid: number | null;
};

export type BarrierState = {
  barrierPct: number;
  /** worst-of price as % of strike at issuance (1.0 = at strike). */
  worstOfPct: number;
  /** Worst-of distance to the barrier, in percentage points
   * (e.g. 0.05 = 5 pts of cushion above the barrier; -0.02 = 2 pts breached). */
  distance: number;
  breached: boolean;
  /** Distance ≤ 5pp (configurable) and not breached. */
  threatened: boolean;
};

export type StructuredStatus =
  | "AUTOCALLED"
  | "MATURED"
  | "BREACHED_CAPITAL"
  | "BREACHED_COUPON"
  | "NEAR_BARRIER"
  | "WATCHLIST"
  | "NORMAL";

export type ScenarioOutcome = {
  /** Stable identifier so React keys are predictable. */
  key:
    | "AUTOCALL_NEXT"
    | "COUPON_THIS_PERIOD"
    | "COUPON_SKIPPED"
    | "REDEMPTION_AT_PAR"
    | "CAPITAL_LOSS";
  label: string;
  /** Total cash return relative to nominal at the end of the scenario. */
  totalReturnPct: number;
  description: string;
};

export type ProductMetrics = {
  product: StructuredProduct;
  worstOf: Underlying | null;
  worstOfPct: number;
  performanceVsNominal: number;
  capital: BarrierState | null;
  coupon: BarrierState | null;
  autocall: {
    barrierPct: number;
    worstOfPct: number;
    distance: number;
    triggered: boolean;
  } | null;
  status: StructuredStatus;
  nextObservation: ObservationEvent | null;
  paidCoupons: number;
  expectedRemainingCoupons: number;
  scenarios: ScenarioOutcome[];
  alerts: ProductAlert[];
  daysToMaturity: number;
};

export type ProductAlertSeverity = "CRITICAL" | "WARNING" | "INFO";
export type ProductAlert = {
  severity: ProductAlertSeverity;
  message: string;
};

const THREATENED_THRESHOLD = 0.05; // 5 pts above the barrier counts as warning.
const MS_PER_DAY = 86_400_000;

/** Lowest underlying performance vs strike (1.0 = at strike). */
export function worstOfPct(underlyings: Underlying[]): number {
  if (underlyings.length === 0) return 1;
  let worst = Infinity;
  for (const u of underlyings) {
    if (u.strikePrice <= 0) continue;
    const pct = u.spotPrice / u.strikePrice;
    if (pct < worst) worst = pct;
  }
  return Number.isFinite(worst) ? worst : 1;
}

export function worstOfUnderlying(
  underlyings: Underlying[],
): Underlying | null {
  if (underlyings.length === 0) return null;
  let worst: Underlying | null = null;
  let worstPct = Infinity;
  for (const u of underlyings) {
    if (u.strikePrice <= 0) continue;
    const pct = u.spotPrice / u.strikePrice;
    if (pct < worstPct) {
      worstPct = pct;
      worst = u;
    }
  }
  return worst;
}

function barrierState(
  barrierPct: number | null,
  woPct: number,
): BarrierState | null {
  if (barrierPct == null) return null;
  const distance = woPct - barrierPct;
  return {
    barrierPct,
    worstOfPct: woPct,
    distance,
    breached: woPct < barrierPct,
    threatened: woPct >= barrierPct && distance <= THREATENED_THRESHOLD,
  };
}

export function deriveStatus(
  product: StructuredProduct,
  capital: BarrierState | null,
  coupon: BarrierState | null,
  autocallTriggered: boolean,
  now: Date,
): StructuredStatus {
  const lastOutcome = [...product.observations]
    .reverse()
    .find((o) => o.outcome !== "PENDING");
  if (lastOutcome?.outcome === "AUTOCALLED") return "AUTOCALLED";
  if (lastOutcome?.outcome === "MATURED_FULL_REPAYMENT") return "MATURED";
  if (lastOutcome?.outcome === "CAPITAL_LOSS") return "BREACHED_CAPITAL";
  if (autocallTriggered) return "AUTOCALLED";
  if (product.maturityDate.getTime() < now.getTime()) return "MATURED";
  if (capital?.breached) return "BREACHED_CAPITAL";
  if (coupon?.breached) return "BREACHED_COUPON";
  if (capital?.threatened || coupon?.threatened) return "NEAR_BARRIER";
  // Distance under 15% on capital → watchlist (still healthy but worth monitoring).
  if (capital && capital.distance < 0.15) return "WATCHLIST";
  return "NORMAL";
}

export function buildScenarios(
  product: StructuredProduct,
  metrics: {
    woPct: number;
    capital: BarrierState | null;
    coupon: BarrierState | null;
    autocall: ProductMetrics["autocall"];
    paidCoupons: number;
  },
): ScenarioOutcome[] {
  const couponPeriodRate = product.couponRatePerYear / periodsPerYear(product);
  const annualCoupon = product.couponRatePerYear;
  const out: ScenarioOutcome[] = [];

  if (product.autocallBarrierPct != null) {
    out.push({
      key: "AUTOCALL_NEXT",
      label: "Autocall à la prochaine constatation",
      totalReturnPct: couponPeriodRate, // capital + period coupon back
      description: `Capital remboursé + coupon ${formatPct(couponPeriodRate)} si worst-of ≥ ${formatPct(product.autocallBarrierPct - 1)}.`,
    });
  }

  if (product.couponBarrierPct != null) {
    out.push({
      key: "COUPON_THIS_PERIOD",
      label: "Coupon payé sur la période",
      totalReturnPct: couponPeriodRate,
      description: `Coupon ${formatPct(couponPeriodRate)} versé si worst-of ≥ ${formatPct(product.couponBarrierPct - 1)} à la constatation.`,
    });
    out.push({
      key: "COUPON_SKIPPED",
      label: "Coupon manqué",
      totalReturnPct: 0,
      description:
        product.couponType === "PHOENIX_MEMORY"
          ? "Coupon en mémoire — il sera rattrapé si la barrière coupon est respectée plus tard."
          : "Aucun coupon versé sur la période. Capital non affecté.",
    });
  }

  out.push({
    key: "REDEMPTION_AT_PAR",
    label: "Remboursement au pair à maturité",
    totalReturnPct:
      annualCoupon * yearsToMaturity(product) -
      metrics.paidCoupons / Math.max(product.nominalAmount, 1),
    description:
      "Capital remboursé 100 % à l'échéance + coupons cumulés restants si conditions respectées.",
  });

  // Capital-loss scenario: if worst-of finishes below capital barrier, loss is
  // proportional (1:1) to underperformance.
  if (product.capitalBarrierPct != null) {
    const lossIfFinishAtCurrent = Math.min(0, metrics.woPct - 1);
    out.push({
      key: "CAPITAL_LOSS",
      label: "Perte en capital",
      totalReturnPct: lossIfFinishAtCurrent,
      description: `Si le worst-of clôture sous ${formatPct(product.capitalBarrierPct - 1)} à maturité, perte en capital ≈ performance du worst-of. Actuellement worst-of = ${formatPct(metrics.woPct - 1)}.`,
    });
  }

  return out;
}

export function computeAlerts(
  product: StructuredProduct,
  metrics: {
    worstOf: Underlying | null;
    woPct: number;
    capital: BarrierState | null;
    coupon: BarrierState | null;
    nextObservation: ObservationEvent | null;
    status: StructuredStatus;
  },
  now: Date,
): ProductAlert[] {
  const alerts: ProductAlert[] = [];
  if (metrics.status === "BREACHED_CAPITAL") {
    alerts.push({
      severity: "CRITICAL",
      message: `Barrière capital franchie · perte en capital probable à maturité (worst-of ${formatPct(metrics.woPct - 1)}).`,
    });
  } else if (metrics.capital?.threatened) {
    alerts.push({
      severity: "WARNING",
      message: `${metrics.worstOf?.name ?? "Worst-of"} à ${formatPct(metrics.capital.distance)} de la barrière capital.`,
    });
  }
  if (metrics.coupon?.breached && metrics.status !== "AUTOCALLED") {
    alerts.push({
      severity: "WARNING",
      message:
        product.couponType === "PHOENIX_MEMORY"
          ? "Coupon non versé à la prochaine constatation — mis en mémoire."
          : "Coupon non versé à la prochaine constatation.",
    });
  }
  if (metrics.nextObservation) {
    const days = Math.ceil(
      (metrics.nextObservation.date.getTime() - now.getTime()) / MS_PER_DAY,
    );
    if (days >= 0 && days <= 15) {
      alerts.push({
        severity: "INFO",
        message: `Constatation dans ${days} jour${days > 1 ? "s" : ""} · ${metrics.nextObservation.date.toLocaleDateString("fr-FR")}.`,
      });
    }
  }
  return alerts;
}

export function computeMetrics(
  product: StructuredProduct,
  now: Date = new Date(),
): ProductMetrics {
  const woPct = worstOfPct(product.underlyings);
  const worstOf = worstOfUnderlying(product.underlyings);
  const capital = barrierState(product.capitalBarrierPct, woPct);
  const coupon = barrierState(product.couponBarrierPct, woPct);
  const autocall =
    product.autocallBarrierPct == null
      ? null
      : {
          barrierPct: product.autocallBarrierPct,
          worstOfPct: woPct,
          distance: woPct - product.autocallBarrierPct,
          triggered: woPct >= product.autocallBarrierPct,
        };

  const paidCoupons = product.observations.reduce(
    (s, o) => s + (o.couponPaid ?? 0),
    0,
  );

  const pending = product.observations.filter((o) => o.outcome === "PENDING");
  const nextObservation =
    pending
      .filter((o) => o.date.getTime() >= now.getTime())
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0] ?? null;

  const expectedRemainingCoupons =
    (pending.length * (product.nominalAmount * product.couponRatePerYear)) /
    periodsPerYear(product);

  const status = deriveStatus(
    product,
    capital,
    coupon,
    autocall?.triggered ?? false,
    now,
  );

  const scenarios = buildScenarios(product, {
    woPct,
    capital,
    coupon,
    autocall,
    paidCoupons,
  });

  const alerts = computeAlerts(
    product,
    {
      worstOf,
      woPct,
      capital,
      coupon,
      nextObservation,
      status,
    },
    now,
  );

  const daysToMaturity = Math.max(
    0,
    Math.ceil((product.maturityDate.getTime() - now.getTime()) / MS_PER_DAY),
  );

  const currentValue = product.currentValue ?? product.nominalAmount;
  const performanceVsNominal =
    product.nominalAmount > 0 ? currentValue / product.nominalAmount - 1 : 0;

  return {
    product,
    worstOf,
    worstOfPct: woPct,
    performanceVsNominal,
    capital,
    coupon,
    autocall,
    status,
    nextObservation,
    paidCoupons,
    expectedRemainingCoupons,
    scenarios,
    alerts,
    daysToMaturity,
  };
}

function periodsPerYear(p: StructuredProduct): number {
  switch (p.couponFrequency) {
    case "ANNUAL":
      return 1;
    case "SEMI_ANNUAL":
      return 2;
    case "QUARTERLY":
      return 4;
    case "MONTHLY":
      return 12;
  }
}

function yearsToMaturity(p: StructuredProduct): number {
  const ms = p.maturityDate.getTime() - p.issueDate.getTime();
  return ms / (365 * MS_PER_DAY);
}

function formatPct(fraction: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    maximumFractionDigits: 2,
    signDisplay: "exceptZero",
  }).format(fraction);
}

export const STATUS_LABEL: Record<StructuredStatus, string> = {
  NORMAL: "Normal",
  WATCHLIST: "Watchlist",
  NEAR_BARRIER: "Proche barrière",
  BREACHED_COUPON: "Barrière coupon franchie",
  BREACHED_CAPITAL: "Barrière capital franchie",
  AUTOCALLED: "Autocallé",
  MATURED: "À maturité",
};
