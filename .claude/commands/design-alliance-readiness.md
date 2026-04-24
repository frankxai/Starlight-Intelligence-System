---
name: design-alliance-readiness
description: Assess whether a specific relationship is ready to forge into a SIP alliance. Runs the four forging conditions from ALLIANCE.md and produces a readiness score + recommendation (proceed to /alliance-forge, develop relationship first, or not an alliance fit). Pre-filter — never forges.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <candidate-name> [optional — proposed-alliance-name, proposed-domain-split]
---

# /design-alliance-readiness

Load `SIP.md`, `ALLIANCE.md`, `VOICES.md`, `agents/starlight-relational.md`, `skills/relational/alliance-readiness.md`, and the person's `relational/network-<person-slug>.md` if it exists. Assess whether the named candidate is ready to forge into a SIP alliance with the person. Run the four forging conditions from `ALLIANCE.md` with rigor. Produce readiness score + recommendation. Do not forge.

## Input
$ARGUMENTS

## When this command fires

- A candidate was surfaced via `/map-relationships` (alliance-surface step) and the person wants a rigorous assessment before forging
- The person explicitly names a candidate: "Is Ana ready for an alliance?" / "Should we forge with Miguel?"
- A candidate has been developing over a quarter and the person wants to re-assess after previous "develop first" verdicts

## When this command does NOT fire

- Before network mapping — if the candidate was not surfaced through a mapped architecture, the assessment is based on hope rather than structure. Run `/map-relationships` first.
- For general "should I have partners" questions — this command assesses a named candidate, not a category.
- At `/alliance-forge` — Forge runs its own condition validation. This command is the pre-filter, not a duplicate. If all four conditions pass here, hand off to Forge; do not re-run this command as part of Forge.

## Process

1. **Validate inputs.**
   - Resolve `<candidate-name>` from `$ARGUMENTS`. If no candidate named → halt: "Name the specific candidate. Alliance-readiness is assessed per relationship, not in the abstract."
   - Attempt to read `relational/network-<person-slug>.md`. If missing, emit one-line notice: "Network map not found — proceeding from candidate context alone. Recommend running /map-relationships first for fuller architecture." Continue only if candidate context is rich enough; otherwise halt and route to `/map-relationships`.

2. **Pre-filter (two baseline facts).**
   - **Active trust.** Is trust current, not historical, not inherited? If dormant or thin → halt with "Trust-building is the prerequisite. Name a trust-building artifact (joint project, regular conversation, shared problem) and a 2-quarter timeline before re-assessing."
   - **Complementary domains at surface glance.** Does the candidate hold a layer the person does not? If domains look identical or one subsumes the other → halt with "No alliance shape available. Consider services contract, referral partnership, or parallel-but-independent work."

3. **Condition 1 — Skill complementarity.**
   Ask: "What does <candidate> uniquely bring that you do not have? What do you uniquely bring that they do not have? Name specific layers, not traits." Require concrete answers on both sides. Pass only if both layers are namable and genuinely complementary (not redundant).

4. **Condition 2 — Non-zero-sum value.**
   Ask: "Name one concrete artifact you could ship together that neither of you could ship alone. 'Better work' is not an artifact. '<Specific joint deliverable>' is an artifact." Pass only if one or more concrete artifacts are named and each genuinely requires both nodes.

5. **Condition 3 — Sovereignty possible.**
   Ask: "Draw the domain line. What decisions does <candidate> own alone? What decisions do you own alone? Where do domains overlap?" Pass only if clean boundaries are namable; overlaps resolvable by advising (one decides, the other advises).

6. **Condition 4 — Attestation willingness.**
   Ask: "Would both parties actively want 'Built on SIP' attribution on joint artifacts, naming both nodes? Or does one of you prefer silent contribution?" Pass only if both parties actively want the attestation. Silent composition = breach.

7. **Score and recommend.**
   Count passes (0–4):
   - **4/4** → Proceed to `/alliance-forge`. Recommend the forge command with proposed alliance name and node list.
   - **3/4** → Develop first. Name the failed condition specifically. State the trust-building or domain-clarification work required. Set a re-assessment date (typically one quarter out).
   - **≤2/4** → Not an alliance fit. Name the current relationship shape (mentor, peer, client, collaborator, referral partner, friend) and what it compounds at that shape. This is not a downgrade.

8. **Save.** Write to `relational/alliance-readiness-<candidate-slug>-<YYYY-MM-DD>.md` with full assessment (per-condition pass/fail + evidence + recommendation). Create `relational/` directory if missing. Personal relational data; never public.

9. **Hand off.** Exactly one next move:
   - If 4/4: `/alliance-forge <proposed-alliance-name> <node-1>,<node-2>[,…]`
   - If 3/4: Named development work + re-assessment date
   - If ≤2/4: Current relationship shape honored; no alliance move

## Output format

