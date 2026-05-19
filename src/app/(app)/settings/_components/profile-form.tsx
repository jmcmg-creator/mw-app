"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

import { updateProfile } from "@/actions/updateProfile";
import type { Currency } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export function ProfileForm({
  email,
  fullName: initialName,
  baseCurrency: initialCurrency,
}: {
  email: string;
  fullName: string;
  baseCurrency: Currency;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [baseCurrency, setBaseCurrency] = useState<Currency>(initialCurrency);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setSaved(false);
    await updateProfile({ fullName, baseCurrency });
    router.refresh();
    setLoading(false);
    setSaved(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profil</CardTitle>
        <CardDescription>{email}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                setSaved(false);
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="baseCurrency">Devise de référence</Label>
            <select
              id="baseCurrency"
              className={FIELD_CLASS}
              value={baseCurrency}
              onChange={(event) => {
                setBaseCurrency(event.target.value as Currency);
                setSaved(false);
              }}
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {saved && !loading && <Check />}
            {saved && !loading ? "Enregistré" : "Enregistrer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
