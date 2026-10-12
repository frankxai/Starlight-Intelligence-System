/**
 * Maker / Checker Quality & Review Engine for Starlight Estate PRs
 * Multi-Model and Council Verification Gate.
 *
 * Implements:
 * - @impeccable Design Standards (Tactile luxury, dark obsidian, zero CLS, semantic HTML)
 * - @humanizer Editorial Standards (Sentence case, anti-slop, metrics truth)
 * - Modern Frontier Architecture (React 19 / Next.js 16 / Node 24 invariants)
 * - CEO Operational Guardrails (Lockfile integrity, contract decoupling, verified receipts)
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1.
 */

// Forbidden AI prestige clichés and empty filler phrases
export const SLOP_TERMS = [
  'delve',
  'testament to',
  'tapestry',
  'beacon of',
  'revolutionize',
  'elevate',
  'seamlessly',
  'pivotal',
  'furthermore',
  'game-changer',
  'unleash',
  'harness the power',
  'in summary,',
  'in conclusion,',
  'as an ai language model',
  'as an ai,',
  'insert logic here',
  'todo: implement later',
  'cutting-edge',
  'paradigm shift',
];

// Design excellence checklist checks
export const DESIGN_RED_FLAGS = [
  { pattern: /style=\{\{[^}]*position:\s*['"]fixed['"][^}]*\}\}/i, rule: 'Inline fixed positioning causes CLS; use semantic tailwind classes.' },
  { pattern: /<img(?![^>]*width)(?![^>]*height)(?![^>]*fill)[^>]*>/i, rule: 'Image tag missing explicit dimensions or fill layout (causes CLS).' },
  { pattern: /style=\{\{[^}]*color:\s*['"]#fff['"][^}]*background:\s*['"]#fff['"][^}]*\}\}/i, rule: 'Zero contrast ratio detected.' },
];

/**
 * Audits a git diff or file changes against Maker/Checker excellence invariants.
 * @param {string} diffText - The full git diff text
 * @param {object} options - Audit configuration options
 * @returns {object} Audit report with score, approvals, and categorized findings
 */
export function performMakerCheckerReview(diffText, options = {}) {
  const { isFrontend = true, repo = '', files = [] } = options;

  const result = {
    approved: true,
    score: 100,
    humanizer: { passed: true, issues: [] },
    impeccable: { passed: true, issues: [] },
    architecture: { passed: true, issues: [] },
    ceoGuardrails: { passed: true, issues: [], fatal: [] },
    feedback: [],
  };

  if (!diffText || typeof diffText !== 'string') {
    return result;
  }

  const diffLower = diffText.toLowerCase();

  // 1. Humanizer / Anti-Slop Audit
  const humanizerIssues = [];
  for (const slop of SLOP_TERMS) {
    if (diffLower.includes(slop)) {
      humanizerIssues.push(`Anti-slop violation: detected AI prestige term "${slop}".`);
    }
  }

  // Detect unbacked public metrics (e.g. 99.99% uptime, 10,000+ users without verified evidence)
  if (/\b\d{1,3}(,\d{3})*\+\s*(users|customers|songs|requests)\b/i.test(diffText)) {
    humanizerIssues.push('Metrics truth violation: Plus-suffixed unbacked count detected without evidence marker.');
  }

  if (humanizerIssues.length > 0) {
    result.humanizer.passed = false;
    result.humanizer.issues = humanizerIssues;
    result.score -= humanizerIssues.length * 10;
  }

  // 2. Impeccable Design Standards (Frontend only)
  if (isFrontend) {
    const designIssues = [];

    for (const flag of DESIGN_RED_FLAGS) {
      if (flag.pattern.test(diffText)) {
        designIssues.push(flag.rule);
      }
    }

    // Hardcoded white background in dark luxury context without dark variant
    if (diffText.includes('bg-white') && !diffText.includes('dark:bg-') && !diffText.includes('bg-white/')) {
      designIssues.push('Light theme hardcoding detected without dark mode variant. Follow dark tactile luxury register.');
    }

    if (designIssues.length > 0) {
      result.impeccable.passed = false;
      result.impeccable.issues = designIssues;
      result.score -= designIssues.length * 15;
    }
  }

  // 3. Modern Frontier Architecture Audit
  const archIssues = [];

  // Detect React 19 / Next.js 16 async params violation: e.g. ({ params }: { params: { slug: string } })
  if (isFrontend && diffText.includes('params: {') && !diffText.includes('Promise<') && !diffText.includes('await params')) {
    archIssues.push('Next.js 16 / React 19 invariant: Page params and searchParams must be typed as Promise and awaited.');
  }

  // Detect deprecated React compiler manual memoization if React Compiler is active
  if (diffText.includes('useMemo(') && diffText.includes('useCallback(') && diffText.includes('"react-compiler"')) {
    archIssues.push('Redundant manual memoization with React Compiler active.');
  }

  if (archIssues.length > 0) {
    result.architecture.passed = false;
    result.architecture.issues = archIssues;
    result.score -= archIssues.length * 15;
  }

  // 4. CEO Operational Guardrails
  const ceoIssues = [];
  const ceoFatal = [];

  // Lockfile integrity check: package.json dependencies modified without lockfile
  const filePaths = files.map(f => (typeof f === 'string' ? f : f.path || f.filename || ''));
  const hasPkgJson = filePaths.some(p => p.endsWith('package.json')) || diffText.includes('diff --git a/package.json');
  const touchesDeps = /["'](dependencies|devDependencies|peerDependencies)["']/.test(diffText);
  const hasLockfile = filePaths.some(p => p.endsWith('pnpm-lock.yaml') || p.endsWith('package-lock.json') || p.endsWith('yarn.lock'))
    || diffText.includes('diff --git a/pnpm-lock.yaml')
    || diffText.includes('diff --git a/package-lock.json');

  if (hasPkgJson && touchesDeps && !hasLockfile) {
    ceoFatal.push('Frozen Lockfile Violation: package.json dependencies were modified without updating the lockfile (pnpm-lock.yaml/package-lock.json). CI will fail on frozen-lockfile.');
  }

  // Contract Guard coupling check
  const hasContractTest = filePaths.some(p => p.includes('contract.test.') || p.includes('contract-guard'));
  const hasGuardedSurface = filePaths.some(p => p.startsWith('scripts/audit') || p.startsWith('src/core') || p.startsWith('app/'));
  if (hasContractTest && hasGuardedSurface && !options.prTitle?.toLowerCase().includes('[contract-change]')) {
    ceoIssues.push('Contract Guard Notice: Contract tests and guarded surfaces are modified together. Requires [contract-change] in PR title.');
  }

  if (ceoIssues.length > 0 || ceoFatal.length > 0) {
    result.ceoGuardrails.passed = ceoFatal.length === 0;
    result.ceoGuardrails.issues = ceoIssues;
    result.ceoGuardrails.fatal = ceoFatal;
    result.score -= (ceoIssues.length * 20) + (ceoFatal.length * 50);
  }

  // Synthesize feedback
  result.score = Math.max(0, result.score);
  result.feedback = [
    ...result.ceoGuardrails.fatal,
    ...result.humanizer.issues,
    ...result.impeccable.issues,
    ...result.architecture.issues,
    ...result.ceoGuardrails.issues,
  ];

  // Pass threshold: score >= 75 and zero fatal CEO violations and zero architecture blockers
  result.approved = result.score >= 75 && result.ceoGuardrails.fatal.length === 0 && result.architecture.issues.length === 0;

  return result;
}
