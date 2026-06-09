# Second Brain Architecture — Template

> The ongoing PKM practice that keeps your reclaimed knowledge alive. Reclamation organized your past; SBIS organizes your daily. Tool-agnostic. Ten minutes a day. Thirty minutes a week. Ninety minutes a month. Half-day a quarter.

---

## The core rule

Reclamation is a one-time act. Second Brain is a daily practice. Do not confuse them — re-reclaiming every month is how people burn out on PKM. Re-reclaim once a year at most; the rest is capture → distill → review → integrate.

## The four-cadence architecture

| Cadence | Time | Purpose |
|---|---|---|
| Daily capture | ≤10 min | Route everything worth keeping to a namespace or inbox |
| Weekly review | 30 min | Inbox to zero, cluster the week, note watch-list |
| Monthly distillation | 90 min | Elevate ≥3-occurrence clusters to framework drafts |
| Quarterly integration | half-day | Cross-reference with Genius Profile; propose evolutions |

Each cadence builds on the previous. Skip weekly and monthly collapses. Skip monthly and quarterly is a fishing expedition.

## The four-field capture format

Every capture, no exceptions, has four fields:

```
### [YYYY-MM-DD HH:MM] <Title — one line>
**Context:** <what was happening — one phrase>
**Source:** <meeting / reading / walk / voice memo / <person>>

<The capture — 1-5 sentences. Stop when you have the thought.>
```

No tags. No categories. No priority. Routing happens at destination, not at capture.

## The routing table

| Capture type | Destination |
|---|---|
| Strategic (decision, opportunity, trade-off) | `personal/<slug>/strategic-vault.md` |
| Creative (content, aesthetic, narrative) | `personal/<slug>/creative-vault.md` |
| Operational (what worked, what broke) | `personal/<slug>/operational-vault.md` |
| Pattern noticed | `personal/<slug>/wisdom-vault.md` |
| Genius framework evolution | `second-brain/genius-evolution/<slug>.md` |
| Unclear | `second-brain/inbox/` |

One-second decision. Unclear goes to inbox. Weekly review resolves inbox.

---

## Empty template

```
# Second Brain Architecture — <Person Name> — <YYYY-MM-DD>

## My tools
- **Capture-in-the-moment:** <voice memo app / text app / notebook — pick whichever is fastest for you>
- **Storage:** <Obsidian / Notion / Apple Notes / plain text / whatever you already use>
- **Search:** <native tool search / ripgrep / Obsidian search>
- **Mobile capture:** <Siri Notes / AudioPen / Drafts / notebook>

## My capture moments
(Recurring triggers when capture naturally happens — not constant vigilance.)
1. **<trigger 1 — e.g., post-client-call>** — <one-line on format>
2. **<trigger 2 — e.g., morning pages>** — ...
3. **<trigger 3 — e.g., end-of-day scan>** — ...
...

## My routing table
(Adjustments to the default table above, if any.)
- <capture type> → <destination> — <why, if different from default>

## My weekly review slot
**Day:** <fixed day — same day each week compounds>
**Time:** <fixed time — ideally after a natural transition>
**Duration:** 30 min (cap, not target)

## My monthly distillation slot
**Day:** <fixed day of month>
**Duration:** 90 min

## My quarterly integration slot
**Date:** <quarterly — e.g., first Monday of quarter>
**Duration:** half-day

## Watch-list for this week
(≤2 themes.)
- <theme 1> — <why>
- <theme 2> — <why>

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (SBIS alpha)
- Generated: <ISO date>
---
```

---

## Ana's Second Brain — filled example

