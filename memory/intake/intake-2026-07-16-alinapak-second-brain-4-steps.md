---
type: intake
created: 2026-07-16
source: Instagram reel DYcu-OZArsi
author: Alina Pak
route: second-brain / technical / operational
status: filed
related:
  - verticals/secondbrain/README.md
  - verticals/secondbrain/LLM-Wiki-Filing-Best-Practice.md
  - agents/starlight-secondbrain.md
  - workflows/secondbrain/WORKFLOW.md
  - Hermes skill: llm-wiki
---

# Intake: AI Second Brain 4-step (drop → extract → direct → automate)

## Source

- URL: https://www.instagram.com/reel/DYcu-OZArsi/
- Author: Alina Pak (@alinapak.me)
- Date: 2026-05-17
- Machine raw copy: `C:\Users\frank\_inbox\document\2026-07-16\alinapak-second-brain-4-steps-reel.md`

## Framework (atomic)

1. **Drop** — single `/raw` inbox; zero tagging at capture
2. **Extract** — agent turns raw into linked wiki notes
3. **Direct** — one rules file (`CLAUDE.md` / `SCHEMA.md` / `AGENTS.md`) governs structure
4. **Automate** — daily review + weekly audit cron; human stops hand-maintaining

## Map onto Frank estate (SoT)

| Reel step | Frank operational surface | Agent / command |
| --- | --- | --- |
| Drop | `C:\Users\frank\_inbox\` (media/content) + `SIS/memory/intake/` (knowledge links/text) + optional wiki `raw/` | Tasker/watcher + paste to Hermes/Telegram |
| Extract | Hermes `llm-wiki` ingest OR SIS `/capture` + `/distill-insights` | hermes-secondbrain / starlight-secondbrain |
| Direct | SIS `CLAUDE.md` + `AGENTS.md` + `verticals/secondbrain/*` + Hermes `SCHEMA.md` / profile rules | Constitution, not ad-hoc prompts |
| Automate | Hermes cron: daily extract + weekly lint/audit; SIS `/orchestrate-brain` weekly | cron + `/brain-consolidate` |

## Filing rule already adopted

Title notes by the **question they answer** (see `verticals/secondbrain/LLM-Wiki-Filing-Best-Practice.md`).

Candidate atomic titles from this source:
- How do I capture without sorting or tags?
- Who owns extraction: human or agent?
- What single file directs second-brain growth?
- What cadence removes maintenance completely?

## Distill signal

This is a 3+ recurrence of the Karpathy LLM-wiki + CODE + SIS Second Brain pattern already in estate. Promote as **operational playbook**, not net-new framework.

## Next actions

1. Keep capture path frictionless (Telegram → Hermes → raw/intake).
2. Wire Hermes cron: daily `/raw` extract, weekly wiki lint.
3. Do not invent a second vault — compound existing SIS + llm-wiki + `_inbox`.
