# MEMORY — Starlight Intelligence System (Instance State)

Current operating state and living ledger for the **Starlight Intelligence System (SIS)** reference build and sovereign substrate.

---

## Identity

- **Name:** Starlight Intelligence System (SIS)
- **Type:** Substrate + Reference Operational Build
- **Authored by:** Frank Riemer (FrankX)
- **Founded:** 2024
- **SIP version:** `v1.1.1`
- **Canonical public URL:** `starlightintelligence.org`
- **Source of truth:** `frankxai/Starlight-Intelligence-System`

---

## Sovereign Verticals (Operational Reference)

| Vertical | Owner | Status | Notes |
|----------|-------|--------|-------|
| **People Intelligence** | FrankX / SIS | `active v7.6.0` | 6 sub-systems (Hiring, Performance, Training, Culture, Talent, Org) · 28 commands |
| **Sound Intelligence** | FrankX / SIS | `active v7.6.0` | 6 sub-systems (Composition, Production, Catalog, Performance, Audience, Sync) |
| **Music IS** | FrankX / Arcanea Records | `active v7.6.0` | 7 agents (A&R, Persona, Production, Distribution, Royalty, Persona-Keeper, Royalty-Architect) |
| **Second Brain IS** | FrankX / SIS | `active v0.1.1` | Daily capture, weekly orchestration, monthly distillation, Alina Pak workflow, LLM-Wiki filing |
| **Business IS** | FrankX / SIS | `active v7.4.0` | Entity architecture, revenue modeling, tax sanity, unit economics |
| **Creator IS** | FrankX / SIS | `active v7.4.0` | Creator pipeline, content systemization, genius profile |
| **Brand IS** | FrankX / SIS | `active v7.4.0` | Brand kit, voice anti-slop, aesthetic lanes, visual directors |
| **Code IS** | FrankX / SIS | `active v7.4.0` | Empirical sandbox, active healing daemon, repo-bridge, multi-agent dispatch |
| **Self & Health IS** | FrankX / SIS | `active v7.4.0` | Body substrate, energy architecture, cognitive load management |
| **Ocean / Marine Intelligence** | FrankX / SIS | `active v8.3.0` | Marine biodiversity, acoustics, autonomous underwater vehicle coordination |
| **Crypto Intelligence** | FrankX / SIS | `active v8.3.0` | On-chain telemetry, portfolio risk modeling, smart contract audit gates |

---

## Multi-Agent Ecosystem Alliances & Swarm Peers

| Platform / Framework | Connection Mode | Integration Mechanism | Status |
|----------------------|-----------------|------------------------|--------|
| **ruflow / claude-flow v3** | Connected Peer (`arcanea-flow`) | Memory Bus singleton daemon (`transmissions/channels/arcanea-flow-channel.md`), RuVector embeddings, Q-learning router, MoE, ReasoningBank | `active` |
| **oh-my-openagent (OmO)** | Multi-Harness Agent OS (`oh-my-openagent`) | Team Mode multi-agent coordination (11 roles), Boulder work-state tracking, OpenCode & Codex dual editions | `active` |
| **Hermes Agent** | Profile Distribution & Provenance (`hermes`) | GenCreator 6-Pillar CoE Guardians, isolated profile specs, deep provenance search backbone (`starlight-hermes`) | `active` |
| **OpenClaw & Kiloclaw** | Reference Runtime (`openclaw`, `kiloclaw`) | Signed SIS Claw packages (`frankxai/sis-*-claw`), hash verification, deployable business/creator stacks | `active` |
| **Google Antigravity / Gemini** | Native Swarm Platform (`.antigravity/`) | Reactive event loops, subagent dispatch, sandbox commands, artifact generation, Gemini 1M+ context | `active` |
| **Grok (xAI)** | Fast TUI & Subagent Driver (`.grok/`) | TUI subagent swarm, Grok personal excellence seeds, visual generation, live palace review | `active` |

---

## Memory Substrate Status

