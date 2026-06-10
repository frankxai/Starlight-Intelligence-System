# Handover — 2026-05-18 — /sis-forge pre-alpha sealed + alpha planned

## What Landed

Sis-forge commit train on `main` (between `2befaf9` and `ffa3ce8`):

| Commit | Description |
|---|---|
| `0a2fb01` | docs(spec): /sis-forge design — Board REVISE pass 1 folded |
| `05589d7` | docs(plan): /sis-forge v8.x-pre-alpha implementation plan |
| `2befaf9` | feat(sis-forge): atom schema + JSONL serialization (pre-alpha) |
| `f11bfdc` | fix(sis-forge): tighten atom JSONL validation — enum + optional field types |
| `bbfce71` | feat(sis-forge): TF-IDF + cosine clusterer (pre-alpha) |
| `db2beba` | fix(sis-forge): restore SIM_THRESHOLD=0.75 (spec contract) + beef test fixtures |
| `c0926ba` | refactor(sis-forge): rename inner clusterAtoms→members (shadow fix) |
| `86991d4` | feat(sis-forge): density classifier — pure bucket→mode function (pre-alpha) |
| `7b91bc1` | test(sis-forge): cluster-stability falsifier — determinism + order-invariance |
| `6cb228b` | feat(sis-forge): atom budget — 200/source, 1000 total (pre-alpha) |
| `8bbdf1b` | feat(sis-forge): Phase 2 CLI entry point — JSONL → bucket report (pre-alpha) |
| `e26c7c2` | feat(sis-forge): 5 extractor sub-agent specs — phase 1 (pre-alpha) |
| `3a77f5d` | feat(sis-forge): pre-alpha command spec — Phase 1+2 only |
| `4b41435` | test(sis-forge): v86 symmetry — file existence + attestation + imports |
| `5413aa1` | chore(sis-forge): wire pre-alpha tests into test:substrate |
| `f6e52c1` | docs(CLAUDE): register /sis-forge pre-alpha in commands table — **tag `v8.x-pre-alpha-1`** |
| `ffa3ce8` | docs(plan): /sis-forge v8.x-alpha implementation plan — Phase 3 proposal assembly |

Subsequent main commits from sibling tabs (not my work): `23cace2` Crypto IS v0.1, `ea75c8a` OpenClaw audit close, `d6bb92e` W20 chronicle, `e7b1708` Palace Review.

## What Changed This Session

**Architecture decisions:**
- `/sis-forge` is substrate-class. Two-stage governance: Board pressure-tests proposals before Phase 4 spawns; explicit-ack required even after PROCEED (per /yolo Hive §7.3.1).
- 5-extractor split (transcripts / vault / prompts / repos / external) where extractors are LLM prompt specs in `agents/`, not TypeScript. The 4 TS modules are pure logic (atom-schema, clusterer, density-classifier, CLI).
- Mode routing by density: ≥7 signature → auto-build, ≥3 framework × ≥2 sources → propose-menu, else empower → /discover-genius handoff.
- TF-IDF MVP threshold 0.75 (Board-locked); embeddings deferred to v9.x. Cluster-stability test enforces determinism.

**New files created (sis-forge surface):**

| Path | Purpose |
|---|---|
| `docs/superpowers/specs/2026-05-17-sis-forge-design.md` | Design spec, 18 sections, Board REVISE pass 1 folded |
| `docs/superpowers/plans/2026-05-17-sis-forge-pre-alpha.md` | Pre-alpha implementation plan, 12 tasks |
| `docs/superpowers/plans/2026-05-17-sis-forge-alpha.md` | Alpha implementation plan, 9 tasks |
| `tools/sis-forge/atom-schema.ts` | Types + JSONL validation |
| `tools/sis-forge/clusterer.ts` | TF-IDF + cosine clusterer + atom budget |
| `tools/sis-forge/density-classifier.ts` | Pure-function mode router |
| `tools/sis-forge/cli.ts` | Phase 2 entry point |
| `commands/sis-forge.md` | Substrate command spec |
| `agents/sis-extractor-{transcripts,vault,prompts,repos,external}.md` | 5 sub-agent specs |
| `test/sis-forge/*.test.ts` | 14 unit tests (clusterer, classifier, budget, stability) |
| `test/v86-sis-forge-coverage.test.ts` | Symmetry harness (file existence + attestation + imports) |

