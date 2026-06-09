---
name: model-revenue
description: Produce a Revenue Model — current revenue map by stream, target revenue map, concentration risk flags, margin analysis, unit economics, growth-curve shape per stream, compounding-vs-linear assessment. Composes with Genius Profile Freedom Path buckets. Not financial advice.
allowed-tools: Read, Write, Grep, Glob
argument-hint: person's name (required) + optional context paragraph describing current streams and target state
---

# /model-revenue

Load `SIP.md`, `VOICES.md`, `agents/starlight-business.md`, `skills/business/revenue-modeling.md`, and if present the person's Genius Profile (`genius/profile-<slug>.md`) and Freedom Path (`genius/freedom-path-<slug>.md`). Produce a **Revenue Model**. Hand off to exactly one next command.

## Disclaimer (non-waivable)

**This is thinking architecture, not tax/legal/financial advice. Real decisions require a qualified professional in your jurisdiction.**

This command organizes your revenue thinking. It maps what exists, reveals what is capped by your time vs. what compounds, flags concentration risk, sets margin floors. It does not prescribe what to sell, price, or cut. You make those calls; the map makes them legible.

## Input
$ARGUMENTS

## Process

1. **Disclaim.** Open every output with the non-waivable disclaimer.

2. **Load context.** Read Genius Profile + Freedom Path if present. Revenue streams will be mapped to KEEP/DELEGATE/AUTOMATE/KILL buckets using the Profile's taxonomy. If no Profile exists, flag it in the output and note that excavation-first typically produces sharper revenue design — but proceed if the person has provided enough revenue data.

3. **Current revenue audit.** For each active stream, collect:
   - Stream name (internal label)
   - Customer count (last 12 months)
   - Gross revenue (last 12 months)
   - Delivery time (hours/month spent)
   - Bucket alignment (KEEP/DELEGATE/AUTOMATE/KILL) if Profile exists
   - Primary + secondary revenue archetype (from library: product, service, subscription, license, royalty, advisory, affiliate, sponsorship, community, productized consulting, group program, book/evergreen)

   If the person cannot provide enough data, halt and request the missing data. Never model forward from an unmapped present.

4. **Unit economics per stream.** For each stream, surface:
   - Unit of sale, unit price, unit cost to deliver, unit gross margin, time per unit

5. **Margin analysis.** Compare each stream's gross margin to its floor (knowledge products ≥60%, service ≥40%, subscription/membership ≥50%, etc.). Flag any stream below its floor.

6. **Compounding shape per stream.** Tag each stream linear-to-time / linear-to-team / compounding / decaying. Note that `compounding` is a claim requiring evidence — tag as `compounding?` until validated by ≥3 months of growth independent of added hours.

7. **Concentration risk.** Calculate revenue share of largest client and largest stream. Flag explicitly if >40% (single client or single stream).

8. **Target revenue map.** Design the 12-month or 24-month target — which streams to grow, maintain, shrink, kill, add. Map target streams to Freedom Path buckets. Target shape, not target number.

9. **Spreadsheet template.** Output a markdown table structure the person can paste into Excel / Google Sheets / Airtable and populate numerically. The skill produces the *shape*; the person produces the numbers in their own tool.

10. **Save.** Create `business/` directory if missing. Write `business/revenue-<person-slug>.md`. Personal instance only; never public vault.

11. **Hand off.** Name exactly one next move:
    - Capital allocation → `/wealth-dpi` (once revenue shape is defined, allocation of the flow is Wealth IS territory)
    - Entity architecture → `/architect-entity` (if the revenue shape implies an entity question not yet answered)
    - Content/creator pipeline → `/creator-pipeline` (if target state requires building the content side of compounding streams)
    - Executor training → `/train-executor` (if DELEGATE-bucket streams need SOP production to scale)
    - Productized offer design → `/content-systemize` (if a KEEP stream should be productized)

## Output format

