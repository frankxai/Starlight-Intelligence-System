# Memory Substrate — Drift Resolution + Foundation Research Kickoff

**Date:** 2026-05-20
**Author:** Claude (Opus 4.7, lead-with-authority per `feedback_lead_with_authority.md`)
**Status:** Pre-Board — pending `/starlight-board` pre-pass
**Scope:** Substrate-tier (touches memory canon → board-before-tag mandatory per CLAUDE.md §49)

---

## ⚠️ Revision history

| Rev | Date | What changed | Why |
|---|---|---|---|
| v1 | 2026-05-20 08:30Z | Initial doc; proposed archiving `mempalace_upstream/` (ChromaDB) | Reasoned from file-presence + `.blob_seq_ids_migrated` flag — assumed Chroma was legacy |
| **v2** | **2026-05-20 14:00Z** | **RETRACTED v1. Direction INVERTED.** | Mempalace baseline research sub-agent verified `private/voice-operator/config/substrates.toml` lines 22-34: ChromaDB is PRIMARY since Phase 3a 2026-05-06; atoms.jsonl is the frozen pre-migration fallback. **v1 would have deleted 14 days of writes.** |

If you read v1 and acted on it: DO NOT archive `memory/mempalace_upstream/`. That is the live store. Continue reading.

---

## 1. Observed drift — what's actually true

Live inspection on 2026-05-20:

| Store | Path | Role | Last write | SIP-attested |
|---|---|---|---|---|
| **ChromaDB (upstream)** | `memory/mempalace_upstream/chroma.sqlite3` + 2 collection dirs | **PRIMARY** — receives all writes since 2026-05-06 | 2026-05-19 03:00Z (audit) | Yes — every audit row carries `attestation: "Built on SIP — <sha>"` |
| **Hashing-TF (in-tree)** | `memory/mempalace/atoms.jsonl` + `vectors.npy` | **FALLBACK / Bencher reference** — frozen at 520 pre-migration atoms | 2026-05-03 (frozen) | Yes per atom |

Evidence:
- `private/voice-operator/config/substrates.toml`:
  - L22-34: `[substrates.mempalace_upstream]` ... "PRIMARY (Phase 3a, 2026-05-06)"
  - L36-50: `[substrates.mempalace]` ... "FALLBACK ... Router does NOT write here in v0.2 - only the upstream substrate (listed first above) gets new commits"
- `memory/_audit/2026-05-19.jsonl` line 1: `"substrate": "mempalace_upstream"`
- Same for every audit row 2026-05-06 → 2026-05-19 (per baseline agent's deep scan)
- Pre-migration corpus (520 atoms) was replayed into upstream on 2026-05-06 per the toml comment

## 2. The actual drift (smaller than v1 claimed)

There IS still drift, but it's not what v1 said. The drift is:

1. **The git status had `mempalace_upstream/` as untracked** — the LIVE store has no git tracking. Audit logs are tracked, the binary store isn't. This is fine for an embedded SQLite, but it means the canonical "what does SIS know?" state lives in an untracked directory. That's the real residue.
2. **Two stores both `enabled = true`** but only the first-listed receives writes — fine, intentional fallback design, but easily misread (as v1 did).
3. **A2 axiom is currently FAILING the substrate.** Per the mempalace baseline agent: ChromaDB binary segment dirs are not Obsidian-readable; `cat`-ing an atom requires the engine. This is a *current* axiom violation in SIS, not a hypothetical one for candidates.

## 3. Decision (pending Board ratification)

**v2 decision:**

1. **No archive move yet.** Both substrates stay where they are. Premature archive risks data loss.
2. **Add `memory/mempalace_upstream/` to `.gitignore`** since it's binary + already untracked. Stop suggesting it should be in git.
3. **Promote atoms.jsonl from "fallback" to "audit trail snapshot."** The 520-atom file is fine where it is — useful as the Bencher reference + pre-migration archive. Rename role in substrates.toml comment, not file location.
4. **Document the A2 axiom violation explicitly.** The current SIS substrate FAILS its own filesystem-native axiom. This is the strongest case for the foundation research — we need to resolve A2 by choosing a candidate that satisfies it (Letta MemFS, LangGraph + JSONL backend, Cognee with Pydantic+OWL, etc.) or by explicitly waiving A2 with rationale.

### Falsifier (when this v2 decision is wrong)

If the foundation research recommends staying on ChromaDB despite A2 — we need a documented rationale that supersedes A2, not silent waiver. If the recommendation is to migrate to Letta/Cognee/LangGraph, ChromaDB becomes the *migration source*, not the canonical primary.

## 4. The actual research need (unchanged from v1)

The deeper question Frank raised today remains live:

> "Our whole memory system how good well thought and it works cross agents? or better adopt mem0 or others? mempalace we did have its working?"

Answered by the foundation research now in flight:
- Rubric: `docs/research/_methodology/memory-rubric.md`
- Charter: `docs/research/_factory/memory-foundations/CHARTER.md` + `CHARTER-ADDENDUM-1.md`
- Output (when synthesized): `docs/research/published/memory-foundations-2026-05.md` → `site/src/app/research/[slug]/`

Five candidates already scored (mem0, Letta, Cognee, Zep, Anthropic Memory API, mempalace-incumbent). LangGraph + LangMem dispatched as C7. Synthesis pending all 7.

## 5. Board pre-pass — required

Per CLAUDE.md §49. Memory foundation choice touches attestation rules + file-contract.

Board memo: `docs/boards/2026-05-20-memory-foundation-spawn.md` (written after research synthesis).

The retraction in §1 above will be included in the Board memo as evidence that the substrate-tier process is working — a wrong v1 was caught by the research itself before any irreversible action.

---

## 6. Lesson recorded

This near-miss is being saved to memory as a feedback atom:

> **Feedback — verify file-presence claims against runtime config, not against file-presence alone.** A `.migrated` flag on a file means *something was migrated*, not *which direction*. Always read the active config (substrates.toml, .env, settings) before declaring a file "legacy" or "canonical." Reason: 2026-05-20 mempalace drift-resolution v1 inverted the direction and would have archived the live store; the baseline research agent caught it via deep code-read.

---

*Built on SIP — 2026-05-20 · v2 supersedes v1 · Sovereignty clause §5 holds — retraction is the correct move when reality contradicts our model*
