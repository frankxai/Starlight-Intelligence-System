---
title: Spec-Trace Primitive — design
status: DESIGN (MVP shippable today; Phase 2/3 require /starlight-board pre-pass)
tier: hybrid (MVP operational; Phase 2 substrate via Packet schema; Phase 3 substrate via cross-repo file contract)
date: 2026-05-11
author: starlight-architect (driving for Frank)
related:
  - https://onehorizon.ai/ (external prior-art reference; intentionally not adopted)
  - https://onehorizon.ai/docs/getting-started/concepts (external; primitive comparison)
  - private/memory-bus/indexer/atom_factory.py (compose-point #1)
  - private/voice-operator/service/orchestrator_router.py (compose-point #2)
  - docs/superpowers/specs/2026-05-11-yolo-hive-design.md (orchestration sibling)
  - docs/superpowers/specs/2026-04-29-memory-bus-core-design.md (atom contract origin)
  - memory/MEMORY.md project_memory_bus_v01 (v0.1 substrate state)
  - CLAUDE.md §"Substrate-tier governance gate" (board-before-tag invariant)
attestation: Built on SIP — sovereign-spawned, attestation-aware
falsifier: "if traceability can't compose with existing Memory Bus atoms, the design is wrong"
falsifier_status: PASSES — compose path validated against atom_factory.py:23-29 and orchestrator_router.py:211-333
---

# Spec-Trace Primitive — Design

## 1. Purpose

A bidirectional provenance graph linking written specs ↔ dispatched agent runs ↔ commits ↔ PRs. Closes the loop that currently runs open-ended in SIS: specs sit in markdown, dispatches log to JSONL, commits land in git — three separate substrates with no native edges between them.

**Framing.** Frank observed OneHorizon AI's "Send to agent" button on Instagram. Their differentiator is *not* the architecture (thin primitives, multi-tenant SaaS, Smithery MCP relay — all incompatible with sovereign substrate). Their differentiator is **the gesture**: a written spec becomes a dispatched run with bidirectional commit/PR traceability via one click. This spec adopts the gesture as a sovereign primitive, rejects the SaaS shape, and composes with existing SIS infrastructure (Memory Bus, OrchestratorRouter, /spec, /starlight-board).

**Decision rejected upstream:** signing up for OneHorizon's free tier. Free-tier capability is real, but their value-vs-Linear-vs-GitHub-vs-Notion delta is **only** the send-gesture + traceback graph, which SIS is about to build natively. Adopting their tool would cost data-gravity, UX muscle-memory training on a substrate to be replaced, and a Smithery dependency that leaks dispatch context to a hosted relay.

## 2. Scope

**MVP (today, 2026-05-11) — operational-tier only:**
1. Sidecar format + directory convention (`memory/spec-trace/<spec-id>.md`)
2. Post-commit hook (PowerShell + bash) that parses `Spec: <spec-id>` commit trailers
3. Atom factory extension (3 new prefixes registered)
4. CLI helper for manual link/list/show operations
5. Tests (7 new tests, target ≥95% coverage on hook + factory delta)

**Phase 2 (post-Friday-demo, target 2026-W21) — substrate-tier:**
1. `Packet.spec_id` schema field (substrate change → /starlight-board pre-pass required)
2. `RoutingDecision.spec_id` propagation through `routing.jsonl`
3. Brain publisher carries `spec_id` for visual provenance
4. Cockpit `<SendToAgent>` panel (orb-inline)
5. Board-at-spec-creation skill (auto-fires `/starlight-board` for substrate-class spec birth)

**Phase 3 (target 2026-W22) — substrate-tier:**
1. Cross-repo hook installation tool
2. Multi-repo sidecar aggregation through Memory Bus indexer
3. PR-aware backflow (initially via GitHub Actions; fallback to polling)
4. OneHorizon-parity full UX route at `/cockpit/dispatch`

**Hard non-goals (cut from any phase):**
- ❌ GitHub Actions as primary backflow (post-commit hook is primary; GHA is Phase 3 enhancement only)
- ❌ Smithery MCP relay
- ❌ Multi-tenant journal model
- ❌ Web UI for spec editing (specs stay markdown files; cockpit only dispatches them)
- ❌ Cryptographic attestation of spec→commit linkage (deferred to a future SIP attestation cycle if needed)

## 3. Architecture

### 3.1 Compose-points (validated against real code)

| Existing substrate | File / line | Extension |
|---|---|---|
| Memory Bus atom factory | `private/memory-bus/indexer/atom_factory.py:23-29` | Add `spec-trace_`, `dispatch_`, `commit-link_` to `_FILE_TYPE_BY_PREFIX` (+3 lines) |
| Memory Bus indexer crawler | `private/memory-bus/indexer/crawler.py` | No change — crawls `~/.claude/projects/*/memory/` recursively, `memory/spec-trace/` inherits |
| Orchestrator router (Phase 2) | `private/voice-operator/service/orchestrator_router.py:211-333` | Thread `packet.spec_id` into `RoutingDecision`; append to `routing.jsonl` |
| Packet schema (Phase 2) | `private/voice-operator/service/packet.py` | Add optional `spec_id: str \| None = None` |
| Brain publisher (Phase 2) | `private/voice-operator/service/brain_publisher.py` | Include `spec_id` in event payloads |
| `/spec` skill | `skills/.../spec.md` | Phase 2: on substrate-class spec creation, invoke `/starlight-board`, record verdict to sidecar |
| Memory Bus MCP `memory_recall` | `private/memory-bus/server.py` | No change — sidecar atoms recall by content for free |

### 3.2 Sidecar file format and storage

**Two storage paths (dual-write):**

| Path | Role | Git-tracked? | Memory Bus indexed? |
|---|---|---|---|
| `<repo>/memory/spec-trace/<spec-id>.md` | **Canonical** — source of truth, portable with repo | Yes | No (not in crawl root) |
| `~/.claude/projects/<project-slug>/memory/spec-trace_<spec-id>.md` | **Indexed copy** — Memory Bus recall surface | No | Yes (top-level `.md` with registered prefix) |

**Rationale:** Memory Bus crawler at `crawler.py:11-24` reads only top-level `.md` files under `~/.claude/projects/*/memory/`. The crawler does not recurse into subdirectories (see `list_memory_files`, lines 27-34) and does not crawl repo `memory/` directories. To satisfy the falsifier ("compose with existing Memory Bus atoms") without invasive crawler changes, the post-commit hook writes both files: canonical for git-tracking, indexed copy for recall. The indexed copy is regenerable from the canonical at any time via `tools/spec-trace.py sync`.

**Project-slug resolution:** auto-memory path is computed by encoding the repo path with `:` → `` (drop) and `\` → `-`. For SIS: `C:\Users\frank\Starlight-Intelligence-System` → `C--Users-frank-Starlight-Intelligence-System`. Matches existing convention used by `crawler.py:project_name_from_memory_dir`. MVP hardcodes this mapping for SIS only; Phase 3 derives generically.

**Canonical sidecar format:**

```markdown
---
spec_id: 2026-05-11-spec-trace-design
spec_path: docs/superpowers/specs/2026-05-11-spec-trace-design.md
created: 2026-05-11T14:00:00Z
classification: operational           # operational | substrate
board_verdict: none                   # none | PROCEED | REVISE | BLOCK
board_verdict_at: null                # ISO timestamp or null
board_packet: null                    # path to board packet if substrate
project: Starlight-Intelligence-System
repo_root: C:/Users/frank/Starlight-Intelligence-System
---

## Dispatches

(Phase 2+ — populated by /dispatch with packet.spec_id set)

## Commits

- 2026-05-11T14:32:11Z · `abc1234` · `main` · feat(spec-trace): MVP hook + atom factory patch

## PRs

(Phase 2+ — populated by GitHub action or polling)

## Notes

(Free-form append-only; not parsed)
```

**Why frontmatter:** matches existing memory-vault convention. The `project` and `repo_root` fields are present from day 1 so Phase 3 cross-repo aggregation needs no schema migration. The `classification` field is the only routing signal needed to decide whether the spec required `/starlight-board` at creation.

### 3.3 Commit trailer convention

Trailer key: `Spec:` (case-insensitive parse, exact-match emit).

```
feat(spec-trace): MVP hook + atom factory patch

Phase 1 of the Spec-Trace primitive. Adds post-commit hook that
parses Spec: trailers and appends to memory/spec-trace/<spec-id>.md.

Spec: 2026-05-11-spec-trace-design
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

Multiple trailers allowed (cross-spec commits append to multiple sidecars):

```
Spec: 2026-05-11-spec-trace-design
Spec: 2026-05-11-cost-plane-design
```

**Agent prompting (Phase 2):** when dispatched via cockpit `<SendToAgent>`, the agent receives the spec_id as part of the packet context with explicit instruction to include `Spec: <spec-id>` as a trailer in every commit. Existing /yolo conductor pattern extends naturally.

### 3.4 Data flow

**Forward (today MVP, manual):**
1. Frank writes spec at `docs/superpowers/specs/2026-05-11-spec-trace-design.md`
2. Frank or agent commits work with `Spec: 2026-05-11-spec-trace-design` trailer
3. Post-commit hook fires, parses trailer, appends event to `memory/spec-trace/2026-05-11-spec-trace-design.md`
4. Memory Bus indexer crawls on next cycle; sidecar atoms recall-able via `memory_recall`

**Forward (Phase 2, automated):**
1. Cockpit `<SendToAgent>` → POST `/api/dispatch` with `{spec_id, target}`
2. API loads spec body + Packet built with `spec_id`
3. Router routes, dispatcher fires, `RoutingDecision.spec_id` logged
4. Agent commits work with `Spec:` trailer (per system prompt instruction)
5. Hook closes the loop as above

**Backward (commit → spec):**
- Post-commit hook reads `HEAD` commit message
- Greps `^Spec: (\S+)` (multi-line, case-insensitive)
- For each `<spec-id>`:
  - Resolve **canonical** sidecar at `<repo>/memory/spec-trace/<spec-id>.md`
  - Create if missing (read `docs/superpowers/specs/<spec-id>.md` for frontmatter seed; if spec doc missing, create with `spec_path: UNRESOLVED`)
  - Append event line to `## Commits` section: `- <iso> · \`<short-sha>\` · \`<branch>\` · <subject>`
  - Idempotent: skip if `<short-sha>` already present
  - **Dual-write:** copy canonical content to `~/.claude/projects/<project-slug>/memory/spec-trace_<spec-id>.md` (indexed copy for Memory Bus recall)
  - Indexed-copy write failure logs to stderr but does NOT fail the commit; canonical remains durable

## 4. Components

| Path | Purpose | Phase | Approx lines |
|---|---|---|---|
| `memory/spec-trace/README.md` | Sidecar convention + format spec | MVP | ~80 |
| `tools/hooks/spec-trace-postcommit.ps1` | PowerShell post-commit hook (dual-write: canonical + indexed copy) | MVP | ~80 |
| `tools/hooks/spec-trace-postcommit.sh` | Bash post-commit hook (dual-write) | MVP | ~70 |
| `tools/install-spec-trace-hook.ps1` | One-command hook install into `.git/hooks/post-commit` | MVP | ~30 |
| `tools/spec-trace.py` | CLI helper: `list-specs`, `show-trace`, `link-commit`, `init-sidecar`, `sync` (regenerate indexed copy from canonical) | MVP | ~180 |
| `private/memory-bus/indexer/atom_factory.py` | +3 prefixes | MVP | +3 |
| `test/spec-trace/test_postcommit_hook.py` | Hook unit tests | MVP | ~150 |
| `test/spec-trace/test_atom_factory_extension.py` | Factory extension tests | MVP | ~50 |
| `test/spec-trace/test_memory_bus_recall.py` | End-to-end recall test | MVP | ~50 |
| `private/voice-operator/service/packet.py` | `+ spec_id: str \| None = None` | Phase 2 | +5 |
| `private/voice-operator/service/orchestrator_router.py` | `RoutingDecision.spec_id` + log field | Phase 2 | +15 |
| `private/voice-operator/service/brain_publisher.py` | `spec_id` in event payloads | Phase 2 | +5 |
| `site/src/app/cockpit/components/SendToAgent.tsx` | Orb-inline picker + button | Phase 2 | ~200 |
| `site/src/app/api/dispatch/route.ts` | Accept `spec_id` in request | Phase 2 | +10 |
| `skills/orchestration/spec-trace-board-gate.md` | Board-at-creation skill | Phase 2 | ~100 |
| `tools/spec-trace-cross-repo.py` | Multi-repo aggregator | Phase 3 | ~250 |

**MVP footprint:** 9 files, ~685 lines (dual-write hook adds ~30 lines vs single-write), operational-tier only. Zero changes to Memory Bus crawler or atom factory beyond the 3-line prefix patch.

## 5. Error handling

| Failure mode | Behavior |
|---|---|
| Hook parse failure (malformed trailer, encoding) | `exit 0` after logging to stderr; commit succeeds |
| Sidecar missing for trailer | Create with seed frontmatter from `docs/superpowers/specs/<spec-id>.md`; if spec doc absent → orphan sidecar with `spec_path: UNRESOLVED` |
| Disk full / permission denied on sidecar write | Log to stderr, `exit 0`, commit succeeds; manual recovery via `tools/spec-trace.py link-commit` |
| Multiple `Spec:` trailers in one commit | Each gets its own append (N sidecars touched) |
| Commit has no `Spec:` trailer | Hook exits silently — expected for non-spec work |
| Atom factory sees malformed YAML frontmatter | Falls back to body-text atom (`extract_file_atom` uses `errors="replace"`); recall still works |
| Memory Bus indexer fails to crawl new prefix | Existing fallback path (`file_type: "other"`) applies — atom still indexed, just typed less specifically |
| `/starlight-board` BLOCK on substrate spec (Phase 2) | Spec creation continues; sidecar records `board_verdict: BLOCK`; dispatches refuse to fire from cockpit until verdict reaches PROCEED |
| `/starlight-board` REVISE (Phase 2) | Sidecar records verdict + revision notes; dispatches allowed but flagged |

**Invariant:** the hook NEVER breaks `git commit`. Trace failures are fail-open with recoverable manual paths. This matches the existing `brain_publisher` pattern in `orchestrator_router.py:230-233` (`Failures are silent — the dispatch path never errors because of a UI side-channel`).

## 6. Testing strategy

### 6.1 MVP tests (today)

1. `test_postcommit_hook_parses_trailer` — single `Spec: X` trailer recognized
2. `test_postcommit_hook_parses_multiple_trailers` — two trailers → two sidecars touched
3. `test_postcommit_hook_creates_sidecar_with_frontmatter` — first commit for spec creates sidecar; frontmatter seeded from spec doc
4. `test_postcommit_hook_orphan_sidecar` — trailer references spec_id with no spec doc → sidecar created with `spec_path: UNRESOLVED`
5. `test_postcommit_hook_idempotent` — re-running on same commit doesn't double-write
6. `test_postcommit_hook_no_trailer_exits_silent` — normal commits create no files
7. `test_atom_factory_recognizes_spec_trace_prefix` — `spec-trace_*.md` and `memory/spec-trace/*.md` both map correctly
8. `test_postcommit_hook_dual_writes` — canonical at `<repo>/memory/spec-trace/<spec-id>.md` AND indexed copy at `~/.claude/projects/<slug>/memory/spec-trace_<spec-id>.md` both materialize with identical content
9. `test_postcommit_hook_indexed_copy_failure_fail_open` — if indexed-copy write fails (permission denied on auto-memory dir), canonical still writes and exit code is 0
10. `test_memory_bus_recall_finds_spec_trace_atoms` — end-to-end: commit with `Spec:` trailer → hook dual-writes → `memory_recall("spec-trace")` returns the indexed atom

**Coverage target:** ≥95% on hook script + factory delta.

### 6.2 Phase 2 tests (future)

1. `test_packet_spec_id_optional_default_none` — Packet without spec_id still works (backwards compat)
2. `test_packet_spec_id_threads_to_routing_decision` — spec_id survives router → RoutingDecision → routing.jsonl
3. `test_cockpit_send_to_agent_builds_correct_packet` — UI → API → packet with spec_id
4. `test_board_at_creation_substrate_class` — substrate-class spec creation invokes /starlight-board, records verdict

### 6.3 Phase 3 tests (future)

1. `test_cross_repo_hook_install_idempotent` — installing hook twice doesn't break .git/hooks
2. `test_cross_repo_indexer_aggregates_sidecars` — Memory Bus recall returns spec-trace atoms from N repos

## 7. Falsifier check (re-validated, with evidence)

**Primary falsifier (Frank, this session):**
> "if traceability can't compose with existing Memory Bus atoms, the design is wrong"

**Status: PASS — but only via dual-write (caught during spec self-review).**

Evidence:
- `atom_factory.py:23-29` defines `_FILE_TYPE_BY_PREFIX` as an extensible prefix→type map. Adding `spec-trace_`, `dispatch_`, `commit-link_` is a 3-line patch.
- `extract_file_atom()` (line 51) reads any markdown body and tags by prefix — zero crawler changes needed for new types.
- **Crawler scope (caught in self-review):** `crawler.py:11-24` reads only top-level `.md` files under `~/.claude/projects/*/memory/`. The function `list_memory_files` does NOT recurse into subdirectories (lines 27-34). Sidecars at `<repo>/memory/spec-trace/<spec-id>.md` are NOT auto-indexed.
- **Resolution:** the post-commit hook dual-writes — canonical at `<repo>/memory/spec-trace/<spec-id>.md` (git-tracked, durable, portable), indexed copy at `~/.claude/projects/<project-slug>/memory/spec-trace_<spec-id>.md` (top-level prefixed name, matches `_FILE_TYPE_BY_PREFIX` extension, indexed by Memory Bus on next crawl cycle).
- Cross-repo aggregation is therefore mechanical at Phase 3 — install hook in target repo, hook dual-writes to the target repo's auto-memory project slug, sidecars appear in Memory Bus recall on next index cycle.

**Self-review correction history:** The initial spec draft (this very document, before correction) claimed indexing would work for `<repo>/memory/spec-trace/<spec-id>.md` directly. Reading `crawler.py` during the self-review pass revealed this was wrong. Dual-write is the corrected design. Recording this here as evidence that the brainstorming-skill self-review gate is doing real work — without it the MVP would have shipped with a falsifier failure.

**Secondary falsifier (Phase 2):**
> "if `packet.spec_id` can't be threaded through existing dispatch tests without breaking them, the schema change is wrong"

**Mitigation:** the field is optional with `None` default. All existing Packet instantiations remain valid. Tests in Phase 2 cover both spec_id-present and spec_id-absent paths.

**Tertiary falsifier (Phase 3):**
> "if Phase 3 cross-repo aggregation requires migrating the MVP sidecar schema, the MVP design is wrong"

**Mitigation:** sidecar frontmatter carries `project` and `repo_root` from day 1 (matches existing `extract_memory_md_atoms` atom shape which includes `project`). Phase 3 reads these fields directly — no migration.

## 8. Substrate gate (board-before-tag)

**Per CLAUDE.md §"Substrate-tier governance gate" (v7.5.1+):** substrate-level changes invoke `/starlight-board` BEFORE commit/tag.

| Phase | Substrate-tier? | Files touched | Board pre-pass? |
|---|---|---|---|
| **MVP (today)** | No | New files only (`memory/spec-trace/README.md`, `tools/hooks/...`, `tools/spec-trace.py`, `test/spec-trace/...`); 3-line factory patch | **No** — operational |
| **Phase 2** | Yes | `Packet` schema change (file contract); board-at-creation skill (substrate skill) | **Yes** |
| **Phase 3** | Yes | Cross-repo file contract for `memory/spec-trace/` directory convention across N projects | **Yes** |

**MVP exempts because:** the atom factory `_FILE_TYPE_BY_PREFIX` extension does not change attestation rules, sovereignty clause, 10-IS taxonomy, or any canon file. The hook is a new operational tool. The sidecar convention is a memory-internal directory, not a SIP-tier file contract.

**Phase 2 explicitly substrate** because `Packet` is the inter-service contract used by router + cockpit + cron + cost-plane + future verticals. Schema change on Packet touches multiple substrate consumers.

## 9. Open questions (resolved during brainstorm)

- ✅ **Source-of-truth: where does spec-trace live?** → Sidecar at `memory/spec-trace/<spec-id>.md`; existing markdown specs stay canon. (Frank, Q1)
- ✅ **Backflow mechanism?** → Commit trailer `Spec: <spec-id>` + post-commit hook. (Frank, Q2)
- ✅ **When does /starlight-board fire?** → At spec creation; verdict carried forward; spec edits flag re-board. (Frank, Q3)
- ✅ **Build approach?** → Full plan documented; MVP executes today. (Frank, final gate)

## 10. Implementation sequence (today)

1. Create `memory/spec-trace/` directory + README
2. Write PowerShell post-commit hook (dual-write: canonical + indexed copy)
3. Write bash equivalent for sibling tabs / WSL
4. Write hook installer
5. Patch `atom_factory.py` (+3 prefixes: `spec-trace_`, `dispatch_`, `commit-link_`)
6. Write `tools/spec-trace.py` CLI helper (with `sync` subcommand for indexed-copy regen)
7. Write 8 MVP tests (including dual-write verification)
8. Install hook into SIS `.git/hooks/post-commit`
9. Validate by committing this very spec with `Spec: 2026-05-11-spec-trace-design` trailer — both canonical sidecar (in repo) AND indexed copy (in auto-memory) must materialize, and `memory_recall("spec-trace")` must return the atom
10. Run full test suite (substrate symmetry v76+v77+v78+v79 + MVP tests)
11. Commit MVP with `Spec:` trailer (self-tracing — the spec-trace's own commit becomes its first traced commit)

Self-attestation pattern: the spec-trace MVP traces itself. First sidecar entry will be the MVP's own commit.

## 11. Out-of-scope items deferred

- OneHorizon-style team-wide aggregated journal (anti-pattern for sovereign substrate)
- GitHub Actions integration as primary backflow (Phase 3 enhancement, only if local hook proves insufficient — current evidence says it won't)
- Cryptographic attestation of spec→commit linkage (defer to a future SIP attestation amendment if needed)
- PR-status real-time tracking (Phase 3; initial PR data lives in commit history via merge commits)
- Web UI for spec editing (intentional — specs stay markdown; cockpit only dispatches)
- Smithery or other hosted MCP relay (sovereignty leak; rejected)

## 12. Relationship to OneHorizon AI (prior-art note)

This spec was motivated by Frank's Instagram observation of OneHorizon's "Send to agent" button. The architectural lessons borrowed:

| Borrowed | Why |
|---|---|
| Spec → agent → commit traceability as first-class graph | Closes the open loop in SIS |
| Single-button send-gesture as the UX moment | Right intuition; their best design choice |
| 4-beat review format (*What / Why / Best for / The catch*) | May inform future SIS decision-log skill (out of scope here) |

Architectural choices rejected:

| Rejected | Why |
|---|---|
| Cloud SaaS / multi-tenant journal | Sovereignty-incompatible |
| Smithery hosted MCP relay | Sovereignty leak |
| Closed primitive set (no extension path) | SIS substrate must be extensible by sovereign user |
| Thin primitives (Tasks/Issues/Events only) | SIS has richer canon (Atoms / Packets / Sidecars / Vaults) |
| No attestation layer | SIP requires it (ambient since v7.4) |
| 30-day history free tier as data trap | We own our substrate |

The right relationship: study the gesture; build the substrate sovereign.

---

*Spec-Trace Primitive — Design — 2026-05-11*
*Falsifier: PASSES against compose-points in atom_factory.py + orchestrator_router.py*
*MVP ships today (operational-tier, no board pre-pass required)*
*Phase 2/3 require /starlight-board pre-pass per CLAUDE.md substrate gate*

Built on SIP — sovereign-spawned, attestation-aware
