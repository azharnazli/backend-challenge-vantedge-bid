CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL,
  text text NOT NULL,
  text_hash text NOT NULL UNIQUE,
  extraction jsonb NOT NULL
);

ALTER TABLE analyses ADD COLUMN IF NOT EXISTS text_hash text;
CREATE UNIQUE INDEX IF NOT EXISTS analyses_text_hash_key ON analyses(text_hash);
