# The Starlight Vault Palace — a spatial index over the six vaults

> A pilot, not a replacement. The six vaults remain the source of truth; this is a
> navigable, walkable index over them, built with the
> [mind-palace-agent-skills](https://github.com/frankxai/mind-palace-agent-skills)
> Memory Palace suite (`agent-memory-palace` + `memory-palace-architect` + `loci-encoder`).

## What this is

[`palace.json`](palace.json) maps each of the six Starlight Vaults to one room in a six-wing
observatory, following the schema in
[`spec/palace.schema.json`](https://github.com/frankxai/mind-palace-agent-skills/blob/main/spec/palace.schema.json):

| Vault | Room | Surface |
|---|---|---|
| Strategic | Strategic Wing | obsidian |
| Technical | Technical Wing | slate |
| Creative | Creative Wing | aurora |
| Operational | Operational Deck | glass |
| Wisdom | Wisdom Dome | bronze |
| Horizon | Horizon Balcony | marble |

Each room holds a handful of the vault's real, current entries as stations. Every locus carries:

- **`fact`** — a one-line, verifiable summary of the real vault entry (not a substitute for reading it).
- **`refs`** — a pointer back to the source vault file/section, per `agent-memory-palace`'s
  discipline: *memory is a cache, the source is the truth.* Nothing here is invented.
- **`image`** — a vivid mnemonic encoding (bizarreness, multisensory detail, motion), so the same
  file is walkable by a human, not just indexable by an agent.

## Why this exists

The vaults are excellent durable memory but are flat markdown — finding "what do we know about
memory patterns" means opening technical-vault.md and reading. A spatial index gives:

1. **A human-walkable overview** — render `palace.json` with the
   [standalone viewer](https://github.com/frankxai/mind-palace-agent-skills/blob/main/assets/palace-viewer/index.html)
   (`?src=` a raw URL to this file, or drag-and-drop it in) to see the whole memory system as one
   navigable space, oldest-to-newest, wing by wing.
2. **A pattern for agent memory** — `agent-memory-palace`'s room=domain / station=topic / locus=fact
   mapping applied to a real, already-existing memory system, proving the pattern works on
   production data rather than a toy example.

## What this is *not*

- **Not synced automatically.** This is a curated snapshot (13 loci across representative entries,
  not exhaustive). When a vault gains a significant new entry worth indexing, add a locus by hand
  or via the `agent-memory-palace` skill's write protocol — don't treat this file as authoritative
  over the vaults themselves.
- **Not a new vault.** It doesn't have its own retention policy or writers; it inherits from
  whatever it points at via `refs`.

## Maintaining it

When a vault's index changes meaningfully:

1. Add a `locus` to the corresponding room's station (or a new station), with a real `target`,
   `fact`, and `refs` pointing at the vault entry.
2. Optionally add an `image` if the locus is worth memorizing, not just indexing.
3. Re-validate: `python3 -c "import json; json.load(open('memory/palace/palace.json'))"` (or run
   `mind-palace-agent-skills`' `scripts/validate_skills.py` structural checks against the schema).

---

Built on SIP · Starlight Intelligence System · Memory Palace Method v0.1
