# /sis-forge — Design Spec (v8.x)

**Date:** 2026-05-17
**Author:** Frank Riemer (with Claude Opus 4.7)
**Status:** Design REVISED — `/starlight-board` verdict REVISE 2026-05-17, all 7 REVISE items folded → writing-plans next → implementation
**Tier:** Substrate-class (touches `verticals/`, `STACK.md`, `REGISTRY.md` via Phase 4 spawn)
**Composes:** `/discover-genius`, `/starlight-board`, `/spawn-domain-stack`, Memory Bus, Cross-Repo Indexer
**Brainstorming session:** 2026-05-17 in-conversation (no separate brainstorm dir — design captured directly here)

---

## 1. Purpose

Build `/sis-forge` — a substrate-tier command that auto-extracts dense patterns from Frank's own SIS-tracked corpus and proposes which **vertical Intelligence System** to forge next (or, when corpus is thin, runs an empowering interview to surface one).

Answers the standing question: **"What should I systemize next?"** — using only material the user already has.

The vertical exposes one top-level command plus one companion skill:

- **`/sis-forge`** — substrate command, explicit invocation, full 4-phase pipeline
- **`sis-forge-router`** — companion skill, ambient auto-activation on intent / scattered-expertise / corpus-delta / explicit triggers

**Relationship to existing Excavation Tier:** `/sis-forge` does **not** replace `/discover-genius`. Genius takes explicitly-delivered corpus and excavates Genius Profile + Freedom Path. `/sis-forge` auto-delivers corpus from 5 known SIS-tracked sources, runs a density classifier, and *either* proposes a vertical directly or routes to Genius for empower-mode interviews. The 5-adapter pull constitutes corpus delivery under Genius's protocol step 1 (see §10 Genius Protocol Contract).

**Why a new command (vs. running `/discover-genius` + `/spawn-domain-stack` manually):**

1. Corpus auto-pull eliminates curation friction — Frank no longer needs to assemble files before excavation
2. Density routing distinguishes "build the obvious vertical" from "ask empowering questions" automatically
3. The board-gated proposal → spawn flow makes the irreversible action (scaffold creation) double-locked
4. Companion skill enables ambient discoverability when Frank describes scattered work without explicit ask

## 2. Success criteria

v8.x-stable ships if and only if **all** of:

1. **Phase 1 fan-out:** 5 extractor sub-agents (transcripts, vault, prompts, repos, external) run in parallel and return ≤ 200 atoms each within 120s.
2. **Phase 2 classifier determinism:** `cluster-stability.test.ts` passes — same corpus snapshot produces identical cluster IDs and bucket assignments across two consecutive runs.
3. **Phase 3 modes:** Three routing modes (auto-build, propose-menu, empower) all produce valid roadmap docs or invoke `/discover-genius` cleanly with pre-fed corpus.
4. **Phase 4 governance loop:** `/sis-forge --commit <id>` invokes `/starlight-board`, applies verdict (PROCEED / REVISE / BLOCK), surfaces explicit-ack via `AskUserQuestion` only on PROCEED, then fires `/spawn-domain-stack`.
5. **STACK.md amendment lock:** Any proposal requiring 10→11-IS expansion BLOCKS with `requires-taxonomy-board:true` — `/sis-forge` never auto-amends taxonomy.
6. **Dry-runs work:** `/sis-forge --dry-run` and `/sis-forge --commit <id> --dry-run` produce diagnostic output without writing roadmap docs / invoking Board / spawning scaffold.
7. **Companion skill triggers:** `sis-forge-router` auto-activates on intent phrases, scattered-expertise descriptions, corpus-delta detection, and explicit invocation.
8. **v86 symmetry test passes:** Every file referenced in `commands/sis-forge.md` exists; every extractor agent in registry; skill registered in `skills/skill-rules.json`.
9. **Dog-food:** `/sis-forge` run on the SIS repo itself produces a coherent proposal that Frank rates as ≥ 80% authentic ("yes, that's me / my work") per `starlight-genius` voice-authenticity bar.
10. **Genius protocol contract honored:** All atoms passed to `/discover-genius` empower-mode are from enumerable 5-adapter sources; user can `--exclude-source` any of them.
11. **Ambient attestation:** Every artifact (roadmap doc, scaffold files via spawn) carries SIP attestation footer with `source command: /sis-forge` and `corpus snapshot: <path>` lines.
12. **Karpathy hygiene visible:** Command output states assumptions before running; classifier exposes bucket counts; proposal-menu warns when max cluster < 5.

