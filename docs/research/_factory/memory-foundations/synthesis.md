# Memory Foundations — Synthesis

**Date:** 2026-05-20
**Status:** **FINAL** — all 7 candidates scored; recommendation locked pending Board pre-pass
**Inputs:** CHARTER.md, CHARTER-ADDENDUM-1.md, memory-rubric.md, 7 candidate findings, landscape-scan.md, [architecture-overview.md](architecture-overview.md) (Mermaid diagrams)
**Output target:** `docs/research/published/memory-foundations-2026-05.md` (on Board PROCEED)
**Board memo:** `docs/boards/2026-05-20-memory-foundation-spawn.md`

---

## 1. Decision matrix

| # | Candidate | A1 SIP | A2 FS | A3 Vault | A4 Fork | A5 Model | Score | Verdict |
|---|---|---|---|---|---|---|---|---|
| C1 | mempalace-current (incumbent) | ✅ | ⚠️ partial | ✅ loose | ✅ cond | ✅ | 25/40 (D4-D5 incomplete) | RECOMMEND-LAYER-OVER |
| C2 | mem0 | ✅ via meta | ❌ DB-resident | ⚠️ partial | ✅ self-host | ✅ defaults lock-in | 31/50 | VIABLE (hot-path only) |
| **C3** | **Letta MemFS** | ✅ native YAML | ✅ **strongest** | ✅ | ✅ | ✅ | **44/50** | **RECOMMEND ★** |
| C4 | Cognee | ✅ native | ✅ | ✅ strong (OWL) | ✅ caveat | ✅ | 35/50 | RECOMMEND |
| C5 | Zep / Graphiti | ✅ native | ❌ soft-fail (graph DB) | ⚠️ Wisdom tension | ✅ Graphiti only | ✅ | 36/50 | VIABLE |
| C6 | Anthropic Memory API | ✅ cond | ✅ | ✅ cond | ⚠️ Claude-locked | ❌ FAIL | 20/50 + axiom fail | **REJECT** |
| **C7** | **LangGraph + LangMem** | ✅ | ✅ cond (JsonlStore) | ✅ strong | ✅ | ✅ **strongest** | **41/50 (est)** | **RECOMMEND (provisional)** |

**Pass-all-5-axioms:** C3, C4, C7 (and C1 with caveats). All else fails ≥1 axiom.

## 2. Cross-cutting findings

### F1 — SIS currently FAILS its own A2 axiom (most important finding)

The mempalace baseline agent's deep code-read of `private/voice-operator/config/substrates.toml` revealed: ChromaDB (`mempalace_upstream/`) has been PRIMARY since 2026-05-06. ChromaDB binary segment dirs are NOT filesystem-readable without the engine running. **SIS therefore currently fails A2** — its own non-waivable filesystem-native axiom — even before any foundation change.

This finding alone justifies the foundation research and elevates the urgency from "should we adopt mem0?" to "we are out of compliance with our own substrate; how do we get back into compliance?"

### F2 — Three candidates pass all 5 axioms

- **C3 Letta MemFS** — markdown-files-in-git with YAML frontmatter. Convergent architecture with SIS file-contract.
- **C4 Cognee** — Pydantic DataPoint + OWL ontology grounding. Schema-sovereign primitive.
- **C7 LangGraph + LangMem** — namespace-tuple + pluggable BaseStore (with JsonlStore subclass). Library-level primitive, lowest framework opinionation.

Each represents a different shape of the same axiom-passing answer.

### F3 — Drift-resolution v1 had direction inverted (near-miss caught by research itself)

The lead agent's initial drift-resolution doc proposed archiving `mempalace_upstream/` (the LIVE store) as "legacy." The mempalace baseline research sub-agent verified `substrates.toml` + audit logs, caught the inversion, v2 retracted. Lesson saved to `feedback_verify_runtime_not_presence.md`. **This is the substrate-tier process working as designed** — Board-before-tag + parallel research agents + axiom-checking rubric collectively prevented a destructive ship.

### F4 — Layer the orchestration; replace the substrate

The mempalace baseline's strongest finding: ~2,000 LOC of the 3,455 is **orchestration** (Memory Bus + Guardian + audit + router + attestation injection) — no candidate replaces this. The replaceable part is the ~1,500 LOC of two substrate adapters. The Substrate ABC is 25 lines; swapping a substrate is ~200-300 LOC adapter + one branch in `_instantiate` + one stanza in `substrates.toml`.

