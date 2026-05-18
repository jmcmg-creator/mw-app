"use server";

import { prisma } from "@/lib/prisma";

export type ImmoMetrics = {
  assetId: string;
  surfaceSqm: number;
  personalEquity: number;
  purchasePrice: number;
  currentValuation: number;
  annualRent: number;
  annualCharges: number;
  /** Annual loan repayments (principal + interest + insurance). */
  annualDebtService: number;
  /** Annual rent minus charges minus debt service. */
  annualCashflow: number;
  /** Return on equity: annual cashflow / personal equity. */
  roe: number;
  /** Unlevered return: net operating income / purchase price. */
  roi: number;
  /** Annual rent / purchase price. */
  grossYield: number;
  /** (Annual rent - charges) / purchase price. */
  netYield: number;
  monthlyRentPerSqm: number;
  annualRentPerSqm: number;
  /** Current valuation minus purchase price. */
  appreciation: number;
  appreciationPct: number;
  /** Outstanding loan balance / current valuation. */
  loanToValue: number;
  /** True when a variable-rate loan lacked a schedule and an assumed rate. */
  hasIncompleteDebtData: boolean;
};

function num(value: unknown): number {
  if (value == null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Standard amortizing annuity payment. `annualRate` is a fraction (0.03). */
function annuityPayment(
  principal: number,
  annualRate: number,
  months: number,
): number {
  if (months <= 0) return 0;
  const monthlyRate = annualRate / 12;
  if (monthlyRate <= 0) return principal / months;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

/**
 * Computes real-estate performance metrics for an IMMO asset: ROE
 * (cashflow / personal equity), ROI, rental yields and revenue per square
 * meter. Debt service is read from each loan's amortization schedule; when
 * a loan has no schedule it falls back to a computed annuity.
 */
export async function calculateImmoMetrics(
  assetId: string,
  options: { assumedVariableRate?: number } = {},
): Promise<ImmoMetrics> {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: {
      loans: { include: { schedule: { orderBy: { period: "asc" } } } },
    },
  });
  if (!asset) {
    throw new Error(`Asset ${assetId} not found.`);
  }

  const surfaceSqm = num(asset.surface_sqm);
  const personalEquity = num(asset.personal_equity);
  const purchasePrice = num(asset.purchasePrice);
  const currentValuation = num(asset.currentValuation);
  const monthlyRent = num(asset.monthlyRent);
  const monthlyCharges = num(asset.monthlyCharges);

  const annualRent = monthlyRent * 12;
  const annualCharges = monthlyCharges * 12;

  const now = Date.now();
  let annualDebtService = 0;
  let outstandingBalance = 0;
  let hasIncompleteDebtData = false;

  for (const loan of asset.loans) {
    const upcoming = loan.schedule
      .filter((entry) => entry.dueDate.getTime() >= now)
      .slice(0, 12);

    if (upcoming.length > 0) {
      annualDebtService += upcoming.reduce(
        (sum, entry) => sum + num(entry.payment),
        0,
      );
    } else if (loan.schedule.length === 0) {
      let annualRate: number | null = null;
      if (loan.rateType === "FIXE") {
        annualRate = num(loan.fixedRate);
      } else if (options.assumedVariableRate != null) {
        annualRate = options.assumedVariableRate + num(loan.margin_rate);
      }
      if (annualRate == null) {
        hasIncompleteDebtData = true;
      } else {
        const monthly = annuityPayment(
          num(loan.principal),
          annualRate,
          loan.durationMonths,
        );
        const insurance = num(loan.principal) * (num(loan.insuranceRate) / 12);
        annualDebtService += (monthly + insurance) * 12;
      }
    }

    const pastEntries = loan.schedule.filter(
      (entry) => entry.dueDate.getTime() <= now,
    );
    const lastPast = pastEntries[pastEntries.length - 1];
    outstandingBalance += lastPast
      ? num(lastPast.remainingBalance)
      : num(loan.principal);
  }

  const annualCashflow = annualRent - annualCharges - annualDebtService;
  const netOperatingIncome = annualRent - annualCharges;

  return {
    assetId,
    surfaceSqm,
    personalEquity,
    purchasePrice,
    currentValuation,
    annualRent,
    annualCharges,
    annualDebtService,
    annualCashflow,
    roe: personalEquity > 0 ? annualCashflow / personalEquity : 0,
    roi: purchasePrice > 0 ? netOperatingIncome / purchasePrice : 0,
    grossYield: purchasePrice > 0 ? annualRent / purchasePrice : 0,
    netYield: purchasePrice > 0 ? netOperatingIncome / purchasePrice : 0,
    monthlyRentPerSqm: surfaceSqm > 0 ? monthlyRent / surfaceSqm : 0,
    annualRentPerSqm: surfaceSqm > 0 ? annualRent / surfaceSqm : 0,
    appreciation: currentValuation - purchasePrice,
    appreciationPct:
      purchasePrice > 0
        ? (currentValuation - purchasePrice) / purchasePrice
        : 0,
    loanToValue:
      currentValuation > 0 ? outstandingBalance / currentValuation : 0,
    hasIncompleteDebtData,
  };
}
