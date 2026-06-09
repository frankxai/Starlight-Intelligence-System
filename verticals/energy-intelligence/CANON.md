# Energy Intelligence — Canon

> Shared concepts and definitions inside the Energy IS surface. Names that mean specific things; the meaning is canonical.

## Status

Stub v0.1.0-scaffold. Canon expands as sub-system content is authored.

## Canonical concepts

### Sovereign roles

- **Buyer** — the sovereign whose energy demand is being served (homeowner, SMB owner, community)
- **Installer-Operator** — the sovereign providing installation, configuration, ongoing service (Frank's brother / similar businesses)
- **Manufacturer** — equipment supplier (panels, inverters, batteries) — NOT a sovereign in this vertical's frame; their specs are inputs
- **Grid Operator** — regulator + grid-side authority (Netzbetreiber, utility, etc.)
- **Reviewer** — any human gating an action via `ValidationRequirement` (licensed electrician, certified installer, tax advisor, etc.)

### Calculator categories

- **Sizing calculator** — produces capacity recommendations
- **Cost calculator** — produces capital + operational + ROI projections
- **Yield calculator** — produces energy production estimates
- **Compliance calculator** — produces regulatory-frame readiness scores

### Modes (from `@starlight/calculators`)

- `shadow` / `live-with-warnings` / `live` / `deprecated` — used identically here as in the substrate.

### Validation requirements

The canonical ValidationRequirement members used by Energy IS:

**Core (substrate-canonical):**
- `site_survey_required`
- `manufacturer_spec_check`

**Jurisdiction-extended (Energy IS contributes these via `extendValidationRequirement`):**
- DE: `certified_installer_review_de`, `licensed_electrician_review_de`, `grid_operator_confirmation_de`
- US-CA: `licensed_electrician_review_us_ca`, `grid_operator_confirmation_us_ca`
- (more added as sovereign instances earn them)

## What this vertical does NOT canonize

- Equipment-vendor branding (panel brands, inverter models)
- Specific installer-network names
- Pricing thresholds (tariffs change too quickly to canonize)
- Customer demographic categories

These all live in sovereign instances' own data, not in the public reference vertical.

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Scaffold: 2026-05-03
