-- One row per cf-review run that posted a comment. (repo, pr, sha) is unique: a head SHA is
-- reviewed once, and a redelivered or duplicate queue message finds the row and stops.
CREATE TABLE IF NOT EXISTS review_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pr INTEGER NOT NULL,
  repo TEXT NOT NULL,
  sha TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('gate', 'triage')),
  models TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('pass', 'block')),
  findings_json TEXT NOT NULL,
  tokens_in INTEGER NOT NULL DEFAULT 0,
  tokens_out INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  UNIQUE (repo, pr, sha)
);
CREATE INDEX IF NOT EXISTS review_runs_recent ON review_runs (created_at DESC);
