"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DeleteButton({
  onConfirm,
  confirmText,
  redirectTo,
  label,
  variant = "ghost",
  size = "icon",
}: {
  /** A bound server action, e.g. deleteAsset.bind(null, id). */
  onConfirm: () => Promise<void>;
  confirmText: string;
  redirectTo?: string;
  label?: string;
  variant?: "ghost" | "outline" | "destructive";
  size?: "icon" | "sm";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!window.confirm(confirmText)) return;
    setLoading(true);
    try {
      await onConfirm();
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading}
      aria-label={label ?? "Supprimer"}
    >
      {loading ? <Loader2 className="animate-spin" /> : <Trash2 />}
      {label}
    </Button>
  );
}
