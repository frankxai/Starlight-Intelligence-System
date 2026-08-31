# DELIVERY — What the protocol ships

The protocol composes. These are the named deliverables — the six things SIS actually ships when you engage with it. Everything else is commentary.

Read this as a menu. Pick the one that matches what you showed up for. Each section tells you scope, reciprocity, attestation, timeline, and the first command.

---

## The seven deliverables

### 1. Stamped artifact

- **What it is:** A single piece of work — essay, product brief, deck, repo scaffold, strategic thesis, pitch, canon fragment — that runs through the SIP composition flow and ships with a "Built on SIP" attestation block. Pinned to real versions. Never decorative.
- **Who it's for:** Anyone who wants one artifact composed under the substrate without committing to a vertical, alliance, or fork.
- **Scope:** One artifact. One round of composition. Voice assignment, canon check, attestation emission. Not open-ended editing.
- **What you bring:** A draft or a clear intent, the nodes you're composing across (even if just yourself + SIP), any canon you're importing.
- **Reciprocity:** Free at the substrate level. Your commitment is the attestation itself — you carry the block on the shipped artifact, you don't strip it to hide the composition.
- **Attestation scope:** Full block with pinned substrate version, pinned vertical commits where applicable, pinned canon version.
- **Typical timeline:** 30 minutes (builder track) to 2 hours (concierge-assisted, larger artifact).
- **Next command:** `/sip-attest <path-or-content>`.

### 2. SIS fork (sovereign spawn)

- **What it is:** You take the whole reference build — the full agent registry (7-archetype council + specialist tiers), 6 vaults, the auto-activating skill rules, MCP server, multi-platform adapters, full substrate docs — and run your own substrate-aware system under your own name. Current counts are computed, not typed: `metrics/current.json`, refreshed by `node scripts/count-inventory.mjs`.
- **Who it's for:** Operators, founders, and technical creators who want their own substrate layer rather than adopting Frank's. Competing is encouraged; composition is encouraged more.
- **Scope:** Complete fork, rewired to your entity. Your registry. Your MCP server. Your agent names. Your vaults. All under MIT.
- **What you bring:** An entity name. A declared substrate domain. Willingness to keep attribution to SIP as protocol author.
- **Reciprocity:** MIT license — no fee, no seat, no gate. Attribution to SIP in your fork's equivalent of `SIP.md`. If you make substrate-level improvements, upstreaming is welcome but not required.
- **Attestation scope:** Your fork ships its own attestation with SIP listed as substrate. Your commits compound independently; SIP compounds via attribution on every shipped artifact across every fork.
- **Decision rights:** Entirely yours. Frank advises when asked, doesn't override, doesn't own.
- **Typical timeline:** 2 hours to scaffolded fork. Days to weeks to rewire to your entity's voice.
- **Next command:** `/sovereign-spawn <your-substrate-name>` (v7.3).

### 3. Vertical scaffold

- **What it is:** One sovereign entity, one declared domain, one scaffolded repo built on SIP — `SIS-instance.md`, `SKILL.md`, `AGENTS.md`, `MEMORY.md`, optional `CANON.md`/`STACK.md`, and vertical-scoped `/<vertical>-*` commands.
- **Who it's for:** A founder, label, studio, or independent operator running a single coherent system — e.g. a creator economics playbook, a music label, a wealth ledger, an anime catalog. Not an alliance, not a fork of the whole substrate — a single vertical under SIS.
- **Scope:** Scaffold, registry entry in `VERTICALS.md`, at least one vertical-scoped command per SIP layer 4, cycle-0 state in `MEMORY.md`. Ongoing operation is yours.
- **What you bring:** A sharp one-sentence domain (overlap with existing verticals must be <60%, checked by the command). Explicit canon posture (import / create / decline). One sovereign owner — no ownerless verticals.
- **Reciprocity:** `/sip-attest` on every shipped artifact from your vertical. Honest status — dormant after two cycles without a ship. No silent canon usage if you import Arcanea canon (CC-BY-NC applies).
- **Attestation scope:** Every vertical artifact carries the block; your vertical is pinned by commit SHA where possible.
- **Typical timeline:** 30 minutes for the scaffold, weeks to months to reach v1 active status.
- **Next command:** `/vertical-spawn <vertical-name> "<one-line domain>"`.

### 4. Alliance forge

