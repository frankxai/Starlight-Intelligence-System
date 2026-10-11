# Starlight Intelligence System — SKILLS.md

> **Universal Skill Protocol, Matrix Architecture, and Sovereign Monetization Standard for Agentic Swarms.**  
> Built on the Starlight Intelligence Protocol (SIP) — Sovereign Substrate v1.1.1.

`SKILLS.md` is the macro-level specification for all intelligence skills across the Starlight ecosystem, partner harnesses, and open agent networks. It provides the foundational contract for how skills are structured, context-budgeted, evaluated, syndicated, and monetized without developer lock-in.

---

## 1. Foundational Architecture

In traditional AI setups, agents suffer from two compounding failure modes:
1. **Context Window Exhaustion (Prompt Bloat):** Shoveling dozens of monolithic instructions into system prompts burns tokens, induces attention degradation, degrades reasoning accuracy, and increases inference cost.
2. **Harness Fragmentation:** Skills written for Claude Code fail in Cursor; skills for OpenAI AgentKit fail in Hermes; Antigravity hooks do not map to Grok CLI.

**Starlight Skill Architecture** solves this through three core pillars:
- **Separation of Skill Definition and Execution Harness:** A skill is an immutable capability definition consisting of declarative metadata, prompt contracts, progressive disclosure leaves, and deterministic tools.
- **Dynamic Context Budgeting & Necessity Gating:** Agents do not load every skill at boot. Skills activate strictly through semantic triggers, file path matchers, or intent classifiers with guaranteed token quotas.
- **Sovereign Maturation & Monetization Continuum:** Developers can evolve private workspace hacks into open community drivers, and subsequently package production-grade intelligence into premium, commercial recurring revenue streams.

---

## 2. Universal Skill Specification (Directory Standard)

A SIP-compliant skill follows a modular, progressive-disclosure directory layout:

```text
skills/<domain>/<skill-name>/
├── SKILL.md                 # Canonical contract: YAML frontmatter + prompt/instructions
├── manifest.json            # Machine-readable metadata, dependencies, licensing & permissions
├── scripts/                 # Deterministic execution tools (Node.js, TypeScript, Python, Bash)
├── references/              # Progressive disclosure knowledge leaves (loaded on demand only)
├── templates/               # Reusable code, prompt, or artifact templates
└── evals/                   # Ground-truth test fixtures, verification assertions, and benchmarks
```

### 2.1 The Canonical `SKILL.md` Contract

Every `SKILL.md` file MUST open with strict YAML frontmatter:

```yaml
---
name: "systematic-debugging"
version: "1.0.0"
description: "Use when encountering any bug, test failure, or unexpected behavior before proposing fixes."
domain: "code-intelligence"
license: "MIT"
tier: "core"
author: "FrankX AI Systems"
context_budget_tokens: 1200
triggers:
  keywords: ["bug", "error", "failing test", "regression", "stacktrace"]
  files: ["test/**", "src/**", "*.test.ts", "*.spec.ts"]
  intents: ["diagnose_issue", "fix_broken_build"]
permissions:
  terminal: "read-write"
  filesystem: "read-write"
  network: "none"
  secrets: "none"
syndication:
  openclaw: true
  agentskills: true
  claude_plugin: true
  openai_action: true
  starlight_hub: true
---
```

### 2.2 Progressive Disclosure Standard

Skills must never dump extensive documentation into the initial agent context.
- **Level 1 (Metadata & Triggers):** ~50 tokens. Loaded during initial swarm routing.
- **Level 2 (Active System Instructions):** 500–1,500 tokens. Injected when trigger conditions match.
- **Level 3 (Progressive Leaves in `references/`):** Loaded dynamically via tool call only when the agent explicitly encounters deep domain tasks (e.g., specific protocol schemas, advanced edge cases).

---

## 3. The Multi-Harness Universal Matrix

Starlight skills run natively across 10 frontier harnesses with zero rewrite:

| Harness | Primary Target | Starlight Adapter Binding |
|---|---|---|
| **Claude Code** | `.claude/config.json`, `.claude/commands/` | Native subcommands & tool plane MCP bridges |
| **OpenAI Codex / AgentKit** | `.codex/skills.json`, OpenAPI schema | Function calling manifests & runtime JSON tools |
| **Antigravity** | Workspace auto-hooks & native tools | Native MCP lazy-loading, Santa loop, & memory sync |
| **Grok CLI / xAI** | Grok harness adapter | Native CLI wrapper & tool execution matrix |
| **Hermes Agent Runner** | Hermes task runtime | Zero-token bootstrap helper & cross-repo indexing |
| **Gemini CLI** | Gemini extensions & prompts | System instruction injection & function declaration |
| **Cursor** | `.cursorrules`, `.cursor/rules/*.mdc` | Semantic file-scoped rule injection |
| **OpenCode** | OpenCode workspace extensions | Local command hooks & JSONL event sync |
| **Kilo** | Autonomous coding runner | Headless step evaluation & AST tooling |
| **Windsurf** | Cascade memories & rules | Fast contextual workspace rule packs |

---

## 4. The 5-Stage Skill Maturation Continuum

Every builder journey moves through 5 distinct maturity levels:

```
[ Stage 0: Scratchpad ] ➔ [ Stage 1: Local Skill ] ➔ [ Stage 2: Team Swarm ] ➔ [ Stage 3: Verified Free ] ➔ [ Stage 4: Premium Sovereign ]
      Quick prompt              Standard frontmatter         Role & token budgeted        OpenClaw / Community       Starlight Hub / Commercial
```

1. **Stage 0: Scratchpad / Raw Prompt**
   - Ad-hoc markdown notes, system prompts copied between chat windows, unversioned hacks.
