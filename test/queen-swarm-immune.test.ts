import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  assignDomainGeneral,
  auditEditorialSentenceCase,
  auditWeaverAntiSlop,
  createReviewReceipt,
  isHighRiskPath,
  isReviewerAllowed,
  REVIEW_RECEIPT_MARKER,
  routeSwarmTask,
  runImmuneSweep,
  selectComputePlane,
  validateReviewReceiptBody,
} from '../src/queen/index.js';
// @ts-expect-error plain ESM CLI without type declarations
import { main as immuneCli } from '../tools/queen/immune-sweeper.mjs';

describe('Starlight Queen — receipt CLI never fabricates a review', () => {
  it('refuses to emit a receipt without the reviewer report file and resolution', () => {
    const code = immuneCli([
      '--receipt', '--repo', 'frankxai/Starlight-Intelligence-System', '--pr', '436',
      '--head', '1cfdf64b789a568ca4d5d22fc5d923a81e7ae455', '--maker', 'antigravity',
      '--provider', 'codex', '--files', 'src/queen/index.ts',
    ]);
    assert.equal(code, 2);
  });
});

const SAMPLE_SHA = '4a51f37e9c0123456789abcdef0123456789abcd';
const SAMPLE_REVIEW =
  'Independent maker-checker verification completed across all target files. Verified TypeScript types, edge cases, and unit test suite with zero regressions.';

describe('Starlight Queen — Review Receipt Engine (STARLIGHT-INDEPENDENT-REVIEW-V1)', () => {
  it('classifies high-risk and standard paths accurately', () => {
    assert.equal(isHighRiskPath('package.json'), true);
    assert.equal(isHighRiskPath('.github/workflows/ci.yml'), true);
    assert.equal(isHighRiskPath('AGENTS.md'), true);
    assert.equal(isHighRiskPath('src/finance/pnl.ts'), true);
    assert.equal(isHighRiskPath('src/alexandria/store.ts'), true);
    assert.equal(isHighRiskPath('tools/queen/ledger.jsonl'), true);
    assert.equal(isHighRiskPath('docs/decisions/ledger.md'), false);
    assert.equal(isHighRiskPath('src/queen/swarm-command.ts'), false);
    assert.equal(isHighRiskPath('src/queen/immune-sweeper.ts'), false);
  });

  it('enforces maker-checker separation and CTO high-risk escalation', () => {
    assert.equal(isReviewerAllowed('codex', 'codex', false), false);
    assert.equal(isReviewerAllowed('jules', 'antigravity', false), true);
    assert.equal(isReviewerAllowed('jules', 'antigravity', true), false);
    assert.equal(isReviewerAllowed('jules', 'cto', true), true);
    assert.equal(isReviewerAllowed('cto', 'cto', true), false);
    assert.equal(isReviewerAllowed('cto', 'codex', true), true);
  });

  it('generates an exact-head review receipt and rejects non-CTO reviewers on high-risk paths', () => {
    assert.throws(() =>
      createReviewReceipt({
        repository: 'frankxai/Starlight-Intelligence-System',
        pr: 430,
        headSha: SAMPLE_SHA,
        maker: 'codex',
        provider: 'antigravity',
        reviewedFiles: ['tools/jules-conductor/tests/test_conductor.py'],
        review: SAMPLE_REVIEW,
        resolution: 'Verified unit tests pass and invariants hold.',
      }),
    );

    const { receipt, body, risky } = createReviewReceipt({
      repository: 'frankxai/Starlight-Intelligence-System',
      pr: 430,
      headSha: SAMPLE_SHA,
      maker: 'codex',
      provider: 'cto',
      reviewedFiles: ['tools/jules-conductor/tests/test_conductor.py'],
      review: SAMPLE_REVIEW,
      resolution: 'Verified unit tests pass and invariants hold.',
    });

    assert.equal(risky, true);
    assert.equal(receipt.provider, 'cto');
    assert.ok(body.startsWith(REVIEW_RECEIPT_MARKER));
  });

  it('validates low-risk and high-risk receipts against merge_review_gate invariants', () => {
    const lowRiskFiles = ['src/queen/swarm-command.ts', 'src/queen/immune-sweeper.ts'];
    const { body } = createReviewReceipt({
      repository: 'frankxai/Starlight-Intelligence-System',
      pr: 440,
      headSha: SAMPLE_SHA,
      maker: 'jules',
      provider: 'antigravity',
      reviewedFiles: lowRiskFiles,
      review: SAMPLE_REVIEW,
      resolution: 'All unit suites pass without warnings.',
    });

    assert.equal(body.startsWith(REVIEW_RECEIPT_MARKER), true);

    const checkPass = validateReviewReceiptBody(body, {
      repository: 'frankxai/Starlight-Intelligence-System',
      pr: 440,
      headSha: SAMPLE_SHA,
      changedFiles: lowRiskFiles,
    });
    assert.equal(checkPass.valid, true);
    assert.equal(checkPass.risky, false);

    // Tampered headSha must fail closed
    const checkWrongSha = validateReviewReceiptBody(body, {
      repository: 'frankxai/Starlight-Intelligence-System',
      pr: 440,
      headSha: '0000000000000000000000000000000000000000',
      changedFiles: lowRiskFiles,
    });
    assert.equal(checkWrongSha.valid, false);

    // High-risk receipt with CTO reviewer must fail if auto-merge is armed
    const highRiskFiles = ['src/alexandria/index.ts'];
    const highRiskReceipt = createReviewReceipt({
      repository: 'frankxai/Starlight-Intelligence-System',
      pr: 431,
      headSha: SAMPLE_SHA,
      maker: 'codex',
      provider: 'cto',
      reviewedFiles: highRiskFiles,
      review: SAMPLE_REVIEW,
      resolution: 'Reviewed symlink lock identity and prefix rehash.',
    });

    const blockedAutoMerge = validateReviewReceiptBody(highRiskReceipt.body, {
      repository: 'frankxai/Starlight-Intelligence-System',
      pr: 431,
      headSha: SAMPLE_SHA,
      changedFiles: highRiskFiles,
      autoMergeArmed: true,
    });
    assert.equal(blockedAutoMerge.valid, false);
    assert.match(blockedAutoMerge.reason, /High-risk PRs never auto-merge/);
  });
});

