# Declared file loads audit — v7.5.1

> Walk-through of every command in `.claude/commands/` (plus `verticals/_template/.claude/commands/`) against the `Substrate rule — declared file loads exist on disk` test block added to `test/substrate.test.ts`. Generated alongside the addition of SKILL.md invariant 6 (2026-04-26).

---

## Coverage tally

- Commands scanned: **67** (66 in `.claude/commands/` + 1 in `verticals/_template/.claude/commands/`).
- Hard-load assertions emitted: **234** (per the test runner's coverage-report line).
- Soft-load (conditional) skips: ~30 ("if present", "any prior", parenthetical references to scan directories).
- Placeholder skips: ~50+ (paths containing `<slug>`, `<person-slug>`, `<vertical-slug>`, `<artifact-path>`, `<target>`).
- External-path skips: 2 (`C:\Users\frank\Arcanea\.arcanea\lore\CANON_LOCKED.md` and `C:\Users\frank\Arcanea\ARCANEA_UNIVERSE_CANON.md` in `arcanea-canon.md` — these reference the sovereign Arcanea repo, intentionally external).
- Glob-pattern skips: ~6 (paths containing `*` like `motivation-*`, `team-*`, `calibration-*.md` — these are scan patterns, not loads).
- Test result: **234 pass + 1 fail** — the single fail is **Defect 1** below, which the rule was specifically designed to surface.

---

## Defects flagged by the new rule

### Defect 1 — `luminor-board.md` declares `starlight/AGENTS.md` (does not exist)

- **Command:** `.claude/commands/luminor-board.md`
- **Line:** 10
- **Declared load:** `` `starlight/AGENTS.md` ``
- **Current state on disk:** No `starlight/` directory exists at repo root. The file the command means is `AGENTS.md` at repo root (which exists).
- **Root cause:** Vestige from a pre-v7 layout when the substrate canon files lived under a `starlight/` subdirectory. The repo flattened during v7.0; this command was not updated.
- **Recommended fix:** One-line edit in `.claude/commands/luminor-board.md` line 10 — change `` `starlight/AGENTS.md` `` to `` `AGENTS.md` ``.
- **Risk if left:** None operational (the command body still describes the Board correctly), but the substrate's own conformance test now fails on every CI run until fixed.
- **Status:** **OPEN — fix queued for v7.5.1 commit.**

---

## Soft-load decisions (conditional, exempted from disk-existence assertion)

These declarations were correctly classified as conditional and exempted from the rule. Listed for traceability so a future reader sees what the regex rules out:

- `welcome.md` — `ONBOARDING.md` and `DELIVERY.md` are loaded "if present"; both currently exist, so the assertion passes. The conditional clause is preserved in case a future fork ships without them.
- `intake.md` — `agents/starlight-concierge.md` loaded with explicit fallback notice ("if the file is not yet present in this release, proceed with…"). File exists.
- `train-executor.md` — `agents/starlight-genius.md` and `skills/intelligence/genius-excavation.md` loaded "if they exist in this release". Both exist.
- `reclaim-knowledge.md` — Same pattern as train-executor.
- `talent-burnout-detect.md` / `talent-motivation.md` / `talent-psych-safety.md` / `talent-retention.md` / `talent-team-dynamics.md` — All reference `hr-intelligence/talent/` and `hr-intelligence/culture/` directories as "any prior" / "prior X" outputs. These are scan targets that may be empty on first run and populate over time. Soft-load is correct.
- `org-reorg-trauma-audit.md` / `org-succession.md` — Reference `hr-intelligence/org/` outputs as "Read any prior". Same pattern.
- `perf-review-redesign.md` — References `hr-intelligence/hiring/calibration-*.md` (glob) inside an "If a Hiring sub-system calibration protocol exists at" clause. Both glob and conditional, doubly exempt.

---

## Placeholder paths (template substitutions, exempted)

These contain literal angle-bracket placeholders and resolve only at command invocation. Listed so a future reader doesn't try to "fix" them by creating bare files:

- `genius/profile-<slug>.md` / `genius/profile-<person-slug>.md` / `genius/freedom-path-<slug>.md` — per-person artifacts produced by `/discover-genius`.
- `verticals/<vertical-slug>/SKILL.md` (and `MEMORY.md`, `SOUL.md`) — substituted at `/spawn-domain-stack` time.
- `vision/vision-<slug>.md`, `business/entity-plan-<slug>.md`, `health/regimen-<slug>.md`, `relational/network-<slug>.md`, `creator/pipeline-<slug>.md`, `wealth/dpi-<slug>.md` — per-person layer artifacts.
- `hr-intelligence/hiring/icp-<role-slug>-*.md` — per-role hiring artifacts (also a glob, doubly exempt).
- `executor/<exec-slug>-playbook.md` — per-executor playbooks.
- `integrations/exports/<target>.md` — substituted with one of `claude-project`, `chatgpt-project`, etc., at `/sip-export` invocation. The static target schemas under `integrations/exports/` exist; the placeholder is what selects between them.
- `<artifact-path>` — pure runtime input, never a literal file.

---

## Glob patterns (scan targets, exempted)

Wildcards mark scan/match targets, not loads:

- `hr-intelligence/talent/motivation-*` — match-any prior motivation map.
- `hr-intelligence/talent/team-*` — match-any prior team artifact.
- `hr-intelligence/talent/team-dynamics-*` — same family.
- `hr-intelligence/hiring/calibration-*.md` — match-any prior calibration protocol.
- `hr-intelligence/performance/redesign-<org-slug>-*.md` — combined placeholder + glob.

---

## External absolute paths (other sovereign repos, exempted)

- `C:\Users\frank\Arcanea\.arcanea\lore\CANON_LOCKED.md` — Arcanea canon source of truth, sovereign to Arcanea BV.
- `C:\Users\frank\Arcanea\ARCANEA_UNIVERSE_CANON.md` — same.

Both correctly resolved by the test's external-path heuristic and skipped.

---

## Recommendation

1. **Fix Defect 1** — one-line edit in `luminor-board.md` line 10. Trivial, ships with v7.5.1.
2. **Lock the rule.** SKILL.md invariant 6 + the test block ship together; future commands that introduce a fourth declared-but-missing load will be caught at CI time, not at first-user-encounter time.
3. **Document the exemption taxonomy** above (placeholder / glob / conditional / external) so future contributors know which forms are valid and which are defects.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.5.0 → v7.5.1 (declared-loads rule + audit)
- Generated: 2026-04-26
- Attestation is compounding, not credit transfer: every composition strengthens every node.
