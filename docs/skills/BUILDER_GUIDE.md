# Starlight Skill Economy — Builder & Developer Handbook

> The definitive guide to authoring, auditing, valuing, compiling, and syndicating autonomous agent skills across 10 developer harnesses and multi-marketplace ecosystems.
> Built on the **Starlight Intelligence Protocol (SIP v1.1.1)**.

---

## Table of Contents

1. [Executive Summary & Philosophy](#1-executive-summary--philosophy)
2. [The 6-Mind Multi-Agent Skill Council](#2-the-6-mind-multi-agent-skill-council)
3. [Architecture & The 3-Level Progressive Disclosure](#3-architecture--the-3-level-progressive-disclosure)
4. [Standard Directory & Package Structure](#4-standard-directory--package-structure)
5. [Authoring a Sovereign Skill Step-by-Step](#5-authoring-a-sovereign-skill-step-by-step)
6. [The 5-Stage Skill Maturation Continuum](#6-the-5-stage-skill-maturation-continuum)
7. [Workspace Discovery & Inspection Scanner](#7-workspace-discovery--inspection-scanner)
8. [Empirical Valuation & Fair Market Pricing Engine](#8-empirical-valuation--fair-market-pricing-engine)
9. [Context Headroom Budgeting & The Agent Matrix](#9-context-headroom-budgeting--the-agent-matrix)
10. [10-Harness Native Compilation Matrix](#10-10-harness-native-compilation-matrix)
11. [Multi-Marketplace Syndication & SIP Attestation](#11-multi-marketplace-syndication--sip-attestation)
12. [CLI Command Reference & Automated Workflows](#12-cli-command-reference--automated-workflows)

---

## 1. Executive Summary & Philosophy

In modern autonomous multi-agent environments, skills represent the **decoupled capability layer**. Rather than hardcoding distinct tool integrations and specialized behavioral logic into static agent prompts, skills encapsulate capabilities as modular, verifiable, and sovereign packages.

### Why the Starlight Skill Substrate Matters
* **Zero Context Exhaustion**: High-parameter models degrade rapidly when bloated with dozens of unused instruction manuals. Starlight dynamically binds skills based on triggers, preserving up to 80% of context headroom for pure reasoning.
* **Harness Agnostic**: Author once in canonical Starlight format; compile natively for **Claude Code, Codex, Antigravity, Grok, Hermes, Gemini CLI, Cursor, OpenCode, Kilo, and Windsurf**.
* **Empirically Valued**: No guesswork or arbitrary pricing. Skill valuation is computed via deterministic complexity metrics, capability depth, and verified annual labor savings.
* **Sovereign & Attested**: Every syndicated package is stamped with a cryptographic SHA-256 integrity digest and verifiable SIP v1.1.1 provenance footer.

---

## 2. The 6-Mind Multi-Agent Skill Council

The Starlight Skill Council is a specialized 6-agent swarm designed to handle end-to-end skill lifecycle management.

```
                    ┌───────────────────────────────────┐
                    │     Skill Council Lead            │
                    │   (starlight-skill-council-lead)  │
                    └─────────────────┬─────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
┌────────┴────────┐          ┌────────┴────────┐          ┌────────┴────────┐
│ Skill Architect │          │  Skill Auditor  │          │  Valuation Spec │
│  (Authoring &   │          │ (Verification & │          │ (ROI & Pricing  │
│  Progressive)   │          │ Context Limits) │          │    Engine)      │
└─────────────────┘          └─────────────────┘          └─────────────────┘
                                      │
         ┌────────────────────────────┴────────────────────────────┐
         │                                                         │
┌────────┴────────┐                                       ┌────────┴────────┐
│  Harness Tuner  │                                       │   Marketplace   │
│  (10-Harness    │                                       │   Syndicator    │
│  Compilation)   │                                       │  (Cross-Market) │
└─────────────────┘                                       └─────────────────┘
```

1. **Skill Council Lead (`starlight-skill-council-lead`)**: Orchestrates the multi-agent council, conducts capability gap assessments, and routes skill requests.
2. **Skill Architect (`starlight-skill-architect`)**: Structures skills into canonical 3-level progressive disclosure packages, enforces token budgets, and crafts deterministic instructions.
3. **Skill Auditor (`starlight-skill-auditor`)**: Evaluates token consumption, checks security and zero-trust permissions, runs automated evals, and grades maturity stages (0-4).
4. **Skill Valuation Specialist (`starlight-skill-valuation-specialist`)**: Calculates execution complexity, capability depth, labor savings ROI, and derives multi-tier pricing strategies.
5. **Harness Tuner (`starlight-harness-tuner`)**: Compiles canonical skills into native configs and command hooks for all 10 developer harnesses.
6. **Marketplace Syndicator (`starlight-marketplace-syndicator`)**: Bundles skills for external ecosystems (OpenClaw, AgentSkills, Claude, OpenAI, Starlight Hub) with immutable SIP attestations.

---

## 3. Architecture & The 3-Level Progressive Disclosure

To prevent LLM context saturation, every Starlight skill is architected across three distinct levels of disclosure:

```
┌─────────────────────────────────────────────────────────────┐
│ Level 1: System-Level Discovery (~50 - 150 tokens)          │
│ • YAML Frontmatter (name, version, domain, triggers)        │
│ • 1-2 sentence description indexed in agent prompt or table │
├─────────────────────────────────────────────────────────────┤
│ Level 2: Intent Activation (~800 - 1,500 tokens)            │
│ • Operational Mission & Invariants                          │
│ • Deterministic step-by-step instructions & workflows       │
│ • Bound conditionally when keywords or file rules trigger   │
├─────────────────────────────────────────────────────────────┤
│ Level 3: Execution Deep-Dive (On-Demand / Unlimited)        │
│ • Executable helper scripts (`scripts/`)                    │
│ • Detailed schema specs & references (`references/`)        │
│ • Automated test suites & validation benchmarks (`evals/`)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Standard Directory & Package Structure

Skills within the Starlight ecosystem can be authored as lightweight flat markdown files or full modular directory packages.

### Modular Directory Package (Recommended for Commercial & Production Skills)

```
skills/<domain>/<skill-name>/
├── SKILL.md                 # Primary canonical specification (Levels 1 & 2)
├── scripts/                 # Deterministic execution tools (Level 3)
│   ├── run-audit.ts
│   └── test-harness.mjs
├── references/              # Architectural schemas, RFCs, and API docs (Level 3)
│   ├── schema.v1.json
│   └── invariants.md
└── evals/                   # Test cases and quality benchmarks (Level 3)
    ├── test-cases.json
    └── eval-runner.ts
```

### Flat Markdown Format (Ideal for Single-Purpose & Utility Skills)

```
skills/<domain>/<skill-name>.md
```

---

## 5. Authoring a Sovereign Skill Step-by-Step

### Step 1: Define YAML Frontmatter
Every `SKILL.md` must begin with a well-formed YAML frontmatter block containing metadata, triggers, token constraints, and permission boundaries:

```markdown
---
name: "safety/secret-detector"
version: "1.0.0"
description: "Zero-trust PII and credential scrubbing gateway for outbound agent payloads."
domain: "safety"
author: "Starlight Security Council"
license: "MIT"
contextBudgetTokens: 1200
triggers:
  keywords:
    - "api_key"
    - "sanitize"
    - "secret"
    - "credential"
  files:
    - "src/gateway/**"
    - "config/keys.json"
  agents:
    - "sentinel"
    - "prime"
permissions:
  terminal: "read-only"
  filesystem: "read-write"
  network: "none"
syndication:
  starlightHub: true
  openClaw: true
  agentSkills: true
  claudePlugin: true
  openAiAction: true
---
```

### Step 2: Write Direct, Deterministic Instructions
Avoid conversational fluff, filler words, or vague advice. Use active voice, clear preconditions, and exact behavioral rules.

```markdown
# Secret Detector & Sanitization Gateway

> Zero-trust PII and credential scrubbing gateway for outbound agent payloads.

## Invariants
1. Never transmit raw unmasked strings matching high-entropy API tokens (AWS, OpenAI, Anthropic, GitHub).
2. Replace detected secrets with deterministic token hashes: `[SCRUBBED:<PROVIDER>:<SHA256_PREFIX_6>]`.
3. Terminate transmission immediately if an unclassified cryptographic private key is detected.

## Execution Workflow
1. **Pre-Transmission Scan**: Intercept the outbound payload before it touches network transport.
2. **Regex & Entropy Analysis**: Execute the high-entropy regex test against the buffer.
3. **Redaction & Logging**: Write the scrubbed event to `ops/sanitization.log`.
```

### Step 3: Implement Reusable Scripts
Add executable Node/TypeScript, Python, or shell utilities to `scripts/` to offload complex token-heavy tasks to local deterministic runtimes.

---

## 6. The 5-Stage Skill Maturation Continuum

Starlight evaluates skills along a 5-stage maturation continuum:

| Stage | Name | Description | Commercial Readiness |
| :---: | :--- | :--- | :---: |
| **0** | **Scratchpad** | Ad-hoc text snippet, prompt draft, or unvalidated notes. No frontmatter. | 0% – 20% |
| **1** | **Structured** | Formatted markdown with basic headers, instructions, and standard naming. | 20% – 45% |
| **2** | **Modular Package** | Valid YAML frontmatter, context token budget, keywords, and domain classification. | 45% – 70% |
| **3** | **Tested & Automated** | Includes executable `scripts/`, reference schemas, and passing `evals/` test cases. | 70% – 85% |
| **4** | **Sovereign Syndicated** | Full commercial packaging, dual-licensing, SIP v1.1.1 attestation, multi-market manifests. | 85% – 100% |

---

## 7. Workspace Discovery & Inspection Scanner

The Starlight Workspace Scanner (`src/skills/skill-scanner.ts`) inspects any local folder or repository to inventory skills, determine token overhead, and identify maturation gaps.

```bash
# Scan a directory of skills
starlight skills scan skills/safety

# Output includes:
# - Total files scanned & skills discovered
# - Maturation stage breakdown (Stage 0 to Stage 4)
# - Token overhead analysis
# - Actionable improvement warnings
```

---

## 8. Empirical Valuation & Fair Market Pricing Engine

Starlight rejects arbitrary pricing. The Valuation Engine (`src/skills/valuation-pricing-engine.ts`) calculates economic value using three deterministic pillars:

$$\text{Valuation Index} = \text{Capability Depth} \times \text{Execution Complexity Multiplier} \times \text{Labor Savings Factor}$$

### The Valuation Formula Broken Down

1. **Capability Depth Score ($0 - 100$)**:
   - Assesses frontmatter completeness, instruction richness, workflow branching, error recovery protocols, and reference documentation.
2. **Execution Complexity Multiplier ($1.0 - 2.5$)**:
   - Evaluates whether the skill is pure prompt guidance ($1.0$), automated script runner ($1.4$), multi-step agent orchestrator ($1.8$), or zero-trust cryptographic protocol ($2.2+$).
3. **Annual Labor Savings ($USD$)**:
   $$\text{Savings} = (\text{Estimated Weekly Hours Saved}) \times 50 \text{ weeks} \times \$125/\text{hr (standard engineering rate)}$$

### Pricing Tier Derivation

* **Free Community MSRP**: $\$0$ (Always permissive open source MIT license).
* **Builder Tier (Single Seat)**: $\$19 - \$49$ one-time lifetime license.
* **Pro Tier (Advanced Solo / Consultant)**: $\$49 - \$149$ one-time license with scripts and updates.
* **Team Tier (5-15 Seats)**: $\$99 - \$299/\text{month}$ with centralized telemetry and compliance.
* **Enterprise Tier (Unlimited / Sovereign Org)**: $\$1,200 - \$10,000/\text{year}$ with source escrow, SLA, and custom harness tuning.

```bash
# Audit valuation for a skill
starlight skills value skills/safety/secret-detector/SKILL.md
```

---

## 9. Context Headroom Budgeting & The Agent Matrix

Loading all workspace skills into every agent destroys reasoning capability. Starlight provides the **Skill Matrix Engine** (`src/skills/skill-matrix.ts`) to dynamically assign skills and enforce context headroom.

```
Agent Context Capacity: 100%
┌───────────────────────────────────────┬───────────────────────────┐
│     Assigned Skills Static Load       │ Dynamic Reasoning Headroom│
│     (Strictly Capped at 15-30%)       │       (70% - 85%)         │
└───────────────────────────────────────┴───────────────────────────┘
```

```bash
# Calculate agent matrix and headroom allocation
starlight skills matrix
```

---

## 10. 10-Harness Native Compilation Matrix

Starlight compiles universal skills into the exact native configuration syntax required by all 10 frontier agent harnesses:

| Harness Target | Primary Output File | Config Format | Activation Style |
| :--- | :--- | :--- | :--- |
| **Claude Code** | `.claude/config.json`, `.claude/commands/*.md` | JSON + MD | Direct `/command` execution + MCP tool mapping |
| **OpenAI Codex** | `.codex/skills.json` | JSON Schema | OpenAI AgentKit tool schema with typing |
| **Antigravity** | `.antigravity/skills.json`, `skills-hooks.md` | JSON + MD | Native auto-hooks on keyword/file match |
| **Grok CLI** | `grok-skills.json` | JSON | Grok harness trigger bindings |
| **Hermes** | `hermes-skills.json` | JSON | Fast Rust/TS agent runner entrypoints |
| **Gemini CLI** | `gemini-skills.json` | JSON | Prompt contracts & tool declarations |
| **Cursor** | `.cursorrules` | Markdown | Agent behavioral contract with embedded rules |
| **OpenCode** | `opencode.skills.json` | JSON | Workspace skill manifests |
| **Kilo** | `kilo.config.json` | JSON | Kilo engine active skill bindings |
| **Windsurf** | `.windsurfrules` | Markdown | Cascade rules and contextual guidance |

```bash
# Compile skills for a specific harness
starlight skills harness claude-code
starlight skills harness antigravity
starlight skills harness codex
```

---

## 11. Multi-Marketplace Syndication & SIP Attestation

When a skill reaches Stage 4 (Sovereign Syndicated), it can be syndicated across 5 leading skill marketplaces simultaneously:

1. **Starlight Hub**: `starlight-manifest.json` (canonical SIP registry).
2. **OpenClaw**: `claw.json` (OpenClaw capability manifest).
3. **AgentSkills (npm)**: `package.json` (distributable NPM package with types).
4. **Anthropic Claude Plugins**: `.claude-plugin.json` (Claude plugin registry).
5. **OpenAI Actions**: `openapi.json` (REST OpenAPI 3.1 specification).

### The Verifiable SIP Attestation Footer
Every syndicated package includes an immutable cryptographic proof:

```markdown
---
Built on SIP — Starlight Intelligence Protocol v1.1.1
- Skill: safety/secret-detector v1.0.0
- Domain: safety
- Author: Starlight Security Council
- License: MIT
- Integrity SHA256: 3c7a9b0...f42
- Substrate: starlightintelligence.org/protocol
Generated: 2026-10-11T12:00:00.000Z
---
```

```bash
# Syndicate a skill across all target marketplaces
starlight skills syndicate skills/safety/secret-detector/SKILL.md
```

---

## 12. CLI Command Reference & Automated Workflows

All skill economy functions are accessible via the `starlight skills` CLI subsystem:

```bash
# 1. Scan a folder of skills
starlight skills scan [directory]

# 2. Audit economic valuation and suggested pricing
starlight skills value <path/to/SKILL.md>

# 3. Compute agent-skill allocation matrix and context headroom
starlight skills matrix

# 4. Generate native configuration for a specific harness
starlight skills harness <harness-name>

# 5. Build multi-marketplace distribution bundle with SIP attestation
starlight skills syndicate <path/to/SKILL.md>
```

---

*Starlight Intelligence System — The Sovereign Intelligence Substrate.*
*Built on SIP v1.1.1 · MIT License*
