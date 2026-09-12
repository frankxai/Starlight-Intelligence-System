# Starlight World — success criteria

Private drive surface. Vanilla HTML/CSS/JS. No Next.js. No React.

Pass means every line below is true on a loopback serve. Fail any line and the surface is not done.

## Identity

- [ ] Name is **Starlight World**. Not Q-Town. Not Agent Canvas.
- [ ] Stack is `vanilla-html`. Page source has no Next.js, no React, no bundler.
- [ ] Driver is Frank. Stewards are **registered**, never live.
- [ ] Private vault notes are not in Git, not in this graph, not in MCP.

## Drive

- [ ] `python scripts/serve-starlight-world.py` binds **127.0.0.1:8767** only.
- [ ] Layers: `1` Palace · `2` Vaults · `3` City · `4` Second Brain · `5` Graph.
- [ ] Arrows move. Enter / Space open. Esc returns. `?` help.
- [ ] Hash `#palace/lighthouse` restores the room. Reload keeps the place.
- [ ] Inspector is DOM-built. No `innerHTML` of world data.

## Map quality

- [ ] Palace is a courtyard of eight named rooms, not unlabeled pills.
- [ ] Each room shows title + role. Entering shows the full lead, not a 72-char slice.
- [ ] Vaults are six labeled orbs around SIS.
- [ ] City districts show named buildings.
- [ ] Second Brain shows brain/ vs sealed private/, with a visible air-gap.
- [ ] Graph edges stay on-canvas. Selected node and neighbors are labeled.

## Proof

- [ ] `python scripts/validate-starlight-world.py` exits 0.
- [ ] Eight palace rooms, six vaults, five districts, five brain nodes.
- [ ] Private node is air-gapped. Stewards `live: false`.
- [ ] CHANGELOG names this surface.
- [ ] Draft PR only. Never write `main`. Never publish this HTML.

## Over-delivery (this pass)

- [ ] Keyboard never scrolls the page while driving the map.
- [ ] Inspector jumps Palace → Vault → City without leaving the world.
- [ ] Reduced motion is respected.
- [ ] 900px layout stacks map over inspector.
