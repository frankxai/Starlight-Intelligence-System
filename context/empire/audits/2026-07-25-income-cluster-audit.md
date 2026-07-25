# Agentic income / business cluster audit — 2026-07-25

> Source: system-wide upgrade audit, agent sweep. Cross-referenced against `agentic-ops-hub/ECOSYSTEM.md` (the cluster's own L0–L7 map).
> Scope: agenticincome, agenticpassiveincome, agentic-income-template, agentic-income-skills, awesome-agentic-income, agentic-business-os, agentic-ops-hub, payment-intelligence-system, awesome-payment-agent-skills, vibe-os.

## Verdicts at a glance

| Repo | Role (per ECOSYSTEM.md) | Copy | Monetization readiness | Notes |
|---|---|---|---|---|
| agenticincome | L4 hub (EARN) | A- | **HIGH** | $67 Blueprint + $129 Agent Team Pro fully drafted in `products/blueprint/`; `ops/POLAR-SETUP.md` exists; checkout not wired |
| agenticpassiveincome | L4 spoke (AUTOMATE) | A | **HIGH — closest to revenue** | Stream Pack 01 ($47) 100% content-complete in `products/stream-pack-01-affiliate-publication/`; blocked only on Polar checkout + repo-visibility decision |
| agentic-business-os | L3 OS family | A | HIGH | 4 packs already `npx skills add`-installable; claims-guard-pack sellable as-is; only 1 registered downstream ("damfrost") — family framing is roadmap, not fact |
| agentic-ops-hub | L2 config control plane | A | LOW (infra) | Best-organized repo in cluster; owns `ECOSYSTEM.md` + `sync-agent-rules.mjs` |
| agentic-income-skills | L4 brain (schema) | A | LOW direct | Outcome Pack schema powers paid Sprints downstream; `.asph-wip/` session debris in tree |
| awesome-agentic-income | L4 index | A- | MEDIUM | **Voice break: "Unlock premium Agent Swarms on Gumroad" CTA violates house no-hype doctrine** and points at an undefined product |
| awesome-payment-agent-skills | L5 index | A | LOW direct | Clean; plugs payment-intelligence-system correctly |
| payment-intelligence-system | L5 payments governance | A | MEDIUM (risk-gated) | Most technically real repo (TS + tests, Ed25519, fail-closed); UNAUDITED — no live funds |
| agentic-income-template | Public shell | A | MEDIUM | Feature-complete scaffold; freeze rather than maintain in parallel |
| vibe-os | OUT OF SCOPE per ECOSYSTEM.md | B+ | Zero wiring, high potential | Stale since 2026-01; content complete → $19–29 pack is pure packaging |

## Consolidation actions

1. **One doctrine-sync engine**: `agentic-business-os/harness-sync.mjs` duplicates `agentic-ops-hub/sync-agent-rules.mjs`. The former should consume the latter.
2. **One Polar integration, not two**: agenticincome + agenticpassiveincome both name Polar.sh as merchant of record with unbuilt checkouts. Build once, share.
3. **Fix the voice break** in awesome-agentic-income line 18 ("Unlock…") — contradicts the cluster's own banned-word doctrine.
4. **Clean `.asph-wip/` debris** in agentic-income-skills + awesome-agentic-income.
5. **Decide vibe-os**: monetize standalone or archive; stop letting it drift.

## Top 5 monetization moves (ranked by distance-to-revenue)

| # | Product | Price | Blocker | Effort |
|---|---|---|---|---|
| 1 | Stream Pack 01 (agenticpassiveincome) | $47 | Polar checkout + visibility decision | Days |
| 2 | Agentic Income Blueprint (agenticincome) | $67 | Same Polar wiring | Days |
| 3 | Claims Guard Pack (+3-pack bundle) (agentic-business-os) | $29–49 / $99 bundle | Storefront listing + license gate | Days |
| 4 | Vibe OS State-Change Pack | $19–29 | Pure packaging (Gumroad) | Days |
| 5 | Agentic Income Private Intel (monthly briefing) | $19/mo | Subscription billing + send cadence | 1–2 weeks |

**The single highest-leverage engineering task in the whole cluster: one shared Polar.sh checkout integration.** Everything in rows 1–2 (and later 5) unblocks behind it.
