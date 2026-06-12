/**
 * Starlight Intelligence System — Grok Adapter
 *
 * Formats vault context as high-context GROK.md emphasizing subagents, MCP,
 * and excellence. Designed for xAI Grok's strengths in parallel subagent
 * orchestration, MCP tool composition, and high-fidelity 99 e2e QA via
 * repo-mastery + gstack conceptual grounding.
 *
 * High context window (200k tokens) enables comprehensive inclusion with
 * explicit excellence framing and subagent delegation patterns.
 */

import type {
  PlatformAdapter, VaultEntry, ContextInjection, VaultType,
} from './types.js';
import { filterAndSort, estimateTokens, truncateToFit } from './utils.js';

export class GrokAdapter implements PlatformAdapter {
  readonly platform = 'grok';
  readonly maxContextTokens = 200_000;

  formatContext(entries: VaultEntry[], options?: {
    maxTokens?: number;
    vaults?: VaultType[];
    includeMetadata?: boolean;
  }): ContextInjection {
    const maxTokens = options?.maxTokens ?? this.maxContextTokens;
    const filtered = filterAndSort(entries, options?.vaults);

    const lines: string[] = [
      '# Starlight Intelligence System — Grok High-Context Context',
      '',
      '> High-context (200k) adapter for Grok. Emphasizes subagent orchestration, MCP fidelity, and excellence as first principle.',
      '> Generated via src/adapters/grok.ts (PlatformAdapter). Use with core/orchestrator/harnesses/grok/ for orchestrator excellence tier.',
      '',
      `> Loaded ${filtered.length} entries across ${new Set(filtered.map(e => e.vault)).size} vaults.`,
      '',
      '## Excellence Mandate',
      '',
      'Every artifact, subagent dispatch, and MCP interaction must pass:',
      '- repo-mastery: deep fidelity to existing SIS patterns (adapters, harnesses, v80 excellence hooks)',
      '- gstack conceptual: Grok-optimized stack (high-ctx + tool chaining + parallel excellence subagents + reflection loops)',
      '- 99% e2e: 99%+ coverage with explicit QA evidence before sign-off',
      '- Ambient "Built on SIP" attestation on all outputs',
      '',
      '## Subagent Orchestration Protocol',
      '',
      'Grok excels at decomposing complex intents into 5-12 focused subagents running in parallel.',
      'Each subagent prompt MUST include:',
      '1. Explicit scope and allowlist reference (see harnesses/grok/allowlisted-tools.md)',
      '2. "You are a Grok subagent under Starlight Orchestrator excellence harness"',
      '3. repo-mastery + gstack directive + confidence + evidence requirement',
      '4. SIP attestation footer mandate',
      '',
      'Synthesis step runs gstack reflection: cross-check vs canonical (agents/skills/vaults/SIP/SIS), flag drift.',
      '',
      '## MCP Excellence',
      '',
      'All MCP usage follows getMcpConfig() shape. Canonical `starlight-substrate`.',
      'No ad-hoc MCP servers. Log every server + purpose. Substrate mutations require board pre-pass.',
      '',
    ];

    let currentVault: VaultType | null = null;
    for (const entry of filtered) {
      if (entry.vault !== currentVault) {
        currentVault = entry.vault;
        lines.push(`## ${entry.vault.charAt(0).toUpperCase() + entry.vault.slice(1)} Vault\n`);
      }
      const meta = [
        entry.confidence ? `confidence: ${entry.confidence}` : null,
        `created: ${entry.createdAt}`,
        entry.tags?.length ? `tags: ${entry.tags.join(', ')}` : null,
      ].filter(Boolean).join(' | ');
      lines.push(`### ${entry.id}\n`);
      lines.push(entry.content);
      lines.push(`\n*${meta}*\n`);
    }

    // Add explicit excellence footer section
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('**Built on SIP** — Starlight Intelligence Protocol v1.1.1');
    lines.push('- Substrate: starlightintelligence.org/protocol');
    lines.push('- Layers used: [file-contract, attestation, sovereignty, subagent-orchestration, mcp, excellence]');
    lines.push('- Adapter: src/adapters/grok.ts (high-context GROK.md)');
    lines.push('- Harness: core/orchestrator/harnesses/grok/');
    lines.push(`- Generated: ${new Date().toISOString().split('T')[0]}`);
    lines.push('');

    const content = truncateToFit(lines.join('\n'), maxTokens);
    return { format: 'markdown', content, tokenEstimate: estimateTokens(content) };
  }

