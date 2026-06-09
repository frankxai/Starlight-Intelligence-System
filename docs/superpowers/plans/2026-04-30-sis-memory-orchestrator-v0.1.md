---
plan: sis-memory-orchestrator-v0.1
date: 2026-04-30
status: SHIPPED — round-trip green on Frank's machine
package: private/voice-operator/service/memory/
depends_on: skills/memory/sis-memory-orchestrator/SKILL.md (commit d9cc95b)
target_release: v7.7-pre
attestation: Built on SIP — operational-tier wiring of an already-committed skill
---

# SIS Memory Orchestrator — Round-Trip in One Day (v0.1)

## Goal

Take the SIS memory orchestrator from architecture (the d9cc95b skill commit)
to round-trip in a single focused window. Deliberately reject scope creep:
3 agents not 7, 2 substrates not 7, replay-only bench not synthetic, dog-food
through People Intelligence before either ships.

The d9cc95b skill commit doesn't get pushed until the round-trip is proven
locally.

## The single success gate

```
A People Intelligence command writes a real atom through commit_memory(),
recall("...", k=5) returns it from mempalace,
Guardian quarantined a probe payload with PII,
and memory/_audit/2026-04-30.jsonl shows both ops with attestation.
```

## Non-negotiables (verbatim from the brief)

1. Contract first: `commit_memory(atom)` + `recall(query, k)` written before any substrate code.
2. One substrate wired second: mempalace.
3. Guardian + audit log third.
4. 3 agents, not 7 — Router · Guardian · Bencher. Fourth requires a *failure boundary*.
5. 2 substrates, not 7 — mempalace + Qdrant. Letta requires a *measured failure*.
6. No synthetic benchmarks. Bencher replays real `voice-sessions/*.md` queries only.
7. Dog-food: People Intelligence sub-stack writes through this layer end-to-end.
8. Push d9cc95b only after that round-trips.

## What shipped

### Code

| Path | Role |
|---|---|
| `private/voice-operator/service/memory/contract.py` | `Atom`, `Recall`, `Substrate` ABC, `new_atom_id`, `now_iso` |
| `private/voice-operator/service/memory/guardian.py` | Regex PII redaction (email, phone, anthropic_key, openai_key, github_token, aws_access_key, ssn, ipv4, cc_shape) + private-name list from config |
| `private/voice-operator/service/memory/audit.py` | `append_audit` / `read_audit` writing `memory/_audit/{date}.jsonl` |
| `private/voice-operator/service/memory/router.py` | `commit_memory()` / `recall()` — Guardian → namespace check → substrate dispatch → audit |
| `private/voice-operator/service/memory/substrates/base.py` | `SubstrateError`, `SubstrateDisabled` |
| `private/voice-operator/service/memory/substrates/mempalace.py` | In-tree adapter: hashing-TF + numpy cosine, atoms.jsonl + vectors.npy persistence |
| `private/voice-operator/service/memory/substrates/qdrant.py` | Scaffolded, raises `SubstrateDisabled` until PARKED-002 trigger fires |
| `private/voice-operator/service/memory/cli.py` | `python -m service.memory.cli {commit,recall,status}` — slash-command-callable |
| `private/voice-operator/service/memory/bencher.py` | Replay-only recall@k from `memory/voice-sessions/*.md`. Refuses on corpora < 50 captures |

### Configuration

| Path | Role |
|---|---|
| `private/voice-operator/config/substrates.toml` | mempalace enabled (path, dim=1024), qdrant disabled with un-park-trigger pointer |
| `private/voice-operator/config/redact.toml` | Per-operator private name list + custom redaction patterns |

### Documentation

| Path | Role |
|---|---|
| `memory/benchmarks/DECISIONS.md` | 10 parked items (PARKED-001..010), each with falsifiable un-park trigger |
| `skills/memory/sis-memory-orchestrator/SKILL.md` | v0.1 scope-cut preamble; full architecture remains documented as roadmap |
| `docs/superpowers/plans/2026-04-30-sis-memory-orchestrator-v0.1.md` | This plan |

### Dog-food handshake

`.claude/commands/perf-feedback-rehearsal.md` patched with two new steps:

- **Step 0** — recall prior rehearsals: `python -m service.memory.cli recall --query "..." --namespace people-intelligence/perf --k 3`
- **Step 12** — commit rehearsal summary: `python -m service.memory.cli commit --namespace people-intelligence/perf --source /perf-feedback-rehearsal --text "..."`

