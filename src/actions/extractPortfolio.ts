"use server";

import * as XLSX from "xlsx";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const positionSchema = z.object({
  positions: z.array(
    z.object({
      name: z.string().describe("Nom de la valeur"),
      ticker: z.string().nullable(),
      isin: z.string().nullable().describe("Code ISIN 12 caractères ou null"),
      type: z.enum(["ACTION", "ETF", "OBLIGATION", "STRUCTURE"]).nullable(),
      quantity: z.number().describe("Quantité d'unités détenues"),
      unitPrice: z
        .number()
        .nullable()
        .describe("PRU/prix d'achat ou à défaut cours actuel"),
      currency: z.enum(["EUR", "USD", "GBP", "CHF", "JPY", "CAD", "AUD"]),
      date: z.string().nullable().describe("Date d'achat YYYY-MM-DD ou null"),
    }),
  ),
});

export type ExtractedPosition = z.infer<
  typeof positionSchema
>["positions"][number];

/** Extracts every holding from a brokerage statement (Excel or PDF). */
export async function extractPortfolio(
  formData: FormData,
): Promise<ExtractedPosition[]> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file provided.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type;
  const isExcel =
    /\.(xlsx|xls|csv)$/i.test(file.name) ||
    mime.includes("sheet") ||
    mime.includes("csv") ||
    mime.includes("excel");
  const isPdf = mime.includes("pdf") || /\.pdf$/i.test(file.name);

  const instruction =
    "Extrais TOUTES les positions présentes dans ce relevé de portefeuille. " +
    "Pour chacune: name (nom de la valeur), ticker si présent, isin (12 car) " +
    "si présent, type (ACTION/ETF/OBLIGATION/STRUCTURE) à deviner du contexte, " +
    "quantity (nombre d'unités détenues), unitPrice (PRU/prix d'achat si " +
    "indiqué, sinon le cours actuel), currency, date (YYYY-MM-DD) si " +
    "disponible. Ignore les lignes de cash, frais et totaux.";

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
    schema: positionSchema,
    messages: [{ role: "user", content }],
  });

  return object.positions;
}
