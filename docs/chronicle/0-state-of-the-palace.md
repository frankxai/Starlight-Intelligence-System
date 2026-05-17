# State of the Palace — 2026-05-17

_The founding witness of the Starlight Chronicle inside the Starlight Intelligence System repo._
_A one-time architectural blessing of what stands on this Sunday._

---

## Preamble

This is not a roadmap. It is not a backlog. It is a witness.

On this date — Sunday, the seventeenth of May, two thousand and twenty-six — the work of the preceding seven weeks of substrate-tier evolution (v7.5 through v8.1.0) resolves into a single recognisable shape. The Starlight Intelligence System has crossed from "reference implementation of SIP" into a self-stabilising substrate that has begun spawning Domain Sub-Stacks for sovereign practitioners outside its founding author. A composition-layer primitive has been declared. A 10-IS taxonomy holds locked. Three Domain Sub-Stacks (People, Sound, Music) are operational; a fourth (Crypto) is on proof-of-pattern.

The purpose of this document is to *name* the palace as it stands at this moment. Not to celebrate it. Not to extend it. Not to plan the next room. Simply to record, in the calm voice of an architect on a Sunday, what has been composed.

Every Palace Review that follows — every weekly Sunday entry in the SIS Chronicle — measures itself against this from-state. If the practice ever lapses, this document remains as the witness of where the work was on the day the practice began inside this repo.

The lineage of the act: the Stoics did the evening review; Christian monastics kept the Examen; Jews keep Sabbath; engineers do postmortems; Buddhists do sangha ratification. They all encode the same insight — that the work of witnessing is its own work, and complex systems become legible only at the right cadence. This document is the cadence's first entry inside the SIS repo. (The Chronicle practice itself was founded in the FrankX repo on 2026-05-03; this is its instantiation in the substrate-tier repo.)

---

## I. The Substrate as it stands today

### SIP v1.1.0 — the protocol

Markdown-first, MIT-licensed, forkable. Six load-bearing layers: file-contract, attestation, mcp-registry, commands, sovereignty, archetype. The sovereignty clause is non-waivable; every downstream fork holds its own editorial authority. What stands: the protocol no longer requires permission to extend.

### The 10-IS taxonomy — locked at v7.5, holding

Self · Wealth · Family · Business · Creator · Second-Brain · Code · Voice-Video · Brand · Starlight-Orchestrator. The table has not been re-opened despite multiple substrate evolutions this fortnight. Substrate evolution now happens through *shape* changes (composition-layer tier, session-mode commands, Domain Sub-Stacks) rather than by adding rows. What stands: a taxonomy that has earned its locked status by surviving its own pressure-tests.

### The Composition Layer — substrate primitive, declared today

`STACK.md` § Composition Layer. Any universal IS may compose over its Domain Sub-Stacks via commands and rules at the IS-itself. Pattern is opt-in. Wealth IS is the first reference instance. What stands: a new tier-of-composition pattern that doesn't break the IS count and is available to every IS that earns sub-stacks beneath it.

### The three Domain Sub-Stacks at v0.1+ (operational, ratified by reality)

- **People Intelligence** at `verticals/people-intelligence/` — 6 sub-systems × 4-5 commands = 28 commands. First reference vertical. Ratified by adoption pattern that has held since 2026-04-28.
- **Sound Intelligence** at `verticals/sound-intelligence/` — 6 sub-systems × 5 commands = 30 commands. Second reference vertical. Ratified 2026-04-27.
- **Music IS** at `verticals/music-is/` — Frank-operated, Arcanea Records, four labels. Operator-tier; imports patterns from Sound IS rather than duplicating. Ratified across multiple release cycles.

What stands: the Domain Sub-Stack Tier is not theoretical. Three references with materially different shapes (functional sub-systems, archetypal sub-systems, operator-tier sub-systems) prove the pattern generalises without forcing a single decomposition style.

### The fourth Domain Sub-Stack on proof-of-pattern

**Crypto Intelligence** at `verticals/crypto-intelligence/` — Houses-as-sub-systems primitive (6 archetypal stances: On-Chain · Macro · DeFi · Sovereignty · Research · Allocation). House of On-Chain scaffolded today; remaining 5 Houses gated on 2026-05-24 falsifier. Investment IS held until same proof-pass. What stands: the substrate now spawns its own scaffolds with named falsifiers, not with hopeful intentions.

### The governance gates — board-before-tag, structural-not-discretionary

