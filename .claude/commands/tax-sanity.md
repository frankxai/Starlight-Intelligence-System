---
name: tax-sanity
description: Tax awareness sanity-check (NOT tax advice). Walks through entity tax-efficiency, deductions, growth structure, quarterly estimateds, multi-jurisdiction, retirement/long-term questions. Produces a Tax Readiness Checklist for the person's meeting with their accountant.
allowed-tools: Read, Write, Grep, Glob
argument-hint: person's name (required) + --jurisdiction <NL|US-DE|US-CA|UK|DE|other|agnostic> + optional context paragraph
---

# /tax-sanity

Load `SIP.md`, `VOICES.md`, `agents/starlight-business.md`, `skills/business/entity-architecture.md`, `skills/business/revenue-modeling.md`, and if present the person's Genius Profile and any existing `business/entity-<slug>.md` or `business/revenue-<slug>.md`. Produce a **Tax Readiness Checklist**. Hand off to exactly one next move — usually: book the accountant.

## Disclaimer (non-waivable — heavier than elsewhere)

**This is thinking architecture, not tax advice.**

- Tax is jurisdiction-specific and rule-specific. Rules change. Interpretations vary. Penalties are real.
- This command does not give tax advice and cannot give tax advice.
- Real decisions about your taxes require a qualified tax professional (accountant, tax attorney, Steuerberater, fiscalist, CPA, etc.) licensed in your jurisdiction.
- If any output of this command contradicts what your qualified professional tells you, trust the professional. They know the rules; this command knows the questions.

**What this command does:** It walks you through the common tax-adjacent questions a sovereign founder should be thinking about *before* the accountant meeting, so the meeting is specific, efficient, and reveals the right moves. Nothing here is a recommendation to take or skip any tax action.

## Input
$ARGUMENTS

## Flags

- `--jurisdiction <NL|US-DE|US-CA|US-other|UK|DE|other|agnostic>` — required to make the checklist usable. If `agnostic`, every jurisdictional note carries a `<jurisdiction-specific>` placeholder.

## Process

1. **Disclaim, heavily.** Open with the full disclaimer above. Not negotiable; the tax layer requires more friction before the user proceeds.

2. **Locate context.** Read jurisdiction flag. Load any existing `business/entity-<slug>.md` and `business/revenue-<slug>.md` if present — they inform the tax questions that apply.

3. **Walk the six question groups** (below). For each group, produce the questions the person should think about, and the corresponding question the accountant can actually answer.

4. **Save.** Write `business/tax-readiness-<person-slug>.md`. Personal instance only.

5. **Hand off.** Default: **Book an accountant consultation in `<jurisdiction>`. Bring this checklist.**

## Six question groups

### Group 1 — Entity tax-efficiency

Does my current entity structure match my revenue level and direction, taxed appropriately for my jurisdiction?

- Am I running revenue through the right entity class (sole prop / LLC / BV / Ltd / GmbH / corp)?
- Is my current tax-treatment category (pass-through vs corporate) appropriate for my revenue level?
- Is there a jurisdiction-specific election I might benefit from (US S-corp election on LLC, NL BV vs ZZP crossover, UK Ltd vs sole trader crossover, DE GmbH vs Einzelunternehmer)?
- Is there a structural move I'll regret not making at this revenue level in 12-24 months?

**Accountant question:** "At my current revenue of `<amount>` and projected revenue of `<amount>` over 12 months, is `<my current entity + tax treatment>` optimal — or is there a structural move you would recommend I evaluate?"

### Group 2 — Deduction hygiene (legitimate only)

Am I capturing all the deductions my jurisdiction legitimately allows for my business type?

Common categories to surface (jurisdictional applicability varies — **do not treat as a deduction list**):

- Home office — if jurisdictional rules permit and I have dedicated space
- Business-related software, subscriptions, tools
- Professional development (courses, conferences, books)
- Business meals and travel (jurisdictional limits + substantiation rules)
- Health insurance premiums (jurisdiction + entity dependent)
- Retirement plan contributions (jurisdiction + entity dependent)
- Equipment, hardware, computer
- Business-use portion of vehicle, phone, internet
- Professional services (accountant, lawyer, coaches)
- Continuing education in my field

**Accountant question:** "Given my entity structure in `<jurisdiction>` and my actual business activities, which deduction categories am I legitimately eligible for, and what documentation do I need to substantiate each?"

