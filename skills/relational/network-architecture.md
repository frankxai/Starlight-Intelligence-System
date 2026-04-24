---
name: relational/network-architecture
domain: relational
description: Map a sovereign person's current network, audit compounding vs draining flows, identify gaps, design an investment plan, and produce a weekly/monthly/quarterly cadence. Powers /map-relationships and the Relational agent.
triggers:
  keywords: ["network", "relationships", "connections", "contacts", "advisors", "mentors", "collaborators", "who", "my team", "partners", "peers", "mentees", "people", "introductions"]
  agents: ["starlight-relational", "starlight-concierge", "starlight-navigator"]
  intents: ["relational", "network-design", "team-building"]
priority: high
load_level: core
---

# Network Architecture

> *"Sovereignty doesn't mean solo. It means your network is a design, not a residue."*

## Purpose

Most sovereign people have a network without an architecture. Contacts accumulate across employers, projects, conferences, introductions. The network is real — but invisible to its owner. It is not designed; it is residue. The result: the right people exist in the network but no one is being intentionally composed; draining relationships consume disproportionate time because no one named them draining; gaps in the network (no mentor in the new domain, no peer at the current stage, no mentee to compound wisdom outward) persist unseen; introductions — the highest-compounding asset most sovereign people own — are underused because the graph is not mapped.

Network architecture is the act of reading the network as a designed structure and rebuilding it by intent rather than accident. This is not CRM. This is not optimization. Each relationship stays a relationship — human, sovereign, mutual. What changes is the person's visibility into their own relational layer and their cadence inside it.

Quality over quantity. A small network with strong compounding beats a large network with weak connections. Most sovereign people do not need more contacts. They need to see the network they already have.

## Activation

**Fires when:**
- `/map-relationships` is invoked
- A session surfaces relational questions: "who should I partner with", "who drains me", "I need an advisor", "I want to hire", "who should I hire"
- Genius has produced a Profile and the person's next question is about composition — "who runs this with me?"
- Concierge routes a newcomer to Relational Tier after intake signals network or team intent

**Does NOT fire when:**
- The ask is formal alliance scaffolding — route to `/alliance-forge` (Relational does the pre-alliance work; Forge does the formal scaffold)
- The ask is hiring an executor from a DELEGATE bucket — route to `/train-executor` (an executor is not a network role; it is a delegation artifact)
- The person cannot name ≥20 real people in their work year — the network is too vague to architect yet; route to a pre-inventory conversation first

## Protocol

### Step 1 — Current network inventory

Ask the person to list the 20–40 people who show up in their work year. Names, not numbers. If they cannot produce the list, halt — the network is not yet visible enough to architect. Start smaller: "Who did you interact with on work this week?" Build up from there.

For each name, capture:
- First name + last-name initial (or full name if public context)
- One-line context: how they know this person (former colleague at X, met at conference Y, mentor since Z, client on project A)
- Most recent interaction: date, medium (call, async, in-person, none this year)

Do not proceed to Step 2 until at least 20 names are captured. Below that, the architecture is unstable.

### Step 2 — Sort by relationship type

Every name gets assigned exactly one type:

- **Peer** — at the person's stage, in or adjacent to their domain, mutual respect, possible future collaborator
- **Mentor** — further along the path the person is on, gives more than they receive in the current season, has earned advisory weight
- **Mentee** — earlier on a path the person has walked, receives more than they give, compounds wisdom outward
- **Client** — pays or has paid the person for work; relationship has a commercial shape
- **Collaborator** — actively working with the person on a shared artifact, contract, or project
- **Family** — blood, marriage, chosen family; relational weight independent of work
- **Acquaintance** — known, warm, but no active work shape

Overlaps collapse to the dominant type for this person's work *right now*. A former client who became a peer is a peer. A collaborator who is also a mentor is a mentor (mentorship is the load-bearing shape). "Friend" is not a type in this model — friendship is a quality that can live inside any of the above.

### Step 3 — Strength audit

For every named relationship, capture three dimensions:

