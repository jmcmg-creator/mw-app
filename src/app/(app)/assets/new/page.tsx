"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import { createAsset } from "@/actions/createAsset";
import type { AssetType, Currency } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SymbolSearch } from "@/components/symbol-search";

const FIELD_CLASS =
  "border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm";

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: "ACTION", label: "Action" },
  { value: "ETF", label: "ETF" },
  { value: "OBLIGATION", label: "Obligation" },
  { value: "STRUCTURE", label: "Produit structuré" },
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

export default function NewAssetPage() {
  const router = useRouter();
  const [type, setType] = useState<AssetType>("ACTION");
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [isin, setIsin] = useState("");
  const [currency, setCurrency] = useState<Currency>("EUR");

  const [underlyingTicker, setUnderlyingTicker] = useState("");
  const [strikePrice, setStrikePrice] = useState("");
  const [couponRate, setCouponRate] = useState("");
  const [capitalBarrier, setCapitalBarrier] = useState("");
  const [couponBarrier, setCouponBarrier] = useState("");
  const [autocallBarrier, setAutocallBarrier] = useState("");
  const [issuer, setIssuer] = useState("");
  const [maturityDate, setMaturityDate] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isStructured = type === "STRUCTURE";

  function pctToFraction(value: string): number | undefined {
    const parsed = Number(value);
    return value && Number.isFinite(parsed) ? parsed / 100 : undefined;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const id = await createAsset({
        type,
        name,
        ticker: ticker || undefined,
        isin: isin || undefined,
        currency,
        structured: isStructured
          ? {
              underlyingTicker,
              strikePrice: Number(strikePrice),
              couponRate: (Number(couponRate) || 0) / 100,
              capitalBarrier: pctToFraction(capitalBarrier),
              couponBarrier: pctToFraction(couponBarrier),
              autocallBarrier: pctToFraction(autocallBarrier),
              issuer: issuer || undefined,
              maturityDate: maturityDate || undefined,
            }
          : undefined,
      });
      router.push(`/assets/${id}`);
      router.refresh();
    } catch {
      setError("Échec de la création de l'actif.");
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
        <h1 className="text-xl font-semibold tracking-tight">Nouvel actif</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className={FIELD_CLASS}
                value={type}
                onChange={(event) => setType(event.target.value as AssetType)}
              >
                {ASSET_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nom — tapez pour rechercher</Label>
              <SymbolSearch
                value={name}
                onValueChange={setName}
                onSelect={(result) => {
                  setName(result.name);
                  setTicker(result.symbol);
                  if (/etf|fund/i.test(result.type)) setType("ETF");
                  else if (/equity|stock|action/i.test(result.type))
                    setType("ACTION");
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ticker">Ticker</Label>
              <Input
                id="ticker"
                value={ticker}
                onChange={(event) => setTicker(event.target.value)}
                placeholder="AAPL"
              />
            </div>

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
                <Label htmlFor="isin">ISIN</Label>
                <Input
                  id="isin"
                  value={isin}
                  onChange={(event) => setIsin(event.target.value)}
                  placeholder="FR0000120073"
                />
              </div>
            </div>

            {isStructured && (
              <div className="border-border flex flex-col gap-4 rounded-lg border border-dashed p-3">
                <p className="text-sm font-medium">Produit structuré</p>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="underlying">Sous-jacent (ticker)</Label>
                  <Input
                    id="underlying"
                    required
                    value={underlyingTicker}
                    onChange={(event) =>
                      setUnderlyingTicker(event.target.value)
                    }
                    placeholder="^STOXX50E"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="strike">Strike</Label>
                    <Input
                      id="strike"
                      type="number"
                      step="any"
                      required
                      value={strikePrice}
                      onChange={(event) => setStrikePrice(event.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="coupon">Coupon (%)</Label>
                    <Input
                      id="coupon"
                      type="number"
                      step="any"
                      value={couponRate}
                      onChange={(event) => setCouponRate(event.target.value)}
                      placeholder="8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="capital">Barr. capital (%)</Label>
                    <Input
                      id="capital"
                      type="number"
                      step="any"
                      value={capitalBarrier}
                      onChange={(event) =>
                        setCapitalBarrier(event.target.value)
                      }
                      placeholder="60"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="couponB">Barr. coupon (%)</Label>
                    <Input
                      id="couponB"
                      type="number"
                      step="any"
                      value={couponBarrier}
                      onChange={(event) => setCouponBarrier(event.target.value)}
                      placeholder="70"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="autocall">Autocall (%)</Label>
                    <Input
                      id="autocall"
                      type="number"
                      step="any"
                      value={autocallBarrier}
                      onChange={(event) =>
                        setAutocallBarrier(event.target.value)
                      }
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="issuer">Émetteur</Label>
                    <Input
                      id="issuer"
                      value={issuer}
                      onChange={(event) => setIssuer(event.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="maturity">Échéance</Label>
                    <Input
                      id="maturity"
                      type="date"
                      value={maturityDate}
                      onChange={(event) => setMaturityDate(event.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Créer l&apos;actif
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
