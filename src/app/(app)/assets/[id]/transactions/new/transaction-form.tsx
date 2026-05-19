"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { createTransaction } from "@/actions/createTransaction";
import type { Currency, TransactionType } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELD_CLASS =
  "border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm";

const TX_TYPES: { value: TransactionType; label: string }[] = [
  { value: "BUY", label: "Achat" },
  { value: "SELL", label: "Vente" },
  { value: "DIVIDEND", label: "Dividende" },
  { value: "FEE", label: "Frais" },
];

const CURRENCIES: Currency[] = [
  "EUR",
  "USD",
  "GBP",
  "CHF",
  "JPY",
  "CAD",
  "AUD",
];

export function TransactionForm({
  assetId,
  currency: assetCurrency,
}: {
  assetId: string;
  currency: Currency;
}) {
  const router = useRouter();
  const [type, setType] = useState<TransactionType>("BUY");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [fees, setFees] = useState("");
  const [currency, setCurrency] = useState<Currency>(assetCurrency);
  const [exchangeRate, setExchangeRate] = useState("1");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isQuantityType = type === "BUY" || type === "SELL";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createTransaction({
        assetId,
        type,
        date,
        quantity: isQuantityType ? Number(quantity) : undefined,
        unitPrice: isQuantityType ? Number(unitPrice) : undefined,
        amount: isQuantityType ? undefined : Number(amount),
        fees: fees ? Number(fees) : undefined,
        currency,
        exchangeRate: exchangeRate ? Number(exchangeRate) : undefined,
        note: note || undefined,
      });
      router.push(`/assets/${assetId}`);
      router.refresh();
    } catch {
      setError("Échec de l'enregistrement de la transaction.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          className={FIELD_CLASS}
          value={type}
          onChange={(event) => setType(event.target.value as TransactionType)}
        >
          {TX_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      {isQuantityType ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="quantity">Quantité</Label>
            <Input
              id="quantity"
              type="number"
              step="any"
              required
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="unitPrice">Prix unitaire</Label>
            <Input
              id="unitPrice"
              type="number"
              step="any"
              required
              value={unitPrice}
              onChange={(event) => setUnitPrice(event.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Montant</Label>
          <Input
            id="amount"
            type="number"
            step="any"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fees">Frais</Label>
          <Input
            id="fees"
            type="number"
            step="any"
            value={fees}
            onChange={(event) => setFees(event.target.value)}
            placeholder="0"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="currency">Devise</Label>
          <select
            id="currency"
            className={FIELD_CLASS}
            value={currency}
            onChange={(event) => setCurrency(event.target.value as Currency)}
          >
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="exchangeRate">
          Taux de change (vers devise de base)
        </Label>
        <Input
          id="exchangeRate"
          type="number"
          step="any"
          value={exchangeRate}
          onChange={(event) => setExchangeRate(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="note">Note</Label>
        <Input
          id="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="animate-spin" />}
        Enregistrer
      </Button>
    </form>
  );
}
