# Overnight Deep Ship Implementation Plan — 2026-05-13

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land Codex's Track A v0.1 module/lifecycle WIP cleanly, close the test-infra failure unblocking the suite, add the v82 modules-symmetry harness to lock the module registry against drift, compact the auto-memory index back under budget, and document tonight's run honestly.

**Architecture:** Operational-tier work that touches public substrate (`src/`, `test/`, `memory/`, `docs/`). No `/starlight-board` gate required — module taxonomy is already locked in `STACK.md` v7.5, this ship encodes it as code and a symmetry test. WIP was designed by a parallel Codex session with the operational-vault entry already drafted (2026-05-12 entry) — this is a verification + integration ship, not a new design.

**Tech Stack:** TypeScript (Node 24, node:test runner), node:fs, better-sqlite3, markdown frontmatter convention.

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `test/v76.test.ts` | Frontmatter symmetry over `skills/**/*.md` | **Modify** — exempt `assets/` directories |
| `src/cli.ts` | Starlight CLI surface (events/modules/workpacket) | Land Codex WIP |
| `src/ledgers.ts` | JSONL append + SQLite shadow (Track A spine) | Land Codex WIP |
| `src/mcp-server-v01.ts` | 19 `sis.*` MCP tools (Track B surface) | Land Codex WIP |
| `src/modules.ts` | **NEW** — 11-module registry (5 universal-IS + 3 domain-stacks + 2 private + 1 future) | Land Codex WIP |
| `test/v01-ledgers.test.ts` | Track A conformance | Land Codex WIP |
| `test/v01-mcp-tools.test.ts` | Track B (35 tests) conformance | Land Codex WIP |
| `test/v82.test.ts` | **NEW** — modules.ts ↔ STACK.md ↔ AGENT_REGISTRY.md symmetry lock | **Create** |
| `~/.claude/projects/.../memory/MEMORY.md` | Auto-memory index | **Compact** — bring under 24KB budget |
| `docs/ops/PHASE-0-EXECUTION-LOG-2026-05-13.md` | ULTRAPLAN Phase 0 status (SIS-scope vs private/ vs Arcanea/) | **Create** |
| `docs/ops/HANDOVER-2026-05-13-overnight-deep-ship.md` | Session handover with wisdom + verification evidence | **Create** |
| `memory/vaults/operational-vault.md` | Tonight's entry | **Append** |

---

## Task 1: Fix v76 frontmatter test (already in progress)

**Files:**
- Modify: `test/v76.test.ts` — comment block + walker exemption

- [x] **Step 1: Read v76 to understand the exclusion pattern** — already done
- [x] **Step 2: Make the minimal fix — exempt `assets/` directories at walker level (not at SKILL_FM_EXCLUDE level — the latter has a hard ceiling of 9 entries and assets/ is a directory pattern, not a single file)** — done
- [ ] **Step 3: Run v76 in isolation, verify green**

```bash
npx tsx --test test/v76.test.ts
```
Expected: all v76 tests pass, including frontmatter completeness + bounded exemption + stale check.

---

## Task 2: Land Codex Track A v0.1 WIP

**Files:**
- Verify: `src/cli.ts`, `src/ledgers.ts`, `src/mcp-server-v01.ts`, `src/modules.ts`, `test/v01-ledgers.test.ts`, `test/v01-mcp-tools.test.ts`

- [ ] **Step 1: Run full test suite, verify all green**

```bash
npm test
```
Expected: all suites pass including v01-ledgers + v01-mcp-tools (>= 47 tests across the two files).

- [ ] **Step 2: Run TypeScript build, verify clean**

```bash
npm run build
```
Expected: no errors.

- [ ] **Step 3: Stage + commit the Codex WIP as a Track A v0.1 ship**

```bash
git add src/cli.ts src/ledgers.ts src/mcp-server-v01.ts src/modules.ts \
        test/v01-ledgers.test.ts test/v01-mcp-tools.test.ts \
        memory/vaults/operational-vault.md memory/CONSOLIDATION_LOG.md
git commit -m "feat(v01): module registry + workpacket lifecycle + events.tail (Track A v0.1)..."
```

