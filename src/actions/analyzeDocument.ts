"use server";

import * as XLSX from "xlsx";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const factSchema = z.object({
  label: z.string().describe("Libellé court du champ (en français)"),
  value: z
    .string()
    .describe("Valeur formatée (montants avec devise, dates lisibles)"),
  category: z
    .enum(["identity", "money", "date", "term", "party", "other"])
    .describe(
      "identity = nom/ID, money = montant, date = date, term = clause, party = personne/société, other = divers",
    ),
});

const sectionSchema = z.object({
  title: z.string().describe("Titre de la section (ex: Conditions, Parties)"),
  facts: z.array(factSchema).min(1),
});

const analysisSchema = z.object({
  documentKind: z
    .string()
    .describe("Nature précise du document (ex: Relevé annuel, Acte de vente)"),
  summary: z
    .string()
    .describe("Résumé en 2 phrases du contenu et de l'objet du document"),
  headline: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .nullable()
    .describe(
      "Chiffre/info phare à mettre en avant (ex: 'Montant', '120 000 €')",
    ),
  sections: z.array(sectionSchema).min(1),
  warnings: z
    .array(z.string())
    .describe(
      "Points d'attention détectés (échéances, clauses inhabituelles…)",
    ),
});

export type DocumentAnalysis = z.infer<typeof analysisSchema>;

const KIND_PROMPTS: Record<string, string> = {
  ACTE_VENTE:
    "Acte de vente immobilier : extrais les parties (vendeur, acquéreur), " +
    "le bien (adresse, surface, lots), le prix, la date, les frais de " +
    "notaire, conditions suspensives, garanties.",
  BAIL:
    "Bail (location) : parties (bailleur, locataire), bien loué, durée, " +
    "loyer (montant, périodicité, indexation), charges, dépôt de garantie, " +
    "clauses particulières (animaux, sous-location, état des lieux).",
  RELEVE:
    "Relevé bancaire ou de courtage : titulaire, numéro de compte, " +
    "période, valorisation totale, mouvements clés, dividendes, frais, " +
    "soldes en cash par devise, performance.",
  CONTRAT_PRET:
    "Contrat de prêt : prêteur, emprunteur, montant emprunté, durée, taux " +
    "(fixe/variable, indice), assurance, mensualité, coût total du crédit, " +
    "garanties (hypothèque, caution), pénalités de remboursement anticipé.",
  FISCAL:
    "Document fiscal : année concernée, revenus déclarés, prélèvements, " +
    "abattements, impôt dû, références fiscales (numéro fiscal).",
  TERM_SHEET:
    "Term sheet de produit structuré : émetteur, sous-jacent, ISIN, date " +
    "d'émission/maturité, strike, coupon, barrière capital, barrière coupon, " +
    "fréquence d'observation, mécanisme d'autocall, devise, garant.",
  AUTRE:
    "Document financier divers : extrais toutes les informations chiffrées, " +
    "les dates, les parties impliquées et les conditions/clauses utiles.",
};

/**
 * Reads any document attached to a user's asset and returns a structured,
 * human-readable summary tailored to the document type. The summary is
 * grouped into sections so the UI can render it as a nice info card.
 */
export async function analyzeDocument(
  documentId: string,
): Promise<DocumentAnalysis> {
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

  const typeHint = KIND_PROMPTS[document.type] ?? KIND_PROMPTS.AUTRE;
  const instruction =
    "Analyse ce document pour l'actif \"" +
    document.asset.name +
    '" et renvoie une fiche structurée en français.\n\n' +
    "Type attendu : " +
    typeHint +
    "\n\n" +
    "Règles :\n" +
    "- Groupe les informations en sections logiques (Identité, Conditions, Parties, Montants, Échéances, etc.).\n" +
    '- Formate les montants avec leur devise (ex: "1 200,50 €"), les dates en français (ex: "5 mars 2025").\n' +
    "- N'invente aucune donnée. Si l'information n'est pas présente, ne l'inclus pas.\n" +
    "- Mets en avant LE chiffre / la donnée la plus importante dans 'headline' (ex: prix, mensualité, valorisation).\n" +
    "- Liste sous 'warnings' tout point d'attention concret (échéance proche, clause inhabituelle, pénalités, etc.).";

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
    model: openai(isPdf ? "gpt-4o" : "gpt-4o-mini"),
    schema: analysisSchema,
    messages: [{ role: "user", content }],
  });

  return object;
}