## 3. Scope

### In scope (v8.x-stable target)

- 4-phase pipeline command at `commands/sis-forge.md`
- Companion skill at `skills/intelligence/sis-forge-router.md` with 4 trigger paths
- 5 extractor sub-agents at `agents/sis-extractor-{transcripts,vault,prompts,repos,external}.md`
- Pure-function classifier at `tools/sis-forge/density-classifier.ts`
- TF-IDF + cosine clusterer at `tools/sis-forge/clusterer.ts`
- Corpus-delta helper at `tools/sis-forge/corpus-delta.ts`
- Corpus-scoping flags: `--exclude-source`, `--include-pattern`, `--since`, `--mode`
- Dry-run flags: `--dry-run` (Phase 1-3) and `--commit --dry-run` (Phase 4)
- Tests: unit + integration + v86 symmetry extension + cluster-stability + dog-fooding gate
- Registrations: `CLAUDE.md`, `AGENTS.md`, `STACK.md`, `skills/skill-rules.json`
- Limitations doc inline in `commands/sis-forge.md`

### Out of scope (v8.x-stable)

- Transformer embeddings for clustering (deferred to v9.x — TF-IDF MVP unless cluster-stability test fails)
- Auto-amendment of `STACK.md` 10-IS taxonomy (always BLOCK + escalate to taxonomy Board)
- Cross-platform parity with Codex / Gemini CLI / Cursor (substrate command, Claude Code primary surface)
- Re-running `/sis-forge` automatically on a schedule (manual invocation only; v9.x may add `/loop` integration)
- Multi-user corpus (single-user only; team-corpus aggregation is a separate vertical)
- Mutation of existing `verticals/*/` (only spawns new ones — extending existing verticals goes through `/spawn-domain-stack --extend`)

### Deferred to follow-up

- `/sis-forge --history` to list past proposals + outcomes
- `/sis-forge --reattest <proposal-id>` to refresh attestation after corpus drift
- Web dashboard view of proposals (would compose Cockpit)

## 4. Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         /sis-forge                                    │
│  (substrate command, commands/sis-forge.md)                           │
└────────────────┬─────────────────────────────────────────────────────┘
                 │
        ┌────────▼────────┐
        │  Phase 1        │   parallel fan-out 5
        │  CORPUS PULL    │───────────────────────┐
        └────────┬────────┘                       │
                 │                                │
        ┌────────▼────────┐    ┌──────────────────▼─────────────────┐
        │  Phase 2        │    │  5 extractor sub-agents (NEW):     │
        │  CLASSIFIER     │    │  • sis-extractor-transcripts       │
        │  (TF-IDF +      │    │  • sis-extractor-vault             │
        │   cosine ≥0.75) │    │  • sis-extractor-prompts           │
        └────────┬────────┘    │  • sis-extractor-repos             │
                 │             │  • sis-extractor-external (adaptive)│
                 │             └────────────────────────────────────┘
       ┌─────────▼─────────┐
       │  Phase 3          │   dispatch by mode
       │  PROPOSAL ASSEMBLY│
       └─┬───────┬───────┬─┘
         │       │       │
   auto-build  propose  empower
       │       │       │
       ▼       ▼       ▼
    [1 IS]  [2-3 IS]  /discover-genius interview
       │       │       │     (pre-fed corpus, see §10)
       └───────┴───┬───┘
                   │
        ┌──────────▼──────────┐
        │  Roadmap doc written│
        │  HALT (informational)│
        │  docs/proposals/    │
        │  sis-forge/         │
        └──────────┬──────────┘
                   │  (Frank reviews; if satisfied:)
        ┌──────────▼──────────┐
        │  /sis-forge --commit│
        │      <id>           │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  Phase 4            │
        │  GATE + SPAWN       │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  /starlight-board   │
        │  pressure-test      │
        └──────────┬──────────┘
                   │   verdict
        ┌──────────▼──────────┐
        │  PROCEED?           │
        └──┬────────────┬─────┘
           │ yes        │ REVISE / STOP
           ▼            ▼
   AskUserQuestion   write blockers
   explicit-ack      to proposal,
       │             halt
       ▼
   /spawn-domain-
   stack <domain>