---

## Task 3: Add v82 modules-symmetry test

**Files:**
- Create: `test/v82.test.ts`

- [ ] **Step 1: Read STACK.md to confirm canonical 10-IS taxonomy + AGENT_REGISTRY.md for cross-ref**
- [ ] **Step 2: Write the failing test (TDD)** — enumerate the 11 modules in src/modules.ts and assert each maps to either a row in the STACK.md 10-IS table OR is explicitly listed as `domain-stack`, `private-module`, or `future-module`. EXEMPT_MODULES debt-ledger Map starts empty (goal state).
- [ ] **Step 3: Run test, verify it passes against the shipped module set (no drift)**
- [ ] **Step 4: Wire into pre-commit hook + commit**

---

## Task 4: Compact MEMORY.md auto-index

**Files:**
- Modify: `~/.claude/projects/C--Users-frank-Starlight-Intelligence-System/memory/MEMORY.md`

- [ ] **Step 1: Background subagent already analyzing (dispatched)** — wait for proposal
- [ ] **Step 2: Verify proposed compaction preserves all 85 entries + drops total under 24KB**
- [ ] **Step 3: Write compacted file**
- [ ] **Step 4: Verify size** — `wc -c MEMORY.md` returns <24576

---

## Task 5: Write Phase 0 execution log

**Files:**
- Create: `docs/ops/PHASE-0-EXECUTION-LOG-2026-05-13.md`

- [ ] **Step 1: Honest matrix** — for each of ULTRAPLAN Phase 0 items 0.1–0.7, mark: SIS-scope-shippable / private/-scope-awaits-dispatch / Arcanea-scope-separate-repo / shipped-tonight. No false claims.
- [ ] **Step 2: Forward pointer** — what the next /yolo session or manual dispatch picks up.

---

## Task 6: Write handover doc + vault entry + MEMORY.md project entry

**Files:**
- Create: `docs/ops/HANDOVER-2026-05-13-overnight-deep-ship.md`
- Append: `memory/vaults/operational-vault.md`
- Append: `~/.claude/projects/.../memory/MEMORY.md` (after compaction)

- [ ] **Step 1: Handover doc** — verification evidence table, what shipped, what didn't, session wisdom, falsifiers for tonight's decisions.
- [ ] **Step 2: Operational vault entry** — 2026-05-13 row.
- [ ] **Step 3: MEMORY.md project entry** — one line index hook + corresponding topic file.

---

## Task 7: Commit chain + push + verify CI

- [ ] **Step 1: Final `npm test` + `npm run build` clean**
- [ ] **Step 2: Final stage + commit**
- [ ] **Step 3: `git push origin main`**
- [ ] **Step 4: Verify GHA workflows pass via `gh run list --limit 3`**

---

## What This Plan Deliberately Does NOT Touch

- `private/` — voice-operator service, LCC dashboard (ULTRAPLAN Phase 0.1 / 0.2 / 0.3 / 0.5 / 0.6 / 0.7 live here, requires separate dispatch or in-session work in that tree)
- `C:\Users\frank\Arcanea\packages\arcanea-voice\` — separate repo (ULTRAPLAN Phase 0.4)
- Phase 1 voice streaming — separate sprint
- Phase 2 brain depth — separate sprint
- Phase 3/4/5 — out of scope tonight

The night's principle: **ship the substrate-side WIP cleanly + log what's not yet touched honestly**, so the next dispatch (Codex on private/, sibling tab on Arcanea/) has a clean baseline to extend.

---

## Verification Gates

Before declaring done:
- [ ] `npm test` — all suites green (target: every suite previously green + v01-ledgers + v01-mcp-tools + v82-new)
- [ ] `npm run build` — clean
- [ ] `wc -c ~/.claude/projects/.../memory/MEMORY.md` — under 24576
- [ ] `git status` — only intended files committed; planning artifacts in `docs/ops/` committed
- [ ] `git log --oneline -8` shows tonight's commit chain
- [ ] `gh run list --limit 3` — latest GHA workflows green (or honest about which fail)

---

## Built on SIP · Operational Tier
