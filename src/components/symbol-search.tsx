"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { searchSymbols, type SymbolResult } from "@/actions/searchSymbols";
import { Input } from "@/components/ui/input";

export function SymbolSearch({
  value,
  onValueChange,
  onSelect,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onSelect: (result: SymbolResult) => void;
}) {
  const [results, setResults] = useState<SymbolResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(text: string) {
    onValueChange(text);
    if (timerRef.current) clearTimeout(timerRef.current);

    const query = text.trim();
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      const found = await searchSymbols(query);
      setResults(found);
      setOpen(found.length > 0);
      setLoading(false);
    }, 300);
  }

  function handlePick(result: SymbolResult) {
    onSelect(result);
    setOpen(false);
    setResults([]);
  }

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        placeholder="Nom, ticker ou ISIN…"
        autoComplete="off"
      />
      {loading && (
        <Loader2 className="text-muted-foreground absolute top-2.5 right-3 size-4 animate-spin" />
      )}

      {open && results.length > 0 && (
        <ul className="bg-popover absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border shadow-md">
          {results.map((result) => (
            <li key={`${result.symbol}-${result.exchange}`}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handlePick(result)}
                className="hover:bg-accent flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    {result.symbol}
                  </span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {result.name}
                  </span>
                </span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {result.exchange}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
