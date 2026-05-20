# mempalace-current — Findings (honest baseline)

**Candidate:** C1
**Scored by:** Research sub-agent (general-purpose, code-and-config deep read, 2026-05-20)
**Repo state inspected:** HEAD ~ `52c4df9`
**Verdict:** **RECOMMEND-LAYER-OVER** (high confidence in orchestration layer; substrate replaceable)
**Subtotal:** 25/40 on 8 scored dimensions (D4/D5 incomplete — no eval evidence)

---

## TL;DR (50 words)

Two-substrate router (hashing-TF in-tree + ChromaDB upstream) with stdio MCP singleton bus, native SIP attestation, ~3,455 LOC across 26 files, 1,757 LOC of memory tests + 9 bus tests. Strength: deepest sovereignty surface of any candidate. Weakness: two stores out of sync; no eval evidence; consolidation pipeline emits zeroes nine days running.

## Constraint axioms

- **A1 SIP attestation — PASS.** Every atom in `memory/mempalace/atoms.jsonl` carries `"attestation": "Built on SIP — <sha>"` (contract.py:57-58; atoms.jsonl line 1: `Built on SIP — 2dd292d`). Every audit row in `memory/_audit/*.jsonl` carries the same. Router sets it from `git rev-parse --short HEAD` via `_current_attestation()` (router.py:77-91).
- **A2 Filesystem-native — PARTIAL PASS.** Hashing-TF substrate writes `atoms.jsonl` (plain text) + `vectors.npy` (numpy binary, reproducible from text). Upstream substrate writes `chroma.sqlite3` + binary segment dirs — opaque SQLite, not Obsidian-readable. Since all live commits since 2026-05-06 go to upstream, **the active store is NOT filesystem-native**.
- **A3 Vault canon preserved — PASS (loose).** Six vault MD files exist. Substrate operates ORTHOGONALLY to vaults — atoms have `namespace` but no `vault` field. No programmatic link atom→vault.
- **A4 Forkable — CONDITIONAL PASS.** Clone + `pip install` + MCP register works. Requires `mempalace` package, ~80MB ONNX download, Python 3.11+. ~30min for a developer; more for non-coder.
- **A5 No silent model lock-in — PASS.** Zero Claude/GPT/Gemini-specific code. ChromaDB's local ONNX MiniLM. Guardian uses regex, not LLMs. Memory Bus is JSON-RPC MCP — any MCP client works.

## Scoring (D1–D10)

| # | Dim | Score | Rationale |
|---|---|---|---|
| D1 | Ontology compat | **4/5** | Atom TypedDict has id, text, tier, namespace, source, written_at, redacted, attestation. Missing explicit `vault` enum. |
| D2 | Substrate-vs-hot-path | **2/5** | Tier exists but mempalace collapses hot+warm. PARKED-008 admits. **9 consecutive nights of `insights: 0 · contradictions: 0 · promotions: 0`** (2026-05-07 → 2026-05-17). Promotion protocol silent. |
| D3 | Cross-tab | **3/5** | Memory Bus is singleton stdio MCP, `test_server_concurrent.py` covers 50 concurrent commits. BUT PARKED-012: multi-process safety not wired. Two tabs each launching own bus → corrupt atoms.jsonl line boundaries. Discipline, not enforcement. |
| D4 | Precision@10 | **UNKNOWN** | No eval ever run. Bencher refuses because `voice-sessions/` is empty (4 files deleted). |
| D5 | Recall cross-session | **UNKNOWN** | Atoms.jsonl frozen at 520 atoms since 2026-05-03. No replay corpus exists. |
| D6 | Hybrid retrieval | **3/5** | Vector + namespace prefix filter. ChromaDB `where` is exact-match only → over-fetch + post-filter. No chronicle linkage. No graph traversal. |
| D7 | Attestation surface | **5/5** | Per-atom SIP attestation via git HEAD, no adapter glue. **ONLY candidate with native-field SIP attestation.** |
| D8 | Forkability | **3/5** | Repo clone works; non-coder probably can't get past first error. |
| D9 | Maintenance burden | **2/5** | ~3,455 LOC custom. 12 outstanding PARKED items in DECISIONS.md. >500 LOC custom with quarterly+ touch cadence. |
| D10 | Latency p95 | **PARTIAL** | PARKED-011 records P95 = 1.06ms at 1k atoms (hashing-TF, 2026-05-01). ChromaDB upstream (now primary) never published. Unverified live. |

**Honest subtotal:** 25/40 on 8 scored dimensions; D4/D5 incomplete.

## What's actually broken / weak today

