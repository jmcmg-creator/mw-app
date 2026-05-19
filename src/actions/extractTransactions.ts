"use server";

import * as XLSX from "xlsx";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const transactionSchema = z.object({
  transactions: z.array(
    z.object({
      type: z.enum(["BUY", "SELL", "DIVIDEND", "FEE"]),
      date: z.string().describe("Transaction date, format YYYY-MM-DD"),
      quantity: z.number().nullable().describe("Units traded, null if N/A"),
      unitPrice: z.number().nullable().describe("Price per unit, null if N/A"),
      amount: z.number().describe("Gross amount, positive number"),
      fees: z.number().nullable().describe("Fees, null if none"),
    }),
  ),
});

export type ExtractedTransaction = z.infer<
  typeof transactionSchema
>["transactions"][number];

/**
 * Reads an uploaded document (Excel/CSV or PDF/image) and extracts the
 * brokerage transactions it contains via OpenAI. Nothing is persisted —
 * the caller reviews the result before importing.
 */
export async function extractTransactions(
  documentId: string,
): Promise<ExtractedTransaction[]> {
  const userId = await requireUserId();

  const document = await prisma.document.findFirst({
    where: { id: documentId, asset: { portfolio: { userId } } },
    include: { asset: true },
  });
  if (!document) {
    throw new Error("Document not found.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(document.storageBucket)
    .download(document.storagePath);
  if (error || !data) {
    throw new Error("Could not read the document.");
  }
  const buffer = Buffer.from(await data.arrayBuffer());

  const mime = document.mimeType ?? "";
  const isExcel =
    /\.(xlsx|xls|csv)$/i.test(document.title) ||
    mime.includes("sheet") ||
    mime.includes("csv") ||
    mime.includes("excel");
  const isPdf = mime.includes("pdf") || /\.pdf$/i.test(document.title);

  const instruction =
    `Extrais les transactions boursières de ce document pour l'actif ` +
    `"${document.asset.name}". Types: BUY (achat), SELL (vente), ` +
    `DIVIDEND (dividende), FEE (frais). Dates au format YYYY-MM-DD. ` +
    `"amount" = montant brut positif. Ignore les lignes qui ne sont pas ` +
    `des transactions.`;

  let content: Array<
    | { type: "text"; text: string }
    | { type: "file"; data: Buffer; mediaType: string }
    | { type: "image"; image: Buffer }
  >;

  if (isExcel) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const csv = sheet ? XLSX.utils.sheet_to_csv(sheet) : "";
    content = [
      { type: "text", text: `${instruction}\n\nContenu (CSV):\n${csv}` },
    ];
  } else if (isPdf) {
    content = [
      { type: "text", text: instruction },
      { type: "file", data: buffer, mediaType: "application/pdf" },
    ];
  } else {
    content = [
      { type: "text", text: instruction },
      { type: "image", image: buffer },
    ];
  }

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: transactionSchema,
    messages: [{ role: "user", content }],
  });

  return object.transactions;
}
