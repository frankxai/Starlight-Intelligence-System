---
name: starlight-decision-ledger
description: Preserve a consequential venture decision, its tradeoffs, owner, review date, and supporting evidence when the user asks to decide, approve, reject, document, or audit a decision.
---

# Starlight Decision Ledger

Record the decision as a falsifiable operating commitment, not a meeting note.

1. Search or fetch existing records when the user may be revisiting an earlier decision.
2. Register source material with `register_evidence` when a URL, artifact, observation, or metric materially supports the decision. Separate sourced claims from the user's judgment.
3. Call `record_decision` with context, the actual choice, rejected tradeoffs, one owner, and a review date when reversibility matters.
4. `approved` and `rejected` are consequential statuses. Use them only after explicit user confirmation and pass `user_confirmed: true`; otherwise record the decision as `proposed`.

Do not invent consensus, evidence, approval, or an accountable owner. Return the decision ID and the evidence IDs that make the decision auditable.
