# Handover — People Intelligence Friend-Share Ops

**Date:** 2026-05-18
**Owner:** Frank
**Status:** Decision recorded · Phase-1 atomic moves named · 30-day shape locked
**Scope:** How People Intelligence (and every future vertical) reaches friends without GitHub, terminal, or onboarding overhead.

---

## TL;DR — the architectural posture

**Do not build new distribution infrastructure.** It exists. `/sip-export` already supports 8 targets (claude-project, chatgpt-project, gemini-gem, cursor, cowork, microsoft-copilot, custom-gpt, notion-ai). The Phase-0 People Intelligence vertical is complete (9 wrapper files · 6 agents · 6 skills · 28 commands · 6 knowledge templates · 596/596 green). The friend-starter pack pattern is shipping at v0.1.

**The gap is operational, not architectural.** Three atomic moves and one calibration turn the existing substrate into a friend-share motion. Anything more is yak-shaving.

**Refusal:** any plan that requires a non-technical friend to touch GitHub, npm, a terminal, or a config file. The whole point of the friend-starter pattern is collapsing install to *one paste + one upload*.

---

## What's done

| Surface | State |
|---|---|
| People Intelligence vertical (Phase 0) | Complete — `verticals/people-intelligence/` |
| 6 sub-system agents, 6 skills, 28 commands | Complete |
| 6 People knowledge templates | Already in `integrations/starter-packs/friend-starter/knowledge/people-*-template.md` |
| `/sip-export` engine + 8 target schemas | Complete |
| Generic friend-starter (Genius routing) | v0.1 shipping |
| `/sovereign-spawn` + `/spawn-domain-stack` | Complete |

## What's missing

| Gap | Severity | Cost |
|---|---|---|
| People-Intelligence-flavored friend-starter variant (Starlight routes to People sub-systems, not Genius) | High — friends with HR rooms get routed to the wrong arc | ~2 hrs |
| Pre-generated install bundles per target (custom-gpt, claude-project, cowork) for People | High — `/sip-export` exists but artifacts don't | ~1 hr per target |
| Feedback return-channel that doesn't require GitHub | Medium — no signal loop = no learning | ~3 hrs (Notion form → transmissions/) |
| Public landing surface for friends to discover the install | Low — direct-share via Drive/email works for v0.1 | Defer to month-2 |

---

## This week (atomic, testable Friday 2026-05-22)

### Move 1 — Generate the three friend-share bundles

```bash
/sip-export custom-gpt   verticals/people-intelligence/SKILL.md  --output dist/friend-share/people-intel/custom-gpt
/sip-export claude-project verticals/people-intelligence/SKILL.md --output dist/friend-share/people-intel/claude-project
/sip-export cowork        verticals/people-intelligence/SKILL.md  --output dist/friend-share/people-intel/cowork
```

Three artifacts. Each round-trips attestation. Each ships with its own README. Total elapsed ~30 min (most is generation + validation).

**Definition of done:** all three integrity checks PASS. Each bundle is shareable as a zip.

### Move 2 — Fork the friend-starter, tune routing for People

Copy `integrations/starter-packs/friend-starter/` → `integrations/starter-packs/people-intel-starter/`. Swap `custom-instructions.md` routing:

- Open with the People-Intel-tuned opener: *"What's the room? Hiring? Performance broken? Culture drifting? Team showing strain? Reorg coming? Training stuck?"* — collapses to the 6 sub-systems immediately.
- Route table replaces Genius/Second-Brain/Executor/Creator with the 6 People sub-systems from `verticals/people-intelligence/QUICK-START.md` Action-1 table.
- Knowledge files = the 6 `people-*-template.md` files already present + `sis-overview.md` + `attestation-block.md` + `sovereignty-clause.md` + a new `people-intelligence-overview.md` (compressed `SUB-SYSTEMS.md`).

**Definition of done:** Frank's HR-practitioner friend can install this in Claude Desktop in <5 min and run their first sub-system flow without a single slash command.

### Move 3 — Pick the friend-zero target

Name one friend in the HR / talent / leadership space. Send them the people-intel-starter folder + the People Intelligence custom-GPT link. Ask one question: *"What's the room you're in right now?"*

