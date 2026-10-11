/**
 * High-Intellect Multi-Agent Prompt Engineer for Jules Cloud Agent
 * Formulates frontier-grade, hardened execution cards integrating
 * the Starlight Specialist Council (Queen, Architect, Sentinel, Weaver, Sage)
 * and embedding @humanizer editorial and @impeccable design excellence standards.
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1.
 */

import { architectPreflight, consultSageMemory } from './council-gate.mjs';

export const JULES_PERSONAS = {
  frontend_excellence: {
    title: 'Principal Design Technologist & Frontend Architect (@impeccable)',
    mission: 'Deliver unmistakable tactile luxury, zero layout shift (CLS), semantic accessibility, and responsive recomposition without generic AI slop.',
    principles: [
      'Tactile Luxury: Subtle borders (e.g. border-white/10), obsidian deep canvas, fluid typographic rhythm, purposeful spatial depth.',
      'Accessibility & States: Semantic HTML first, visible focus states, 44px+ touch targets, and full empty/loading/error state design.',
      'Motion Discipline: Use Framer Motion only to explain spatial hierarchy; strictly respect prefers-reduced-motion; no gratuitous bouncing or marquee noise.',
      'Zero Layout Shift: Always declare image/video aspect-ratio slots and avoid late-loading layout pops.'
    ]
  },
  technical_content_seo: {
    title: 'Lead Editorial Architect & Technical Content Director (@humanizer)',
    mission: 'Articulate technical concepts with direct, warm, high-intellect clarity; eliminate generated AI prestige formulas and ground all public claims.',
    principles: [
      'Sentence Case: Use sentence case across all headings, buttons, and navigation labels (e.g., "Model routing" not "Model Routing").',
      'Anti-Slop Filter: Banish ChatGPT filler words ("delve", "tapestry", "revolutionize", "beacon", "game-changer", "testament to", "harness", "unlock").',
      'Truthful Metrics: Never invent performance numbers or user metrics; cite verifiable sources or date snapshots (as of October 2026).',
      'Direct Cadence: Pattern recognition as poetry. Write active voice with concrete mechanisms.'
    ]
  },
  systems_security_healing: {
    title: 'Principal Systems & Security Engineer (Sentinel Core)',
    mission: 'Implement surgical fixes, dependency upgrades, and security hardening with zero data leakage and zero architectural regression.',
    principles: [
      'Zero Secret Leakage: Never expose, commit, or mock API keys, tokens, or credentials.',
      'Supply Chain Gate: Never add git:// or http:// URLs or unvetted external dependencies into package.json.',
      'Surgical Bounds: Limit edits to the minimal set of files (<= 4 files, <= 300 diff lines) to ensure deterministic automated ratification.'
    ]
  },
  overflow_testing_qa: {
    title: 'Frontier QA & Reliability Engineer (The Proving Ground)',
    mission: 'Construct exhaustive automated unit and integration tests covering edge cases, failure modes, and boundary invariants.',
    principles: [
      'Empirical Grounding: Reproduce bugs with failing tests before fixing.',
      'Native Runners: Prefer node:test or existing project test suites without adding heavy test frameworks.',
      'Zero Flake: Ensure all tests are deterministic, async-safe, and pass within 5 seconds.'
    ]
  },
  knowledge_graph_ontology: {
    title: 'Ontology Architect & Second Brain Synchronizer (Sage Vaults)',
    mission: 'Maintain high-integrity knowledge graphs, ADR architecture decision records, and semantic memory linkages.',
    principles: [
      'Graph Coherence: Link architectural entities with clean JSON-LD or markdown frontmatter.',
      'Vault Alignment: Mirror changes into the corresponding Starlight Vault (Strategic, Technical, Operational).',
      'Preserve Lineage: Retain decision context, ADR citations, and commit SHAs.'
    ]
  },
  product_architecture_rd: {
    title: 'Staff Product Architect (Starlight Prime)',
    mission: 'Decompose feature specifications into atomic, high-leverage pull request slices.',
    principles: [
      'Top-Down Decomposition: Break complex product specs into independently deployable slices.',
      'Backward Compatibility: Never break existing public APIs or interfaces without an explicit deprecation shim.',
      'Self-Contained Slices: Each PR must be complete, verified, and deliver standalone value.'
    ]
  }
};

