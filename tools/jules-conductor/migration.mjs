#!/usr/bin/env node
/** Offline preservation and handoff only. Built on SIP. No execution authority. */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const digest = bytes => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const ensure = (condition, message) => { if (!condition) throw new Error(message); };
const read = file => readFileSync(file);
const json = file => JSON.parse(read(file).toString('utf8'));

export function inventory(directory = root) {
  const files = ['config.json', 'next-actions.json', 'state/ledger.json', 'state/backlog.json', 'state/archive.jsonl'];
  const sources = Object.fromEntries(files.map(file => [file, read(join(directory, file))]));
  const ledger = JSON.parse(sources['state/ledger.json']);
  const backlog = JSON.parse(sources['state/backlog.json']);
  ensure(ledger.sessions && typeof ledger.sessions === 'object' && !Array.isArray(ledger.sessions), 'invalid ledger');
  ensure(Array.isArray(backlog.queue), 'invalid backlog');
  const sessions = Object.entries(ledger.sessions).map(([id, s]) => ({
    id, repository: s.repo ?? null, historical_status: s.status ?? null,
    last_observed: s.lastSeen ?? s.firstSeen ?? null, owned: s.owned === true,
    pull_request: s.pullRequest ?? null, current_remote_status: 'unverified',
  }));
  const archiveLines = sources['state/archive.jsonl'].toString('utf8').split(/\r?\n/).filter(Boolean);
  let invalidArchiveLines = 0;
  for (const line of archiveLines) { try { JSON.parse(line); } catch { invalidArchiveLines++; } }
  return {
    status: 'preservation_inventory_only', execution_performed: false,
    source_files: files.map(path => ({ path, bytes: sources[path].length, digest: digest(sources[path]) })),
    last_tick: ledger.lastTick ?? null, sessions,
    archive_lines: archiveLines.length, invalid_archive_lines: invalidArchiveLines,
    backlog: backlog.queue.map(t => ({ id: t.id, repository: t.repo, issue: t.issueNumber ?? null, armed: t.ready === true })),
    holds: ['Remote session state is unknown.', 'Retain original source bytes, including archive duplicates and malformed rows.',
      'Reconcile live GitHub issues, PR heads and lane ownership before any new execution.'],
  };
}

function safePath(path) {
  return typeof path === 'string' && path.length <= 300 &&
    /^[A-Za-z0-9_.@()[\]/-]+$/.test(path) && !path.startsWith('/') &&
    path.split('/').every(part => part && part !== '.' && part !== '..') &&
    !path.split('/').some(part => part === '.git' || part.startsWith('.env')) &&
    !/\.(pem|key)$|credentials/i.test(path);
}