```

## 5. Versioning + rollout

Per `/starlight-board` REVISE-1, alpha is split tighter so extractor-validity, classifier-quality, and proposal-format risks ship independently.

| Version | Scope | Ships when |
|---|---|---|
| **v8.x-pre-alpha** | Phase 1 + 2 only. Extractors run; classifier emits raw `{bucket, atoms[], cluster_summary}` JSON to `.sis-forge/buckets-<ts>.json` + stdout. No proposal doc. Phase 3 not invoked. Phase 4 not present. | Extractor adapters return ≥1 atom each on Frank's corpus, classifier passes `cluster-stability.test.ts` |
| **v8.x-alpha** | Adds Phase 3 — proposal assembly produces roadmap docs at `docs/proposals/sis-forge/<date>-<slug>.md`. Phase 4 stubbed: prints `/spawn-domain-stack` command but does NOT auto-invoke. | Frank rates ≥3 proposals as authentic; proposal format stabilizes |
| **v8.x-beta** | Phase 4 enabled — `--commit` invokes `/starlight-board`, parses verdict, surfaces explicit-ack via `AskUserQuestion`, fires `/spawn-domain-stack` on PROCEED. | At least 1 end-to-end forge → spawn cycle dog-fooded on SIS repo |
| **v8.x-stable** | Companion skill auto-activation wired (4 trigger paths). v86 symmetry harness extended. CLAUDE.md / AGENTS.md / STACK.md documentation finalized. | All 12 success criteria pass |

Each version transition runs through `/starlight-board` per board-before-tag.

## 6. Files created

| Path | Purpose | Ships in |
|---|---|---|
| `commands/sis-forge.md` | Substrate command spec — invocation, phases, exit codes, flags | pre-alpha |
| `skills/intelligence/sis-forge-router.md` | Companion skill, ambient trigger routing | stable |
| `agents/sis-extractor-transcripts.md` | Sub-agent: ~/.claude/projects via Cross-Repo Indexer | pre-alpha |
| `agents/sis-extractor-vault.md` | Sub-agent: memory/ Obsidian markdown + KG | pre-alpha |
| `agents/sis-extractor-prompts.md` | Sub-agent: skills/ + agents/ + commands/ frontmatter | pre-alpha |
| `agents/sis-extractor-repos.md` | Sub-agent: cross-repo via tools/audit-repo-portfolio.ps1 | pre-alpha |
| `agents/sis-extractor-external.md` | Sub-agent: Notion + Drive + Cowork (adaptive MCP) | pre-alpha |
| `tools/sis-forge/atom-schema.ts` | Atom type definition + JSONL serialization | pre-alpha |
| `tools/sis-forge/clusterer.ts` | TF-IDF + cosine ≥ 0.75 clustering MVP | pre-alpha |
| `tools/sis-forge/density-classifier.ts` | Pure function: clusters → mode (auto/propose/empower) | pre-alpha |
| `tools/sis-forge/corpus-delta.ts` | Hash diff vs last forge for ambient-trigger detection | stable |
| `tools/sis-forge/proposal-writer.ts` | Phase 3: clusters → roadmap markdown | alpha |
| `tools/sis-forge/board-gate.ts` | Phase 4: invokes /starlight-board, parses verdict | beta |
| `tests/sis-forge/cluster-stability.test.ts` | Determinism falsifier | pre-alpha |
| `tests/sis-forge/density-classifier.test.ts` | Bucket boundary tests (≥3/≥5/≥7) | pre-alpha |
| `tests/sis-forge/atom-budget.test.ts` | Truncation at >20k atoms | pre-alpha |
| `tests/sis-forge/taxonomy-conflict.test.ts` | 10→11-IS proposals BLOCK | alpha |
| `tests/sis-forge/phase1-parallel.test.ts` | Fan-out + graceful degradation | pre-alpha |
| `tests/sis-forge/phase4-board-gate.test.ts` | PROCEED/REVISE/BLOCK verdict handling | beta |
| `tests/sis-forge/existing-domain-collision.test.ts` | Auto-build hits existing IS → flips to propose-menu | alpha |
| `tests/sis-forge/empower-cold.test.ts` | Zero-corpus → /discover-genius cold start | alpha |
| `tests/sis-forge/v86-coverage.test.ts` | Symmetry: every referenced file exists | stable |

## 7. Files modified

| Path | Change | Ships in |
|---|---|---|
| `CLAUDE.md` | Add `/sis-forge` to commands table + substrate gate paragraph + limitations note | pre-alpha (preview) → stable (final) |
| `AGENTS.md` | Cross-platform mirror | stable |
| `STACK.md` | Add `/sis-forge` to "spawn-tier substrate commands" section | alpha |
| `skills/skill-rules.json` | Register `sis-forge-router` triggers | stable |

## 8. Command signature

```
/sis-forge                                       # default: full pipeline phases 1-3, halt
  [--exclude-source <name>...]                   # skip listed adapters: transcripts|vault|prompts|repos|external
  [--include-pattern <glob>]                     # only atoms matching pattern (applied after extraction)
  [--since <ISO-date>]                           # only atoms newer than date
  [--mode <auto|propose|empower>]                # override auto-detection
  [--dry-run]                                    # run extractors + classifier, print summary, no roadmap doc

