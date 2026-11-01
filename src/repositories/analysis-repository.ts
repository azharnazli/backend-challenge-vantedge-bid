import { randomUUID } from "node:crypto";
import type { Analysis, Extraction } from "../types/analysis.ts";
import { hashText } from "./text-hash.ts";

export type AnalysisRepository = {
  save: (text: string, extraction: Extraction) => Promise<Analysis>;
  findById: (id: string) => Promise<Analysis | null>;
};

export const createInMemoryAnalysisRepository = (): AnalysisRepository => {
  const analyses = new Map<string, Analysis>();
  const idsByTextHash = new Map<string, string>();

  return {
    save: (text, extraction) => {
      const textHash = hashText(text);
      const existingId = idsByTextHash.get(textHash);
      const existing = existingId ? analyses.get(existingId) : undefined;
      if (existing) return Promise.resolve(existing);

      const analysis: Analysis = {
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        text,
        extraction,
      };
      analyses.set(analysis.id, analysis);
      idsByTextHash.set(textHash, analysis.id);
      return Promise.resolve(analysis);
    },
    findById: (id) => Promise.resolve(analyses.get(id) ?? null),
  };
};
