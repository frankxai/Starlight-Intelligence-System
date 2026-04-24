---
name: capture-daily
description: Daily second-brain capture routine. Under 10 minutes. Routes captures to the correct vault namespace or inbox. Runs interactive (throughout the day) or headless (end-of-day batch). Tool-agnostic — works with whatever app the person already uses.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <person-name> + optional --mode <interactive|batch> + optional capture text
---

# /capture-daily

Load `SIP.md`, `VOICES.md`, `agents/starlight-secondbrain.md`, `skills/memory/capture-discipline/SKILL.md`. Facilitate a daily capture routine for the named person. Route each capture to its namespace or to the inbox. Save the day's captures to `second-brain/captures/<person-slug>/<YYYY-MM-DD>.md`.

The rule is 10 minutes. If it takes longer, the architecture is wrong — not the person.

## Input
$ARGUMENTS

## When this command fires

- Once per day (typical), as either end-of-day batch or throughout-the-day interactive
- Person has completed `/reclaim-knowledge` (or declined to — SBIS works without reclamation, it just works better with)
- Person has a Genius Profile or is willing to operate without one

## When this command does NOT fire

- Fancy note-taking wanted. This is capture, not polish. Polish is `/distill-insights`.
- Weekly review — use `/orchestrate-brain`
- Monthly / quarterly distillation — use `/distill-insights`

## Process

1. **Greet + name the session.** Person name from `$ARGUMENTS`. Today's date from current date. Acknowledge mode (interactive vs batch).

2. **Prompt through capture moments.** Ask the person in their own voice:

   > *"What came up today worth keeping?*
   >
   > *- Any meetings or calls with an insight worth surviving? (One line per meeting.)*
   > *- Any creative ideas — content, framework, aesthetic?*
   > *- Any operational lessons — what worked, what broke, what to change next time?*
   > *- Any patterns you noticed — something you've now seen more than once?*
   > *- Anything on the edge of the Genius Profile — a framework that's refining itself, or a new one emerging?*
   >
   > *Drop each one as it comes. One sentence. I'll route."*

   Do not push for volume. Some days have one capture. Some have none. "Nothing today" is a valid answer — do not force.

3. **Route each capture.** For every capture, apply the routing table from `skills/memory/capture-discipline/SKILL.md`:

   | Capture type | Destination |
   |---|---|
   | Strategic (decision, opportunity, trade-off) | `personal/<slug>/strategic-vault.md` |
   | Creative (content, aesthetic, narrative) | `personal/<slug>/creative-vault.md` |
   | Operational (what worked, what broke) | `personal/<slug>/operational-vault.md` |
   | Pattern noticed | `personal/<slug>/wisdom-vault.md` |
   | Genius framework evolution | `second-brain/genius-evolution/<slug>.md` |
   | Unclear | `second-brain/inbox/` |

   If routing is unclear in one second, route to inbox. Do not stall on classification.

4. **Format each capture.** Apply the minimum-viable format:

   ```
   ### [YYYY-MM-DD HH:MM] <Title — one line, searchable>

   **Context:** <what was happening — one phrase>
   **Source:** <meeting / reading / walk / voice memo / <person-name>>

   <The capture. 1-5 sentences.>
   ```

5. **Save the day's log.** Write all of today's captures to `second-brain/captures/<person-slug>/<YYYY-MM-DD>.md`. One file per day. This is the flat, chronological record — routing is a separate index, not a replacement for the daily log.

6. **Write to routed destinations.** For each capture, also append to its routed namespace with the same format + a backlink to the daily log entry.

7. **Cross-reference pass (lightweight).** For each capture, grep the last 30 days of daily logs for related captures. If found, note the link in the daily log only (do not promote to framework here — that's distillation's job).

8. **Close the session.** Report back:

   > *"Captured <N> items today in <X> minutes. <M> routed, <I> in inbox — we'll sort those at weekly review. <C> cross-references to captures from the last 30 days — worth watching."*

   Do not propose actions. This is capture, not review.

## Output format

Two artifacts written per session:

1. **Daily log** — `second-brain/captures/<person-slug>/<YYYY-MM-DD>.md`:

```
# Daily Capture — <Person Name> — <YYYY-MM-DD>

**Mode:** <interactive | batch>
**Captures:** <N> (<M> routed, <I> inbox)
**Time:** <X> min

---

### [HH:MM] <Title>
**Context:** <phrase>
**Source:** <source>
**Routed:** <destination>

<capture content>

### [HH:MM] <Title>
...

## Cross-references (last 30 days)
- <capture title> ↔ <prior capture> (<date>) — <one-line link rationale>
- ...

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (SBIS alpha)
- Generated: <ISO date>
---
```

2. **Routed appends** — one entry per captured item, appended to its destination namespace file, with a backlink like `(from daily log: <YYYY-MM-DD>)`.

## Rules

- **Never** exceed 10 minutes. If approaching, stop accepting new captures and finish routing. Architecture problem — address at weekly review, not now.
- **Never** require more than four fields per capture (title, context, source, content). Adding fields is a trap.
- **Never** force classification. One-second decision or inbox.
- **Never** polish. Polish is distillation. Capture is raw.
- **Always** save the chronological daily log as the flat source of truth. Routed namespaces are indexes, not replacements.
- **Always** cross-reference lightly — only to note, never to promote. Promotion is distillation's job.
- **Always** respect "nothing today." Low-capture days are data about the week, not failures.
- **Sovereignty** — the captures live in the person's instance. Do not write to shared or institutional vaults.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (SBIS alpha)
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
