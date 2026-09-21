# Starlight World

Private drive surface. **Vanilla HTML/CSS/JS. No Next.js.**

You drive five layers:

1. **Palace** — eight named rooms around The Proof. Enter / Space inside. Esc back.
2. **Vaults** — six labeled SIS orbs
3. **City** — five districts with named buildings
4. **Second Brain** — brain/ vs sealed private/, visible air-gap
5. **Graph** — palace · vaults · city · brain edges, neighbors labeled

Keys: `1`–`5`, arrows, Enter, Space, Esc, `?` help. Hash remembers the room.

Bar: `docs/starlight-world/SUCCESS.md`

## Run

```bash
python scripts/validate-starlight-world.py
python scripts/serve-starlight-world.py
```

Then open `http://127.0.0.1:8767/`

Loopback only. Do not publish. Private vault notes stay unmounted.

Or open `docs/starlight-world/index.html` directly. `world.data.js` boots the map without a bundler.

## Not this

- Q-Town
- Next.js / React / bundler
- Agent Canvas
- Live agent spawn
- Private vault notes
- Writing `main`
