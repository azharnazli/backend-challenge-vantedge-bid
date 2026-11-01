import express from "express";
import type { AnalysisRepository } from "./repositories/analysis-repository.ts";
import { createTendersRouter } from "./routes/tenders.ts";

export const createApp = (repository: AnalysisRepository): express.Express => {
  const app = express();
  app.use(express.json());
  app.use("/api/tenders", createTendersRouter(repository));
  return app;
};
