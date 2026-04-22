# Starlight Console

> v8 — substrate visualization. Local-first 3D navigation of the Starlight Intelligence System.

The Console is the spatial complement to `site/`. Where the site explains the substrate in prose, the Console lets you orbit it: six vaults around a luminous core, ten sovereign verticals in an outer ring.

## What this is (v0.1)

**Night-zero foundation only.** This release ships:

- Next.js 16 App Router + React 19 + Tailwind 4
- `react-three-fiber` + `drei` integration
- `/` landing page (text panel + CTA into the substrate)
- `/substrate` 3D scene (vaults orbiting core, verticals on outer ring, OrbitControls)
- Substrate data sourced from `../memory/vaults/` and `../VERTICALS.md`

No auth. No DB. No deployment. No backend. Pure client-rendered visualization.

## Run it

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3001](http://localhost:3001).

> Port `3001` is intentional — `site/` runs on `3000`. Both can run side-by-side.

### Routes

- `/` — landing panel with intro + CTA
- `/substrate` — the 3D scene

### Controls

- **Drag** — orbit
- **Scroll** — zoom
- **Right-drag** — pan

## Build

```bash
pnpm build
pnpm start
```

## Architecture (current)

```
console/
├── src/
│   ├── app/
│   │   ├── layout.tsx           Root layout, Geist font, dark theme
│   │   ├── page.tsx             Landing page
│   │   ├── globals.css          Tailwind + theme tokens
│   │   └── substrate/
│   │       └── page.tsx         /substrate route — wraps the canvas in HUD
│   ├── components/
│   │   └── SubstrateScene.tsx   R3F scene — core + orbital rings
│   └── data/
│       └── substrate.ts         Vault + vertical node definitions
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

## Roadmap

### v8.1 — interaction

- Click a vault → side panel with recent entries (read from `../memory/vaults/*.md`)
- Hover affordances + node detail panes
- Connection lines between related verticals (canon dependencies)

### v8.2 — agent harness

- Chat overlay scoped to a selected node
- Agent reads vault context for the focused node
- Multi-agent cursors (other instances visible in scene)

### v8.3 — live state

- Real-time vault entry streams (file watch)
- Node pulses when its vault is written to
- Recent activity heatmap on the orbital plane

### v9 — canon layer

- Optional Arcanea Guardian archetypes overlaid on verticals
- Hz frequency visualization tied to Vibe OS state
- Procedural canon-aware skybox

## Notes

- Built on **SIP** — substrate visualization is one possible Console form; the substrate itself is in `..`.
- This subdir lives inside the parent repo for now. If it grows past ~50 source files, it spins out to `frankxai/starlight-console`.
- All canon (Arcanea Guardians, Vel'Tara, Hz system) is intentionally absent from v0.1. The substrate stands on its own first.

---

**Built on SIP** · v0.1 · MIT