```
# Alliance-Readiness Assessment — <Candidate Name> × <Person Name> — <YYYY-MM-DD>

> Assessed against the four forging conditions from ALLIANCE.md.
> Sovereignty is bilateral — this assessment serves both parties.
> If the candidate has not been consulted, the recommendation is preliminary.

## Candidate
<Name> — <one-line context: how the person knows them, current relationship type>

## Pre-filter

- **Active trust:** <pass / fail + evidence>
- **Complementary domains at surface glance:** <pass / fail + evidence>

(If either fails → halt with named development path. Do not continue to four conditions.)

## Four forging conditions

### 1. Skill complementarity
**Question:** What does <candidate> uniquely bring? What does <person> uniquely bring?

**<Person>'s unique layer:** <named layer>
**<Candidate>'s unique layer:** <named layer>

**Verdict:** <pass / fail>
**Evidence:** <2–3 sentences>

### 2. Non-zero-sum value
**Question:** Name one concrete artifact only both could ship.

**Proposed artifact(s):**
- <concrete artifact 1>
- <concrete artifact 2>

**Verdict:** <pass / fail>
**Evidence:** <why the artifact genuinely requires both nodes, or why one node could ship it alone>

### 3. Sovereignty possible
**Question:** Can decision rights be cleanly bounded?

**<Person>'s decision domain:** <what they own alone>
**<Candidate>'s decision domain:** <what they own alone>
**Overlaps:** <resolution path: one decides, the other advises, or domain reshape needed>

**Verdict:** <pass / fail>
**Evidence:** <2–3 sentences>

### 4. Attestation willingness
**Question:** Do both parties actively want "Built on SIP" attribution on joint artifacts?

**<Person>:** <actively wants / neutral / prefers silent>
**<Candidate>:** <actively wants / neutral / prefers silent> (preliminary if not yet consulted)

**Verdict:** <pass / fail>
**Evidence:** <1–2 sentences>

## Score

**<n>/4 conditions pass.**

## Recommendation

<One of:>

### [4/4] Proceed to forge
All four conditions hold. Next move: `/alliance-forge <proposed-alliance-name> <node-1>,<node-2>[,…]`.

**Proposed first-cycle focus:** <one sentence>
**Proposed first commitment per node:**
- <Node 1>: <artifact> by <date>
- <Node 2>: <artifact> by <date>

**Before running /alliance-forge:** Run this assessment past <candidate> directly. Alliance-readiness without the candidate's explicit agreement is preliminary. Both parties must arrive at the forge having agreed on domains, artifact, cadence, and attestation.

### [3/4] Develop first
<Failed condition> does not yet hold because <specific reason>.

**Development work required:**
- <specific action — joint project, shared problem, domain clarification conversation>
- <specific action>

**Re-assessment date:** <+1 quarter from today>

**In the meantime:** The relationship stays in its current shape (<current type>). The failed condition is the work, not an obstacle.

### [≤2/4] Not an alliance fit
<Multiple conditions> do not hold. The structural shape required for a SIP alliance is not present here, and forcing it would damage both the relationship and the artifacts.

**Current relationship shape:** <mentor / peer / client / collaborator / referral partner / friend>
**What this relationship compounds at its current shape:** <specific, positive, concrete>
**Preserve:** <how to nurture the relationship as-is>

This is not a downgrade. Most relationships are not alliance-capable. That is correct.

## Next move

<Exactly one named next move, per the recommendation above.>

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, alliance-method]
- Verticals: starlight-intelligence-system@v7.4 (RIS alpha — Layer 8)
- Generated: <ISO date>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Rules

- **Never soften a failed condition.** Softening breaks the alliance at the first real fork. A failed condition is signal, not an obstacle to route around.
- **Never forge from this command.** Pre-filter only. Forging lives in `/alliance-forge`. The separation is intentional redundancy — Forge validates again at scaffold time.
- **Specificity is the test.** If skill complementarity cannot be named concretely, it fails. If the non-zero-sum artifact cannot be named concretely, it fails. Abstractions fail every condition.
- **Silent composition is breach.** If either party prefers silent contribution, attestation fails. Refuse the alliance shape; recommend services contract or ghostwriting arrangement instead.
- **The candidate's sovereignty matters as much as the person's.** If the candidate has not been consulted on this assessment, every recommendation is preliminary — flag it explicitly. Do not forge based on one-sided assessment.
- **"Not an alliance fit" is not a downgrade.** Name the current relationship's shape with respect. Some of the most valuable relationships in a sovereign person's life are permanent non-alliances.
- **Hand off to exactly ONE next move.** Proceed to forge, develop with named condition + timeline, or honor the current shape. No menu.
- **Never write personal assessment data to public vaults.** The assessment lives in the person's instance only. Starlight does not retain relational readiness data except via SIP attestation compounding on shipped alliance artifacts.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, alliance-method]
- Verticals: starlight-intelligence-system@v7.4 (RIS alpha — Layer 8)
- Generated: 2026-04-24
---
