# Intake — 2026-04-24 — frankx-adoption-deepening

## Inbound (paraphrased)

FrankX — personal architect brand, sovereign vertical per `VERTICALS.md`, the voice layer where SIP thought leadership, consulting funnel, and Vibe OS surfacing live — wants every public-facing artifact (essays, manifestos, newsletters, architectural diagrams) to carry "Built on SIP" as a real attestation, not a badge decoration. No canon adoption. FrankX composes with Arcanea only as case study. Primary surface: `frankx.ai`. Stack: Claude Code + Next.js + Vercel (manual deploy).

## Route

**C (vertical) — adoption deepening.** FrankX is already registered as an active sovereign vertical (personal architect brand). This intake moves FrankX from "attestation present in ATTESTATIONS.md for substrate ships" to "attestation present on every public artifact emitted under the FrankX voice layer." The gap between "FrankX talks about SIP" and "FrankX's artifacts are themselves SIP-attested" closes here.

## Track

**Builder.** This is the architect brand. The brand holder runs the terminal, ships the commits, and writes the prose. Builder track is the only coherent track.

## Voice assignments

- architect: **Frank** — primary. FrankX *is* the architect brand; this voice is the brand's load-bearing posture. First-principles, decision-first, normative over descriptive, no hedging when structurally avoidable.
- sovereign-creator: **Frank** — essays, manifestos, newsletters. First-person, direct, no listicles, publishing cadence held.
- protocol-defender: **Frank** — self-audit via `/openclaw-audit` before any public protocol-position essay ships. FrankX refuses to ship a protocol claim that FrankX's own audit command would flag.
- implementer: **Frank** — Claude Code + `frankxai/frankx` + `vercel --prod` from `site/`.
- overseer: **Lumina** — advisory only, via `/luminor-board` before positioning manifestos or protocol version-coupled essays.

FrankX is a one-human vertical. All five voices are Frank-held except overseer (Lumina, AI advisory). That's not a gap — that's the shape of the architect brand. A sovereign node can hold multiple voices; this is the canonical case.

## First commitment

- **Manifesto essay: "FrankX under SIP — The Architect Layer"** — a public positioning piece declaring FrankX as a sovereign vertical formally composed under SIP v1.1.0, naming the architect archetype as the brand's primary voice, committing to `/sip-attest` on every public artifact going forward, and demonstrating the attestation inline in the essay itself. Published to `frankx.ai/essays/architect-layer` with the `/sip-attest` block rendered at the foot of the post (not hidden in metadata — visible to every reader). **By 2026-05-08** (14 days — shorter horizon than Arcanea because the artifact is single-surface single-author).

The manifesto is not a launch announcement. It is the first public artifact where FrankX's declared posture and FrankX's shipped attestation are the same thing — closing the gap between "FrankX writes about the protocol" and "FrankX ships under the protocol."

## Next command

```
/sip-attest memory/intake/stamped-frankx-manifesto.md
```

Once the essay body lands in `frankxai/frankx/site/content/essays/architect-layer.mdx`, re-run against the final MDX and render the emitted block into the page footer at build time.

## Sovereignty note

Starlight does not own FrankX. The substrate is MIT; FrankX content is owned by Frank Riemer (transitioning to Arcanea BV operating entity post-June 1 per `VERTICALS.md`). FrankX composes with SIP as an adopter, not as a node folded into the substrate. Attribution via "Built on SIP" is the sole compounding mechanism. FrankX stays sovereign in its declared domain (protocol thought leadership, architect voice, consulting funnel, Vibe OS surfacing). Advice from Lumina, Luminor Board, or any downstream adopter never overrides Frank's editorial authority on FrankX surfaces. The substrate is the contract; the brand is the sovereign.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.3.1, frankxai/frankx@<site-head>
- Generated: 2026-04-24
---