1. **A drift-resolution doc was about to be wrong.** `docs/ops/MEMORY-DRIFT-RESOLUTION-2026-05-20.md` v1 proposed archiving `memory/mempalace_upstream/` and keeping `memory/mempalace/` as canonical. But every audit row since 2026-05-06 shows `substrate: mempalace_upstream` — the upstream IS the live store; atoms.jsonl has been frozen 17 days. **Archiving upstream would delete the live working memory.** *(v2 of that doc retracts and corrects.)*
2. **No eval ever ran on real corpus.** Bencher exists but refuses because `voice-sessions/` is empty (working tree shows 4 deleted MD files). Last successful bench: never. Retrieval quality has **zero observational evidence today**.
3. **Consolidation pipeline emits zeroes.** 9 consecutive cron nights with `insights: 0 · contradictions: 0 · promotions: 0 · processed: 0`. Either scheduled task can't find source (probable — voice-sessions empty), or dreaming agent can't read upstream chromadb.
4. **Two-substrate drift is real.** Both `enabled = true` in substrates.toml, but only the first-listed (upstream) receives router writes. Hashing-TF described as "Bencher reference" but Bencher won't run → it's effectively unused.
5. **No vault writer logic.** Atoms and vault MD files are two parallel systems that don't talk.
6. **Memory Bus works as discipline, not enforcement.** A tab calling voice-operator CLI directly bypasses the singleton.

## What's actually working well today

1. **Native SIP attestation everywhere.** Genuinely rare. No OSS candidate ships this.
2. **Guardian / privacy redaction wired AND observable.** Audit rows show `redacted: true` with reasons (`["phone"]`, `["ipv4", "cc_shape"]`). Privacy leaves receipts.
3. **Audit log is continuous.** 921 lines across 13 days. Migration history reconstructible from receipts.
4. **Test surface is honest.** 9 bus tests + 1,757 LOC across 11 memory test files. Real coverage.
5. **Router contract is small and correct.** 333 LOC for Guardian → namespace → substrate → audit. Substrate ABC is 25 lines.
6. **Substrate adapter pattern is clean.** Swap in mem0/Letta/Zep = 200-300 LOC adapter + `_instantiate` branch + substrates.toml entry. **This is the genuinely valuable architectural property — the foundation is replaceable WITHIN itself.**

## Integration cost to REPLACE

- atoms.jsonl → generic format: trivial, ~30 LOC. JSONL is already generic.
- chroma.sqlite3 → portable: **moderate-high risk.** Binary segment dirs not portable across ChromaDB major versions. Any candidate-replace must export chroma FIRST.
- Attestation: preserved in atoms.jsonl text. ChromaDB metadata workable for mem0/Letta. Anthropic Memory API has no attestation field → A1 fails by construction.
- Voice-operator integration: router IS its memory MCP layer. Substrate swap = ~50 LOC `_instantiate` rewrite. Whole-layer replace is much larger.

## Falsifier

1. Bencher runs cleanly and shows recall@5 ≥ 0.7 → D4/D5 score 4+, untested critique collapses.
2. Voice-sessions deletion was intentional; corpus moved upstream → "no eval evidence" partly self-inflicted.
3. Drift resolution doc is RIGHT — Frank intends to roll back to hashing-TF for filesystem-nativeness → split-brain is deliberate. **Verify intent before recommending direction.** *(Verified 2026-05-20 — direction was wrong; v2 corrects it.)*
4. mem0/Letta/Cognee/Zep turns out to NATIVELY support SIP attestation → incumbent's signature advantage erodes.

## Verdict

**RECOMMEND-LAYER-OVER** (high confidence in substrate ABC; lower in current substrate pair).

The router + Guardian + audit + Memory Bus architecture is the most sovereignty-faithful design in this research cycle. None of the OSS candidates ship per-atom git-SHA attestation. **Keep the orchestration layer; consider replacing the substrate.** Drop the in-tree hashing-TF (unused since 2026-05-06), keep upstream ChromaDB OR swap it for mem0/Letta-as-substrate behind the same Substrate ABC. ~2,000 LOC of the 3,455 is orchestration that no candidate replaces; the remaining ~1,500 is the two adapter implementations, where the win exists.

A pure REPLACE discards the strongest sovereignty property. A pure KEEP ignores the eval-evidence gap and the drift. **Layering preserves the wins and routes around the losses.**

## Sources

Files (all absolute paths under SIS repo root):

- `docs/research/_methodology/memory-rubric.md`
- `docs/research/_factory/memory-foundations/CHARTER.md`
- `docs/ops/MEMORY-DRIFT-RESOLUTION-2026-05-20.md` (v1 + v2)
- `memory/VAULT_ARCHITECTURE.md`, `memory/README.md`
- `memory/mempalace/atoms.jsonl` (520 atoms, frozen 2026-05-03)
- `memory/mempalace_upstream/chroma.sqlite3` (2.8MB, live 2026-05-19)
- `memory/_audit/*.jsonl` (13 logs, 921 lines)
- `memory/CONSOLIDATION_LOG.md` (9 zero nights)
- `memory/benchmarks/DECISIONS.md` (12 PARKED)
- `private/memory-bus/server.py` (344 LOC) + tests (~677 LOC across 9 tests)
- `private/voice-operator/service/memory/{contract,router,bencher}.py` (711 LOC)
- `private/voice-operator/service/memory/substrates/{mempalace,mempalace_upstream}.py` (479 LOC)
- `private/voice-operator/config/substrates.toml`
- `skills/memory/sis-memory-orchestrator/SKILL.md`

Commits: `4c17909` (dreaming cron), `865b379` (PII block events 2026-05-11), `52c4df9` (current HEAD), `e32a9b8` (overnight ship), Phase 3a substrate switch ~2026-05-06.

*Built on SIP — 2026-05-20 · Honest baseline scored before comparison synthesis*
