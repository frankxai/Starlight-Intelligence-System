# Starlight World

Private drive surface. **Vanilla HTML/CSS/JS. No Next.js.**

You drive four layers:

1. **Palace** — eight rooms. Enter to go inside. Esc back.
2. **Vaults** — six SIS orbs
3. **City** — five districts with buildings
4. **Second Brain** — brain/ vs sealed private/
5. **Graph** — palace · vaults · city · brain edges

Keys: `1`–`5`, arrows, Enter, Esc. Hash remembers the room.

## Run

```bash
python scripts/validate-starlight-world.py
python scripts/serve-starlight-world.py
```

Then open `http://127.0.0.1:8767/`

Or open `docs/starlight-world/index.html` directly. `world.data.js` boots the map without a bundler.

Keys: `1` `2` `3` `4` and arrows.

## Not this

- Q-Town
- Next.js / React / console app
- Agent Canvas
- Live agent spawn
- Private vault notes
