# Cross-repo distribution — `private/`: PV-Lager / EnergyOps pilot specifics

> **Source:** `.intake/processed/2026-05-03/3 Chatgpt 02.05 - Copy - Copy.txt` + `4 Chatgpt 02.05 - Copy - Copy - Copy.txt`
> **Target:** `C:\Users\frank\Starlight-Intelligence-System\private\verticals\pv-lager\` (within this repo, but in the gitignored private/ tree)
> **Status:** AWAITING manual creation by Frank — sovereignty-private content, never auto-written
> **Why this lives in `private/`:** Per memory `feedback_privacy_split.md`, the public substrate stays public; instance-specific state (family-business specifics, customer lists, pricing tables, supplier contracts, partner agreements) lives in `private/`. PV-Lager is Frank's brother's installer business — operator-tier, family-business-tier, never public.

---

## Why NOT in public SIS

- The public SIS substrate is MIT-licensed open spec. Family-business specifics there would:
  - Expose private commercial info
  - Create implicit "this is a generic reference" framing for what's actually one specific operator
  - Break the privacy framework
- The public reference if Energy IS lands as a Domain Sub-Stack (per pre-pass `2026-05-03-energy-is-domain-substack.md`) stays generic — sizing / cost / installer / operations / buyer / grid sub-systems with example-shaped fixtures.
- PV-Lager-specific: real customer profiles, real installer contracts, real supplier pricing, real CRM data, real geographic constraints — all in `private/`.

## What to drop into `private/verticals/pv-lager/`

### File 1 — `private/verticals/pv-lager/README.md`

```markdown
# PV-Lager Vertical Instance

> Sovereign instance of Energy IS (when the Domain Sub-Stack lands per public SIS).
> Family business — Frank's brother's solar installer / energy retailer.

## Purpose
Operator-tier instantiation of the Energy IS Domain Sub-Stack for PV-Lager's
specific business, customers, and constraints. Not a public reference; the
public reference lives at `verticals/energy-intelligence/` if the substrate
proposal ratifies.

## Constraint
Frank's brother does NOT want to become support desk. The AI offering must
shift responsibility AWAY from the operator toward structured self-service,
installer enablement, and buyer clarity.

## Files
- `INSTANCE.md` — sovereign-instance spec (per SIS instance pattern)
- `customers/` — customer cohort definitions (private)
- `installers/` — partner installer profiles (private)
- `suppliers/` — supplier contracts + pricing (private)
- `pricing/` — internal pricing model (private)
- `workflows/` — operator-specific workflows (private)
```

### File 2 — `private/verticals/pv-lager/INSTANCE.md`

Standard INSTANCE.md per SIS instance spec (`docs/sovereign-spawn-spec.md` if exists, else mirror the structure of any other private instance).

### File 3-N — operator-specific subfolders

Customer / installer / supplier / pricing / workflow data — all private, all gitignored at the `private/` boundary.

## Coupling to Energy IS substrate proposal

If the public Energy IS Domain Sub-Stack proposal (`docs/superpowers/board-pre-passes/2026-05-03-energy-is-domain-substack.md`) ratifies via `/starlight-board`:

- Public Energy IS ships at `verticals/energy-intelligence/` with the standard 7-file contract (generic reference)
- PV-Lager instantiates it as a sovereign instance under `private/verticals/pv-lager/`
- PV-Lager benefits from the public substrate's calculators (sizing, cost, payback) without re-implementing
- Public substrate benefits from PV-Lager's operator-tier validation (the family business proves the methodology works)

If the Energy IS proposal does NOT ratify, PV-Lager stays in `private/` as a standalone instance without a public reference.

## Action checklist for Frank

- [ ] Decide on the Energy IS proposal via `/starlight-board`
- [ ] If PROCEED, scaffold `private/verticals/pv-lager/` with the operator-specific content
- [ ] Confirm `private/` is in root `.gitignore` (it is, per the privacy framework)
- [ ] Migrate any PV-Lager-specific captures from `.intake/` (already archived) into the private instance
- [ ] Set up the operator-side workflows (installer-project-brief generation, buyer-side clarity flows, etc.) using the public Energy IS sub-systems

## Sovereignty note

Frank's brother is the sovereign decision-maker for PV-Lager. The Energy IS substrate proposal must NOT presume his consent for adoption. The public substrate enables; the operator decides whether to use it. This is the sovereignty clause in action at the family-business tier.

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Source: `.intake/processed/2026-05-03/3 Chatgpt 02.05 - Copy - Copy.txt` + `4 ... - Copy.txt`
- Distribution packet drafted: 2026-05-03
- Target: `C:\Users\frank\Starlight-Intelligence-System\private\verticals\pv-lager\` (private/, gitignored)
- Gated on: Energy IS proposal `/starlight-board` ratification (optional — instance can exist standalone if proposal doesn't ratify)
- Action: Frank manual creation
