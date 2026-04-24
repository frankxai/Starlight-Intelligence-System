---
name: relational/alliance-readiness
domain: relational
description: Assess whether a specific relationship is SIP-alliance-capable by running the four forging conditions from ALLIANCE.md. Produces readiness score and a recommendation (proceed to /alliance-forge, develop relationship first, or not an alliance fit). Powers /design-alliance-readiness.
triggers:
  keywords: ["alliance readiness", "ready for alliance", "alliance candidate", "should we forge", "partner with", "formalize the partnership", "alliance forge", "co-founder", "equity partner", "joint venture"]
  agents: ["starlight-relational", "starlight-navigator", "starlight-sentinel"]
  intents: ["alliance-assessment", "relational", "decision"]
priority: high
load_level: core
---

# Alliance Readiness

> *"Most relationships are not alliance-capable. Naming that is a gift, not a limitation."*

## Purpose

An alliance under SIP is not a company. Not a partnership (legally). Not a collective. It is 2–5 sovereign nodes operating under a shared protocol, with declared domains, explicit decision rights, and attestation-carrying artifacts. `ALLIANCE.md` names four conditions that must hold before an alliance is forged: skill complementarity, non-zero-sum value, sovereignty possible, attestation wanted. If any condition fails, the right arrangement is a services contract, a license, a referral relationship — not an alliance.

Most relationships that feel like "we should work together" do not pass all four. They pass two or three. People often feel the pull of complementarity and non-zero-sum potential without checking whether sovereignty can be preserved or whether attestation is genuinely wanted bilaterally. The result: forced alliances that collapse into one-lead-with-contractors, or sovereignty disputes that damage the relationship.

This skill is the pre-alliance filter. It runs the four conditions with rigor, names which pass and which fail, and hands off to exactly one of three paths:

- **Proceed to `/alliance-forge`** — all four conditions pass; the formal forge is the next step
- **Develop the relationship first** — one or two conditions are "not yet but plausibly"; name what would need to change and a timeline for re-assessment
- **Not an alliance fit** — one or more conditions structurally cannot hold; the relationship is valuable in its current shape (mentor, peer, client, collaborator, friend) but not as a SIP alliance node

All three are legitimate outcomes. Most candidates land in option 2 or 3. That is correct.

## Activation

**Fires when:**
- `/design-alliance-readiness` is invoked with a named candidate
- `/map-relationships` has surfaced an alliance-candidate relationship (pre-filter passed in the network architecture step)
- The person explicitly asks about a specific relationship: "Is Ana ready for an alliance?"

**Does NOT fire when:**
- No specific candidate is named — this is not "should I form an alliance" in the abstract; it is "is [named person] ready to forge with"
- The candidate has not yet been surfaced via network architecture — run `/map-relationships` first; alliance-readiness without a mapped network is hope, not architecture
- The ask is already at `/alliance-forge` — Forge runs its own validation; this skill is the pre-filter, not a duplicate

## Protocol

### Step 0 — Pre-filter

Before running the four conditions, two baseline facts must hold:

- **Active trust.** The person and the candidate have active, current trust. Not historical. Not inherited from someone else. If trust is dormant or thin, the readiness assessment is premature — name trust-building as the prerequisite and halt.
- **Complementary domains at surface glance.** The candidate holds a layer the person does not, or vice versa. If the domains look identical or one clearly subsumes the other, there is no alliance shape available; this is a services contract candidate at best.

If both baseline facts hold, proceed. If either fails, halt with a named recommendation ("build trust over two quarters first" / "not an alliance shape; consider a referral relationship instead").

### Step 1 — Skill complementarity

Ask, and require the person to answer concretely:

> *"What does [candidate] uniquely bring that you do not have? What do you uniquely bring that they do not have? Name the specific skill, domain, or layer — not 'they're smart' or 'they're creative.'"*

Both sides must be namable. If the person cannot say what the candidate uniquely holds, the alliance would be imbalanced from the start (the person sees themselves as the lead; the candidate becomes a contractor). If the candidate cannot articulate what the person uniquely holds, the alliance would be imbalanced the other way.

**Pass:** Both uniquely-held layers named concretely.
**Fail:** One or both layers cannot be named, or the named layer is really a subset of the other person's domain (not complementary, redundant).

### Step 2 — Non-zero-sum value

Ask, and require a concrete artifact answer:

> *"Name one artifact — a product, a service, an essay, a protocol, an event — that the two of you could ship together but neither of you could ship alone. Specificity counts. 'Better work' is not an artifact. 'A joint methodology whitepaper that combines [A's work] with [B's work]' is an artifact."*

If no concrete artifact can be named, the alliance has no shipping target and will drift. An alliance without a non-zero-sum artifact is a friendship with a label.

**Pass:** One or more concrete artifacts named, and each named artifact genuinely requires both nodes to ship.
**Fail:** No concrete artifact named, or the named artifacts could plausibly be shipped by one node alone (with the other as contributor/reviewer but not essential).