describe('Starlight Queen — Swarm Command & Compute Placement Router', () => {
  it('assigns the appropriate Domain General by file scope and risk', () => {
    const uiTask = assignDomainGeneral({
      id: 'ui-1',
      repo: 'frankxai/arcanea-ai-app',
      title: 'Heal mobile navigation drawer and hero paint',
      description: 'Fix responsive layout and modal z-index',
      scopeFiles: ['apps/web/components/landing/navbar.tsx'],
    });
    assert.equal(uiTask.leadGeneral.id, 'starlight-weaver');
    assert.equal(uiTask.highRisk, false);

    const securityTask = assignDomainGeneral({
      id: 'sec-1',
      repo: 'frankxai/Starlight-Intelligence-System',
      title: 'Tighten merge review gate path patterns',
      description: 'Update high-risk ledger classification',
      scopeFiles: ['tools/merge-review/merge_review_gate.py'],
    });
    assert.equal(securityTask.leadGeneral.id, 'starlight-sentinel');
    assert.equal(securityTask.highRisk, true);

    const memoryTask = assignDomainGeneral({
      id: 'mem-1',
      repo: 'frankxai/Starlight-Intelligence-System',
      title: 'Consolidate operational vault entries',
      description: 'Update JSONL indexing and vault synthesis',
      scopeFiles: ['memory/vaults/operational.jsonl'],
    });
    assert.equal(memoryTask.leadGeneral.id, 'starlight-sage');
  });

  it('spills over from local cockpit to Cloud Run worker when RAM is low or local agents are saturated', () => {
    const baseTask = {
      id: 'task-compute',
      repo: 'frankxai/Starlight-Intelligence-System',
      title: 'Implement swarm command router',
      description: 'Add TypeScript routing logic',
      scopeFiles: ['src/queen/swarm-command.ts'],
    };

    const healthyLocal = selectComputePlane(baseTask, {
      freeRamGb: 12.5,
      activeLocalAgents: 1,
    });
    assert.equal(healthyLocal.computePlane, 'local-cockpit');
    assert.equal(healthyLocal.spilledOverToCloud, false);

    const lowRamSpillover = selectComputePlane(baseTask, {
      freeRamGb: 2.8,
      activeLocalAgents: 1,
    });
    assert.equal(lowRamSpillover.computePlane, 'cloud-run-worker');
    assert.equal(lowRamSpillover.spilledOverToCloud, true);

    const saturatedSpillover = selectComputePlane(baseTask, {
      freeRamGb: 10.0,
      activeLocalAgents: 2,
    });
    assert.equal(saturatedSpillover.computePlane, 'cloud-run-worker');
    assert.equal(saturatedSpillover.spilledOverToCloud, true);
  });

  it('produces a complete SwarmRoutingPlan with Context7 and review policy metadata', () => {
    const plan = routeSwarmTask(
      {
        id: 'route-1',
        repo: 'frankxai/arcanea-ai-app',
        title: 'Upgrade Next.js app router navigation with Tailwind',
        description: 'Ensure responsive focus states',
        scopeFiles: ['apps/web/app/create/page.tsx'],
        maker: 'jules',
      },
      { freeRamGb: 9.0, activeLocalAgents: 0 },
    );

    assert.equal(plan.leadGeneral.id, 'starlight-weaver');
    assert.equal(plan.computePlane, 'local-cockpit');
    assert.equal(plan.requiresContext7Grounding, true);
    assert.equal(plan.reviewPolicy.requiresCtoPass, false);
    assert.equal(plan.reviewPolicy.autoMergeAllowed, true);
    assert.ok(plan.reviewPolicy.allowedReviewers.includes('antigravity'));
  });
});

