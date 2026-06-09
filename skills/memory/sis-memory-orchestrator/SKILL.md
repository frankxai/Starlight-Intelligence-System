---
name: sis-memory-orchestrator
description: Substrate-aware memory orchestration for Starlight Intelligence System. Coordinates a 7-subagent team that proactively manages memory writes, retrieval, knowledge-graph maintenance, privacy redaction, decay, audit, and substrate benchmarking across pluggable backends (mempalace, Letta, Mem0, AgentDB, Qdrant, screenpipe, filesystem). Use when the user asks about SIS memory architecture, wants to add or swap a memory substrate, runs `/sis memory`, asks "where should this capture go", reports memory leaks or staleness, requests benchmarks across substrates, or sets up a new sovereign user adopting SIS. Honors privacy-by-default (everything local; embeddings local; PII redaction before any external call).
---

# SIS Memory Orchestrator

> **v0.1 scope cut (2026-04-30) — round-trip-first.**
>
> This skill describes the full architecture. **What ships in v0.1 is a deliberately small subset:** 3 agents (Router, Guardian, Bencher), 2 substrates (mempalace in-tree adapter + Qdrant scaffold-disabled), replay-only benchmarks, dog-fooded through People Intelligence `/perf-feedback-rehearsal`. Implementation lives in `private/voice-operator/service/memory/`. CLI surface: `python -m service.memory.cli {commit,recall,status}`.
>
> The remaining agents/substrates/cron/encryption/CRDT below are **parked with falsifiable un-park triggers** in `memory/benchmarks/DECISIONS.md`. A parked item ships only when its trigger is observed on the live system — not from a roadmap.
>
> The v0.1 success gate: a `/perf-feedback-rehearsal` write reaches mempalace, a follow-up `recall()` returns it, Guardian blocks a PII probe, audit log records the full sequence — all green on Frank's machine before this commit (d9cc95b) is pushed.
>
> Plan: `docs/superpowers/plans/2026-04-30-sis-memory-orchestrator-v0.1.md`.

Synthesizes the best memory patterns from across the field into one substrate-agnostic orchestration layer for SIS:

- **mempalace** — episodic / semantic / procedural split, embedding-indexed, hot/warm/cold decay
- **Letta (MemGPT)** — hierarchical agent memory with self-edit
- **Anthropic Claude Code team** — `CLAUDE.md` as canonical entry, auto-memory atoms with WHY/HOW
- **Karpathy / Hashimoto** — code-as-handover, ADRs over prose, structured state replaces sprawl
- **Geoffrey Litt (malleable software)** — ownership stays local; CRDTs for sync
- **Ink & Switch local-first** — privacy by architecture, not policy

## When this skill fires

- User says: SIS memory / where does X capture go / memory substrate / mempalace / Letta / Mem0 / AgentDB / "swap memory backend" / "benchmark substrates" / "memory privacy" / "leak audit"
- New sovereign forking SIS (`/sovereign-spawn`) — auto-runs the substrate selector for them
- Periodic (weekly): runs benchmark + decay sweep
- On capture/packet write: validates write hits the right substrate, fires Privacy Guardian

## Core workflow

Every memory operation flows through five gates. Pick which agents to dispatch by operation type — the routing table is below.

```
                           ┌─────────────────────────┐
   user / agent ──────────▶│  1. Privacy Guardian   │ ← redact PII, enforce policy
                           └────────────┬────────────┘
                                        │
                           ┌────────────▼────────────┐
                           │  2. Substrate Selector  │ ← pick mempalace / Letta / vault MD / KG JSONL
                           └────────────┬────────────┘
                                        │
                           ┌────────────▼────────────┐
                           │  3. Indexer / Retriever │ ← write or query
                           └────────────┬────────────┘
                                        │
                           ┌────────────▼────────────┐
                           │  4. Graph Maintainer    │ ← cross-ref, deduplicate
                           └────────────┬────────────┘
                                        │
                           ┌────────────▼────────────┐
                           │  5. Auditor             │ ← attestation chain, leak audit
                           └─────────────────────────┘
```

## Subagent team — pick the size

| Tier | Agents | When |
|---|---|---|
| **Minimal (3)** | Indexer · Retriever · Privacy Guardian | Single-user, single-substrate, trust-this-machine |
| **Production (7)** | + Graph Maintainer · Substrate Benchmarker · Decay Manager · Auditor | Default for adopting SIS; weekly benchmarks; multi-substrate |
| **Advanced (10)** | + Council Convener · Cross-Project Sync · Health Monitor | Multi-tenant / cross-machine / SaaS deployment |

Agent contracts: see `references/subagent-roster.md`.

## Substrate selection — first decision

**Default for new adopters: filesystem markdown + JSONL knowledge-graph + local Qdrant** — covers 80% of use cases, requires zero external services, fully sovereign.

When to add or swap:

| Symptom | Add this substrate |
|---|---|
| "Find captures by meaning, not keyword" | mempalace OR Qdrant + sentence-transformers (local) |
| "Memory grows beyond 10k entries, retrieval slow" | mempalace OR Letta with hot/warm/cold decay |
| "Need self-editing memory across long agent sessions" | Letta (MemGPT) |
| "Need agent-as-a-service style memory layer" | Mem0 |
| "Continuous screen capture for ambient context" | screenpipe |
| "Sub-50ms recall in voice path" | AgentDB (singleton daemon, see constraint below) |
| "Multi-tab agent with shared memory" | **Memory Bus daemon** — see constraint below |

