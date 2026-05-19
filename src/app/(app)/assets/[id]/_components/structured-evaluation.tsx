"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import {
  evaluateStructuredProduct,
  type StructuredProductEvaluation,
} from "@/actions/evaluateStructuredProduct";
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

export function StructuredEvaluation({ assetId }: { assetId: string }) {
  const [price, setPrice] = useState("");
  const [result, setResult] = useState<StructuredProductEvaluation | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const evaluation = await evaluateStructuredProduct(assetId, Number(price));
    setResult(evaluation);
    setLoading(false);
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