/sis-forge --commit <proposal-id>                # Phase 4: Board + spawn
  [--dry-run]                                    # simulate Phase 4, no Board call, no spawn
```

**Exit codes:**

| Code | Meaning |
|---|---|
| 0 | Phase 1-3 success, roadmap written (or `--dry-run` complete); OR Phase 4 spawn complete |
| 10 | Empower mode invoked — handed off to `/discover-genius` |
| 20 | Phase 4 Board verdict = PROCEED-WITH-REVISE — proposal updated, awaiting Frank re-run |
| 30 | Phase 4 Board verdict = BLOCK — proposal updated, halted |
| 40 | STACK.md amendment required — taxonomy Board session needed first |
| 50 | Pre-flight failed — Memory Bus / Cross-Repo Indexer / starlight-genius dependency missing |
| 60 | Atom budget exhausted (>20k atoms) — narrow scope with flags |

## 9. Phase contracts

### Phase 1 — Corpus Pull (parallel, fan-out 5)

**Input:** invocation flags (scoping)
**Output:** `Atom[]` where each atom = `{ source, topic, summary, density_signal, citations: string[] }`
**Caps:** ≤ 200 atoms per source; ≤ 1000 total
**Persistence:** `.sis-forge/last-corpus-<timestamp>.jsonl` (for delta + reproducibility)
**Failure modes:** any sub-agent timeout → degraded; all sources silent → exit 50

### Phase 2 — Density Classifier (pure function)

**Input:** `Atom[]` from Phase 1
**Output:** `{ mode: "auto-build" | "propose-menu" | "empower", clusters: Cluster[] }`
**Algorithm:**
1. TF-IDF weight each atom's text (`clusterer.ts`)
2. Pairwise cosine similarity; cluster atoms with sim ≥ 0.75
3. Per cluster: count occurrences across distinct sources
4. Bucket:
   - signature: ≥ 7 atoms across ≥ 2 sources
   - framework: ≥ 3 atoms across ≥ 2 sources
   - anecdote: drop
5. Mode precedence:
   - ≥ 1 signature → `auto-build` (single proposal)
   - 0 signature + ≥ 2 framework → `propose-menu` (top 3)
   - 0 framework → `empower`

**Determinism guarantee:** same input atoms → same output. `cluster-stability.test.ts` verifies.
**Falsifier:** if unstable across runs, switch to transformer embeddings (v9.x).

### Phase 3 — Proposal Assembly (mode dispatch)

**Input:** `{ mode, clusters }` from Phase 2
**Output:** roadmap doc at `docs/proposals/sis-forge/<date>-<slug>.md` (auto-build / propose-menu) OR handoff to `/discover-genius` (empower)
**Roadmap doc structure:**
```markdown
# Vertical IS Proposal: <Name>

**Mode:** auto-build | propose-menu (candidate N of 3)
**Source command:** /sis-forge
**Corpus snapshot:** .sis-forge/last-corpus-<ts>.jsonl
**Cluster summary:** <pattern label> (<count> atoms, <source-count> sources)

## What the corpus shows
<2-3 sentence pattern summary + atom citations>

## Recommended Intelligence System
**Name:** <name per STACK.md naming conventions>
**Slot:** Domain Sub-Stack | Universal-IS extension | new (BLOCKED if 10→11-IS)

## Four-bucket sort
**KEEP:** <activities only Frank can do>
**DELEGATE:** <executor work>
**AUTOMATE:** <system / workflow work>
**KILL:** <work that compounds nothing>

## First three sub-systems
1. <sub-system> — <what it does>
2. <sub-system> — <what it does>
3. <sub-system> — <what it does>

## Estimated /spawn-domain-stack diff
<file list + line counts>

