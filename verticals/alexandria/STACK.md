# STACK — Alexandria (inherits from substrate)

> Inherits root `STACK.md`. Overrides below are Alexandria-specific.

## Inherited
- **L0** GitHub · **L1** Claude (architecture, synthesis), Sonnet-class for volume · **L2** `MEMORY.md` + vaults; Supabase + pgvector at scale · **L3** Claude Code + Agent SDK · **L4** Vercel + Supabase + Cloudflare · **L5** creator distribution per FrankX stack · **L6** `/sip-attest` earned · `/starlight-board` substrate gate · `/openclaw-audit` pre-tag.

## Overrides
### L1 — Models (multi-runtime, by work type; `SWARM.md`)
Claude managed agents (synthesis) · OpenAI Agents / Responses with Structured Outputs (verification, Exchange handlers) · Gemini (long-context Scribe passes) · OpenRouter (volume, bakeoffs). The runtime that writes a claim never judges it.

### L2 — Memory
Receipts ledger: `~/.starlight/alexandria/receipts.jsonl` (local, append-only) → Supabase table at scale. Snapshots: Cloudflare R2, hash-named. Catalogue and experiments: this repo.

### L3 — Harness
`src/alexandria/mcp.ts` as the one door for every harness (Claude Code, Codex, Gemini CLI, managed agents). Session budget default 200 credits (`ALEXANDRIA_MAX_CREDITS`).

### L4 — Data transports
Firecrawl (search, scrape, Alexandria execution; `FIRECRAWL_API_KEY`) · native corpus (free) · partner catalogues (planned). Generation lanes and distribution rails are connectors (`catalog/connectors.json`), never transports.

### L6 — Trust
Declared receipt → signed receipt (`protocol/sign.mjs`, Ed25519/DSSE) → third-party re-check (`protocol/verify.mjs`). Exchange resells signed only.

### L7 — Money (new row for this vertical)
Polar (subscriptions, usage) · Stripe when eligible · x402/AP2 verify-only via payment-intelligence-system. No autonomous money movement.

**Built on SIP** · `alexandria@v0.1`
