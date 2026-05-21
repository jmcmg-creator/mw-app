"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Download,
  FileSearch,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  deleteDocument,
  getDocumentUrl,
  uploadDocument,
} from "@/actions/documents";
import {
  extractTransactions,
  type ExtractedTransaction,
} from "@/actions/extractTransactions";
import {
  analyzeDocument,
  type DocumentAnalysis,
} from "@/actions/analyzeDocument";
import { importTransactions } from "@/actions/importTransactions";
import {
  DOCUMENT_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
  formatCurrency,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FIELD_CLASS =
  "border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm";

const DOCUMENT_TYPES = Object.keys(DOCUMENT_TYPE_LABELS);

const CATEGORY_STYLE: Record<string, string> = {
  money:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  date: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  party:
    "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
  identity:
    "bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-500/20",
  term: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  other:
    "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
};

export type DocumentRow = {
  id: string;
  title: string;
  type: string;
};

export function DocumentsCard({
  assetId,
  documents,
  defaultType = "AUTRE",
  extract,
  currency = "EUR",
}: {
  assetId: string;
  documents: DocumentRow[];
  defaultType?: string;
  /** When "transactions", documents can be analysed by AI. */
  extract?: "transactions";
  currency?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState(defaultType);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [proposed, setProposed] = useState<ExtractedTransaction[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    docTitle: string;
    data: DocumentAnalysis;
  } | null>(null);

  async function handleUpload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("assetId", assetId);
      formData.append("type", type);
      formData.append("file", file);
      await uploadDocument(formData);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch {
      setError("Échec de l'envoi du document.");
    }
    setBusy(false);
  }

  async function handleDownload(id: string) {
    try {
      const url = await getDocumentUrl(id);
      window.open(url, "_blank", "noopener");
    } catch {
      setError("Lien de téléchargement indisponible.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer ce document ?")) return;
    await deleteDocument(id);
    router.refresh();
  }

  async function handleAnalyze(id: string) {
    setAnalyzing(id);
    setError(null);
    setProposed(null);
    try {
      const result = await extractTransactions(id);
      if (result.length === 0) {
        setError("Aucune transaction détectée dans ce document.");
      } else {
        setProposed(result);
      }
    } catch {
      setError("L'analyse IA a échoué.");
    }
    setAnalyzing(null);
  }

  async function handleRead(doc: DocumentRow) {
    setReadingId(doc.id);
    setError(null);
    setAnalysis(null);
    try {
      const data = await analyzeDocument(doc.id);
      setAnalysis({ docTitle: doc.title, data });
    } catch {
      setError("La lecture du document a échoué.");
    }
    setReadingId(null);
  }

  async function handleImport() {
    if (!proposed) return;
    setImporting(true);
    try {
      await importTransactions(assetId, proposed);
      setProposed(null);
      router.refresh();
    } catch {
      setError("Échec de l'import des transactions.");
    }
    setImporting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Documents ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <select
            className={FIELD_CLASS}
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            {DOCUMENT_TYPES.map((key) => (
              <option key={key} value={key}>
                {DOCUMENT_TYPE_LABELS[key]}
              </option>
            ))}
          </select>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/*,.xlsx,.xls,.csv"
            className={`${FIELD_CLASS} file:mr-3 file:border-0 file:bg-transparent file:text-sm`}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <Button onClick={handleUpload} disabled={busy || !file}>
            {busy ? <Loader2 className="animate-spin" /> : <Upload />}
            Envoyer le document
          </Button>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        {documents.length > 0 && (
          <ul className="flex flex-col gap-2">
            {documents.map((document) => (
              <li
                key={document.id}
                className="bg-card flex items-center gap-2 rounded-lg border px-3 py-2"
              >
                <FileText className="text-muted-foreground size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {document.title}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {DOCUMENT_TYPE_LABELS[document.type] ?? document.type}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => handleRead(document)}
                  disabled={readingId !== null}
                  aria-label="Lire et résumer"
                  title="Lire et résumer"
                >
                  {readingId === document.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <FileSearch className="size-4" />
                  )}
                </Button>
                {extract === "transactions" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => handleAnalyze(document.id)}
                    disabled={analyzing !== null}
                    aria-label="Extraire les transactions"
                    title="Extraire les transactions"
                  >
                    {analyzing === document.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => handleDownload(document.id)}
                  aria-label="Télécharger"
                >
                  <Download className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => handleDelete(document.id)}
                  aria-label="Supprimer"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {analysis && (
          <AnalysisPanel
            title={analysis.docTitle}
            data={analysis.data}
            onClose={() => setAnalysis(null)}
          />
        )}

        {proposed && (
          <div className="border-primary/40 bg-primary/5 flex flex-col gap-3 rounded-lg border p-3">
            <p className="text-sm font-medium">
              {proposed.length} transaction(s) détectée(s)
            </p>
            <ul className="flex flex-col gap-1">
              {proposed.map((tx, index) => (
                <li
                  key={`${tx.date}-${index}`}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-muted-foreground">
                    {TRANSACTION_TYPE_LABELS[tx.type]} · {tx.date}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(tx.amount, currency)}
                  </span>
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
                {importing && <Loader2 className="animate-spin" />}
                Importer
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AnalysisPanel({
  title,
  data,
  onClose,
}: {
  title: string;
  data: DocumentAnalysis;
  onClose: () => void;
}) {
  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4 shadow-sm">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            {data.documentKind}
          </p>
          <p className="truncate text-sm font-semibold">{title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground -mt-1 -mr-1 p-1"
          aria-label="Fermer"
        >
          <X className="size-4" />
        </button>
      </div>

      <p className="text-sm leading-relaxed">{data.summary}</p>

      {data.headline && (
        <div className="from-primary/10 to-primary/0 border-primary/20 rounded-lg border bg-gradient-to-br p-3">
          <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            {data.headline.label}
          </p>
          <p className="text-2xl font-bold tracking-tight">
            {data.headline.value}
          </p>
        </div>
      )}

      {data.warnings.length > 0 && (
        <div className="border-warning/40 bg-warning/5 flex flex-col gap-1 rounded-lg border p-3">
          <p className="text-warning flex items-center gap-1.5 text-xs font-medium">
            <AlertTriangle className="size-3.5" />
            Points d&apos;attention
          </p>
          <ul className="ml-5 list-disc text-xs">
            {data.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {data.sections.map((section, i) => (
          <div key={i} className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold tracking-wide uppercase">
              {section.title}
            </h4>
            <dl className="grid gap-1.5">
              {section.facts.map((fact, j) => (
                <div
                  key={j}
                  className="bg-muted/40 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md px-2.5 py-1.5"
                >
                  <dt className="text-muted-foreground truncate text-xs">
                    {fact.label}
                  </dt>
                  <dd
                    className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
                      CATEGORY_STYLE[fact.category] ?? CATEGORY_STYLE.other
                    }`}
                  >
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
