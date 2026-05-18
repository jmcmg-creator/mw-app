import { ArrowUpRight, Building2, LineChart, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const pillars = [
  {
    icon: LineChart,
    title: "Bourse",
    description: "Actions, ETF et produits structurés avec PRU exact.",
  },
  {
    icon: Building2,
    title: "Immobilier",
    description: "ROE, ROI et cashflow par bien, prêts amortis suivis.",
  },
  {
    icon: ShieldCheck,
    title: "Sécurisé",
    description: "Auth 2FA, GED chiffrée et audits automatisés.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          SaaS personnel
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Pilotez tout votre patrimoine.
        </h1>
        <p className="text-muted-foreground text-sm">
          Un suivi de portefeuille exhaustif : bourse, produits structurés et
          immobilier réunis dans une interface épurée.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {pillars.map((pillar) => (
          <Card key={pillar.title}>
            <CardHeader>
              <pillar.icon className="text-primary size-5" />
              <CardTitle className="mt-2">{pillar.title}</CardTitle>
              <CardDescription>{pillar.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <CardContent className="px-0">
        <Button className="w-full" size="lg">
          Commencer
          <ArrowUpRight />
        </Button>
      </CardContent>
    </main>
  );
}
