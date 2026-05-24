"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, Settings, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/analyse", label: "Analyse", icon: BarChart3 },
  {
    href: "/structured-products",
    label: "Structurés",
    icon: ShieldAlert,
  },
  { href: "/settings", label: "Réglages", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-background/95 border-border sticky bottom-0 border-t backdrop-blur">
      <div className="mx-auto flex max-w-xl items-stretch justify-around px-5 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