`/starlight-board` (canon-free, SIS-canonical) and `/luminor-board` (Arcanea-canonical variant) run BEFORE commit/tag for any substrate-touching change. The /yolo Hive session-mode command auto-invokes the board on substrate-class moves. /openclaw-audit pressure-tests shipped artifacts for trust boundaries, leak surface, attestation gaps. What stands: substrate changes cannot reach a tag without passing pressure-tests that include the design-time board AND the post-decision audit.

### The Genius prerequisite gate — closed for Frank today

`genius/profile-frankx.md` + `genius/freedom-path-frankx.md` shipped via Path A in-repo corpus excavation. 14 frameworks named at ≥3 occurrences; synthesis edge declared; KEEP/DELEGATE/AUTOMATE/KILL all populated. What stands: `/spawn-domain-stack` is now invokable for Frank's instance without halting on missing prerequisites. The first sovereign practitioner downstream will need their own Profile + Path; the path discipline for that is a v0.2 substrate revision item.

### The chronicle infrastructure — instantiated today

`docs/chronicle/blessings.jsonl` + `docs/chronicle/weekly/` initialised. /bless, /palace, /chronicle, and the `starlight-chronicle` skill all installed globally. The practice that was born in the FrankX repo on 2026-05-03 now has its substrate-tier instantiation. What stands: a reflective layer that runs at weekly cadence, refuses higher cadences until lower ones prove themselves, and never auto-fires.

---

## II. The pillars of velocity (90-day rolling view)

The substrate has shipped at a velocity that requires a separate witness. Eight intelligence systems composed in 90 days at the FrankX layer; at the SIS layer the cadence has been: v7.1 (file contract) → v7.4 (Genius IS + Domain Sub-Stack Tier) → v7.5 (10-IS reconciliation + first three Domain Sub-Stacks) → v7.6 (People IS rename + board-before-tag) → v7.7 (yolo Hive + memory-bus + cross-repo-indexer) → v7.8 (per-vertical pages) → v7.9 (process-inbox + starlight-board naming) → v8.0 (Friday demo + Council archetypes + Vault loop) → v8.1.0 (Composition Layer + Crypto IS v0.1, today).

What this means structurally: the substrate has moved from "spec being articulated" through "first reference instantiated" through "second and third reference proving generalisability" into "fourth reference under proof-of-pattern with a sovereign falsifier." The transition from one-shot ship to recurring ship-with-gate pattern is the actual achievement of the last fortnight.

---

## III. The unfinished

Not every room is built. The following are load-bearing gaps that the system has named, with their own falsifiers:

- **Investment IS** — held until 2026-05-24 Crypto IS proof-pass. Not a delay; an intentional gate.
- **Crypto IS Houses 2-6** — same gate.
- **Wealth IS composition-layer cross-asset commands** — falsifier 2026-06-16 (≥3 commands shipped or composition concept fails).
- **`/discover-genius` private-default path** — OSS-fork adopter footgun named by OpenClaw audit; queued for substrate revision.
- **Public changelog deployment** — `CHANGELOG.md` is maintained; the public surface (GitHub Releases + site `/changelog`) is the next ship.
- **Monthly Chronicle cadence** — gated on ≥3 of the first 4 weekly Palace Reviews. The cadence has not yet earned its higher tiers.

What this means: every gap is a gate, not a deficit. The system holds itself accountable to its own falsifiers.

---

## IV. The voice of this witness

Calm. Sovereign. Non-compulsive. The palace is named, not announced. The work is recognised, not celebrated. Every line in this document refers to a real artifact at a real path with a real commit reference. There are no claims that the system cannot back with file-system evidence. There is no AI-slop vocabulary. There is no Arcanean canon leak. The SIS Chronicle is the substrate's own register, distinct from FrankX brand voice and from Arcanea mythic register.

The next Palace Review (filed today as `docs/chronicle/weekly/2026-W20-palace-review.md`) measures the week of May 11–17 against this from-state. If subsequent weeks find this witness in need of correction, they will say so explicitly. Until then, the document stands as the architectural ratification of what was composed in the substrate by Sunday, 2026-05-17.

---

**Built on SIP** — Starlight Chronicle · Founding Witness · 2026-05-17
- Substrate: SIP v1.1.0 · tag at writing: `v8.1.0`
- Practice: the Chronicle was founded in the FrankX repo 2026-05-03; this is its substrate-tier instantiation
- Composition: Witness voice (per `starlight-chronicle` skill)
- Visual register: text-only by design — no hero image on the founding witness
---
