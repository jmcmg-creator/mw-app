"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

import {
  evaluateStructuredProduct,
  type StructuredProductEvaluation,
} from "@/actions/evaluateStructuredProduct";
import { fetchQuote } from "@/actions/fetchQuote";
import { formatNumber, formatPercent } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUS_STYLES = {
  safe: "text-success",
  threatened: "text-warning",
  breached: "text-destructive",
} as const;

function barrierLabel(
  status: keyof typeof STATUS_STYLES,
): "Sécurisée" | "Menacée" | "Franchie" {
  if (status === "safe") return "Sécurisée";
  if (status === "threatened") return "Menacée";
  return "Franchie";
}

export function StructuredEvaluation({
  assetId,
  underlyingTicker,
}: {
  assetId: string;
  underlyingTicker: string;
}) {
  const [price, setPrice] = useState("");
  const [result, setResult] = useState<StructuredProductEvaluation | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const evaluation = await evaluateStructuredProduct(assetId, Number(price));
    setResult(evaluation);
    setLoading(false);
  }

  async function handleSync() {
    setSyncing(true);
    setMessage(null);
    const quote = await fetchQuote(underlyingTicker);
    if (quote) {
      setPrice(String(quote.price));
    } else {
      setMessage("Cours du sous-jacent introuvable sur Yahoo Finance.");
    }
    setSyncing(false);
  }

  function renderBarrier(
    label: string,
    barrier: {
      breached: boolean;
      threatened: boolean;
      distance: number;
    } | null,
  ) {
    if (!barrier) return null;
    const status = barrier.breached
      ? "breached"
      : barrier.threatened
        ? "threatened"
        : "safe";
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={STATUS_STYLES[status]}>
          {barrierLabel(status)} ({formatPercent(barrier.distance)})
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label
            htmlFor="underlying-price"
            className="text-muted-foreground text-xs"
          >
            Cours du sous-jacent
          </label>
          <Input
            id="underlying-price"
            type="number"
            step="any"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="0,00"
          />
        </div>
        <Button type="submit" variant="outline" disabled={loading || !price}>
          {loading && <Loader2 className="animate-spin" />}
          Évaluer
        </Button>
      </form>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start"
        onClick={handleSync}
        disabled={syncing}
      >
        {syncing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
        Cours via Yahoo ({underlyingTicker})
      </Button>

      {message && <p className="text-destructive text-xs">{message}</p>}

      {result && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Perf. vs strike</span>
            <span>{formatPercent(result.performanceVsStrike)}</span>
          </div>
          {renderBarrier("Barrière capital", result.capitalBarrier)}
          {renderBarrier("Barrière coupon", result.couponBarrier)}
          {result.autocall && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Autocall</span>
              <span
                className={
                  result.autocall.triggered
                    ? "text-success"
                    : "text-muted-foreground"
                }
              >
                {result.autocall.triggered ? "Déclenché" : "Non atteint"} (
                {formatPercent(result.autocall.distance)})
              </span>
            </div>
          )}
          <p className="text-muted-foreground text-xs">
            Coupon {result.couponDue ? "dû" : "non dû"} · capital{" "}
            {result.capitalAtRisk ? "à risque" : "protégé"} · niveau{" "}
            {formatNumber(result.underlyingPrice)}
          </p>
        </div>
      )}
    </div>
  );
}
