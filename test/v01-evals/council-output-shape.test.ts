/**
 * Track D v0.1 — eval 3: council output shape
 *
 * A CouncilReview record returned by sis.council.review MUST:
 *   • match council-review.schema.json (11 required fields)
 *   • carry all 7 named perspectives
 *   • carry convergence / conflict / redLines / cleanestPath / oneNextMove /
 *     reviewDate as concrete fields
 *
 * Built on SIP — operational tier, Track D
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isOk, errOf, pick, withServer } from './_helpers.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const SCHEMA_PATH = join(REPO_ROOT, 'packages', 'core', 'schemas', 'council-review.schema.json');

const SEATS = [
  'elderFather', 'elderMother', 'sage', 'builderElder',
  'shadowWitness', 'divineNeutralWitness', 'futureSelf90',
] as const;
const REQUIRED = [
  'id', 'decision', 'context', 'perspectives', 'convergence', 'conflict',
  'redLines', 'cleanestPath', 'oneNextMove', 'reviewDate', 'createdAt',
];

function loadSchema(): { required: string[]; properties: Record<string, unknown> } {
  return JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8'));
}

describe('Track D / eval 3 — council output shape', () => {
  it('CouncilReview schema declares all 11 required fields', () => {
    const schema = loadSchema();
    for (const f of REQUIRED) assert.ok(schema.required.includes(f), `missing required: ${f}`);
  });

  it('CouncilReview schema declares all 7 named perspective seats as required', () => {
    const persp = loadSchema().properties.perspectives as { required: string[] };
    for (const seat of SEATS) {
      assert.ok(persp.required.includes(seat), `perspectives.required missing: ${seat}`);
    }
  });

  it('sis.council.review with no perspectives returns the empty 7-field template', () => {
    withServer((server) => {
      const result = server.callTool('sis.council.review', {
        decision_id_or_workpacket_id: 'dec_synthetic',
      });
      assert.ok(isOk(result));
      assert.equal((result as { template?: boolean }).template, true);
      const persp = (result as { perspectives: Record<string, string> }).perspectives;
      for (const seat of SEATS) assert.ok(seat in persp, `template missing seat: ${seat}`);
    });
  });

  it('sis.council.review with full input persists a review with all required fields', () => {
    withServer((server, root) => {
      // perspectives_input in the new contract carries BOTH the 7 perspectives
      // AND the verdict fields (decision/context/convergence/conflict/redLines/
      // cleanestPath/oneNextMove). The target id determines workPacketId vs
      // decisionId routing.
      const result = server.callTool('sis.council.review', {
        decision_id_or_workpacket_id: 'wp_demo_eval3',
        perspectives_input: {
          decision: 'ship v0.1 demo Friday',
          context: 'Track A+B+C+D green; rehearsed',
          elderFather: 'protect the trust contract',
          elderMother: 'hold the room with care',
          sage: 'the substrate has been here before',
          builderElder: 'code is ready; demo is the test',
          shadowWitness: 'last-minute scope creep will surface',
          divineNeutralWitness: 'one ship in a long arc',
          futureSelf90: 'in 90 days I will be glad I shipped',
          convergence: 'all 7 seats: ship',
          conflict: 'shadow flags scope creep',
          redLines: ['no schema changes', 'no demo-day deploys'],
          cleanestPath: 'rehearse twice then ship',
          oneNextMove: 'commit the eval suite tonight',
        },
      });
      assert.ok(isOk(result), `expected ok: ${errOf(result)}`);
      const review = pick<Record<string, unknown>>(result, 'review');
      for (const f of REQUIRED) assert.ok(f in review, `review missing field: ${f}`);
      const persp = review.perspectives as Record<string, string>;
      for (const seat of SEATS) {
        assert.ok(seat in persp, `seat missing: ${seat}`);
        assert.ok(persp[seat].length > 0, `seat ${seat} unexpectedly empty`);
      }
      // Ledger row matches.
      const ledgerPath = join(root, 'memory', '_audit', 'council-reviews.jsonl');
      assert.ok(existsSync(ledgerPath), 'council ledger must exist');
      const lines = readFileSync(ledgerPath, 'utf-8').split('\n').filter(Boolean);
      assert.equal(lines.length, 1);
      const stored = JSON.parse(lines[0]);
      assert.equal(stored.id, review.id);
    });
  });

  it('sis.council.review preserves seat coverage across template + persisted shapes', () => {
    // Template and persisted shapes must both carry all 7 seats — substrate
    // invariant. (Each shape uses its own envelope key — template uses
    // root.perspectives; persisted uses review.perspectives.)
    withServer((server) => {
      const tpl = server.callTool('sis.council.review', {
        decision_id_or_workpacket_id: 'dec_x',
      });
      assert.ok(isOk(tpl));
      const tplPersp = (tpl as { perspectives: Record<string, unknown> }).perspectives;
      for (const seat of SEATS) assert.ok(seat in tplPersp);

      const persisted = server.callTool('sis.council.review', {
        decision_id_or_workpacket_id: 'wp_x',
        perspectives_input: Object.fromEntries(SEATS.map((s) => [s, 'ok'])),
      });
      assert.ok(isOk(persisted));
      const review = pick<{ perspectives: Record<string, unknown> }>(persisted, 'review');
      for (const seat of SEATS) assert.ok(seat in review.perspectives);
    });
  });
});