Foundation choice does NOT require rewriting SIS memory. It requires writing one new adapter file.

### F5 — Cross-model bridge unsolved everywhere

No candidate handles cross-model (Claude ↔ GPT ↔ Gemini) memory natively. A2A is the emerging standard but it's an agent-coordination protocol, not memory. **Defer cross-model bridge to a separate research thread.**

### F6 — Anthropic Memory API is a Claude-jail trap for SIS substrate

REJECT on A5. `memory_20250818` is Claude-only by design; adopting it locks SIS to one model in violation of SIP §5. **Steal the "always view memory directory first" prompt prologue pattern** but do not adopt the tool.

### F7 — pgvector + JSONL is the honest null-hypothesis floor

Not a candidate (per Addendum). Boring sovereign baseline at ~300 LOC. Establishes "what does NOT using a memory product cost?" floor at <100ms p95, 5/5 sovereignty, zero framework opinion. Any candidate that scores worse than the pgvector baseline on retrieval quality OR exceeds its 300 LOC adapter cost without a clear architectural win should be REJECTED.

## 3. Recommendation

**Phase 0 — Dog-food C3 (Letta MemFS) + C7 (LangGraph + LangMem) head-to-head against the same 50-query eval set, before any Board ratification of substrate commitment.**

### Why both, not one

C3 and C7 differ on a single dimension that cannot be scored without measurement:

- **C3 Letta** ships a production-grade engine. Battery included. Adoption cost: Docker + ~10 hours integration. Risk: framework opinionation (agent runtime included, not just memory).
- **C7 LangGraph** is the library primitive. Adoption cost: ~6-10 hours + we write ~100 LOC JsonlStore subclass. Risk: scoring confidence is medium (no dedicated deep-research agent; 2x 529 Overloaded).

The 3-point score gap (44 vs 41) is **within measurement noise**. The real differentiator surfaces only under load on SIS-specific queries. Phase 0 dog-food resolves the choice with evidence.

### Phase 0 dog-food protocol (1-2 weeks)

1. Draft 50-query eval set covering the question shapes from Frank's recent transcripts (W18-W20 chronicle entries, this session, last 30 days of voice operator)
2. Build minimal Letta substrate adapter (~100-150 LOC) wired into Substrate ABC; ingest current ChromaDB corpus
3. Build minimal LangGraph + JsonlStore substrate adapter (~100-150 LOC) wired into Substrate ABC; ingest same corpus
4. Run eval set against both; measure precision@10, recall@10, latency p50/p95, attestation-preservation correctness
5. Side-by-side scorecard
6. Board ratifies the head-to-head winner, OR ratifies both (substrate-pluggable forever) if scores tie within ±2%

### Why not pick C3 outright

Two reasons:
1. **C7 has the highest forkability score** (D8: 5/5 — `pip install` only, no Docker). For downstream SIP forks, this matters more than 3 points of subtotal.
2. **Letta's framework opinionation is unmeasured** — its agent runtime is bundled with the memory layer. We can use Letta as a *library* (MemFS + retrieval) without the agent loop, but this requires probing.

### Why C4 (Cognee) is the second-tier alternative

If Phase 0 reveals neither C3 nor C7 handles the 6-vault canon cleanly — particularly if "vault dedup" or "canonical-class membership" turns out to be load-bearing for SIS — Cognee's OWL ontology grounding is the upgrade path. 35/50 is real signal; the schema-sovereign primitive is genuinely different from file-shaped candidates.

### Migration path (locks at Phase 0 winner)

1. **Phase 0** (1-2 weeks) — dog-food + side-by-side eval as above
2. **Phase 1** — winning adapter ships disabled in `substrates.toml`
3. **Phase 2** — flip to PRIMARY; ChromaDB demoted to fallback for 30-day migration window
4. **Phase 3** — if eval green, deprecate ChromaDB substrate; archive frozen `atoms.jsonl` to `_archive/` (the legacy fallback)
5. **Phase 4** — Board ratifies; `/bless` adds to Chronicle

### Falsifier

The Phase-0 dog-food recommendation is wrong if:
- Both C3 and C7 score precision@10 < 0.6 on SIS-specific queries → fall back to pgvector+JSONL baseline (300 LOC, 5/5 sovereignty)
- Cross-tab corruption surfaces under 3+ tab parallel write load → re-evaluate single-process coordination (Memory Bus alone may be insufficient)
- Wisdom Vault timelessness turns out to be incompatible with both candidates' lifecycle models → substrate stays as incumbent ChromaDB + we layer Cognee or LangMem above only for retrieval

