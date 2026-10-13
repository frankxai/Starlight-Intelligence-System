import test from 'node:test';
import assert from 'node:assert/strict';
import { engineerJulesPrompt } from '../prompt-engineer.mjs';
import { validatePatch } from '../sentinel-validator.mjs';
import { architectPreflight, weaverTasteReview, sentinelAudit, consultSageMemory } from '../council-gate.mjs';

test('Architect Preflight approves well-scoped tasks and assigns lead agent', () => {
  const profile = {
    type: 'substrate-core',
    primaryAgent: 'starlight-architect',
    qualityGate: 'npm run lint',
    targetBranch: 'main',
  };

  const result = architectPreflight({
    repo: 'frankxai/Starlight-Intelligence-System',
    taskDescription: 'Implement memory gateway routing filter for private tags',
    repoProfile: profile,
  });

  assert.equal(result.approved, true);
  assert.equal(result.assignedLead, 'starlight-architect');
  assert.ok(result.invariants.some(i => i.includes('SIP v1.1.1')));
});

test('Architect Preflight blocks prohibited broad refactors', () => {
  const profile = { type: 'substrate-core' };
  const result = architectPreflight({
    repo: 'frankxai/Starlight-Intelligence-System',
    taskDescription: 'Refactor everything across the codebase',
    repoProfile: profile,
  });

  assert.equal(result.approved, false);
  assert.ok(result.blockers.some(b => b.includes('Architect veto')));
});

test('Prompt Engineer injects Council invariants and hygiene standards', () => {
  const profile = {
    type: 'fullstack-nextjs',
    primaryAgent: 'starlight-weaver',
    qualityGate: 'npm run lint && npm run build',
    targetBranch: 'main',
  };

  const prompt = engineerJulesPrompt({
    repo: 'frankxai/arcanea-ai-app',
    taskDescription: 'Fix header hydration mismatch in mobile drawer',
    issueNumber: 520,
    repoProfile: profile,
    taskType: 'bugfix',
  });

  assert.ok(prompt.includes('starlight-weaver'));
  assert.ok(prompt.includes('Issue #520'));
  assert.ok(prompt.includes('Next.js Invariant'));
  assert.ok(prompt.includes('npm run lint && npm run build'));
  assert.ok(prompt.includes('Conventional Commits'));
});

test('Sentinel Validator detects secrets and token leakage', () => {
  const badDiff = `
diff --git a/src/config.ts b/src/config.ts
--- a/src/config.ts
+++ b/src/config.ts
@@ -1,3 +1,3 @@
-const token = process.env.GITHUB_TOKEN;
+const token = "ghp_123456789012345678901234567890123456";
`;

  const report = validatePatch(badDiff, { maxChangedFiles: 5, maxDiffLines: 100 });
  assert.equal(report.ok, false);
  assert.ok(report.violations.some(v => v.includes('secret or token')));
});

test('Sentinel Audit vetoes unvetted git-based npm packages and workflow alterations', () => {
  const badPkgDiff = `
diff --git a/package.json b/package.json
--- a/package.json
+++ b/package.json
@@ -10,3 +10,4 @@
+   "malicious-lib": "git://github.com/evil/repo.git",
`;

  const pkgReport = sentinelAudit(badPkgDiff, {});
  assert.equal(pkgReport.approved, false);
  assert.ok(pkgReport.blockers.some(b => b.includes('Sentinel veto: Non-standard git or http')));

  const workflowDiff = `
diff --git a/.github/workflows/deploy.yml b/.github/workflows/deploy.yml
--- a/.github/workflows/deploy.yml
+++ b/.github/workflows/deploy.yml
`;
  const wfReport = sentinelAudit(workflowDiff, {});
  assert.equal(wfReport.approved, false);
  assert.ok(wfReport.blockers.some(b => b.includes('GitHub Actions workflows')));
});

test('Weaver Taste Review flags AI placeholder slop', () => {
  const slopDiff = `
diff --git a/src/feature.ts b/src/feature.ts
--- a/src/feature.ts
+++ b/src/feature.ts
@@ -5,3 +5,4 @@
+ // TODO: implement later
`;

  const weaverReport = weaverTasteReview(slopDiff);
  assert.equal(weaverReport.approved, false);
  assert.ok(weaverReport.warnings.some(w => w.includes('slop/placeholder')));
});

test('Maker / Checker Quality Engine detects AI prestige buzzwords', async () => {
  const { performMakerCheckerReview } = await import('../maker-checker.mjs');
  const badDiff = `
diff --git a/app/page.tsx b/app/page.tsx
+ export function Intro() {
+   return <p>Let us delve into this rich tapestry that will revolutionize your workflow.</p>;
+ }
`;
  const review = performMakerCheckerReview(badDiff, { isFrontend: true });
  assert.equal(review.humanizer.passed, false);
  assert.ok(review.humanizer.issues.some(i => i.includes('delve')));
  assert.ok(review.humanizer.issues.some(i => i.includes('tapestry')));
  assert.ok(review.humanizer.issues.some(i => i.includes('revolutionize')));
  assert.ok(review.score < 80);
});

test('Maker / Checker flags frozen lockfile break when dependencies are touched without lockfile', async () => {
  const { performMakerCheckerReview } = await import('../maker-checker.mjs');
  const depDiff = `
diff --git a/package.json b/package.json
+ "dependencies": {
+   "some-lib": "^2.0.0"
+ }
`;
  const review = performMakerCheckerReview(depDiff, {
    files: ['package.json'],
  });
  assert.equal(review.ceoGuardrails.passed, false);
  assert.ok(review.ceoGuardrails.fatal.some(f => f.includes('Frozen Lockfile Violation')));
  assert.equal(review.approved, false);
});

test('Maker / Checker allows package.json script additions without lockfile modification', async () => {
  const { performMakerCheckerReview } = await import('../maker-checker.mjs');
  const scriptDiff = `
diff --git a/package.json b/package.json
+ "scripts": {
+   "test:noopener": "node scripts/tests/noopener.test.mjs"
+ }
`;
  const review = performMakerCheckerReview(scriptDiff, {
    files: ['package.json', 'scripts/tests/noopener.test.mjs'],
  });
  assert.equal(review.ceoGuardrails.passed, true);
  assert.equal(review.ceoGuardrails.fatal.length, 0);
  assert.equal(review.approved, true);
});

test('Maker / Checker catches React 19 / Next.js 16 async params violation', async () => {
  const { performMakerCheckerReview } = await import('../maker-checker.mjs');
  const badParamDiff = `
diff --git a/app/posts/[slug]/page.tsx b/app/posts/[slug]/page.tsx
+ export default function Page({ params }: { params: { slug: string } }) {
+   return <div>{params.slug}</div>;
+ }
`;
  const review = performMakerCheckerReview(badParamDiff, { isFrontend: true });
  assert.equal(review.architecture.passed, false);
  assert.ok(review.architecture.issues.some(i => i.includes('Next.js 16 / React 19 invariant')));
  assert.equal(review.approved, false);
});

