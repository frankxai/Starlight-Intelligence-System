# Arcanea properties audit — 2026-07-25

> Source: system-wide upgrade audit. Repos: arcanea-ai-app (production, 231 pages under apps/web) + arcanea (OSS, ~2,300 files).

## arcanea-ai-app: surface verdicts

| Route | Copy | Verdict | Load-bearing issue |
|---|---|---|---|
| `/` (= `/v3`) | A | world-class | homepage IS the v3 experiment; `/v3` publicly duplicates `/` |
| `/chat` | A | world-class | best copy on site |
| `/ecosystem` | A | world-class | registry-derived numbers — the pattern to copy |
| `/lore` | A | world-class | says "17 Library Collections" (loader registers 22) |
| `/library` | A- | world-class | metadata says 20 collections vs loader 22 |
| `/pricing` | A- | good | **$0/$12/$39 shown with NO CTA buttons — working Stripe checkout API exists, nothing calls it**; literal `**40% lifetime discount**` markdown renders as asterisks |
| `/books` | A | good | book catalog with zero covers |
| `/academy` | A | good | canon drift: Gate 8 "Starweave" (canon: Shift), Gate 10 beast wrong |
| `/studio` | A- | good | "~150x faster" unsourced ×2 |
| `/creator-economy` | A | good | hero says nothing live; data file marks 2 streams "live" |
| `/apps` | A- | good | Unicode glyphs as icons (banned); invalid CSS `var()12` drops 3 props; fabricated "Most-installed" |
| `/auth/login` | A- | good | Google logo recolored (brand bug) |
| `/dashboard` | B | good | generic SaaS voice; lucide-react while siblings use phosphor |
| `/living-lore` | B+ | good | 7 characters rendered as Unicode glyphs — no art |
| `/worlds` | B+ | needs-upgrade | duplicate `<h1>` ×2; 6 world APIs exist, never called; 3-item hardcoded gallery |
| `/agents` | C+ | needs-upgrade | says 13 agents, stat says 16, catalog holds 12; emoji identity (banned); fake creditBalance=100; invented ratings |
| `/prompt-books` | C | needs-upgrade | logged-out demo ships invented counts |
| `/onboarding` | B- | needs-upgrade | two parallel flows; creator-type step **clobbers onboardingComplete** |
| `/products` | B | needs-upgrade | stats contradict /pricing and /ecosystem; copy button has no onClick |
| `/blog` | D | needs-upgrade | generic SaaS voice; 19 posts inside a 1673-line TS literal |
| `/arcanea-os` | D | borderline stub | fabricated "10M+ req/day · 99.9% uptime · <50ms · 150+ countries"; `text-fluid-*` classes undefined — h1 renders at base size |
| `/studio/store` | C | **STUB / SHIP-BLOCKER** | **fake payment confirmations**: `alert("Stripe Payment of $19 succeeded!")` after setTimeout; fake on-chain receipt against the Hardhat localhost address with random token IDs; hardcoded developer earnings |

## Monetization truth

Real Stripe code exists (`/api/stripe/{checkout,portal,webhook}` + credits routes, with auth guard and 503 fallback). **No page calls any of it.** `/pricing` has no buy buttons. `/studio/store` simulates payments with alerts. Rev-share contradicts itself: 90%+ (creator-economy) vs 70% (store, apps).

## Numbers contradicting each other in production

- Library collections: 17 / 20 / 22 / 52 dirs — four values live simultaneously.
- Word count: 190,000+ vs 486,000+ — both under "Library of Arcanea."
- Agents: 13 / 16 / 12 across three surfaces.
- `lib/facts.ts` exists specifically to prevent this (its own comment says so) — only 3 pages import it.

## OSS repo (arcanea)

- Not a mirror — a **divergent 2-month-stale fork**: 72 routes vs 231, banned Cinzel font (+ Inter in index.html), wrong teal (#7fffd4 vs #00bcd4), 16 Luminors vs 13, same npm package name `@arcanea/web`, `vercel.json` claiming arcanea.ai origin.
- ~140 root-level strategy .md files + 11.8MB brand-guidelines HTML + loose scripts + a literal `C:\Users\Frank\...` directory committed.
- Its own docs admit the sync workflow "has failed since 2026-02-24" while README still calls it a mirror.
- **Anyone studying the public repo to learn the Arcanea design system learns the banned version.**

## Design system state (implemented vs documented)

@arcanea/design-system v0.3.0 is real and wired (657 files use `--arc-*`; banned-font rule and domAnimation rule hold perfectly in production). But: two token dialects coexist (legacy `bg-cosmic-deep`/`text-fluid-*` layer is partly broken — `text-fluid-3xl` undefined); glass recipe has 5 variants vs 1 canonical; 112 hardcoded hex across 20 files; root DESIGN.md specifies a palette that appears nowhere in tokens.ts; botched find/replace left self-to-self gradients and a "Geist and Geist were removed" comment.

## Top 5 upgrade targets (ranked)

1. **Kill or quarantine `/studio/store`** — fake payment confirmations on a live public domain. Trust ship-blocker; before anything cosmetic.
2. **Wire `/pricing` CTAs to the existing `/api/stripe/checkout`** — highest revenue-per-line-of-code change in the repo. Fix the `**40%**` markdown bug.
3. **Route every public number through `lib/facts.ts`** + delete fabricated stats (arcanea-os, agents ratings, prompt-books demos, studio 150x).
4. **Reconcile OSS repo**: delete/replace its stale apps/web + archive the 140 root docs; stop teaching Cinzel publicly.
5. **Give the site images**: 205 images (116MB) already in public/; a book catalog has no covers, agents use emoji, characters use Unicode glyphs. The guardian v3 webp pipeline proves the path.
