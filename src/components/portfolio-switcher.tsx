"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, User, Users, Wallet } from "lucide-react";

import { setActivePortfolio } from "@/actions/setActivePortfolio";
import { cn } from "@/lib/utils";

export type PortfolioOption = {
  id: string;
  name: string;
  holderName: string | null;
  holderType: "INDIVIDUAL" | "COMPANY" | null;
};

/**
 * Dropdown for switching the active holder/portfolio. Hidden when the user
 * only has one portfolio so the UI stays clean for the common case.
 */
export function PortfolioSwitcher({
  portfolios,
  activeId,
}: {
  portfolios: PortfolioOption[];
  activeId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (portfolios.length <= 1) return null;

  const active = portfolios.find((p) => p.id === activeId) ?? portfolios[0];
  const activeLabel = active.holderName ?? active.name;
  const ActiveIcon =
    active.holderType === "COMPANY"
      ? Users
      : active.holderType === "INDIVIDUAL"
        ? User
        : Wallet;

  function pick(id: string) {
    setOpen(false);
    if (id === activeId) return;
    startTransition(async () => {
      await setActivePortfolio(id);
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        className={cn(
          "border-border bg-card hover:bg-accent/50 flex items-center gap-1.5 rounded-full border py-1 pr-2 pl-2.5 text-xs font-semibold transition-colors",
          pending && "opacity-60",
        )}
      >
        <ActiveIcon className="text-muted-foreground size-3.5" />
        <span className="max-w-[10rem] truncate">{activeLabel}</span>
        <ChevronsUpDown className="text-muted-foreground size-3" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fermer"
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="bg-popover border-border absolute right-0 z-20 mt-1.5 w-64 overflow-hidden rounded-xl border shadow-lg">
            <div className="border-border bg-muted/30 border-b px-3 py-2">
              <p className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
                Titulaires
              </p>
            </div>
            <ul className="flex flex-col p-1">
              {portfolios.map((p) => {
                const Icon =
                  p.holderType === "COMPANY"
                    ? Users
                    : p.holderType === "INDIVIDUAL"
                      ? User
                      : Wallet;
                const isActive = p.id === activeId;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => pick(p.id)}
                      className={cn(
                        "hover:bg-accent/60 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                        isActive && "bg-accent/40",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {p.holderName ?? p.name}
                        </p>
                        {p.holderType && (
                          <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
                            {p.holderType === "COMPANY"
                              ? "Société"
                              : "Personne physique"}
                          </p>
                        )}
                      </div>
                      {isActive && (
                        <Check className="text-foreground size-4 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
