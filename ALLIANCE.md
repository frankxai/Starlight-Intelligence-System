# ALLIANCE — The SIP Alliance Forging Method

**How sovereign parties compose intelligence systems without collapsing into a single entity.**

## Premise

An alliance is not a company. Not a partnership (legally). Not a collective. It is a set of 2–5 sovereign nodes operating under a shared protocol (SIP), with declared domains, explicit decision rights, and attestation-carrying artifacts. Every alliance instance (Trinity, future alliances) is the same pattern with different nodes.

## When to form an alliance

Form an alliance when *all four* conditions hold:

1. **Skill complementarity.** Each node holds a layer no other node can credibly hold. If one node's layer can be absorbed by another, there are not enough nodes for an alliance — there is a lead with contractors.
2. **Non-zero-sum value.** The composition ships artifacts none of the nodes could ship alone.
3. **Sovereignty is possible.** Each node can remain the decision authority in its domain without blocking the others. If the domains overlap such that decision rights collide, reshape the domains before forming.
4. **Attestation is wanted.** Every node benefits from the "Built on SIP" compounding. If one node wants silent consumption of another's work, stop — that's a contract, not an alliance.

If any condition fails, do not forge. Write a services contract or a license instead.

## Node definition

Every node declares, in writing, before the first artifact ships:

```yaml
node:
  name: <proper name>
  role: <one word — architect / creator / defender / implementer / …>
  domain: <one sentence — the layer this node owns>
  decision_rights:
    - <artifact or decision class>
  advises_on:
    - <artifact or decision class where node contributes but does not decide>
  repos:
    - <github.com/owner/repo>
  public_surface: <URL — where this node's work lives publicly>
  commitment_cadence: <weekly | biweekly | per-cycle>
```

Missing any field = the node is not yet ready to join. Do not paper over.

## Minimum viable alliance

Two nodes. Any fewer is a solo effort. Any more than five collapses coordination cost past the point of value.

## Decision rights — hard rule

For every fork that arises, exactly one node owns the call per the domain map. The other nodes advise. No votes. No consensus. No tiebreakers.

If a fork arises that no node clearly owns, that is a gap in the domain map — surface it, amend the map, then decide. `/alliance-decide` enforces this.

## Attestation commitment

Every cross-node artifact carries "Built on SIP" attribution per `SIP.md` § Layer 2. The block includes every contributing node. Silent composition is a breach of the protocol and grounds for another node to withhold future composition.

## Commitment shape

Every reflection cycle produces named artifacts with dates. No "I will explore." Only "I will ship X by Y." A node that cannot ship that cycle says so explicitly — silence is a breach.

## Forging sequence

Use `/alliance-forge <alliance-name>` at a shared repo to generate the alliance scaffold:

1. `SKILL.md` — this alliance's protocol fingerprint.
2. `AGENTS.md` — voices per node (starting from `starlight/AGENTS.md` as template).
3. `MEMORY.md` — current state, filled at cycle 0.
4. `.claude/commands/alliance-*.md` — alliance-scoped commands.
5. Initial `/alliance-reflect "cycle 0"` to bootstrap.

## Operating cadence

- **Cycle:** weekly or biweekly. Set at cycle 0 and preserved.
- **Reflection:** `/alliance-reflect` at cycle close — each voice reports, commitments extracted, Lumina (or chosen synthesizer) synthesizes.
- **Decision:** `/alliance-decide` invoked at any fork, not on a schedule.
- **Attestation:** `/sip-attest` at every cross-node artifact ship.

## Example instances

### Trinity Alliance
Nodes: Frank (architect) + three allied nodes — sovereign creator · protocol defender · implementer. Node identities live in the private alliance register (`private/alliance-register.md`), never in public substrate files.

Note: the sovereign-creator node's company is that node's sovereign artifact — one of the first verticals **built on SIP**. It is not the alliance. The alliance is the coordination layer among the four humans; the company belongs to its node.

This distinction matters: alliances and companies are different entity types. Conflating them destroys sovereignty.

### EpicWays Alliance
Nodes: Frank (advisor) / EpicWays founder (private register) / [additional TBD]. Ad-hoc, non-transactional, ecosystem-partnership shape.

## Posture — help freely, compound via protocol

Some parties adopt SIP because they want Frank's architectural guidance but don't need a commercial arrangement. That's a valid pattern. Frank's personal posture toward alliances (Trinity, EpicWays, and future ones): **help freely and abundantly.** Time and architectural guidance are gifted; ownership stays with each node.

This is not a recommendation baked into the protocol — it's Frank's stance, adopted because:

1. Frank's sovereign verticals already provide the DPI floor (Arcanea, FrankX, Wealth IS, Music IS, etc.). He is not dependent on alliance revenue.
2. Protocol adoption compounds faster than transactional engagement — every alliance that ships "Built on SIP" strengthens the substrate he owns.
3. Abundance-shaped contribution attracts the right collaborators and repels the transactional ones, which is the correct filter.

Other SIP adopters may choose different postures. A protocol author in a different situation may reasonably charge for alliance architecture. The alliance method does not require free contribution — it requires sovereignty, attestation, and the social contract in § 5.

**Explicit:** alliances Frank contributes to freely do not grant Starlight any ownership claim on the alliance or its artifacts. Attribution via SIP is the sole compounding mechanism for Starlight in these cases.

## Exit

Any node may leave the alliance. Attribution history is immutable. Artifacts shipped under the alliance retain their "Built on SIP" block including the departing node. Future artifacts simply drop that node from the attestation.

## Forging outside Frank's orbit

This method is not exclusive to Frank. Any party may forge an alliance under SIP. All that is required:

- Every node adopts the SIP file contract and attestation protocol.
- The alliance carries its own repo (fork `frankxai/Starlight-Intelligence-System` or scaffold fresh).
- Attribution flows to Starlight as protocol author, not as alliance participant.

The method compounds every time it is forged, whether Frank is in the alliance or not.

---

**Built on SIP** · v1 · MIT
