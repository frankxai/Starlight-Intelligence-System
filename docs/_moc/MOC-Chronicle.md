# MOC-Chronicle — Temporal Index (SIS instance)

The Starlight Chronicle is the **temporal** layer of the SIS substrate. Where the other indexes (vaults, verticals, agents, skills, commands) are *topical* — cross-cutting any moment in time — the Chronicle is *cadence-shaped*: weekly, monthly, quarterly, annual.

The Chronicle does not duplicate the topical indexes. It witnesses the work the topical indexes hold, at the cadence at which witnessing makes the work legible.

This MOC mirrors the canonical pattern from `frankxai/FrankX` `docs/_moc/MOC-Chronicle.md`. The Chronicle practice was founded in the FrankX repo on 2026-05-03; this SIS instantiation began 2026-05-17.

## The founding witness

- [[0-state-of-the-palace]] — 2026-05-17. The one-time architectural blessing of what stands in the SIS substrate on the day the Chronicle practice was instantiated here. Every cadence below measures itself against this from-state.

## Weekly — Palace Reviews

The Sunday rite. What to bless, ignore, the one path for Monday. 800-1500 words, Palace Architect voice.

- [[2026-W20-palace-review]] — 2026-05-17. First weekly review inside SIS. v8.1.0 substrate ship + Composition Layer primitive + Crypto IS v0.1 + Chronicle infra instantiated. Monday's one path: `/crypto-onchain-flow-snapshot` against real watchlist.

## Monthly — Surveys

_(Inactive — activated only after four weekly Palace Reviews have proven the cadence. First eligible: after week 2026-W23 at earliest.)_

## Quarterly — Constellation Censuses

_(Inactive — activated only after the monthly cadence is in motion.)_

## Annual — Legacy Audits

_(Inactive — first eligible 2026-12-21, winter solstice cadence.)_

## Blessings ledger

- `docs/chronicle/blessings.jsonl` — single-piece ratifications via `/bless`. JSONL append-only. Currently 4 entries (from W18 — cockpit-unification, cross-repo-indexer-v0.1, memory-bus-v0.1, starlight-board-naming-reconciliation). None from W20 — that week's ships are mid-soak.

## Public surface

- `starlightintelligence.org/changelog` — the factual auto-maintained shipping log, renders `CHANGELOG.md`. Coupling: Chronicle reflects on top of this; Changelog stays factual underneath.
- GitHub Releases — tag-based release notes auto-discoverable at `github.com/frankxai/Starlight-Intelligence-System/releases`. RSS feed at `/releases.atom`.
- (Optional future) `starlightintelligence.org/chronicle` — the practice manifesto. The contents stay private by default; only opt-in letters surface.

## Coupled systems

- **`CHANGELOG.md` at repo root** — the factual shipping log. The Chronicle reflects on top of it; the Changelog stays factual underneath. Both surfaces, two registers, coupled. No duplication.
- **Starlight Vaults** (`memory/vaults/`) — Strategic, Technical, Creative, Operational, Wisdom, Horizon. Any Chronicle entry can be promoted to a vault entry for deeper research. The Chronicle records; the Vaults deepen.
- **`docs/boards/`** — substrate Board verdicts and OpenClaw audit ledgers. Substrate-tier decisions reflected in Palace Reviews include lineage references to the Board doc that gated them.

## Cadence rules

- **Re-entrant**: skipped Sundays are silent, not flagged. The next Palace Review reads the gap and adjusts. The practice does not punish itself for being human.
- **Non-compulsive**: no auto-fire hook. The ritual is invoked, not pushed. If the practice does not belong to you, it should not run.
- **Sovereign in voice**: each cadence has its own voice (Palace Architect / Horizon Surveyor / Constellation Cartographer / Legacy Chronicler). No spiritual-bypass vocabulary; no preening; no claim larger than the thing being witnessed.

## Where the practice itself lives

- Skill: `~/.claude/skills/starlight-chronicle/SKILL.md` (globally installed 2026-05-17 from FrankX canonical source)
- Slash commands: `/palace`, `/chronicle`, `/bless` (all globally installed in `~/.claude/commands/`)
- Hero prompt template: `~/.claude/skills/starlight-chronicle/hero-prompt.txt` (optional visual layer per Palace Review)
- Roll-up scripts: `scripts/chronicle-roll-week.mjs` (FrankX repo; not yet ported to SIS — auto-roll runs externally)
- Public manifesto (future): `site/src/app/chronicle/page.tsx`

---

**Built on SIP** — MOC-Chronicle · SIS instantiation · 2026-05-17