- **Frequency of contact** — weekly / monthly / quarterly / yearly / dormant
- **Depth of trust** — high (would call in a crisis) / medium (professional warmth) / low (polite, no depth)
- **Value flow direction** — compounds (both parties' work gets better through the relationship) / drains (energy consumed with no proportional return) / balanced (reciprocal value, neither party leveraged) / one-way gift in favor of the person / one-way gift from the person outward

Draining is named honestly. If no draining relationships surface, the audit was soft, not empirical — most real networks have at least one. The goal is not severing; it is visibility. The person may choose to keep a draining relationship (family, history, specific season of life). Seeing it named is the work.

### Step 4 — Leverage identification

Where does the network compound? Look for:

- **Introduction graph** — who has introduced the person to valuable people; who the person has introduced outward; where a warm intro would unlock a specific next move
- **Referral flows** — clients or collaborators who have sent business / opportunities; reciprocity patterns
- **Collaboration compounding** — where two names in the list already collaborate with each other through the person, forming a compounding triangle
- **Expertise borrowing** — relationships that give the person access to a domain they don't own (a lawyer friend, a clinician mentor, a technical peer)

Name the top 3–5 compounding leverage points. These are the relationships the person should protect and invest in most.

### Step 5 — Gap identification

Against the architecture, name missing roles as concrete archetypes, not abstractions. Examples:

- "No mentor in [the new domain the person is moving into]" — not "I need a mentor"
- "No peer at the current stage" — all former peers have either leveled up or stayed behind; the current stage is lonely and that shows in draft quality
- "No mentee" — compounding wisdom outward is missing; the person is losing the teaching-is-learning loop
- "No protocol-defender voice" — every creative idea gets green-lit; the network has no one who says no with authority
- "No client in [target segment]" — the person's market is too narrow; the network has no bridge to the next segment
- "No collaborator with complementary skill X" — artifacts that need skill X are either not shipped or shipped at lower quality

Each gap becomes a specific search: not "meet more people" but "find one mentor in [named domain] this quarter."

### Step 6 — Alliance-surfacing (pre-filter)

From compounding relationships only (not drains, not balanced, not acquaintances), flag any that *could* pass the four forging conditions from `ALLIANCE.md`:

1. Skill complementarity present
2. Possible non-zero-sum artifact they could ship together
3. Sovereignty possible (domains don't collide)
4. Attestation likely wanted (both would benefit from "Built on SIP" on shared work)

A "yes, could be" on all four = candidate. Recommend `/design-alliance-readiness` on specific named candidates. Do not forge here — surfacing only.

Most architectures yield 0–1 candidates. Some yield 2–3. Zero is common and correct — it means the person's current network is rich in advisors, peers, and mentors but does not yet contain alliance-capable nodes. Cadence design alone is a complete deliverable.

### Step 7 — Investment plan

For each relationship, recommend one of:

- **Invest more** — compounding high-trust relationships that are under-touched
- **Sustain** — compounding relationships at the right cadence already; preserve
- **Right-size** — draining relationships where the person is over-investing; reduce contact without severing
- **Graduate** — acquaintances who should move to peer; peers who are actually mentors; mentees who are now peers
- **Complete** — relationships that have run their course; warm closure, no hard severance

No relationship gets "ignore" or "drop." Sovereignty is bilateral — each person is a full human, not a slot to optimize.

### Step 8 — Cadence design

Produce the weekly/monthly/quarterly rhythm. Specific, not abstract.

- **Weekly** — 1–3 named connection touches. "Message Sarah about the case study." "Share the draft with Miguel." "Ask Aisha about her Q3." Each touch is a named person and a specific artifact/question.
- **Monthly** — mentor check-ins (which mentors, what question is live), draining-relationship triage (which draining relationship was right-sized this month, how it went).
- **Quarterly** — network review. Who compounded this quarter? Who graduated (acquaintance → peer, peer → collaborator, mentee → peer)? Who right-sized? Are any alliance candidates newly ready? Refresh the architecture.

Save the architecture and cadence to:

- `relational/network-<person-slug>.md`

Where `<person-slug>` is the person's name in kebab-case. Create the `relational/` directory if it does not exist.

## Output Shape

One document with seven sections: Inventory, Sorted Types, Strength Audit, Leverage Points, Gap Archetypes, Alliance Candidates, Cadence. Full schema in `.claude/commands/map-relationships.md`.

## Rules

1. **Quality over quantity.** A 25-person network with strong compounding beats a 200-person network with weak connections. Do not pad the inventory to hit a number.
2. **Sovereignty is bilateral.** Every relationship in the architecture is a full human with their own sovereignty. No relationship is optimized for extraction. No name gets treated as a node to be leveraged. The map is for the person's design, not for maneuvering.
3. **No transactional framing.** Humans are humans. The architecture names compounding and draining; it does not prescribe transactional optimization. A dear friend who is a one-way gift outward from the person is a gift the person is choosing to give, not a misallocation to correct.
4. **Name draining relationships honestly.** If the audit surfaces zero drains, the audit was soft. Real networks have at least one draining node. Naming is the work; severing is rarely the answer.
5. **Gaps are concrete archetypes, not abstractions.** "I need a mentor" is not a gap. "No mentor in [named domain] at [named career stage]" is a gap. Specificity makes the search tractable.
6. **Most relationships are not alliance-capable and that is correct.** The alliance-surface step surfaces 0–3 candidates typically. Zero is a valid architecture — cadence alone is the deliverable. Do not manufacture candidates.
7. **Cadence is specific, not abstract.** "Reach out more" is not a cadence. "Message Sarah Tuesday with the case study draft" is a cadence. Abstract cadences do not get run.
8. **Never write personal network data to public vaults.** The architecture lives in the person's instance only. Starlight does not retain relational graphs for anyone except via SIP attestation compounding on shared artifacts.

## Built on SIP

This skill composes with SIP protocol elements:
- Sovereignty clause (non-waivable, enforced at Rule 2)
- File contract (`relational/` namespace, `network-<slug>.md`)
- Attestation (every network architecture ships with "Built on SIP" block)
- Alliance method (`ALLIANCE.md`) — the four forging conditions govern alliance-surfacing

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4 (RIS alpha — Layer 8)
- Generated: 2026-04-24
---
