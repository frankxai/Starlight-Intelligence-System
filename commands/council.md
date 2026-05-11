# /council Command

> *"Many minds, one decision. The Council convenes."*

**Primary Agent:** Starlight Prime (Council Chair)
**Skills Activated:** multi-agent-coordination, strategic-reasoning, decision-framework
**Schema contract:** every Council Review conforms to `CouncilReview` in `src/types.ts` and `packages/core/schemas/council-review.schema.json`.

---

## Council Archetype Seats (v0.1 — 7 perspectives, non-waivable)

Per Proposal B (board verdict `docs/boards/2026-05-11-v01-sis-shipping-bundle.md`, PROCEED-WITH-REVISE), every full Council Review carries **seven distinct archetype perspectives**. Each seat has cognitive signatures that prevent generic LLM mush; see `agents/council/<name>.md` for per-seat trigger phrases + cognitive moves.

| Seat | Frame | File |
|------|-------|------|
| Elder Father | Responsibility, discipline, protection, legacy | `agents/council/elder-father.md` |
| Elder Mother | Care, relational truth, beauty, emotional wisdom | `agents/council/elder-mother.md` |
| Sage (Council) | Mortality, philosophy, detachment, meaning | `agents/council/sage.md` |
| Builder-Elder | Execution, cost, systems, leverage | `agents/council/builder-elder.md` |
| Shadow Witness | Ego, risk, self-deception, hidden motives | `agents/council/shadow-witness.md` |
| Divine Neutral Witness | Silence, truth, non-attachment | `agents/council/divine-neutral-witness.md` |
| Future Self at 90 | Fulfilled-life review | `agents/council/future-self-at-90.md` |

These archetypes are *also* registered in `VOICES.md` § Council Archetypes (pattern layer). The agent files are the runtime layer. Both exist; neither collapses into the other (see `memory/feedback_naming_voices_vs_agents.md`).

---

## The 7-field Council Memo Template (non-waivable)

Every Council Review — invoked by `/council`, `/starlight-board`, or `/luminor-board` — produces a memo with these nine fields. The shape is ratified by the `CouncilReview` schema; outputs that fail the schema are not Council Reviews.

```
1. Decision
   The proposal being reviewed, stated in one sentence.
   Matches CouncilReview.decision (required, ≥1 char).

2. Context
   What the Council needs to know to evaluate. ≤5 sentences.
   Matches CouncilReview.context.

3. Perspectives  (the seven seats; each ≤5 sentences reflection / ≤3 decision)
   3.1 Elder Father           → CouncilReview.perspectives.elderFather
   3.2 Elder Mother           → CouncilReview.perspectives.elderMother
   3.3 Sage                   → CouncilReview.perspectives.sage
   3.4 Builder-Elder          → CouncilReview.perspectives.builderElder
   3.5 Shadow Witness         → CouncilReview.perspectives.shadowWitness
   3.6 Divine Neutral Witness → CouncilReview.perspectives.divineNeutralWitness  (≤3 sentences total — seat's discipline is brevity)
   3.7 Future Self at 90      → CouncilReview.perspectives.futureSelf90

4. Convergence
   What the seats agreed on. May be empty if no convergence.
   Matches CouncilReview.convergence.

5. Conflict
   Where the seats disagreed, and on what axis.
   Matches CouncilReview.conflict.

6. Red Lines
   Hard constraints surfaced — any one of which kills the proposal until resolved.
   Bulleted list. Matches CouncilReview.redLines (string[]).

7. Cleanest Path
   The single path forward that respects all Red Lines and the Convergence.
   Matches CouncilReview.cleanestPath.

8. One Next Move
   The single concrete action the sovereign takes next.
   ≤1 sentence. Matches CouncilReview.oneNextMove.

9. Review Date
   When this review was conducted. ISO 8601.
   Matches CouncilReview.reviewDate.
```

A memo that omits a seat — or fills a seat with output that does not reflect that seat's perspective signatures — is structurally invalid. The seven perspectives are the substrate of the review; they are not optional adornment.

### Quality bar per seat