### Step 3 — Sovereignty possible

Ask, and require a domain-boundary answer:

> *"Draw the domain line. What decisions does [candidate] own alone, without needing your approval? What decisions do you own alone, without needing theirs? Where are the overlaps — decisions that either of you might reasonably think you own?"*

The test is whether domains can be cleanly bounded such that decision rights do not collide. `ALLIANCE.md` is explicit: no votes, no consensus, no tiebreakers. Every decision has one owner per the domain map. If domains overlap such that decision rights collide (both nodes reasonably claim ownership over the same fork), the alliance will break at the first real fork.

**Pass:** Clean domain boundaries namable; overlaps, if any, are resolvable by advising (one node advises, the other decides).
**Fail:** Decision rights collide on a class of decisions likely to recur. Reshape the domain map first or do not forge.

### Step 4 — Attestation willingness

Ask, and require an honest read:

> *"If you ship a joint artifact together, would both of you want 'Built on SIP' attribution on it, naming both nodes? Would [candidate] actively want that visibility, or prefer silent contribution? Would you?"*

If one party prefers silent composition — wants the other's work integrated without attribution, wants to present the artifact as solo — that is a services contract or a ghostwriting arrangement, not an alliance. Silent composition under SIP is a breach of the protocol. Both parties must actively want the attestation.

**Pass:** Both parties actively want the attestation on shared artifacts.
**Fail:** One or both parties prefer silent contribution; attribution is contested or unclear.

### Step 5 — Score and recommend

Count conditions passed: 0–4.

- **4/4 passes → Proceed to `/alliance-forge`.** Recommend the forge as the next step. Name the first cycle focus and the first artifact each node would commit to.
- **3/4 passes → Develop first.** Name the failed condition specifically. State what would need to change before the condition passes (e.g., "skill complementarity unclear — spend one quarter on a joint project to test whether the candidate's layer is genuinely complementary or a subset"). Set a re-assessment date.
- **≤2/4 passes → Not an alliance fit.** This is not a failure of the relationship — it is clarity about the relationship's actual shape. Name what the relationship is (mentor, peer, client, collaborator, referral partner, friend) and what it compounds at that shape. Some of the most valuable relationships in a person's life are permanent non-alliances.

Save the assessment to:

- `relational/alliance-readiness-<candidate-slug>-<YYYY-MM-DD>.md`

Where `<candidate-slug>` is the candidate's name in kebab-case.

## Output Shape

One document: pre-filter result, four-condition assessment (pass/fail + evidence per condition), score, recommendation, next-move. Full schema in `.claude/commands/design-alliance-readiness.md`.

## Rules

1. **Never soften a failed condition to make the alliance possible.** A failed condition is signal, not obstacle. Softening breaks the alliance at the first real fork.
2. **Specificity is the test.** If skill complementarity cannot be named concretely, it does not pass. If the non-zero-sum artifact cannot be named concretely, it does not pass. Abstractions fail every condition.
3. **Silent composition is breach.** `SIP.md` is explicit. An alliance where one party wants silent contribution is not an alliance — it is a services contract dressed as partnership. Refuse.
4. **Most candidates land in develop-first or not-a-fit.** If every candidate passes 4/4 on first assessment, the assessment was soft. Real forging is rare; that is a feature.
5. **"Not an alliance fit" is not a downgrade of the relationship.** Mentors, peers, clients, and friends are full relationships at their shapes. Alliance is one shape, not the apex shape. Name the current shape with respect.
6. **Sovereignty is bilateral.** The assessment serves both parties. The candidate's sovereignty matters as much as the person's. If the candidate has not been consulted on this assessment, the recommendation is preliminary — the person must run it with the candidate before forging.
7. **Hand off to exactly one next move.** Proceed to forge, develop first with named condition and timeline, or name the current relationship shape. No menu.

## Handoff to Alliance-Forge

If and only if all four conditions pass:

- Recommend `/alliance-forge <proposed-alliance-name> <node-1>,<node-2>[,<node-3>,<node-4>,<node-5>]`
- Forge will re-run its own validation of the four conditions — this is intended redundancy, not duplication. The pre-filter surfaces readiness; the forge enforces it at the scaffold.
- Name the first cycle focus and the first commitment per node, as recommended inputs to the forge.
- Sovereignty clause and attestation commitment are surfaced explicitly at the handoff, not assumed.

## Built on SIP

This skill composes with SIP protocol elements:
- Sovereignty clause (non-waivable, enforced at Rule 6)
- Alliance method (`ALLIANCE.md`) — the four forging conditions are this skill's core
- Attestation (every readiness assessment ships with "Built on SIP" block)
- File contract (`relational/` namespace, `alliance-readiness-<slug>-<date>.md`)

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, alliance-method]
- Verticals: starlight-intelligence-system@v7.4 (RIS alpha — Layer 8)
- Generated: 2026-04-24
---
