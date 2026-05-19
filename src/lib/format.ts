/** Coerces a Prisma Decimal | number | null into a finite number. */
export function toNumber(value: unknown): number {
  if (value == null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(value: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(fraction: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    maximumFractionDigits: 2,
    signDisplay: "exceptZero",
  }).format(fraction);
}

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits }).format(
    value,
  );
}

export function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
    value,
  );
}

export const ASSET_TYPE_LABELS: Record<string, string> = {
  ACTION: "Action",
  ETF: "ETF",
  STRUCTURE: "Produit structuré",
  OBLIGATION: "Obligation",
  IMMO: "Immobilier",
  SECURISE: "Sécurisé",
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  BUY: "Achat",
  SELL: "Vente",
  DIVIDEND: "Dividende",
  FEE: "Frais",
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APPARTEMENT_LCD: "Appartement LCD",
  APPARTEMENT_BAIL_MOBILITE: "Appartement Bail Mobilité",
  BUREAUX: "Bureaux",
  LOCAL_COMMERCIAL: "Local commercial",
  HOTEL: "Hôtel",
  MAISON: "Maison",
};
