---
name: memory/capture-discipline
description: Use when designing daily capture, note-taking, or personal-knowledge operations — defines the discipline of when, what, and where to capture. Tool-agnostic; the practice survives tool changes. Default skill for Starlight Second Brain.
type: personal-life-os
---

# Capture Discipline

> *"Lower friction beats higher structure. Every time."*

## When This Skill Activates

- Any capture, note-taking, or personal-knowledge operation
- Keywords: *capture*, *note-taking*, *daily review*, *what to capture*, *second brain*, *PKM*, *personal knowledge management*, *inbox zero for my brain*
- Default for: Starlight Second Brain
- Composes with: memory/vault-management, memory/knowledge-synthesis, creator-productivity

## What This Skill Does

Defines the discipline of daily capture. Tool-agnostic — works with Obsidian, Notion, Apple Notes, Drafts, plain text, voice memos. The skill prescribes *when*, *what*, and *where*, never *which app*. The practice survives tool changes; a tool-specific practice does not survive practice drift.

Capture is the cheapest part of PKM. Routing is where people fail. This skill fixes routing without making capture expensive.

## Core Principles

1. **Friction is the enemy.** If daily capture takes more than 10 minutes, the architecture is wrong. Simplify — fewer fields, fewer decisions, fewer apps.
2. **Voice-memo first when thinking, transcribe later.** Thinking while typing loses signal. Speak, transcribe, then route.
3. **No capture moves to archive without distillation.** Archive is not a trash can. If it's going to archive untouched, it was noise — don't capture it next time.
4. **Inbox is allowed; indecision is not.** If routing is unclear at capture time, dump to inbox. Resolve at weekly review. Never stall the capture moment deciding where it goes.
5. **Minimum-viable format.** One sentence + context + date + source. Anything more slows capture; anything less loses re-findability.

## Procedures

### Procedure 1: Define Capture Moments

The person names their recurring capture triggers. Examples — pick what fits *their* life, don't prescribe:

- **Post-meeting / post-call** — one-sentence takeaway within 5 minutes of hanging up
- **Morning pages** — 3–10 minutes free-write before other work
- **Shower / walk thoughts** — voice memo, transcribe later
- **Reading sessions** — highlight + one-line "why this mattered" per highlight
- **End of day** — 5-minute scan: anything notable today that deserves to survive?

The point is *recurring triggers*, not *constant vigilance*. Capture at defined moments; don't try to capture continuously.

### Procedure 2: Route Captures By Type

Every capture gets routed to exactly one namespace. Default routing:

| Capture type | Destination |
|---|---|
| Strategic insight (decision, opportunity, trade-off) | `personal/<slug>/strategic-vault.md` |
| Creative idea (content, aesthetic, narrative) | `personal/<slug>/creative-vault.md` |
| Operational lesson (what worked, what broke, what to change) | `personal/<slug>/operational-vault.md` |
| Pattern noticed (three times it's a pattern) | `personal/<slug>/wisdom-vault.md` |
| Framework evolution (edits an existing Genius Profile framework) | `second-brain/genius-evolution/<slug>.md` |
| Unclear at capture time | `second-brain/inbox/` |

Routing is a 1-second decision at capture time. If it takes longer than that, the capture is unclear → inbox. Resolve at weekly review.

### Procedure 3: Minimum-Viable Capture Format

Every capture, regardless of destination, has four fields and only four:

```
### [YYYY-MM-DD HH:MM] <Title — one line, searchable>

**Context:** <what was happening when this came up — one phrase>
**Source:** <meeting / reading / walk / voice memo / <person-name> / etc.>

<The capture. One to five sentences. Stop when you have the thought captured.>
```

No tags. No categories. No priority. No status. Those are routing problems, solved by destination. The capture is just the capture.

### Procedure 4: Inbox-Zero Cadence

- **Daily:** Clear captured items into their namespaces. Items without clear destination → inbox.
- **Weekly (30 min):** Inbox to zero. Every inbox item gets a destination or gets dropped (dropping is a valid answer — it's not all signal).
- **Monthly (90 min):** Distill captures of the month into drafts (see `insight-distillation` skill).
- **Quarterly (half-day):** Integrate with Genius Profile. Promote validated patterns.

The discipline is in the weekly. If weekly review slips, the monthly and quarterly cascades collapse.

### Procedure 5: Capture Quality Gate

Not everything earns a vault entry. At weekly review, apply this gate to every inbox item:

- **Does this earn permanent space, or is it a passing thought?**
- **Will I be able to tell in 6 months why I captured this?** If not, drop it.
- **Is this a one-off or does it echo prior captures?** One-off stays personal; echoes feed distillation.
- **Would losing this cost me something?** If no, drop it. If yes, route it.

Dropping captures is healthy. It's the feedback loop that teaches you to capture better next time.

### Procedure 6: Tool Integration

SBIS does not prescribe a tool. The skill prescribes capabilities the tool must support:

- **Fast capture entry** — less than 10 seconds from intent to saved
- **Voice memo capture + transcript** — Apple Notes, Drafts, AudioPen, Voice Memos + Whisper
- **Text search across all captures** — Obsidian, Notion, Apple Notes all work
- **Markdown-compatible storage** — so captures survive tool migration
- **Mobile + desktop parity** — capture happens everywhere life happens

Example tool stacks (pick one, or mix):

- **Obsidian stack:** Daily Notes plugin for capture, Dataview for routing, plain folders for namespaces
- **Notion stack:** Quick Capture database, Filter views for namespace routing
- **Apple Notes stack:** Daily note per day, folders for namespaces, Siri voice-capture
- **Plain-text stack:** Drafts or iA Writer for capture, folders for namespaces, ripgrep for search

Tool choice is personal. Discipline is universal.

## Rules

- **Never** prescribe a specific app. SBIS is tool-agnostic. If the person already has a tool, use it. If they don't, ask what fits their life.
- **Never** require more than four fields at capture time (title, context, source, content). Adding fields adds friction. Friction kills the practice.
- **Never** move captures to archive without distillation. Archive is for distilled material and raw captures that have served their purpose, not a trash can.
- **Never** let inbox grow past one week. If inbox is past zero on review day, something about routing is broken — diagnose before adding more captures.
- **Always** voice-memo first when the person is thinking. Typing while thinking loses signal. Speak, transcribe, then route.
- **Always** cap daily capture at 10 minutes. If it's taking longer, simplify.
- **Always** let the person drop captures. Not every thought deserves to survive.

## Integration Points

- **Vault:** `second-brain/` namespace + personal sub-namespaces in all 6 existing vaults. See `memory/VAULT_ARCHITECTURE.md`.
- **Agents:** Starlight Second Brain (primary). Sage reads institutional signals; Genius reads evolution signals.
- **Commands:** `/capture-daily` invokes this skill; `/orchestrate-brain` runs it in weekly-review context.
- **Skills:** Composes with `memory/knowledge-synthesis` (cross-reference at weekly review), `memory/vault-management` (persistence), `creator-productivity` (shared session-memory model).

## Quality Criteria

- Does daily capture stay under 10 minutes?
- Does every capture land in a namespace or the inbox — never mid-air?
- Is the inbox at zero on weekly review day?
- Does the person still use the system 30 days in? 90 days in?
- Can the person tell in 6 months why each retained capture survived?

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (SBIS alpha)
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
