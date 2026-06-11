# How Good Is SIS, Truly? — Frontier Assessment & World-Class Plan

> 2026-06-11. Three-stream synthesis: Anthropic ecosystem research + OpenAI/OpenClaw/Hermes research + full SIS repo inventory.
> Honest per the Metrics Truth Rule. Every claim below is either measured, cited, or marked planned.

---

## 1. The honest scorecard — SIS vs the frontier

| Dimension | SIS today | Frontier best | Verdict |
|---|---|---|---|
| **Governance & attestation** | /starlight-board pre-gates, 11-entry attestation ledger, sovereignty clause, Metrics Truth Rule | Nobody ships this. Anthropic recommends "hooks as gates"; no one has a governed substrate | **AHEAD — category-defining** |
| **Test discipline** | 965 tests: 750 substrate-symmetry (v73–v87) + operational + 34 evals, pre-commit gated | Frontier repos test code, not *substrate coherence*. Symmetry harnesses are unique | **AHEAD** |
| **Cross-platform adapters** | 6 surfaces (Claude Code, Cursor, Cline, Codex, Gemini, Antigravity) + AGENTS.md | AGENTS.md is now Linux-Foundation-governed, 30+ tools, 60k+ repos | **AT PAR** (we were early; standard caught up) |
| **Memory retrieval quality** | precision@10 = 20% (hashing TF-IDF sidecar, honest floor); RRF hybrid +61% over baseline; 0.77ms p50 | OpenClaw builtin: sqlite-vec + FTS5, 0.7/0.3 weighted fusion, real embeddings, dreaming scheduled. Hermes: 3-tier memory + auto-skill synthesis | **BEHIND — the load-bearing weakness** |
| **Autonomy (daemons)** | Dreaming, decay, healing all DESIGNED, all manual-invocation | OpenClaw dreams on schedule (light/deep/REM); Hermes compresses + synthesizes skills automatically | **BEHIND** |
| **Skill ecosystem interop** | 84 skills, 76 auto-activation rules — our own format, close to but not verified against the standard | agentskills.io (Anthropic, Dec 2025) now the cross-vendor standard: 32 tools, skills.sh lists ~90k skills | **GAP — one compliance pass away** |
| **Harness plug-in surface** | sis-memory-mcp (MCP only) | OpenAI `SessionABC`, Hermes `MemoryProvider` ABC, OpenClaw `kind:"memory"` slot — all single-slot plugin interfaces | **GAP — adapters not yet built** |
| **Security model** | Sentinel skills, secret scan, sandbox, v87 claw conformance | Post-ClawHavoc hardening: immutable root, semantic drift detection, atomic file+index remediation, SkillSpector-style triple scan | **AT PAR on design, BEHIND on enforcement** (our registry hash-verify is planned v0.2) |
| **Eval discipline** | Proving Ground 7 lanes + Model Arena receipts, manual cadence | Anthropic: end-state eval, token-usage-explains-80%-of-variance finding | **AHEAD on honesty, BEHIND on automation** |

**Net:** SIS is genuinely world-class at the *protocol/governance/testing* layer — arguably defines the category. It is behind at the *runtime* layer: retrieval quality, autonomous loops, and the three plug-in interfaces that would make it the memory substrate for ANY agent harness. That gap is closable in weeks, not quarters, because the substrate underneath is sound.

---

## 2. What the frontier looks like (June 2026, researched + cited in agent reports)

