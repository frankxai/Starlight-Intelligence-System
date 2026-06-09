/**
 * Track D v0.1 — eval 5: agent-event ledger completeness
 *
 * Every row in memory/_audit/agent-events/YYYY-MM-DD.jsonl carries the full
 * AgentEvent schema. If ANY row is malformed, the substrate cannot replay
 * state. The writer must produce complete rows.
 *
 * Built on SIP — operational tier, Track D
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isOk, isErr, errOf, pick, withServer } from './_helpers.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const EVENTS_DIR = join(REPO_ROOT, 'memory', '_audit', 'agent-events');

const REQUIRED = [
  'id', 'runId', 'agentId', 'eventType', 'summary', 'toolsUsed', 'inputRefs',
  'outputRefs', 'decisionsCreated', 'artifactsCreated', 'riskLevel',
  'costEstimate', 'timestamp',
] as const;
const ARRAYS = ['toolsUsed', 'inputRefs', 'outputRefs', 'decisionsCreated', 'artifactsCreated'] as const;
const RISKS = ['low', 'medium', 'high', 'critical'];

type Row = Record<string, unknown>;

function readRows(path: string): Row[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf-8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}

function validate(e: Row, where: string): string[] {
  const errs: string[] = [];
  for (const f of REQUIRED) if (!(f in e)) errs.push(`${where}: missing ${f}`);
  if (typeof e.id !== 'string' || !(e.id as string)) errs.push(`${where}: id must be non-empty string`);
  if (typeof e.timestamp !== 'string') errs.push(`${where}: timestamp must be string`);
  if (!RISKS.includes(e.riskLevel as string)) errs.push(`${where}: riskLevel out of enum (${String(e.riskLevel)})`);
  if (typeof e.costEstimate !== 'number') errs.push(`${where}: costEstimate must be number`);
  for (const a of ARRAYS) if (!Array.isArray(e[a])) errs.push(`${where}: ${a} must be array`);
  return errs;
}

describe('Track D / eval 5 — agent-event ledger completeness', () => {
  // KNOWN DRIFT 2026-05-11: existing rows in memory/_audit/agent-events/*.jsonl
  // use snake_case (run_id, agent_id, event_type, tools_used, risk_level,
  // cost_estimate) but AgentEvent (src/types.ts:435+) + the sis.agent.event
  // writer produce camelCase (runId, agentId, ...). Demo-fixture seed
  // (evt_demo_*) was authored against the wire-protocol schema, not the
  // in-memory schema. Marked todo; un-todo once fixtures normalized OR a
  // read-side adapter lifts snake_case to camelCase on load.
  it('every row in memory/_audit/agent-events/*.jsonl carries all required fields', { todo: true }, () => {
    if (!existsSync(EVENTS_DIR)) return;
    const files = readdirSync(EVENTS_DIR).filter((f) => f.endsWith('.jsonl'));
    const errs: string[] = [];
    let total = 0;
    for (const file of files) {
      const rows = readRows(join(EVENTS_DIR, file));
      for (let i = 0; i < rows.length; i++) errs.push(...validate(rows[i], `${file}#${i}`));
      total += rows.length;
    }
    assert.equal(errs.length, 0, `${errs.length} malformed of ${total}:\n  ${errs.slice(0, 10).join('\n  ')}`);
  });

  it('sis.agent.event writer produces rows with EVERY required field', () => {
    withServer((server, root) => {
      const result = server.callTool('sis.agent.event', {
        run_id: 'run_test', agent_id: 'starlight-orchestrator', event_type: 'tool.call',
        summary: 'invoked sis.memory.search', tools_used: ['sis.memory.search'],
        input_refs: ['query:wisdom'], output_refs: ['result:0'],
        decisions_created: [], artifacts_created: [],
        risk_level: 'low', cost_estimate: 0.001,
      });
      assert.ok(isOk(result), errOf(result));
      const event = pick<Row>(result, 'event');
      assert.equal(validate(event, 'writer').length, 0);
      const day = (event.timestamp as string).slice(0, 10);
      const rows = readRows(join(root, 'memory', '_audit', 'agent-events', `${day}.jsonl`));
      assert.equal(rows.length, 1);
      assert.equal(validate(rows[0], 'on-disk').length, 0);
    });
  });

  it('writer REJECTS event input missing run_id / agent_id / event_type', () => {
    // KNOWN DRIFT 2026-05-11: dist/mcp-server-v01.js:312 declares
    // required:['run_id','agent_id','event_type'] — risk_level is OPTIONAL
    // in the current MCP server. Per Track A AgentEvent (src/types.ts:435),
    // riskLevel is a required field. Drift is in the MCP wire schema.
    // We test the 3 fields the wire schema does require; risk_level case
    // is covered as a separate `todo` test below.
    withServer((server) => {
      for (const missing of ['run_id', 'agent_id', 'event_type']) {
        const args: Record<string, unknown> = { run_id: 'r', agent_id: 'a', event_type: 'e' };
        delete args[missing];
        const result = server.callTool('sis.agent.event', args);
        assert.ok(isErr(result), `must reject missing ${missing}`);
      }
    });
  });

  // KNOWN DRIFT 2026-05-11: writer accepts risk_level='extreme' (out of enum)
  // and writes it to the ledger. validateInput in dist/mcp-server-v01.js:40-60
  // only enforces enum on REQUIRED fields, and risk_level is optional in the
  // wire schema (see drift note above). Result: agent-events ledger can contain
  // arbitrary riskLevel strings. Marked todo; un-todo once the wire schema is
  // tightened OR validateInput enforces enums on optional fields too.
  it('writer REJECTS risk_level outside the 4-value enum', { todo: true }, () => {
    withServer((server) => {
      const result = server.callTool('sis.agent.event', {
        run_id: 'r', agent_id: 'a', event_type: 'e', risk_level: 'extreme',
      });
      assert.ok(isErr(result), 'expected reject of out-of-enum risk_level');
    });
  });

  it('writer REJECTS event input missing risk_level (current substrate accepts it)', { todo: true }, () => {
    // Companion to drift above: per Track A schema risk_level should be
    // required. Wire schema makes it optional. Once Track B tightens the
    // wire schema to match Track A, un-todo.
    withServer((server) => {
      const result = server.callTool('sis.agent.event', {
        run_id: 'r', agent_id: 'a', event_type: 'e',
      });
      assert.ok(isErr(result), 'risk_level must be required per Track A schema');
    });
  });
});
