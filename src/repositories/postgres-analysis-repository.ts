import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import type { Analysis, Extraction } from "../types/analysis.ts";
import type { AnalysisRepository } from "./analysis-repository.ts";

type AnalysisRow = {
  id: string;
  created_at: Date;
  text: string;
  extraction: Extraction;
};

const toAnalysis = (row: AnalysisRow): Analysis => ({
  id: row.id,
  createdAt: row.created_at.toISOString(),
  text: row.text,
  extraction: row.extraction,
});

export const createPostgresAnalysisRepository = (
  pool: Pool,
): AnalysisRepository => ({
  save: async (text, extraction) => {
    const id = randomUUID();
    const result = await pool.query<AnalysisRow>(
      "INSERT INTO analyses (id, created_at, text, extraction) VALUES ($1, NOW(), $2, $3) RETURNING id, created_at, text, extraction",
      [id, text, JSON.stringify(extraction)],
    );
    const row = result.rows[0];
    if (!row) throw new Error("Insert did not return an analysis");
    return toAnalysis(row);
  },
  findById: async (id) => {
    const result = await pool.query<AnalysisRow>(
      "SELECT id, created_at, text, extraction FROM analyses WHERE id = $1",
      [id],
    );
    return result.rows[0] ? toAnalysis(result.rows[0]) : null;
  },
});
