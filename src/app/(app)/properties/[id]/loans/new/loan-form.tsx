"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { createLoan } from "@/actions/createLoan";
import type { LoanRateType, ReferenceRate } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELD_CLASS =
  "border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm";

const REFERENCE_RATES: ReferenceRate[] = [
  "EURIBOR_1M",
  "EURIBOR_3M",
  "EURIBOR_6M",
  "EURIBOR_12M",
  "ESTR",
  "SOFR",
  "LIVRET_A",
];

function pctToFraction(value: string): number | undefined {
  const parsed = Number(value);
  return value && Number.isFinite(parsed) ? parsed / 100 : undefined;
}

export function LoanForm({ assetId }: { assetId: string }) {
  const router = useRouter();
  const [lender, setLender] = useState("");
  const [rateType, setRateType] = useState<LoanRateType>("FIXE");
  const [fixedRate, setFixedRate] = useState("");
  const [referenceRate, setReferenceRate] =
    useState<ReferenceRate>("EURIBOR_3M");
  const [marginRate, setMarginRate] = useState("");
  const [insuranceRate, setInsuranceRate] = useState("");
  const [principal, setPrincipal] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isFixed = rateType === "FIXE";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createLoan({
        assetId,
        lender: lender || undefined,
        rateType,
        fixedRate: isFixed ? pctToFraction(fixedRate) : undefined,
        referenceRate: isFixed ? undefined : referenceRate,
        marginRate: isFixed ? undefined : pctToFraction(marginRate),
        insuranceRate: pctToFraction(insuranceRate),
        principal: Number(principal),
        durationMonths: Number(durationMonths),
        startDate,
      });
      router.push(`/properties/${assetId}`);
      router.refresh();
    } catch {
      setError("Échec de l'enregistrement du prêt.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="lender">Prêteur</Label>
        <Input
          id="lender"
          value={lender}
          onChange={(event) => setLender(event.target.value)}
          placeholder="Ex. BRED"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="rateType">Type de taux</Label>
        <select
          id="rateType"
          className={FIELD_CLASS}
          value={rateType}
          onChange={(event) => setRateType(event.target.value as LoanRateType)}
        >
          <option value="FIXE">Fixe</option>
          <option value="VARIABLE">Variable</option>
        </select>
      </div>

      {isFixed ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="fixedRate">Taux fixe (%)</Label>
          <Input
            id="fixedRate"
            type="number"
            step="any"
            required
            value={fixedRate}
            onChange={(event) => setFixedRate(event.target.value)}
            placeholder="3.4"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="referenceRate">Taux de référence</Label>
            <select
              id="referenceRate"
              className={FIELD_CLASS}
              value={referenceRate}
              onChange={(event) =>
                setReferenceRate(event.target.value as ReferenceRate)
              }
            >
              {REFERENCE_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="marginRate">Marge (%)</Label>
            <Input
              id="marginRate"
              type="number"
              step="any"
              value={marginRate}
              onChange={(event) => setMarginRate(event.target.value)}
              placeholder="2"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="principal">Capital emprunté</Label>
          <Input
            id="principal"
            type="number"
            step="any"
            required
            value={principal}
            onChange={(event) => setPrincipal(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="insuranceRate">Assurance (%)</Label>
          <Input
            id="insuranceRate"
            type="number"
            step="any"
            value={insuranceRate}
            onChange={(event) => setInsuranceRate(event.target.value)}
            placeholder="0.3"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="duration">Durée (mois)</Label>
          <Input
            id="duration"
            type="number"
            required
            value={durationMonths}
            onChange={(event) => setDurationMonths(event.target.value)}
            placeholder="240"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="startDate">Date de début</Label>
          <Input
            id="startDate"
            type="date"
            required
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="animate-spin" />}
        Enregistrer le prêt
      </Button>
    </form>
  );
}
