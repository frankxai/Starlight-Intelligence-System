import test from 'node:test';
import assert from 'node:assert/strict';
import { engineerJulesPrompt } from '../prompt-engineer.mjs';
import { validatePatch } from '../sentinel-validator.mjs';
import { architectPreflight, weaverTasteReview, sentinelAudit, consultSageMemory } from '../council-gate.mjs';
import { performMakerCheckerReview } from '../maker-checker.mjs';

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

test('Maker/Checker flags banned prestige words and AI slop', () => {
  const badDiff = `
diff --git a/content/intro.md b/content/intro.md
--- a/content/intro.md
+++ b/content/intro.md
@@ -1,2 +1,3 @@
+# Welcome to the future
+We will delve deeply into this pivotal testament to human ingenuity to seamlessly elevate your workflow.
`;

  const review = performMakerCheckerReview({
    repo: 'frankxai/frankx.ai-vercel-website',
    taskDescription: 'Update intro copy',
    diffText: badDiff,
    repoProfile: { type: 'fullstack-nextjs' },
  });

  assert.equal(review.approved, false);
  assert.ok(review.feedback.some(f => f.includes('delve')));
  assert.ok(review.feedback.some(f => f.includes('testament to')));
  assert.ok(review.feedback.some(f => f.includes('seamlessly')));
});

test('Maker/Checker enforces Next.js 16 async params invariant', () => {
  const badParamDiff = `
diff --git a/app/blog/[slug]/page.tsx b/app/blog/[slug]/page.tsx
--- a/app/blog/[slug]/page.tsx
+++ b/app/blog/[slug]/page.tsx
@@ -1,3 +1,3 @@
-export default function Page() {}
+export default function Page({ params }: { params: { slug: string } }) {
+  return <div>{params.slug}</div>;
+}
`;

  const review = performMakerCheckerReview({
    repo: 'frankxai/arcanea-ai-app',
    taskDescription: 'Fix slug page',
    diffText: badParamDiff,
    repoProfile: { type: 'fullstack-nextjs' },
  });

  assert.equal(review.approved, false);
  assert.ok(review.feedback.some(f => f.includes('Next.js 16 / React 19 invariant')));
});

test('Maker/Checker approves clean, tactile, compliant implementation', () => {
  const goodDiff = `
diff --git a/components/header.tsx b/components/header.tsx
--- a/components/header.tsx
+++ b/components/header.tsx
@@ -1,5 +1,6 @@
+export function Header() {
+  return (
+    <header className="fixed top-0 inset-x-0 bg-[#08090C]/80 backdrop-blur border-b border-white/10 h-16">
+      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-full">
+        <span className="text-sm font-mono text-zinc-400">Starlight</span>
+      </div>
+    </header>
+  );
+}
`;

  const review = performMakerCheckerReview({
    repo: 'frankxai/arcanea-ai-app',
    taskDescription: 'Refactor header styling',
    diffText: goodDiff,
    repoProfile: { type: 'fullstack-nextjs' },
  });

  assert.equal(review.approved, true);
  assert.equal(review.score, 100);
});

test('Maker/Checker detects keyboard accessibility violations with onClick on div/span', () => {
  const inaccessibleDiff = `
diff --git a/components/modal.tsx b/components/modal.tsx
--- a/components/modal.tsx
+++ b/components/modal.tsx
@@ -1,5 +1,6 @@
+export function Modal({ onClose }: { onClose: () => void }) {
+  return (
+    <div className="backdrop" onClick={onClose}>
+      <div className="modal-content">Content</div>
+    </div>
+  );
+}
+`;

  const review = performMakerCheckerReview({
    repo: 'frankxai/arcanea-ai-app',
    taskDescription: 'Add modal backdrop',
    diffText: inaccessibleDiff,
    repoProfile: { type: 'fullstack-nextjs' },
  });

  assert.equal(review.approved, false);
  assert.ok(review.feedback.some(f => f.includes('Accessibility violation')));
});

test('Sage Memory retrieves proven architectural patterns from technical-vault.md', () => {
  const memories = consultSageMemory('frankxai/arcanea-ai-app', ['pattern', 'architecture', 'visual']);
  assert.ok(Array.isArray(memories));
  assert.ok(memories.length > 0);
  assert.ok(memories.some(m => m.type === 'proven_pattern' || m.type === 'operational_lesson'));
});

test('Telemetry Server metrics format conforms to live HUD schema', async () => {
  const { getTelemetryMetrics } = await import('../telemetry-server.mjs');
  const metrics = getTelemetryMetrics();

  assert.ok(metrics.timestamp);
  assert.ok(typeof metrics.ram.rssMb === 'number');
  assert.ok(typeof metrics.slots.active === 'number');
  assert.equal(metrics.throughput.dailyTarget, 300);
  assert.ok(Array.isArray(metrics.recentPRs));
  assert.ok(['HEALTHY', 'HIGH_MEMORY', 'DEGRADED'].includes(metrics.health));
});

test('Maker/Checker CEO Truth Gate blocks unverified partner claims and badges', () => {
  const fakeClaimsDiff = `
diff --git a/components/partner.tsx b/components/partner.tsx
--- a/components/partner.tsx
+++ b/components/partner.tsx
@@ -1,5 +1,6 @@
+export function PartnerCard() {
+  return (
+    <div>
+      <span className="badge">Verified Workbench</span>
+      <a href="/go/tool">Official Partner Link</a>
+    </div>
+  );
+}
+`;

  const review = performMakerCheckerReview({
    repo: 'frankxai/frankx.ai-vercel-website',
    taskDescription: 'Add partner component',
    diffText: fakeClaimsDiff,
    repoProfile: { type: 'fullstack-nextjs' },
  });

  assert.equal(review.approved, false);
  assert.equal(review.ceo.passed, false);
  assert.ok(review.feedback.some(f => f.includes('CEO Truth Veto')));
  assert.ok(review.feedback.some(f => f.includes('Verified Workbench')));
  assert.ok(review.feedback.some(f => f.includes('Official Partner')));
});


