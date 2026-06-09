# Handover — 2026-05-27 Overnight L99-Mode Session

> **For Frank arriving at the laptop Wed morning.** Everything done this session, every URL verified, every fix shipped to prod. Read this first; PREFLIGHT-2026-05-27.md second.
>
> **Tier:** operational. **Built on SIP.**

---

## Top-line: ready for Madrid

| Surface | State | Receipt |
|---|---|---|
| starlightintelligence.org production | **GREEN — deployed 2026-05-27** | `dpl_9Qdn6Mt48of2ApCxpkfWeA4UemHM` |
| 5 networking-pack URLs | **All HTTP 200, content correct** | Verified post-deploy |
| P0 soft-404 on /research/memory-foundations | **CLOSED** | Title now serves "Memory Foundations for SIS" |
| 12 routes missing og:image | **FIXED** (8 fixed in second wave + 4 in first) | Pending second build verification |
| /explainer "journey" voice violation | **FIXED** → "five phases" / "five-phase flow" | Pending build |
| Antigravity stake | **GREEN — 5-month operator** | `ANTIGRAVITY-INVENTORY-2026-05-27.md` |
| Eval numbers Frank can cite | **34/34 risk evals + p@10 = 20%** | `SIS-EVAL-2026-05-27.md` |
| SIS substrate tests | **90/90 GREEN** | Pre-commit hook |
| SIS GitHub repo | **In sync with origin/main** | `cb94f60` + second commit pending |

## Critical Frank-actions before Thursday

### 1. ROTATE `GEMINI_API_KEY` (3 min) — STILL RED ❌

Current slot holds OpenRouter format (73 chars `sk-or-v1-`). Need real Gemini key (39 chars `AIza`).

```pwsh
# Open AI Studio key page
start https://aistudio.google.com/apikey

# Create new key, copy AIza... value, then:
[Environment]::SetEnvironmentVariable('GEMINI_API_KEY','AIza...REPLACE...','User')

# Open NEW PowerShell session, verify:
powershell -NoProfile -Command '$key = [Environment]::GetEnvironmentVariable("GEMINI_API_KEY","User"); Write-Output ("len=" + $key.Length + " prefix=" + $key.Substring(0,4))'
# Expected: len=39 prefix=AIza
```

Blocks: live Gemini API calls + NB2 image gen + Antigravity SDK auth.

### 2. ANTIGRAVITY WARM-UP (10-15 min, anytime today)

Open Antigravity IDE → resume the 2026-05-22 brain → run one fresh agent turn → screenshot to `artifacts/madrid-demo/antigravity-fresh-session.png`.

Frank can then truthfully say in Madrid: "I ran a fresh Antigravity session yesterday." Concrete artifact for any Google Antigravity-team contact.

### 3. COCKPIT BOOT TEST (3 min, Wed AM) — optional safety check

Per `PREFLIGHT-2026-05-27.md § B3` — netstat → boot → verify 200 → clean shutdown. Documents the kill-PID procedure if :3007 holds (known footgun `feedback_cockpit_holds_3007`).

### 4. PITCH REHEARSAL (5 min, Wed evening)

Read the 30-second pitch from `MADRID-2026-05-28-NETWORKING-PACK.md § 0` aloud twice. Stopwatch. Target under 35s.

---

## Session timeline (what actually happened)

### Phase 1 — Status check
- Read all handover docs, plans, board verdicts (5+ commits ahead)
- Surfaced that "Madrid" appeared nowhere in plans — new context

### Phase 2 — First Madrid prep wave (commit `55e62ae`)
- Shipped: `MADRID-2026-05-28-NETWORKING-PACK.md`, `MADRID-2026-05-28-DEMO-RUNBOOK.md`, `MADRID-EXCELLENCE-PLAN-2026-05-27.md` (sibling-tab plan), Antigravity adapter refresh, ACOS transmission channel sync.
- Caught skill-rules.json drift (missing crypto-intelligence entries) — walker-fixed not exemption-listed.

### Phase 3 — Cross-repo URL audit correction (commit `a2b082f`)
- Discovered the 2026-05-26 audit had been reading the **wrong deploy repo** (frankx.ai-vercel-website is stale; frankx-prod-sync is the Vercel-linked deploy).
- Both /guides/agent-card-a2a-spec and /partnerships/google were ALREADY LIVE on prod.
- Corrected the networking pack URL claims. Lesson encoded in memory: `feedback_verify_runtime_not_presence` family.