- **6 Semantic Memory Vaults:** Strategic ◆ · Technical ⬡ · Creative ✦ · Operational ▸ · Wisdom ◎ · Horizon ↗
- **Storage Hybrid:** Append-only event-sourced JSONL files + local SQLite FTS5 index + pluggable vector embeddings.
- **Memory Provider Router:** Resource-aware routing with `local_core` as canonical authority; Mem0 remote provider with TTL cache, auto-flush, and cache invalidation on write; Hindsight/Graphiti graph memory mirrors.
- **Memory Gateway v0.1:** SessionStore + per-harness loopback daemon + Reciprocal Rank Fusion (RRF) unification with automatic privacy filtering.
- **Queen Continuous Advance:** Visual palace recall + dreaming consolidation pipeline (`scripts/dreaming-cron.ps1`).

---

## Non-negotiables (Substrate-Level)

- "Built on SIP" attribution on every cross-vertical or cross-node artifact.
- Sovereignty clause (SIP § 5) is non-waivable.
- Open boundary: MIT for spec and reference code, CC-BY-NC for Arcanea canon.
- Declared file loads must be test-asserted to exist.
- SAGE Goal verification invariant: `/goal` runs require checklist state and Sentinel audit passing (`LGTM-SIS`).
- Second Brain question-filing invariant: Every distilled note titled by the specific question it answers.

---

## Changelog

- `v8.3.0` · `2026-06-12` · **Horizons + Genius + Domain Sub-Stack Tier + Composition Layer + Crypto IS + Queen Advance** — Shipped pluggable memory provider router (local_core canonical authority, Mem0 remote shadow provider with TTL caching, retry, and auto-flush); 5 image_gen visual palace recall artifacts; Queen continuous loop driver; Crypto Intelligence vertical v0.1 proof-of-pattern; Marine Intelligence skills; 144 named agents and 83 auto-activating skills locked.
- `v8.2.0` · `2026-05-20` · **Cost & API Control Plane + Finance Bridge** — Built Zellij cockpit cost plane layout, Stripe revenue fetchers, P&L calculations, runway estimation, and daily revenue snapshot automation.
- `v8.1.0` · `2026-05-11` · **/yolo Hive Conductor + SAGE Autonomous Engine** — Conductor mode for cross-repo parallel council scans, SAGE self-healing loops with checkpointing, context compression, and automatic git rollback on Sentinel audit failure.
- `v8.0.0` · `2026-05-07` · **Platform Prompt Symmetry & 10-IS Stack Lock** — Built `test/v80-platform-prompts.test.ts` asserting cross-platform prompt symmetry across Claude, Codex, Gemini, Antigravity, Grok, and OpenCode. Locked the 10 universal Intelligence Systems.
- `v7.9.0` · `2026-05-04` · **Vertical Coverage & agentskills.io Conformance** — Standardized all skills under the agentskills.io specification (v88 conformance suite) and verified 100% vertical structural coverage.
- `v7.8.0` · `2026-05-02` · **Starlight Skill Registry** — Formalized `skills/SKILL_REGISTRY.md` tracking ownership, version, and lifecycle across 83 skills in 16 domains.
- `v7.7.0` · `2026-04-30` · **Skill Rules Engine** — Centralized auto-activation rules in `skills/skill-rules.json` matching keywords, globs, and agent personas.
- `v7.6.0` · `2026-04-28` · **People Intelligence Rename** — People Intelligence reference vertical shipped at `verticals/people-intelligence/` with 6 sub-systems, 6 agents, 28 commands.
- `v7.4.1` · `2026-04-25` · **Domain Sub-Stack Tier Introduced** — Sound Intelligence and HR/People Intelligence reference builds.
- `v7.4.0` · `2026-04-24` · **9-Layer Intelligence Architecture & Genius IS** — Shipped `starlight-genius`, excavation commands, and non-technical Claude starter pack.
- `v7.3.0` · `2026-04-24` · **Front-Door Tier** — Concierge and Envoy intake agents with idea-triage and creator-path skills.
- `v7.2.0` · `2026-04-23` · **Substrate Ecosystem Ship** — Adoption kit, Built on SIP badge generator, and OpenClaw security review.
- `v7.0.0` · `2026-04-22` · **SIP v1.1.0 Spec Shipped** — First substrate self-attestation.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1 · MIT