**Definition of done:** Friend-zero has installed and run the daily-5 once. First `MEMORY.md` entry exists. Refusal-pattern hit logged (or the absence of one is logged as a signal).

---

## Next 30 days — the shape

### Week 2 (May 25-29) — Feedback channel

Lowest-friction path: a Notion form whose submissions land in a Notion DB → polled by `transmissions/channels/friend-feedback.md` daily → routed into the appropriate vault. Form fields: *what room · what command · what felt off · what surprised you · attestation block survived? y/n*.

Refuse: anything requiring friends to file GitHub issues. They won't.

### Week 3 (June 1-5) — Second vertical export pass

Once the People pattern is proven with friend-zero, repeat for whichever vertical is next-most-leveraged. Candidate: Sound Intelligence (already at v0.x) or Music IS (v0.1). Same three exports. Same starter-pack variant. Total elapsed if pattern holds: <4 hours per vertical.

### Week 4 (June 8-12) — Public surface

A single landing page at `starlightintelligence.org/install` listing every published vertical × every target × the install bundle for that intersection. Static. Auto-generated from `integrations/exports/` runs. No CMS. No DB. Markdown → static site.

Refuse: building a SaaS, a marketplace, a discovery layer, a recommendation engine. That is month-6 work and entirely premature.

### Month-2+ — what to defer

- Custom-GPT public GPT Store listings (after 3 friend-zero proofs of the routing arc landing cleanly).
- Microsoft Copilot enterprise pathway (after the first enterprise inbound asks for it — don't pre-build).
- Auto-rebuild-on-commit pipeline for export bundles (after manual export feels tedious).
- Substrate-level changes to the 8-target list (none indicated).

---

## Decisions recorded

1. **Custom GPT is the lowest-friction surface for non-technical friends.** Pasteable URL, one-click install inside ChatGPT, zero account creation, attestation survives in the instruction block. This is the funnel.
2. **Claude Project is the canonical-fidelity surface.** Friends who use Claude get the full round-trip. This is the depth.
3. **Cowork is the multi-user surface.** Friends running shared HR practices or co-editing across a team get the alliance-shape variant. This is the team surface.
4. **No GitHub for friends.** Ever. The repo is for builders. Friends get folders and links.
5. **Feedback enters via Notion form, never GitHub issues.** Lowest-friction inbound = highest signal.
6. **One starter-pack variant per vertical.** Not one per friend. The friend-zero loop tells you whether the variant routes cleanly; iterate the variant, not per-friend forks.

---

## Cowork-session install (this session, right now)

The repo is already mounted at `C:\Users\frank\Starlight-Intelligence-System\`. People Intelligence is already accessible — every file readable, every command reference-resolvable. "Installing as a Cowork skill bundle" technically requires the `cowork-plugin-management:create-cowork-plugin` skill to package the vertical as a `.plugin` artifact. That is the **same** output as `/sip-export cowork` plus a `manifest.yaml` for Cowork's plugin registry.

**Recommendation:** generate the `.plugin` via the Cowork plugin skill once friend-zero proves the routing arc lands. Until then, Cowork access is via the mounted repo — no install needed for Frank's own use.

---

## Refusal log

- **Refused:** building a "share-via-link" service that proxies install bundles. Cloud-hosted folder share + custom-instructions paste is enough for v0.1.
- **Refused:** generating all 8 export targets for People right now. Three is the right number for friend-zero. The other 5 wait for inbound.
- **Refused:** writing a "manage your friends' installs" dashboard. The substrate doesn't care who installed it; the attestation chain compounds whether you watch it or not.

---

## What to run next session

```bash
/sip-export custom-gpt verticals/people-intelligence/SKILL.md --output dist/friend-share/people-intel/custom-gpt
/sip-export claude-project verticals/people-intelligence/SKILL.md --output dist/friend-share/people-intel/claude-project
/sip-export cowork verticals/people-intelligence/SKILL.md --output dist/friend-share/people-intel/cowork
```

Then fork the friend-starter to `integrations/starter-packs/people-intel-starter/` per Move 2.

Then name friend-zero and send.

---

**Built on SIP** — `docs/ops/HANDOVER-2026-05-18-people-intel-friend-share.md` · v0.1 · 2026-05-18 · People Intelligence friend-share architectural decision · Phase-1 atomic
