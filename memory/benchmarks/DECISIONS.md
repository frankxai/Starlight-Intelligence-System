# SIS Memory Orchestrator — Parked Debt with Falsifiable Triggers

> Substrate-aware memory orchestrator v0.1 ships a deliberately small footprint:
> 3 agents (Router, Guardian, Bencher), 2 substrates (mempalace + Qdrant scaffold),
> replay-only benchmarks, dog-fooded through People Intelligence
> `/perf-feedback-rehearsal`.
>
> Everything not in v0.1 is parked here with a **falsifiable un-park trigger**.
> The rule: a parked item ships **only** when its trigger condition is observed
> on the live system. Concept-driven scope creep stops here.
>
> **Format per item:**
> - Status: `parked`
> - Un-park when: condition that, when measured, justifies the work
> - Cost if un-parked: rough effort estimate
> - Owner: which v0.1 agent or future agent absorbs the new responsibility
>
> Built on SIP — substrate state v0.1 (2026-04-30).

---

## PARKED-001 — Letta (MemGPT) adapter

- **Status:** parked
- **Un-park when:** A real session needs cross-session self-edit memory AND
  prompt-as-memory in mempalace fails on a measured task. Specifically:
  recall@5 for "what did the agent decide last session about X" drops below
  0.5 on a ≥50-query agent-conversation replay corpus.
- **Cost if un-parked:** ~1 day to wrap Letta's API as a Substrate adapter,
  plus migration of existing atoms.
- **Owner:** Router (new substrate slot)

## PARKED-002 — RRF / multi-substrate ranking

- **Status:** parked
- **Un-park when:** Two substrates are simultaneously enabled in
  `substrates.toml` AND single-substrate recall@5 < 0.7 on the live replay
  corpus. (At v0.1 only mempalace is enabled, so this is a no-op trigger.)
- **Cost if un-parked:** ~0.5 day. RRF is straightforward; the work is in
  per-substrate score normalization.
- **Owner:** Router

## PARKED-003 — Weekly bench cron

- **Status:** parked
- **Un-park when:** Replay corpus ≥ 500 entries AND substrate count ≥ 2.
  Until both conditions hold, weekly bench output is noise.
- **Cost if un-parked:** ~0.25 day (Windows Task Scheduler entry + summary
  email/Slack).
- **Owner:** Bencher

## PARKED-004 — Encryption at rest (age + yubikey)

- **Status:** parked
- **Un-park when:** A sovereign user adopting SIS requests it, OR a designated
  "sensitive" namespace (e.g. `client/<name>/private`) is created.
- **Cost if un-parked:** ~1 day. age has good Python bindings; the work is in
  key management UX.
- **Owner:** Guardian (boundary expands to "encrypt before substrate")

## PARKED-005 — CRDT cross-machine sync

- **Status:** parked
- **Un-park when:** Frank actively uses ≥ 2 machines daily AND a lossy hand-
  merge (overwriting one machine's atoms with another's) happens twice.
- **Cost if un-parked:** ~3-5 days. Real CRDT work; consider Automerge.
- **Owner:** Router (sync layer beneath substrates)

## PARKED-006 — Graph Maintainer / Council Convener / Cross-Project Sync / Health Monitor agents

- **Status:** parked
- **Un-park when:** A specific failure mode surfaces that the 3-agent set
  (Router, Guardian, Bencher) provably can't catch. Examples that would
  trigger:
  - Atom duplication across substrates (Graph Maintainer un-parks)
  - Substrate disagreement on the same query needing arbitration (Council
    Convener un-parks)
  - Audit log shows write-loops or memory growth without bounded recall
    (Health Monitor un-parks)
- **Cost if un-parked:** ~0.5 day per agent; each is small once the failure
  it solves is concrete.
- **Owner:** new agent slots in `service/memory/`

## PARKED-007 — Real embeddings (sentence-transformers all-MiniLM-L6-v2)

- **Status:** parked
- **Un-park when:** Mempalace recall@5 < 0.6 on ≥ 200-query replay corpus
  (= the substrate is the bottleneck, not the embedding) AND/OR corpus crosses
  1000 atoms (collision rate on hashing-TF dim=1024 starts to matter).
- **Cost if un-parked:** ~0.5 day. Add `sentence-transformers` to deps,
  swap `_hash_tf_vector` for the encoder, increase dim to 384, rebuild
  vectors via `MempalaceSubstrate._rebuild_vectors`.
- **Owner:** Mempalace adapter
- **Risk:** ~400MB model download on first install. Mitigation: lazy-load on
  first commit, cache to `~/.starlight/models/`.

## PARKED-008 — Real hot/warm/cold tiering

- **Status:** parked
- **Un-park when:** Memory grows beyond ~5k atoms AND retrieval latency starts
  showing tail-latency outliers tied to scanning all atoms.
- **Cost if un-parked:** ~1 day. Hot tier in-memory-only, warm on disk,
  cold archived to vault MD files.
- **Owner:** Mempalace adapter

## PARKED-009 — NER-based PII redaction (Microsoft Presidio / spaCy)

- **Status:** parked
- **Un-park when:** A measured leak — Guardian's regex set fails to redact a
  proper-noun-shaped or contextually-private mention that ends up in retrieval
  slices routed to a remote LLM.
- **Cost if un-parked:** ~1 day. Presidio install + Substrate-shaped wrapper.
  ~500MB spaCy model download.
- **Owner:** Guardian

## PARKED-010 — Mining `~/.claude/projects/*.jsonl` transcripts

- **Status:** parked (this is the memory-palace v0.1 scope from the parallel
  plan in `docs/superpowers/plans/2026-04-29-memory-palace-v0.1.md`)
- **Un-park when:** v0.1 round-trip is stable for ≥ 7 days AND Frank requests
  retrospective ingest of past Claude Code sessions.
- **Cost if un-parked:** ~1-2 days. Idempotent chunker (mtime + content-hash),
  drawer-shaped atoms, namespace `claude-code/<project>/<session>`.
- **Owner:** new `mining/` module under `service/memory/`

---

## Trigger checklist (run quarterly OR on substrate-change request)

```bash
cd private/voice-operator
python -m service.memory.cli status   # corpus size, substrate counts
# Then run bencher manually if corpus has changed materially:
python -c "from pathlib import Path; from service.memory.bencher import run_bench; \
  print(run_bench(Path('../../memory/voice-sessions'), Path('../../memory/benchmarks'), \
                  Path('../../memory/mempalace_bench'), dim=1024))"
```

If any un-park trigger from this file evaluates true on the live system, ship
that parked item next. Otherwise, the v0.1 footprint stays.

---

**Built on SIP** — `memory/benchmarks/DECISIONS.md` v0.1 — 2026-04-30
