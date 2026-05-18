"use client";

import * as React from "react";
import { UploadCloud, X, FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type FileUploadProps = {
  className?: string;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  onFilesSelected?: (files: File[]) => void;
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function FileUpload({
  className,
  accept = "application/pdf,image/*",
  multiple = true,
  maxSizeMb = 25,
  onFilesSelected,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const handleFiles = React.useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const list = Array.from(incoming);
      const tooLarge = list.find((f) => f.size > maxSizeMb * 1024 * 1024);
      if (tooLarge) {
        setError(`"${tooLarge.name}" dépasse la limite de ${maxSizeMb} Mo.`);
        return;
      }
      setError(null);
      const next = multiple ? [...files, ...list] : list.slice(0, 1);
      setFiles(next);
      onFilesSelected?.(next);
    },
    [files, maxSizeMb, multiple, onFilesSelected],
  );

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    onFilesSelected?.(next);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "border-input bg-muted/30 flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors",
          "hover:bg-muted/60 focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]",
          isDragging && "border-primary bg-primary/5",
        )}
      >
        <UploadCloud className="text-muted-foreground size-7" />
        <p className="text-sm font-medium">
          Déposez vos documents ou touchez pour parcourir
        </p>
        <p className="text-muted-foreground text-xs">
          PDF ou images · {maxSizeMb} Mo max
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="bg-card flex items-center gap-3 rounded-lg border px-3 py-2"
            >
              <FileText className="text-muted-foreground size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-muted-foreground text-xs">
                  {formatBytes(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => removeFile(index)}
                aria-label={`Retirer ${file.name}`}
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { FileUpload };