**Red line:** never invent a deduction amount or rate. Never claim a deduction is "safe" or "standard." That is the accountant's conversation. This command surfaces categories to ask about; the accountant validates what applies.

### Group 3 — Structure for expected growth

Is my current structure appropriate for where the business is headed, or will I need to re-structure mid-growth (expensive)?

- If I expect to double revenue in 12 months, does my entity still fit?
- If I plan to hire (W-2 employees, or equivalent in jurisdiction), what structural prerequisites apply?
- If I plan to take on investment or co-owners, what structural prerequisites apply?
- If I plan to exit/sell in 3-5 years, what entity and tax structure gives the cleanest outcome?
- If I plan to move jurisdictions (personal or business), what nexus or exit-tax considerations apply?

**Accountant / lawyer question (both):** "Given my 12-24-36 month plan (`<summary>`), what structural or tax-treatment changes would you recommend I make now to avoid more expensive restructuring later?"

### Group 4 — Quarterly / estimated payments

Am I structured and disciplined around periodic tax payments, or am I setting up a year-end surprise?

- Does my jurisdiction require quarterly (or other interval) estimated tax payments?
- Am I setting aside the right percentage of each payment received into a separate account for tax obligations?
- Do I have the right bookkeeping cadence (monthly close, not annual scramble)?
- Am I tracking obligations in real time, or reconstructing them in April / May / year-end?

**Accountant question:** "What is my estimated-payment schedule and amount for the rest of the year? What is the cash-flow discipline you would recommend — percentage to set aside from each payment, separate account structure, bookkeeping cadence?"

### Group 5 — Multi-jurisdictional exposure

If I operate across jurisdictions (customers, contractors, co-founders, physical presence), where are my tax obligations?

- Do I have customers in multiple countries or states — and does that create nexus/VAT/sales-tax obligations?
- Do I have contractors or employees in multiple jurisdictions — and does that create withholding or registration obligations?
- Am I personally resident in one jurisdiction while my business is incorporated in another — and is that structure clean?
- Do I have assets, IP, or bank accounts across jurisdictions, and do any require reporting (FBAR, CRS, similar)?

**Accountant / cross-border specialist question:** "Given my jurisdictional footprint `<list>`, which tax obligations apply where, which registrations do I need, and which reporting obligations do I have?"

**Note:** multi-jurisdictional tax is advanced. One generalist accountant may not cover all jurisdictions — ask whether a specialist or cross-border firm is required. This command strongly flags this route when multi-jurisdictional exposure is present.

### Group 6 — Retirement / long-term tax planning

Am I thinking about tax over my working life, or only this year?

- Is my entity structure compatible with tax-advantaged retirement accounts in my jurisdiction (solo 401k, SEP-IRA, pensioen-BV, SIPP, Rürup-Rente, etc.)?
- Am I making contributions at a level that balances current-year tax efficiency with long-term retirement security?
- Are there jurisdictional moves (exit tax, expat structures, residency changes) that a long-horizon plan should consider now?
- How does my long-term tax plan integrate with my broader capital-allocation plan (DPI, investments — Wealth IS territory)?

**Accountant / financial-planner question:** "Given my entity, jurisdiction, and income level, what retirement-account structures am I eligible for, what is the recommended contribution strategy, and how does this compose with my capital-allocation plan outside the business?"

**Hand-off:** long-term allocation of capital is Wealth IS / DPI territory. This command surfaces the tax-shape question; Wealth IS handles the allocation shape.

## Output format

