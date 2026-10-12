/**
 * High-Intellect Multi-Agent Prompt Engineer for Jules Cloud Agent
 * Formulates frontier-grade, hardened execution cards integrating
 * the Starlight Specialist Council (Architect, Sentinel, Weaver, Sage).
 *
 * Built on SIP — Starlight Intelligence Protocol.
 */

import { architectPreflight, consultSageMemory } from './council-gate.mjs';

export function engineerJulesPrompt({
  repo,
  taskDescription,
  issueNumber = null,
  repoProfile = {},
  taskType = 'feature',
  scopeFiles = [],
  antiPatterns = [],
  trackToken = '',
}) {
  const repoName = repo.includes('/') ? repo.split('/')[1] : repo;
  const targetBranch = repoProfile.targetBranch || 'main';
  const qualityGate = repoProfile.qualityGate || 'npm test';

  // 1. Architect Preflight
  const arch = architectPreflight({ repo, taskDescription, repoProfile });
  if (!arch.approved) {
    throw new Error(`Council preflight blocked by Architect: ${arch.blockers.join('; ')}`);
  }

  // 2. Sage Memory Retrieval
  const pastMemories = consultSageMemory(repo);

  let prompt = `# Jules Autonomous Execution Card: ${repoName}\n`;
  prompt += `> Assigned Council Lead: **${arch.assignedLead}** | Task Mode: **${taskType.toUpperCase()}**\n\n`;

  prompt += `## Role & Directive\n`;
  prompt += `You are operating as a Staff Autonomous Engineer governed by Starlight Council standards.\n`;
  prompt += `Your mission is to execute the following task with surgical precision, zero architectural regression, and 100% test pass rate.\n\n`;

  prompt += `## Objective\n`;
  if (issueNumber) {
    prompt += `Address and resolve GitHub Issue #${issueNumber}:\n`;
  }
  prompt += `${taskDescription.trim()}\n\n`;

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
    prompt += `## Institutional Memory (Sage Vault Insights)\n`;
    for (const mem of pastMemories) {
      prompt += `- Past lesson (${mem.action}): ${mem.summary}\n`;
    }
    prompt += `\n`;
  }

  const isFrontend = (repoProfile.type || '').includes('nextjs') || repo.includes('website') || repo.includes('app') || repo.includes('studio');
  if (isFrontend) {
    prompt += `## Frontend Architecture & Impeccable Design Anchors\n`;
    prompt += `- **React 19 & Next.js 16 Invariant**: Page/route \`params\` and \`searchParams\` are Promises; must be awaited (\`const { slug } = await params;\`).\n`;
    prompt += `- **Server Actions**: Prefer Next.js Server Actions over REST endpoints for mutations; use \`useTransition\` / \`useActionState\` for non-blocking UI.\n`;
    prompt += `- **Tailwind v4**: Leverage CSS variables and \`@theme\` tokens. Follow tactile luxury obsidian deep canvas register.\n`;
    prompt += `- **Tree-Shaking**: Import Lucide icons individually (e.g. \`import { ArrowRight } from 'lucide-react'\`) to prevent bundle bloat.\n`;
    prompt += `- **Accessibility (A11y)**: Semantic HTML first, visible focus rings, 44px+ touch targets, \`aria-live\` for dynamic updates.\n`;
    prompt += `- **Zero Layout Shift (CLS)**: Explicit dimensions/aspect-ratio on all media; no late-loading visual jumps.\n\n`;
  }

  prompt += `## Editorial & Anti-Slop Standards (@humanizer)\n`;
  prompt += `- **Voice**: Sentence case for headings and buttons; direct, technical, warm, playful.\n`;
  prompt += `- **Metrics Truth**: Never hardcode unverified vanity numbers (e.g. "10,000+ creators"); use exact verified metrics or honest descriptive copy.\n`;
  prompt += `- **Zero Prestige AI Slop**: Forbid filler terms ('delve', 'tapestry', 'testament to', 'beacon of', 'revolutionize', 'elevate', 'seamlessly', 'game-changer').\n\n`;

  prompt += `## Non-Negotiable Negative Constraints (Sentinel Gates)\n`;
  prompt += `1. **WORKFLOW LOCK**: NEVER modify or add files under \`.github/workflows/**\` without explicit direction.\n`;
  prompt += `2. **DEPENDENCY LOCK**: NEVER add unpinned or git/http npm packages to \`package.json\`; always preserve lockfile integrity.\n`;
  prompt += `3. **SURGICAL BOUNDS**: Keep diff strictly bounded to relevant files (<= 5 files, <= 350 lines).\n`;
  prompt += `4. **ZERO SECRET LEAKAGE**: Never hardcode API keys, tokens, or environment secrets.\n\n`;

  prompt += `## Engineering & Quality Gates\n`;
  prompt += `1. **Surgical Diffs**: Modify ONLY files directly relevant to the objective. No gratuitous reformatting.\n`;
  prompt += `2. **Empirical Verification**: You MUST run and pass verification before finishing: \`${qualityGate}\`.\n`;
  prompt += `3. **Zero Secret Leakage**: Never expose, commit, or mock environment variables, API tokens, or credentials.\n`;
  prompt += `4. **Test Coverage**: If modifying or adding logic, include corresponding automated unit/integration tests.\n`;
  prompt += `5. **Conventional Commits**: Format commit subjects as \`feat(...)\`, \`fix(...)\`, or \`refactor(...)\` with a clear why-rationale.\n`;

  if (antiPatterns && antiPatterns.length > 0) {
    prompt += `\n## Prohibited Anti-Patterns\n`;
    for (const ap of antiPatterns) {
      prompt += `- Avoid: ${ap}\n`;
    }
  }

  prompt += `\n## Completion Requirement\n`;
  prompt += `When done, ensure the build passes cleanly with no warnings or type errors.\n`;
  prompt += `Open one pull request against \`${targetBranch}\`. Do not merge it. Do not mark a draft ready.\n`;
  if (trackToken) {
    prompt += `Include this exact token in the pull request title: \`${trackToken}\`.\n`;
  }

  return prompt;
}
