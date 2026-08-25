# Starlight Skill Ecosystem & Multi-Platform Architecture Strategy

> *"Write once in sovereign clarity. Compile and distribute to every coding agent in the world."*

---

## 1. Executive Summary & Core Mandate

### Is Starlight Intelligence System (SIS) the Canonical SSOT or just for Antigravity?

**Starlight Intelligence System (SIS) is the sovereign, canonical Single Source of Truth (SSOT)** for Frank's entire intelligence stack. SIS skills are **not** just for Antigravity. They represent the foundational cognitive capabilities, memory protocols, orchestration topologies, and domain intelligence across FrankX, Arcanea, and Starlight.

Every coding agent harness—whether **Google Antigravity, Claude Code, Cursor, OpenAI Codex, Gemini CLI, OpenCode, Grok, or Cline**—consumes the exact same core intelligence, compiled from SIS into its native format.

```
┌────────────────────────────────────────────────────────────────────────┐
│               CANONICAL SSOT: STARLIGHT-INTELLIGENCE-SYSTEM           │
│                                                                        │
│  ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐ │
│  │    87 SIS SKILLS   │ │  6 MEMORY VAULTS   │ │  144 AGENT PROFILES│ │
│  │ (agentskills.io)   │ │ (JSONL + FTS5 RRF) │ │ (AGENT_REGISTRY.md)│ │
│  └────────────────────┘ └────────────────────┘ └────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                        [Universal Skill Exporter]
                     (node scripts/export-skills.ts)
                                    │
         ┌──────────────┬───────────┴───┬──────────────┬──────────────┐
         ▼              ▼               ▼              ▼              ▼
  ┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
  │ ANTIGRAVITY  ││ CLAUDE CODE  ││ CURSOR IDE   ││ OPENAI CODEX ││ MARKETPLACE  │
  │.gemini/      ││~/.claude/    ││.cursor/rules/││.agents/      ││starlight-    │
  │plugins/      ││skills/       ││*.mdc (globs) ││skills/       ││marketplace/  │
  │starlight-lib ││              ││              ││AGENTS.md     ││manifest.json │
  └──────────────┘└──────────────┘└──────────────┘└──────────────┘└──────────────┘
```

---

## 2. Monorepo SSOT vs Multi-Repo & Marketplace Distribution

### Architectural Decision: "Monorepo SSOT + Universal Automated Exporter"

To prevent skill drift, duplicated authoring, and out-of-sync agent behaviors, the ecosystem follows a **Central Substrate + Satellite Distribution** topology:

1. **Master Authoring Core (`Starlight-Intelligence-System`)**:
   - All skill logic, procedure definitions, trigger keywords, and quality gates are authored and version-controlled in `skills/`.
   - Continuous verification is enforced via automated tests:
     - `test/v88-agentskills-conformance.test.ts`: Frontmatter, naming, and length standards.
     - `test/v77-skill-rules.test.ts`: Trigger and file existence symmetry.
     - `test/v78-skill-registry.test.ts`: Operational registry table parity.
2. **Automated Platform Compilation (`src/adapters/skill-exporter.ts`)**:
   - A single TypeScript compiler transforms the agnostic canonical skills into each target harness's native idioms:
     - **Antigravity / Gemini CLI**: Directory-shaped skills with `plugin.json` under `.gemini/config/plugins/starlight-skills-library/`.
     - **Claude Code**: Native skills in `~/.claude/skills/` and `.claude-plugin/`.
     - **Cursor**: Rule definitions (`.cursor/rules/*.mdc`) with YAML frontmatter, `alwaysApply`, and file glob bindings.
     - **OpenAI Codex**: Cascading `.agents/skills/` and `AGENTS.md` skill tables.
     - **Cline / Roo-Code**: Instructions in `.clinerules/skills/`.
     - **Starlight Marketplace**: Comprehensive JSON bundle (`dist/marketplace/starlight-skills-manifest.json`) ingested by the Next.js `starlight-marketplace` application.
3. **Public vs Private Publication Boundary**:
   - As defined in `Build-PluginBundles.ps1`, private estate paths, operator secrets, and unreleased IP are scrubbed during bundle creation.
   - Public kits (Founder Command Kit, Revenue Engine Kit, Starlight System Module, Arcanea World Engine) are distributed via GitHub Releases and `starlightintelligence.org/download`.

---

## 3. Frontier 2026 Skills Architecture & Standards

All Starlight skills conform to the world-class **`agentskills.io` open standard** enhanced with Starlight Sovereign Substrate primitives:

### A. 4-Level Progressive Disclosure Token Budget
| Level | Token Weight | Purpose | Loaded When |
|---|:---:|---|---|
| **Level 1: Index** | ~50 tokens | Name, domain, description, trigger keywords | Startup & catalog scan |
| **Level 2: Summary** | ~200 tokens | Activation rationale & capability overview | Intent match verification |
| **Level 3: Core Procedures** | ~500–1000 tokens | Deterministic step-by-step SOPs & invariants | Active task execution |
| **Level 4: Deep Reference** | On-demand | Scripts, JSON schemas, reference docs | Explicit sub-task requirement |

### B. Extended Thinking & Reasoning Model Optimization
- Shifted from rigid micro-management prompts to **goal-oriented invariants & verification criteria**.
- High-reasoning models (Claude 3.7 Sonnet Thinking, o1/o3-mini, Gemini 2.5 Pro Thinking, DeepSeek-R1) are guided by falsifiable quality standards and adversarial self-critique loops (The Santa Method).

### C. Swarm Consensus Sizing & Memory Safety
- **$\le 7$ Consensus Sizing**: Direct debate loops in multi-agent swarms are bounded to a maximum of 7 agents to prevent latency deadlocks and token explosion.
- **Memory Guardian**: Context boundaries and RAM thresholds are validated before spawning parallel subagents.

### D. Impeccable Design & Strict Media Policy
- **Anti-Slop**: Code-first typography and metrics overlays (no AI hallucinated text in images).
- **Strict Higgsfield Ban**: Higgsfield MCP and tools are strictly prohibited. Native Antigravity `generate_image`, NanoBanana (`nb-image`), and Veo native pipelines are the primary visual engines.
- **Modern Web Standard**: Next.js 15 App Router, React 19, Tailwind CSS v4 (`@theme`), and GSAP/Lenis smooth motion.

---

## 4. Operation & Synchronization Runbook

### Synchronizing All Platforms with a Single Command

Whenever a skill is added, updated, or evolved in `Starlight-Intelligence-System`:

```bash
# 1. Validate full conformance and test symmetry
npm test

# 2. Compile and export to all platforms (Antigravity, Claude, Cursor, Codex, Cline, Marketplace)
npm run export:skills
```

### Targeted Export Options
```bash
# Export only to Google Antigravity
npx tsx scripts/export-skills.ts --antigravity

# Export only to Claude Code and Cursor
npx tsx scripts/export-skills.ts --claude --cursor

# Simulate export without disk writes
npx tsx scripts/export-skills.ts --all --dry-run
```

---

*Starlight Intelligence System v8.4.0 — Sovereign Multi-Platform Skills Architecture · 2026-08-25*
