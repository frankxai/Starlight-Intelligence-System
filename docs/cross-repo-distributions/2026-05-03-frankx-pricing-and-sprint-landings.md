# Cross-repo distribution — FrankX repo: pricing pages + sprint landing

> **Source:** `.intake/processed/2026-05-03/3 Chatgpt 02.05 - Copy - Copy.txt`
> **Target repo:** `C:\Users\frank\FrankX`
> **Status:** AWAITING manual move by Frank (sovereignty-aware — no auto-write)
> **Why this lives in `frankx.ai`, not SIS:** Per the 5-layer brand architecture in `memory/vaults/strategic-vault.md`, FrankX is the **public commercial front**; SIS is the **substrate**. Pricing, sprint landings, and customer-facing offer pages belong on FrankX, not in the open-spec repo.

---

## What to drop into FrankX

### File 1 — `frankx.ai/<route>/build-your-company-brain/page.tsx` (or equivalent)

Sprint landing page surfacing the Tier-1 offer. Reuse the content from `docs/monetization-tiers.md` in the SIS repo (Tier 1 section) but translate to commercial copy:

- **Hero:** "Build Your Company Brain — 10-Day Sprint"
- **Price:** €7,500 (stated, not hidden)
- **Deliverables:** the day-by-day breakdown from `docs/monetization-tiers.md`
- **Downsells:** €149 DIY pack · €750 cohort · €500 audit · €1,500/mo retainer
- **Proof:** link to FrankX Company Brain (the case study)
- **CTA:** application form (limited cohort) or scheduling link

### File 2 — `frankx.ai/<route>/pricing/page.tsx`

The 4-tier table from `docs/monetization-tiers.md`:

| Tier | Name | Price | Status |
|---|---|---|---|
| 1 | Build Your Company Brain Sprint | €7,500 | Available now |
| 2 | Templates + Packs | €149-€500 | Coming after 5+ sprints |
| 3 | Community / Cohort | €750-€2,500/yr | Coming after 10+ template buyers |
| 4 | Platform (self-serve) | TBD | Coming after Tier 1-3 stabilize |

Show only Tier 1 as live; tease the rest as roadmap.

### File 3 — `frankx.ai/<route>/case-studies/frankx-company-brain.md`

The reference instantiation: Frank running his own Company Brain on himself. The methodology proof.

## Why NOT in SIS

- SIS is open-spec (MIT). Pricing pages on the spec surface dilute the protocol's authority and conflict with the sovereignty clause's "exit always available" framing.
- FrankX is the commercial brand. Pricing belongs there.
- Subdomain roadmap (`docs/site/subdomain-roadmap.md`) names this split intentionally: `sis.frankx.ai` (when promoted) is the SIS-as-product surface; `starlightintelligence.org` stays the open spec.

## Action checklist for Frank

- [ ] Read SIS's `docs/monetization-tiers.md` for the canonical tier definitions
- [ ] Translate Tier-1 deliverables into commercial copy (less terse than the SIS doc; FrankX visitors need motivation, not architecture)
- [ ] Add the application form / scheduling link to make the offer actionable
- [ ] Cross-link from FrankX pricing → SIS substrate spec for builders who want to fork
- [ ] Cross-link from SIS `/architecture` page → FrankX Tier-1 sprint as the hosted-service path

## Sovereignty note

Even Tier 4 platform must let operators export everything per the sovereignty clause. Attribution-via-Built-on-SIP is the only compounding mechanism, never lock-in. This applies to FrankX pricing pages too — every offer page should name the exit.

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Source: `.intake/processed/2026-05-03/3 Chatgpt 02.05 - Copy - Copy.txt`
- Distribution packet drafted: 2026-05-03
- Target: `C:\Users\frank\FrankX`
- Action: Frank manual move
