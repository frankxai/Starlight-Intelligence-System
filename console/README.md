# Starlight Console

> v8 — substrate visualization. Local-first navigation of the Starlight Intelligence System. Dual view: 2D force-graph (default) + 3D scene (signature).

The Console is the spatial complement to `site/`. Where the site explains the substrate in prose, the Console lets you navigate it: six vaults, ten sovereign verticals, one core — rendered as a 2D force-directed graph for legibility, or as a 3D orbital scene for impact.

## v7.2 update — dual view

Per the Luminor REVISE: legibility beats spectacle for a "navigate the substrate" use case, but spectacle is what makes the Console memorable. So we ship both — backed by a single render-agnostic data layer.

- **Data layer** (`src/data/substrate.ts`) — exports `core`, `vaults`, `verticals`, `edges`, `allNodes`. Pure graph. No render assumptions.
- **2D view** (`src/components/SubstrateGraph2D.tsx`) — `react-force-graph-2d`, canvas-based, every node labeled, hover detail panel. **Default.**
- **3D view** (`src/components/SubstrateScene.tsx`) — original R3F orbital scene. Signature view, one click away.
- **Switcher** (`src/components/SubstrateViewSwitcher.tsx`) — URL-driven toggle so views are shareable.

### URL params

- `/substrate` — default 2D force-graph
- `/substrate?view=2d` — explicit 2D
- `/substrate?view=3d` — 3D orbital scene

The toggle in the HUD updates the URL via `router.replace`, so any view you land on is bookmarkable.

### Phase 2 — honest constraint

The agent harness ships only when it can call live LLMs honestly. No pre-cached responses ever masquerade as real. Until that lands, the landing page labels the future correctly: "Phase 2 — coming soon (real LLM responses, no pre-cached fakes)."

## What this is (v0.1)

This release ships:

- Next.js 16 App Router + React 19 + Tailwind 4
- `react-three-fiber` + `drei` for 3D
- `react-force-graph-2d` for 2D
- `/` landing page (text panel + CTA + Phase 2 honest roadmap)
- `/substrate` dual-view substrate visualization
- Substrate data sourced from `../memory/vaults/` and `../VERTICALS.md`

No auth. No DB. No deployment. No backend. No fake agents. Pure client-rendered visualization over a single source of truth.

## Run it

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3001](http://localhost:3001).

> Port `3001` is intentional — `site/` runs on `3000`. Both can run side-by-side.

### Routes

- `/` — landing panel with intro + dual-view CTAs + Phase 2 honest roadmap
- `/substrate` — 2D force-graph (default)
- `/substrate?view=3d` — 3D orbital scene

### Controls

**2D view**
- **Drag** a node — reposition it (force layout adapts)
- **Hover** — detail panel on the right
- **Scroll** — zoom

**3D view**
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
│   │   ├── SubstrateScene.tsx         R3F 3D scene — core + orbital rings
│   │   ├── SubstrateSceneClient.tsx   Client-only loader for the 3D scene
│   │   ├── SubstrateGraph2D.tsx       react-force-graph-2d default view
│   │   └── SubstrateViewSwitcher.tsx  URL-driven 2D/3D toggle + HUD
│   └── data/
│       └── substrate.ts               Render-agnostic graph (nodes + edges)
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
