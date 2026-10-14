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
  liveDocs = [],
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

  if (liveDocs && liveDocs.length > 0) {
    prompt += `## Verified Current Library Documentation (Context7 Live Grounding)\n`;
    prompt += `> Verified live against official documentation to eliminate training cutoff hallucinations.\n\n`;
    for (const doc of liveDocs) {
      prompt += `### ${doc.title || doc.libraryId}\n`;
      prompt += `${doc.content}\n\n`;
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

/**
 * Dynamically resolves real-time library documentation via Upstash Context7 MCP/client.
 * Cross-platform: supports local npm resolution, Windows AppData global, and Linux container /usr/local/lib.
 */
export async function resolveContext7Documentation({ query, libraryHint = null, language = 'TypeScript' }) {
  try {
    let context7Module = null;
    const isWindows = process.platform === 'win32';

    // 1. Try standard dynamic import (installed package or symlink)
    try {
      context7Module = await import('@upstash/context7-mcp/dist/lib/api.js');
    } catch {
      // 2. Fall back to platform global paths
      const fallbackPaths = isWindows
        ? [
            'file:///C:/Users/frank/AppData/Roaming/npm/node_modules/@upstash/context7-mcp/dist/lib/api.js',
            'file:///C:/Users/frank/.gemini/antigravity-cli/mcp/context7/dist/lib/api.js'
          ]
        : [
            'file:///usr/local/lib/node_modules/@upstash/context7-mcp/dist/lib/api.js',
            'file:///usr/lib/node_modules/@upstash/context7-mcp/dist/lib/api.js',
            '/home/starlight/.local/share/pnpm/global/5/node_modules/@upstash/context7-mcp/dist/lib/api.js'
          ];

      for (const p of fallbackPaths) {
        try {
          context7Module = await import(p);
          if (context7Module) break;
        } catch {
          // continue to next candidate
        }
      }
    }

    if (!context7Module || !context7Module.searchLibraries || !context7Module.fetchLibraryContext) {
      return null;
    }

    const { searchLibraries, fetchLibraryContext } = context7Module;
    const searchTarget = libraryHint || query;

    // Timeout-guarded resolution (max 4.5s) to prevent blocking swarm loops
    const searchPromise = searchLibraries(query, searchTarget, { transport: 'stdio' });
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Context7 timeout')), 4500));
    const search = await Promise.race([searchPromise, timeoutPromise]);

    const topLib = search.results?.[0];
    if (!topLib) return null;

    const docs = await fetchLibraryContext({
      query,
      libraryId: topLib.id,
      language
    }, { transport: 'stdio' });

    if (docs && docs.data) {
      return {
        libraryId: topLib.id,
        title: topLib.title || topLib.id,
        content: docs.data.slice(0, 3000),
      };
    }
  } catch (err) {
    // Graceful degradation when offline, rate-limited, or unavailable
    return null;
  }
  return null;
}