```markdown
# Tax Readiness Checklist — <Person Name> — <YYYY-MM-DD>

> **This is thinking architecture, not tax advice. Real decisions require a qualified tax professional in your jurisdiction. If anything here contradicts what your accountant tells you, trust the accountant.**

## Context

- **Jurisdiction:** <NL | US-DE | US-CA | UK | DE | other | agnostic>
- **Entity (if known):** <from entity-<slug>.md if present>
- **Revenue shape (if known):** <from revenue-<slug>.md if present>
- **Multi-jurisdictional exposure:** <yes / no / unclear>

## Group 1 — Entity tax-efficiency

- [ ] Review entity class vs revenue level for `<jurisdiction>`
- [ ] Review tax-treatment category (pass-through vs corporate)
- [ ] Evaluate jurisdiction-specific elections <list applicable — S-corp, BV, Ltd, GmbH elections as relevant>
- [ ] Surface structural moves that would be expensive to delay

**Questions for accountant:** <list from Group 1>

## Group 2 — Deduction hygiene

Categories to ask about (jurisdiction-specific applicability — not a deduction list):

- [ ] Home office (if jurisdictional rules permit + dedicated space)
- [ ] Business software, subscriptions, tools
- [ ] Professional development
- [ ] Business meals and travel (per jurisdictional substantiation rules)
- [ ] Health insurance premiums (entity + jurisdiction dependent)
- [ ] Retirement plan contributions (entity + jurisdiction dependent)
- [ ] Equipment and hardware
- [ ] Business-use portion of vehicle / phone / internet
- [ ] Professional services (accountant, lawyer, coach)
- [ ] Continuing education

**Question for accountant:** <from Group 2>

**Red line:** never assume a category applies. Confirm with the professional.

## Group 3 — Structure for expected growth

- [ ] 12-24 month revenue trajectory and entity fit
- [ ] Hire prerequisites
- [ ] Investment / co-owner prerequisites
- [ ] Exit / sale horizon and entity shape
- [ ] Jurisdictional move implications

**Questions for accountant + lawyer (often both):** <from Group 3>

## Group 4 — Quarterly / estimated payments

- [ ] Confirm jurisdictional requirement and schedule
- [ ] Set aside discipline: % of each payment into separate tax account
- [ ] Bookkeeping cadence (monthly close recommended)
- [ ] Real-time tracking vs year-end scramble

**Question for accountant:** <from Group 4>

## Group 5 — Multi-jurisdictional exposure

**Applicable:** <yes / no>

If yes:
- [ ] Customer jurisdictions + VAT/sales-tax implications
- [ ] Contractor / employee jurisdictions + withholding / registration
- [ ] Personal residence vs incorporation jurisdiction
- [ ] Cross-jurisdiction reporting (FBAR, CRS, similar)

**Question for accountant / cross-border specialist:** <from Group 5>

**Specialist recommended:** <yes / no — default yes if ≥2 jurisdictions involved>

## Group 6 — Retirement / long-term tax planning

- [ ] Entity-compatible retirement structures in `<jurisdiction>`
- [ ] Contribution strategy vs current-year tax efficiency
- [ ] Long-horizon jurisdictional moves (exit tax, expat structures)
- [ ] Integration with capital-allocation plan (Wealth IS / DPI territory)

**Question for accountant / financial planner:** <from Group 6>

## Documents to gather before the meeting

- [ ] Last full year tax return (or equivalent in jurisdiction)
- [ ] Current-year-to-date revenue by stream (from revenue-<slug>.md if available)
- [ ] Current entity formation documents
- [ ] Bank statements for business account(s), last 12 months
- [ ] List of all contractors / employees / payments over `<jurisdictional-threshold>`
- [ ] Property / equipment purchases of note
- [ ] Retirement account statements
- [ ] Any cross-jurisdiction bank or investment accounts (with balances)

## Load-bearing next move

**Book an accountant consultation in `<jurisdiction>`. Bring this Tax Readiness Checklist.**

Alternative next moves (only if the checklist reveals a structural prerequisite):
- `/architect-entity` — if entity structure question is unresolved and the tax question depends on it
- `/model-revenue` — if revenue shape is unmapped and the tax-efficiency question cannot be answered without it
- `/wealth-dpi` — for long-term capital allocation after the tax shape is defined

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4 (BIS alpha, Layer 4)
- Generated: <ISO date>
---
```

## Rules

- **Disclaimer first, heavier than elsewhere.** Tax is the highest-stakes conversation in the Business layer. The disclaimer is structural and non-waivable.
- **Never invent a tax rate, deduction amount, or jurisdictional threshold.** Use `<jurisdiction-specific>` placeholders or say "accountant will confirm."
- **Never recommend taking or skipping a specific tax action.** Surface the question; the professional decides.
- **Multi-jurisdictional cases flag a specialist.** A generalist may not cover all jurisdictions.
- **Hand off to the accountant.** Default next move is book the meeting. Only offer alternatives if the checklist surfaces a structural prerequisite (entity unresolved, revenue unmapped).
- **Personal instance only.** Write to `business/tax-readiness-<slug>.md`. Never public vault.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (BIS alpha, Layer 4)
- Generated: 2026-04-24
---
