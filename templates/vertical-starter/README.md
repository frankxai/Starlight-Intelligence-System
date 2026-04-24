# Vertical Starter Template

> Drop-in scaffold for spawning a new vertical under SIP. Copy this whole `vertical-starter/` directory into your new vertical's repo and fill in the blanks. The file contract (SIP § Layer 1) is pre-wired; you bring the essence.

## What's inside

| File | What it declares | Fill-in required |
|------|------------------|------------------|
| `README.md` | This file — template overview | Replace with your vertical's README |
| `SKILL.md` | What AI adopts when working in this vertical | Voice, invariants, primary commands |
| `SOUL.md` | The essence that must not drift | Your single-sentence founder truth |
| `AGENTS.md` | Your named operational agents | Map or replace the 5 archetypes |
| `MEMORY.md` | Instance state (cycle 0) | Identity, roadmap, commitments |
| `STACK.md` | Your adopted stack choices | Inherit Starlight's or override |
| `.claude/commands/*` | Your vertical-tier commands (stubs) | Author at least 3 `<vertical>-*` commands |

## Usage

```bash
# From your new vertical's repo root:
cp -r /path/to/starlight/templates/vertical-starter/. .
# Then edit each file — every <PLACEHOLDER> needs to become real.
```

Or invoke the spawner directly:

```
/vertical-spawn <vertical-name> "<one-line domain>"
```

Which copies this template + personalizes each file from your arguments + registers the vertical in Starlight's `VERTICALS.md`.

## What you commit

- **File contract.** All 7 substrate-layer files present (SKILL, AGENTS, MEMORY, SOUL, CANON optional, STACK, README).
- **Attestation.** Every cross-party artifact you ship carries "Built on SIP" via `/sip-attest`.
- **Sovereignty.** Your domain, your call. Starlight has no ownership claim on your vertical.
- **Reciprocity.** Attribution via SIP is the compounding mechanism. No other obligation.

## What you do NOT commit

- Private state in this repo (use `private/` gitignored directory).
- Any promise of ownership or revenue share with Starlight.
- Compositional debt (using SIP elements silently — that's a breach).

---

**Built on SIP** — vertical starter template · v7.3
