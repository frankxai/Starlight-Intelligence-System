/**
 * Starlight Alexandria — the Forge (experiment registry).
 *
 * The SDLC for this vertical is experiment-first: nothing becomes a product
 * line, a provider, or a revenue claim without an experiment that names its
 * metric, its falsifier, its budget and its close date. The registry is a
 * JSON file; this module validates it and enforces the status machine.
 *
 *   proposed → running → proven | falsified | parked
 *   parked   → running (re-opened with a new closesBy)
 *
 * `proven` and `falsified` both require at least one receipt id: a verdict
 * without evidence is the corruption mode SOUL.md names.
 *
 * Built on SIP — operational tier (Domain Sub-Stack: Alexandria).
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from './catalog.js';
import type { Experiment, ExperimentStatus } from './types.js';

export const DEFAULT_EXPERIMENTS_PATH = join(REPO_ROOT, 'verticals', 'alexandria', 'experiments', 'registry.json');

export const HOUSES = ['library', 'scribe', 'synthesis', 'exchange', 'forge', 'treasury'] as const;
const STATUSES: readonly ExperimentStatus[] = ['proposed', 'running', 'proven', 'falsified', 'parked'];
const TRANSITIONS: Record<ExperimentStatus, readonly ExperimentStatus[]> = {
  proposed: ['running', 'parked'],
  running: ['proven', 'falsified', 'parked'],
  proven: [],
  falsified: [],
  parked: ['running'],
};
const ID_RE = /^exp-\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface ExperimentProblem { id: string; message: string }

export function validateExperiment(e: Partial<Experiment>): ExperimentProblem[] {
  const id = typeof e.id === 'string' ? e.id : '<no id>';
  const problems: ExperimentProblem[] = [];
  if (!ID_RE.test(id)) problems.push({ id, message: 'id must look like exp-YYYY-MM-DD-slug' });
  if (!HOUSES.includes(e.house as (typeof HOUSES)[number])) problems.push({ id, message: `house must be one of ${HOUSES.join('|')}` });
  for (const key of ['hypothesis', 'metric', 'falsifier', 'budget'] as const) {
    if (typeof e[key] !== 'string' || e[key]!.trim().length < 8) problems.push({ id, message: `${key} must be a full sentence of at least 8 characters` });
  }
  if (typeof e.owner !== 'string' || !/^[a-z][a-z0-9-]*$/.test(e.owner)) problems.push({ id, message: 'owner must be a lower-case slug' });
  if (!STATUSES.includes(e.status as ExperimentStatus)) problems.push({ id, message: `status must be one of ${STATUSES.join('|')}` });
  if (typeof e.openedAt !== 'string' || !DATE_RE.test(e.openedAt)) problems.push({ id, message: 'openedAt must be YYYY-MM-DD' });
  if (typeof e.closesBy !== 'string' || !DATE_RE.test(e.closesBy)) problems.push({ id, message: 'closesBy must be YYYY-MM-DD' });
  else if (typeof e.openedAt === 'string' && e.closesBy < e.openedAt) problems.push({ id, message: 'closesBy must not precede openedAt' });
  if (!Array.isArray(e.receipts)) problems.push({ id, message: 'receipts must be an array (may be empty while proposed/running)' });
  else if ((e.status === 'proven' || e.status === 'falsified') && e.receipts.length === 0) problems.push({ id, message: `${e.status} needs at least one receipt id` });
  return problems;
}

export function validateRegistry(raw: unknown): ExperimentProblem[] {
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as { experiments?: unknown }).experiments)) {
    return [{ id: '$', message: 'registry must be { experiments: [] }' }];
  }
  const list = (raw as { experiments: Partial<Experiment>[] }).experiments;
  const problems = list.flatMap(validateExperiment);
  const seen = new Set<string>();
  for (const e of list) {
    if (typeof e.id !== 'string') continue;
    if (seen.has(e.id)) problems.push({ id: e.id, message: 'duplicate experiment id' });
    seen.add(e.id);
  }
  return problems;
}

export function loadExperiments(path: string = DEFAULT_EXPERIMENTS_PATH): Experiment[] {
  const raw: unknown = JSON.parse(readFileSync(path, 'utf8'));
  const problems = validateRegistry(raw);
  if (problems.length > 0) throw new Error(`Invalid experiment registry at ${path}: ${problems.map((p) => `${p.id}: ${p.message}`).join('; ')}`);
  return (raw as { experiments: Experiment[] }).experiments;
}

export function canTransition(from: ExperimentStatus, to: ExperimentStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Returns the updated experiment or throws; never mutates the input. */
export function transition(e: Experiment, to: ExperimentStatus, evidence: { receipts?: readonly string[]; closesBy?: string; notes?: string } = {}): Experiment {
  if (!canTransition(e.status, to)) throw new Error(`${e.id}: cannot move from ${e.status} to ${to}`);
  const receipts = [...e.receipts, ...(evidence.receipts ?? [])];
  if ((to === 'proven' || to === 'falsified') && receipts.length === 0) throw new Error(`${e.id}: ${to} needs a receipt`);
  const next: Experiment = { ...e, status: to, receipts };
  if (evidence.closesBy) next.closesBy = evidence.closesBy;
  if (evidence.notes) next.notes = evidence.notes;
  const problems = validateExperiment(next);
  if (problems.length > 0) throw new Error(problems.map((p) => p.message).join('; '));
  return next;
}

/** Experiments past their close date that are still open. The weekly pulse lists these first. */
export function overdue(list: readonly Experiment[], today: string): Experiment[] {
  return list.filter((e) => (e.status === 'proposed' || e.status === 'running') && e.closesBy < today);
}
