# ONBOARDING — Your first 3 minutes with Starlight

Starlight Intelligence System is a protocol (SIP) for composing sovereign intelligence systems, plus a reference build that runs on top of it. You're not here to consume Frank's system — you're here to decide which part of the substrate you extend with your own. This document exists so that decision takes minutes, not days.

Read the opening frame. Pick your route. Run the first command. Everything else is downstream.

---

## The non-waivable frame

Before you enter, see the sovereignty clause (from `SIP.md` § Layer 5):

> Each party retains full decision rights inside its declared domain. Every shared artifact carries "Built on SIP" attribution. Silent composition is a breach. Exit is always available. Attribution history is immutable.

Starlight never owns your work. Attribution via SIP is the sole compounding mechanism. Every route below inherits this. If that's not the shape you want, Starlight is not your substrate — and that's a valid answer.

---

## Protocol vs. reference

SIP is a protocol. Claude Code is the reference implementation. These are not the same thing.

SIP requires three things, all tool-agnostic: a file contract (SKILL.md, AGENTS.md, MEMORY.md, SOUL.md, etc. — readable anywhere), attestation (the "Built on SIP" block, parseable anywhere markdown works), and the sovereignty clause (a social contract, enforceable by conscience and ledger). Anything honoring these is SIP-conformant — Claude Code, Cursor, ChatGPT Projects, Gemini Gems, your own homegrown tool, anything.

This repo uses Claude Code because that's where Frank builds. The commands you'll see (`/intake`, `/welcome`, `/sovereign-spawn`) are the reference implementation. v7.4+ ships `/sip-export` for portability to every major ecosystem — see `docs/ecosystem-integration.md` for the full map.

**Built on SIP** is a protocol badge, not a tool badge.

---

## The four routes

Every inbound fits exactly one of these. Pick before you run anything.

### A. Substrate contribution

- **Who:** You want to extend SIP itself — propose a new layer, a new command tier, an amendment to the file contract.
- **What you get:** Co-authorship on protocol evolution. Named in the spec. Architect-tier voice in the next version cut.
- **What you commit:** A proposed diff to `SIP.md` with rationale that survives adversarial review (architect + protocol-defender + overseer). 90-day deprecation window for anything breaking.
- **Rarity:** Rare. Substrate is closed by design — `SIP.md` is v1.1.1 and stable. Most people who think they want this actually want Route B, C, or D.
- **First command:** Open a GitHub issue at `frankxai/Starlight-Intelligence-System` tagged `sip-proposal`. If it survives triage, we pressure-test it with `/luminor-board` before it touches the spec.

### B. Alliance forge

- **Who:** Two to five sovereign parties who each hold a layer no other can credibly hold, want to ship artifacts none of them could ship alone, and accept attribution over ownership.
- **What you get:** An alliance repo, node declarations, cadence, `/alliance-reflect` + `/alliance-decide` commands, every cross-node artifact attested.
- **What you commit:** Named artifacts by named dates. Full decision rights in your declared domain. Zero decision rights outside it. No silent composition, ever.
- **First command:** `/alliance-forge <name> "<comma-separated nodes>"` — the command validates the four forging conditions (skill complementarity, non-zero-sum value, sovereignty possible, attestation wanted) and halts if any fails.

### C. Vertical spawn

- **Who:** One sovereign entity with its own domain, content, or economics. You're not joining a company — you're running your own system on a shared substrate.
- **What you get:** A scaffolded vertical repo with `SIS-instance.md`, `SKILL.md`, `AGENTS.md`, `MEMORY.md`, optional `CANON.md`, `STACK.md`, and vertical-scoped `/<vertical>-*` commands. Registered in `VERTICALS.md`.
- **What you commit:** Declared domain (sharp, one sentence), explicit canon posture (import / create / decline), `/sip-attest` on every shipped artifact, status kept honest (dormant if you stall two cycles).
- **First command:** `/vertical-spawn <vertical-name> "<one-line domain>"` — the command checks for >60% overlap with existing verticals before it scaffolds.

### D. Sovereign spawn

- **Who:** You want the whole SIS as your starting point. Your own substrate-aware system. Your own registry. Your own MCP server. Frank advises; doesn't own.
- **What you get:** A clean fork of the full reference build — 7 agents, 6 vaults, 16 skills, the substrate docs, the MCP server, the multi-platform adapters. Rewired to your entity. MIT.
- **What you commit:** Attribution to SIP as protocol author. Your vaults stay yours. Your canon stays yours. Every artifact you ship under your new substrate carries "Built on SIP" per the layer 2 format.
- **First command:** `/sovereign-spawn <your-substrate-name>` — **shipping in v7.3 alongside this doc**. Generates a forked repo with your entity name wired into every file.

