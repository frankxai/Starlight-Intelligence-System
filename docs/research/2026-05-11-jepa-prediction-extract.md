---
title: JEPA Prediction-Error Extract — for SIS Predictive-Layer Decision
date: 2026-05-11
status: research-extract
audience: substrate-tier
attestation: Built on SIP
---

# JEPA Prediction-Error Extract

Research synthesis prompted by the OSCEN architectural-gap analysis (2026-05-11). OSCEN's
proprietary spiking-neural brain exposes one genuine SIS gap: **no Predictive Layer that
emits forward predictions and uses prediction-error as a learning / routing signal.** The
most leverageable open-source analog is Meta FAIR's JEPA family (LeCun's group). This file
extracts the prediction-error mechanism cleanly so a future Board can decide whether to
add `prediction.error` events to the SIS brain-event-bus.

This is research synthesis, not a plan. No action items.

---

## 1. What JEPA / I-JEPA / V-JEPA Are

**JEPA (Joint-Embedding Predictive Architecture)** is the centerpiece of LeCun's 2022
position paper *A Path Towards Autonomous Machine Intelligence* (OpenReview, v0.9.2,
2022-06-27). The proposal: build autonomous agents around a **configurable predictive
world model** trained by **self-supervised prediction in representation space**, not pixel
space. The architecture encodes context `x` and target `y` separately, then a predictor
tries to map the context embedding to the target embedding. The "joint-embedding" part is
that both context and target are projected into a shared latent space; the "predictive"
part is that the model is scored by how well it predicts one embedding from the other.
The headline advantage: by predicting representations rather than raw signal, the model is
free to discard irrelevant detail (texture, noise, exact pixel values) and keep only what
is semantically predictable.

**I-JEPA (Image-JEPA, Assran et al. 2023, facebookresearch/ijepa)** is the first
large-scale image instantiation: mask several target blocks in an image, encode the
visible context with a ViT, and train a predictor to output the target encoder's
embeddings of the masked blocks. **V-JEPA (facebookresearch/jepa, 2024)** extends the
same idea to video — predicting masked spatio-temporal patches in latent space from a
visible spatio-temporal context, with patch shape `2 x 16 x 16` for the video token. Both
share the core invariant: **the loss is computed on embeddings, never on pixels.**

---

## 2. Core Extract — Prediction-Error Mechanism

Reduced from `facebookresearch/ijepa/src/train.py` (Smooth-L1 confirmed via direct
inspection) and the JEPA architecture sketch in LeCun (2022). All names below match the
ijepa repo's vocabulary where applicable.

```python
# Two ViT encoders share architecture but not weights.
# context_encoder  = trainable; produces sx from visible patches.
# target_encoder   = EMA copy of context_encoder; produces sy from full image.
# predictor        = small ViT; maps (sx, mask_positions) -> predicted target embedding.

for batch in loader:
    x_context, x_full, mask_idx = mask_blocks(batch)         # I-JEPA masking

    # 1. Encode context (visible patches only).
    sx = context_encoder(x_context)                          # [B, N_ctx, D]

    # 2. Predictor outputs PREDICTED embeddings at masked positions.
    sy_hat = predictor(sx, mask_idx)                         # [B, N_tgt, D]

    # 3. Encode the true target with the EMA target encoder; STOP-GRAD on target side.
    with torch.no_grad():
        sy = target_encoder(x_full)[:, mask_idx, :]          # [B, N_tgt, D]

    # 4. Prediction error = distance between predicted and true embedding.
    #    (ijepa uses smooth_l1; cosine / L2 are common variants.)
    loss = F.smooth_l1_loss(sy_hat, sy)                      # <-- the signal

    loss.backward(); optimizer.step()

    # 5. Target encoder follows context encoder via EMA — never trained directly.
    with torch.no_grad():
        m = next(momentum_scheduler)
        for q, k in zip(context_encoder.parameters(),
                        target_encoder.parameters()):
            k.data.mul_(m).add_((1.0 - m) * q.detach().data)
```

The single line that matters for SIS: **`loss = F.smooth_l1_loss(sy_hat, sy)` is the
prediction-error signal.** It is a scalar distance between *what the predictor expected*
and *what the target encoder actually produced* — both in latent space. Stop-gradient on
the target side and EMA on the target encoder prevent representation collapse (the trivial
solution where both sides emit the same constant).

---

## 3. Hypothetical SIS Adaptation — `prediction.error` Event

Mapping onto SIS's symbolic / text / agent layer. Pseudocode only; no implementation.