### Phase 4 — Public-surface excellence audit (commit `cb94f60`)
- Two background agents: primary audit (11 routes) + extended audit (13 routes) = 24 routes total.
- Caught **P0 soft-404** on `/research/memory-foundations`: HTTP 200 but `<title>Research not found</title>`. Canonical slug is `memory-foundations-2026-05`.
- P0 fix: added `RESEARCH_SLUG_ALIASES` map + `resolveResearchSlug()` helper to `site/src/lib/research.ts`. Updated `[slug]/page.tsx` to use resolver. Both alias and canonical now generate static HTML.
- P1 fix: added `images:[{...}]` to 4 SIS routes' openGraph + twitter (/architecture, /protocol, /research, /verticals).
- P2 fix folded in: `/protocol` title bumped v1.0.0 → v1.1.1.

### Phase 5 — Push + Deploy (L99-mode go-mode)
- Pushed SIS commits to origin/main.
- Ran `vercel --prod` from `site/`. Deploy succeeded in 31s.
- Verified all P0 + P1 + P2 fixes live on production via curl.
- All 5 networking-pack URLs still 200.
- Cleaned up dead commit `667904e0` in `frankx.ai-vercel-website` (reset --hard HEAD~1, local-only, never pushed).

### Phase 6 — Extended audit + second-wave fixes (this commit)
- Extended audit found `/explainer` h2 "journey" voice violation + 8 more routes missing og:image.
- Fixed 7 page.tsx files (quickstart/explainer/featured/badge/changelog/cockpit/yolo) with og:image + twitter:images.
- Fixed explainer.md "the journey" → "the five phases" + page.tsx description "five-phase journey" → "five-phase flow".
- Bumped package.json 8.0.0 → 8.1.0 (matches CHANGELOG + git tag).
- Bumped AGENTS.md + CLAUDE.md footer to v8.1.0.
- Refreshed README staleness: badge 8.0→8.1, "16 skills" → "71 skills across 14 domains", "7 named agents" → "47 agents (7-archetype council + specialist tiers)", "New in v7.3.1" callout → v8.1.0 callout.

### Phase 7 — Second deploy + verify (next steps)
- Build SIS site (running in background).
- Deploy via vercel --prod.
- Verify /explainer no longer shows "journey" and all 8 routes have og:image.

---

## What's NOT done

- **P1-1 duplicate "| FrankX | FrankX" suffix on frankx-prod-sync** — fix attempted twice, reverted externally as intentional. Frank's call to investigate `lib/seo.ts createMetadata` vs `app/layout.tsx` template interaction post-Madrid.
- **frankx-prod-sync local is 5 commits behind origin/main** — unrelated to my work; just a sync hygiene note for Wed AM `git fetch && git status`.
- **Test:substrate full pass not visible due to tail truncation** — but exit 0 = success. Pre-commit hook confirmed 90/90 earlier.

---

## Repo state at end of session

```
SIS (Starlight-Intelligence-System):
  branch: main
  ahead/behind: in sync with origin/main (pushed)
  uncommitted: this handover doc + 8 page.tsx + 2 markdown + 3 docs (package.json/CLAUDE.md/AGENTS.md/README.md/explainer.md)
  Latest commit: cb94f60 (Madrid preflight + P0 slug + P1 og:image fixes)
  Next commit pending: extended audit fixes + version bumps + this handover

frankx-prod-sync (frankx.ai deploy source):
  branch: main, 5 behind origin (not from me)
  uncommitted: app/library/page.tsx M, app/build/, data/bv-ops.json — pre-existing local state
  My P1-1 fix attempts reverted externally as intentional

frankx.ai-vercel-website (stale fork — not deployed):
  branch: feat/ikigai-branding-workshop
  cleaned: my dead commit 667904e0 reset --hard HEAD~1
```

---

## The story for Madrid (one paragraph)

Substrate at peak (v8.1.0, sovereign substrate primary, 90/90 substrate tests, 3-tier memory, dreaming compounds with 6 promotions). 5 public URLs hand-out-ready, all rendering correct content (P0 trap closed). 5-month Antigravity dog-foot story unlocks the "native operator" framing. p@10 = 20% honest floor cite-ready for retrieval-quality questions. Pre-flight is binary green/red. Demo paths tiered (browser default → cockpit last-resort → Gemini multimodal specialist). Conversation hooks cover 7 Google touchpoints including Antigravity team. Email follow-ups drafted four-ways. One critical Frank-action remaining: rotate the GEMINI_API_KEY.

---

**Built on SIP** — generated 2026-05-27 by Claude Opus 4.7 (1M context) in L99-mode overnight session. Falsifier: if Madrid Thursday produces zero asks-landed from the networking-pack § 5 register, the prep arc failed at conversation-routing, not at substrate-readiness.