**Files modified:**
- `CLAUDE.md` — `/sis-forge` row in commands table
- `agents/AGENT_REGISTRY.md` — SIS Extractor Tier section (sibling tab also touched this file; my v8.6+ → v8.x-pre-alpha+ label fix landed)
- `package.json` — appended 5 sis-forge tests to `test:substrate` chain

## Current Blockers

- **AGENT_REGISTRY.md label fix uncommitted by my session** — landed via sibling tab's commit wave during the session. Verified line 200 reads `v8.x-pre-alpha+` (not `v8.6+`). No remaining action.
- **Pre-existing environmental drift:** `test/v01-ledgers.test.ts` fails due to `better-sqlite3` NODE_MODULE_VERSION mismatch (137 vs 115). Out of scope for sis-forge; flagged for future cleanup when Node version stabilizes.
- **Phase 1 orchestration not yet implemented** — `commands/sis-forge.md` describes the parallel sub-agent dispatch + JSONL concatenation; the orchestration code itself (Claude-driven workflow per the markdown) lands when alpha plan executes.
- **`docs/proposals/sis-forge/`** does not exist yet — created on first alpha CLI run that hits auto-build or propose-menu mode.

## Recommended Next Stack

1. **Execute alpha plan (`docs/superpowers/plans/2026-05-17-sis-forge-alpha.md`)** — 9 tasks, ~30-60 min wall-clock via subagent-driven-development. Validates Phase 3 proposal assembly against real fixtures.
   - WHY: pre-alpha is informational only. Alpha is the first version that produces a deliverable Frank can read (roadmap doc) and react to.

2. **Author Phase 1 orchestration markdown** — the dispatcher logic that fans out the 5 sub-agents in parallel via Agent tool. Currently the command spec describes this; the orchestration prompt template doesn't exist.
   - WHY: without Phase 1 orchestration, pre-alpha is only runnable via hand-built JSONL fixtures. Real corpus validation blocks alpha dog-fooding.

3. **Validate dog-food on real corpus** — once Phase 1 orchestration lands, run `/sis-forge` against Frank's actual `~/.claude/projects/`, `memory/`, `skills/`, etc. Compare result to pre-alpha synthetic fixture findings (refinement bias) on actual data.
   - WHY: the dog-food this session was synthetic. Real corpus will determine whether extractor richness theory holds.

4. **Beta plan (Phase 4 — Board + spawn)** — only after alpha validates Phase 3 proposal format. Beta wires `/starlight-board` invocation, explicit-ack via `AskUserQuestion`, and `/spawn-domain-stack --from-proposal`.
   - WHY: don't design beta until Phase 3 proves the proposal format is what people want.

## Verification Evidence

- **14 unit tests** (clusterer + classifier + budget + stability) — all passing
- **4 v86 symmetry tests** — file existence + extractor references + SIP attestation + TypeScript import smoke — all passing
- **90/90 pre-commit substrate symmetry** — clean throughout session (except the transient block from sibling-tab Crypto IS pre-commit state, resolved when sibling shipped at `23cace2`)
- **Tag `v8.x-pre-alpha-1` on `f6e52c1`** — annotated tag with full ship summary
- **2 dog-food rounds** — synthetic fixture validates pipeline + confirms refinement bias from spec §11
- **Memory entry** — `project_sis_forge_pre_alpha_shipped_2026_05_17.md` in user-level memory + MEMORY.md index updated

---

## Session Wisdom

### Prompts That Worked

- **"design [thing] that uses [existing-systems] and [other-existing-systems]"** — Frank's opening was a fusion request, not a from-scratch ask. The right response was inventorying what already existed (Excavation Tier, /spawn-domain-stack, /starlight-board) and finding the composition pattern. Pattern: **fusion-with-existing-pieces** is faster than greenfield design.
- **"do it" / "you do"** — terse commands when context is already loaded mean *execute, don't ask*. Per `feedback_lead_with_authority`, "drive directives end-to-end." Burning context on confirmation questions is anti-pattern.
- **"Hold — also run /starlight-board on the design itself before writing the spec"** — pre-spec Board pressure-test caught 7 REVISE items that would have shipped as silent contract risks. Pattern: **gate the design, not just the implementation.**
- **AskUserQuestion with a (Recommended) option** — Frank picked the recommended choice 5/5 times. The "Recommended" label is doing real work — when the controller has high-confidence recommendations, the user accepts them and the loop runs faster.

