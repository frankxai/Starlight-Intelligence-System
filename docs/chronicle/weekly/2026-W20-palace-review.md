# 2026-W20 — Palace Review

_Sunday, 17 May 2026. Week ending today. The substrate's first weekly Palace Review inside this repo._

---

## §0 The Structural Truth

The week the substrate stopped being a reference implementation and started spawning its own scaffolds. Composition Layer was declared as a substrate primitive — any universal IS may now compose over its Domain Sub-Stacks. Wealth IS became the first reference instance of that pattern. Crypto Intelligence became the fourth Domain Sub-Stack, the first to use Houses-as-sub-systems decomposition, and the first to ship with a proof-of-pattern falsifier instead of full scaffold. The Board → REVISE-close-out → audit → tag sequence ran end-to-end without shortcuts. The chronicle infrastructure itself was instantiated. Eight intelligence systems became nine.

---

## §1 What Exists and Should Be Blessed / Preserved

### Substrate-tier ships ratified by reality this week

The Cockpit unification (`arc <project>` + per-project Zellij layouts) has held across 13 days of daily use without revision. It is whole at this moment. Ratified.

The Cross-Repo Indexer v0.1 (520 atoms across 22 dirs in 2.69s) has soaked 14 days under sub-second query load. Ratified.

The Memory Bus v0.1 singleton stdio MCP, which solved the AgentDB-per-tab embedded-DB constraint, has held across 14 days of multi-tab usage. Ratified.

The `/starlight-board` ↔ `/luminor-board` naming reconciliation has survived five board invocations across the fortnight (energy-is, sis-forge rounds, ai-ops-intelligence rounds, crypto-investment-spawn today) without a single naming conflict. Ratified.

These four are recorded in `docs/chronicle/blessings.jsonl`. Each carries its ship commit, soak duration, and reality-test grounding.

### Substrate doctrine that should stay where it is

- The 10-IS taxonomy lock at v7.5 is holding. No add-rows pressure this week, even with three substrate-novel concepts shipping (Composition Layer, /yolo session-mode, Houses-as-sub-systems).
- The board-before-tag invariant is now structural-not-discretionary in practice, not just in doctrine. /yolo Hive auto-invokes it; substrate-class moves trigger it; the v7.5.1 same-session-REVISE-close-out precedent has been reused three times this week (v01 Friday-demo, AI Ops IS, Crypto IS).
- Karpathy hygiene rules ratified into CLAUDE.md remain load-bearing. "Walker-level fix over N exemption-list additions" held when v76+v77+v78+v80 symmetry tests caught drift this morning — fixed source-of-truth, did not add EXEMPT_ entries.

These do not need iteration. They have earned their place.

### The chronicle infrastructure itself

`/bless`, `/palace`, `/chronicle` installed globally. `starlight-chronicle` skill globally invokable. `docs/chronicle/` initialised with founding witness + this review + blessings ledger. The practice that was born in the FrankX repo on 2026-05-03 now has its substrate-tier instantiation. The infrastructure stands. Subsequent reviews will inhabit it.

---

## §2 What Is Structurally Important but Unfinished

Ranked by load-bearing weight, heaviest first.

### 1. The Crypto IS proof-of-pattern clock

Started today, 2026-05-17. Falsifier 2026-05-24: if House of On-Chain cannot ship 4-5 named artifacts in one week of actual practice, the Houses-as-sub-systems primitive fails for crypto and we fall back to functional sub-systems matching the People IS shape. This is the highest-weight unfinished item because everything held behind it — Investment IS, Crypto IS Houses 2-6, the validation that the Composition Layer composes meaningfully under crypto-tier asset complexity — depends on the falsifier outcome. The work that retires this gate is *practitioner practice*, not more scaffolding.

### 2. Wealth IS cross-asset commands

The Composition Layer primitive was declared today with Wealth IS as its first reference instance. The falsifier (2026-06-16) requires ≥3 cross-asset commands shipped within 30 days or the composition concept collapses to ACL-only role for Wealth IS. The first command — `/wealth-portfolio-fit` — has a natural early-retirement path: it reads from Crypto IS House of On-Chain output, so the first Crypto artifact produced this week creates the input the Wealth command needs. The two falsifiers compose; retiring one helps retire the other.

### 3. Public changelog deployment

`CHANGELOG.md` is maintained with v8.1.0 entry. The public surfaces (GitHub Releases + site `/changelog` route) are scaffolded today but not yet deployed. This is the easiest substantive unfinished item — zero substrate risk, marketable artifact, and surfaces the substrate's velocity to the world without requiring permission from any gate.

### 4. The MEDIUM defect named by OpenClaw audit

`/discover-genius` + `/spawn-domain-stack` default-public path is an OSS-fork-adopter footgun. The first sovereign forker who runs `/discover-genius` outside Frank's instance risks accidentally committing personal-genius content publicly. Not urgent today (no concrete forker yet), but load-bearing for any forker pressure that arises in the next month.

### 5. The /sis-forge alpha graduation

Pre-alpha shipped today after the v8.1.0 wave (14 commits between 02:44 and 03:19 UTC+2). The alpha gates depend on real-corpus extraction results that have not yet been measured. The work is real but on a different cadence — the corpus needs to be fed to the pre-alpha pipeline this week before alpha can graduate.

