"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import { createImmoAsset } from "@/actions/createImmoAsset";
import type { PropertyType } from "@/generated/prisma/enums";
import { PROPERTY_TYPE_LABELS } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELD_CLASS =
  "border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm";

const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[];

function optionalNumber(value: string): number | undefined {
  const parsed = Number(value);
  return value && Number.isFinite(parsed) ? parsed : undefined;
}

export default function NewPropertyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [propertyType, setPropertyType] =
    useState<PropertyType>("APPARTEMENT_LCD");
  const [address, setAddress] = useState("");
  const [surfaceSqm, setSurfaceSqm] = useState("");
  const [personalEquity, setPersonalEquity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentValuation, setCurrentValuation] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [monthlyCharges, setMonthlyCharges] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const id = await createImmoAsset({
        name,
        propertyType,
        address: address || undefined,
        surfaceSqm: optionalNumber(surfaceSqm),
        personalEquity: optionalNumber(personalEquity),
        purchasePrice: optionalNumber(purchasePrice),
        currentValuation: optionalNumber(currentValuation),
        monthlyRent: optionalNumber(monthlyRent),
        monthlyCharges: optionalNumber(monthlyCharges),
      });
      router.push(`/properties/${id}`);
      router.refresh();
    } catch {
      setError("Échec de la création du bien.");
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
        <h1 className="text-xl font-semibold tracking-tight">
          Nouveau bien immobilier
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex. Studio Charonne"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="propertyType">Type de bien</Label>
              <select
                id="propertyType"
                className={FIELD_CLASS}
                value={propertyType}
                onChange={(event) =>
                  setPropertyType(event.target.value as PropertyType)
                }
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {PROPERTY_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="surface">Surface (m²)</Label>
                <Input
                  id="surface"
                  type="number"
                  step="any"
                  value={surfaceSqm}
                  onChange={(event) => setSurfaceSqm(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="equity">Apport personnel</Label>
                <Input
                  id="equity"
                  type="number"
                  step="any"
                  value={personalEquity}
                  onChange={(event) => setPersonalEquity(event.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="purchase">Prix d&apos;achat</Label>
                <Input
                  id="purchase"
                  type="number"
                  step="any"
                  value={purchasePrice}
                  onChange={(event) => setPurchasePrice(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="valuation">Valeur actuelle</Label>
                <Input
                  id="valuation"
                  type="number"
                  step="any"
                  value={currentValuation}
                  onChange={(event) => setCurrentValuation(event.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="rent">Loyer mensuel</Label>
                <Input
                  id="rent"
                  type="number"
                  step="any"
                  value={monthlyRent}
                  onChange={(event) => setMonthlyRent(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="charges">Charges mensuelles</Label>
                <Input
                  id="charges"
                  type="number"
                  step="any"
                  value={monthlyCharges}
                  onChange={(event) => setMonthlyCharges(event.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Créer le bien
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
