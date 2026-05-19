import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { calculateImmoMetrics } from "@/actions/calculateImmoMetrics";
import { deleteAsset, deleteLoan } from "@/actions/deleteEntities";
import { DeleteButton } from "@/components/delete-button";
import {
  PROPERTY_TYPE_LABELS,
  formatCurrency,
  formatNumber,
  formatPercent,
  toNumber,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();

  const asset = await prisma.asset.findFirst({
    where: { id, portfolio: { userId }, type: "IMMO" },
    include: { loans: true },
  });
  if (!asset) {
    notFound();
  }

  const metrics = await calculateImmoMetrics(id);
  const currency = asset.currency;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild aria-label="Retour">
          <Link href="/dashboard">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight">
            {asset.name}
          </h1>
          <p className="text-muted-foreground truncate text-xs">
            {[
              asset.propertyType
                ? PROPERTY_TYPE_LABELS[asset.propertyType]
                : null,
              asset.address,
            ]
              .filter(Boolean)
              .join(" · ") || "Bien immobilier"}
          </p>
        </div>
        <DeleteButton
          onConfirm={deleteAsset.bind(null, id)}
          confirmText="Supprimer ce bien et ses prêts ?"
          redirectTo="/dashboard"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Valorisation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="text-2xl font-semibold">
              {formatCurrency(metrics.currentValuation, currency)}
            </p>
            <p
              className={
                metrics.appreciation >= 0
                  ? "text-success text-sm"
                  : "text-destructive text-sm"
              }
            >
              {formatCurrency(metrics.appreciation, currency)} (
              {formatPercent(metrics.appreciationPct)})
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric
              label="Prix d'achat"
              value={formatCurrency(metrics.purchasePrice, currency)}
            />
            <Metric
              label="Apport"
              value={formatCurrency(metrics.personalEquity, currency)}
            />
            <Metric
              label="Surface"
              value={`${formatNumber(metrics.surfaceSqm)} m²`}
            />
            <Metric label="LTV" value={formatPercent(metrics.loanToValue)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rentabilité</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <span className="text-muted-foreground text-xs">
              Cashflow annuel
            </span>
            <p
              className={
                metrics.annualCashflow >= 0
                  ? "text-success text-xl font-semibold"
                  : "text-destructive text-xl font-semibold"
              }
            >
              {formatCurrency(metrics.annualCashflow, currency)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="ROE" value={formatPercent(metrics.roe)} />
            <Metric label="ROI" value={formatPercent(metrics.roi)} />
            <Metric
              label="Rdt brut"
              value={formatPercent(metrics.grossYield)}
            />
            <Metric label="Rdt net" value={formatPercent(metrics.netYield)} />
            <Metric
              label="Loyer annuel"
              value={formatCurrency(metrics.annualRent, currency)}
            />
            <Metric
              label="Service dette"
              value={formatCurrency(metrics.annualDebtService, currency)}
            />
            <Metric
              label="Revenu / m² (an)"
              value={formatCurrency(metrics.annualRentPerSqm, currency)}
            />
            <Metric
              label="Charges annuelles"
              value={formatCurrency(metrics.annualCharges, currency)}
            />
          </div>
          {metrics.hasIncompleteDebtData && (
            <p className="text-warning text-xs">
              Un prêt à taux variable n&apos;a ni échéancier ni taux estimé :
              son service de la dette n&apos;est pas compté.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Prêts ({asset.loans.length})</h2>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/properties/${id}/loans/new`}>
            <Plus />
            Ajouter
          </Link>
        </Button>
      </div>

      {asset.loans.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-6 text-center text-sm">
            Aucun prêt. Ajoutez-en un pour calculer le cashflow net.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {asset.loans.map((loan) => (
            <Card
              key={loan.id}
              className="flex-row items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {loan.lender ?? "Prêt"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {loan.rateType === "FIXE" ? "Taux fixe" : "Taux variable"}
                  {" · "}
                  {loan.durationMonths} mois
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">
                  {formatCurrency(toNumber(loan.principal), currency)}
                </span>
                <DeleteButton
                  onConfirm={deleteLoan.bind(null, loan.id)}
                  confirmText="Supprimer ce prêt ?"
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