export function selectPersona(taskType = 'feature', taskDescription = '', repoProfile = {}) {
  const descLower = taskDescription.toLowerCase();
  const typeLower = taskType.toLowerCase();

  if (typeLower === 'frontend_excellence' || descLower.includes('ui') || descLower.includes('css') || descLower.includes('layout') || descLower.includes('component') || descLower.includes('drawer') || descLower.includes('styling') || repoProfile.type === 'fullstack-nextjs') {
    return JULES_PERSONAS.frontend_excellence;
  }
  if (typeLower === 'technical_content_seo' || descLower.includes('seo') || descLower.includes('blog') || descLower.includes('guide') || descLower.includes('content') || descLower.includes('copy') || descLower.includes('editorial')) {
    return JULES_PERSONAS.technical_content_seo;
  }
  if (typeLower === 'overflow_testing_qa' || descLower.includes('test') || descLower.includes('coverage') || descLower.includes('qa')) {
    return JULES_PERSONAS.overflow_testing_qa;
  }
  if (typeLower === 'knowledge_graph_ontology' || descLower.includes('ontology') || descLower.includes('graph') || descLower.includes('vault') || descLower.includes('adr')) {
    return JULES_PERSONAS.knowledge_graph_ontology;
  }
  if (typeLower === 'security' || descLower.includes('security') || descLower.includes('cve') || descLower.includes('vulnerability') || descLower.includes('dependency')) {
    return JULES_PERSONAS.systems_security_healing;
  }
  return JULES_PERSONAS.product_architecture_rd;
}

export function getFrontierTechnicalAnchors(repoProfile = {}) {
  const type = repoProfile.type || 'generic';
  if (type === 'fullstack-nextjs' || type === 'community-platform') {
    return [
      'Next.js 15/16 + React 19: All page/route `params` and `searchParams` are async promises and MUST be awaited: `const { slug } = await params`.',
      'Server Actions & Transitions: Prefer Server Actions with `useActionState` and `useTransition` for non-blocking UI mutations.',
      'Server Component Hygiene: Keep "use client" boundaries minimal at leaf components; never leak server secrets to client bundles.',
      'Tailwind v4 & Tokens: Use Tailwind v4 `@theme` CSS variables and tactile dark obsidian palette (`#08090C`, `#0E1015`, accent `#6366F1`).',
      'Lucide React Icons: Always use individual named imports (e.g. `import { ArrowRight, Trophy } from "lucide-react"`) to avoid bundle bloat.',
      'Core Web Vitals & CLS: Zero Cumulative Layout Shift (CLS); declare exact dimensions or aspect-ratio slots on all media/containers.',
      'Accessibility & A11y: Visible focus rings (`focus-visible:ring-2`), semantic HTML first, touch targets >= 44x44px, and `aria-live="polite"` on dynamic regions.',
      'Keyboard Accessibility Invariant: NEVER use `<div>` or `<span>` with `onClick` without a keyboard path. ALWAYS use `<button type="button">` for actions, or `<a>`/`<Link>` for navigation, with proper keyboard handlers and ARIA attributes.',
      'SEO & Structured Data: Inject JSON-LD `<script type="application/ld+json">` for articles and entities; declare OpenGraph and Twitter card metadata.'
    ];
  }
  if (type === 'substrate-core' || type === 'agent-runtime') {
    return [
      'Node.js 24 + SIP v1.1.1: Use native Node primitives (node:fs/promises, node:child_process, node:crypto, node:test).',
      'Event-Sourcing Invariants: All persistent state changes must append immutable JSONL event records before indexing.',
      'Async Safety: Zero unhandled promise rejections; all child process executions must specify deterministic timeouts and buffer caps.'
    ];
  }
  if (type === 'second-brain' || type === 'genesis-engine') {
    return [
      'Second Brain & Ontology: Maintain valid YAML frontmatter and cited source links on all markdown captures.',
      'Starlight Vault Contracts: Align knowledge artifacts to the 6 semantic memory vaults (Strategic, Technical, Creative, Operational, Wisdom, Horizon).'
    ];
  }
  return [
    'TypeScript Strict Mode: Zero implicit `any`; export explicit interface/type definitions for all library APIs.'
  ];
}