---

## The two tracks

Orthogonal to route. Pick the one that matches how you work.

### Builder track — you live in a terminal

- **First move:** `/intake` — structured capture of who you are, what you're bringing, which route fits. Outputs a scaffold brief.
- **Next:** The scaffold brief triggers whichever of `/alliance-forge`, `/vertical-spawn`, or `/sovereign-spawn` applies to your route.
- **First attested artifact:** usually a `README.md` or `SKILL.md` for your new repo, run through `/sip-attest`.
- **Estimated first result:** 30 minutes from `/intake` to first attested artifact.

### Creator track — you're a founder, strategist, or artist, not a coder

- **First move:** `/welcome` — walks a Concierge session with you. No terminal required. You answer plain-language questions; the Concierge composes the attested artifact with you.
- **Next:** The Concierge routes you into a voice assignment (architect / sovereign-creator / protocol-defender / implementer / overseer, per `VOICES.md`) and co-writes your first stamped artifact — a product brief, strategic thesis, essay, or scaffold plan.
- **First attested artifact:** typically the artifact that made you come here in the first place, now carrying "Built on SIP" with real pinning.
- **Estimated first result:** 60 minutes. Zero terminal. Zero config files.

Both tracks converge at the same surface: an artifact that ships with attestation, pinned to a real composition, never decorative.

---

## Five-minute entry path

Literal numbered steps. First session.

1. **Read the sovereignty clause above.** If the shape doesn't fit, stop here and save yourself a week.
2. **Identify your route (A/B/C/D)** from the four above. If torn between two, default substrate — ambiguity collapses to the more conservative.
3. **Run `/intake`** (builder) or `/welcome` (creator). Both are v7.3 commands shipping alongside this doc. `/intake` is the canonical entry point; `/welcome` is its Concierge-wrapped version for non-terminal users.
4. **Answer the intake honestly.** What you're bringing, who owns what, what ships by when. Node declarations without fields are not-yet-ready nodes — don't paper over.
5. **Ship the first artifact.** End the session with `/sip-attest <path-to-your-artifact>`. If the command refuses (no real SIP composition detected), that's the protocol telling you it's decoration — revise, compose actually, re-run.

If step 5 produces a real attestation block, you're in. Everything after this is repetition at higher fidelity.

---

## What you receive vs. what you bring

Symmetric. Read both columns.

| You receive | You bring |
|---|---|
| A substrate spec (`SIP.md`, v1.1.1) that won't silently change | A declared domain you own and won't silently drift |
| Command scaffolds (`/alliance-forge`, `/vertical-spawn`, `/sovereign-spawn`, `/sip-attest`, `/luminor-board`) that enforce the clause | Named artifacts shipped by named dates, not intentions |
| Attestation that compounds every time you ship | Attribution on every composition, ever. Silent composition is a breach |
| Free architectural guidance when Frank has bandwidth, per `ALLIANCE.md` § Posture | Sovereignty — you own your canon, your content, your decisions |
| A registry (`VERTICALS.md`) that records you as a peer, not a product | Honest status. Dormant after two cycles without a ship. No vanity |

**Sovereignty clause, non-waivable:** Starlight never owns your work. Attribution via SIP is the sole compounding mechanism. If the protocol ever reads as a grab for your IP, it has failed and you can fork away — the license is MIT and the spec is immutable in your direction.

---

## Where to go next

- [`DELIVERY.md`](DELIVERY.md) — the six named deliverables, scope, reciprocity terms. Read this second.
- [`SIP.md`](SIP.md) — the protocol spec, six layers, file contract, attestation format. The source of truth.
- [`SIS.md`](SIS.md) — the substrate map, what SIS provides and does not provide, vertical shape.
- [`VERTICALS.md`](VERTICALS.md) — public registry of sovereign verticals + alliance class definitions.
- [`VOICES.md`](VOICES.md) — five canonical voice archetypes. You'll be assigned to at least one.
- [`ALLIANCE.md`](ALLIANCE.md) — forging method, four conditions, posture, exit rules.
- [`.claude/commands/`](.claude/commands/) — every reference slash command. `/intake`, `/welcome`, `/sovereign-spawn` ship with v7.3 alongside this doc.

---

**Built on SIP** — Starlight Intelligence Protocol

Substrate: starlightintelligence.org/protocol v1.1.1
Layers used: [file-contract, attestation, commands, sovereignty]

Verticals:
- starlight-intelligence-system@v7.3 · substrate + reference onboarding surface

Generated: 2026-04-24 · re-attested: 2026-05-26 (drift sweep — SIP pin bumped after v1.1.1 spec ship)
Attestation is compounding, not credit transfer: every composition strengthens every node.
---