describe('Starlight Queen — Continuous Immune System & CX Sweeper', () => {
  it('flags stacked uppercase headings and raw slash headings while allowing technical acronyms', () => {
    const cleanMd = [
      '# Starlight sovereign swarm architecture',
      '## Using MCP and JSONL with SIP APIs',
      '```markdown',
      '# THIS IS INSIDE A CODE BLOCK AND IGNORED',
      '```',
    ].join('\n');
    assert.equal(auditEditorialSentenceCase('docs/guide.md', cleanMd).length, 0);

    const badMd = [
      '# OVERVIEW OF THE ENTIRE SYSTEM',
      '## /yolo-hive command reference',
    ].join('\n');
    const findings = auditEditorialSentenceCase('docs/bad.md', badMd);
    assert.equal(findings.length, 2);
  });

  it('detects Weaver anti-slop placeholders and blocks unhealthy sweeps', () => {
    const slopHits = auditWeaverAntiSlop(
      'src/app.ts',
      'function run() {\n  // TODO: implement later\n}\n',
    );
    assert.equal(slopHits.length, 1);
    assert.equal(slopHits[0].severity, 'blocker');

    const blockedReport = runImmuneSweep({
      files: [
        {
          path: 'src/app.ts',
          content: 'export const x = 1; // placeholder\n',
        },
      ],
      changedPaths: ['package.json'],
      autoMergeArmed: true,
    });
    assert.equal(blockedReport.healthy, false);
    assert.equal(blockedReport.blockerCount, 2);
    assert.equal(blockedReport.riskSurface.highRisk, true);
    assert.equal(blockedReport.riskSurface.autoMergeAllowed, false);

    const cleanReport = runImmuneSweep({
      files: [
        {
          path: 'src/queen/swarm-command.ts',
          content: 'export const ready = true;\n',
        },
      ],
    });
    assert.equal(cleanReport.healthy, true);
    assert.equal(cleanReport.score, 100);
  });
});