2. **Stage 1: Validated Workspace Skill**
   - Standardized `SKILL.md` with explicit triggers, tested against local developer tasks.
3. **Stage 2: Team Swarm Asset**
   - Multi-agent permission boundaries defined, token consumption capped, regression-tested in CI/CD.
4. **Stage 3: Verified Free Community Pack**
   - Distributed freely to open marketplaces (AgentSkills.io, Claude Plugins, OpenClaw) to build audience, drive brand trust, and establish ecosystem authority.
5. **Stage 4: Premium Sovereign Pack**
   - Cryptographically attested, empirical ROI audited (time saved + token efficiency), commercial license, distributed via Starlight Sovereign Marketplace and global stores for recurring revenue.

---

## 5. The Multi-Agent Skill Council

To automate skill curation, context optimization, and monetization, Starlight deploys a dedicated 6-mind Skill Council:

```
                         ┌───────────────────────────────┐
                         │     STARLIGHT SKILL COUNCIL   │
                         └──────────────┬────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
 ┌──────▼──────┐                 ┌──────▼──────┐                 ┌──────▼──────┐
 │  SKILL      │                 │  HARNESS    │                 │  SKILL      │
 │  ARCHITECT  │                 │  TUNER      │                 │  SCANNER    │
 │ Context &   │                 │ 10-Harness  │                 │ Workspace & │
 │ Matrix Plan │                 │ Config Gen  │                 │ Skin Discovery│
 └──────┬──────┘                 └──────┬──────┘                 └──────┬──────┘
        │                               │                               │
 ┌──────▼──────┐                 ┌──────▼──────┐                 ┌──────▼──────┐
 │  SKILL      │                 │  VALUATION  │                 │ MARKETPLACE │
 │  MONETIZER  │                 │  AUDITOR    │                 │ SYNDICATOR  │
 │ Packaging & │                 │ Depth, ROI, │                 │ Distribution│
 │ Pricing Tier│                 │ Math Audit  │                 │ & Gateway   │
 └─────────────┘                 └─────────────┘                 └─────────────┘
```

1. **`starlight-skill-architect`**: Calculates total swarm context footprint, matches agent roles to justified skills, and prevents token exhaustion.
2. **`starlight-harness-tuner`**: Converts universal skill packages into native configurations across all 10 developer harnesses.
3. **`starlight-skill-scanner`**: Crawls developer workspaces, dotfiles, and prompt repos to discover custom workflows and extract skill candidates.
4. **`starlight-skill-monetizer`**: Structures free vs. pro tiers, bundles, licensing models, and commercial conversion funnels.
5. **`starlight-skill-valuation-auditor`**: Runs empirical audits calculating capability depth, execution complexity, token savings ROI, and market-justified pricing.
6. **`starlight-marketplace-syndicator`**: Builds compliant distribution bundles, verifies checksums, attaches SIP attestations, and syndicates to public and sovereign marketplaces.

---

## 6. Empirical Valuation & Value-Based Pricing

Pricing is never arbitrary. The Starlight Valuation Engine computes fair market pricing using five measurable dimensions:

$$\text{Valuation Index} = \left(\frac{\text{Capability Depth (0-100)}}{10}\right) \times \text{Complexity Multiplier} \times \left(1 + \frac{\text{Hours Saved/Wk}}{5}\right) \times \text{Token Efficiency Ratio}$$

### 6.1 Pricing Tiers

- **Free Tier ($0 / Free Forever):** Foundational utilities, community starter packs, and educational skills. Maximizes top-of-funnel reach.
- **Individual / Builder ($19–$49 one-time or $9/mo):** Specialized workflows, automated refactorings, multi-step code generation.
- **Pro / Agency ($79–$199 one-time or $29–$49/mo):** Multi-model orchestration, production CI/CD automation, complex domain engineering (Crypto, Marine, Energy, Legal).
- **Team / Swarm ($299–$699/mo):** Fleet-wide multi-agent coordination, distributed memory synchronization, high-frequency execution pipelines.
- **Enterprise Sovereign ($1,500–$10,000+/yr):** Bespoke enterprise system bridges, strict air-gapped zero-trust execution, custom SIP attestation and compliance guarantees.

---

## 7. Multi-Marketplace Syndication Workflow

Developers build once in the Starlight directory standard and publish everywhere:

```text
Starlight Universal Skill Package
             │
             ├──► OpenClaw Standard (.claw / openclaw registry)
             ├──► AgentSkills.io Community Repo
             ├──► Claude Code Plugin & Tool Directory
             ├──► OpenAI AgentKit & GPT Store Action
             └──► Starlight Sovereign Hub (Direct revenue & Web3/Stripe payout)
```

### 7.1 Publishing CLI Flow

```bash
# 1. Scan your local workspace for custom skills and skins
starlight skills scan ./my-project

# 2. Audit the skill's capability depth, token efficiency, and ROI valuation
starlight skills value ./skills/my-custom-skill

# 3. Optimize harness configuration for your development stack
starlight skills harness claude-code

# 4. Syndicate the skill to open marketplaces and the Starlight Sovereign Hub
starlight skills syndicate ./skills/my-custom-skill --targets openclaw,agentskills,claude,openai,starlight
```

---

## 8. Sovereign Attestation & Attribution Contract

Every syndicated and monetized skill carries an immutable SIP attribution block verifying origin, author sovereignty, and licensing integrity:

```markdown
---
Built on SIP — Starlight Intelligence Protocol v1.1.1
- Skill: <domain>/<skill-name> v<version>
- Author: <author-identifier>
- License: <license-type>
- Attestation: starlightintelligence.org/protocol
- Integrity SHA256: <hash>
---
```

*Build sovereign. Package once. Distribute everywhere. Compound value.*
