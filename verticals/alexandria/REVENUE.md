# REVENUE — Starlight Alexandria

> Streams, pricing posture and the experiment each one hangs on. Working positions, not commitments. No stream carries a number that a receipt has not produced.

---

## Principle

Alexandria does not sell rows. It sells three things the rows cannot give on their own: **selection** (a curated catalogue someone who runs the downstream systems maintains), **discipline** (price-before-run, fail-closed budgets), and **proof** (receipts a stranger can re-check). Every stream below is one of those three packaged for a buyer who already pays for data and still cannot trust a brief.

---

## Streams

| # | Stream | Buyer | What they get | Rail | Forge experiment | Status |
|---|---|---|---|---|---|---|
| 1 | **Receipted briefs** (subscription) | allocators, founders, creators | weekly brief per line (whale/allocator · frontier research · creator market) with receipt ids and signed footer | Polar subscription | `exp-2026-10-08-whale-brief-receipts` | proposed |
| 2 | **Pass-through API** | agents and builders | one capability, one price, one signed receipt per call; our budget gate in front of Firecrawl credits | Polar usage billing; x402 for agents (verify-only) | `exp-2026-10-08-pass-through-margin` | proposed |
| 3 | **Private intelligence office** (estate commission) | wealthy operators, family offices, founders | Alexandria wired into their own estate: private catalogue, private ledger, their vaults as native providers, Steward retainer | Tier 1 commission (`docs/monetization-tiers.md`) | `exp-2026-10-08-allocator-pilot` | proposed |
| 4 | **Bespoke receipted deep-dive** | same as 3, one-off | one question, one dossier, every claim receipted and signed | invoice | folded into 3 | proposed |
| 5 | **Provider listing** | Starlight itself | the estate's public research and metrics listed as providers in Alexandria-compatible catalogues; revenue share if the catalogue pays | partner terms | Library monthly reconcile | planned |
| 6 | **Content flywheel** | audience | receipted research → shorts, threads, newsletter; sponsorship prospects via `particle/advertising/show/prospects` | Creator IS; vidIQ; Postiz | Creator IS experiments | wired for drafts, human-gated for publish |
| 7 | **Cloud and model credits** | Starlight itself | startup and partner credit programmes fund Scribe batch passes and Forge bakeoffs | OCI, Vercel, Cloudflare, Supabase, Anthropic, OpenAI, Google programmes | Treasury quarterly review | apply and verify; no amounts assumed |

---

## Pricing posture

- **Briefs:** price per month `<placeholder>` until the pilot proves readership (falsifier in the experiment). Anchor: the brief must cost the reader less than the credits plus the hour it replaces, and more than the credits it consumes.
- **Pass-through:** per-call price = provider credits × margin + signing. Margin `<placeholder>` set by the Exchange experiment; floor is provider cost plus the receipt's signing and storage. Per-record capabilities (FullEnrich, PDL) are passed through at per-record price, never flat.
- **Estate commission:** inside the existing Tier 1 band in `docs/monetization-tiers.md` (€25k–€75k+ scoped). Alexandria is a module of that offer, not a new price list.
- **Credits:** Firecrawl's listed per-call prices are the only cost numbers in this vertical; they live in `providers.json` with `reconciledAt`.

---

## Unit economics shape (no numbers until receipts)

```
margin per brief = subscription − (credits × provider price) − model cost − signing/storage − verifier pass
margin per call  = (credits × provider price × margin) − signing/storage
margin per estate= commission − build hours − retainer cost of Steward
```

The Forge records the first real values; `MEMORY.md` carries them with dates.

---

## What is refused

- Selling raw provider rows outside the provider's terms.
- Any brief or endpoint presented as advice.
- Revenue projections in public copy. `METRICS_TRUTH.md` applies: "as of", ranges, last_verified.
- Autonomous money movement on any rail, including x402.

---

**Built on SIP** · `alexandria@v0.1` · SIP v1.1.1
