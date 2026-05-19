"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

import { calculateStockPerformance } from "@/actions/calculateStockPerformance";
import { refreshAssetPrice } from "@/actions/refreshAssetPrice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UpdatePriceForm({
  assetId,
  currentPrice,
  ticker,
}: {
  assetId: string;
  currentPrice: number;
  ticker: string | null;
}) {
  const router = useRouter();
  const [price, setPrice] = useState(currentPrice ? String(currentPrice) : "");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    await calculateStockPerformance(assetId, { marketPrice: Number(price) });
    router.refresh();
    setLoading(false);
  }

  async function handleSync() {
    setSyncing(true);
    setMessage(null);
    const result = await refreshAssetPrice(assetId);
    if (result.ok) {
      router.refresh();
    } else {
      setMessage(
        result.reason === "no-ticker"
          ? "Aucun ticker renseigné pour cet actif."
          : "Cours introuvable sur Yahoo Finance.",
      );
    }
    setSyncing(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="price" className="text-muted-foreground text-xs">
            Cours actuel
          </label>
          <Input
            id="price"
            type="number"
            step="any"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="0,00"
          />
        </div>
        <Button type="submit" variant="outline" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          Mettre à jour
        </Button>
      </form>

      {ticker && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          Synchroniser via Yahoo ({ticker})
        </Button>
      )}

      {message && <p className="text-destructive text-xs">{message}</p>}
    </div>
  );
}