```python
# SIS-side analog: emit a prediction.error event when a retrieval lands far from
# what the planning layer EXPECTED the retrieval to return.

def route_with_prediction_error(query, brain_bus):
    # 1. Planning layer emits an expected-target embedding BEFORE retrieval runs.
    expected = planner.predict_target_embedding(query)        # sy_hat analog

    # 2. Retrieval layer runs (Memory Bus / cross-repo indexer).
    hits = memory_bus.recall(query, k=8)                      # sy analog
    actual = embed(hits.top1.content) if hits else None

    # 3. Prediction error = distance between expected and actual top-hit embedding.
    if actual is not None:
        err = 1.0 - cosine(expected, actual)                  # in [0, 2]
        if err > THRESHOLD or hits.confidence < CONF_FLOOR:
            brain_bus.publish("prediction.error", {
                "trace_id": query.trace_id,
                "error": err,
                "confidence": hits.confidence,
                "query": query.text,
            })
    return hits
```

Consumers of `prediction.error` could include: the dashboard halo (red pulse on
high-error), the dreaming/consolidation cron (collect-then-distill mis-predicted queries
into new atoms), and the orchestrator router (escalate to a richer cognition tier when
prediction error is sustained-high).

---

## 4. Honest Limits — What Translates and What Does Not

**Translates cleanly:**

- *The shape of the signal.* "Expected embedding vs actual embedding, distance = error" is
  a domain-agnostic pattern. SIS already has embedding spaces (Memory Bus / mempalace /
  cross-repo indexer atoms). Computing a cosine or smooth-L1 between a planner's expected
  embedding and a retriever's returned embedding is well-defined.
- *The event-bus framing.* Prediction error as a published event (not a training gradient)
  fits SIS's existing brain-event-bus pattern — `retrieve.start` / `retrieve.topk` /
  `synthesis.complete` / `error` already exist; `prediction.error` slots in symmetrically.
- *Threshold-gated escalation.* SIS dispatch tiers already escalate by confidence; adding
  prediction-error as a second axis is incremental.

**Does NOT translate (the honest part):**

- *Gradient learning.* JEPA's loss flows backward through `context_encoder` and
  `predictor`. SIS has no differentiable parameters at the agent/text layer — there is no
  `loss.backward()`. Prediction error in SIS is a **signal**, not a training objective.
  Any "learning" from it is symbolic (write to vault, distill an atom, change a routing
  rule), not weight-update.
- *Continuous latent space with EMA target.* JEPA's representation-collapse defense
  depends on a slowly-updated target encoder. SIS embeddings come from frozen third-party
  models (OpenAI / Voyage / local) — there is no EMA update to schedule. Collapse is a
  non-issue, but so is the implicit regularization JEPA gets for free.
- *Dense spatial prediction.* I-JEPA predicts many masked patches per image; V-JEPA
  predicts many spatio-temporal patches per clip. SIS retrievals are sparse and discrete
  (top-k atoms). The "many-predictions-per-batch" statistical-leverage benefit does not
  exist at the text/agent layer; SIS would compute prediction error per-query, not
  per-patch.
- *World-model planning.* LeCun's larger position paper uses JEPA inside a configurable
  world model that supports planning by latent-rollout. SIS planning is symbolic
  (subagent dispatch, slash-command chains). The full LeCun stack does not port; only the
  prediction-error mechanism does.

**Bottom line for the decision-maker:** the mechanism is small, well-defined, and
event-bus-shaped. The deep-learning machinery around it is not what SIS would adopt — SIS
would adopt the *signal*, not the training loop.

---

## 5. Referenced Repositories and Sources

- https://github.com/facebookresearch/ijepa — I-JEPA reference implementation (archived
  read-only 2024-08-01). Source of the Smooth-L1 loss snippet above.
- https://github.com/facebookresearch/jepa — V-JEPA reference implementation (video).
- https://openreview.net/pdf?id=BZ5a1r-kVsf — LeCun (2022) *A Path Towards Autonomous
  Machine Intelligence*, v0.9.2. Original JEPA position paper.
- https://arxiv.org/abs/2306.02572 — Dawid and LeCun (2023) *Introduction to Latent
  Variable Energy-Based Models* — the energy-based framing behind JEPA in formal detail.
- https://github.com/facebookresearch/dinov2 — DINOv2; sibling self-supervised line from
  the same group, useful as a frozen-embedding source if SIS ever needs a non-text
  embedding backbone for the `expected` signal in §3.

---

Built on SIP
