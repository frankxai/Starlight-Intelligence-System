# Cockpit Prompts — Index

> Canonical, evolving paste-ready prompts for fresh sessions. Named by purpose,
> not date. Most recent state lives at the top of each file.

| Prompt | Use case | Status |
|---|---|---|
| [`unified-cockpit-execution.md`](./unified-cockpit-execution.md) | One session, runs Voice Operator Phase 1 smoke + LCC Phase 0–1 in order with stop-and-report gates. **Recommended.** | current |
| [`voice-operator-continuation.md`](./voice-operator-continuation.md) | Voice Operator only — Phase 1 (cognitive + voice install) + Phase 2 (phone PWA via Cloudflare Tunnel) | current |
| [`local-command-center.md`](./local-command-center.md) | Local Command Center only — 4 phases (Foundation → Multi-CLI → Next.js cockpit → Live coding-agents viz). Inherits `voice-operator-continuation.md` context. | current |

## Convention

- **Canonical, not date-stamped.** Filename = purpose. Last-updated noted in front matter or final line.
- **Living docs.** Updated in place when architecture shifts. History via git log.
- **Paste-ready.** Each prompt opens with ROLE + MISSION + CONTEXT + EXECUTION ORDER. Drop into a fresh `clsis` session and go.
- **Stack citations at the bottom** per `/po` skill standards: Arcanea + Starlight + superpowers stack named explicitly.

## Distinction from `docs/ops/HANDOVER-*.md`

- **Prompts** — canonical instructions for *future* sessions. Evolve over time.
- **Handovers** — time-series snapshots. `HANDOVER-{date}.md`. Don't get edited after writing; new state = new file.

## Order to run (recommended)

1. `unified-cockpit-execution.md` — single session executes both bodies of work
2. (Frank's ack between blocks)
3. After Phase 0–1 land, decide whether to use `local-command-center.md` Phase 2–4 in a fresh session or extend the same one.

## What's NOT here

- One-off shell commands (e.g. "stop the Arcanea agent" + redirect) — those go in chat as paste-ready blocks, not committed.
- Handovers — those live at `docs/ops/HANDOVER-{date}.md`.
- Memory entries — those live at `~/.claude/projects/.../memory/*.md`.

---

**Built on SIP** — prompts index — last reorg 2026-04-28
