"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  Building2,
  CalendarDays,
  Hash,
  Loader2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Upload,
  Wallet,
} from "lucide-react";

import {
  extractPortfolio,
  type ExtractedPortfolio,
  type ExtractedPosition,
  type ExtractedStatement,
} from "@/actions/extractPortfolio";
import { importPortfolio } from "@/actions/importPortfolio";
import {
  ASSET_TYPE_LABELS,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AllocationChart,
  type AllocationSlice,
} from "@/components/allocation-chart";

const FIELD_CLASS =
  "border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm";

const TYPE_BADGE_COLORS: Record<string, string> = {
  ACTION: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  ETF: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  OBLIGATION: "bg-amber-500/15 text-amber-600 dark:text-amber-500",
  STRUCTURE: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  SECURISE: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
};

const SECTOR_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
  "#84cc16",
  "#ec4899",
  "#14b8a6",
  "#a855f7",
  "#f97316",
  "#64748b",
];

function formatDateRange(start: string | null, end: string | null) {
  if (start && end) {
    return `Du ${formatIsoDate(start)} au ${formatIsoDate(end)}`;
  }
  return null;
}

function formatIsoDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(d);
}

function positionValue(p: ExtractedPosition): number | null {
  if (p.currentValue != null) return p.currentValue;
  if (p.currentPrice != null) return p.currentPrice * p.quantity;
  if (p.unitPrice != null) return p.unitPrice * p.quantity;
  return null;
}

function positionInvested(p: ExtractedPosition): number | null {
  if (p.unitPrice != null) return p.unitPrice * p.quantity;
  return null;
}

function positionGainPct(p: ExtractedPosition): number | null {
  if (p.gainPct != null) return p.gainPct;
  const v = positionValue(p);
  const inv = positionInvested(p);
  if (v != null && inv != null && inv > 0) return (v - inv) / inv;
  return null;
}