- **Anthropic**: memory tool `memory_20250818` (client-side CRUD on `/memories`, custom backends via `BetaAbstractMemoryTool`); compaction-preservation instructions in CLAUDE.md; 5 official multi-agent patterns (Generator-Verifier, Orchestrator-Subagent, Agent Teams, Message Bus, Shared State); filesystem-as-message-bus; 15× token multiplier → tier-based routing mandatory; subagents nest 5 deep; skills auto-load from `.claude/skills/`.
- **OpenAI**: Agents SDK v0.17 (agents/handoffs/guardrails/sessions). Sessions = pluggable `SessionABC` (SQLite, Redis, Mongo, Dapr, encrypted). AGENTS.md discovery-chain with overrides, 32KiB cap.
- **OpenClaw**: 100k+ stars; Gateway + 22 channels; `SOUL.md`/`MEMORY.md`/daily-log convention; builtin memory = SQLite FTS5 + sqlite-vec (0.7 vector / 0.3 BM25), 400-token chunks, scheduled dreaming; ClawHub had the **ClawHavoc** incident (1,184 malicious skills, SOUL.md memory-poisoning persistence, vector-index re-derivation of attacks after file cleanup) → SkillSpector scanning, immutable-root pattern. Memory plugin slot `kind:"memory"` is single-occupancy.
- **Hermes Agent (Nous Research)**: 180k stars in 4 months. 3-tier memory (volatile / FTS5 procedural / long-term skill docs). **Auto-synthesizes a SKILL.md after completing novel tasks** — agents with 20+ self-created skills are 40% faster. `MemoryProvider` + `ContextEngine` plugin ABCs. Profiles, 5 execution backends, OpenRouter-native.
- **agentskills.io**: the interop bridge. One SKILL.md format → Claude Code (`.claude/skills/`), Codex (`.agents/skills/`), Gemini, OpenClaw (`~/.openclaw/skills/`), Hermes (`~/.hermes/`), 32 tools total.

---

## 3. The 10 moves to world-class (priority order)

