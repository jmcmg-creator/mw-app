"use server";

import * as XLSX from "xlsx";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const currencyEnum = z.enum(["EUR", "USD", "GBP", "CHF", "JPY", "CAD", "AUD"]);

const positionSchema = z.object({
  name: z.string().describe("Nom de la valeur"),
  ticker: z.string().nullable(),
  isin: z.string().nullable().describe("Code ISIN 12 caractères ou null"),
  type: z.enum(["ACTION", "ETF", "OBLIGATION", "STRUCTURE"]).nullable(),
  sector: z
    .string()
    .nullable()
    .describe(
      "Secteur de la société si présent dans le document (ex: Technologie, Santé)",
    ),
  quantity: z.number().describe("Quantité d'unités détenues"),
  unitPrice: z.number().nullable().describe("PRU / prix d'achat si indiqué"),
  currentPrice: z
    .number()
    .nullable()
    .describe("Cours actuel / valeur unitaire de marché si indiqué"),
  currentValue: z
    .number()
    .nullable()
    .describe("Valorisation totale de la ligne si indiquée"),
  gainAmount: z
    .number()
    .nullable()
    .describe("Plus/moins-value latente en montant si indiquée"),
  gainPct: z
    .number()
    .nullable()
    .describe("Plus/moins-value latente en % (0.12 pour +12%) si indiquée"),
  weight: z
    .number()
    .nullable()
    .describe("Poids dans le portefeuille (0.08 pour 8%) si indiqué"),
  dividendYield: z
    .number()
    .nullable()
    .describe("Rendement dividende (0.03 pour 3%) si indiqué"),
  currency: currencyEnum,
  date: z.string().nullable().describe("Date d'achat YYYY-MM-DD ou null"),
});

const cashSchema = z.object({
  currency: currencyEnum,
  amount: z.number(),
});

const statementSchema = z.object({
  broker: z
    .string()
    .nullable()
    .describe("Courtier émetteur du document si identifiable"),
  accountNumber: z
    .string()
    .nullable()
    .describe("Numéro de compte si présent (masqué partiellement OK)"),
  accountType: z
    .string()
    .nullable()
    .describe("Type de compte (PEA, CTO, AV, Compte titres…)"),
  statementDate: z
    .string()
    .nullable()
    .describe("Date d'arrêté du relevé YYYY-MM-DD"),
  periodStart: z
    .string()
    .nullable()
    .describe("Début de période YYYY-MM-DD si applicable"),
  periodEnd: z
    .string()
    .nullable()
    .describe("Fin de période YYYY-MM-DD si applicable"),
  baseCurrency: currencyEnum.nullable(),
  totalValue: z
    .number()
    .nullable()
    .describe("Valorisation totale du portefeuille indiquée"),
  totalInvested: z
    .number()
    .nullable()
    .describe("Montant investi total indiqué"),
  totalGain: z
    .number()
    .nullable()
    .describe("Plus/moins-value latente totale en montant"),
  totalGainPct: z
    .number()
    .nullable()
    .describe("Plus/moins-value latente totale en % (0.12 = +12%)"),
  cashBalances: z
    .array(cashSchema)
    .describe("Liquidités par devise si présentes (sinon tableau vide)"),
});

const extractionSchema = z.object({
  statement: statementSchema,
  positions: z.array(positionSchema),
});

export type ExtractedPosition = z.infer<typeof positionSchema>;
export type ExtractedStatement = z.infer<typeof statementSchema>;
export type ExtractedPortfolio = z.infer<typeof extractionSchema>;

/** Extracts every holding from a brokerage statement (Excel or PDF). */
export async function extractPortfolio(
  formData: FormData,
): Promise<ExtractedPortfolio> {
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
    "Tu lis un relevé de portefeuille (courtier, banque, assurance-vie). " +
    "Renvoie TOUTES les informations utiles présentes dans le document.\n\n" +
    "**statement** — métadonnées du relevé (broker, numéro de compte, type " +
    "de compte PEA/CTO/AV, date d'arrêté, période, devise de référence, " +
    "valorisation totale, montant investi, plus/moins-value latente totale, " +
    "liquidités par devise). Les champs absents → null (ou tableau vide " +
    "pour cashBalances).\n\n" +
    "**positions** — pour CHAQUE ligne détenue (ignore cash, frais, totaux) :" +
    " name, ticker, isin (12 car), type (ACTION/ETF/OBLIGATION/STRUCTURE), " +
    "sector (technologie, santé, énergie...), quantity, unitPrice (PRU), " +
    "currentPrice (cours du jour si indiqué), currentValue (valorisation " +
    "totale ligne), gainAmount, gainPct (0.12 = +12%), weight (0.08 = 8% " +
    "du portefeuille), dividendYield, currency, date d'achat YYYY-MM-DD. " +
    "Tout champ absent → null. Ne devine pas un PRU à partir du cours.";

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

  // gpt-4o is markedly better on complex broker PDFs / tabular statements.
  const { object } = await generateObject({
    model: openai(isPdf ? "gpt-4o" : "gpt-4o-mini"),
    schema: extractionSchema,
    messages: [{ role: "user", content }],
  });

  return object;
}