Each seat must, in its perspective output, show at least one of its trigger phrases (or its functional equivalent) and at least one of its cognitive moves (see the seat's `agents/council/<name>.md`). If two seats produce textually indistinguishable output, the Council Review fails its distinctness check (`/openclaw-audit` will surface this as a structural failure).

---

## Subcommands

### /council [--topic]

Convene a **Full Council** of all seven archetype seats on a topic. Produces a CouncilReview-conforming memo.

**Arguments:**
- `--topic`: The topic for Council review

**Process:**
1. Prime convenes all seven archetype seats (loaded from `agents/council/`)
2. Each seat analyzes from its archetype perspective, using its trigger phrases + cognitive moves
3. Prime synthesizes Convergence + Conflict + Red Lines + Cleanest Path + One Next Move
4. Memo written conforming to `CouncilReview` schema
5. Memo stored in Strategic Vault (operational layer) and `memory/_audit/<date>.jsonl` (substrate layer)

**Example:**
```
/council --topic "Should we encode the 7 Council archetypes as agents now or wait?"
```

### /council [--seats] [--topic]

Convene a **Mini Council** — a subset of archetype seats for a focused review.

**Arguments:**
- `--seats`: Comma-separated list of seat slugs (`elder-father,elder-mother,sage,builder-elder,shadow-witness,divine-neutral-witness,future-self-at-90`)
- `--topic`: The topic for review

**Example:**
```
/council --seats elder-father,builder-elder --topic "Cost-vs-commitment review of the v0.2 cockpit ship"
/council --seats sage,shadow-witness,future-self-at-90 --topic "Is this proposal masking the harder question?"
```

Mini Council outputs still produce a CouncilReview record; seats not present render as empty strings for those perspective fields. Mini Council is appropriate for risk-medium decisions; risk-high and risk-critical decisions require Full Council.

### /council review [artifact]

Have the Council review a specific artifact (proposal, design, plan) and produce a CouncilReview-conforming memo.

**Example:**
```
/council review "docs/proposals/2026-W19-substrate-extension.md"
```

### /council decide [question]

Have the Council make a formal decision on a question. Same shape as `/council --topic`; the framing emphasizes that an output Decision will be created and stored, not only a review.

**Example:**
```
/council decide "Should we add real-time synchronization between repos?"
```

---

## Council Protocols

### Full Council
All seven archetype seats participate. Used for substrate-tier proposals, risk-high/critical decisions, name-bearing artifacts.
**Token cost:** ~5000-8000.
**When:** Substrate changes, strategic pivots, board-gate-required decisions.

### Mini Council
3-5 archetype seats. Used for domain-specific or risk-medium decisions where a Full Council would be over-instrumented.
**Token cost:** ~2000-4000.
**When:** Domain reviews, focused-pressure tests, follow-up reviews.

### Pair Review
2 seats collaborate for a quick validation. Not a substitute for Full Council on substrate-tier decisions.
**Token cost:** ~1000-2000.
**When:** Quick checks where two specific frames are the binding constraint.

---

## Naming note (2026-05-03)

`/starlight-board` is the canonical SIS-substrate-tier governance command (canon-free, functional vector names). `/luminor-board` is the Arcanea-canonical variant (Guardian names + CC-BY-NC) for proposals that explicitly compose Arcanea canon. `/council` is the broader operational entry point that *uses* the seven archetype seats; it composes with both `/starlight-board` and `/luminor-board` depending on which canon register applies.

The seven archetype seats are *canon-free*. They inherit pattern, not person, per SIP § 5 item 7 (v1.1.1 encoded-self-forkable amendment). Forks may substitute equivalents that preserve the structural function of each seat.

---

## Processing

```
/council [subcommand] [args]
  → Parse subcommand and arguments
  → Prime assesses: Full Council, Mini Council, or Pair?
  → Load relevant archetype seat files from agents/council/
  → Assemble context for each seat
  → Each seat produces perspective using its signatures + moves
  → Prime synthesizes Convergence + Conflict + Red Lines + Cleanest Path + One Next Move
  → Output validated against CouncilReview schema
  → Record stored in Strategic Vault + audit ledger
  → Return CouncilReview-conforming memo
```

---

**Built on SIP** · /council command · v0.1 archetype encoding · MIT
