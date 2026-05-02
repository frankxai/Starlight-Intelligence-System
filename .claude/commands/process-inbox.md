---
name: process-inbox
description: Process the `.intake/` inbox in one shot. Catalogs each unprocessed file via subagent, applies operational-tier insights, archives originals, surfaces substrate-tier asks for /starlight-board, and surfaces cross-repo drops for Frank to action. Idempotent — safe to re-run.
allowed-tools: Read, Glob, Grep, Edit, Write, Bash, Agent, TaskCreate, TaskUpdate
argument-hint: [optional date subfolder name, defaults to today]
---

# /process-inbox

Process every file in `.intake/` (root level — `processed/` subfolders are skipped) per the workflow defined in `.intake/README.md`.

**Note:** This command is distinct from `/intake` (which triages newcomers into one of four protocol routes — substrate/alliance/vertical/sovereign-spawn). `/process-inbox` processes the `.intake/` capture directory; `/intake` triages people. Different layers, different work.

## Workflow

1. **Inventory** — list `.intake/*` excluding `README.md`, `PROCESSING-LOG.md`, `.gitignore`, and `processed/`. If empty, report "Inbox is clean" and exit.

2. **Catalog (parallel subagent)** — dispatch one general-purpose subagent to read every file end-to-end and produce a structured catalog. Required structure per file:
   - `topic` — one-sentence
   - `key_themes` — ≤6 themes
   - `actionable_insights` — specific, scoped
   - `prompts_or_techniques` — frameworks worth capturing
   - `tech_or_tools` — specific tools / libraries / services
   - `recommended_destination` — where in this repo each insight belongs (vault path, doc path, skill path, or "archive only")
   - `cross_repo_relevance` — sibling repos (`arcanea-flow`, `agentic-creator-os`, `arcanea`, `frankx.ai`, `private/`) where any insight belongs
   - `priority` — P0 / P1 / P2 / P3
   - `notes` — conflicts, ambiguity, depth concerns

3. **Reason** — for each insight, decide:
   - **Operational-tier** (vault entry, plan doc, skill update, content) → ship in this PR
   - **Substrate-tier** (touches `SIP.md` / `SIS.md` / `ALLIANCE.md` / `STACK.md` / `VERTICALS.md` / `VOICES.md` / `REGISTRY.md` / file-contract / attestation / sovereignty / 10-IS taxonomy / Domain Sub-Stack pattern) → write a `/starlight-board` pre-pass packet at `docs/superpowers/board-pre-passes/<date>-<topic>.md`. **Do not commit substrate edits.**
   - **Cross-repo** → write a distribution packet at `docs/cross-repo-distributions/<date>-<target>-<topic>.md`. **Do not auto-write to sibling repos.**
   - **Archive only** — surface in PROCESSING-LOG.md but no destination ship

4. **Apply** — make the operational-tier changes. Group by domain into a single coherent commit. Verify build/tests where applicable (e.g., `pnpm build` for any site changes). Use the standard subagent reviewer pattern (spec compliance + code quality + accessibility) for substantive UI/content changes.

5. **Archive** — `mkdir -p .intake/processed/<date>` (default today: $ARGUMENTS or today's date), `mv` each processed raw file into it. Files are gitignored; the move is local-only on disk.

6. **Log** — append a per-file entry to `.intake/PROCESSING-LOG.md` with:
   - Topic + extracted-count
   - Where each insight landed (operational ships, substrate pre-passes, distribution packets, archive-only)
   - Cross-repo surfaces
   - Operator (Claude session ID + date)

7. **Commit** — single PR with all operational-tier changes + the PROCESSING-LOG.md update + .intake/ workflow infrastructure if not yet present. Standard squash-merge flow.

8. **Surface** — final report to Frank covering:
   - What landed (PR link)
   - What's pending `/starlight-board` ratification (substrate pre-passes filed)
   - What's pending Frank's manual cross-repo move (distribution packets filed)
   - What was archived without action

## Substrate-tier escalation rule

Never auto-commit a substrate edit, even if the source seems clear. Always write a `/starlight-board` pre-pass packet and surface for ratification. The board-before-tag invariant is structural, not optional.

## Cross-repo distribution rule

Never auto-write to a sibling repo. Always write a distribution packet (`docs/cross-repo-distributions/<date>-<target>-<topic>.md`) with the target file path, content payload, and sovereignty rationale. Frank actions the cross-party move manually.

## Idempotency

If `.intake/` is empty after `processed/` exclusion, report "Inbox is clean" and exit without making changes. Re-running the command on a day where files were already processed does not double-commit.

## When the catalog agent reports a conflict

If an insight from a `.intake/` file conflicts with an existing repo state (e.g., a different taxonomy, a different naming hierarchy, a different decision already ratified), **the repo's existing state wins**. The conflict is logged in PROCESSING-LOG.md as `REJECTED`, with the reason. The portable parts of the conflicting file are still extracted; only the conflicting parts are rejected.

## Reference

The pattern is documented in `.intake/README.md` and the first end-to-end processing run on 2026-05-03 produced PR #10 (squash `b15bc61`). That PR is the canonical reference implementation.

## Related commands

- `/intake` — newcomer triage (different scope: routes a person into substrate/alliance/vertical/sovereign-spawn)
- `/capture-daily` — daily second-brain capture routine (the input side; produces what may end up in `.intake/`)
- `/distill-insights` — periodic distillation from second-brain to named frameworks
- `/orchestrate-brain` — weekly review ritual; could include `/process-inbox` if the inbox isn't empty
- `/starlight-board` — substrate-tier ratification gate (where my pre-pass packets land)

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Command introduced: 2026-05-03
- Reference run: PR #10 / `b15bc61`
