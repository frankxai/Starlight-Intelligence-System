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
