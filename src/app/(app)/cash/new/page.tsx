"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import { setCashBalance } from "@/actions/setCashBalance";
import type { Currency } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELD_CLASS =
  "border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm";

const CURRENCIES: Currency[] = [
  "EUR",
  "USD",
  "GBP",
  "CHF",
  "JPY",
  "CAD",
  "AUD",
];

export default function NewCashPage() {
  const router = useRouter();
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await setCashBalance(currency, Number(amount));
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Échec de l'enregistrement.");
      setLoading(false);
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
        <h1 className="text-xl font-semibold tracking-tight">Liquidités</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Solde en compte</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="currency">Devise</Label>
                <select
                  id="currency"
                  className={FIELD_CLASS}
                  value={currency}
                  onChange={(event) =>
                    setCurrency(event.target.value as Currency)
                  }
                >
                  {CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
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
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