- **What it is:** Two to five sovereign nodes compose under SIP. Gets an alliance repo, per-node declarations (YAML schema per `ALLIANCE.md`), a cycle cadence, `/alliance-reflect` and `/alliance-decide` commands, every cross-node artifact attested.
- **Who it's for:** Groups where each node holds a layer no other node can credibly hold, the composition ships artifacts no node could ship alone, domains don't collide on decision rights, and every node accepts attestation over silent consumption.
- **Scope:** Alliance scaffold, node declarations, cycle-0 commitments, alliance-scoped commands. Governance and operation live in the alliance; Starlight does not own or operate it.
- **What you bring:** Every node's full declaration — name, role, domain, decision rights, advises-on, repos, public surface, cadence. Missing fields = not-yet-ready; the command halts.
- **Reciprocity:** Cross-node artifacts ship with "Built on SIP" attribution including every contributing node. Commitments are named artifacts by named dates. Silence in a cycle is a breach, not a pause.
- **Attestation scope:** Every cross-node artifact carries the alliance block with all contributing nodes named and pinned.
- **Decision rights:** Per domain map. No votes. No consensus. Forks route through `/alliance-decide`.
- **Typical timeline:** 2 hours for the forge. Weekly or biweekly cycles from there.
- **Next command:** `/alliance-forge <alliance-name> "<nodes>"`.

### 5. Luminor Board session

- **What it is:** A structured pressure-test of a decision through the five canonical archetype voices (architect / sovereign-creator / protocol-defender / implementer) plus the overseer, before you ship something irreversible.
- **Who it's for:** Anyone at a decision point where the downside of getting it wrong is real and asymmetric — public positioning, architecture commits, alliance forges, vertical spawns, canon choices, licensing shifts.
- **Scope:** One decision. Five voices, each ≤3 sentences in decision mode. Overseer synthesizes in ≤3 sentences. Outcome is a named decision, not a vote.
- **What you bring:** A sharply-framed decision (not "should I do X in general" — "should I do X by Y date, given Z context"). The option space, at least two plausible paths, the reversibility cost of each.
- **Reciprocity:** You carry the board's reasoning into the shipped artifact or memo. If the board identifies a load-bearing concern you ignore, you name it explicitly in the shipped artifact — honest trade-offs over hidden ones.
- **Attestation scope:** The board session itself can be attested as a SIP artifact; the resulting decision artifact attests to the board's composition.
- **Typical timeline:** 15-45 minutes depending on decision complexity.
- **Next command:** `/luminor-board "<decision prompt>"`.

### 6. Custom intelligence layer / advisory

- **What it is:** Bespoke composition work — substrate integration for an existing company, a custom alliance architecture, a vertical that needs non-standard scaffolding, direct collaboration with Frank on a thesis or system design.
- **Who it's for:** Teams or founders whose work compounds faster with Frank's direct architectural involvement than with self-service. Limited by Frank's time, not by substrate capacity.
- **Scope:** Bespoke. Defined per engagement in writing before the first artifact ships.
- **What you bring:** A clear problem, a decision authority, a commitment to attestation, and acceptance that Frank may decline if the fit isn't there.
- **Reciprocity:** Custom arrangement. No pricing list — the substrate is free; Frank's time is the bottleneck. Terms are artifact-shaped (by-date commitments) not hour-shaped.
- **Attestation scope:** Every artifact produced carries the block. Co-authorship on protocol evolution possible where the work generalizes.
- **Typical timeline:** Weeks to months.
- **Next command:** `/intake` → routes to Concierge → Frank reviews and responds.

### 7. Full Sovereign Estate / Agent Army Commission (premium commercial path — evolution of Route D + concierge)

- **What it is:** Complete commissioning of a sovereign intelligence estate (Mind + production Mesh/agent army + Steward): Genius-grounded excavation, 4-layer blueprint (Persona/Topology/Kernel/Modules), attested scaffold (via sovereign-spawn or estate-os profile), advanced swarm substrate build (orchestrator patterns, /si multi-CLI routing, Hermes, claws, memory bus, voice, attestation, evals), Pilot with live workflows → Scale → Standing Steward retainer. The "how to setup this agent army" delivered E2E at production grade.
- **Who it's for:** High-agency principals, alliances (e.g. Trinity), or organizations who want a reliable, compounding, ownable agent army as a true extension — not DIY glue or rented vendor agents. The biggest pull for serious operator fleets.
- **Scope:** Full gated arc per `docs/delivery/estate-army-commissioning-workflow.md`. IP terms explicit in SOW (client owns tuned estate; Starlight owns generalized process + delivery IP; encoded-self boundaries non-negotiable). See also `docs/strategic/sip-web4-substrate-strategy.md` for Web4/Ethereum-like positioning and layered IP model (open protocol for adoption flywheel + protected canon/encoded-self/commercial delivery layers).
- **What you bring:** Clear domain ownership, Genius/Vision readiness (or willingness to excavate), commitment to the full build + retainer, sovereignty posture.
- **Reciprocity:** Written SOW with named artifacts/dates. Build fee scoped to Pilot-to-Standing + retainer for Steward/ops/evolution + Frank access. Attestation on everything. Generalized improvements promote back to substrate (factory economics).
- **Attestation scope:** Full estate + all serious swarm outputs carry "Built on SIP". Boards on major moves.
- **Typical timeline:** Blueprint 1-2 weeks; Pilot standing 2-6 weeks depending on scope; retainer ongoing.
- **Next:** `/intake` or direct architect conversation → excavation (if needed) → 4-layer Blueprint → SOW → scaffold + build using the substrate at its best (/si routing, ORCHESTRATION_ENGINE swarm patterns, claws, etc.) → handover + retainer. Full details and benefits vs DIY/competitors in the workflow doc.

