# Prompt Lifecycle and Evidence Contract

Prompts are versioned production assets, not magic text.

## Required prompt card

- ID, version, owner and domain.
- Exact provider/model/version and supported mode.
- Purpose and final surface.
- Required canon inputs and references.
- Template and field contract.
- Settings: duration, aspect, fps, seed and model controls.
- Known failure modes and incompatible controls.
- Official source URLs and last-grounded date.
- Representative test set.
- Output receipts and defect tags.
- Eval rubric and promotion state.

## Promotion

1. `draft`: lint structure and required inputs.
2. `research-backed`: official guidance and model limits verified.
3. `render-tested`: at least four representative generations scored; settings,
   outputs and failures stored.
4. `campaign-proven`: wins across at least two releases or three comparable
   experiments on the declared metric without identity/rights regression.
5. `retired`: record model drift, failure or replacement.

Never transfer “proven” status to a new model version automatically.

## Shot evaluation — 50 points

Score 0–5:

1. Hook/readability in first 0.7s.
2. Character identity.
3. Anatomy, face and hands.
4. Requested action and causal end state.
5. Camera/framing.
6. Physical and temporal coherence.
7. Light/style continuity.
8. Lip/voice/audio sync when applicable.
9. Absence of artifacts, unwanted text and watermarks.
10. Edit usefulness and loopability.

43–50 promotes. 38–42 iterates. Below 38 regenerates or reconcepts. Any
identity break, extra limb, unintended cut, unreadable emotion, noncausal motion
or audio mismatch rejects regardless of aggregate.

## Eval method

- Generate four candidates per representative shot.
- Keep seed/settings fixed and change one prompt variable at a time.
- Review at normal speed and frame-step.
- Audit adjacent out-frame/in-frame continuity for sequences.
- Inspect the encoded platform crop, not only the generation preview.
- Store rejected outputs and reasons when legally/operationally appropriate;
  failures are part of the knowledgebase.

