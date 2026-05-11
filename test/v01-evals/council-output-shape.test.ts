/**
 * Track D v0.1 — eval 3: council output shape
 *
 * A CouncilReview record returned by sis.council.review MUST:
 *   • match council-review.schema.json (11 required fields)
 *   • carry all 7 named perspectives (no missing seat)
 *   • carry convergence / conflict / red_lines / cleanest_path / one_next_move /
 *     review_date as concrete fields
 *
 * Empty perspective STRINGS are allowed (the template carries empty strings
 * when perspectives_input is omitted) — but the field itself must be present.
 *
 * Built on SIP — operational tier, Track D
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { SisMcpServerV01 } from '../../dist/mcp-server-v01.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const SCHEMA_PATH = join(
  REPO_ROOT,
  'packages',
  'core',
  'schemas',
  'council-review.schema.json',
);

const SEVEN_SEATS = [
  'elderFather',
  'elderMother',
  'sage',
  'builderElder',
  'shadowWitness',
  'divineNeutralWitness',
  'futureSelf90',
] as const;

const REQUIRED_FIELDS = [
  'id',
  'decision',
  'context',
  'perspectives',
  'convergence',
  'conflict',
  'redLines',
  'cleanestPath',
  'oneNextMove',
  'reviewDate',
  'createdAt',
];

function loadSchema(): { required: string[]; properties: Record<string, unknown> } {
  return JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8'));
}

function withServer<T>(fn: (s: InstanceType<typeof SisMcpServerV01>, root: string) => T): T {
  const root = mkdtempSync(join(tmpdir(), 'v01-council-'));
  const server = new SisMcpServerV01({
    vaultDir: join(root, 'vaults'),
    substrateDir: root,
    repoRoot: root,
  });
  try {
    return fn(server, root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe('Track D / eval 3 — council output shape', () => {
  it('CouncilReview schema declares all 11 required fields', () => {
    const schema = loadSchema();
    for (const f of REQUIRED_FIELDS) {
      assert.ok(schema.required.includes(f), `schema.required missing: ${f}`);
    }
  });

  it('CouncilReview schema declares all 7 named perspective seats as required', () => {
    const schema = loadSchema();
    const persp = schema.properties.perspectives as { required: string[] };
    for (const seat of SEVEN_SEATS) {
      assert.ok(persp.required.includes(seat), `perspectives.required missing: ${seat}`);
    }
  });

  it('sis.council.review with no input returns the empty 7-field template', () => {
    withServer((server) => {
      const result = server.callTool('sis.council.review', {});
      assert.equal(result.status, 'ok');
      const tpl = (result as { data: { template: Record<string, unknown> } }).data.template;
      for (const seat of SEVEN_SEATS) {
        assert.ok(seat in tpl, `template missing seat: ${seat}`);
      }
      assert.ok('instructions' in tpl, 'template must include instructions');
    });
  });

  it('sis.council.review with full input persists a CouncilReview with all required fields', () => {
    withServer((server, root) => {
      const result = server.callTool('sis.council.review', {
        decision: 'ship v0.1 demo Friday',
        context: 'Track A+B+C+D green; presentation rehearsed',
        perspectives_input: {
          elderFather: 'protect the trust contract',
          elderMother: 'hold the room with care',
          sage: 'the substrate has been here before',
          builderElder: 'the code is ready; the demo is the test',
          shadowWitness: 'what gets skipped in the rehearsal will surface live',
          divineNeutralWitness: 'this is one ship in a long arc',
          futureSelf90: 'in 90 days I will be glad I shipped',
        },
        convergence: 'all 7 seats: ship',
        conflict: 'shadow: prepare for last-minute scope creep',
        red_lines: ['no last-minute schema changes', 'no demo-day deploys'],
        cleanest_path: 'rehearse twice tomorrow then ship',
        one_next_move: 'commit the eval suite tonight',
      });
      assert.equal(result.status, 'ok', JSON.stringify(result));
      const review = (result as { data: Record<string, unknown> }).data;

      // Every required field present.
      for (const f of REQUIRED_FIELDS) {
        assert.ok(f in review, `review missing field: ${f}`);
      }

      // Every seat present + non-empty (because we supplied them).
      const persp = review.perspectives as Record<string, string>;
      for (const seat of SEVEN_SEATS) {
        assert.ok(seat in persp, `perspectives missing seat: ${seat}`);
        assert.ok(persp[seat].length > 0, `perspective ${seat} unexpectedly empty`);
      }

      // The ledger row matches.
      const ledgerPath = join(root, 'memory', '_audit', 'council-reviews.jsonl');
      assert.ok(existsSync(ledgerPath), 'council ledger must exist');
      const lines = readFileSync(ledgerPath, 'utf-8').split('\n').filter(Boolean);
      assert.equal(lines.length, 1);
      const stored = JSON.parse(lines[0]);
      assert.equal(stored.id, review.id);
    });
  });

  it('sis.council.review REJECTS input where any seat is non-string', () => {
    withServer((server) => {
      const result = server.callTool('sis.council.review', {
        decision: 'x',
        perspectives_input: {
          elderFather: 'ok',
          elderMother: 'ok',
          sage: 'ok',
          builderElder: 'ok',
          shadowWitness: 'ok',
          divineNeutralWitness: 'ok',
          futureSelf90: 42, // wrong type — must reject
        },
      });
      assert.equal(result.status, 'error');
      assert.match((result as { error: string }).error, /futureSelf90/);
    });
  });
});