## Limitations + falsifiers
<density classifier confidence; refinement-bias caveat>

---
**Built on SIP** · Source command: /sis-forge · Corpus snapshot: <path>
```

**Failure modes:**
- Proposed name conflicts with locked 10-IS → exit 40 (BLOCK)
- Domain already exists in `verticals/` → flip to propose-menu with extend option
- Atom citation drift (referenced file no longer exists) → hard fail, re-run

### Phase 4 — Gate + Spawn (only on `--commit`)

**Input:** `<proposal-id>` referencing a roadmap doc
**Output:** scaffold via `/spawn-domain-stack` OR halt with blockers
**Flow:**
1. Load proposal from `docs/proposals/sis-forge/`
2. Invoke `/starlight-board <proposal-path>`
3. Parse verdict:
   - PROCEED → surface explicit-ack `AskUserQuestion` → on confirm, fire `/spawn-domain-stack <domain> --from-proposal <path>`
   - PROCEED-WITH-REVISE → write revisions to proposal frontmatter, exit 20
   - BLOCK → write blockers to proposal frontmatter, exit 30
4. On `--dry-run`: print what each step would do, no actual invocation

**Sovereign-class explicit-ack rule (per /yolo Hive §7.3.1):** Even on PROCEED, Frank must give fresh explicit ack via `AskUserQuestion` before `/spawn-domain-stack` fires. `--commit` does not propagate consent past Board.

## 10. Genius Protocol Contract

Per `agents/starlight-genius.md` reasoning protocol step 1 — *"Actively request missing sources — never guess. Halt if the person asks for excavation without providing material. 'Just tell me my genius' is not a valid input. Corpus is required."*

`/sis-forge` honors this clause structurally:

- The 5-adapter pull (transcripts / vault / prompts / repos / external) constitutes **explicit, enumerable corpus delivery**
- Frank's invocation of `/sis-forge` (or skill auto-activation he accepts) is the **consent signal**
- Sources are **listed in the proposal doc** under "Corpus snapshot" header — Frank sees exactly what was pulled
- `--exclude-source` lets Frank remove any source before re-running
- When empower mode triggers and corpus is passed to `/discover-genius`, the handoff message reads:
  > "Genius — Frank has authorized auto-corpus delivery via `/sis-forge`. Corpus is pre-fed from 5 enumerable adapters (see `.sis-forge/last-corpus-<ts>.jsonl`). This satisfies your protocol step 1 corpus-required clause. Proceed with reasoning protocol step 2."

This contract is documented in:
- `commands/sis-forge.md` under "Genius protocol contract" section
- `agents/sis-extractor-*.md` frontmatter `contract:` field
- `agents/starlight-genius.md` — small amendment noting auto-pull is corpus delivery (substrate change; ships under separate board pass)

## 11. Limitations

### Refinement-over-exploration bias

The density classifier surfaces patterns repeated ≥ 3 times. Novel ideas thought once never reach the bucket threshold. This means `/sis-forge` is **strongest for "what should I systemize from what I've already built"** and **weakest for "what should I build that I've never thought of."**

Structural counter-pressures:
- Empower mode invokes `/discover-genius` for borderline corpus (≥ 0 but < 3 occurrences)
- Explicit-ack at Phase 4 lets Frank reject any proposal regardless of density score
- `--mode empower` flag forces empowering interview even with dense corpus

**Mitigation rule:** Run `/sis-forge` **periodically** (recommended quarterly), not once-and-done. Old thinking shouldn't cement just because it appears in old corpus. Frank's *Audit metrics vs cause* memory applies — density outliers are hypothesis prompts, not diagnoses.

### Single-user only

`/sis-forge` v8.x is single-user. Team / multi-user corpus aggregation is a separate vertical (not in scope).

### TF-IDF MVP, not embeddings

Clustering uses TF-IDF + cosine MVP. If `cluster-stability.test.ts` fails on Frank's real corpus, switch to transformer embeddings in v9.x. TF-IDF is sufficient for the heterogeneous text corpus (markdown + frontmatter + transcript snippets) at MVP scale; embeddings add cost and dependency without proven necessity.

### MCP availability (external extractor)

The external extractor (`sis-extractor-external`) silently skips Notion / Drive / Cowork sources whose MCP servers are unavailable. If Frank explicitly invokes `--source=external` and ALL external MCPs are down, the extractor exits with diagnostic — but the default `/sis-forge` invocation tolerates partial external availability without surfacing it as an error.

## 12. Governance + attestation

### Substrate-tier classification

`/sis-forge` is **substrate-class** because Phase 4 invokes `/spawn-domain-stack`, which writes to `verticals/<domain>/`, `STACK.md`, `REGISTRY.md`. Phase 1-3 alone are informational, but the design as a whole touches substrate gate paths.

### Board gate placement

| Phase | Substrate gate? | Why |
|---|---|---|
| 1 (Corpus Pull) | No | Read-only |
| 2 (Classifier) | No | Pure function |
| 3 (Proposal) | No | Writes only to `docs/proposals/` |
| 4 (Spawn) | **Yes — `/starlight-board` BEFORE spawn** | Matches board-before-tag |

### Explicit-ack rule

Even after Board PROCEED, Frank gives fresh explicit ack via `AskUserQuestion` before spawn fires. Per `/yolo` Hive §7.3.1 sovereign-class merge rule.

### STACK.md amendment lock

Proposals requiring 10→11-IS expansion in `STACK.md` BLOCK (exit 40). `/sis-forge` never auto-amends taxonomy. Taxonomy expansion requires a separate `/starlight-board` session on a STACK.md amendment proposal, run by Frank manually.

### Ambient attestation

Every artifact written by `/sis-forge` (proposal docs + scaffolded files via `/spawn-domain-stack`) carries SIP attestation footer with `Source command: /sis-forge` and `Corpus snapshot: <path>` lines. No manual `/sip-attest` invocation needed.

## 13. Dependencies

Pre-flight check (runs before Phase 1) verifies:

- **Memory Bus v0.1+** — singleton MCP for atom persistence + recall (`mcp__memory-bus__memory_*`)
- **Cross-Repo Indexer v0.1+** — initialized index at `~/.claude/projects/<repo>/cross-repo-index/`
- **`/discover-genius` + `starlight-genius` agent v7.4+** — empower mode dependency
- **`/starlight-board` skill** — Phase 4 gate
- **`/spawn-domain-stack` command** — Phase 4 generator

Missing dependency → exit 50 with install instructions.

## 14. Testing strategy

### Unit tests (pure logic, ~10 tests)

- `cluster-stability.test.ts` — determinism falsifier (REVISE-2 mandate)
- `density-classifier.test.ts` — ≥3/≥5/≥7 boundary correctness; total function
- `atom-budget.test.ts` — truncation at >20k
- `taxonomy-conflict.test.ts` — 10→11-IS proposals BLOCK
- `corpus-delta.test.ts` — hash diff correctness

### Integration tests (orchestration, ~15 tests)

- `phase1-parallel.test.ts` — 5 sub-agents fan out; partial failures degrade
- `phase3-auto-build.test.ts` — signature cluster → single proposal
- `phase3-propose-menu.test.ts` — 2-3 framework clusters → 3-candidate menu
- `phase3-empower.test.ts` — zero framework → `/discover-genius` invocation
- `phase4-board-proceed.test.ts` — PROCEED + explicit-ack → spawn
- `phase4-board-revise.test.ts` — REVISE → halt with revision file
- `phase4-board-block.test.ts` — BLOCK → halt with blockers
- `phase4-dry-run.test.ts` — `--commit --dry-run` no side effects
- `existing-domain-collision.test.ts` — auto-build hits People IS → flips to propose-menu
- `genius-contract.test.ts` — corpus pre-fed cleanly, no protocol step 1 violation
- `mcp-degradation.test.ts` — external extractor with all MCPs down → graceful skip

### Symmetry tests (~5 tests)

- `v86-sis-forge-coverage.test.ts` — every file in command spec exists
- `skill-rules-symmetry.test.ts` — `sis-forge-router` registered with all 4 triggers
- `attestation-symmetry.test.ts` — every output file has SIP footer

### Dog-fooding gate (manual, before v8.x-stable tag)

Run `/sis-forge` on the SIS repo itself. Expected: detect the dense `verticals/`-creation pattern across all 5 sources and propose either *extending* Domain Sub-Stack Tier or building a meta-IS for "vertical builders." If it doesn't, extractors are wrong.

Authenticity bar: Frank rates the resulting proposal ≥ 80% authentic ("yes, that's me / my work") — same bar `starlight-genius` enforces.

## 15. Karpathy-hygiene mapping

| Rule (from CLAUDE.md) | How `/sis-forge` honors it |
|---|---|
| State assumptions before running | Phase 1 outputs one-line "Forging on N atoms across {sources}" |
| Treat confidence as suspect | Classifier exposes bucket counts + per-cluster atom citations in proposal |
| Push back when wrong | Borderline corpus (max cluster < 5) emits WARN + suggests empower mode |
| Ship minimum that satisfies | TF-IDF MVP, not embeddings; pre-alpha ships Phase 1+2 only |
| Surgical edits | Phase 4 invokes `/spawn-domain-stack` (which does the surgical scaffold), `/sis-forge` itself never touches `verticals/` |
| Never silently rewrite | STACK.md amendment is BLOCK + escalate; never auto-amend |
| Verify from source not memory | Atoms cite specific files; classifier failures hard fail rather than fallback |
| Convert vague asks into verifiable criteria | Roadmap doc enumerates "First three sub-systems" with definitions |
| Guard context window | ≤200 atoms per source cap; proposal doc < 200 lines |
| One careful pass | Sequential phases; no parallel mutation |
| Tests/types disagree → mental model wrong | `cluster-stability` falsifier; if fails, design changes (embeddings) — model not "fixed" with retries |
| Assume hallucination is default | Atom citations + corpus snapshot file make every claim verifiable |

## 16. Distribution + cross-platform

`/sis-forge` is a substrate command, so it ships in:

- `commands/sis-forge.md` (this repo, canonical)
- Substrate cross-mirror to AGENTS.md / GEMINI.md / .cursor/rules/ via the standard substrate-replication pattern
- v8.x-stable also installs globally to `~/.claude/commands/sis-forge.md` for use outside SIS repo

Operational installation (out of scope for this spec; handled by existing global-install pattern).

## 17. Open questions

1. **Atom representation format:** JSONL with what schema? Proposed: `{ id, source, file?, line?, topic, summary, weight?, ts }`. Lock in `tools/sis-forge/atom-schema.ts` during pre-alpha.
2. **Cluster naming:** Auto-generate cluster labels from top-N TF-IDF terms? Or accept "Cluster N" placeholder and let proposal-writer rename? Recommend top-N terms for legibility.
3. **Corpus snapshot retention:** How many `.sis-forge/last-corpus-*.jsonl` files to keep? Recommend 10 most recent, prune older.
4. **External extractor MCP fallback:** If user has Cowork folder but no Notion/Drive MCP, do we treat that as `--source=external --cowork-only`? Lock behavior in pre-alpha.

These are deliberately left open — to be resolved during writing-plans or implementation, not pre-locked at design time.

## 18. References

- `agents/starlight-genius.md` — Excavation Tier agent (composed in empower mode)
- `commands/starlight-board.md` (skill) — substrate Board (Phase 4 gate)
- `docs/superpowers/specs/2026-05-11-yolo-hive-design.md` — sovereign-class explicit-ack rule (§7.3.1)
- `CLAUDE.md` — substrate-tier governance gate, Karpathy-hygiene rules
- Memory: `project_v74_gis_alpha.md`, `project_v741_alpha_domain_substack.md`, `feedback_board_before_tag.md`, `feedback_run_starlight_board_autonomously.md`, `feedback_lead_with_authority.md`, `feedback_audit_metrics_vs_cause.md`

---

## /starlight-board verdict log

**Board pass 1 — 2026-05-17:** REVISE — 7 items folded:

1. Tighter alpha split (3 → 4 versions: pre-alpha / alpha / beta / stable) → §5
2. Specify TF-IDF MVP + cluster-stability falsifier → §6 / §9 Phase 2 / §14
3. Add `--exclude-source` / `--include-pattern` / `--since` flags → §8
4. Genius protocol contract documented → §10
5. STACK.md 10→11-IS expansion = BLOCK → §9 Phase 3 / §12
6. `--dry-run` + `--commit --dry-run` → §8 / §9 Phase 3 / §9 Phase 4
7. Refinement-bias limitation paragraph → §11

Board pass 2 (post-fold) deferred to writing-plans hand-off — if writing-plans surfaces design ambiguity, a second Board pass runs before implementation begins.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, domain-sub-stack, board-before-tag, explicit-ack]
- Verticals: starlight-intelligence-system@v8.x
- Generated: 2026-05-17
- Source command: spec authored by-hand, ready for /sis-forge dog-food validation post-implementation
- Corpus snapshot: N/A (design phase)
---