  getMcpConfig(serverCommand: string): Record<string, unknown> {
    return {
      mcpServers: {
        'starlight-substrate': {
          command: 'node',
          args: [serverCommand],
          env: {
            STARLIGHT_MCP_MODE: 'read-write',
            STARLIGHT_HARNESS: 'grok-excellence',
          },
        },
      },
    };
  }

  generateMemoryFile(entries: VaultEntry[]): { filename: string; content: string } {
    const { content } = this.formatContext(entries, { includeMetadata: true });
    return { filename: 'GROK.md', content };
  }

  // Full parity with antigravity/claude adapters (per plan phase 1 + subagent excellence report)
  generateAllAdapterFiles(entries: VaultEntry[]): Array<{ filename: string; content: string; description: string }> {
    const base = this.formatContext(entries, { includeMetadata: true });
    return [
      { filename: 'GROK.md', content: base.content, description: 'High-context memory for Grok TUI/subagents/MCP/image-video + excellence' },
      { filename: 'harnesses/grok/system-prompt.md', content: this.buildSystemPrompt(entries), description: 'Harness system prompt with multi-orchestrator delegation + grok-personal excellence opt-in per SHARING' },
      { filename: 'harnesses/grok/mcp-config.json', content: JSON.stringify(this.getMcpConfig(''), null, 2), description: 'MCP scope: starlight-substrate (canonical)' },
      { filename: 'harnesses/grok/allowlisted-tools.md', content: this.buildAllowlist(), description: 'Allowlisted for read + excellence; image/video via native' },
      { filename: 'harnesses/grok/README.md', content: this.buildHarnessReadme(), description: 'Harness docs + escalation for TUI excellence + SIP' },
    ];
  }

  private buildSystemPrompt(entries: VaultEntry[]): string {
    return `# Grok Harness System Prompt (full parity)

Embody Frank DNA (premium, depth, fun, purpose). Read CLAUDE.md/AGENTS.md/SIP.md/SHARING.md first (deeper wins).

Core shared (MCP/orch/verif/gstack/skill-builder) + grok-personal excellence excellence (repo-mastery/multi-harness-orchestrator/excellence-review/harness-integration + .grok excellence hooks) opt-in only per SHARING.md + SIP §5 encoded-self.

Use subagents (explore/plan/general + personas + worktree/resume), MCP (search_tool/use_tool for github/fs-starlight), image/video native, TUI.

Gates: repo-mastery → excellence-review → santa-method/verification-loop → gstack (if web) → cso if needed. Ambient "Built on SIP". /sip-attest on substrate.

${this.formatContext(entries).content}
`;
  }

  private buildAllowlist(): string {
    return `# Grok Allowlist (core + grok-personal .grok excellence)

Read + excellence: list_dir/read_file/grep/search_replace/run_terminal (pnpm/uv/podman/git/gh/claude/agy/gemini), web_search, MCP (github/fs-starlight/git), image_gen/video_gen, subagents (explore/plan), todo_write.

grok-personal excellence .grok only: excellence gates, multi-harness delegation (core to claude/agy, kenya to .grok), TUI/image/video.

No destructive without guard. Always SIP attest.
`;
  }

  private buildHarnessReadme(): string {
    return `# Grok Harness (TUI + Subagents + MCP + Image/Video + grok-personal excellence)

Full 5-harness parity. See AGENTS.md/CLAUDE.md/SHARING.md/SIP.md.

- Native: TUI/headless, subagents (explore/plan/general + worktree), MCP (config.toml + discovery), image/video (Imagine).
- Excellence: repo-mastery + multi-harness-orchestrator + excellence-review + harness-integration (in .grok/skills, grok-personal per SHARING).
- Delegation: multi-orchestrator outputs exact shell with injected rules + core/kenya filter.
- SIP: /sip-attest + starlight-board for substrate.
- Gaps closed: full generateAll, grok-personal tag filter, image/video sections, cockpit parity.

Run: grok -p "$(cat GROK.md)" --cwd ...
`;
  }
}