**Hard constraint (memory):** AgentDB and most embedded vector DBs spawn one process per connecting tab. At ~10 tabs the system breaks (per `project_agentdb_singleton_constraint.md`). All multi-process memory architectures MUST front through a singleton daemon (MCP server, Windows Service, or FastAPI). The voice-operator FastAPI :7373 already serves this role for the cognition loop.

Full matrix with install paths, latency profiles, license terms, leak posture: see `references/substrate-matrix.md`.

## Privacy posture (non-negotiable)

This is what makes the system safe for anyone adopting SIS, not just Frank.

1. **Everything local by default.** mempalace, Qdrant, Letta — all run as local Docker / Python processes. Nothing leaves the machine without explicit user action.
2. **Embeddings local too.** Use sentence-transformers (`all-MiniLM-L6-v2` for speed, `bge-large-en-v1.5` for quality) — never OpenAI/Cohere embedding APIs that ship vault content over the wire.
3. **PII redaction before any external call.** Privacy Guardian runs FIRST. Before any payload goes to OpenRouter / Anthropic / fal.ai / etc., scan for: emails, phone numbers, addresses, API keys, person names mentioned in private vault entries. Redact or block.
4. **Encryption at rest** (optional, opt-in): vault MD files encrypted with age (yubikey-backed) for sovereign tier.
5. **Audit log of every read/write.** `memory/_audit/{date}.jsonl` records who/what/when/source — Auditor scans this for anomaly patterns.
6. **No cross-tenant bleed.** Each sovereign user gets their own substrate namespace; the orchestrator enforces isolation via path prefixes + DB schemas.
7. **Adversary model:** assume an LLM call could exfiltrate context. Redact secrets BEFORE adding to context. Never include full vault content in agent system prompts; retrieve top-k slices only.

Full threat model + redaction patterns: see `references/privacy-hardening.md`.

## Benchmarking protocol

Quarterly (or on substrate add): run the bench suite against the user's actual corpus.

Metrics:
- **recall@k** (k=5) — given known queries, does the right entry surface in top 5?
- **latency p50 / p95** — wall-clock ms per retrieval
- **leak risk** — does any retrieval surface PII not in the query scope?
- **cost** — $ per 1k retrievals (relevant for cloud substrates)
- **footprint** — disk + RAM at 10k / 100k / 1M entry scale

Run via `scripts/benchmark_substrates.py`. Results write to `memory/benchmarks/{date}.json` and a one-page summary in `memory/benchmarks/RECOMMENDATIONS.md` (auto-updated by the Substrate Benchmarker subagent).

Full protocol: see `references/benchmarking-protocol.md`.

## Mempalace install (recommended starter)

When a user asks "set up mempalace":

1. Verify clone + Python 3.11+: `git clone https://github.com/mempalace/mempalace ~/.starlight/mempalace`
2. Install: `cd ~/.starlight/mempalace && pip install -e .` (or follow upstream README)
3. Register in SIS: append to `private/voice-operator/config/substrates.toml`:
   ```toml
   [substrates.mempalace]
   enabled = true
   path = "~/.starlight/mempalace"
   embedding_model = "all-MiniLM-L6-v2"   # local, no external API
   tier = "warm"
   ```
4. Migrate existing knowledge-graph entries: `python -m service.memory.migrate --from kg-jsonl --to mempalace`
5. Run benchmark: `python skills/memory/sis-memory-orchestrator/scripts/benchmark_substrates.py --substrate mempalace`
6. Privacy Guardian audits the migration; Auditor re-attests every imported entry.

If upstream mempalace API differs from the contract above, update `references/substrate-matrix.md::mempalace` section with the actual contract.

## What this skill produces

When dispatched:
- For a write op: the substrate decision + the redacted payload + the attested entry path
- For a read op: top-k slices from each enabled substrate, ranked by relevance + recency
- For a benchmark op: a one-page recommendation table
- For a leak audit: the redacted-or-quarantined entries report
- For an adoption op (new sovereign): a substrate plan + the install command list

## When NOT to fire this skill

- Routine commit / docs / one-off code fix — no memory op
- User explicitly says "don't touch memory"
- The 6 v6 commands (`/council`, `/navigate`, etc.) handle their own memory writes via existing skill auto-activation — don't double-dispatch

## Reference files

- `references/substrate-matrix.md` — every supported substrate: install, contract, latency, license, leak posture
- `references/subagent-roster.md` — 7 (or 3 / 10) agent contracts: signatures, when to dispatch, what they return
- `references/privacy-hardening.md` — full threat model, redaction patterns, anti-leak architecture
- `references/benchmarking-protocol.md` — metrics, harness, hypothesis test design

## Coupling to existing SIS

This skill **does not replace** existing memory plumbing. It coordinates it.
- Existing `memory/vaults/*.md` — kept; this skill treats them as the cold-tier filesystem substrate
- Existing `memory/knowledge-graph/index.jsonl` — kept; warm-tier append-only log
- Existing `memory/voice-sessions/{date}.md` — kept; hot-tier daily capture log
- Existing brain-graph / brain_watchdog — kept; this skill is upstream of it

Adding mempalace / Letta / Qdrant means **augmenting**, not replacing. The orchestrator routes to the right tier per op.
