"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Loader2, Trash2, Upload } from "lucide-react";

import {
  deleteDocument,
  getDocumentUrl,
  uploadDocument,
} from "@/actions/documents";
import { DOCUMENT_TYPE_LABELS } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FIELD_CLASS =
  "border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm";

const DOCUMENT_TYPES = Object.keys(DOCUMENT_TYPE_LABELS);

export type DocumentRow = {
  id: string;
  title: string;
  type: string;
};

export function DocumentsCard({
  assetId,
  documents,
  defaultType = "AUTRE",
}: {
  assetId: string;
  documents: DocumentRow[];
  defaultType?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState(defaultType);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
                className="bg-card flex items-center gap-3 rounded-lg border px-3 py-2"
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
      </CardContent>
    </Card>
  );
}
