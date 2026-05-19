"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const ISIN_PATTERN = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;

/**
 * Best-effort ISIN lookup for a security via the LLM. Returns null when
 * the result is not a syntactically valid ISIN. Always verify the value.
 */
export async function lookupIsin(
  name: string,
  symbol: string,
): Promise<string | null> {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        isin: z
          .string()
          .nullable()
          .describe("The 12-character ISIN, or null if not certain"),
      }),
      prompt:
        `Donne le code ISIN officiel de cette valeur cotée. ` +
        `Nom: "${name}". Ticker: "${symbol}". ` +
        `Un ISIN fait 12 caractères (2 lettres pays + 9 alphanum + 1 chiffre). ` +
        `Si tu n'es pas certain, renvoie null — ne devine pas.`,
    });

    const isin = object.isin?.trim().toUpperCase() ?? "";
    return ISIN_PATTERN.test(isin) ? isin : null;
  } catch {
    return null;
  }
}
