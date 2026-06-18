# MOTION_REGISTRY — Starlight Motion Assets

> Living ledger for `starlightintelligence.org` motion wedges. P0 wave opened 2026-06-18.
> Built on SIP — Starlight Intelligence Protocol v1.1.1

---

## P0 — Estate Hero Loop (shipped scaffold)

| Field | Value |
|-------|-------|
| **Slug** | `estate-hero-loop` |
| **Composition** | `site/motion/estate-hero-loop/index.html` |
| **Duration** | 10s (seamless loop seam at 9.0s) |
| **Resolution** | 1920×1080 |
| **Lane** | Grok lead (keyframes + comp) |
| **Plan** | `docs/strategic/starlight-motion-production-plan-2026-06-18.md` |
| **Site mirror** | `site/public/motion/hero-loop/` |
| **Draft render** | `site/public/motion/hero-loop/estate-hero-loop.mp4` (~2.0 MB, 10s @ 30fps) |
| **Board gate** | Homepage hero embed **not** enabled until board lifts gate |

### Narrative phases

1. **Constellation** — intelligence network (0–3.5s)
2. **Vault Orbs** — six vault memory surface (3.5–7s)
3. **/si Routing** — multi-CLI dispatch pulse (7–10s)

### Keyframe plates

| File | SHA-256 | Prompt summary |
|------|---------|----------------|
| `kf1-constellation.jpg` | `912ade541975101c8d49a28c9298521393c0f68b2a198917936974391cf30729` | Sparse constellation on `#060609`, violet/cyan lines, no text |
| `kf2-vault-orbs.jpg` | `a21d92dc1f1a7b4af635d2e038f09ceb029b46a0e76fbd4bc2a6efb646952358` | Six glass vault orbs in orbital ring, deep black ground |
| `kf3-si-pulse.jpg` | `fa983eae9e956ad194624ec10b52ba316606681c38d1749007a268e2d3e946c5` | Central hub routing pulse, cyan/violet fanout lanes |

**Canonical paths:**
- `site/motion/estate-hero-loop/assets/`
- `docs/visuals/motion/` (registry copies)
- `site/public/motion/hero-loop/` (static serve)

### Dev commands

```powershell
cd site/motion/estate-hero-loop
bunx hyperframes@0.6.112 preview   # Studio preview
bunx hyperframes@0.6.112 lint        # Lint (use bunx; npm lock may error on this machine)
bunx hyperframes@0.6.112 render --quality draft --output ../../public/motion/hero-loop/estate-hero-loop.mp4
```

**Note:** HyperFrames recommends Node ≥ 22; machine has Node 20. Use `bunx` for CLI; upgrade Node before CI render pipeline (P2 item 7).

### Attestation sidecar

See `site/motion/estate-hero-loop/assets/estate-hero-loop.sip.json`.

---

## P0 — Estate Factory Scroll (shipped scaffold)

| Field | Value |
|-------|-------|
| **Slug** | `estate-factory-scroll` |
| **Composition** | `site/motion/estate-factory-scroll/index.html` |
| **Duration** | 45s (Mind 3–18s · Mesh 18–33s · Steward 33–43s · CTA 43–45s) |
| **Resolution** | 1920×1080 |
| **CTA** | `/download#codex-plugin-starter` |
| **Render** | `site/public/motion/estate-factory-scroll.mp4` (draft) |
| **Narrative** | `docs/delivery/estate-army-commissioning-workflow.md` |

### Attestation sidecar

`site/motion/estate-factory-scroll/assets/estate-factory-scroll.sip.json`

---

## P0 backlog (remaining)

| Slug | Target | Status |
|------|--------|--------|
| `receipt-motion-card` | Animated hero-demo receipt card | planned |

---

## Provenance

- **2026-06-18:** Grok P0 wave — 3 keyframes via image_gen, HyperFrames scaffold, MOTION_REGISTRY opened.
- **Receipt pattern:** Mirror `agent-tools/` ledger entries when dispatched via `si-dispatch`.

*Starlight Intelligence System v8.3.0 — Motion Registry v0.1*