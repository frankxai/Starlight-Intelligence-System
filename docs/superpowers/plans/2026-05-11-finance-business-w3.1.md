# Finance & Business IS W3.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship W3.1 Phase 1 — entity-registry-template + Stripe instrumenter + P&L computation + runway helper + cockpit pane + v83 substrate test. TDD with mocked HTTP. No real Stripe API calls until Frank provides keys.

**Architecture:** TypeScript-first runtime under `src/finance/`. JSONL audit at `memory/_audit/finance/` (gitignored). Cockpit-only dashboard (per Board REVISE-3 precedent from W2). Entity registry split: schema-only template at repo root + real values in `private/business-registry.json` (per Board REVISE-1).

**Spec source:** `docs/superpowers/specs/2026-05-11-finance-business-is-design.md` (commit 1f38331, Board REVISE applied)

---

## Phase-split clarity

**W3.1 (this plan — Stripe + Arcanea BV only):**
- Entity registry template + private/ loader
- Stripe revenue instrumenter (mocked-HTTP TDD)
- P&L + runway computation (pure functions)
- Daily revenue-snapshot orchestrator
- Cockpit pane (4 panes: P&L / runway / revenue tail / cron status)
- v83 substrate symmetry test
- Cron entry
- Staleness gate enforcement (STALE_CASH on /finance-runway, drift_flag on /yolo scan)

**W3.1.5 (after 14-day clean validation):**
- Bank CSV ingest with structured-import-then-validate
- Manual invoice JSON entry path
- Starlight Holding as second entity (multi-entity logic activates)
- FX ledger integrity nightly check

**W3.2 (separate spec):**
- Tax surface migration handling (jurisdiction changes)
- VAT-tracking ledger depth for Arcanea BV (Dutch-compliance)
- Quarterly digest auto-email to accountant

---

## File structure (W3.1)

**Create:**
```
business-registry.template.json                # schema-only template at repo root
src/finance/
├── entity-registry.ts                          # loads private/business-registry.json (with copy-instructions error)
├── revenue-snapshot.ts                         # daily orchestrator
├── pnl.ts                                      # P&L + runway computation (pure functions)
└── revenue-sources/
    ├── _shared.ts                              # RevenueSnapshot + JSONL writer + FX helper
    └── stripe.ts                               # Stripe REST instrumenter

src/finance/finance.test.ts                     # mocked-HTTP unit tests

test/v83-finance-business.test.ts               # substrate symmetry test

scripts/cron/daily-revenue-snapshot.ps1         # cron entry

cockpit-zellij/layouts/finance.kdl              # 4-pane operator dashboard
cockpit-zellij/scripts/tail-finance.ps1         # JSONL tail
cockpit-zellij/scripts/finance-status.ps1       # P&L + runway panel

private/.gitkeep-finance                        # ensures private/ is referenced (gitignored)
```

**Modify:**
```
package.json                                    # add v83 + finance tests
tools/git-hooks/pre-commit                      # wire v83 into fast tests
.gitignore                                      # already covers memory/_audit/ — verify includes finance/
```

**NOT modified (W3.1 stays operational-tier on implementation; no substrate file-contract touch):**
```
VERTICALS.md / STACK.md                         # not a new vertical (D1)
CLAUDE.md / AGENTS.md / platform adapters       # no taxonomy bump (Business IS already exists)
agents/AGENT_REGISTRY.md                        # no new agent (extends starlight-business)
skills/skill-rules.json / SKILL_REGISTRY.md     # could add finance skills in W3.1.5 if needed
```

---

## Self-Review

**Spec coverage:** Each W3.1 requirement → task pointer
- Entity registry template → Task 1 ✓
- Private-only real entity data → Task 1 (loader with error path) ✓
- Stripe instrumenter → Task 2 ✓
- P&L computation → Task 3 ✓
- Runway computation with STALE_CASH gate → Task 3 ✓
- Daily orchestrator → Task 4 ✓
- Cockpit pane → Task 5 ✓
- v83 substrate symmetry → Task 6 ✓
- Phase 1 = Stripe + Arcanea BV only (REVISE-3) → Tasks 1, 2, 4 enforce ✓

**Type consistency:** `RevenueSnapshot`, `EntityPnL`, `RunwayResult` used consistently across files.

**Placeholder scan:** None. All code blocks are concrete.

---

**Built on SIP** · Finance & Business IS W3.1 plan · v1.0 · 2026-05-11