## 4. What to steal from rejected/viable candidates

Even REJECT/VIABLE candidates contributed patterns worth adopting:

| Pattern | Source | How SIS applies it |
|---|---|---|
| "Always view memory directory first" prompt prologue | Anthropic Memory API | Encode in chosen foundation's prompt template |
| Observational Memory (dense observation log) | Mastra | Combine with `/bless` chronicle promotion — log = blessed observations |
| Six-memory-type taxonomy | MIRIX | Compose with 6-vault canon — pattern-extract only |
| Date-stamped tool-type versioning (`memory_20250818`) | Anthropic | Apply to SIS atom schema version stamps |
| Bi-temporal forensics | Zep/Graphiti | Optional future thread — chronicle evolution forensics |
| Event Compaction (38% token reduction) | A2A / ADK | Watch-list for cross-model bridge thread |
| Hybrid retrieval (vector + BM25 + entity) | mem0 | Verify each candidate's hybrid signal in Phase 0 |
| LangMem memory manager (extract/update/forget) | LangGraph | Maps to SIS `/bless` chronicle-promotion if C7 wins |

## 4b. Visual architecture

Full Mermaid diagrams at [architecture-overview.md](architecture-overview.md):

1. **Current state** — substrate fails A2 (ChromaDB binary not filesystem-native)
2. **Post-Phase-0 target** — tier-3 winner restores A2 compliance
3. **3-tier model** (Addendum 2) — Agent State + Operational + Substrate canon
4. **Decision matrix as quadrant** — A2 × score positioning
5. **Substrate ABC class diagram** — 25-line seam, swap is ~250 LOC adapter

The 3-tier model is the canonical mental model going into Phase 0:

```
Tier 1 — Agent State DB    sqlite-memory / brainctl pattern (C8)
Tier 2 — Operational       mem0 (optional)
Tier 3 — Substrate canon   Letta MemFS OR LangGraph + JsonlStore (Phase 0 winner)
```

## 5. Memory architecture diagram (post-decision, generic)

```
┌────────────────────────────────────────────────────────────────┐
│                     CLAUDE CODE SESSION                         │
│  CLAUDE.md (rules) + Auto Memory (MEMORY.md) + Skills MEMORY.md │
└─────────────────────────┬──────────────────────────────────────┘
                          │ (operational hot-path — Claude Code's own model)
                          ▼
┌────────────────────────────────────────────────────────────────┐
│                  SIS ORCHESTRATION LAYER (kept)                 │
│  Memory Bus MCP (singleton) │ Guardian │ Audit log │ Router    │
│                       Substrate ABC (25 LOC)                    │
└─────┬──────────────────────┬─────────────────────────┬─────────┘
      │                      │                         │
      ▼                      ▼                         ▼
 [Operational hot-path]  [Substrate canon — REPLACED]  [Frozen archive]
   mem0 (optional)          C3 Letta OR C7 LangGraph    atoms.jsonl
                            (Phase 0 winner)            (520 pre-migration)
      │                      │
      └─────────┬────────────┘
                ▼
     [6 vault MD files — Obsidian-readable canon, unchanged]
     [SIP attestation per atom — preserved via frontmatter or per-row JSON]
```

## 6. Next steps

1. ✅ This synthesis complete
2. **NEXT: Board memo locked** → `docs/boards/2026-05-20-memory-foundation-spawn.md`
3. **THEN: `/starlight-board` autonomously** per `feedback_run_starlight_board_autonomously.md`
4. **On Board PROCEED:**
   - Synthesis moves to `docs/research/published/memory-foundations-2026-05.md`
   - Run `node scripts/sync-research.mjs` to publish to site
   - `lib/research.ts` status flips to "published"
   - Commit + tag suggestion to Frank
   - MEMORY.md gets a project memory entry
5. **On Board REVISE:** address REVISE items, re-synthesize, re-Board
6. **On Board BLOCK:** defer foundation choice; document why incumbent stays + escalate

---

*Built on SIP — 2026-05-20 · Synthesis final · Recommendation: Phase 0 dog-food C3 + C7; Board ratifies head-to-head winner*
