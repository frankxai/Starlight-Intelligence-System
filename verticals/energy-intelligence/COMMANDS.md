# Energy Intelligence — Commands (canonical reconciliation)

> Authoritative command surface for the Energy IS reference vertical. Reconciles `SUB-SYSTEMS.md` (1 primary command per sub-system, broad scope) with the more granular forward-declarations in the 7 skill stubs at `skills/energy-intelligence/`. This doc is the **canonical list** the v8.x command-pass authoring will deliver.

**Status:** v0.1.0 reconciliation note. No command files at `.claude/commands/energy-*.md` yet — those land in v8.x. This doc names the contract.

**Reconciled 2026-05-04** by SIS queen during code-review follow-up. Reviewer (`superpowers:code-reviewer`) flagged drift between SUB-SYSTEMS.md broad commands (e.g., `/energy-cost`) and skill-stub granular commands (e.g., `/energy-payback`, `/energy-lcoe`, `/energy-financing-compare`, `/energy-tariff-impact`). Resolution below.

---

## Reconciliation principle

**Both granularities have value.** SUB-SYSTEMS.md commands are entry-point shorthand (one verb per sub-system, easy to remember). Skill-stub commands are operator-level granularity (one verb per concrete protocol step). The canonical model:

- **Primary command per sub-system** = the entry-point command, opens a guided dialogue, can dispatch to a more granular command when scope is clear
- **Granular commands** = direct invocations for operators who already know exactly what they need
- Both authored. Both registered in `.claude/commands/`. Primary commands route to granular commands when appropriate.

This mirrors how People Intelligence works: `/hire-icp` is granular; the broader "I'm hiring for X" routes through Concierge to the right granular command.

---

## Canonical command list

### Sub-system 1 — Sizing

| Command | Tier | Purpose |
|---|---|---|
| `/energy-sizing` | primary | Entry-point. Establishes jurisdiction, captures load profile, runs sizing candidates, surfaces validation requirements |
| `/energy-load-profile` | granular | Captures or estimates hourly load profile only |
| `/energy-derate-check` | granular | Applies derating to a candidate sizing |

### Sub-system 2 — Cost

| Command | Tier | Purpose |
|---|---|---|
| `/energy-cost` | primary | Entry-point. Inherits sized system, runs full cost model with sensitivity bands |
| `/energy-payback` | granular | Payback-only computation (with band) |
| `/energy-lcoe` | granular | LCOE-only computation |
| `/energy-financing-compare` | granular | Side-by-side cash / loan / lease / PPA |
| `/energy-tariff-impact` | granular | Tariff-change sensitivity |

### Sub-system 3 — Installer

| Command | Tier | Purpose |
|---|---|---|
| `/energy-installer-brief` | primary | Generates the full installer-project-brief markdown bundle |
| `/energy-installer-intake` | granular | Lead-intake form / call-script / web-flow design |
| `/energy-installer-survey` | granular | Site-survey checklist + photo manifest + measurement protocol |
| `/energy-installer-permit` | granular | AHJ-specific permit packet |
| `/energy-installer-commission` | granular | Commissioning + PTO coordination |
| `/energy-installer-handoff` | granular | Customer-handoff packet |

### Sub-system 4 — Operations

| Command | Tier | Purpose |
|---|---|---|
| `/energy-ops` | primary | Performance-verification entry-point |
| `/energy-perf-check` | granular | Performance-ratio + capacity-factor against baseline |
| `/energy-fault-triage` | granular | Underperformance fault-tree triage |
| `/energy-warranty-claim` | granular | Warranty-claim packet generator |
| `/energy-customer-report` | granular | Monthly + annual customer report |

### Sub-system 5 — Buyer

| Command | Tier | Purpose |
|---|---|---|
| `/energy-buyer` | primary | Buyer-journey entry-point. Quote-validation, red-flags, verifications, negotiation positions |
| `/energy-buyer-intro` | granular | Initial buyer context capture |
| `/energy-buyer-compare-quotes` | granular | Multi-quote normalization |
| `/energy-buyer-sensitivity` | granular | Sensitivity-explanation for a specific quote |
| `/energy-buyer-checklist` | granular | Pre-purchase decision-support checklist |
| `/energy-buyer-post-purchase` | granular | First-90-days post-installation framework |

### Sub-system 6 — Grid

| Command | Tier | Purpose |
|---|---|---|
| `/energy-grid` | primary | Grid-integration entry-point. Jurisdiction triple lock + interconnection feasibility |
| `/energy-grid-interconnect-check` | granular | Interconnection feasibility scoring |
| `/energy-grid-tariff-resolve` | granular | Jurisdiction-extended tariff schedule resolution |
| `/energy-grid-vpp-eval` | granular | VPP / aggregator program evaluation |
| `/energy-grid-application-coord` | granular | Application coordination architecture |

### Cross-cutting — Recovery

| Command | Tier | Purpose |
|---|---|---|
| `/energy-recovery` | primary | Recovery entry-point. Per-failure-mode protocol library + pre-event readiness audit |
| `/energy-recovery-readiness` | granular | Annual readiness audit |
| `/energy-recovery-outage` | granular | Grid-outage-specific protocol |
| `/energy-recovery-deplatform` | granular | Monitoring-service shutdown + manufacturer-API deprecation protocol |
| `/energy-recovery-warranty-failure` | granular | Manufacturer bankruptcy / stranded-warranty protocol |
| `/energy-recovery-installer-failure` | granular | Installer bankruptcy / closure protocol |

---

## Total command count

- **7 primary commands** (one per sub-system + 1 cross-cutting)
- **24 granular commands**
- **31 commands total** (matches the board verdict's "20-30 commands at .claude/commands/energy-*.md" estimate)

## Authoring sequence (v8.x command-pass)

1. Author 7 primary commands first — these unblock the entry-point UX
2. Author granular commands per sub-system as the agents author their full content
3. Each command file at `.claude/commands/energy-<name>.md` with standard slash-command frontmatter
4. Add `/energy-*` registration block to `agents/AGENT_REGISTRY.md` Domain Sub-Stack table once shipped

## Discovery / IDE expectations

After v8.x command-pass:
- `/energy-` typed in any cockpit pane should autocomplete the 31 commands
- Each command file's frontmatter `description` powers the IDE tooltip
- `arc energy-is` Zellij cockpit Dispatcher pane has direct access to all 31

---

**Built on SIP** · Starlight Intelligence Protocol v1.1.0
- Reconciliation: 2026-05-04 (SIS queen, code-review follow-up)
- Source documents: `verticals/energy-intelligence/SUB-SYSTEMS.md` + `skills/energy-intelligence/*.md`
- Authoring: planned v8.x command-pass (parallel with full agent-content authoring)
