---
name: business/revenue-modeling
domain: business
description: Design and stress-test revenue streams — archetype selection, unit economics, margin floors, concentration risk, compounding-vs-linear assessment. Composes with Genius Profile Freedom Path buckets. Not financial advice.
triggers:
  keywords: ["revenue model", "pricing", "margin", "recurring revenue", "retainer", "productize", "concentration risk", "unit economics", "revenue streams", "monetize"]
  agents: ["starlight-business", "starlight-navigator"]
  intents: ["business", "revenue", "pricing", "monetization"]
priority: high
load_level: core
---

# Revenue Modeling

> *"Revenue is not the point. The shape of your revenue is the point. One million from one client is a job. One million from one thousand customers is a business. One million from a compounding asset is freedom."*

**Disclaimer (non-waivable):** This is thinking architecture, not financial advice. Real decisions require a qualified professional in your jurisdiction.

## Purpose

Most sovereign founders have a revenue number and a vague sense of "where it comes from." They do not have a revenue *map* — streams named, margins analyzed, concentration risks flagged, compounding shape labeled per stream. Without the map, every strategic decision (hire, incorporate, launch, kill) is made from a blur.

Revenue modeling is the skill of turning the blur into a map. The output is not a spreadsheet (spreadsheets are execution). The output is the *thinking* a spreadsheet will embody — what streams exist, which are capped by the person's time, which compound, which carry concentration risk, where the margin floors sit. Once the map exists, the spreadsheet is trivial and the strategy becomes legible.

Revenue modeling composes with Genius: every revenue stream maps to a Freedom Path bucket (KEEP / DELEGATE / AUTOMATE / KILL). KEEP revenue is inherently capped by the person's time. DELEGATE and AUTOMATE revenue decouple from time and are where leverage lives. Revenue modeling reveals where the person is spending their time to produce capped revenue that could be reshaped.

## Activation

**Fires when:**
- `/model-revenue` is invoked
- Any mention of "revenue streams", "pricing", "margin", "recurring revenue", "retainer", "productize", "monetize", "concentration risk", "unit economics"
- Downstream of `/discover-genius` when Freedom Path has named activities but revenue is unmapped
- The person has multiple revenue streams and asks "which should I grow"

**Does NOT fire when:**
- The person has zero revenue and no customers — revenue modeling before revenue exists is fiction (route to `/discover-genius` or `/creator-pipeline` first)
- The person is asking for investment advice on earned revenue — that is Wealth IS / DPI

## Protocol

### Step 1 — Current revenue audit

List every revenue stream currently active. For each:

- **Name** — what is this stream called internally ("Lighthouse retainer", "1:1 coaching", "Substack paid", "course evergreen")
- **Customer count** — how many distinct buyers/payers in the last 12 months
- **Gross revenue (last 12 months)** — total paid-in, before any costs
- **Delivery time** — hours per month the person spends delivering this
- **Bucket** (if Freedom Path exists) — KEEP / DELEGATE / AUTOMATE / KILL

If the person cannot answer any of these, the audit is incomplete — do not proceed to target state until current state is mapped. You cannot architect forward from a picture you have not drawn.

### Step 2 — Unit economics per stream

For each stream, surface the unit:

- **Unit of sale** — a retainer month, a coaching session, a course seat, a license, a book sold, a sponsorship slot
- **Unit price** — what one unit costs the customer
- **Unit cost to deliver** — direct cost to produce one unit (contractor time, software, merchant fees, fulfillment)
- **Unit gross margin** — (price − cost) / price, as percentage
- **Time per unit** — hours of the person's time to deliver one unit

The unit reveals everything. A €5,000 retainer at 20 hours/month is €250/hour. A €500 course seat at 0.1 hours/unit of attention is €5,000/hour equivalent (but with entirely different acquisition and capacity dynamics). Neither is "better" — the unit economics tell you *which is which*.

### Step 3 — Margin analysis + floors

For each stream, evaluate gross margin against floors. Defaults (adjustable per context):

- **Knowledge products (courses, books, templates, digital assets):** ≥60% gross margin. Below that, the production overhead is eating the economics. Fix the cost side or the price side.
- **Service work (advisory, consulting, coaching):** ≥40% gross margin. Below that, the person is effectively paying to work. Raise the price or reduce the cost.
- **Community / membership:** ≥50% gross margin. Below that, churn and support costs will crush the P&L.
- **Creator-economy sponsorship / affiliate:** margin is effectively 100% on the creator side (no COGS), but carries audience-trust cost that is not accounted for in gross margin — flag separately.

**Rule:** if any stream runs below its floor, flag it as "margin-compressed — fix or kill." Do not average margins across streams; individual streams must clear their individual floors or be recategorized.

### Step 4 — Compounding potential per stream

Tag each stream with its compounding shape:

- **Linear-to-time:** revenue scales only if the person spends more time (e.g., 1:1 coaching, retainer work). Caps at the person's available hours.
- **Linear-to-team:** revenue scales if DELEGATE bucket capacity scales (e.g., agency with trained executors). Caps at team capacity and management overhead.
- **Compounding:** revenue scales independently of hours worked after initial build (e.g., evergreen courses, royalties, subscription at scale, catalog IP, licensing). Caps at market size or distribution.
- **Decaying:** revenue falls over time without re-investment (e.g., one-shot launches, expiring licenses, deprecated products).