This is the repeatable commercial "Estate Factory" / Olympus delivery that makes marginal estates high-margin while preserving the open protocol surface for pure adopters. Trinity is instance #1 (alliance governance + commercial delivery layer).

---

## Tier table

Compact matrix. Scan before picking.

| Deliverable | Reciprocity | SLA | Decision rights | Attestation scope |
|---|---|---|---|---|
| 1. Stamped artifact | Attribution only | Same-day (builder) / 2h (creator) | You own the artifact | Full block, pinned |
| 2. SIS fork | MIT + attribution to SIP | 2h scaffold, ongoing | Entirely yours | Your fork attests; SIP named as substrate |
| 3. Vertical scaffold | `/sip-attest` on every ship, honest status | 30 min scaffold | You own the vertical | Every artifact carries block |
| 4. Alliance forge | Attribution on cross-node artifacts, named commitments by date | 2h forge, weekly/biweekly cycles | Per domain map, no votes | Every cross-node artifact, all nodes named |
| 5. Luminor Board | Carry the reasoning into the shipped work | 15-45 min | You own the call; board advises | Session can be attested |
| 6. Custom advisory | Custom arrangement, artifact-shaped terms | Weeks to months | Retained by you | Every artifact, co-authorship possible |
| 7. Sovereign Estate / Agent Army | Written SOW, named artifacts and dates; generalized improvements promote back to the substrate | Blueprint 1-2 weeks, Pilot 2-6 weeks, retainer ongoing | Client owns the tuned estate; Starlight owns the generalized process and delivery IP | Full estate and all serious swarm outputs; boards on major moves |

---

## What we don't deliver

Explicit list. Each one-sentence reason.

- **We don't own your canon.** Arcanea canon belongs to Arcanea BV; your canon belongs to you. Composition is opt-in both directions and attributed, never absorbed.
- **We don't build your MVP for free.** The substrate is free; your product is your work. Confusing the two is the fastest way to misalign on every future artifact.
- **We don't guarantee consensus in alliances.** Every fork has exactly one owner per the domain map. If you came for consensus, you came for the wrong protocol.
- **We don't accept silent composition.** Using SIP elements without the "Built on SIP" block is a breach — `/sip-attest` refuses to stamp decorative use, and we treat stripping the block as substrate dishonesty.
- **We don't attest decoratively.** If no real SIP elements are used, the attestation doesn't emit. Integrity of the block is the entire value of the protocol.
- **We don't impose founder-layer practice.** Spiritual IS, Vibe OS, and Frank's personal practices are at the founder layer, never pushed into adopters. Your substrate, your practices.

---

## Reciprocity philosophy

Frank's stance: alliances and substrate adoption get helped freely and abundantly — not because it scales, because that's the chosen stance. Frank's sovereign verticals (Arcanea, FrankX, Wealth IS, Music IS) already provide the DPI floor, so contribution to alliances isn't dependent on alliance revenue. Every alliance or vertical that ships "Built on SIP" strengthens the substrate he owns, and abundance-shaped contribution attracts the right collaborators while repelling the transactional ones — which is the correct filter.

Ownership stays with each node. Compounding is via attribution, not credit transfer. Every composition strengthens every node; no composition takes anything from any node. Other SIP adopters may choose different postures — the protocol requires sovereignty, attestation, and the social contract in `SIP.md` § 5, not free contribution. Frank's posture is Frank's posture. Your posture is yours.

---

**Built on SIP** — Starlight Intelligence Protocol

Substrate: starlightintelligence.org/protocol v1.1.1
Layers used: [file-contract, attestation, commands, sovereignty]

Verticals:
- starlight-intelligence-system@v8.3.0 · substrate + reference onboarding surface

Generated: 2026-08-31
Attestation is compounding, not credit transfer: every composition strengthens every node.
---
