# `.intake/` — Inbox for raw drops to be processed

> Captured-insights → reasoned-application → archived. Standard second-brain
> inbox pattern. Adapted for the SIS repo so Frank's ChatGPT exports, voice
> notes, screenshots-of-thinking, and other raw signals land somewhere that
> will be touched, not lost.

---

## Why this directory exists

Frank captures insights across many surfaces — ChatGPT, Claude, Gemini, voice
notes, scratch markdown. They contain genuine signal, but ChatGPT/Gemini/etc.
do not have the full context of the SIS repo, the 10-IS architecture, the
verticals, or the live production state. So a captured drop might:

- Reference a feature that already exists (waste to re-build)
- Suggest an idea that's already been ratified by `/luminor-board` (waste to re-debate)
- Contain a prompt or framework worth promoting to a skill / command / vault
- Belong in a sibling repo (`arcanea-flow`, `agentic-creator-os`, `ai-ops`, FrankX)
- Be too raw to act on yet (archive for later)

The job of this directory is to **route every drop to its right destination**
without losing the signal. Frank drops; the next session (Claude or Frank)
processes; everything is preserved with attribution.

---

## Layout

```
.intake/
├── README.md                  ← this file
├── PROCESSING-LOG.md          ← chronological log of what was processed and where it landed
├── <raw drop>.txt             ← unprocessed; lives in root until a session picks it up
├── <raw drop>.md              ← same; markdown is fine too
└── processed/
    └── YYYY-MM-DD/
        ├── <original-filename>.txt           ← the source, preserved verbatim
        └── <original-filename>.processing.md ← what was extracted + where it landed
```

## Workflow

When a Claude session sees `.intake/` has unprocessed files (anything in the
root, not in `processed/`):

1. **Catalog** — read each file end-to-end. For each, note:
   - Topic + key themes
   - Actionable insights (specific, scoped)
   - Prompts / frameworks worth capturing
   - Tools / libraries mentioned
   - Recommended destination (e.g., `memory/vaults/strategic-vault.md`,
     `docs/superpowers/plans/`, `skills/<domain>/`, sibling repo, archive-only)
   - Cross-repo relevance (does anything belong in `arcanea-flow`,
     `agentic-creator-os`, `ai-ops`, FrankX?)
   - Priority (P0 must-act / P1 high-value / P2 nice-to-have / P3 archive-only)

2. **Reason** — for each insight, decide whether it should land as:
   - A **commit** to this repo (vault entry, skill update, plan, content)
   - A **file dropped into a sibling repo** (manually, since cross-repo writes
     happen only with sovereignty in mind)
   - A **note** to surface to Frank for decision (substrate-tier asks,
     decisions that need `/luminor-board`)
   - **Archive only** (raw signal worth keeping but not yet actionable)

3. **Apply** — make the changes. Group related insights into a single PR if
   they touch the same domain. Use the standard quality gates (subagent
   reviewers, TDD where it applies, build verification for site changes).

4. **Archive** — move the original file to
   `.intake/processed/YYYY-MM-DD/<original-filename>` (verbatim copy, kept
   on disk for reference but **not committed** — see `.gitignore`).

5. **Log** — append an entry to `PROCESSING-LOG.md` (committed; this is the
   public audit trail):
   ```
   ### 2026-05-03 — `Chatgpt 02.05.txt`
   - **Topic:** SIS purpose clarity + Arcanea connection + i18n + strategic separation
   - **Extracted:** 5 insights
   - **Landed:**
     - `memory/vaults/strategic-vault.md` — purpose-clarity benediction concept
     - Carry-forward note in handover — i18n (German) deferred to v8.x
     - Surfaced to Frank — domain strategy / cost / ROI questions need owner decision
   - **Cross-repo:** Arcanea Prompt Library reference noted; not auto-distributed
   - **Operator:** Claude Opus 4.7 (1M context) session 2026-05-03
   ```

## Cross-repo distribution

When a drop has content more relevant to a sibling repo than to SIS:

- `arcanea-flow` (`C:\Users\frank\arcanea-flow`) — swarm orchestration, hooks, RL
- `agentic-creator-os` — creator productivity (consumes Starlight)
- `ai-ops` — AI operations research
- FrankX — Frank's personal brand site / content

The Claude session **does not** auto-write to sibling repos. Sibling-repo
drops are surfaced to Frank as "this would land cleanly at `<repo>/path/file`"
so Frank can curate the cross-party move.

## Substrate-tier asks

If a drop names a substrate edit (`SIP.md`, `ALLIANCE.md`, `STACK.md`,
`VERTICALS.md`, `VOICES.md`, `REGISTRY.md`, taxonomy changes, sovereignty
clause, attestation rules), the processing session **does not commit** —
it surfaces the ask for `/luminor-board` pre-pass per the structural
governance gate (CLAUDE.md v7.5.1+).

## Workflow sanity-check

- ✅ Inbox-then-process is a well-trod second-brain pattern (Tiago Forte CODE,
  Bullet Journal monthly migration, GTD inbox-zero)
- ✅ The `processed/<YYYY-MM-DD>/` structure preserves source-of-truth + audit trail
- ✅ The PROCESSING-LOG.md gives a "what happened" timeline without
  spelunking through commit history
- ✅ Cross-repo surfacing prevents accidentally trapping insights that
  should live elsewhere
- ✅ Substrate-tier escalation prevents auto-edits to load-bearing files

---

**Built on SIP** — operational tier · `.intake/` directory established 2026-05-03.
