# Starlight Intelligence System — State & Roadmap (2026-06-11)

> Built on SIP. The honest map: where we are, where we go, and how the pieces
> connect — with "community best state" as the north star. Written after the
> eval/memory/Queen build cycle + the exec-board + machine audits.

## The one-line thesis

**The system is sovereign by *design* but not yet usable by a *community* in
*practice*.** Everything is built right — MIT-licensed, markdown-canonical,
numpy-only, SIP-attested, forkable — but it is still single-player (Frank's
machine). The work ahead is not more capability; it is **packaging the sovereign
design into a community-runnable asset**, with the eval discipline as the wedge.

## Where we are — layer by layer

| Layer | State | Honest gap |
|---|---|---|
| **Substrate (SIP)** | Mature, attested, sovereign. starlightintelligence.org live (200). | Solid. |
| **Eval discipline** | Model Arena (3 rounds, 4-model lineup) + Proving Ground (7 lanes) + Queen routing doctrine. Honest, receipted, self-policing (caught its own orphan). **The differentiator.** | Compliance axis saturated; no deep-reasoning lane (R4) yet; judge is Claude-family only. |
| **Memory** | .md canon (correct, industry-converging) + sovereign JSONL substrate (544 atoms, migration closed). **RRF hybrid PROVEN +61% precision@10.** Architecture decision locked (ADR). | RRF is harness-proven, **not yet in the production router**; ground-truth still lexical. |
| **Coding agents** | 48 agents + a clear routing doctrine (which model for which task, evidenced). | Routing is **manual** — no router module; the Queen is doctrine, not code. |
| **Machine** | npm test 965/965 green; core healthy. | Disk 93%; secret-scan times out (zero coverage on 2 of 3 repos); 2 dead API keys; cadence/Sentinel tasks need registration. |
| **Public / community** | starlight-evals MIT mirror live; methodology + receipts public. | **No CONTRIBUTING, no "fork & run", no contribution path. frankx.ai 404s the Proving Ground.** Sovereign-by-design, not community-usable-yet. |

## Where we go — three horizons

### H1 — Connect what exists (days)
Close the connective gaps so nothing built is stranded:
- **RRF → production router** (optional layer; keep `sovereign.py` zero-dep) — ship the +61% to live recall.
- **frankx.ai Proving Ground ship** — close the 404 (handover ready).
- **Machine ops** (Frank's `!` commands): raise secret-scan timeout, register cadence task, rotate the 2 keys.
- **starlight-evals front door** — CONTRIBUTING + "fork & run in 10 min" (shipped 2026-06-11, see below).

### H2 — Make it community-runnable (weeks)
Turn sovereign-by-design into sovereign-in-practice:
- **One-command bootstrap** — a stranger forks `starlight-evals`, runs one command, gets a scorecard on *their* stack. The harness is already numpy-only/Claude-Code-native; package the path.
- **Queen → real router module** — replace the manual doctrine with code that reads `routing-table.json` and dispatches (gated until memory precision is integrated).
- **Automatic SIS → mirror sync** — replace manual `cp` with a post-commit hook so the public mirror never lags.
- **Auto-deploy fixed** — CI secrets set + post-deploy canary, so shipping isn't manual `vercel --prod`.
- **L99 2026-06-12 viz wedge** — `/palace` + MemoryPalace component shipped (beautiful animated Jarvis-style seed reusing BrainHero/Starfield/CSS brain pulses + glassmorphic). Full 21-dev/UI-UX team brief in `docs/superpowers/specs/2026-06-12-jarvis-memory-palace-team-brief.md`. This is the experience layer that makes "anyone wants to build their IS/OS on SIP" real. Obsidian bridge (mempalace-obsidian-bridge + /curate-recall + new starlight-network.base) is the immediate daily tool; r3f 3D palace is the long-term custom visualization.

### H3 — The network (months)
SIP as a real standard with multiple sovereign nodes:
- **Others publish their own scorecards** — the Proving Ground methodology adopted beyond Frank. A scorecard registry.
- **Contribution loop** — patterns, lanes, and adapters submitted back.
- **Starlight Intelligence Network / Starlight Network registered** (NAMING.md Fork 7, L99 2026-06-12). The open federation of sovereign humans + their IS/OS instances + attested artifacts + privacy-respecting memory + shared beautiful viz + transmissions. "Starlight Intelligence Network" for the full living network; "Starlight Network" for the protocol graph. Always SIP-attested. Build open for anyone.
- The mission realized: people **building their own systems**, attested with SIP, not consuming Frank's. The viz + gateway + memory compounding is the 10x that makes the substrate the obvious foundation.

## How the pieces connect (the wiring)

```
  CANON (truth)                 MEASUREMENT                 DISTRIBUTION
  ─────────────                 ───────────                 ────────────
  SIS repo (private+public)  →  Proving Ground (/starlight-eval)  →  starlightintelligence.org  (substrate surface)
  .md vaults + sovereign JSONL   tools/proving-ground/scorecards   →  frankx.ai                  (creator/distribution)
  (source of truth)              tools/arena/runs (model lane)     →  github.com/frankxai/starlight-evals (community mirror)
        │                              │                                      │
        └──── Starlight Queen routes every task by task-class ───────────────┘
              (routing-table.json, derived from scorecards + Cost Plane)
```

**Rule:** SIS is canonical origin; starlight-evals is a *published mirror*; the
sites are distribution. Sync flows one way (SIS → mirror → sites), never back.

## How we engineer/develop better

1. **Keep measure-first.** It caught my own overclaims (the Queen "loop", the A2
   violation) this cycle — that discipline IS the moat. Every claim ships with a
   receipt and a named weakness.
2. **Manual → automated.** The three "manual" admissions (Queen routing, cadence,
   deploy) are the next engineering frontier. Automate them *after* they're proven
   manually, not before.
3. **Connective tissue over new features.** The highest-leverage work now is wiring
   (RRF→router, sync automation, CI) — not new capability. The capability is ahead
   of the plumbing.
4. **Community-first framing.** Build every new surface asking "can a stranger fork
   and run this?" — that's the difference between sovereign-by-design and
   sovereign-in-practice.

## Community best state — the north star

The mission is **"help people build their own systems, not consume."** The eval
discipline is the perfect vehicle: it is not a product to consume, it is a
*methodology to adopt*. The community pitch is **"fork the harness, run it on YOUR
stack, publish YOUR receipts"** — and the honesty discipline (named weaknesses,
anti-Goodhart, mirror-not-origin) is what makes it trustworthy enough to spread.

Built on SIP — Starlight Intelligence Protocol.