function deniedPath(path, pattern) {
  // Match the config's relative globs; **/ also matches the repository root.
  const expression = pattern.split(/(\*\*\/|\*\*|\*)/).map(part =>
    part === '**/' ? '(?:.*/)?' : part === '**' ? '.*' : part === '*' ? '[^/]*' :
      part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
  return new RegExp(`^${expression}$`, 'i').test(path);
}

export function prepareHandoff(action, admission, config, now = Date.now()) {
  ensure(action && action.runner === 'jules', 'select one existing Jules board action');
  ensure(/^[a-z0-9][a-z0-9._-]{5,95}$/.test(action.id), 'invalid original task ID');
  ensure(typeof action.repo === 'string' && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(action.repo), 'invalid repository');
  ensure(config.repoProfiles?.[action.repo], 'repository is not explicitly profiled');
  ensure(Array.isArray(config.automation?.protectedRepos), 'missing protected repository policy');
  ensure(!config.automation.protectedRepos.includes(action.repo), 'protected repository: use its existing operator admission');
  ensure(config.automation.autoMerge === false && config.automation.requireSeparateReviewer === true && config.automation.julesDraftsOnly === true, 'unsafe review policy');
  ensure(Array.isArray(action.where) && action.where.length > 0 && action.where.length <= 12 && action.where.every(safePath), 'bounded relative file paths required');
  ensure(new Set(action.where).size === action.where.length, 'duplicate paths');
  const denied = config.safetyRules?.disallowedPaths;
  ensure(Array.isArray(denied) && denied.every(p => typeof p === 'string'), 'missing path exclusion policy');
  ensure(!action.where.some(path => denied.some(pattern => deniedPath(path, pattern))), 'scope violates configured path exclusions');
  ensure(typeof action.prompt === 'string' && action.prompt.length >= 40 && action.prompt.length <= 4000, 'bounded prompt required');
  ensure(typeof action.title === 'string' && action.title.length >= 10 && action.title.length <= 500, 'bounded title required');
  ensure(admission && typeof admission === 'object' && !Array.isArray(admission), 'admission proposal required');
  const keys = ['issue_url', 'base_sha', 'branch', 'expires_at', 'idempotency_key', 'max_minutes', 'max_cost_usd', 'acceptance'];
  ensure(Object.keys(admission).every(k => keys.includes(k)) && keys.every(k => Object.hasOwn(admission, k)), 'exact admission fields required');
  const issuePrefix = `https://github.com/${action.repo}/issues/`;
  ensure(typeof admission.issue_url === 'string' && admission.issue_url.startsWith(issuePrefix) && /^[1-9]\d*$/.test(admission.issue_url.slice(issuePrefix.length)), 'owning issue URL must match repository');
  ensure(/^[a-f0-9]{40}$/.test(admission.base_sha), 'exact base SHA required');
  ensure(typeof admission.branch === 'string' && /^agent\/(codex|claude-code|antigravity)\/[a-z0-9][a-z0-9-]{2,100}$/.test(admission.branch), 'isolated agent branch required');
  ensure(/^[a-z0-9][a-z0-9._:-]{5,127}$/.test(admission.idempotency_key), 'idempotency key required');
  const expiry = Date.parse(admission.expires_at);
  ensure(typeof admission.expires_at === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(admission.expires_at) && Number.isFinite(expiry) && new Date(expiry).toISOString() === admission.expires_at.replace('Z', '.000Z') && Number.isFinite(now) && expiry > now && expiry <= now + 86400000, 'UTC expiry YYYY-MM-DDTHH:mm:ssZ within 24 hours required');
  ensure(Number.isInteger(admission.max_minutes) && admission.max_minutes >= 1 && admission.max_minutes <= 25, 'time cap must be 1–25 minutes');
  ensure(typeof admission.max_cost_usd === 'number' && Number.isFinite(admission.max_cost_usd) && admission.max_cost_usd >= 0, 'finite cost cap required; zero permits no paid call');
  ensure(Array.isArray(admission.acceptance) && admission.acceptance.length > 0 && admission.acceptance.length <= 17 && admission.acceptance.every(s => typeof s === 'string' && s.length >= 5 && s.length <= 300), 'explicit acceptance criteria required');
  const contract = {
    schema_version: 'starlight.task_contract.v1', task_id: action.id,
    idempotency_key: admission.idempotency_key, expires_at: admission.expires_at,
    route_policy_version: 'starlight.routing_policy.v1', objective: action.title,
    action_class: 'code_change', risk_class: 'high', register: 'neutral',
    repository: action.repo, branch: admission.branch, path_scope: [...action.where],
    requested_capabilities: ['software.change'],
    acceptance: [...admission.acceptance, 'Open a draft PR; never merge or enable auto-merge.',
      'Independent review must bind the exact head SHA; sensitive changes need CTO PASS.',
      'Run host-approved checks; preserve existing lane ownership and production protections.'],
    prompt_digest: digest(action.prompt), prompt_summary: action.title,
    evidence_refs: [admission.issue_url, `https://github.com/${action.repo}/commit/${admission.base_sha}`],
  };
  return {
    status: 'held_for_host_admission', execution_performed: false, contract,
    source_digest: digest(JSON.stringify(action)),
    resource_proposal: { max_minutes: admission.max_minutes, max_cost_usd: admission.max_cost_usd, max_attempts: 1, max_concurrent: 1 },
    authority: 'frankxai/agentic-ops/control-plane/route_task.py',
    holds: ['Reconcile owning issue, current PRs, branch and lease; do not duplicate prior work.',
      'Verify live runtime/authentication and reserve budget in existing controller state.',
      'Router output is not execution admission; match its author to the assigned branch.',
      'Host must enforce path, time, cost, credentials and cancellation boundaries.',
      'Original prompt remains at source; inspect it before loading into an admitted worker.'],
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command, id, admissionPath] = process.argv.slice(2);
    let result;
    if (command === 'inventory') result = inventory();
    else if (command === 'handoff' && id && admissionPath) {
      const action = json(join(root, 'next-actions.json')).actions.find(a => a.id === id);
      result = prepareHandoff(action, json(admissionPath), json(join(root, 'config.json')));
    } else throw new Error('Usage: migration.mjs inventory | handoff <board-id> <admission.json>');
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } catch (error) { console.error(error.message); process.exitCode = 2; }
}
