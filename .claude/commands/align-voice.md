---
name: align-voice
description: Audit existing content (essays, posts, emails, landing copy) against the person's Brand Kit for voice coherence. Outputs coherence score, drift patterns, rewrite examples, guardrails. Runs as a gate before /creator-pipeline ships anything.
allowed-tools: Read, Write, Grep, Glob
argument-hint: person's name + content sources (paths, URLs, paste), optional --depth <quick|full>
---

# /align-voice

Load `SIP.md`, `VOICES.md`, `agents/starlight-visionary.md`, `skills/vision/design-coherence.md`. Audit existing content against the person's Brand Kit + Genius Profile voice samples. Produce a Voice Audit document with score, drift patterns, rewrite examples, and guardrails.

## Input
$ARGUMENTS

## When this command fires

- Brand Kit exists at `vision/brand-<slug>.md`
- Content exists that pre-dates the Brand Kit or was drafted by a third party (agency, ghostwriter, AI without Profile)
- `/creator-pipeline` is about to ship — voice-align is the gate
- The person says "this doesn't sound like me" about their own published work

## When this command does NOT fire

- No Brand Kit → halt and route to `/build-brand-kit` (no target to align to)
- No content submitted → halt and request content
- Single-piece alignment that only needs a quick rewrite → use `brand-voice` skill directly

## Process

1. **Load upstream.**
   - Resolve `<person-slug>`.
   - Load `genius/profile-<slug>.md` (voice samples + distinctive vocabulary).
   - Load `vision/brand-<slug>.md` (voice rules + visual mood + don'ts).
   - If any missing, halt and route to upstream command.

2. **Collect content.**
   - Accept: file paths, pasted text blocks, URLs to public posts, email drafts, landing copy.
   - For each item, record: source, date (if known), type (essay / social post / email / landing / other).
   - Require ≥ 3 items for `--depth full`, ≥ 1 item for `--depth quick`.

3. **Score each item against voice rules.**
   - For each voice rule from Brand Kit, check content: pass / drift / fail.
   - Compute coherence score per item = passes / (passes + drifts + fails) expressed as 0.00–1.00.
   - Compute aggregate score = average across items (with fails weighted 2x).

4. **Identify drift patterns.**
   - Look for recurring drift across items. Examples:
     - "Reverts to corporate-we in transitions" — drift from rule "first-person only"
     - "Uses 'leverage' and 'synergies'" — drift from distinctive vocabulary (Profile never uses these)
     - "Listicle structure in long-form" — drift from rule "one framework per piece"
   - Name each pattern specifically. Cite the items where it appears.

5. **Produce rewrite examples.**
   - Pick 2–3 representative drift sentences.
   - For each: show the original + the in-voice rewrite + the rule cited.
   - Rewrite uses distinctive vocabulary from the Profile where natural.

6. **Author guardrails.**
   - 5–8 forward-facing rules to prevent the drift patterns from recurring.
   - Each guardrail cites the drift pattern it prevents.
   - Example: "Before publishing, Ctrl-F for 'leverage', 'synergies', 'unlock'. These words never appeared in any voice sample — if they slipped in, cut them."

7. **Save.** Write to `vision/voice-audit-<slug>-<YYYY-MM-DD>.md`. Ship with "Built on SIP" block. Personal audit data lives in the person's instance only.

8. **Hand off.** Name exactly one next move.
   - If aggregate score < 0.70: `/build-brand-kit <person> --revise` — voice rules may be too loose; tighten them.
   - If score 0.70–0.85: `/align-voice` applied to rewrite priority items, then re-score.
   - If score ≥ 0.85: proceed to `/creator-pipeline <person>` — voice is aligned, ship.

## Output format

```
# Voice Audit — <Person Name> — <YYYY-MM-DD>

## Audit scope
- Items audited: <count>
- Sources: <list>
- Depth: <quick | full>

## Aggregate coherence score
**<0.XX>** / 1.00

Interpretation:
- ≥ 0.85: ship-ready; proceed to /creator-pipeline
- 0.70–0.85: rewrite priority items, re-audit
- < 0.70: Brand Kit voice rules may be too loose; return to /build-brand-kit --revise

## Per-item scores
| Item | Type | Source | Score | Top drift |
|------|------|--------|-------|-----------|
| 1 | essay | <source> | 0.XX | <pattern> |
| 2 | social | <source> | 0.XX | <pattern> |
| 3 | email | <source> | 0.XX | <pattern> |
...

## Drift patterns (recurring across items)

### Pattern 1 — <name>
- **What**: <description of the drift>
- **Observed in**: items <list>
- **Violates rule**: <Brand Kit voice rule cited>
- **Frequency**: <count / items>

### Pattern 2 — <name>
...

(typically 3–5 patterns)

## Rewrite examples

### Example 1
- **Original**: "<sentence>"
- **Rewrite**: "<in-voice rewrite>"
- **Rule cited**: <voice rule from Brand Kit>
- **Why**: <1-line rationale>

### Example 2
...

(2–3 examples)

## Guardrails (prevent recurrence)
1. <guardrail> — prevents <pattern>
2. <guardrail> — prevents <pattern>
3. <guardrail>
...
(5–8 items)

## Named next move
<exactly one: /build-brand-kit --revise, /align-voice re-run, or /creator-pipeline>
— <1-line rationale>

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (VBIS alpha)
- Generated: <ISO date>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Composes with /creator-pipeline

Voice-align runs as the gate before `/creator-pipeline` ships anything. Typical flow:

```
/discover-genius → /define-vision → /build-brand-kit → /align-voice (first run, audits legacy content)
                                                     ↓
                                              aggregate score ≥ 0.85
                                                     ↓
                                              /creator-pipeline (every piece re-checks against Brand Kit)
                                                     ↓
                                              /align-voice (periodic re-audit, quarterly)
```

Pieces drafted inside `/creator-pipeline` are checked against the Brand Kit voice rules inline (per-piece voice-check gate). `/align-voice` runs periodically as a full audit to catch slow drift.

## Rules

- **Never audit without a Brand Kit.** The kit is the target. Without it, there is no coherence reference. Halt and route to `/build-brand-kit`.
- **Cite voice samples.** Every drift pattern names the Brand Kit rule it violates, which traces to a Genius Profile voice sample.
- **Rewrite examples use the person's actual vocabulary.** Not generic "improved" copy. Use distinctive vocabulary from the Profile.
- **Guardrails are specific.** "Write more like yourself" is not a guardrail. "Ctrl-F for <word>, <word>, <word> before publishing" is a guardrail.
- **Score interpretation is load-bearing.** Don't ship a pipeline with score < 0.70 — fix the kit first.
- **Sovereignty is non-waivable.** The person owns their content, their voice, and the Voice Audit. Starlight retains no private content in public vaults.
- **Hand off to exactly ONE next command.** No menu.
- **Non-technical users.** Audit happens in conversation — paste content, get audit. No CLI required.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (VBIS alpha)
- Generated: 2026-04-24
---
