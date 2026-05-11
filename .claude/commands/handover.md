---
description: "End-of-session handover with wisdom capture. Writes status + reflections to docs/ops/, Starlight Vaults, and optionally GitHub."
thinking: true
---

# Session Handover + Wisdom Capture

## Phase 1: Gather Context

Run in parallel:
```bash
git log --oneline -15 --decorate
git status --short --branch
git diff --stat origin/main...HEAD
```

Also check:
- What the user asked for this session (scan conversation for key requests)
- What decisions were made and why
- What surprised you (unexpected complexity, elegant solutions, things that just worked)

## Phase 2: Write Handover Doc

Create `docs/ops/HANDOVER_{today's date}_{2-word-slug}.md`:

```markdown
# Handover — {date}

## What Landed
{bullet list of commits on main}

## What Changed This Session
{files changed, features added, bugs fixed}

## Current Blockers
{external dependencies, manual steps, unresolved issues}

## Recommended Next Stack
{ordered list of what to work on next, with WHY for each}

## Verification Evidence
{which gates passed, build status, deploy status}

---

## Session Wisdom

### Prompts That Worked
{List the user's most effective prompts this session — what did they ask that produced great results? Quote the prompt pattern, not the full text. These are reusable techniques.}

### Technical Choices Validated
{Decisions made this session that proved right (or wrong). Architecture, library, pattern choices. Include the reasoning — WHY it worked, not just WHAT.}

### Patterns Discovered
{Any repeatable patterns, shortcuts, or approaches worth remembering. Things that would help a future session start faster.}

### What Was Built (Gratitude)
{A brief, genuine reflection on what was accomplished. Not metrics — meaning. What's better about the project now? What creative leaps happened?}
```

## Phase 3: Route to Starlight Vaults

Extract insights from the wisdom section and append to appropriate vaults.
Each vault entry is one JSONL line:

```json
{"id":"TYPE_YYYYMMDD_N","insight":"...","category":"...","confidence":"high|medium","source":"session-handover","session":"SLUG","createdAt":"ISO_DATE"}
```

Route by content:
- Code/architecture/tooling insights → `~/.starlight/vaults/technical.jsonl`
- Business/product/strategy insights → `~/.starlight/vaults/strategic.jsonl`
- Design/style/voice insights → `~/.starlight/vaults/creative.jsonl`
- Workflow/process/ops insights → `~/.starlight/vaults/operational.jsonl`
- Cross-domain meta-patterns → `~/.starlight/vaults/wisdom.jsonl` (create if missing)
- Benevolent human-AI collaboration insights → `~/.starlight/vaults/horizon.jsonl`

Rules:
- Only save NON-OBVIOUS insights. "We used Next.js" is not an insight. "Server Actions eliminated 3 API routes because X" is.
- 1-3 vault entries per session is normal. 0 is fine if nothing surprised you. 10 means you're being too granular.
- Confidence: "high" = validated by working code or user confirmation. "medium" = promising but untested.

## Phase 4: Community & GitHub Updates

Ask the user which of these apply:

**A) Personal only** (default) — vault entries stay in `~/.starlight/vaults/`. Done.

**B) Push Horizon entries to community** — if any `horizon.jsonl` entries were added:
```bash
cd ~/starlight-horizon-dataset 2>/dev/null || gh repo clone frankxai/starlight-horizon-dataset ~/starlight-horizon-dataset
cp ~/.starlight/vaults/horizon.jsonl ~/starlight-horizon-dataset/vaults/
cd ~/starlight-horizon-dataset && git add -A && git commit -m "vault: session insights {date}" && git push
```

**C) Update OSS repo** — if the session produced patterns useful to the Arcanea community:
```bash
# Sync relevant learnings to arcanea OSS
cd /c/Users/frank/Arcanea && git push oss main
```

**D) Update project repo** — push main work:
```bash
git push origin main
```

Only ask once. Default to A if user doesn't specify.

## Phase 5: Commit & Close

```bash
git add docs/ops/HANDOVER_{date}_{slug}.md
git commit -m "docs(ops): handover {date} — {one-line summary of session}"
```

Do NOT push unless user chose option C or D above.

End with: "Session captured. {N} vault entries saved. Handover committed. Safe to close."
