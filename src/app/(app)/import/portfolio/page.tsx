"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles, Upload } from "lucide-react";

import {
  extractPortfolio,
  type ExtractedPosition,
} from "@/actions/extractPortfolio";
import { importPortfolio } from "@/actions/importPortfolio";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FIELD_CLASS =
  "border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm";

export default function ImportPortfolioPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [proposed, setProposed] = useState<ExtractedPosition[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    setProposed(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await extractPortfolio(formData);
      if (result.length === 0) {
        setError("Aucune position détectée dans le fichier.");
      } else {
        setProposed(result);
      }
    } catch {
      setError("L'analyse IA a échoué.");
    }
    setAnalyzing(false);
  }

  async function handleImport() {
    if (!proposed) return;
    setImporting(true);
    setError(null);
    try {
      await importPortfolio(proposed);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Échec de l'import.");
      setImporting(false);
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
          Importer un portefeuille
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fichier broker</CardTitle>
          <CardDescription>
            Relevé de positions (Excel, CSV ou PDF). L&apos;IA détecte toutes
            les lignes, crée les actifs manquants et enregistre les achats.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.xlsx,.xls,.csv"
            className={`${FIELD_CLASS} file:mr-3 file:border-0 file:bg-transparent file:text-sm`}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <Button onClick={handleAnalyze} disabled={!file || analyzing}>
            {analyzing ? <Loader2 className="animate-spin" /> : <Sparkles />}
            Analyser le portefeuille
          </Button>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </CardContent>
      </Card>

      {proposed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {proposed.length} position{proposed.length > 1 ? "s" : ""}{" "}
              détectée{proposed.length > 1 ? "s" : ""}
            </CardTitle>
            <CardDescription>
              Vérifie la liste, puis lance l&apos;import.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <ul className="flex flex-col gap-2">
              {proposed.map((position, index) => (
                <li
                  key={`${position.isin ?? position.ticker ?? position.name}-${index}`}
                  className="bg-card flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {position.name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {[position.ticker, position.isin, position.type]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatNumber(position.quantity, 6)} u.
                    </p>
                    {position.unitPrice != null && (
                      <p className="text-muted-foreground text-xs">
                        {formatCurrency(position.unitPrice, position.currency)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setProposed(null)}
                disabled={importing}
              >
                Annuler
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handleImport}
                disabled={importing}
              >
                {importing ? <Loader2 className="animate-spin" /> : <Upload />}
                Importer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