```
# Second Brain Architecture — Ana — 2026-04-24

## My tools
- **Capture-in-the-moment:** Voice Memos on iPhone (transcribed via Apple's built-in transcription). Drafts for quick text when I'm at the laptop.
- **Storage:** Obsidian (macOS + iOS). Vault synced via iCloud. One folder per namespace. Daily Notes plugin for the chronological log.
- **Search:** Obsidian search + Dataview for framework tracking.
- **Mobile capture:** Voice memo first (I think better talking than typing). Drafts as backup for when voice isn't appropriate (quiet room, crowded space).

## My capture moments
1. **Post-client-call (within 5 min of hanging up)** — voice memo, one minute max: what worked, what the client resisted, what the framework did that I didn't expect.
2. **Morning pages (8am, before the laptop)** — 10 minutes of handwritten free-write in a paper notebook; I scan pages into Obsidian weekly for items that surface.
3. **End-of-day (5:30pm)** — 5-min scan: anything today worth surviving? Usually 0-2 captures.
4. **Reading sessions (variable)** — highlight in book + one-line "why this mattered" on a sticky note; sticky notes transcribed weekly.
5. **Shower thoughts** — voice memo if phone is nearby. Otherwise trust they'll resurface if they're real.

## My routing table
Default routing applies, with these adjustments:
- **Client-call patterns** → `personal/ana/wisdom-vault.md` (I treat all client patterns as wisdom candidates, because my genius IS in client pattern-recognition — this is pre-labeling for faster distillation)
- **Vocabulary I keep returning to** → `second-brain/genius-evolution/ana.md` direct (vocabulary is voice fingerprint; evolution of vocabulary is evolution of genius — routes straight to evolution candidates)
- **Energy observations (client energy, my energy, team energy)** → `personal/ana/creative-vault.md` (energy work is where my neuroscience + HR + psychology synthesis lives — that's creative for me, even though it sounds operational)

## My weekly review slot
**Day:** Sunday
**Time:** 6pm (after family dinner, before evening wind-down)
**Duration:** 30 min

## My monthly distillation slot
**Day:** First Sunday of month
**Duration:** 90 min (replaces the weekly review that Sunday — not additive)

## My quarterly integration slot
**Date:** First Sunday of the quarter (Jan / Apr / Jul / Oct)
**Duration:** 4 hours, Sunday morning
**Notes:** I block this on the calendar 12 weeks ahead. If I don't, the week fills. The block is non-negotiable — if something conflicts, I move the conflict, not the block.

## Watch-list for this week (2026-W17)
- **Framework resilience under client friction** — 4 captures in the last 10 days on clients resisting the framework, framework holding anyway. Watch if this is signal or survival bias.
- **Vocabulary: "ground state"** — returned in 3 client conversations this week across unrelated industries. Check if it's my go-to or a genuine clinical term emerging.

## Notes on the practice (honest)
- I drifted from weekly review twice in Q1 2026. Both times, the monthly distillation took 3 hours instead of 90 min because the backlog was larger. Lesson: the 30-minute weekly is cheaper than the overrun monthly. Protect the weekly.
- Voice-memo-first is the single biggest unlock. When I type in real-time, I edit while thinking, and the edit flattens the observation. Voice captures the observation; transcription lets the edit happen in a separate pass.
- Morning pages are analog on purpose. Digital morning pages become to-do lists. Paper stays reflection.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (SBIS alpha)
- Generated: 2026-04-24
---
```

---

## Rules for filling this template

- **Never** prescribe a tool in the template. If the person has a tool, use it. If they don't, ask what fits their life — don't push Obsidian, Notion, or anything else.
- **Never** add fields beyond the four (title, context, source, content). Adding fields is a friction trap.
- **Never** write monthly distillation as additive to weekly. Monthly *replaces* that week's review — not adds to it.
- **Always** fix the weekly day and time. Fixed-day rhythm compounds. Variable-day rhythm collapses within a quarter.
- **Always** cap daily at 10 min, weekly at 30 min, monthly at 90 min, quarterly at half-day. Caps are caps, not targets.
- **Always** respect that the person owns this. The architecture template is a starting point; their second brain is theirs. Drift is allowed if it's honest drift (captured, noted, reviewed) — drift is failure only if it's invisible.
- **Sovereignty** — second-brain content is personal. Not published, not synced to institutional vaults, not retained by Starlight beyond the person's instance.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (SBIS alpha)
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
