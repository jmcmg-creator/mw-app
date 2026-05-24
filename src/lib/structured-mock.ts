/**
 * Realistic demo structured products for the institutional dashboard.
 *
 * Each product covers a different real-world archetype family offices
 * actually hold: Phoenix autocallable with memory, capital-protected note,
 * reverse convertible, low-strike accumulator, and a recently-autocalled
 * trade. Underlyings are real tickers with broadly accurate strike levels;
 * spot prices encode the status story (one near the capital barrier,
 * another safely above, etc.).
 */

import type { StructuredProduct } from "@/lib/structured";

const today = new Date();
const ago = (months: number) => {
  const d = new Date(today);
  d.setMonth(d.getMonth() - months);
  return d;
};
const inFuture = (months: number) => {
  const d = new Date(today);
  d.setMonth(d.getMonth() + months);
  return d;
};

export const DEMO_STRUCTURED_PRODUCTS: StructuredProduct[] = [
  {
    id: "demo-phoenix-eurostoxx-basket",
    name: "Phoenix Autocallable Worst-of EuroStoxx Banks",
    isin: "XS2543819472",
    issuer: "BNP Paribas Issuance B.V.",
    currency: "EUR",
    custodian: "BNP Paribas Wealth Management",
    legalEntity: "M. & Mme Dupont",
    nominalAmount: 250_000,
    currentValue: 213_500,
    couponRatePerYear: 0.085,
    couponFrequency: "QUARTERLY",
    couponType: "PHOENIX_MEMORY",
    capitalBarrierPct: 0.6,
    couponBarrierPct: 0.7,
    autocallBarrierPct: 1.0,
    issueDate: ago(15),
    maturityDate: inFuture(21),
    underlyings: [
      {
        ticker: "BNP.PA",
        name: "BNP Paribas",
        strikePrice: 56.4,
        spotPrice: 58.12,
        sector: "Financials",
      },
      {
        ticker: "GLE.PA",
        name: "Société Générale",
        strikePrice: 23.85,
        spotPrice: 24.4,
        sector: "Financials",
      },
      {
        ticker: "ACA.PA",
        name: "Crédit Agricole",
        strikePrice: 11.6,
        spotPrice: 13.05,
        sector: "Financials",
      },
      {
        ticker: "ISP.MI",
        name: "Intesa Sanpaolo",
        strikePrice: 2.41,
        spotPrice: 2.45,
        sector: "Financials",
      },
    ],
    observations: [
      {
        sequence: 1,
        date: ago(12),
        outcome: "COUPON_PAID",
        couponPaid: (250_000 * 0.085) / 4,
      },
      {
        sequence: 2,
        date: ago(9),
        outcome: "COUPON_PAID",
        couponPaid: (250_000 * 0.085) / 4,
      },
      {
        sequence: 3,
        date: ago(6),
        outcome: "COUPON_PAID",
        couponPaid: (250_000 * 0.085) / 4,
      },
      {
        sequence: 4,
        date: ago(3),
        outcome: "COUPON_PAID",
        couponPaid: (250_000 * 0.085) / 4,
      },
      { sequence: 5, date: inFuture(1), outcome: "PENDING", couponPaid: null },
      { sequence: 6, date: inFuture(4), outcome: "PENDING", couponPaid: null },
      { sequence: 7, date: inFuture(7), outcome: "PENDING", couponPaid: null },
      { sequence: 8, date: inFuture(10), outcome: "PENDING", couponPaid: null },
      { sequence: 9, date: inFuture(13), outcome: "PENDING", couponPaid: null },
      {
        sequence: 10,
        date: inFuture(16),
        outcome: "PENDING",
        couponPaid: null,
      },
      {
        sequence: 11,
        date: inFuture(19),
        outcome: "PENDING",
        couponPaid: null,
      },
      {
        sequence: 12,
        date: inFuture(21),
        outcome: "PENDING",
        couponPaid: null,
      },
    ],
    demo: true,
  },
  {
    id: "demo-reverse-convertible-stellantis",
    name: "Reverse Convertible 12 % Stellantis 2027",
    isin: "DE000HC9XR43",
    issuer: "UniCredit Bank AG",
    currency: "EUR",
    custodian: "Pictet & Cie",
    legalEntity: "SCI Patrimoine",
    nominalAmount: 150_000,
    currentValue: 102_750,
    couponRatePerYear: 0.12,
    couponFrequency: "ANNUAL",
    couponType: "FIXED",
    capitalBarrierPct: 0.65,
    couponBarrierPct: null,
    autocallBarrierPct: null,
    issueDate: ago(11),
    maturityDate: inFuture(13),
    underlyings: [
      {
        ticker: "STLA.PA",
        name: "Stellantis",
        strikePrice: 25.4,
        spotPrice: 14.92,
        sector: "Automobiles",
      },
    ],
    observations: [
      {
        sequence: 1,
        date: ago(0),
        outcome: "COUPON_PAID",
        couponPaid: 150_000 * 0.12,
      },
      { sequence: 2, date: inFuture(12), outcome: "PENDING", couponPaid: null },
      { sequence: 3, date: inFuture(13), outcome: "PENDING", couponPaid: null },
    ],
    demo: true,
  },
  {
    id: "demo-capital-protected-sp500",
    name: "Capital-Protected Note 100 % S&P 500 5Y",
    isin: "XS2671104295",
    issuer: "Goldman Sachs International",
    currency: "USD",
    custodian: "UBS Wealth Management",
    legalEntity: "Famille Garcia Holding LLC",
    nominalAmount: 500_000,
    currentValue: 567_400,
    couponRatePerYear: 0,
    couponFrequency: "ANNUAL",
    couponType: "FIXED",
    capitalBarrierPct: 1.0, // 100 % capital protected
    couponBarrierPct: null,
    autocallBarrierPct: null,
    issueDate: ago(28),
    maturityDate: inFuture(32),
    underlyings: [
      {
        ticker: "^GSPC",
        name: "S&P 500",
        strikePrice: 4_780,
        spotPrice: 5_894,
        sector: "Equity Index",
      },
    ],
    observations: [
      { sequence: 1, date: inFuture(32), outcome: "PENDING", couponPaid: null },
    ],
    demo: true,
  },
  {
    id: "demo-phoenix-tech-near-barrier",
    name: "Phoenix Autocallable Worst-of US Tech",
    isin: "XS2802837410",
    issuer: "JP Morgan Structured Products B.V.",
    currency: "USD",
    custodian: "J.P. Morgan Private Bank",
    legalEntity: "Famille Garcia Holding LLC",
    nominalAmount: 400_000,
    currentValue: 268_800,
    couponRatePerYear: 0.105,
    couponFrequency: "SEMI_ANNUAL",
    couponType: "PHOENIX_MEMORY",
    capitalBarrierPct: 0.6,
    couponBarrierPct: 0.7,
    autocallBarrierPct: 1.0,
    issueDate: ago(8),
    maturityDate: inFuture(28),
    underlyings: [
      {
        ticker: "TSLA",
        name: "Tesla",
        strikePrice: 240.5,
        spotPrice: 152.3,
        sector: "Consumer Discretionary",
      },
      {
        ticker: "NVDA",
        name: "NVIDIA",
        strikePrice: 502.0,
        spotPrice: 880.6,
        sector: "Information Technology",
      },
      {
        ticker: "META",
        name: "Meta Platforms",
        strikePrice: 348.2,
        spotPrice: 502.4,
        sector: "Communication Services",
      },
    ],
    observations: [
      {
        sequence: 1,
        date: ago(2),
        outcome: "COUPON_MISSED",
        couponPaid: 0,
      },
      { sequence: 2, date: inFuture(4), outcome: "PENDING", couponPaid: null },
      { sequence: 3, date: inFuture(10), outcome: "PENDING", couponPaid: null },
      { sequence: 4, date: inFuture(16), outcome: "PENDING", couponPaid: null },
      { sequence: 5, date: inFuture(22), outcome: "PENDING", couponPaid: null },
      { sequence: 6, date: inFuture(28), outcome: "PENDING", couponPaid: null },
    ],
    demo: true,
  },
  {
    id: "demo-autocalled-cac40",
    name: "Phoenix Autocallable CAC 40 — Rappelé",
    isin: "FR0014008XK7",
    issuer: "Société Générale",
    currency: "EUR",
    custodian: "Société Générale Private Banking",
    legalEntity: "M. & Mme Dupont",
    nominalAmount: 200_000,
    currentValue: null,
    couponRatePerYear: 0.075,
    couponFrequency: "QUARTERLY",
    couponType: "PHOENIX_MEMORY",
    capitalBarrierPct: 0.6,
    couponBarrierPct: 0.7,
    autocallBarrierPct: 1.0,
    issueDate: ago(15),
    maturityDate: ago(3),
    underlyings: [
      {
        ticker: "^FCHI",
        name: "CAC 40",
        strikePrice: 7_120,
        spotPrice: 7_512,
        sector: "Equity Index",
      },
    ],
    observations: [
      {
        sequence: 1,
        date: ago(12),
        outcome: "COUPON_PAID",
        couponPaid: (200_000 * 0.075) / 4,
      },
      {
        sequence: 2,
        date: ago(9),
        outcome: "COUPON_PAID",
        couponPaid: (200_000 * 0.075) / 4,
      },
      {
        sequence: 3,
        date: ago(6),
        outcome: "COUPON_PAID",
        couponPaid: (200_000 * 0.075) / 4,
      },
      {
        sequence: 4,
        date: ago(3),
        outcome: "AUTOCALLED",
        couponPaid: (200_000 * 0.075) / 4,
      },
    ],
    demo: true,
  },
];