Composition with Genius: KEEP bucket work is typically linear-to-time (it is the person's irreplaceable labor). DELEGATE is linear-to-team. AUTOMATE is compounding. KILL produces decaying or negative-margin revenue. Revealing this mapping reveals where leverage lives.

### Step 5 — Concentration risk

Calculate: what percentage of total revenue comes from the single largest client or stream?

- **>40% from one client or stream:** **flag as concentration risk.** Any single event (client churn, contract dispute, platform change) can destroy the revenue base. This is the single most common failure mode for sovereign consultants graduating from agency life.
- **20–40%:** elevated risk; acceptable if the runway to diversify is explicit and timed.
- **<20% from any single source:** diversified. Sustainable.

Flag concentration risk explicitly in every Revenue Model output. "You are sovereign" is not true if one client can end you.

### Step 6 — Optimization + target revenue map

With current state mapped, design the target:

- **Which streams to grow** — typically compounding streams with strong margins and aligned with KEEP/AUTOMATE bucket
- **Which streams to maintain** — linear streams that fund the growth of compounding ones
- **Which streams to shrink or kill** — margin-compressed, bucket-misaligned, concentration-creating
- **Which new streams to add** — to reduce concentration, increase compounding share, or capture under-monetized genius

Output a target revenue map mirroring the current map structure, with a 12-month or 24-month horizon. Never promise a number; model the *shape* the person is aiming for.

## Revenue Archetype Library

| Archetype | Compounding shape | Typical margin floor | Bucket alignment |
|-----------|-------------------|----------------------|------------------|
| **Product (physical/digital)** | Compounding (digital) / Linear (physical w/ inventory) | 60% (digital), 30-40% (physical) | AUTOMATE (digital); DELEGATE (physical) |
| **Service (1:1)** | Linear-to-time | 40% | KEEP (diagnostic/creative) or DELEGATE (deliverable work) |
| **Subscription** | Compounding (if retention clears threshold) | 50% | AUTOMATE (with DELEGATE support layer) |
| **License (IP, canon, trademark, code)** | Compounding | 80-90% | AUTOMATE (after drafting the license) |
| **Royalty (music, book, content ID, sync)** | Compounding (long tail) | 90%+ on royalty side (pre-split) | AUTOMATE |
| **Advisory / retainer** | Linear-to-time, but anchored | 50-60% | KEEP |
| **Affiliate** | Linear-to-audience-size | 100% (no COGS) but trust cost | AUTOMATE (declared separately) |
| **Sponsorship** | Linear-to-audience-size | 100% (no COGS) but audience cost | AUTOMATE / KEEP (if the creator personally delivers) |
| **Community / membership** | Compounding (if retention works) | 50% | AUTOMATE + DELEGATE support |
| **Productized consulting** | Linear-to-delivery-capacity | 50% | DELEGATE (with KEEP-designed templates) |
| **Group program / cohort** | Linear-to-cohort | 60% | KEEP design + DELEGATE delivery |
| **Book / evergreen course** | Compounding (decaying without refresh) | 80%+ on owned distribution | AUTOMATE |

Use the library as a reference. Real streams often combine archetypes (e.g., a retainer with an IP license embedded, a community with productized consulting inside). Tag each real stream with its primary and secondary archetype.

## Output Shape

See `.claude/commands/model-revenue.md` for the full Revenue Model schema. Saved to `business/revenue-<person-slug>.md` in the person's instance only — never in a public vault.

## Rules

1. **Disclaimer-first.** Every output opens with the non-waivable disclaimer. No exceptions.
2. **Current state before target state.** Never design forward from an unmapped present. If the audit is incomplete, halt and request the missing data.
3. **Concentration risk is always flagged.** If any single client or stream >40%, flag it loudly in every output. Diversification timeline is mandatory once flagged.
4. **Margins per stream, not averaged.** Each stream clears its floor or is recategorized. Averaging hides the compressed streams.
5. **Compose with Freedom Path buckets.** If a Genius Profile exists, every revenue stream maps to a bucket. If no Profile, flag that excavation-first produces sharper revenue design — but proceed if requested.
6. **Compounding shape is a claim with evidence.** Tag a stream as "compounding" only if there is actual evidence (≥3 months of growth independent of additional time invested). Otherwise tag as "compounding?" until validated.
7. **Never invent a revenue number or growth rate.** Use the person's actual numbers. For target state, the person sets the target — the skill shapes the map, not the promises.
8. **One hand-off at close.** The output ends with either Wealth IS (allocate the flow), a specific revenue-build command (`/creator-pipeline`, `/content-systemize`), or an entity question (`/architect-entity`). One.

## Built on SIP

This skill composes with SIP protocol elements:
- Sovereignty clause (non-waivable, person owns their revenue model)
- File contract (`business/` namespace, `revenue-<slug>.md`)
- Attestation (every Revenue Model ships with "Built on SIP" block)
- Voice archetypes — architect primary, sovereign-creator warmth

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4 (BIS alpha, Layer 4)
- Generated: 2026-04-24
---