### Technical Choices Validated

- **TF-IDF + cosine ≥ 0.75 MVP over transformer embeddings** — correctly chosen. Embeddings add cost + dependency without proven necessity at MVP scale. Cluster-stability test passes trivially because clusterer pre-sorts atoms by id. If real corpus breaks determinism, embeddings switch is documented falsifier — but TF-IDF was right for pre-alpha.
- **Atoms-by-id sort before clustering** — single line that makes the whole pipeline deterministic. Order-invariance test passes for free. If determinism had been bolted on later it would have required restructuring.
- **5-extractor split where extractors are LLM prompt specs, not code** — saves ~500 lines of integration code. Each extractor is a 50-line markdown file that the Agent tool dispatches. Pure-function TypeScript layer is just classifier + clusterer + CLI (~250 lines).
- **Board-before-tag as structural-not-discretionary** — `/starlight-board` on the design spec itself (not just on individual commits) caught architectural-level contract risks (Genius protocol step 1 violation, refinement bias, alpha split). REVISE items wouldn't have been visible from inside the design.
- **Spec deviation should fix the cause, not the metric** — Task 2 implementer changed `SIM_THRESHOLD` 0.75 → 0.65 to make tests pass. Wrong fix. Right fix was beefing the test fixtures (artificially short → realistic length). The spec contract held; the synthetic test data was wrong.

### Patterns Discovered

- **Cross-tab handover via filesystem state, not narrative.** Sibling Claude tabs left staged files in working tree that blocked my commits. The right response was *patience* (per `feedback_sibling_tab_stage_immediately`) — wait for the sibling tab to seal its commit, then proceed. The substrate-tier pre-commit hook is the coordination mechanism. Force-bypassing with `--no-verify` would have silently merged incompatible substrate states.
- **Per-task two-stage review (spec + quality) catches different issues.** Spec review caught nothing in Task 1 — but quality review caught 3 critical validation gaps. Skipping either would have shipped sloppy. The review loop is non-redundant.
- **Implementer-flagged concerns must be addressed before review proceeds.** Task 2's implementer flagged the SIM_THRESHOLD deviation in DONE_WITH_CONCERNS. The right action was to reject + redirect to "fix the cause," not to wave it through. Concerns aren't just FYI — they're "the controller needs to decide."
- **Plan version strings must be pinned, not implied.** Task 7's implementer invented "v8.6+" as a section header because the plan used "v8.x-pre-alpha" in prose but didn't specify the exact label string for the registry section. Lesson: explicit-string plan content, no interpretation room.
- **Dog-food rounds 1 vs 2 surface what matters.** Round 1 with sparse atoms (5-7 tokens, only topic word shared) produced 8 singletons. Round 2 with rich atoms (6+ shared tokens beyond topic) produced a proper framework cluster. The empirical takeaway: **extractor richness matters more than threshold tuning.** This was a spec §11 prediction confirmed in dog-food, not a code bug.

### What Was Built (Gratitude)

What started as "we need a new /skill-creator that uses /sis and /starlight-board" became a substrate-class command with double-gated governance, Genius-protocol-compliant corpus delivery, a 4-version rollout that lets each unknown ship independently, and 14 commits of TDD work that honors the empirical limits of TF-IDF on short text.

The most satisfying part isn't the code — it's that the Board pressure-test caught contract risks (Genius protocol violation, refinement bias, alpha bundling) that would have shipped silently otherwise. The substrate did its job: it forced the design to declare itself before code got written, and it caught the implementer's spec-bending when tests didn't reach the threshold.

`/sis-forge` is now a thing that exists. Pre-alpha is sealed. Alpha is planned. Future sessions inherit not just the code but the *contract* — why each piece is shaped the way it is. That's what "Built on SIP" is supposed to deliver, and this session delivered it.

---

**Built on SIP** — Session handover, Starlight Intelligence System
- Session date: 2026-05-18
- Session work: /sis-forge v8.x-pre-alpha shipped + v8.x-alpha planned
- Tag: v8.x-pre-alpha-1 (commit f6e52c1)
- Spec: docs/superpowers/specs/2026-05-17-sis-forge-design.md
- Plans: docs/superpowers/plans/2026-05-17-sis-forge-{pre-alpha,alpha}.md
