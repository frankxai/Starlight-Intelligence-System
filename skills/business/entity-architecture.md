---
name: business/entity-architecture
domain: business
description: Organize thinking about legal entity structure — sole prop vs LLC vs corp vs BV (Netherlands) vs LLP, single-member vs multi-member, entity-per-brand vs umbrella. Not legal advice; framework for the conversation with a lawyer.
triggers:
  keywords: ["entity structure", "LLC", "BV", "sole proprietor", "corporation", "holding company", "legal entity", "tax entity", "business structure", "incorporate"]
  agents: ["starlight-business", "starlight-navigator"]
  intents: ["business", "entity", "incorporation"]
priority: high
load_level: core
---

# Entity Architecture

> *"The entity is not the business. The entity is the container. Shape the container around the business, not the business around the container."*

**Disclaimer (non-waivable):** This is thinking architecture, not tax/legal advice. Real decisions require a qualified professional in your jurisdiction.

## Purpose

Every sovereign person running revenue through their own name, a spouse's account, a dormant LLC from 2019, or a BV their accountant opened hastily in June — is running *some* entity structure. The question is not whether you have one; it is whether the one you have fits the business you actually run. Entity architecture is the thinking layer that answers "what container shape serves this business at this stage, in this jurisdiction, for where it is going?"

This skill does not prescribe entities. It surfaces the trade-offs so the person walks into their lawyer prepared. Lawyers are expensive because each consultation assumes you have organized your question. Most people have not. This skill closes that gap.

## Activation

**Fires when:**
- `/architect-entity` is invoked
- Any mention of "should I incorporate", "what entity", "LLC or corp", "sole prop or LLC", "BV", "GmbH", "Ltd", "holding company", "single-member", "multi-member"
- Downstream of `/discover-genius` when a Freedom Path reveals real revenue and no formal structure
- A multi-brand creator asks about umbrella vs entity-per-brand (the Frank pattern: Arcanea + Starlight + FrankX)

**Does NOT fire when:**
- The person is asking for tax filing advice (refuse; route to qualified professional)
- The person is asking for a specific jurisdictional entity formation SOP (refuse; that is professional execution, not architecture)
- The person has no revenue and no imminent plans to generate it — entity architecture before revenue is premature optimization

## Protocol

### Step 1 — Jurisdiction awareness

Ask once, clearly: "What jurisdiction are you operating from, or planning to operate from?" Common answers:

- **NL (Netherlands):** ZZP (sole proprietor), BV (Besloten Vennootschap — private limited), stichting (foundation), cooperative
- **US — state-specific:** sole prop, LLC (single-member or multi-member), S-corp election, C-corp, LP/LLP; state choice matters (DE, CA, WY most common for online founders)
- **UK:** sole trader, Ltd (limited company), LLP, PLC
- **DE:** Einzelunternehmer, UG (mini-GmbH), GmbH, GmbH & Co. KG
- **Other:** work in jurisdiction-agnostic mode with `<jurisdiction-specific>` placeholders

If the person operates in multiple jurisdictions (digital founder in NL with US customers and a UK reseller), flag multi-jurisdictional exposure as a dedicated lawyer question — do not attempt to architect across jurisdictions unilaterally.

### Step 2 — Ownership structure

Who owns this? Clarify:

- **Single-owner:** one person, one signature, one tax line. Simplest. Least flexibility.
- **Multi-owner:** partners, co-founders, spouse co-ownership (jurisdictional implications vary wildly). Requires partnership agreement or shareholder agreement.
- **Nominee / trust structures:** advanced; flag for lawyer.

Name the ownership reality before designing the entity. Most "what entity should I form" questions collapse when ownership is drawn honestly.

### Step 3 — Liability analysis

What is the person's personal exposure if the business is sued, defaults, or triggers a regulatory action?

- **Sole prop / ZZP / Einzelunternehmer:** personal liability is the default. The business *is* you.
- **LLC / BV / Ltd / GmbH:** limited liability is the headline feature — if respected (corporate formalities, separation of finances, proper documentation).
- **Corp (C-corp / S-corp):** limited liability + different tax treatment + more formality.

Surface the asymmetry: limited liability matters most when (a) the business interacts with many customers/clients who could claim damages, (b) the business carries inventory or physical-world risk, (c) the business hires employees or contractors at scale. Limited liability matters less when the business is a single-creator advisory practice with clean contracts and no employees — though the trade-off is jurisdiction-specific.

### Step 4 — Tax treatment surface

**Never prescribe a rate or outcome.** Surface the structural questions:

- **Pass-through taxation** (sole prop, single-member LLC by default, LLP, S-corp election in US): income flows to personal return, taxed at personal rates.
- **Corporate taxation** (C-corp in US, BV in NL, GmbH in DE, Ltd in UK): entity pays tax, then dividends to owner may be taxed again (the "double-tax" concept).
- **Hybrid elections:** US S-corp election on an LLC; NL BV vs ZZP with the DGA threshold question; others jurisdiction-specific.

