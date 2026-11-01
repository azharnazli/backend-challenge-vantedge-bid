import { Router } from "express";
import type { AnalysisRepository } from "../repositories/analysis-repository.ts";
import { extract } from "../services/extract.ts";

export const createTendersRouter = (repository: AnalysisRepository): Router => {
  const router = Router();

  router.post("/analyze", async (req, res) => {
    const body: unknown = req.body;
    const text: unknown =
      body !== null && typeof body === "object" && "text" in body
        ? body.text
        : undefined;
    if (typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "text must be a non-empty string" });
      return;
    }

    try {
      const { id, createdAt, extraction } = await repository.save(
        text,
        extract(text),
      );
      res.json({ id, createdAt, extraction });
    } catch (error) {
      console.error("Failed to save tender analysis", error);
      res.status(500).json({ error: "internal error" });
    }
  });

  return router;
};