Bash added to `allowed-tools` in the command's frontmatter.

### Tests

| Path | Coverage |
|---|---|
| `tests/test_memory_contract.py` | Atom/Recall shape, ULID-style id format, ABC enforcement |
| `tests/test_memory_guardian.py` | Clean-passes / email-redacts / key-blocks / multi-PII / private-names / config-load |
| `tests/test_memory_audit.py` | Append/read roundtrip, multi-row, blocked-with-reasons, recall-with-extras, malformed-line skip |
| `tests/test_memory_mempalace.py` | Tokenize, embedding shape/determinism, commit/query, idempotency, namespace isolation, persistence across instances, top-k ordering |
| `tests/test_memory_router.py` | Round-trip, audit roundtrip, PII redaction during commit, block path, namespace validation, empty-text validation, query-PII redaction, attestation |
| `tests/test_memory_cli.py` | commit→recall via argv, blocked exit code 2, invalid namespace exit 1, status |
| `tests/test_memory_bencher.py` | Query classification, voice-session parsing, refusal on small corpus, full-corpus recall@k |
| `tests/test_memory_perf_handshake.py` | **The success-gate test**: full perf rehearsal sequence + Guardian probe + audit verification + namespace isolation across sub-systems |

## What did NOT ship (parked with falsifiable triggers — see DECISIONS.md)

- ❌ Letta / Mem0 / AgentDB / screenpipe substrates
- ❌ RRF cross-substrate ranking
- ❌ Weekly bench cron
- ❌ Encryption at rest
- ❌ CRDT cross-machine sync
- ❌ Graph Maintainer / Council Convener / Cross-Project Sync / Health Monitor agents
- ❌ Real embeddings (sentence-transformers all-MiniLM-L6-v2) — hashing-TF + numpy cosine ships v0.1
- ❌ Real hot/warm/cold tiering
- ❌ NER-based PII redaction (Presidio / spaCy)
- ❌ Mining `~/.claude/projects/*.jsonl` (the memory-palace v0.1 scope)

Each has a measurable un-park trigger. None ship from concept; all ship from observed need.

## Cuts the plan made vs. what was tempting

- **Wings / Rooms / Drawers / Tunnels UX layer** (the parallel memory-palace plan): parked. Build the function before the metaphor.
- **npm packages `@starlight/cognitive-substrate` / `@starlight/memory-palace`**: parked. Ship internal first, externalize once stable.
- **Luminor Board pre-tag gate**: not invoked — this is operational-tier wiring of an already-committed skill, not a substrate-rule change. Board-before-tag invariant kicks in for SIP.md / SIS.md / ALLIANCE.md / etc.
- **`service/memory/` at repo root**: rejected due to `service/` namespace collision with voice-operator's `service/`. Code lives at `private/voice-operator/service/memory/`; the skill doc at `skills/memory/sis-memory-orchestrator/` is the public artifact.

## Risks flagged in the plan but resolved

- **Mempalace upstream API drift** — mitigated by shipping in-tree mempalace-pattern adapter (hashing-TF + numpy). Upstream binding can come later via a separate adapter slot.
- **400MB+ embedding model dependency** — mitigated by hashing-TF approach; PARKED-007 tracks the swap when corpus growth justifies it.
- **PII regex false negatives** — accepted at v0.1; PARKED-009 tracks NER upgrade when a leak is measured.
- **`/perf-feedback-rehearsal` is markdown not Python** — resolved by exposing the layer as a CLI (`python -m service.memory.cli`) that the markdown command invokes via Bash. No Python handler refactor needed.

## Push order

1. ✅ Round-trip green locally (success-gate test passes)
2. ✅ All Chunk 1+2+3 tests pass
3. Verify existing voice-operator suite still green (no regressions)
4. Push d9cc95b + new public-tier files (skill update, DECISIONS.md, plan)
5. Update auto-memory: `project_v77_memory_orchestrator_v01.md`

## Next moves

- Use `/perf-feedback-rehearsal` for a real rehearsal — this triggers the dog-food handshake. The audit log will show the first real-traffic commit + recall.
- After ~50 captures accumulate in `people-intelligence/*` namespaces, run the bencher against them to set the v0.1 baseline numbers.
- If recall@5 holds above 0.6 at 200+ atoms, the architecture is justified. If it drops, PARKED-007 (real embeddings) un-parks first.

---

**Built on SIP** — Implementation plan v0.1 — 2026-04-30