Output frame: "These are the tax-treatment categories your lawyer/accountant will discuss with you. Here's what shifts between them in principle — the numbers they will give you." Never invent the numbers.

### Step 5 — Growth optionality

Where is this business headed? The entity should fit the horizon, not just today:

- **Staying solo, low-six-figure revenue, no employees:** often sole prop or single-member LLC is sufficient (jurisdictional).
- **Planning to hire, scale, take on investment:** entity structure that supports equity grants, option pools, investor participation is usually required earlier than founders think.
- **Planning to license IP across multiple brands:** holding structure becomes relevant — the holding owns IP, the operating entities license it.
- **Planning to sell the business:** the entity at time of sale has enormous tax implications — lawyer conversation, not skill conversation, but flag it now.

Growth optionality changes the entity decision. "What fits today" ≠ "what fits three years from now" — and changing entities mid-flight is expensive.

### Step 6 — Holding structure question

For founders with multiple brands or revenue streams, the holding-vs-operating question appears:

- **Umbrella (one entity, multiple brands as DBAs):** simpler, one tax return, one bank account, one admin load. Downsides: commingled liability, harder to sell one brand without the others, harder to take investment into one brand.
- **Entity-per-brand (multiple operating entities, no holding):** clean brand separation, liability separation, easier sale of one. Downsides: multiple tax returns, multiple admin loads, multiple formation costs.
- **Holding + operating entities (the classic creator-founder pattern):** holding owns IP and shares, operating entities run each brand and license from holding. Clean for scale, investor-friendly, tax-structurally interesting depending on jurisdiction. Downsides: setup complexity, ongoing complexity, over-engineering risk for early-stage founders.

The Frank pattern — Starlight Holding BV at the top, Arcanea BV underneath operating the canon/IP business, FrankX as personal brand through ZZP migrating into a sub-structure — is one example of this third pattern. It is not the default. Most solo founders start with sole prop or single-member LLC and migrate into holding structures only when the complexity is earned.

## Decision Matrix Template

```
| Axis                        | Sole Prop / ZZP | LLC (SM)  | LLC (MM) | BV / GmbH / Ltd | Corp (C/S-corp) | Holding + Op |
|-----------------------------|-----------------|-----------|----------|-----------------|-----------------|--------------|
| Personal liability          | Yes             | Limited*  | Limited* | Limited*        | Limited*        | Limited*     |
| Tax treatment (default)     | Pass-through    | PT        | PT       | Corp            | Corp / PT elect | Jurisdictional|
| Setup complexity            | Minimal         | Low       | Low-Med  | Medium          | Medium-High     | High         |
| Ongoing admin load          | Minimal         | Low       | Medium   | Medium          | High            | High         |
| Investor friendliness       | None            | Low       | Medium   | Medium-High     | High            | High         |
| Multi-brand clean separation| No              | Partial   | Partial  | Partial         | Partial         | Yes          |
| IP centralization           | No              | No        | No       | Partial         | Partial         | Yes          |
| Formation cost              | <jurisdictional>| <j>       | <j>      | <j>             | <j>             | <j>          |

* Limited liability only if corporate formalities are respected. A commingled LLC
  can be "pierced" and treated as sole prop. Talk to your lawyer.
```

Populate the matrix with the person's jurisdictional specifics. Do not invent formation costs or tax rates — use `<jurisdictional>` placeholders until the professional fills them in.

## Rules

1. **Disclaimer-first.** Every output opens with the non-waivable disclaimer. No exceptions.
2. **Never prescribe an entity.** Surface trade-offs; the lawyer prescribes. "Here's what an LLC gives you and costs you in your state" beats "form an LLC."
3. **Jurisdiction-agnostic defaults.** Never assume US, NL, or any single jurisdiction. Ask once, then scope to that jurisdiction explicitly. If none given, use `<jurisdiction-specific>` placeholders throughout.
4. **Never invent numbers.** Tax rates, formation fees, annual filing costs, deduction amounts — all `<jurisdiction-specific>`. The professional fills them in.
5. **Multi-entity thinking for multi-brand creators.** If the person runs ≥2 brands, surface the umbrella-vs-per-brand-vs-holding question explicitly. Do not default to umbrella; do not default to holding.
6. **Growth optionality is a first-class input.** Ask where the business is headed before answering "what entity." Entities that fit today may be expensive to change later.
7. **One hand-off at close.** The output ends with "take this to a lawyer in `<jurisdiction>`" and names the Entity Architecture Plan artifact. Not a menu of lawyers, entities, or next commands.

## Output Shape

See `.claude/commands/architect-entity.md` for the full Entity Architecture Plan schema. Saved to `business/entity-<person-slug>.md` in the person's instance only — never in a public vault.

## Built on SIP

This skill composes with SIP protocol elements:
- Sovereignty clause (non-waivable, person owns their architecture; Business reveals, does not transfer)
- File contract (`business/` namespace, `entity-<slug>.md`)
- Attestation (every Plan ships with "Built on SIP" block)
- Voice archetypes — architect primary, sovereign-creator warmth

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4 (BIS alpha, Layer 4)
- Generated: 2026-04-24
---
