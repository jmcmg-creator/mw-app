"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { refreshAllPrices } from "@/actions/refreshAllPrices";

/**
 * Polls Yahoo Finance for fresh prices while the page is mounted.
 * Renders nothing.
 */
export function AutoRefresh({ intervalMs = 60_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const id = setInterval(async () => {
      try {
        const result = await refreshAllPrices();
        if (!cancelled && result.updated > 0) {
          router.refresh();
        }
      } catch {
        // Transient errors are silently ignored.
      }
    }, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs, router]);

  return null;
}
