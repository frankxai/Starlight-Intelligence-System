---
name: discover-genius
description: Excavate genius from a person's scattered corpus. Produces Genius Profile (what only they uniquely see) + Freedom Path (four-bucket sort of every activity). Gateway to all downstream intelligence systems. For humans, not agents.
allowed-tools: Read, Write, Grep, Glob
argument-hint: person's name + corpus paths/sources, or free-text paragraph describing their work
---

# /discover-genius

Load `SIP.md`, `VOICES.md`, `agents/starlight-genius.md`, `skills/intelligence/genius-excavation.md`. Excavate the person's genius from the corpus they provide. Produce Genius Profile + Freedom Path. Hand off to exactly one downstream command.

## Input
$ARGUMENTS

## Process

1. **Ingest.** Identify the person. Collect corpus from the sources named in `$ARGUMENTS`. If no corpus is provided — only a name or a free-text description — halt and return:

   > *"Need corpus to excavate. Provide 3–5 sources of your material (Canva, Google Drive, local Documents, Notion, screenshots, past posts/essays, recorded sessions). You do not need to send everything — just point me at representative samples from each source."*

   Do not proceed without corpus.

2. **Recognize.** Scan the corpus for repeated frameworks. A pattern is only named if it recurs ≥3 times across corpus items. Record observed-in sources for each framework.

3. **Cross-reference.** Identify the ≥2 fields this person blends. Name the compounding edge.

4. **Voice-sample.** Extract 10–15 distinctive words or phrases, and 5–7 real quotes from the corpus with source citations.

5. **Sort.** For every activity referenced in the corpus, assign exactly one bucket: KEEP / DELEGATE / AUTOMATE / KILL. All four buckets must be populated before synthesis.

6. **Synthesize.** Generate the two documents using the output shape below.

7. **Save.** Create `genius/` directory if missing. Write:
   - `genius/profile-<slug>.md`
   - `genius/freedom-path-<slug>.md`

   Where `<slug>` is the person's name in kebab-case. Both files must include the "Built on SIP" attestation block. Personal-genius data lives in the person's instance only — do not write to any public vault.

8. **Hand off.** Name exactly one next move from the downstream menu. Never two. Do not offer optionality.

## Output format

```
# Genius Profile — <Person Name> — <YYYY-MM-DD>

## Signal (what only you uniquely see)
<2-3 sentences naming the lens only this person brings. Specific, not generic.>

## Frameworks you keep rebuilding (≥3)
1. **<framework name>** — <one-line description> (observed in: <sources>)
2. **<framework name>** — <one-line description> (observed in: <sources>)
3. **<framework name>** — <one-line description> (observed in: <sources>)

## Distinctive vocabulary (fingerprint)
- "<word/phrase>" — <context of use>
- "<word/phrase>" — <context of use>
- (10–15 items total)

## Cross-domain synthesis (your compounding edge)
**<Field A> × <Field B> [× <Field C>]** = <the resulting unique edge, named in the person's register>

## Voice samples (how you uniquely say it)
1. "<direct quote>" — <source>
2. "<direct quote>" — <source>
3. "<direct quote>" — <source>
4. "<direct quote>" — <source>
5. "<direct quote>" — <source>
(5–7 items total)

---

# Freedom Path — <Person Name> — <YYYY-MM-DD>

## KEEP (genius work — only you can do)
- <task/activity>
- <task/activity>
- ...

## DELEGATE (executor work — anyone trained can do)
- <task/activity>
- <task/activity>
- ...

## AUTOMATE (system work — AI/workflow can do)
- <task/activity>
- <task/activity>
- ...

## KILL (compounds nothing — stop doing)
- <task/activity>
- <task/activity>
- ...

## Next moves
1. Handover executor onboarding → `/train-executor <executor-name>` (from DELEGATE bucket)
2. Content pipeline from frameworks → `/creator-pipeline` (from KEEP bucket, modalized)
3. Second-brain architecture → `/reclaim-knowledge` (organize what's been scattered)
4. Business-layer design → (future) `/build-business`

**Named next move for this person:** `/<command>` — <one-line rationale>

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (GIS alpha)
- Generated: <ISO date>
---
```

## Rules

- **Never output without a corpus.** If the person has not provided inputs, return the halt message in Step 1. Log the halt; do not fabricate a Profile.
- **Never output without all four Freedom-Path buckets populated.** An empty bucket means the sort is incomplete. Return to Step 5 and continue excavating.
- **Voice samples must be verifiable.** Every quote cites its source. Paraphrases are refused.
- **Frameworks require ≥3 occurrences.** Anecdotes are not frameworks. Do not pad the list to hit a number — three honest frameworks beat five invented ones.
- **Save both documents together.** `genius/profile-<slug>.md` and `genius/freedom-path-<slug>.md` ship as a pair. Never one without the other.
- **Sovereignty is non-waivable.** This person owns their Genius Profile. Starlight does not retain personal-genius data in public vaults — it lives in the person's instance only. Attribution via "Built on SIP" is the sole compounding mechanism. Advice never overrides.
- **Hand off to exactly ONE next command.** Optionality at the end of excavation re-scatters what the Path just sorted. Collapse to one.
- **Non-technical users.** Ana-grade test: would this work for someone in Claude Desktop + Cowork, no terminal? If the excavation depends on CLI, it failed the test. Accept file drags, pastes, folder paths, screenshots.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (GIS alpha)
- Generated: 2026-04-24
---
