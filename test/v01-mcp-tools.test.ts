/**
 * Track B v0.1 — MCP tool conformance harness
 *
 * Tests src/mcp-server-v01.ts:
 *   • Core sis.* tools: valid input → expected shape
 *   • Core sis.* tools: invalid input → schema rejection
 *   • Approval-gate enforcement for decision.log + workpacket.create at
 *     high/critical risk (4 tests, both shape AND no-persistence asserted)
 *   • sis.graph.neighbors refuses on malformed edge (1 test)
 *   • sis.pack.install rejects permissions_acked=false when pack has perms (1 test)
 *   • sis.council.review template path returns 7-field empty memo (1 test)
 *   • sis.vault.record appends to vault-loop.jsonl (1 test)
 *   • sis.memory.search returns documented shape (1 test)
 *
 * Keep this harness focused on externally visible tool behavior.
 *
 * Built on SIP — operational tier
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { SisMcpServerV01 } from '../src/mcp-server-v01.js';
import { AgentOpsLedger } from '../src/ledgers.js';

function withServer<T>(fn: (server: SisMcpServerV01, root: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), 'sis-mcp-v01-'));
  const server = new SisMcpServerV01({ repoRoot: dir });
  try {
    return fn(server, dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

interface OkEnvelope {
  ok?: boolean;
  error?: string;
  [key: string]: unknown;
}

function isError(result: unknown): result is { ok: false; error: string } {
  return (
    typeof result === 'object' &&
    result !== null &&
    (result as OkEnvelope).ok === false &&
    typeof (result as OkEnvelope).error === 'string'
  );
}

function countLines(path: string): number {
  if (!existsSync(path)) return 0;
  return readFileSync(path, 'utf-8').split('\n').filter((l) => l.trim()).length;
}

// ── Group 1: 13 valid-input shape tests ─────────────────────

describe('Track B v0.1 — sis.* MCP tools (valid input → expected shape)', () => {
  it('sis.memory.add returns a VaultEntry', () => {
    withServer((srv) => {
      const r = srv.call('sis.memory.add', { content: 'test architecture decision' }) as OkEnvelope;
      assert.equal(r.ok, true);
      const entry = r.entry as { id: string; vault: string; content: string };
      assert.ok(entry.id.startsWith('mem_'));
      assert.ok(typeof entry.vault === 'string');
      assert.equal(entry.content, 'test architecture decision');
    });
  });

  it('sis.memory.search returns results array', () => {
    withServer((srv) => {
      srv.call('sis.memory.add', { content: 'token efficient routing pattern' });
      const r = srv.call('sis.memory.search', { query: 'routing' }) as OkEnvelope;
      assert.equal(r.ok, true);
      assert.equal(r.retrievalMode, 'hybrid');
      assert.ok(Array.isArray(r.results));
    });
  });

  it('sis.memory.search uses hybrid RRF metadata and hides private entries by default', () => {
    withServer((srv) => {
      srv.call('sis.memory.add', {
        content: 'privacy: private hidden founder strategy memory',
        tags: ['privacy:private'],
      });
      srv.call('sis.memory.add', {
        content: 'founder strategy memory public operating doctrine',
        tags: ['public'],
      });

      const hidden = srv.call('sis.memory.search', {
        query: 'founder strategy memory',
        limit: 5,
      }) as OkEnvelope;
      assert.equal(hidden.ok, true);
      const hiddenResults = hidden.results as Array<{ entry: { content: string }; channels?: object }>;
      assert.ok(hiddenResults.every((r) => !r.entry.content.includes('hidden')));
      assert.ok(hiddenResults.some((r) => r.channels));

      const included = srv.call('sis.memory.search', {
        query: 'founder strategy memory',
        include_private: true,
        limit: 5,
      }) as OkEnvelope;
      assert.equal(included.ok, true);
      const includedResults = included.results as Array<{ entry: { content: string } }>;
      assert.ok(includedResults.some((r) => r.entry.content.includes('hidden')));
    });
  });

  it('sis.memory.health and sis.memory.eval expose memory control-plane status', () => {
    withServer((srv) => {
      const health = srv.call('sis.memory.health', {}) as OkEnvelope;
      assert.equal(health.ok, true);
      assert.ok(typeof health.health === 'object');
      const healthBody = health.health as {
        architecture?: { decision?: string };
        memoryBus?: { status?: string };
        drift?: { status?: string };
        privacy?: { defaultMcpSearchIncludesPrivate?: boolean };
      };
      assert.match(healthBody.architecture?.decision ?? '', /Keep SIS as primary/);
      assert.ok(['connected-surface-present', 'declared-but-private-missing', 'not-declared'].includes(healthBody.memoryBus?.status ?? ''));
      assert.ok(['ok', 'attention-needed', 'unknown'].includes(healthBody.drift?.status ?? ''));
      assert.equal(healthBody.privacy?.defaultMcpSearchIncludesPrivate, false);

      const evalResult = srv.call('sis.memory.eval', { limit: 3 }) as OkEnvelope;
      assert.equal(evalResult.ok, true);
      assert.ok(typeof evalResult.eval === 'object');
    });
  });

  it('sis.project.context captures git context for repo root', () => {
    withServer((srv, root) => {
      // git init the temp dir so commands don't no-op.
      // (execFileSync in handler swallows errors and returns 'unknown' — still valid shape.)
      const r = srv.call('sis.project.context', { project_root: root }) as OkEnvelope;
      assert.equal(r.ok, true);
      const ctx = r.context as Record<string, unknown>;
      assert.ok('repo' in ctx);
      assert.ok('branch' in ctx);
      assert.ok('head' in ctx);
      assert.ok('status_summary' in ctx);
      assert.ok(Array.isArray(ctx.recent_commits));
    });
  });

  it('sis.repo.context accepts a remote_url and records it', () => {
    withServer((srv, root) => {
      const r = srv.call('sis.repo.context', {
        project_root: root,
        remote_url: 'https://github.com/example/foo.git',
      }) as OkEnvelope;
      assert.equal(r.ok, true);
      const ctx = r.context as Record<string, unknown>;
      assert.equal(ctx.remote_url, 'https://github.com/example/foo.git');
    });
  });

  it('sis.decision.log persists a Decision at low risk', () => {
    withServer((srv, root) => {
      const r = srv.call('sis.decision.log', {
        title: 'pick router',
        context: 'choose between A and B',
        options: ['A', 'B'],
        chosen: 'A',
        rationale: 'lower latency',
        risk_level: 'low',
      }) as OkEnvelope;
      assert.equal(r.ok, true);
      const dec = r.decision as { id: string; chosen: string };
      assert.ok(dec.id.startsWith('dec_'));
      assert.equal(dec.chosen, 'A');
      const path = join(root, 'memory', '_audit', 'decisions.jsonl');
      assert.equal(countLines(path), 1);
    });
  });

  it('sis.agent.event appends to today\'s agent-events ledger', () => {
    withServer((srv, root) => {
      const r = srv.call('sis.agent.event', {
        run_id: 'run_1',
        agent_id: 'agent-a',
        event_type: 'tool.call',
        summary: 'called grep',
      }) as OkEnvelope;
      assert.equal(r.ok, true);
      const evt = r.event as { id: string; timestamp: string };
      assert.ok(evt.id.startsWith('evt_'));
      const day = evt.timestamp.slice(0, 10);
      const path = join(root, 'memory', '_audit', 'agent-events', `${day}.jsonl`);
      assert.equal(countLines(path), 1);
    });
  });

  it('sis.artifact.register attests local files containing "Built on SIP"', () => {
    withServer((srv, root) => {
      const f = join(root, 'attested.txt');
      writeFileSync(f, 'this artifact is Built on SIP — operational tier');
      const r = srv.call('sis.artifact.register', {
        kind: 'doc',
        uri: f,
        sha256: 'a'.repeat(64),
        created_by: 'tester',
      }) as OkEnvelope;
      assert.equal(r.ok, true);
      const art = r.artifact as { attestation: string };
      assert.equal(art.attestation, 'sip-attested');
    });
  });

  it('sis.graph.neighbors returns edges with valid evidenceRef', () => {
    withServer((srv, root) => {
      const edgesPath = join(root, 'memory', '_audit', 'graph-edges.jsonl');
      mkdirSync(join(root, 'memory', '_audit'), { recursive: true });
      appendFileSync(
        edgesPath,
        JSON.stringify({
          id: 'ge_1',
          edgeType: 'produced',
          source: 'wp_1',
          target: 'art_1',
          evidenceRef: 'evt_1',
          confidence: 0.9,
          createdBy: 'tester',
          createdAt: new Date().toISOString(),
        }) + '\n',
      );
      const r = srv.call('sis.graph.neighbors', { entity_id: 'wp_1' }) as OkEnvelope;
      assert.equal(r.ok, true);
      const edges = r.edges as Array<{ id: string }>;
      assert.equal(edges.length, 1);
      assert.equal(edges[0].id, 'ge_1');
    });
  });

  it('sis.workpacket.create persists a WorkPacket at low risk', () => {
    withServer((srv, root) => {
      const r = srv.call('sis.workpacket.create', {
        title: 'sweep stale',
        mission: 'clean operational vault',
        allowed_tools: ['grep'],
        allowed_paths: ['memory/'],
        risk_level: 'low',
      }) as OkEnvelope;
      assert.equal(r.ok, true);
      const wp = r.workPacket as { id: string; status: string };
      assert.ok(wp.id.startsWith('wp_'));
      assert.equal(wp.status, 'pending');
      const path = join(root, 'memory', '_audit', 'work-packets.jsonl');
      assert.equal(countLines(path), 1);
    });
  });

  it('sis.council.review with perspectives_input persists a CouncilReview', () => {
    withServer((srv) => {
      const r = srv.call('sis.council.review', {
        decision_id_or_workpacket_id: 'dec_x',
        perspectives_input: {
          decision: 'ship',
          context: 'ready',
          elderFather: 'go',
          elderMother: 'careful',
          sage: 'pattern',
          builderElder: 'tested',
          shadowWitness: 'fear',
          divineNeutralWitness: 'neutral',
          futureSelf90: 'thanks',
          convergence: 'mostly ship',
          conflict: 'shadow',
          cleanestPath: 'minimal commit',
          oneNextMove: 'ship now',
        },
      }) as OkEnvelope;
      assert.equal(r.ok, true);
      const review = r.review as { id: string };
      assert.ok(review.id.startsWith('cr_'));
    });
  });

  it('sis.vault.record persists a vault-loop entry', () => {
    withServer((srv, root) => {
      const r = srv.call('sis.vault.record', {
        vault_entry_kind: 'gratitude',
        payload: { text: 'thanks for the day' },
        privacy_status: 'private',
      }) as OkEnvelope;
      assert.equal(r.ok, true);
      const path = join(root, 'memory', '_audit', 'vault-loop.jsonl');
      assert.equal(countLines(path), 1);
    });
  });

  it('sis.pack.list returns [] when registry.json is missing', () => {
    withServer((srv) => {
      const r = srv.call('sis.pack.list', {}) as OkEnvelope;
      assert.equal(r.ok, true);
      assert.deepEqual(r.packs, []);
    });
  });

  it('sis.pack.install installs a permissionless pack', () => {
    withServer((srv, root) => {
      const manifestPath = join(root, 'pack.json');
      writeFileSync(
        manifestPath,
        JSON.stringify({
          id: 'pack_x',
          name: 'X',
          version: '0.1.0',
          kind: 'prompt',
          permissions: [],
          licenseTier: 'community',
        }),
      );
      const r = srv.call('sis.pack.install', {
        pack_uri: manifestPath,
        permissions_acked: false,
      }) as OkEnvelope;
      assert.equal(r.ok, true);
      const pack = r.pack as { id: string; manifestSha: string };
      assert.equal(pack.id, 'pack_x');
      assert.equal(typeof pack.manifestSha, 'string');
    });
  });
});

// ── Group 2: 13 invalid-input rejection tests ──────────────

describe('Track B v0.1 — sis.* MCP tools (invalid input → rejection)', () => {
  it('sis.memory.add rejects missing content', () => {
    withServer((srv) => {
      const r = srv.call('sis.memory.add', {});
      assert.ok(isError(r));
    });
  });

  it('sis.memory.search rejects missing query', () => {
    withServer((srv) => {
      const r = srv.call('sis.memory.search', {});
      assert.ok(isError(r));
    });
  });

  it('sis.project.context rejects missing project_root', () => {
    withServer((srv) => {
      const r = srv.call('sis.project.context', {});
      assert.ok(isError(r));
    });
  });

  it('sis.repo.context rejects missing project_root', () => {
    withServer((srv) => {
      const r = srv.call('sis.repo.context', {});
      assert.ok(isError(r));
    });
  });

  it('sis.decision.log rejects missing risk_level', () => {
    withServer((srv) => {
      const r = srv.call('sis.decision.log', {
        title: 't',
        context: 'c',
        options: ['a'],
        chosen: 'a',
        rationale: 'r',
      });
      assert.ok(isError(r));
    });
  });

  it('sis.agent.event rejects missing run_id', () => {
    withServer((srv) => {
      const r = srv.call('sis.agent.event', { agent_id: 'a', event_type: 'x' });
      assert.ok(isError(r));
    });
  });

  it('sis.artifact.register rejects missing sha256', () => {
    withServer((srv) => {
      const r = srv.call('sis.artifact.register', {
        kind: 'doc',
        uri: 'file:///x',
        created_by: 't',
      });
      assert.ok(isError(r));
    });
  });

  it('sis.graph.neighbors rejects missing entity_id', () => {
    withServer((srv) => {
      const r = srv.call('sis.graph.neighbors', {});
      assert.ok(isError(r));
    });
  });

  it('sis.workpacket.create rejects missing allowed_paths', () => {
    withServer((srv) => {
      const r = srv.call('sis.workpacket.create', {
        title: 't',
        mission: 'm',
        allowed_tools: [],
        risk_level: 'low',
      });
      assert.ok(isError(r));
    });
  });

  it('sis.council.review rejects missing decision_id_or_workpacket_id', () => {
    withServer((srv) => {
      const r = srv.call('sis.council.review', {});
      assert.ok(isError(r));
    });
  });

  it('sis.vault.record rejects unknown vault_entry_kind', () => {
    withServer((srv) => {
      const r = srv.call('sis.vault.record', {
        vault_entry_kind: 'not_a_real_kind',
        payload: {},
        privacy_status: 'private',
      });
      assert.ok(isError(r));
    });
  });

  it('sis.pack.list rejects no schema violations (accepts {}) — but unknown tool name rejects', () => {
    withServer((srv) => {
      const r = srv.call('sis.pack.list.WRONG_NAME', {});
      assert.ok(isError(r));
    });
  });

  it('sis.pack.install rejects missing permissions_acked', () => {
    withServer((srv) => {
      const r = srv.call('sis.pack.install', { pack_uri: 'file:///x' });
      assert.ok(isError(r));
    });
  });
});

// ── Group 3: Approval-gate enforcement ─────────────────────

describe('Track B v0.1 — approval gate (decision.log + workpacket.create)', () => {
  it('sis.decision.log at risk=high returns approval_required and DOES NOT persist', () => {
    withServer((srv, root) => {
      const r = srv.call('sis.decision.log', {
        title: 'risky',
        context: 'irreversible',
        options: ['x', 'y'],
        chosen: 'x',
        rationale: 'tradeoff',
        risk_level: 'high',
      }) as Record<string, unknown>;
      assert.equal(r.status, 'approval_required');
      assert.equal(r.riskLevel, 'high');
      assert.equal(typeof r.approvalGateId, 'string');
      const path = join(root, 'memory', '_audit', 'decisions.jsonl');
      assert.equal(countLines(path), 0);
    });
  });

  it('sis.decision.log at risk=critical returns approval_required and DOES NOT persist', () => {
    withServer((srv, root) => {
      const r = srv.call('sis.decision.log', {
        title: 'crit',
        context: 'crit',
        options: ['a'],
        chosen: 'a',
        rationale: 'crit',
        risk_level: 'critical',
      }) as Record<string, unknown>;
      assert.equal(r.status, 'approval_required');
      assert.equal(r.riskLevel, 'critical');
      const path = join(root, 'memory', '_audit', 'decisions.jsonl');
      assert.equal(countLines(path), 0);
    });
  });

  it('sis.workpacket.create at risk=high returns approval_required and DOES NOT persist', () => {
    withServer((srv, root) => {
      const r = srv.call('sis.workpacket.create', {
        title: 'destructive sweep',
        mission: 'wipe legacy',
        allowed_tools: ['rm'],
        allowed_paths: ['/'],
        risk_level: 'high',
      }) as Record<string, unknown>;
      assert.equal(r.status, 'approval_required');
      assert.equal(r.riskLevel, 'high');
      const path = join(root, 'memory', '_audit', 'work-packets.jsonl');
      assert.equal(countLines(path), 0);
    });
  });

  it('sis.workpacket.create at risk=critical returns approval_required and DOES NOT persist', () => {
    withServer((srv, root) => {
      const r = srv.call('sis.workpacket.create', {
        title: 'critical',
        mission: 'critical',
        allowed_tools: [],
        allowed_paths: [],
        risk_level: 'critical',
      }) as Record<string, unknown>;
      assert.equal(r.status, 'approval_required');
      assert.equal(r.riskLevel, 'critical');
      const path = join(root, 'memory', '_audit', 'work-packets.jsonl');
      assert.equal(countLines(path), 0);
    });
  });
});

// ── Group 4: Substrate invariants + edge behaviors ──────────

describe('Track B v0.1 — substrate invariants', () => {
  it('sis.graph.neighbors REFUSES if any matched edge has missing/empty evidenceRef', () => {
    withServer((srv, root) => {
      const edgesPath = join(root, 'memory', '_audit', 'graph-edges.jsonl');
      mkdirSync(join(root, 'memory', '_audit'), { recursive: true });
      appendFileSync(
        edgesPath,
        JSON.stringify({
          id: 'ge_bad',
          edgeType: 'knows',
          source: 'a',
          target: 'b',
          evidenceRef: '',
          confidence: 0.5,
          createdBy: 't',
          createdAt: new Date().toISOString(),
        }) + '\n',
      );
      const r = srv.call('sis.graph.neighbors', { entity_id: 'a' });
      assert.ok(isError(r));
      assert.match((r as { error: string }).error, /evidenceRef/);
    });
  });

  it('sis.pack.install rejects permissions_acked=false when manifest declares permissions', () => {
    withServer((srv, root) => {
      const manifestPath = join(root, 'risky-pack.json');
      writeFileSync(
        manifestPath,
        JSON.stringify({
          id: 'pack_risky',
          name: 'Risky',
          version: '0.1.0',
          kind: 'agent',
          permissions: [
            { id: 'p_1', scope: 'memory', action: 'write', conditions: [] },
          ],
          licenseTier: 'community',
        }),
      );
      const r = srv.call('sis.pack.install', {
        pack_uri: manifestPath,
        permissions_acked: false,
      });
      assert.ok(isError(r));
      assert.match((r as { error: string }).error, /permissions_acked/);
    });
  });

  it('sis.council.review returns 7-field empty memo when perspectives_input is omitted', () => {
    withServer((srv) => {
      const r = srv.call('sis.council.review', {
        decision_id_or_workpacket_id: 'dec_x',
      }) as Record<string, unknown>;
      assert.equal(r.ok, true);
      assert.equal(r.template, true);
      const persp = r.perspectives as Record<string, string>;
      const expectedKeys = [
        'elderFather',
        'elderMother',
        'sage',
        'builderElder',
        'shadowWitness',
        'divineNeutralWitness',
        'futureSelf90',
      ];
      for (const key of expectedKeys) {
        assert.equal(persp[key], '', `expected empty string for ${key}`);
      }
      assert.equal(r.convergence, '');
      assert.equal(r.conflict, '');
      assert.deepEqual(r.redLines, []);
      assert.equal(r.cleanestPath, '');
      assert.equal(r.oneNextMove, '');
      assert.equal(r.reviewDate, '');
    });
  });

  it('sis.vault.record appends to vault-loop.jsonl (privacy enforcement deferred to v01-evals)', () => {
    withServer((srv, root) => {
      const r = srv.call('sis.vault.record', {
        vault_entry_kind: 'desire',
        payload: { text: 'build the substrate' },
        privacy_status: 'private',
      }) as OkEnvelope;
      assert.equal(r.ok, true);
      const path = join(root, 'memory', '_audit', 'vault-loop.jsonl');
      assert.equal(countLines(path), 1);
      const line = readFileSync(path, 'utf-8').trim();
      const parsed = JSON.parse(line) as Record<string, unknown>;
      assert.equal(parsed.kind, 'desire');
      assert.equal(parsed.privacyStatus, 'private');
    });
  });

  it('sis.memory.search returns at least the documented shape (ok + results array)', () => {
    withServer((srv) => {
      srv.call('sis.memory.add', {
        content: 'starlight intelligence protocol substrate',
        vault: 'strategic',
      });
      const r = srv.call('sis.memory.search', {
        query: 'starlight intelligence',
        vaults: ['strategic'],
        limit: 5,
      }) as OkEnvelope;
      assert.equal(r.ok, true);
      assert.ok(Array.isArray(r.results));
      // shape: each result has entry + score + matchedTerms
      const results = r.results as Array<Record<string, unknown>>;
      for (const item of results) {
        assert.ok('entry' in item);
        assert.ok('score' in item);
        assert.ok('matchedTerms' in item);
      }
    });
  });

  it('sis.workpacket.next and sis.workpacket.complete expose the lifecycle spine', () => {
    withServer((srv, root) => {
      const ledger = new AgentOpsLedger(root);
      let packetId = '';
      try {
        const packet = ledger.createWorkPacket({
          title: 'lifecycle',
          mission: 'prove next and complete',
          riskLevel: 'low',
          assignedAgent: 'codex',
        });
        packetId = packet.id;
      } finally {
        ledger.close();
      }

      const next = srv.call('sis.workpacket.next', {}) as OkEnvelope;
      assert.equal(next.ok, true);
      assert.equal((next.workPacket as { id: string }).id, packetId);

      // pending → in_progress (substrate state-machine: cannot skip in_progress)
      const ledger2 = new AgentOpsLedger(root);
      try {
        ledger2.transitionWorkPacket({ id: packetId, status: 'in_progress' });
      } finally {
        ledger2.close();
      }

      const completed = srv.call('sis.workpacket.complete', {
        id: packetId,
        agent_id: 'codex',
        summary: 'completed by test',
      }) as OkEnvelope;
      assert.equal(completed.ok, true);
      assert.equal((completed.packet as { status: string }).status, 'completed');

      const events = srv.call('sis.events.tail', { limit: 5 }) as OkEnvelope;
      assert.equal(events.ok, true);
      // 2 events now: in_progress transition + completed transition
      assert.equal((events.events as unknown[]).length, 2);
    });
  });

  it('sis.memory.rebuild rebuilds SQLite and sis.module.list returns module manifest state', () => {
    withServer((srv) => {
      const rebuild = srv.call('sis.memory.rebuild', {}) as OkEnvelope;
      assert.equal(rebuild.ok, true);
      assert.ok(typeof rebuild.sqlitePath === 'string');
      assert.ok('stats' in rebuild);

      const modules = srv.call('sis.module.list', {}) as OkEnvelope;
      assert.equal(modules.ok, true);
      assert.ok(Array.isArray(modules.modules));
      assert.ok((modules.modules as Array<{ id: string }>).some((mod) => mod.id === 'code-is'));
    });
  });
});
