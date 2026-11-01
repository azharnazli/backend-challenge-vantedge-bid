CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL,
  text text NOT NULL,
  extraction jsonb NOT NULL
);
