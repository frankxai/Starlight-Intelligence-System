---
name: architect-entity
description: Produce an Entity Architecture Plan — current structure (if any), target structure, jurisdiction considerations, multi-entity question, holding-company question, and checklist for the lawyer conversation. Not legal advice; thinking architecture to bring into the room.
allowed-tools: Read, Write, Grep, Glob
argument-hint: person's name (required) + --jurisdiction <NL|US-DE|US-CA|UK|DE|other|agnostic> + --structure-type <solo|partnership|agency|holding> + optional context paragraph
---

# /architect-entity

Load `SIP.md`, `VOICES.md`, `agents/starlight-business.md`, `skills/business/entity-architecture.md`, and if present the person's Genius Profile (`genius/profile-<slug>.md`) and Freedom Path (`genius/freedom-path-<slug>.md`). Produce an **Entity Architecture Plan**. Hand off to exactly one next command.

## Disclaimer (non-waivable)

**This is thinking architecture, not tax/legal advice. Real decisions require a qualified professional in your jurisdiction.**

This command organizes your thinking before you talk to a lawyer. It does not replace the lawyer. It does not prescribe an entity. It surfaces trade-offs and produces a checklist so the professional conversation is efficient and specific.

## Input
$ARGUMENTS

## Flags

- `--jurisdiction <NL|US-DE|US-CA|US-other|UK|DE|other|agnostic>` — which jurisdiction the entity will operate in. If `agnostic`, output uses `<jurisdiction-specific>` placeholders throughout. If the person operates in multiple jurisdictions, pass the primary and flag multi-jurisdictional exposure in the optional context paragraph.
- `--structure-type <solo|partnership|agency|holding>` — what shape the business actually is:
  - `solo` — one-person practice, one revenue stream or a few, no employees
  - `partnership` — two or more owners with shared ownership
  - `agency` — service business with contractors or employees, multiple clients
  - `holding` — multiple brands or operating companies, IP/asset separation question is live

## Process

1. **Disclaim.** Open the output with the non-waivable disclaimer. Structurally first, always.

2. **Locate.** Confirm jurisdiction from `--jurisdiction` flag. Confirm structure-type from `--structure-type` flag. If jurisdiction is `agnostic`, explicitly flag that the Plan uses jurisdiction-placeholders and recommend re-running with a specific jurisdiction once chosen.

3. **Read.** If a Genius Profile exists at `genius/profile-<slug>.md`, read it and note KEEP/DELEGATE/AUTOMATE/KILL buckets — they inform whether an agency (many DELEGATE-bucket executors needed) vs solo (KEEP-bucket dominant) structure fits.

4. **Current state.** Identify what structure the person currently runs (if any). Common answers: "running everything through my personal account," "I have a dormant LLC from 2019," "I have a ZZP but I'm hitting the tax ceiling," "I have a BV but the structure feels wrong."

5. **Target state.** Using the entity-architecture protocol (jurisdiction → ownership → liability → tax treatment → growth optionality → holding structure), surface the target structure *as a trade-off map*, not a prescription.

6. **Multi-entity question.** If `--structure-type holding` or if the person's Freedom Path shows multiple brands, produce the umbrella-vs-entity-per-brand-vs-holding analysis.

7. **Tax entity selection.** Surface pass-through vs corporate taxation questions relevant to the chosen jurisdiction. Never prescribe; name the question and what the professional will weigh.

8. **Lawyer checklist.** Produce the specific list of questions the person brings into the lawyer consultation. This is the load-bearing output — the Plan's value is measured by how much more efficient the professional conversation becomes.

9. **Save.** Create `business/` directory if missing. Write `business/entity-<person-slug>.md`. Personal architecture data lives in the person's instance only; do not write to any public vault.

10. **Hand off.** Name exactly one next move:
    - Take to lawyer in `<jurisdiction>` → Entity Architecture Plan attached (the default — this is the whole point)
    - Revenue model first → `/model-revenue` (if revenue shape is unclear before entity choice)
    - Tax readiness → `/tax-sanity` (if the question is "am I ready for the accountant conversation")

## Output format

