import "dotenv/config";
import { createApp } from "./app.ts";
import { env } from "./config/env.ts";
import { createPool } from "./db/pool.ts";
import { createInMemoryAnalysisRepository } from "./repositories/analysis-repository.ts";
import { createPostgresAnalysisRepository } from "./repositories/postgres-analysis-repository.ts";

const pool = env.databaseUrl ? await createPool(env.databaseUrl) : null;
const repository = pool
  ? createPostgresAnalysisRepository(pool)
  : createInMemoryAnalysisRepository();
const server = createApp(repository).listen(env.port, () => {
  console.log(`listening on http://localhost:${env.port}`);
});

const shutdown = (): void => {
  server.close((error) => {
    if (error) {
      console.error("Failed to close HTTP server", error);
      process.exitCode = 1;
    }
    if (!pool) return;
    void pool.end().then(
      () => undefined,
      (poolError: unknown) => {
        console.error("Failed to close database pool", poolError);
        process.exitCode = 1;
      },
    );
  });
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
