# Backend Challenge — Vantedge Bid

A single REST API endpoint that receives tender text, runs a simple
keyword-extraction simulation, and stores the extraction result.

Status: scaffold only. No implementation code yet.

## Tech stack

- Node.js / TypeScript

## Planned endpoint

- `POST /api/tenders/analyze` — JSON text input only, returns 200.

Input: tender text. Output: an extraction with keywords, tender terms,
deadlines, and budgets, saved to the database.

## Folder structure

```
src/
  config/        # environment and app configuration
  routes/        # HTTP routes only
  services/      # extraction logic (pure, no database access)
  repositories/  # storage interface and implementations
  db/            # database client (PostgreSQL / Supabase)
  types/         # shared types
test/            # tests
sql/             # database schema
```

## Storage

PostgreSQL / Supabase when configured, otherwise an in-memory
implementation behind the same repository interface.

## How to run

Not runnable yet — implementation is in progress. Run instructions
will be added here once the endpoint is implemented.
