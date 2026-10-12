/**
 * Maker / Checker Quality & Review Engine for Jules Conductor
 * Multi-Model and Council Verification Gate.
 *
 * Implements:
 * - @impeccable Design Standards (Tactile luxury, dark obsidian, zero CLS, semantic HTML)
 * - @humanizer Editorial Standards (Sentence case, anti-slop, metrics truth)
 * - Modern Frontier Architecture (React 19 / Next.js 16 / Node 24 native tests)
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1.
 */

// Forbidden AI prestige clichés and empty filler phrases
const SLOP_TERMS = [
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
];

// Design excellence checklist checks
const DESIGN_RED_FLAGS = [
  { pattern: /style=\{\{[^}]*position:\s*['"]fixed['"][^}]*\}\}/i, rule: 'Inline fixed positioning causes CLS; use semantic tailwind classes.' },
  { pattern: /<img(?![^>]*width)(?![^>]*height)(?![^>]*fill)[^>]*>/i, rule: 'Image tag missing explicit dimensions or fill layout (causes CLS).' },
  { pattern: /style=\{\{[^}]*color:\s*['"]#fff['"][^}]*background:\s*['"]#fff['"][^}]*\}\}/i, rule: 'Zero contrast ratio detected.' },
  { pattern: /<(div|span)[^>]*\bonClick\b(?![^>]*(role=|onKeyDown|tabIndex))/i, rule: 'Accessibility violation: <div>/<span> with onClick and no keyboard path. Use <button type="button"> for actions, or <a>/<Link> for navigation.' },
];

// Title case detection in markdown or headings (e.g. "### The Comprehensive Guide To Building Systems")
function checkSentenceCase(text) {
  const headingMatches = text.match(/^\+?\s*#{1,6}\s+([^\n]+)$/gm) || [];
  const issues = [];
  for (const h of headingMatches) {
    const title = h.replace(/^\+?\s*#{1,6}\s+/, '').trim();
    const words = title.split(/\s+/).filter(w => w.length > 3);
    const capitalizedCount = words.filter(w => /^[A-Z][a-z]+/.test(w)).length;
    // If more than 80% of longer words are capitalized, likely Title Case
    if (words.length >= 4 && capitalizedCount / words.length > 0.8) {
      issues.push(`Heading appears to use Title Case instead of Sentence Case: "${title}"`);
    }
  }
  return issues;
}

export function performMakerCheckerReview({ repo, taskDescription, diffText, repoProfile }) {
  const result = {
    approved: true,
    score: 100,
    evaluator: 'starlight-council-checker',
    impeccable: { passed: true, issues: [] },
    humanizer: { passed: true, issues: [] },
    architecture: { passed: true, issues: [] },
    feedback: [],
  };

  if (!diffText || typeof diffText !== 'string' || diffText.trim().length === 0) {
    return {
      approved: false,
      score: 0,
      evaluator: 'starlight-council-checker',
      feedback: ['Diff text is empty or missing.'],
    };
  }

  const diffLower = diffText.toLowerCase();

  // 1. @humanizer Editorial & Anti-Slop Audit
  const slopFound = [];
  for (const term of SLOP_TERMS) {
    if (diffLower.includes(term)) {
      slopFound.push(`Banned AI prestige word/slop detected: "${term}"`);
    }
  }

  const casingIssues = checkSentenceCase(diffText);
  if (casingIssues.length > 0) {
    slopFound.push(...casingIssues);
  }

  if (slopFound.length > 0) {
    result.humanizer.passed = false;
    result.humanizer.issues = slopFound;
    result.score -= slopFound.length * 10;
  }

  // 2. @impeccable Design & Front-End Excellence Audit
  const isFrontend = repoProfile?.type?.includes('nextjs') || repoProfile?.type?.includes('community') || diffText.includes('.tsx') || diffText.includes('.jsx');
  if (isFrontend) {
    const designIssues = [];
    for (const flag of DESIGN_RED_FLAGS) {
      if (flag.pattern.test(diffText)) {
        designIssues.push(flag.rule);
      }
    }

    // Check for hardcoded generic colors like bg-gray-100 or bg-white in dark mode contexts
    if (diffText.includes('bg-white') && !diffText.includes('dark:bg-')) {
      designIssues.push('Light theme hardcoding detected without dark mode variant. Follow dark tactile luxury obsidian register.');
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

  // Detect deprecated React hooks
  if (diffText.includes('useMemo(') && diffText.includes('useCallback(') && diffText.includes('"react-compiler"')) {
    archIssues.push('Redundant manual memoization with React Compiler active.');
  }

  if (archIssues.length > 0) {
    result.architecture.passed = false;
    result.architecture.issues = archIssues;
    result.score -= archIssues.length * 15;
  }

  // 4. CEO & Commercial Truth Audit (FrankX / Starlight Truth Standard)
  const ceoIssues = [];
  const truthDisallowedPatterns = [
    { pattern: /official\s+partner(\s+link)?/i, reason: 'Unverified "Official Partner" claim detected. Disclose affiliate referrals accurately.' },
    { pattern: /verified\s+workbench/i, reason: 'Unverified "Verified Workbench" accreditation claim detected without empirical certification.' },
    { pattern: /official\s+portal/i, reason: 'Affiliate or third-party redirect must not be labeled as an "Official Portal".' },
  ];

  for (const check of truthDisallowedPatterns) {
    if (check.pattern.test(diffText)) {
      ceoIssues.push(`CEO Truth Veto: ${check.reason}`);
    }
  }

  if (ceoIssues.length > 0) {
    result.ceo = { passed: false, issues: ceoIssues };
    result.score -= ceoIssues.length * 35; // Immediate failure for truth violations
  } else {
    result.ceo = { passed: true, issues: [] };
  }

  // Synthesize feedback
  result.score = Math.max(0, result.score);
  result.feedback = [
    ...result.humanizer.issues,
    ...result.impeccable.issues,
    ...result.architecture.issues,
    ...result.ceo.issues,
  ];

  const hasA11yViolation = result.impeccable.issues.some(i => i.toLowerCase().includes('accessibility violation'));
  const hasCeoViolation = result.ceo && !result.ceo.passed;

  // Pass threshold: score >= 75, zero architecture violations, zero accessibility violations, zero CEO truth violations
  result.approved = result.score >= 75 && result.architecture.issues.length === 0 && !hasA11yViolation && !hasCeoViolation;

  return result;
}

/**
 * Optional Frontier Model Evaluation (e.g. Claude Code or Gemini API)
 * Augments deterministic AST/regex heuristics with semantic reasoning.
 */
export async function performFrontierReview({ repo, taskDescription, diffText, model = 'claude' }) {
  try {
    const { spawnSync } = await import('node:child_process');
    const prompt = `Review this git diff for repository: ${repo}\nTask: ${taskDescription}\n\nDiff:\n${diffText.slice(0, 4000)}\n\nEvaluate on: 1. Architecture 2. Security 3. Taste/Aesthetics. Output concise JSON: {"approved": boolean, "score": number, "summary": string}`;
    
    const res = spawnSync('claude', ['-p', prompt], {
      encoding: 'utf8',
      timeout: 30000,
      windowsHide: true,
    });

    if (res.status === 0 && res.stdout) {
      const match = res.stdout.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    }
  } catch (err) {
    // Graceful fallback to heuristic review
  }
  return null;
}