export function engineerSelfHealingPrompt({
  repo,
  taskDescription,
  violations = [],
  repoProfile = {},
  retryCount = 1,
}) {
  const persona = selectPersona('bugfix', taskDescription, repoProfile);
  const technicalAnchors = getFrontierTechnicalAnchors(repoProfile);

  // Group and compress violations into actionable instructions
  const titleCaseViolations = violations.filter(v => v.includes('Title Case'));
  const sizeViolations = violations.filter(v => v.includes('Diff lines') || v.includes('File count'));
  const secretViolations = violations.filter(v => v.includes('secret') || v.includes('token'));
  const asyncParamViolations = violations.filter(v => v.includes('Next.js 16') || v.includes('async'));
  const slopViolations = violations.filter(v => v.includes('slop') || v.includes('Banned'));
  const a11yViolations = violations.filter(v => v.includes('onClick') || v.includes('Accessibility') || v.includes('keyboard path'));

  const correctiveDirectives = [];

  if (titleCaseViolations.length > 0) {
    correctiveDirectives.push(`- CASE HYGIENE: Convert all Markdown headings (#, ##, ###) and UI button labels to Sentence case (e.g. "# Sandersonian magic toll evaluator", NOT "# Sandersonian Magic Toll Evaluator").`);
  }
  if (sizeViolations.length > 0) {
    correctiveDirectives.push(`- DIFF COMPRESSION: Your previous patch was too large. Strictly limit changes to ONLY the primary file. Do NOT refactor adjacent modules. Target <= 250 diff lines.`);
  }
  if (secretViolations.length > 0) {
    correctiveDirectives.push(`- ZERO SECRETS: Never include API tokens, credentials, or mock keys. Rely on process.env.`);
  }
  if (asyncParamViolations.length > 0) {
    correctiveDirectives.push(`- ASYNC PARAMS: In Next.js 16 / React 19, params must be Promise-typed: \`{ params }: { params: Promise<{ slug: string }> }\` and awaited with \`const { slug } = await params;\`.`);
  }
  if (slopViolations.length > 0) {
    correctiveDirectives.push(`- EDITORIAL ANTI-SLOP: Eliminate AI filler words (delve, testament to, tapestry, elevate, seamlessly). Use direct technical phrasing.`);
  }
  if (a11yViolations.length > 0) {
    correctiveDirectives.push(`- ACCESSIBILITY & A11Y: Replace all <div> or <span> elements that have onClick with <button type="button"> or <a>/<Link>, ensuring full keyboard accessibility and visible focus.`);
  }
  if (correctiveDirectives.length === 0) {
    correctiveDirectives.push(...violations.map(v => `- Fix: ${v}`));
  }

  return `# Starlight Queen Autonomic Self-Healing Card: ${repo}
> Attempt ${retryCount} | Lead: ${persona.title}

## Objective
Fix previous quarantine failures and complete the original task:
${taskDescription}

## Mandatory Corrective Directives (Must Comply)
${correctiveDirectives.join('\n')}

## Non-Negotiable Invariants
1. Do NOT modify any files in .github/workflows/
2. Limit edits to maximum 3 files and <= 300 total diff lines
3. Conventional Commits format: fix(scope): description [Built on SIP]
4. Adhere to technical anchors:
${technicalAnchors.map(a => `   - ${a}`).join('\n')}
`;
}

