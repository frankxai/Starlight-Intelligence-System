# Verticals audit — 2026-07-25

> Source: system-wide upgrade audit, agent sweep of vertical/misc repos.
> Scope: ai-music-academy, music-intelligence-systems, ocean-intelligence-system, blue-life-commons, marine-mcp, agentic-intelligence-system, frankx-mind-palace, frankx-palace, realityarchitect, bless, FrankX-vs-production structure diff.

## Verdicts at a glance

| Repo | Verdict | Copy | Shipped state |
|---|---|---|---|
| ocean-intelligence-system | **Flagship** | A | 9 MCP connectors, 44+ offline tests, daily-refreshed live demo |
| blue-life-commons | **Flagship** | A | Content commons + Next.js 16 site (~24 route segments), CI-gated ethics/media checks |
| realityarchitect | **Flagship** | A | Live site + open `reality.md` standard + assessment + 4 starter templates |
| frankx-palace | Promising | A- | Live R3F 3D memory palace, CI typecheck+build |
| frankx-mind-palace | Promising (niche) | A | Data layer for palace; unusually disciplined self-restraint |
| marine-mcp | Promising | A- | Working review-gated MCP, 1 commit, not iterated |
| bless | Promising | A- | Protocol/spec only, load-bearing for palace family |
| agentic-intelligence-system | Promising, early | B+ | Thin monorepo (core=4 files), deployable llms.txt endpoint |
| music-intelligence-systems | Promising, pre-code | A- writing / F shipped | Charter only, zero runtime |
| ai-music-academy | **Stale, off-brand** | D | Hype voice, unverified metrics ("100K users / $2M ARR"), 1 lesson of 4 tiers, dead 6+ months |

## Key findings

1. **ai-music-academy violates the Metrics Truth Rule** — aspirational numbers presented as real, "world's first," "symphony of the future" language. Either rehabilitate to portfolio voice or archive. Its real assets (14 blog posts, Suno prompt pack, lesson 1.2 + assessment) map directly to music-intelligence-systems' Composition/Audience sub-systems and should be redirected there.
2. **The marine vertical is the best-layered stack in the portfolio**: blue-life-commons (trust/commons) → marine-mcp (review-gated serving) → ocean-intelligence-system (agents/integrations). This is the reference architecture other verticals should copy.
3. **Three competing "agent-legibility" standards** exist and should be reconciled before a fourth appears: ais-profile.yaml/llms.txt/agents.json (agentic-intelligence-system), reality.md (realityarchitect), CLAUDE.md/AGENTS.md (everywhere else).
4. **frankx.ai-vercel-website is ahead of private FrankX** on app/ (2026-07-24 vs 2026-07-13) and HEAD (+4 days) — production-first doctrine confirmed in practice. FrankX carries three ACOS variants (agentic-creator-os/, agentic-creator-os-npm/, claude-agentic-creator-os/) that need reconciliation.

## Strategic ranking

1. ocean-intelligence-system · 2. blue-life-commons · 3. realityarchitect · 4. frankx-palace · 5. frankx-mind-palace · 6. marine-mcp · 7. bless · 8. agentic-intelligence-system · 9. music-intelligence-systems · 10. ai-music-academy
