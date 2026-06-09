# Capture Stack — Install Playbooks

> Five primitives, one dependency chain, one canonical substrate. These playbooks turn `MASSIVE_ACTION_PLAN.md` § 5 (Capture Stack) and § 10.1.3-10.1.6 (Phase 1 build order) from a list into a runnable sequence on Frank's Lenovo + Acer + phone.

**Philosophy:** local-first capture, derived indices, Markdown vault canonical. Cloud touches the substrate only at known, auditable seams (Groq STT, Voyage embeddings, Supabase pgvector). Nothing else leaks.

**Voice:** these are install playbooks, not generic READMEs. They pin opinionated values, name refusal patterns, and treat the substrate's stance as load-bearing.

---

## The five primitives

| # | Primitive | Layer | Source | What it gives the substrate |
|---|---|---|---|---|
| 1 | [screenpipe](./screenpipe.md) | L0 capture | mediar-ai/screenpipe | Continuous searchable screen + audio; the digital exhaust |
| 2 | [meetscribe](./meetscribe.md) | L1 meetings | pretyflaco/meetscribe | Diarized + summarized meetings with consent gate |
| 3 | [Mem0](./mem0.md) | L2 memory | mem0ai/mem0 | Per-agent semantic recall over captures + vault |
| 4 | [Graphiti](./graphiti.md) | L3 temporal graph | getzep/graphiti | Time-aware knowledge graph; powers Neural Constellation |
| 5 | [Syncthing](./syncthing.md) | L0 sync transport | syncthing/syncthing | Lenovo + Acer + phone three-device ring, no cloud middleman |

---

## Install order — dependency chain

```
1. screenpipe ──► writes to ~/captures/screen/, ~/captures/audio/
        │
        ▼
2. meetscribe ──► writes to ~/captures/meetings/{raw,transcripts,summaries}/
        │
        ▼
3. Mem0 ────────► reads vault + captures, indexes per-agent (Supabase pgvector)
        │
        ▼
4. Graphiti ────► reads vault + captures, builds temporal graph (Neo4j local)
        │
        ▼
5. Syncthing ───► replicates the right slices to Acer + phone
        │
        ▼
   Phase 1 § 1.7: first daily brief generated
```

**Why this order:**
- screenpipe + meetscribe must be writing before Mem0/Graphiti have anything to index.
- Mem0 before Graphiti because Graphiti's ingestion script reuses Mem0's metadata schema.
- Syncthing last — it replicates *everything that already works*. Installing it first would pre-emptively sync empty folders and create cleanup work.

**Do not parallelize.** Each install ships its own smoke test; only proceed once the prior smoke passes.

---

## Estimates

| Resource | Per primitive | Total Phase 1 capture stack |
|---|---|---|
| **Disk (initial)** | screenpipe 200MB · meetscribe 1GB (Python deps + pyannote model) · Mem0 100MB · Graphiti 200MB + Neo4j 500MB · Syncthing 60MB | **~2.1 GB** initial |
| **Disk (1 month operational)** | screenpipe 40-80GB · meetscribe 5-10GB · Mem0+Graphiti 1-3GB · Syncthing versions 1-2GB | **~50-100 GB/month** (capture-dominated) |
| **RAM (idle, all running)** | screenpipe 200MB · meetscribe ~0 (event-driven) · Mem0 150MB · Graphiti 300MB + Neo4j 1-2GB · Syncthing 80MB | **~2-3 GB idle** on Lenovo's 16GB |
| **Setup time (first pass)** | screenpipe 30 min · meetscribe 60 min · Mem0 60 min · Graphiti 60 min · Syncthing 45 min | **~4-5 hours** end-to-end |
| **Setup time (re-run on Acer)** | repeat each playbook with same configs | **~2 hours** (skips API key setup, faster venv) |

---

## Substrate readiness states

Each install moves the substrate forward on a tracked progression:

| After install | Substrate state | What is now possible |
|---|---|---|
| screenpipe | `1.3 partial` | Continuous searchable log on Lenovo |
| screenpipe + meetscribe | `1.3+1.4 ✓` | Structured meetings + ambient capture |
| + Mem0 | `1.5a ✓` | Per-agent semantic memory; first intelligent voice query |
| + Graphiti | `1.5 ✓` | Time-aware graph; daily-brief unblocked at the data layer |
| + Syncthing | `1.6 ✓` | Three-device continuity; single-point-of-failure mitigated |
| + first daily brief | `1.7 ✓ — Phase 1 capture stack complete` | Orchestrator has the substrate it needs to ship Phase 2 |

---

## Cross-cutting requirements

These apply to **all five** installs and are checked once, not per-playbook:

1. **`~/.starlight/secrets/.env`** — single source of API keys. Never in repo, never in Syncthing.
2. **BitLocker enabled** on Lenovo + Acer. Encrypts at rest; non-negotiable given vault contents.
3. **`~/captures/.stignore`** — drives what Syncthing does NOT replicate. Verify after every capture-stack change.
4. **Consent flag enforced** on meetscribe — Risk Register § 12 legal exposure mitigation.
5. **Vault stays canonical** — Mem0 and Graphiti are derived. Regenerable. The vault never depends on them.
6. **No cloud upload of raw captures.** Cloud touches only: Groq STT (audio chunk in flight, not stored), Voyage embeddings (text vectors, not raw text), Supabase pgvector (vectors + metadata, not source).

---

## Cross-references

- `MASSIVE_ACTION_PLAN.md` § 5 — Capture stack architectural stance
- `MASSIVE_ACTION_PLAN.md` § 10 Phase 1 — the build order this index implements
- `MASSIVE_ACTION_PLAN.md` § 12 — Risk Register (consent, single-point-of-failure, RAM)
- `STACK.md` — Recommended Sovereign Stack (L0-L6 layer map)
- `core/orchestrator/README.md` — what consumes the capture stack
- `docs/specs/2026-04-26-voice-operator-v1.md` — Phase 2 voice room (depends on Phase 1 complete)

---

**Built on SIP** — install playbooks index · v7.5
- Substrate: starlightintelligence.org/protocol
- Phase: 1 (capture stack)
- Generated: 2026-04-26