export function engineerJulesPrompt({
  repo,
  taskDescription,
  issueNumber = null,
  repoProfile = {},
  taskType = 'feature',
  scopeFiles = [],
  antiPatterns = [],
}) {
  const repoName = repo.includes('/') ? repo.split('/')[1] : repo;
  const targetBranch = repoProfile.targetBranch || 'main';
  const qualityGate = repoProfile.qualityGate || 'npm test';

  // 1. Architect Preflight
  const arch = architectPreflight({ repo, taskDescription, repoProfile });
  if (!arch.approved) {
    throw new Error(`Council preflight blocked by Architect: ${arch.blockers.join('; ')}`);
  }

  // 2. Select Starlight Persona
  const persona = selectPersona(taskType, taskDescription, repoProfile);

  // 3. Sage Memory Retrieval (Operational & Technical Vaults)
  const taskKeywords = [
    repoProfile.type || '',
    ...(taskDescription.toLowerCase().match(/\b(nextjs|react|tailwind|sqlite|mcp|accessibility|keyboard|button|cls|hydration|performance|seo|cache|gateway|palace|blueprint)\b/g) || [])
  ];
  const pastMemories = consultSageMemory(repo, taskKeywords);

  let prompt = `# Jules Autonomous Execution Card: ${repoName}\n`;
  prompt += `> Assigned Council Lead: **${arch.assignedLead}** | Persona: **${persona.title}** | Task Mode: **${taskType.toUpperCase()}**\n\n`;

  prompt += `## Role & Directive\n`;
  prompt += `You are operating as the **${persona.title}** governed by the Starlight Queen and Specialist Council.\n`;
  prompt += `Mission: ${persona.mission}\n\n`;

  prompt += `## Objective\n`;
  if (issueNumber) {
    prompt += `Address and resolve GitHub Issue #${issueNumber}:\n`;
  }
  prompt += `${taskDescription.trim()}\n\n`;

  prompt += `## Persona Craft & Standards\n`;
  for (const p of persona.principles) {
    prompt += `- ${p}\n`;
  }
  prompt += `\n`;

  prompt += `## Base Branch & Hygiene\n`;
  prompt += `- Start strictly from \`origin/${targetBranch}\`.\n`;
  prompt += `- Do not rewrite unrelated abstractions or refactor untouched modules.\n`;
  prompt += `- Maintain strict backward compatibility for all existing exported APIs and interfaces.\n\n`;

  if (scopeFiles && scopeFiles.length > 0) {
    prompt += `## Scope of Work (Target Files)\n`;
    for (const file of scopeFiles) {
      prompt += `- \`${file}\`\n`;
    }
    prompt += `\n`;
  }

  if (arch.invariants && arch.invariants.length > 0) {
    prompt += `## Architect Invariants\n`;
    for (const inv of arch.invariants) {
      prompt += `- ${inv}\n`;
    }
    prompt += `\n`;
  }

  if (pastMemories && pastMemories.length > 0) {
    prompt += `## Institutional Memory & Proven Patterns (Sage Vaults)\n`;
    for (const mem of pastMemories) {
      if (mem.type === 'proven_pattern') {
        prompt += `- **Proven Architectural Pattern**: ${mem.summary}\n`;
      } else {
        prompt += `- **Operational Lesson** (${mem.action}): ${mem.summary}\n`;
      }
    }
    prompt += `\n`;
  }

  // Frontier Technical Anchors (Next.js 15/16, React 19, Node 24, SIP)
  const technicalAnchors = getFrontierTechnicalAnchors(repoProfile);
  if (technicalAnchors && technicalAnchors.length > 0) {
    prompt += `## Frontier Technical Standards (Next.js 16 / React 19 / Node 24)\n`;
    for (const ta of technicalAnchors) {
      prompt += `- ${ta}\n`;
    }
    prompt += `\n`;
  }

  prompt += `## Non-Negotiable Negative Constraints (Sentinel & Council Gates)\n`;
  prompt += `1. **CRITICAL WORKFLOW LOCK**: NEVER modify or add files under \`.github/workflows/**\`. Any modification to GitHub Actions workflows triggers an immediate Sentinel veto and quarantine.\n`;
  prompt += `2. **CRITICAL DEPENDENCY LOCK**: NEVER add \`git://\` or \`http://\` URLs or unvetted external dependencies into \`package.json\`.\n`;
  prompt += `3. **CRITICAL BOUNDS**: Keep the patch surgical (strictly <= 5 files modified and <= 350 total diff lines).\n`;
  prompt += `4. **ZERO SECRET LEAKAGE**: Never commit, mock, or hardcode environment variables, API tokens, or secrets.\n\n`;

  prompt += `## Engineering & Quality Gates\n`;
  prompt += `1. **Surgical Diffs**: Modify ONLY files directly relevant to the objective. No gratuitous reformatting.\n`;
  prompt += `2. **Empirical Verification**: You MUST run and pass verification before finishing: \`${qualityGate}\`.\n`;
  prompt += `3. **Test Coverage**: If modifying or adding logic, include corresponding automated unit/integration tests.\n`;
  prompt += `4. **Conventional Commits**: Format commit subjects as \`feat(...)\`, \`fix(...)\`, or \`refactor(...)\` with a clear why-rationale.\n`;

  if (antiPatterns && antiPatterns.length > 0) {
    prompt += `\n## Prohibited Anti-Patterns\n`;
    for (const ap of antiPatterns) {
      prompt += `- Avoid: ${ap}\n`;
    }
  }

  prompt += `\n## Completion Requirement\n`;
  prompt += `When done, ensure the build passes cleanly with no warnings or type errors. Open a Pull Request or generate the clean patch ready for auto-merge.`;

  return prompt;
}
