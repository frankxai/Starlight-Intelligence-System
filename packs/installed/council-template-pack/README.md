# Council Template Pack

> Seven archetype prompts you can drop into any Claude / Cursor / Codex project to convene the Starlight Council on a decision, ship gate, or proposal.

## What's inside

`content/` ships seven prompt files — one per archetype seat — plus a `convene.md` master prompt that wires them into the canonical 7-perspective memo shape (used by `/starlight-board` and `/luminor-board`).

| Archetype | File | When to use it |
|-----------|------|----------------|
| Elder Father | `01-elder-father.md` | Long-horizon protection, line-of-succession reasoning |
| Elder Mother | `02-elder-mother.md` | Nurture vs autonomy, relational consequence |
| Sage | `03-sage.md` | What does the corpus already know? Precedent + pattern |
| Builder Elder | `04-builder-elder.md` | Will this hold under load? Engineering pressure-test |
| Shadow Witness | `05-shadow-witness.md` | What are we not saying? Suppressed objection |
| Divine Neutral Witness | `06-divine-neutral-witness.md` | Removed-from-stakes view |
| Future Self (90) | `07-future-self-90.md` | Will the 90-year-old you thank present-you for this? |

## How to use

1. Copy `content/` into your project (any directory).
2. Open `content/convene.md` and replace `{{PROPOSAL}}` + `{{CONTEXT}}` with the call you're pressure-testing.
3. Paste into Claude / Cursor / Codex. The model runs each seat in turn, then synthesizes per the shape in `convene.md`.

No tools, no permissions, no network — these are pure prompt artifacts.

## License

MIT. Use freely, fork freely, ship under your own banner. Attribution appreciated but not required.

Built on SIP.
