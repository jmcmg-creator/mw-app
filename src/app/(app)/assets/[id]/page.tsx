import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { calculateStockPerformance } from "@/actions/calculateStockPerformance";
import { deleteAsset, deleteTransaction } from "@/actions/deleteEntities";
import { DeleteButton } from "@/components/delete-button";
import {
  ASSET_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  toNumber,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentsCard } from "@/components/documents-card";
import { UpdatePriceForm } from "./_components/update-price-form";
import { StructuredEvaluation } from "./_components/structured-evaluation";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();

  const asset = await prisma.asset.findFirst({
    where: { id, portfolio: { userId } },
    include: {
      transactions: { orderBy: { date: "desc" } },
      structuredDetails: true,
      documents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!asset) {
    notFound();
  }

  const perf = await calculateStockPerformance(id);
  const currency = asset.currency;
  const details = asset.structuredDetails;

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
          <p className="text-muted-foreground text-xs">
            {ASSET_TYPE_LABELS[asset.type]}
            {asset.ticker && ` · ${asset.ticker}`}
          </p>
        </div>
        <DeleteButton
          onConfirm={deleteAsset.bind(null, id)}
          confirmText="Supprimer cet actif et toutes ses transactions ?"
          redirectTo="/dashboard"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="text-2xl font-semibold">
              {formatCurrency(perf.marketValue, currency)}
            </p>
            <p
              className={
                perf.unrealizedPnl >= 0
                  ? "text-success text-sm"
                  : "text-destructive text-sm"
              }
            >
              {formatCurrency(perf.unrealizedPnl, currency)} (
              {formatPercent(perf.unrealizedPnlPct)})
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Metric label="Quantité" value={formatNumber(perf.quantity, 6)} />
            <Metric label="PRU" value={formatCurrency(perf.pru, currency)} />
            <Metric
              label="Investi"
              value={formatCurrency(perf.costBasis, currency)}
            />
            <Metric
              label="Cours"
              value={formatCurrency(perf.marketPrice, currency)}
            />
            <Metric
              label="Plus-value réalisée"
              value={formatCurrency(perf.realizedPnl, currency)}
            />
            <Metric
              label="Dividendes"
              value={formatCurrency(perf.dividends, currency)}
            />
          </div>

          <UpdatePriceForm
            assetId={id}
            currentPrice={perf.marketPrice}
            ticker={asset.ticker}
          />
        </CardContent>
      </Card>

      {details && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produit structuré</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Sous-jacent" value={details.underlying_ticker} />
              <Metric
                label="Strike"
                value={formatNumber(toNumber(details.strike_price))}
              />
              <Metric
                label="Coupon"
                value={formatPercent(toNumber(details.coupon_rate))}
              />
              {details.capital_barrier != null && (
                <Metric
                  label="Barrière capital"
                  value={formatPercent(toNumber(details.capital_barrier))}
                />
              )}
              {details.coupon_barrier != null && (
                <Metric
                  label="Barrière coupon"
                  value={formatPercent(toNumber(details.coupon_barrier))}
                />
              )}
              {details.autocall_barrier != null && (
                <Metric
                  label="Autocall"
                  value={formatPercent(toNumber(details.autocall_barrier))}
                />
              )}
            </div>
            <StructuredEvaluation
              assetId={id}
              underlyingTicker={details.underlying_ticker}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">
          Transactions ({asset.transactions.length})
        </h2>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/assets/${id}/transactions/new`}>
            <Plus />
            Ajouter
          </Link>
        </Button>
      </div>

      {asset.transactions.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-6 text-center text-sm">
            Aucune transaction. Ajoutez un achat pour calculer le PRU.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {asset.transactions.map((tx) => (
            <Card
              key={tx.id}
              className="flex-row items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {TRANSACTION_TYPE_LABELS[tx.type]}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatDate(tx.date)}
                  {tx.quantity != null &&
                    ` · ${formatNumber(toNumber(tx.quantity), 6)} u.`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">
                  {formatCurrency(toNumber(tx.amount), tx.currency)}
                </span>
                <DeleteButton
                  onConfirm={deleteTransaction.bind(null, tx.id)}
                  confirmText="Supprimer cette transaction ?"
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <DocumentsCard
        assetId={id}
        documents={asset.documents.map((document) => ({
          id: document.id,
          title: document.title,
          type: document.type,
        }))}
        defaultType="RELEVE"
      />
    </div>
  );
}
