import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionForm } from "./transaction-form";

export default async function NewTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();

  const asset = await prisma.asset.findFirst({
    where: { id, portfolio: { userId } },
  });
  if (!asset) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild aria-label="Retour">
          <Link href={`/assets/${id}`}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">
          Nouvelle transaction
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{asset.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm assetId={id} currency={asset.currency} />
        </CardContent>
      </Card>
    </div>
  );
}