```markdown
# Entity Architecture Plan — <Person Name> — <YYYY-MM-DD>

> **This is thinking architecture, not tax/legal advice. Real decisions require a qualified professional in your jurisdiction.**

## Context

- **Jurisdiction:** <NL | US-DE | US-CA | UK | DE | other | agnostic>
- **Structure-type:** <solo | partnership | agency | holding>
- **Multi-jurisdictional exposure:** <yes — list jurisdictions / no>
- **Current structure (if any):** <e.g., "ZZP in NL since 2021" / "single-member LLC in DE formed 2023" / "none — all personal account" / "C-corp in CA, inactive since 2022">
- **Freedom Path buckets referenced:** <yes — summarize KEEP/DELEGATE mix / no Profile yet>

## Current state

<Narrative paragraph: what entity structure exists today, what revenue flows through which entity (or through personal), what concentration risks or tax concerns are visible. 3–6 sentences. Honest, specific, no prescription.>

## Target state — trade-off map

For each candidate structure, surface what it gives and what it costs. Never prescribe. These are the options the lawyer will walk through; the Plan makes the walk faster.

### Option A: <candidate structure name, jurisdiction-specific>
- **Gives:** <liability posture, tax treatment category, investor friendliness, admin load>
- **Costs:** <setup cost <jurisdictional>, annual filing cost <jurisdictional>, ongoing complexity>
- **Growth optionality:** <what this supports 3 years out; what it does not>
- **Lawyer question this raises:** <one specific question>

### Option B: <candidate structure name>
- **Gives:** <...>
- **Costs:** <...>
- **Growth optionality:** <...>
- **Lawyer question this raises:** <...>

### Option C: <candidate structure name>
- **Gives:** <...>
- **Costs:** <...>
- **Growth optionality:** <...>
- **Lawyer question this raises:** <...>

(Typically 2–4 options. No more. Optionality overload defeats the Plan.)

## Multi-entity question (if applicable)

<Only include if --structure-type holding OR if Genius Profile reveals multiple brands.>

The person operates <N> brands: <list>. Three structural patterns to evaluate:

1. **Umbrella (one entity, brands as DBAs):** simpler admin, commingled liability, harder to sell one brand.
2. **Entity-per-brand (no holding):** clean separation, higher admin load, harder IP centralization.
3. **Holding + operating (holding owns IP, operating entities license and deliver):** investor-friendly, IP-centralized, complex setup, earned complexity.

The Frank pattern is (3) — Starlight Holding BV over Arcanea BV and personal brand flowing through ZZP migrating into a sub-structure. It is not the default; it is earned by scale.

**For this person's stage, the trade-off weighted toward:** <analysis, not prescription>.

**Lawyer question this raises:** "What is the cost and timeline of moving from `<current>` to each of the three patterns in `<jurisdiction>`, and what are the tax consequences of the transition itself?"

## Tax entity selection (surface — not advice)

Within the chosen entity class, there may be a tax-election question. Examples:

- **US LLC:** single-member LLC defaults to pass-through (disregarded). Can elect S-corp taxation (potential self-employment tax savings above certain income levels — accountant calculates). Can elect C-corp taxation (rare for solos; reasons exist).
- **NL BV:** vs ZZP. BV adds corporate layer + DGA salary requirement (minimum salary the founder pays themselves from the BV — the specific number is an accountant conversation and shifts). Crossover point depends on income.
- **UK Ltd:** vs sole trader. Crossover depends on income level + dividend strategy + pension contribution.
- **DE GmbH:** vs Einzelunternehmer or UG. Crossover depends on income + reinvestment plans.
- **Other jurisdictions:** `<jurisdiction-specific>` — accountant will map.

**Lawyer / accountant question:** "At my current revenue of `<amount>` and projected revenue of `<amount>` in 12 months, is `<current or proposed entity>` the right tax-treatment category — or should we be considering `<alternative>`?"

## Lawyer conversation checklist

Take this list into the consultation. It makes the hour efficient.

**Structure:**
- [ ] Is `<target structure>` the right container for my business at my current stage and 12-24 month horizon?
- [ ] What are the jurisdictional formation costs, annual filing costs, and ongoing compliance obligations for this structure in `<jurisdiction>`?
- [ ] How long does formation take, and what happens to my revenue in the transition period?

**Liability:**
- [ ] What corporate formalities do I need to respect to preserve limited liability?
- [ ] Do I need separate bank accounts, separate contracts, separate invoicing workflows?
- [ ] Are there insurance requirements or industry-specific liability considerations?

**Tax treatment:**
- [ ] Given my revenue level and projection, what is the tax-treatment-category question (pass-through vs corporate; S-corp election; DGA salary; etc., jurisdiction-specific)?
- [ ] When do I pay taxes, how often, and what is the quarterly-estimated obligation if any?
- [ ] What tax-structure moves at my current level would I regret not making in 12-24 months?

**Multi-entity (if applicable):**
- [ ] Should the IP (canon, trademarks, content library) live in a holding or in the operating entity?
- [ ] If I form a holding later, what is the cost and tax consequence of transferring IP in from the current operating entity?

**Growth optionality:**
- [ ] If I hire my first employee (or first W-2/contractor beyond simple 1099), what does that require structurally?
- [ ] If I take investment, what structural prerequisites apply?
- [ ] If I sell the business in 3-5 years, what entity shape gives the cleanest sale?

**Multi-jurisdictional (if applicable):**
- [ ] I operate in `<list of jurisdictions>`. Which professional covers which; do I need a coordinator; what are the nexus questions I should expect?

## Load-bearing next move

**`<one command or one action>`** — `<one-line rationale>`.

Default: **Book a lawyer consultation in `<jurisdiction>`. Bring this Plan.**

Alternative next moves (only if the Plan surfaces a gap):
- `/model-revenue <person-slug>` — if the revenue shape must be mapped before the entity question is ripe
- `/tax-sanity <person-slug> --jurisdiction <x>` — if the question is really "am I ready for the accountant"
- `/discover-genius <person-slug>` — if there's no Genius Profile and the KEEP/DELEGATE/AUTOMATE mix is undefined (rare; usually revenue shape forces this upstream)

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4 (BIS alpha, Layer 4)
- Generated: <ISO date>
---
```

## Rules

- **Disclaimer at top, always.** Non-waivable. First line of every output after the title.
- **Never prescribe an entity.** Surface trade-offs, checklist the lawyer question. The professional prescribes.
- **Never invent tax rates, formation fees, or jurisdictional numbers.** Use `<jurisdiction-specific>` placeholders until the professional fills them in.
- **Personal instance only.** Write to `business/entity-<slug>.md` in the person's instance; never to a public vault.
- **One hand-off at close.** Default is "take it to a lawyer." Only offer alternatives if the Plan surfaces a specific upstream gap.
- **Compose with Genius Profile when available.** KEEP-heavy profiles point toward solo or simple LLC/BV. DELEGATE-heavy profiles raise the agency structure. Multiple brands in the Profile raise the holding question.
- **If `--jurisdiction agnostic`, the output carries placeholders throughout and explicitly tells the person to re-run with a specific jurisdiction once chosen.**

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (BIS alpha, Layer 4)
- Generated: 2026-04-24
---