function StatementSummary({
  statement,
  positions,
}: {
  statement: ExtractedStatement;
  positions: ExtractedPosition[];
}) {
  const baseCurrency =
    statement.baseCurrency ?? positions[0]?.currency ?? "EUR";

  // Derived totals when the doc didn't explicitly state them.
  const computedValue = positions.reduce(
    (s, p) => s + (positionValue(p) ?? 0),
    0,
  );
  const computedInvested = positions.reduce(
    (s, p) => s + (positionInvested(p) ?? 0),
    0,
  );
  const value = statement.totalValue ?? computedValue;
  const invested = statement.totalInvested ?? computedInvested;
  const gain =
    statement.totalGain ??
    (value > 0 && invested > 0 ? value - invested : null);
  const gainPct =
    statement.totalGainPct ??
    (gain != null && invested > 0 ? gain / invested : null);
  const cashTotal = statement.cashBalances.reduce(
    (s, c) => s + (c.amount ?? 0),
    0,
  );

  const dateRange = formatDateRange(statement.periodStart, statement.periodEnd);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="size-4" />
          {statement.broker ?? "Relevé de portefeuille"}
        </CardTitle>
        <CardDescription className="flex flex-wrap gap-x-3 gap-y-1">
          {statement.accountType && (
            <span className="bg-muted text-foreground rounded-md px-1.5 py-0.5 text-[11px] font-medium">
              {statement.accountType}
            </span>
          )}
          {statement.accountNumber && (
            <span className="flex items-center gap-1 text-xs">
              <Hash className="size-3" />
              {statement.accountNumber}
            </span>
          )}
          {statement.statementDate && (
            <span className="flex items-center gap-1 text-xs">
              <CalendarDays className="size-3" />
              Arrêté du {formatIsoDate(statement.statementDate)}
            </span>
          )}
          {dateRange && (
            <span className="flex items-center gap-1 text-xs">
              <CalendarDays className="size-3" />
              {dateRange}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Kpi
            icon={<Wallet className="size-3.5" />}
            label="Valeur totale"
            value={formatCurrency(value, baseCurrency)}
          />
          <Kpi
            icon={<Banknote className="size-3.5" />}
            label="Investi"
            value={formatCurrency(invested, baseCurrency)}
          />
          <Kpi
            icon={
              gain != null && gain >= 0 ? (
                <TrendingUp className="size-3.5" />
              ) : (
                <TrendingDown className="size-3.5" />
              )
            }
            label="+/- value latente"
            value={gain != null ? formatCurrency(gain, baseCurrency) : "—"}
            delta={gainPct != null ? formatPercent(gainPct) : undefined}
            positive={gain != null && gain >= 0}
          />
          <Kpi
            icon={<Banknote className="size-3.5" />}
            label="Liquidités"
            value={
              cashTotal > 0 ? formatCurrency(cashTotal, baseCurrency) : "—"
            }
            delta={
              statement.cashBalances.length > 1
                ? `${statement.cashBalances.length} devises`
                : undefined
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Kpi({
  icon,
  label,
  value,
  delta,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}) {
  return (
    <div className="border-border bg-card flex flex-col gap-1 rounded-lg border p-3">
      <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium tracking-wide uppercase">
        {icon}
        {label}
      </span>
      <span className="text-base font-semibold">{value}</span>
      {delta && (
        <span
          className={
            positive === undefined
              ? "text-muted-foreground text-xs"
              : positive
                ? "text-success text-xs font-medium"
                : "text-destructive text-xs font-medium"
          }
        >
          {delta}
        </span>
      )}
    </div>
  );
}

function PositionRow({
  position,
  weight,
  baseCurrency,
}: {
  position: ExtractedPosition;
  weight: number;
  baseCurrency: string;
}) {
  const value = positionValue(position);
  const invested = positionInvested(position);
  const gainPct = positionGainPct(position);
  const gainAmount =
    position.gainAmount ??
    (value != null && invested != null ? value - invested : null);
  const type = position.type ?? "ACTION";

  const subtitleParts = [
    position.ticker,
    position.isin,
    ASSET_TYPE_LABELS[type] ?? type,
  ].filter(Boolean) as string[];

  const declaredWeight = position.weight ?? weight;

  return (
    <li className="bg-card flex flex-col gap-2 rounded-lg border px-3 py-3">
      <div className="flex items-start gap-2">
        <span
          className={`mt-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${TYPE_BADGE_COLORS[type] ?? TYPE_BADGE_COLORS.SECURISE}`}
        >
          {ASSET_TYPE_LABELS[type] ?? type}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm leading-tight font-medium">
            {position.name}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {subtitleParts.join(" · ")}
          </p>
        </div>
        {gainPct != null && (
          <span
            className={
              gainPct >= 0
                ? "text-success text-xs font-semibold whitespace-nowrap"
                : "text-destructive text-xs font-semibold whitespace-nowrap"
            }
          >
            {gainPct >= 0 ? "+" : ""}
            {(gainPct * 100).toFixed(2)}%
          </span>
        )}
      </div>

      {position.sector && (
        <div>
          <span className="bg-muted text-muted-foreground inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium">
            {position.sector}
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-xs">
        <DataCell label="Quantité" value={formatNumber(position.quantity, 6)} />
        <DataCell
          label="PRU"
          value={
            position.unitPrice != null
              ? formatCurrency(position.unitPrice, position.currency)
              : "—"
          }
        />
        <DataCell
          label="Cours"
          value={
            position.currentPrice != null
              ? formatCurrency(position.currentPrice, position.currency)
              : "—"
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <DataCell
          label="Valorisation"
          value={value != null ? formatCurrency(value, position.currency) : "—"}
          emphasis
        />
        <DataCell
          label="+/- value"
          value={
            gainAmount != null
              ? formatCurrency(gainAmount, position.currency)
              : "—"
          }
          positive={gainAmount != null ? gainAmount >= 0 : undefined}
        />
        <DataCell
          label="Rendement"
          value={
            position.dividendYield != null
              ? formatPercent(position.dividendYield)
              : "—"
          }
        />
      </div>

      {declaredWeight > 0 && (
        <div className="flex items-center gap-2">
          <div className="bg-muted relative h-1.5 flex-1 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${Math.min(100, declaredWeight * 100)}%` }}
            />
          </div>
          <span className="text-muted-foreground w-12 text-right text-[11px] tabular-nums">
            {(declaredWeight * 100).toFixed(1)}%
          </span>
        </div>
      )}

      {position.currency !== baseCurrency && (
        <p className="text-muted-foreground text-[11px]">
          Devise {position.currency} · convertie en {baseCurrency} à
          l&apos;import
        </p>
      )}
    </li>
  );
}

function DataCell({
  label,
  value,
  emphasis,
  positive,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
        {label}
      </span>
      <span
        className={
          positive === undefined
            ? emphasis
              ? "text-sm font-semibold"
              : "font-medium"
            : positive
              ? "text-success font-medium"
              : "text-destructive font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}

export default function ImportPortfolioPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedPortfolio | null>(null);
  const [error, setError] = useState<string | null>(null);

  const positions = useMemo(() => extracted?.positions ?? [], [extracted]);
  const statement = extracted?.statement;
  const baseCurrency =
    statement?.baseCurrency ?? positions[0]?.currency ?? "EUR";

  const totalValue = useMemo(
    () => positions.reduce((s, p) => s + (positionValue(p) ?? 0), 0),
    [positions],
  );

  const sectorBreakdown = useMemo<AllocationSlice[]>(() => {
    const by: Record<string, number> = {};
    let classified = 0;
    for (const p of positions) {
      const value = positionValue(p) ?? 0;
      if (value <= 0 || !p.sector) continue;
      by[p.sector] = (by[p.sector] ?? 0) + value;
      classified += value;
    }
    void classified;
    return Object.entries(by)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({
        label,
        value,
        color: SECTOR_COLORS[i % SECTOR_COLORS.length],
      }));
  }, [positions]);

  const typeBreakdown = useMemo<AllocationSlice[]>(() => {
    const by: Record<string, number> = {};
    for (const p of positions) {
      const value = positionValue(p) ?? 0;
      if (value <= 0) continue;
      const k = p.type ?? "ACTION";
      by[k] = (by[k] ?? 0) + value;
    }
    return Object.entries(by)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({
        label: ASSET_TYPE_LABELS[label] ?? label,
        value,
        color: SECTOR_COLORS[i % SECTOR_COLORS.length],
      }));
  }, [positions]);

  async function handleAnalyze() {
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    setExtracted(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await extractPortfolio(formData);
      if (result.positions.length === 0) {
        setError("Aucune position détectée dans le fichier.");
      } else {
        setExtracted(result);
      }
    } catch {
      setError("L'analyse IA a échoué.");
    }
    setAnalyzing(false);
  }

  async function handleImport() {
    if (!extracted) return;
    setImporting(true);
    setError(null);
    try {
      await importPortfolio(
        extracted.positions.map((p) => ({
          name: p.name,
          ticker: p.ticker,
          isin: p.isin,
          type: p.type,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          currentPrice: p.currentPrice,
          currency: p.currency,
          date: p.date,
        })),
        extracted.statement.cashBalances.map((c) => ({
          currency: c.currency,
          amount: c.amount,
        })),
      );
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Échec de l'import.");
      setImporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild aria-label="Retour">
          <Link href="/dashboard">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">
          Importer un portefeuille
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fichier broker</CardTitle>
          <CardDescription>
            Relevé de positions (Excel, CSV ou PDF). L&apos;IA extrait
            métadonnées, positions, valorisation et liquidités.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.xlsx,.xls,.csv"
            className={`${FIELD_CLASS} file:mr-3 file:border-0 file:bg-transparent file:text-sm`}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <Button onClick={handleAnalyze} disabled={!file || analyzing}>
            {analyzing ? <Loader2 className="animate-spin" /> : <Sparkles />}
            Analyser le portefeuille
          </Button>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </CardContent>
      </Card>

      {extracted && statement && (
        <>
          <StatementSummary statement={statement} positions={positions} />

          {statement.cashBalances.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wallet className="size-4" />
                  Liquidités détectées
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {statement.cashBalances.map((cash) => (
                  <div
                    key={cash.currency}
                    className="bg-card flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{cash.currency}</span>
                    <span className="font-semibold">
                      {formatCurrency(cash.amount, cash.currency)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {typeBreakdown.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Répartition par classe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AllocationChart data={typeBreakdown} total={totalValue} />
              </CardContent>
            </Card>
          )}

          {sectorBreakdown.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Exposition sectorielle
                </CardTitle>
                <CardDescription>
                  D&apos;après les libellés présents dans le document.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AllocationChart
                  data={sectorBreakdown}
                  total={sectorBreakdown.reduce((s, x) => s + x.value, 0)}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {positions.length} position{positions.length > 1 ? "s" : ""}
              </CardTitle>
              <CardDescription>
                Vérifie la liste avant d&apos;importer dans ton portefeuille.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <ul className="flex flex-col gap-2">
                {positions.map((position, index) => {
                  const value = positionValue(position) ?? 0;
                  const weight = totalValue > 0 ? value / totalValue : 0;
                  return (
                    <PositionRow
                      key={`${position.isin ?? position.ticker ?? position.name}-${index}`}
                      position={position}
                      weight={weight}
                      baseCurrency={baseCurrency}
                    />
                  );
                })}
              </ul>
              <div className="bg-muted/30 sticky bottom-2 flex gap-2 rounded-lg p-2 backdrop-blur">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setExtracted(null)}
                  disabled={importing}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleImport}
                  disabled={importing}
                >
                  {importing ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Upload />
                  )}
                  Importer {positions.length} position
                  {positions.length > 1 ? "s" : ""}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
