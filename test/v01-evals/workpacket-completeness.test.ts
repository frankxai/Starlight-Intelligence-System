/**
 * Track D v0.1 — eval 7: workpacket ledger completeness
 *
 * Every WorkPacket row in memory/_audit/work-packets.jsonl carries all
 * required fields. Status transitions are monotonic (no completed→pending).
 * completedAt is set iff status='completed'.
 *
 * Append-only — transitions are new snapshots. Group by id, walk in order.
 *
 * Built on SIP — operational tier, Track D
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { AgentOpsLedger } from '../../src/ledgers.js';
import { SisMcpServerV01 } from '../../dist/mcp-server-v01.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const WP_PATH = join(REPO_ROOT, 'memory', '_audit', 'work-packets.jsonl');

const REQUIRED = [
  'id', 'title', 'mission', 'contextRefs', 'requiredOutputs', 'allowedTools',
  'allowedPaths', 'forbiddenActions', 'riskLevel', 'approvalRequired',
  'assignedAgent', 'status', 'events', 'artifacts', 'costEstimate', 'createdAt',
] as const;
const ARRAYS = [
  'contextRefs', 'requiredOutputs', 'allowedTools', 'allowedPaths',
  'forbiddenActions', 'events', 'artifacts',
] as const;
const STATUSES = ['pending', 'in_progress', 'blocked', 'completed', 'cancelled'];
// Same-state repeat is permitted (re-snapshot without status change is common).
const SUCCESSORS: Record<string, ReadonlySet<string>> = {
  pending: new Set(['pending', 'in_progress', 'blocked', 'cancelled']),
  in_progress: new Set(['in_progress', 'blocked', 'completed', 'cancelled']),
  blocked: new Set(['blocked', 'in_progress', 'cancelled']),
  completed: new Set(['completed']),  // terminal
  cancelled: new Set(['cancelled']),  // terminal
};

type Row = Record<string, unknown>;

function readRows(path: string): Row[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf-8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}

function validate(r: Row, where: string): string[] {
  const errs: string[] = [];
  for (const f of REQUIRED) if (r[f] == null) errs.push(`${where}: missing ${f}`);
  for (const a of ARRAYS) if (!Array.isArray(r[a])) errs.push(`${where}: ${a} must be array`);
  if (!STATUSES.includes(r.status as string)) errs.push(`${where}: status out of enum (${String(r.status)})`);
  if (!['low', 'medium', 'high', 'critical'].includes(r.riskLevel as string)) {
    errs.push(`${where}: riskLevel out of enum`);
  }
  if (typeof r.approvalRequired !== 'boolean') errs.push(`${where}: approvalRequired must be boolean`);
  if (typeof r.costEstimate !== 'number') errs.push(`${where}: costEstimate must be number`);
  if (r.status === 'completed' && !r.completedAt) errs.push(`${where}: completed must have completedAt`);
  if (r.status !== 'completed' && r.completedAt) errs.push(`${where}: completedAt only when completed (status=${String(r.status)})`);
  return errs;
}

function transitionErrors(rows: Row[]): string[] {
  const byId = new Map<string, Row[]>();
  for (const r of rows) {
    const id = r.id as string;
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id)!.push(r);
  }
  const errs: string[] = [];
  for (const [id, snaps] of byId) {
    for (let i = 1; i < snaps.length; i++) {
      const prev = snaps[i - 1].status as string;
      const next = snaps[i].status as string;
      const allowed = SUCCESSORS[prev];
      if (!allowed) errs.push(`${id}: snapshot ${i - 1} has unknown status ${prev}`);
      else if (!allowed.has(next)) errs.push(`${id}: illegal ${prev} → ${next} at #${i}`);
    }
  }
  return errs;
}

describe('Track D / eval 7 — workpacket ledger completeness', () => {
  it('every row in memory/_audit/work-packets.jsonl carries all required fields', () => {
    if (!existsSync(WP_PATH)) return;
    const rows = readRows(WP_PATH);
    const errs: string[] = [];
    for (let i = 0; i < rows.length; i++) errs.push(...validate(rows[i], `#${i}`));
    assert.equal(errs.length, 0, `${errs.length} of ${rows.length} malformed:\n  ${errs.slice(0, 10).join('\n  ')}`);
  });

  it('status transitions in the real ledger are monotonic (no completed→pending regression)', () => {
    if (!existsSync(WP_PATH)) return;
    const errs = transitionErrors(readRows(WP_PATH));
    assert.equal(errs.length, 0, errs.join('\n'));
  });

  it('sis.workpacket.create writer produces rows with EVERY required field', () => {
    const root = mkdtempSync(join(tmpdir(), 'v01-wp-'));
    try {
      const server = new SisMcpServerV01({ vaultDir: join(root, 'vaults'), substrateDir: root, repoRoot: root });
      const result = server.callTool('sis.workpacket.create', {
        title: 'audit-test', mission: 'verify completeness',
        allowed_tools: ['fs.read'], allowed_paths: ['/'], risk_level: 'low',
      });
      assert.equal(result.status, 'ok');
      assert.equal(validate((result as { data: Row }).data, 'writer').length, 0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('AgentOpsLedger.updateWorkPacketStatus enforces completedAt iff status=completed', () => {
    const root = mkdtempSync(join(tmpdir(), 'v01-wp-'));
    const ledger = new AgentOpsLedger(root);
    try {
      const p = ledger.createWorkPacket({ title: 'transition test', mission: 'm', riskLevel: 'low' });
      ledger.updateWorkPacketStatus(p.id, 'in_progress');
      const completedAt = new Date().toISOString();
      ledger.updateWorkPacketStatus(p.id, 'completed', completedAt);
      const final = ledger.getWorkPacket(p.id);
      assert.ok(final);
      assert.equal(final.status, 'completed');
      assert.equal(final.completedAt, completedAt);
      const ours = readRows(join(root, 'memory', '_audit', 'work-packets.jsonl')).filter((r) => r.id === p.id);
      assert.equal(ours.length, 3, 'expected 3 snapshots');
      assert.deepEqual(ours.map((r) => r.status), ['pending', 'in_progress', 'completed']);
      assert.equal(transitionErrors(ours).length, 0);
      const errs: string[] = [];
      for (let i = 0; i < ours.length; i++) errs.push(...validate(ours[i], `#${i}`));
      assert.equal(errs.length, 0, errs.join('\n'));
    } finally {
      ledger.close();
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('illegal transition (completed → pending) would be caught by this eval', () => {
    const errs = transitionErrors([
      { id: 'wp_x', status: 'pending' },
      { id: 'wp_x', status: 'in_progress' },
      { id: 'wp_x', status: 'completed' },
      { id: 'wp_x', status: 'pending' },  // ILLEGAL regression from terminal
    ]);
    assert.equal(errs.length, 1, 'monotonicity rule must catch completed→pending');
    assert.match(errs[0], /completed → pending/);
  });
});
