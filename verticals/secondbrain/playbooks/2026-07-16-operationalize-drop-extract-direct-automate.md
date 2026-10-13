---
title: How do we operationalize drop → extract → direct → automate on this machine?
created: 2026-07-16
updated: 2026-07-16
type: playbook
tags: [second-brain, capture, hermes, sis, cron, llm-wiki]
sources:
  - https://www.instagram.com/reel/DYcu-OZArsi/
  - memory/intake/intake-2026-07-16-alinapak-second-brain-4-steps.md
  - verticals/secondbrain/README.md
  - research skill: llm-wiki
confidence: high
---

# How do we operationalize drop → extract → direct → automate on this machine?

**Answer:** Do not build a new second brain. Wire Alina Pak’s 4 steps into the surfaces already running on C940: `_inbox` + SIS Second Brain IS + Hermes `llm-wiki` + cron.

## The 4 steps (source)

1. **Drop** — everything into one raw place; no sorting, no tags
2. **Extract** — agent turns mess into clean linked notes
3. **Direct** — one rules file owns structure + growth rules
4. **Automate** — daily review + weekly audit; stop hand-maintaining

## Target architecture (Frank / C940)

```
CAPTURE (human, <10s)
  Telegram / desktop drop / browser share
        │
        ▼
L0 RAW (immutable dump — no tagging)
  Media/content → C:\Users\frank\_inbox\...
  Knowledge links/text → SIS/memory/intake/  OR  wiki/raw/
        │
        ▼
EXTRACT (agent)
  Hermes skill: llm-wiki (ingest)
  SIS: /capture · /distill-insights · starlight-secondbrain
        │
        ▼
COMPILED WIKI / VAULTS (agent-owned)
  entities/ concepts/ comparisons/ queries/
  + SIS vaults (Strategic · Technical · Creative · Operational · Wisdom · Horizon)
  + second-brain/inbox · distilled · frameworks
        │
        ▲
DIRECT (constitution)
  SIS CLAUDE.md + AGENTS.md
  verticals/secondbrain/* + LLM-Wiki-Filing-Best-Practice.md
  Hermes SCHEMA.md (if wiki path set)
        │
        ▼
AUTOMATE
  Daily: process new raw/intake → extract + log
  Weekly: lint/audit + inbox zero + ≥3 pattern promotion
  Monthly: framework elevation + Genius evolution proposals
```

## Capture routing (keep zero friction)

| What you drop | Where it lands | Who processes |
| --- | --- | --- |
| Voice / photo / screen / video | `C:\Users\frank\_inbox\<type>\` | Content ops watchers + producers |
| Chat export / long dump | `C:\Users\frank\FrankX\.intake\` | FrankX intake |
| Link, article, reel, idea text | Telegram → Hermes **or** `SIS/memory/intake/` | Second Brain / llm-wiki |
| Repo-local knowledge | repo `raw/` or docs | Repo agent + AGENTS.md |

**Rule:** At drop time you never choose vault, tag, or folder depth. Only “media vs knowledge” if forced; default knowledge → intake.

## Direct (single constitution — already mostly exists)

Do **not** create a second competing CLAUDE.md for “the brain.” Point agents at:

1. Machine: `C:\Users\frank\.agent-harness\global-agent-brief.md`
2. SIS: `Starlight-Intelligence-System/CLAUDE.md` + `agents/starlight-secondbrain.md`
3. Vertical: `verticals/secondbrain/README.md` + `LLM-Wiki-Filing-Best-Practice.md`
4. Optional personal wiki: `SCHEMA.md` at `WIKI_PATH` (Hermes llm-wiki)

Filing rule already locked (2026-07-14): **title notes by the question they answer.**

## Extract SOP (per source)

1. Save immutable raw (URL + date + sha if possible)
2. Classify: insight | reference | decision | pattern | question | evidence
3. Search existing vault/wiki for neighbors (no duplicates)
4. Write/update linked notes (min 2 wikilinks)
5. Append log + index
6. Receipt to human only if decision needed

## Automate (recommended Hermes cron)

| Cadence | Job | Prompt intent | Deliver |
| --- | --- | --- | --- |
| Daily | `second-brain-daily-extract` | Scan `_inbox` new docs + `SIS/memory/intake` new files from last 24h; extract to wiki/vaults; log | local or Home |
| Weekly | `second-brain-weekly-audit` | Inbox zero, orphan links, ≥3-occurrence promotions, lint | origin/Home |
| Monthly | optional | Framework elevation + Genius evolution proposals | origin |

Use Hermes `cronjob` with `workdir` set to SIS when running SIS commands; use `llm-wiki` when wiki path is configured.

## What NOT to do

- Do not create yet another vault for “Alina setup”
- Do not tag at capture time
- Do not treat Mem0/Graphiti/Notion as SoT (markdown vault is canonical)
- Do not promote one-off observations to frameworks (<3 occurrences)
- Do not put private journal into git-tracked public-ish surfaces

## Minimum viable win (this week)

1. **One drop habit:** any knowledge link → Hermes Telegram: `capture: <url or text>`
2. **One extract path:** Hermes runs llm-wiki or SIS `/capture` same day
3. **One weekly cron:** Sunday audit (inbox zero + lint)
4. **One rules pointer:** this playbook linked from secondbrain MEMORY.md / log

## Success metrics

| Metric | Target |
| --- | --- |
| Capture friction | < 10 seconds |
| Raw backlog age | < 48h before extract |
| Weekly inbox zero | 100% |
| Framework promotions | only ≥3 signal |
| Manual vault gardening | near zero |

## Related

- [[LLM-Wiki-Filing-Best-Practice]]
- `agents/starlight-secondbrain.md`
- `workflows/secondbrain/WORKFLOW.md`
- Hermes skill `llm-wiki` (Karpathy pattern)
- Machine intake: `C:\Users\frank\_inbox\`