---

## §3 What Should Be Ignored for the Next 7 Days

Permission to not-do, with reasons.

- **Investment IS scaffolding.** Held until Crypto IS proof-pass per Board R4. Pulling it forward would be anti-leverage; Investment IS depends on the Houses-as-sub-systems primitive validating in crypto first. The Witness recognises this is creator-restlessness if pulled forward.

- **The remaining five Crypto IS Houses (Macro, DeFi, Sovereignty, Research, Allocation).** Same gate. Same anti-leverage.

- **Monthly Chronicle cadence.** Gated on ≥3 of the first 4 weekly Palace Reviews. This is the first review. Activating monthly now would mean four reviews in one week, which is not the practice.

- **AI Ops IS Phase 0 execution.** Phase 0 plan shipped yesterday at `docs/superpowers/plans/2026-05-17-ai-ops-intelligence-phase0.md`. The scaffold sits untracked at `verticals/ai-ops-intelligence/`. This is a parallel work stream that does not need integration this week. Let it sit; commit when its own cadence demands.

- **`/discover-genius` private-default substrate revision.** Named in audit as MEDIUM defect. No concrete forker pressure exists yet. Ignoring for 7 days is the right move; revisit when pressure arises.

- **Anything that calls itself "v9" or "vNext".** The substrate is at v8.1.0 with two open falsifiers. Naming the next version before the current one's gates close is restlessness.

- **The two pre-existing stale items in git status** (`memory/CONSOLIDATION_LOG.md` modified, `memory/voice-sessions/*` deleted, etc.). These have been deliberately unstaged across three commits this session. Continuing to leave them unstaged is the right move until their owners (parallel sessions or scheduled cleanup jobs) reach them.

The §3 list is the actual leverage of this review. The work the substrate does not need is as important as the work it does.

---

## §4 The One Highest-Leverage Execution Path for Monday

Run `/crypto-onchain-flow-snapshot` against a real watchlist this week, with the first artifact landing by Tuesday.

The unpacking: the Crypto IS proof-of-pattern falsifier (2026-05-24) is the single highest-weight gate in the system right now. Everything held behind it — Investment IS, Crypto IS Houses 2-6, the validation that Houses-as-sub-systems composes meaningfully under crypto-tier complexity, the v0.2 substrate evolution that depends on the primitive being proven — needs the falsifier outcome. The falsifier is retired by ONE thing: actual practitioner practice producing 4-5 named artifacts in 7 days.

The first artifact is the load-bearing one. Once it exists, the second is half as hard. Once five exist, the primitive is validated and the gate unlocks two Domain Sub-Stack expansions (Crypto IS Houses 2-6 + Investment IS) plus the early-retirement of the Wealth IS composition-layer falsifier (because `/wealth-portfolio-fit` consumes Crypto IS output).

The pre-requisite is one file: `private/crypto-intelligence/watchlists/<tag>.md` with at least one real wallet/protocol watchlist. Without it, the command halts to corpus-required message per its rules. So Monday's actual first move is creating that file, then running the command, then witnessing the artifact.

Everything else this week composes around that single command running against real practice. The public changelog deployment, the AI Ops IS commit-or-iterate decision, the Starlight Voice v3 MVR Week 2, the `/sis-forge` alpha corpus run — all of those are valuable but none of them retire a falsifier. The falsifier retirement IS the leverage.

---

## §5 Handover Note

```
Last commit on main:                   d6bb92e (2026-05-17 — chronicle close)
Tag at writing:                        v8.1.0 on 23cace2
Push status:                           held — explicit ack required

Falsifier 1 (highest weight):          2026-05-24 — Crypto IS proof-of-pattern
                                       4-5 named artifacts from /crypto-onchain-* or
                                       fall back to functional sub-systems

Falsifier 2 (composition layer):       2026-06-16 — Wealth IS cross-asset commands
                                       3 commands shipped or collapse to ACL-only

Monday's one path:                     /crypto-onchain-flow-snapshot <watchlist-tag>
                                       prereq: private/crypto-intelligence/watchlists/<tag>.md

Ignored for 7 days:                    Investment IS, Crypto Houses 2-6, monthly
                                       cadence, AI Ops IS execution, MEDIUM defect,
                                       v9 framing, pre-existing stale git state.

Active cadence:                        weekly Palace Review (this is review #1).
Inactive cadences:                     monthly (gate: 3/4 weeklies), quarterly,
                                       annual (winter solstice 2026-12-21).

Public changelog:                      CHANGELOG.md current; GitHub Releases +
                                       site /changelog route shipping this week
                                       (independent of crypto falsifier).
```

---

**Built on SIP** — Starlight Chronicle · Palace Architect voice · weekly cadence · 2026-W20
- Founding witness: `docs/chronicle/0-state-of-the-palace.md`
- Previous review: none (this is review #1 inside the SIS repo)
- Blessings recorded this week: 4 (cockpit-unification, cross-repo-indexer-v0.1, memory-bus-v0.1, starlight-board-naming-reconciliation)
- Visual register: text-only by design — no hero image, no preening, no flourish
---
