"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { calculateStockPerformance } from "@/actions/calculateStockPerformance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UpdatePriceForm({
  assetId,
  currentPrice,
}: {
  assetId: string;
  currentPrice: number;
}) {
  const router = useRouter();
  const [price, setPrice] = useState(currentPrice ? String(currentPrice) : "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    await calculateStockPerformance(assetId, { marketPrice: Number(price) });
    router.refresh();
    setLoading(false);
  }

  return (
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
  );
}
