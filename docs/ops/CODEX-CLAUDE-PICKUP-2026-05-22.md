# Codex → Claude Pickup — 2026-05-22

**Purpose:** durable handoff for Claude or another agent picking up the ecosystem-quality pass without relying on chat history.

## Live Coordination Read

- Multiple Claude Code processes were active during this pass. Process paths indicate active work around `FrankX` and `Arcanea`; I avoided editing those repos directly and used SIS/ACOS docs as the coordination layer.
- SIS and ACOS both had dirty working trees before this pass. I treated all pre-existing dirty/untracked/deleted files as collision-sensitive and did not revert unrelated changes.
- ACOS had a real red gate after line endings drifted: `npm run harness:check` failed on `install.sh` CRLF. That is fixed and guarded now.

## What I Changed In SIS

- `AGENTS.md` now says 71 skill rules in both live sections and avoids a brittle skill-file count.
- `docs/ARCHITECTURE.md` Domain Sub-Stack diagram now includes Crypto Intelligence as the fifth reference vertical.
- `docs/ops/readiness-v75.md` no longer says Graphiti/Syncthing install docs are absent. It now distinguishes playbook-present from runtime-verified.
- `docs/research/_factory/memory-foundations-phase0/CHARTER.md` now matches the actual `eval-50.jsonl` schema (`expected_match`, `seed_memory`) and marks R2 as complete.
- `docs/research/_factory/memory-foundations-phase0/README.md` now marks Phase 0 as in execution and lists `phase0-c7-verification-note.md` as existing.
- `memory/CONSOLIDATION_LOG.md` now has an explicit 2026-05-22 calibration gate for contradiction/promotion zero-counts.

## What I Changed In ACOS

- Restored `install.sh` after a failed patch write and re-applied the v11 multi-platform installer behavior.
- Added `.gitattributes` to force LF line endings for shell scripts.
- `install.sh` now generates OpenCode `opencode.json` from the actual repo path instead of copying stale absolute FrankX paths.
- `install.sh` now prints `Built: <name>` only when the MCP workspace build actually succeeds.
- `opencode.json` no longer contains stale `C:/Users/Frank/FrankX/FrankX.AI - Vercel Website/...` paths.
- `scripts/check-agent-harness.mjs` now checks OpenCode routing, portable `--platform=all`, LF policy, and absence of stale FrankX paths.

## Verification

- ACOS: `npm run verify` passed after the fixes.
- ACOS: `./install.sh --help` under Bash shows Codex, Antigravity, OpenCode, and all-platform support.
- SIS: Kepler read-only audit reported `test/v78-skill-registry.test.ts`, `test/v79-vertical-coverage.test.ts`, `test/v80-platform-prompts.test.ts`, and `scripts/check-agent-harness.mjs` passed before my patches.
- SIS: `npm run verify` passed after cleaning only test-created temp directories (`sis-packs-*`, `acos-install-smoke-*`) under `%TEMP%`. First SIS verify attempt failed with `ENOSPC` in `%TEMP%`, not a code failure.

## Next Best Moves

1. SIS memory Phase 0: add the fixture-backed `ContradictionDetector.similarity`/promotion calibration test named in `memory/CONSOLIDATION_LOG.md`.
2. ACOS installer: add temp-dir generated-output tests for `--platform=codex|gemini|antigravity|opencode|all`, including OpenCode JSON parse and path checks.
3. ACOS docs: reconcile “embedded skills/agents” language; generated non-Claude context currently embeds summaries, not full skill bodies.
4. SIS readiness: update `context/STATE.md` and `skills/SKILL_REGISTRY.md` only after the current dirty edits there settle.
5. Cross-repo: coordinate with Claude’s FrankX/Arcanea work through a short handoff rather than direct edits unless Claude is idle.

## Falsifiers

- If `git diff install.sh` in ACOS shows missing v11 behavior, restore from this handoff and re-run `npm run harness:check`.
- If Claude already rewrote `docs/ops/readiness-v75.md`, prefer the newer runtime-verified evidence over this doc.
- If Phase 0 eval migrates to atom IDs, update `CHARTER.md` and `eval-50.jsonl` together before scoring.

Built on SIP — operational-tier handoff.
