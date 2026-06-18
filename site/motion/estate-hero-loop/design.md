# Estate Hero Loop — Design System

Starlight Intelligence System motion wedge (P0 wave 2026-06-18).

## Palette

| Token | Value | Use |
|-------|-------|-----|
| background | `#060609` | Canvas, letterbox |
| foreground | `#e2e8f0` | Headlines, labels |
| accent | `#a78bfa` | Violet nodes, phase 1 |
| accent-cyan | `#67e8f9` | Routing pulse, phase 3 |
| accent-warm | `#f0abfc` | Vault orb highlights |
| surface | `rgba(255,255,255,0.02)` | Glass panels |
| border | `rgba(255,255,255,0.06)` | Hairline rules |

## Typography

- Display: Fraunces (serif), fallback Georgia
- UI: Inter, fallback system-ui
- Mono: JetBrains Mono for `/si` glyph

## Motion

- Duration: 10s seamless loop
- Ease: `cubic-bezier(0.4, 0, 0.2, 1)` (site `--ease`)
- Crossfade: 0.7s between keyframe plates
- Ambient: slow mesh drift on decoratives (20–30s cycles)

## Phases

1. **Constellation** (0–3.5s) — intelligence network
2. **Vault Orbs** (3.5–7s) — six memory vaults
3. **/si Pulse** (7–10s) — multi-CLI routing fanout

## Attestation

Built on SIP — Starlight Intelligence Protocol v1.1.1