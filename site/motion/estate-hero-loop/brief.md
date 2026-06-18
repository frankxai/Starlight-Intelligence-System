# Brief — Homepage Hero Loop

**Status:** Proposed by Grok · 2026-06-18 · Awaiting Frank approval  
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

**Memory that stays. Sovereignty you keep.**

(Aligns with live H1: *Persistent context. Sovereign by architecture.* — motion is the **felt** version, not a second headline.)

---

## 3-second hook (muted)

**Visual only:** Scattered dim nodes (chaos / forgotten context) → threads draw between them (connection) → one central node holds steady pulse (persistence).

No on-screen text in the loop. Page H1 supplies words; loop supplies **metaphor**.

---

## Emotional arc

| Phase | Time | Feeling | Show (not tell) |
|-------|------|---------|-----------------|
| Drift | 0–2s | Context slips away | Nodes fade, lines break |
| Connect | 2–6s | System remembers | Lines reform, orbit stabilizes |
| Alive | 6–10s | Compounding | Soft pulse on core; loop rhymes with frame 0 |

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
| Hook | 0–2s | 12–16 nodes dim, drifting | none |
| Connect | 2–6s | Lines snap node-to-node, orbit settles | none |
| Pulse | 6–9s | Center + ring breathe once | none |
| Seam | 9–10s | Ease back to hook state | none |

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

## Approval

- [ ] Frank approves brief → proceed to static hero frame (SVG motion mock)
- [ ] Frank approves frame → HyperFrames or inline site CSS pass
- [ ] Frank approves draft MP4 → high render + registry `approved`