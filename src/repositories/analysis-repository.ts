import { randomUUID } from "node:crypto";
import type { Analysis, Extraction } from "../types/analysis.ts";

export type AnalysisRepository = {
  save: (text: string, extraction: Extraction) => Promise<Analysis>;
  findById: (id: string) => Promise<Analysis | null>;
};

export const createInMemoryAnalysisRepository = (): AnalysisRepository => {
  const analyses = new Map<string, Analysis>();

  return {
    save: (text, extraction) => {
      const analysis: Analysis = {
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        text,
        extraction,
      };
      analyses.set(analysis.id, analysis);
      return Promise.resolve(analysis);
    },
    findById: (id) => Promise.resolve(analyses.get(id) ?? null),
  };
};
