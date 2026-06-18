# Brief — Homepage Hero Loop

**Status:** Frank direction locked 2026-06-18 — messaging approved; frame/motion pending
**Process:** `docs/strategic/motion-process-v2.md`

---

## Asset

| Field | Value |
|-------|-------|
| Slug | `estate-hero-loop` |
| Surface | `starlightintelligence.org` homepage hero **backdrop only** |
| Duration | 8–10s seamless loop |
| Relationship to page | Sits **behind** existing H1 + copy. Does not carry its own paragraph. |

---

## Viewer

| Field | Answer |
|-------|--------|
| **Who** | Technical builder landing cold — engineer, founder, or operator who has used ChatGPT/Cursor/Claude and hit the **context amnesia** wall. |
| **Prior knowledge** | Knows AI agents exist. Does **not** know SIP, vaults, Mind/Mesh, or Estate Factory. |
| **Job-to-be-done** | In 3 seconds muted: grasp that this is **persistent intelligence you own** — not another chat wrapper. |
| **What they do next** | Scroll to read H1, or click Quickstart / Protocol. Motion earns the right to read, not replace reading. |

---

## One message

**The power of your multi-agent system, amplified.**

Starlight is not "replace your agents" — it is substrate that **multiplies** what you already run (Claude, Codex, Grok, Gemini, swarms) with shared memory, routing, and attestation.

Page H1 stays *Persistent context. Sovereign by architecture.* Motion carries the **amplification** story in parallel — felt, not a second essay.

---

## 3-second hook (muted)

**On-screen (max 6 words):** `Your agents. Amplified.`

**Visual:** Several dim agent-orbs (yours, scattered) → substrate threads connect them → **synchronized pulse** — all orbs brighten together. One rhythm, many agents.

Optional: single word fade at 6–8s: `amplified` (lowercase, mono) — only if legibility test passes at 390px; otherwise visual-only.

---

## Emotional arc

| Phase | Time | Feeling | Show (not tell) |
|-------|------|---------|-----------------|
| Alone | 0–2s | Agents siloed, weak | Separate dim orbs, no bridges |
| Linked | 2–6s | Substrate connects | Threads between orbs; shared orbit |
| Amplified | 6–10s | Combined power | Pulse hits all orbs; brightness gain; loop rhymes |

---

## Anti-goals

- No vault names (◆ ⬡ ✦), no `/si`, no agent counts, no Mind/Mesh/Steward
- No text overlays competing with H1
- No slideshow of 3 unrelated AI stills
- No "premium dark tech soup" without semantic motion
- Not a product demo — **ambient proof of concept**

---

## Reference steals (structure, not pixels)

| Reference | Steal |
|-----------|-------|
| **Linear** homepage | One metaphor, slow confidence, motion supports headline |
| **Site `BrainHero`** | Ring + center orchestrator — **extend** this language (SVG/CSS), don't fight it |
| **Vercel ship loops** | Seamless loop, subtle, never steals focus from copy |

**Direction:** Prefer **code motion** (SVG lines + CSS/GSAP on existing topology) over image_gen plates. BrainHero already encodes 10-IS; hero loop should animate **connection + pulse**, not introduce new visual vocabulary.

---

## Storyboard (approved direction = Option A)

| Beat | Time | Visual | Text on loop |
|------|------|--------|--------------|
| Hook | 0–2s | 4–6 agent orbs, isolated, dim | `Your agents.` (3s) |
| Link | 2–5s | Cyan/violet threads connect orbs | — |
| Amplify | 5–8s | Shared pulse, all orbs brighten | `Amplified.` |
| Seam | 8–10s | Hold bright state → ease to Alone | — |

**Option B (rejected for v1):** Keyframe plates + crossfade — reads as slideshow; failed P0 review.

---

## Integration (post-approval)

- `prefers-reduced-motion`: static first frame or existing `BrainHero` only
- Lazy-load video below LCP text; WebM preferred
- Board gate unchanged for **public** embed; preview on Vercel preview branch OK

---

## Falsifiers

- [ ] Stranger test (muted 3s): "something about memory / things staying connected"
- [ ] 390×844: loop readable as mood, not detail (no small labels)
- [ ] H1 still dominant — loop opacity ≤ 50% behind text on mobile
- [ ] Loop seam invisible at 10s repeat

---

## Design bar

See `docs/strategic/motion-design-premium-2026.md`. **`hero-frame-preview.html` withdrawn** — failed premium audit.

**Direction pick required:** A (Substrate Lens) · B (BrainHero evolve) · C (Glass surface) · A+B hybrid.

## Approval

- [ ] Frank picks design direction (premium doc § Three directions)
- [ ] Frank approves **still** (premium-visual or evolved BrainHero) — creative lock
- [ ] Frank approves draft MP4 → high render + registry `approved`