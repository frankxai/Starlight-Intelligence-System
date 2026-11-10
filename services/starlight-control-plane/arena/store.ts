// D1 access for the reviewer arena: write arena_runs rows, read the arena_scores view.
// Pure apart from the injected D1 binding (tests drive it with node:sqlite and the real migration).

import type { D1Like } from '../src/review.ts';
import type { ArenaRow, ModelScore } from './score.ts';

export async function recordArenaRows(db: D1Like, rows: ArenaRow[]): Promise<void> {
  for (const r of rows) {
    await db.prepare(`INSERT INTO arena_runs (created_at, model, knobs_json, seed_id, seed_class, base_ref, caught, false_alarm, severity, latency_ms, tokens_out, error)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(r.created_at, r.model, r.knobs_json, r.seed_id, r.seed_class, r.base_ref, r.caught, r.false_alarm, r.severity, r.latency_ms, r.tokens_out, r.error ?? null)
      .run();
  }
}

export async function readArenaScores(db: D1Like): Promise<ModelScore[]> {
  const { results } = await db.prepare('SELECT model, n, n_seeded, n_clean, catch_rate, false_alarm_rate, p50_latency_ms FROM arena_scores ORDER BY model').bind().all();
  return (results as Record<string, unknown>[]).map((r) => ({
    model: String(r.model),
    n: Number(r.n),
    n_seeded: Number(r.n_seeded),
    n_clean: Number(r.n_clean),
    catch_rate: r.catch_rate == null ? null : Number(r.catch_rate),
    false_alarm_rate: r.false_alarm_rate == null ? null : Number(r.false_alarm_rate),
    p50_latency_ms: r.p50_latency_ms == null ? null : Number(r.p50_latency_ms),
  }));
}
