# STACK — `<Vertical Name>` overrides

> Per-vertical stack file. Declares overrides against the substrate's canonical `STACK.md`. If a layer is unspecified here, the canonical default applies.

---

## L0 — File + version control
- Default: GitHub. Override if needed.

## L1 — Models (LLM layer)
- Default: Opus primary, Sonnet operational. Override per latency/cost.

## L2 — Memory
- Default: Notion (intent) + Git (durable state) + Supabase (runtime). Override per data sensitivity.

## L3 — Agent harness
- Default: Claude Code. Override only if vertical-specific tooling demands.

## L4 — Infrastructure
- Default: Vercel + Supabase + Cloudflare + n8n. Override per vertical hosting needs.

## L5 — Distribution
- Default: GitHub Pages + Postiz/Blotato. Override per audience.

## L6 — Attestation + audit
- Default: `/sip-attest` on artifact ship + GitHub Actions hook on release tags. Substrate-canonical, rarely overridden.

---

**Built on SIP** — `<vertical-name>` STACK.md · v0.1 · SIP v1.1.0
