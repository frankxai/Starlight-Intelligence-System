# Starlight Intelligence — Revenue Strategy

*Modeled 2026-06-26 · companion to `Starlight_Revenue_Simulator.xlsx` (this folder) and the `/pricing` page on the site.*

> This is a thinking instrument, not a forecast. Every number traces to an editable assumption in the simulator. Re-run it against real funnel data, monthly.

---

## 1. The core finding

The question was "should Starlight monetize like Immich?" The real answer: **the binding constraint is distribution, not the payment mechanism.**

Immich's voluntary buy page works because it sits on ~50k+ GitHub stars and a massive install base. Voluntary OSS supporter licenses convert at ~**1–5% of active users** at ~$25–29 each — that only becomes real money when the denominator is huge. Starlight is pre-scale, so a copy-Immich move generates **~$200–$4k/year**. Add it as a brand/goodwill flywheel; do **not** treat it as the engine.

The engine for the next 12–18 months is **Estate Factory services**. Product (Pro/Cloud) and content carry years 2–3.

---

## 2. Positioning wedge (grounded)

The agent-memory category is real and fast (~45% CAGR; AI agents market ~$5–8B (2025) → ~$50B by 2030) and well-funded: **Mem0 $24M / ~59k stars, Letta $10M, Cognee $7.5M, Supermemory $2.6M, Zep**. They are all **single-vendor, single-app-scoped**, and steer toward hosted storage.

**The open lane none of them occupy:**
1. **Cross-CLI, not per-app** — one substrate (MCP `sis_*`) for the whole fleet of coding agents an operator already runs.
2. **Sovereign by architecture** — local-first JSONL vaults, BYOK, protocol-level Exit clause (SIP §5.6). Your disk, not a vendor store.
3. **Governed execution (Hermes)** — memory that gates verified, attested PRs; no executor touches `main`. **No memory vendor ships a governed write-side loop.**
4. **Open protocol (SIP)** — a standard others can adopt, not just a product.

**Sharpest ICP:** the multi-CLI agent operator who wants to *own* their context, not rent it. High-ACV secondary: principals commissioning a sovereign agent estate.

**Honest caveat:** Starlight is bm25-only today (no embeddings until `sqlite-vec`). **Compete on architecture + governance + sovereignty, never on raw recall** until the semantic layer ships.

---

## 3. The revenue archetypes (ranked by fit)

| Stream | Time-to-cash | Role | Year-1 (Base) |
|---|---|---|---|
| **D — Estate Factory** (done-for-you + retainer) | Now | **Cash engine** | dominant |
| **E — Content / community / cohort** | 1–3 mo | Audience flywheel | growing |
| **B — Open-core Pro** (hosted sync, governed runners, SSO) | 3–6 mo | Long-term product engine | small |
| **A — Supporter license** (Immich model) | Now | Brand/goodwill halo | rounding error |
| **C — Managed Cloud** | 6–12 mo | Later optionality | ~0 |
| **F — Enterprise / SIP certification** | 6–12 mo | Opportunistic, lumpy | ~0 |

---

## 4. Calibrated projections (simulator defaults)

Three scenarios, 36 months, with S-curve growth decay (no runaway compounding):

| Scenario | Year 1 | Year 2 | Year 3 | 3-yr cumulative | Exit MRR (mo 36) |
|---|---|---|---|---|---|
| **Bear** | ~$20k | ~$29k | ~$35k | ~$85k | ~$1.2k/mo |
| **Base** | ~$163k | ~$304k | ~$430k | ~$897k | ~$22k/mo |
| **Bull** | ~$460k | ~$1.08M | ~$1.67M | ~$3.2M | ~$108k/mo |

**Shape that matters:** services dominate Year 1 in every scenario and fund the build; recurring product + content carry Years 2–3; the supporter license stays a rounding error throughout while building the brand that feeds the funnel. *(All figures are model outputs from editable assumptions — tune them.)*

---

## 5. Pricing (benchmarked + repo-grounded)

| Offer | Price | Benchmark / source |
|---|---|---|
| Supporter — Individual | **$29 one-time** | Immich/FUTO pay-once psychology |
| Supporter — Team | **$129/yr** | under Zep/Sidekiq $99/mo monthly anchors |
| Pro (open-core) | **$25/seat/mo** | between Letta $20 / LangSmith $39 |
| Team plan | **~$199–299/mo** flat (≤10 seats) | land-and-expand |
| Estate Factory | **from $25k** commission + **$2–5k/mo** retainer | repo `docs/monetization-tiers.md` (€25–75k) |

**Gate only marginal-cost / multiplayer features** (hosted sync, managed runners, SSO). Never gate local memory — the sovereignty clause forbids it.

**Sequencing (the repo's own anti-pattern note):** Service → Templates → Community → Platform. Don't lead with self-serve SaaS.

---

## 6. What to instrument (the levers that actually move the P&L)

Sensitivity (see simulator) shows the outcome is dominated by **service close-rate + lead flow** and **email-list growth** — not by any price. Track weekly:

- Funnel: GitHub stars, npm weekly downloads, site→email conversion, install→active-vault rate
- Services: leads/mo, discovery-call rate, call→close rate, ACV, retainer attach
- Product: Pro trial→paid, Pro churn, ARPU/seat
- Content: email net adds, community join/churn, course conversion

---

## 7. Next 90 days

1. **Ship `/pricing`** (done — supporter license live as goodwill layer + Pro waitlist + Estate CTA). Wire a real Stripe Payment Link / Polar checkout into the URL constants.
2. **Productize the Estate Factory offer** — packaged tiers, scope, sales one-pager. This is the cash engine; it's currently undocumented for buyers.
3. **Turn on the audience engine** — one content cadence (the wedge: "one governed brain for every CLI"), capture email, publish the Trinity case study.
4. **Instrument the funnel** — even a simple sheet of the metrics above, fed into the simulator monthly.
5. **Hold Pro/Cloud build** until the audience justifies it. Don't build the paywall before the audience.

---

## 8. Risks

1. **Retrieval-quality gap is visible** — ship `sqlite-vec` fast; never overclaim recall.
2. **The story reads as one person's bespoke system** — lead every public surface with the 60-second wedge; move lore/estate framing below the fold.
3. **Protocol network-effect may not fire** — prove it with 2–3 real external SIP adopters + the Trinity case study before betting positioning on the flywheel; keep standalone MCP value strong enough to win at adoption = 1.

---

*Sources: live competitor/market research (Mem0/Letta/Zep/Cognee/Supermemory pricing + funding, Grand View / MarketsandMarkets AI-agent TAM, Immich/FUTO + Sidekiq + Plausible OSS-monetization benchmarks), 2026-06-26. Repo grounding: `README.md`, `SIP.md`, `docs/monetization-tiers.md`, `docs/strategic/sip-web4-substrate-strategy.md`, `hermes/`.*
