-- Reviewer arena (arena/run.ts, docs/control-plane/ARENA.md). One row per (model, seed) case: a seed
-- planted into a base diff, or a clean control (seed_class = 'clean') with the base diff unchanged.
-- caught: the model blocked with a high/critical finding that names the seed. false_alarm: a
-- high/critical finding on a clean control. error: the model call failed (scored as not caught).
CREATE TABLE IF NOT EXISTS arena_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at INTEGER NOT NULL,
  model TEXT NOT NULL,
  knobs_json TEXT NOT NULL DEFAULT '{}',
  seed_id TEXT NOT NULL,
  seed_class TEXT NOT NULL,
  base_ref TEXT NOT NULL,
  caught INTEGER NOT NULL DEFAULT 0 CHECK (caught IN (0, 1)),
  false_alarm INTEGER NOT NULL DEFAULT 0 CHECK (false_alarm IN (0, 1)),
  severity TEXT CHECK (severity IS NULL OR severity IN ('info', 'low', 'medium', 'high', 'critical')),
  latency_ms INTEGER NOT NULL DEFAULT 0,
  tokens_out INTEGER NOT NULL DEFAULT 0,
  error TEXT
);
CREATE INDEX IF NOT EXISTS arena_runs_model ON arena_runs (model, created_at DESC);

-- Per model: catch rate over seeded cases, false-alarm rate over clean controls, median latency over
-- all cases, and the counts behind them. Same definition as scoreRows in arena/score.ts.
CREATE VIEW IF NOT EXISTS arena_scores AS
WITH ranked AS (
  SELECT model, latency_ms,
    ROW_NUMBER() OVER (PARTITION BY model ORDER BY latency_ms) AS rn,
    COUNT(*) OVER (PARTITION BY model) AS cnt
  FROM arena_runs
),
p50 AS (
  SELECT model, AVG(latency_ms) AS p50_latency_ms
  FROM ranked
  WHERE rn IN ((cnt + 1) / 2, (cnt + 2) / 2)
  GROUP BY model
)
SELECT
  r.model AS model,
  COUNT(*) AS n,
  SUM(CASE WHEN r.seed_class <> 'clean' THEN 1 ELSE 0 END) AS n_seeded,
  SUM(CASE WHEN r.seed_class = 'clean' THEN 1 ELSE 0 END) AS n_clean,
  AVG(CASE WHEN r.seed_class <> 'clean' THEN r.caught END) AS catch_rate,
  AVG(CASE WHEN r.seed_class = 'clean' THEN r.false_alarm END) AS false_alarm_rate,
  p.p50_latency_ms AS p50_latency_ms
FROM arena_runs r
JOIN p50 p ON p.model = r.model
GROUP BY r.model;