| # | Move | What | Measured by | Effort |
|---|------|------|-------------|--------|
| 1 | **Memory engine v0.2** | Real local embeddings (model2vec or GGUF via llama.cpp — sovereignty preserved) + RRF over FTS5. Adopt OpenClaw's proven 0.7/0.3 fusion as starting weights | /starlight-eval Lane 1: precision@10 from 0.20 → ≥0.60 | days |
| 2 | **Universal memory adapters** | Thin shims implementing OpenAI `SessionABC`, Hermes `MemoryProvider`, OpenClaw `kind:"memory"` — ALL delegating to sis-memory-mcp / Path A. SIS stays canonical; adapters store nothing | One vault, four harnesses; round-trip test per adapter | ~1 wk |
| 3 | **agentskills.io compliance pass** | Validate all 84 skills' frontmatter (name ≤64 lowercase-hyphen, description ≤1024 WHAT+WHEN third-person, ≤500-line body, 1-level refs). New v88 symmetry test enforces it forever | v88 green; publish curated subset to skills.sh + ClawHub | days |
| 4 | **Anthropic memory tool backend** | `BetaAbstractMemoryTool` subclass mapping `/memories` → vaults. Claude's "always check memory first" doctrine = our doctrine, natively | Agent SDK session reads/writes vault atoms | days |
| 5 | **Daemonize the designed loops** | Dreaming + decay-sweep + healing as scheduled tasks (Machine Sentinel already watches the watchers). Atomic file+index treatment per ClawHavoc lesson | Dreaming receipts appear without manual invocation | days |
| 6 | **ClawHavoc-class hardening** | Immutable Layer-1 (SIP + sovereignty clause signed/ACL-locked), semantic-drift detection on identity files (cosine vs baseline, catches Ship-of-Theseus edits), SkillSpector-style triple scan in /sis-forge harvest path, ship registry hash-verify v0.2 | Red-team scenario suite in Proving Ground Lane 6 | ~1 wk |
| 7 | **Skill auto-synthesis (Hermes pattern)** | Post-session hook: novel completed task → forge SKILL.md draft → Sentinel review → library. This is /sis-forge Phase 2's killer feature, reframed | N self-forged skills accepted; time-to-repeat-task delta | ~1 wk |
| 8 | **Queen closes the loop** | /starlight-queen consumes /starlight-eval + Arena + Cost Plane receipts → recommends model + harness + memory scope per task class. Honors exec-board A2 (no autoApply on n=1; recommendations carry receipts) | Routing table versioned with receipts per cell | days |
| 9 | **Close the CRITICAL symmetry break** | Code IS + Voice&Video IS commands live in FrankX repo while substrate docs claim them — fix docs or move commands (board pre-pass, it's VERTICALS-adjacent) | v79 without that exemption | hours |
| 10 | **Private memory repo** | See §5 | restic + private GitHub remote both green | days |

Moves 1+2+3 are the trifecta: after them, SIS is *the* sovereign memory + skills substrate that plugs into every major harness — which no one else is positioned to be, because no one else has the governance layer.

---

## 4. Tooling-by-use-case matrix (which harness for which vertical)

| Use case / vertical | Best harness | Why | SIS plugs in via |
|---|---|---|---|
| Repo/coding work (SIS, FrankX, site) | **Claude Code** | Deepest harness: skills+hooks+subagents 5-deep+MCP+plugins | Native (this repo) |
| Always-on personal Jarvis, messaging | **OpenClaw** | 22 channels, Gateway, device companions | Memory slot adapter (#2) + skills (#3) |
| Self-improving research/ops agents, remote/HPC | **Hermes Agent** | Profiles, 5 exec backends, auto-skill synthesis, OpenRouter-native | MemoryProvider adapter (#2) |
| Production app agents (APIs, products) | **OpenAI Agents SDK** or **Claude Agent SDK** | Sessions/guardrails/handoffs; resumable SDK sessions | SessionABC adapter / memory tool (#4) |
| Web properties (frankx.ai, arcanea.ai) | **Vercel AI SDK + Next.js** | Existing pipeline, /v lane | Context engine exports |
| Enterprise / Oracle CoE | **starlight-agent-lab** comparisons (ADK/Vertex/OCI) | Neutral sandbox already exists | Lab consumes SIS context |
| Music/Sound/People verticals | Claude Code + domain sub-stack commands | Domain skills already in-substrate | Native |

Multi-agent memory scoping rule: every agent gets ONLY the vault namespaces its CLAW/agent contract declares (Hermes-the-agent reads all, writes none; Memory Claw writes; privacy namespaces opt-in) — enforced by Memory Bus singleton, which also solves the AgentDB-per-tab constraint.

## 5. Private memory architecture

- **Today:** `private/` is gitignored, local-only, restic-backed. Single-machine risk; cross-device gap (this week's sync friction proves it).
- **Target:** private GitHub repo `starlight-private-memory` (private, no forks) holding: personal vault namespaces (second-brain, health, family, spiritual), alliance register, genius profiles, partner/wealth state. SIS consumes it via a path in `substrates.toml` — the public substrate never embeds private content, it *mounts* it.
- **Learning still flows:** the dreaming pipeline promotes *patterns* (not facts) from private → public vaults, with the privacy filter running BEFORE grouping (byte-identity tested — existing doctrine). That's how private experience keeps advancing the public system without leaking it. Same SIP § 5.7: forks inherit pattern, not person.
- **Per-device:** both laptops clone it; Memory Bus reads it; conflict-free via append-only JSONL (already the design for multi-device sync).

## 6. Orchestration: how the brain composes

```
Frank → /si (intent router)
          ├─ reasoning ask → /superintelligence
          └─ execution/batch → /starlight-queen
                 ├─ survey → classify → route (Opus/Sonnet/Haiku per receipts)
                 ├─ consumes: /starlight-eval lanes + Model Arena + Cost Plane
                 ├─ gates: /starlight-board (substrate) · CI harness · Metrics Truth
                 ├─ dispatches: swarms with per-agent memory scope via Memory Bus
                 └─ records: vaults + auto-memory + PR comments (cross-device)
```

Verticals interconnect through the existing primitives — Transmissions (cross-system channels), Context Engine (repo snapshots), Composition Layer (Wealth IS proved it; Crypto composes under Wealth), and the spawn pattern (`/spawn-domain-stack`). The genius interconnection isn't new machinery: it's moves 1–8 making every existing primitive measurably good.

---

*Built on SIP — Starlight Intelligence Protocol v1.1.1. Sources: agent research reports 2026-06-11 (Anthropic ecosystem · OpenAI/OpenClaw/Hermes · repo inventory), BENCHMARKS.md, tools/proving-ground receipts.*