```markdown
# Revenue Model — <Person Name> — <YYYY-MM-DD>

> **This is thinking architecture, not tax/legal/financial advice. Real decisions require a qualified professional in your jurisdiction.**

## Context

- **Genius Profile referenced:** <yes at genius/profile-<slug>.md | no — flag excavation recommendation>
- **Currency of reporting:** <EUR / USD / GBP / other>
- **Reporting period:** <last 12 months ending YYYY-MM-DD>
- **Horizon for target state:** <12 months | 24 months>

## Current revenue map

| Stream | Archetype | Customers | Gross (LTM) | Hours/mo | Unit Price | Unit Margin | Bucket | Compounding shape | Flags |
|--------|-----------|-----------|-------------|----------|------------|-------------|--------|-------------------|-------|
| <name> | <arch> | <N> | <amount> | <hrs> | <price> | <%> | KEEP/DEL/AUT/KILL | linear-to-time / linear-to-team / compounding / decaying | margin-below-floor / concentration / healthy |
| <name> | <arch> | <N> | <amount> | <hrs> | <price> | <%> | ... | ... | ... |

**Total LTM revenue:** <amount>
**Total delivery hours/month:** <hrs>
**Effective blended rate:** <amount/hr>

## Unit economics (per stream)

### Stream 1: <name>
- Unit: <a retainer month / course seat / coaching session / etc.>
- Unit price: <amount>
- Unit cost to deliver: <amount — direct costs: contractor, software, merchant fees, fulfillment>
- Gross margin: <%> (floor for this archetype: <%> — status: <meets / below>)
- Time per unit: <hours>
- Implied hourly rate on delivery: <amount/hr>

### Stream 2: <name>
<same structure>

(one section per stream)

## Margin floor analysis

| Stream | Archetype | Current margin | Floor | Status | Recommendation |
|--------|-----------|----------------|-------|--------|----------------|
| <name> | <arch> | <%> | <%> | meets / below | healthy / raise price / reduce cost / recategorize / kill |

## Compounding vs. linear assessment

- **Linear-to-time revenue (capped by your hours):** <list streams> — <total LTM amount + % of total>
- **Linear-to-team revenue (capped by team capacity):** <list streams> — <total LTM amount + %>
- **Compounding revenue (decoupled from hours):** <list streams> — <total LTM amount + %>
- **Decaying revenue (falling without re-investment):** <list streams> — <total LTM amount + %>

**Leverage observation:** <one or two sentences naming what the shape reveals. Example: "78% of revenue is linear-to-time, which means you are currently trading hours for money at an expert rate. The compounding share sits at 4% — the leverage is there to build, not yet built.">

## Concentration risk

- **Largest single client:** <name or anonymized> — <%> of revenue
- **Largest single stream:** <stream name> — <%> of revenue
- **Status:** <diversified < 20% / elevated 20-40% / concentration-risk >40%>
- **If >40%:** diversification timeline required. Candidate: <one specific move, e.g., "add a productized consulting offer to convert retainer overflow into AUTOMATE-bucket flow within 6 months.">

## Freedom Path bucket mapping

| Bucket | LTM revenue | % of total | Streams in this bucket |
|--------|-------------|------------|------------------------|
| KEEP (genius work) | <amount> | <%> | <list> |
| DELEGATE (executor work) | <amount> | <%> | <list> |
| AUTOMATE (system work) | <amount> | <%> | <list> |
| KILL (compounds nothing) | <amount> | <%> | <list> |

**Bucket health:** <one paragraph. The composition diagnoses the leverage posture. Heavy KEEP = time-trapped expert. Heavy DELEGATE = agency on the person's shoulders. Heavy AUTOMATE = compounding practice. Heavy KILL = cleanup required before anything else.>

## Target revenue map — <12 or 24 months>

| Stream | Status | Target share | Bucket | Action |
|--------|--------|--------------|--------|--------|
| <name> | grow | <%> | AUTOMATE | <specific move> |
| <name> | maintain | <%> | KEEP | <specific move> |
| <name> | shrink | <%> | DELEGATE | <specific move> |
| <name> | kill | 0% | KILL | stop delivery at <date> |
| <new stream> | add | <%> | <bucket> | launch by <date> |

**Target shape:** <one or two sentences naming the compounding vs. linear composition at target — e.g., "Target composition shifts to 40% compounding / 35% linear-to-team / 25% linear-to-time, with concentration risk below 25% per stream."> Target numbers come from the person, not from this skill.

## Spreadsheet template (paste into Excel / Google Sheets / Airtable)

```
| Stream | Archetype | Customers | Gross LTM | Hours/mo | Unit Price | Unit COGS | Gross Margin % | Bucket | Compounding | Current/Target |
| ------ | --------- | --------- | --------- | -------- | ---------- | --------- | -------------- | ------ | ----------- | -------------- |
|        |           |           |           |          |            |           |                |        |             |                |
```

Additional sheet: **Monthly tracking**
```
| Month | Stream A revenue | Stream B revenue | Stream C revenue | Total | Hours spent | Blended rate/hr |
| ----- | ---------------- | ---------------- | ---------------- | ----- | ----------- | --------------- |
|       |                  |                  |                  |       |             |                 |
```

Additional sheet: **Client concentration**
```
| Client | Stream | LTM revenue | % of total | Renewal risk | Diversification move |
| ------ | ------ | ----------- | ---------- | ------------ | -------------------- |
|        |        |             |            |              |                      |
```

## Load-bearing next move

**`<one command>`** — `<one-line rationale>`.

Typical next moves:
- **`/wealth-dpi`** — if the revenue shape is clean and the next leverage is in how the *flow* allocates to compounding capital (DPI territory)
- **`/architect-entity`** — if the revenue shape reveals an entity question unresolved (e.g., retainer revenue suggests pass-through; product revenue suggests a holding company for IP)
- **`/creator-pipeline`** — if target state requires more compounding content streams and content production is underbuilt
- **`/train-executor`** — if DELEGATE-bucket streams are the scale path and executors are not yet trained
- **`/content-systemize`** — if a KEEP-bucket stream should be converted into a productized offer

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4 (BIS alpha, Layer 4)
- Generated: <ISO date>
---
```

## Rules

- **Disclaimer at top, always.** Non-waivable.
- **Never model forward from an unmapped present.** Halt if current data is insufficient; request what is missing.
- **Concentration risk >40%: always flag loudly.** Diversification timeline required.
- **Margins per stream, not averaged.** Each stream meets its floor or is recategorized.
- **Never invent a revenue number.** Use the person's numbers. Target numbers come from the person.
- **Compose with Genius Profile when available.** Bucket mapping is load-bearing for leverage analysis.
- **`compounding` requires evidence.** Tag as `compounding?` until ≥3 months of growth independent of added time.
- **Personal instance only.** Write to `business/revenue-<slug>.md`; never public vault.
- **One hand-off at close.** Collapse to one next command.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (BIS alpha, Layer 4)
- Generated: 2026-04-24
---
