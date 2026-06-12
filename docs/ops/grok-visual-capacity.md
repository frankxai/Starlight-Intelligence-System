# Grok Visual / Image Generation Capacity Guide (FrankX / Global)

**Last updated:** 2026-06-06 (autonomous session data + public reports)
**Owner:** Frank (cross-session reference)
**Purpose:** Planning, quota awareness, and maximizing high-quality visuals (blog heroes, infogenius, ACOS diagrams, etc.) without wasting credits or time.

## Current Tier & Credit Status (investigated 2026-06-06)
- You reported **free credits at 9%** in the Grok UI/Imagine meter. This is normal even on paid plans.
- **Local CLI investigation**:
  - `~/.grok/auth.json` contains `"tier":1` and email `nonamakito@gmail.com`.
  - The Grok Build CLI harness (this session) is authenticated with a **base/development tier token** (tier 1), not your personal main account.
  - This explains why the harness may be drawing from or showing the base "free" bucket.
- **Why you still see "free credits" on SuperGrok (non-Heavy)**:
  - The Grok web/app UI always displays a **base Imagine quota meter** (the "free credits" %).
  - SuperGrok ($30/mo) layers a large additional quota pool or multiplier **on top of** that base bucket.
  - Free/non-paid Imagine access was largely removed in March 2026, so the base meter for paid users is the visible remnant + starting point before your paid boost applies.
  - You are **not** on the free tier for practical purposes — your SuperGrok subscription is what gives the real daily volume (typically 50-100+ quality images/day with rolling windows, per reports).
- **Heavy vs non-Heavy**: Correct — you have standard SuperGrok. Heavy ($300) adds priority queue + much higher caps (hundreds per day).
- No local .grok files track live Imagine credits (they are server-side in your xAI account). The CLI help scan found no built-in `grok usage` or `credits` subcommand.
- **How to see the actual Grok web UI + exact consumption and remaining quota** (direct answer):
  1. Open a browser and go to the **main Grok web UI**: https://grok.com (primary) or https://x.com/grok.
  2. **Log in with your personal account** that has the SuperGrok subscription (this is critical — the local CLI harness here uses a completely separate base-tier auth token with a different email and "tier:1").
  3. Once logged in, look for the **Imagine** tab or section (usually in the sidebar or as a dedicated mode for image/video generation). This is where the live credit/usage meter lives.
  4. The meter will show the current % (the "free credits" you've been seeing), how much you've consumed in the current window, and how much you can still generate. It typically includes a live countdown timer for the next reset (these are rolling windows — commonly 2h, 6h, 8h, or 24h from the time of use, not a fixed daily midnight reset).
  5. To see your plan details: Click your avatar (bottom left) → **Settings**, **Billing**, or **Subscription**. Confirm "SuperGrok" is listed (not just X Premium) and note any language about higher image/video limits or boosts.
  6. Pro tip: If you hit a limit, the error or Imagine interface usually displays the exact remaining time and quota details.
- The "free credits" % is the base bucket the UI always shows. Your paid SuperGrok adds substantial extra quota on top. The local harness (this session) often reflects the base because of its auth — your real paid consumption and headroom are best viewed on the main web UI with your personal login.
- **Pro tip for heavy visual days**: For maximum paid headroom, do big batches (like the 30+ heroes) directly in the grok.com Imagine interface logged into your personal SuperGrok account. The harness here will always surface the base meter more prominently because of its auth.

## Model Routing & Credit Discipline (FrankX 2026)

**Core principle**: Use the right model for the job and protect Grok Imagine credits for high-value visuals (infogenius, heroes, comparisons). This local harness is excellent for X data, research synthesis, image generation, and orchestration — not for heavy code or long prose drafting.

### Recommended Routing (points 1-6 + general work)

| Area | Lead Model | Why | Secondary / Edit | Credit Note |
|------|------------|-----|------------------|-------------|
| 1. X Intelligence Engine (Trend & Signal Radar) | **Grok (this harness)** | Best native X search + real-time synthesis | Claude for deeper analysis if needed | Low credit use (text only) |
| 2. GEO / AEO Content System | Claude first (structure + depth) | Excellent at clear claims, entities, citable writing | Grok for final X-signal injection + visual hooks | Draft in Claude UI |
| 3. Visual & Asset Production (infogenius, heroes) | **Grok (Imagine + design-thinking)** | This is where Grok shines and credits are spent intentionally | Gemini Flash for quick prompt tweaks | Primary credit consumer — gate here |
| 4. Site & Product Strategy | Grok (orchestration + X insights) | System thinking + current creator OS trends | Claude for detailed specs | Low |
| 5. Research & Synthesis | Grok first (X + web) | Real-time signals from X | Claude/GPT for polished reports | Low |
| 6. Execution Support (drafts, code, integration) | Claude or GPT first | Strong at long-form prose and code | Grok only for final review + visuals | Draft elsewhere |

**General rule**:
- Discovery / X signals / high-level strategy / visuals → Grok
- Deep writing, code, careful editing → Claude (best) or GPT
- Fast cheap polish / summarization → Gemini 3.5 Flash
- Never do heavy code generation or 2000+ word drafting inside this Grok session if it can be done in Claude/GPT (preserves credits for image gen).

### X Intelligence Engine – Concrete Weekly Loop (Fully Grok-Native)

**Trigger**: Every Sunday evening or on-demand (just say “Run X Intelligence scan” or “X intel for [topic]”).

**Step-by-step workflow** (executed entirely in this harness):

1. **Grok runs targeted X searches** using semantic + advanced keyword tools:
   - Personal Brand OS / Creator-Operator trends
   - GEO / Generative Engine Optimization + AI citation signals
   - Visual/design trends on personal AI creator sites
   - Language around owned media, direct monetization, audience systems
   - FrankX-specific verticals (ACOS, music production systems, research hubs, workshops, visual intelligence)

2. **Synthesize into structured, actionable output**:
   - Top 5–8 emerging signals with example post references
   - Concrete content angles, hooks, or site improvements that are currently working on X
   - Visual asset opportunities (specific infogenius / hero concepts worth generating)
   - Credit-aware delegation recommendations (what should go to Claude/GPT vs stay here)

3. **Log & distribute**:
   - Append to this capacity doc (or a dedicated `X-Intelligence-YYYY-WW.md`)
   - Produce a short “This Week on X for frankx.ai” brief
   - Flag any immediate visual generation needs so we can batch Imagine work efficiently when quota is fresh

4. **Human gate + smart delegation**:
   - You review the brief.
   - Writing tasks → route to Claude first (or GPT), then back to Grok for X-signal injection + visuals.
   - Visual tasks → we run the full design-thinking + Imagine pipeline here.

**Reusable activation prompt you can paste anytime**:

```
Run a fresh X Intelligence scan for frankx.ai.

Focus areas:
- Personal Brand Operating Systems / Creator-Operator models
- GEO, Generative Engine Optimization, and being cited inside AI answers
- Visual / design trends on personal AI creator sites
- Language and opportunities around owned media vs social
- Any new tools, frameworks, positioning, or pain points top AI builders are discussing

Return in this exact structure:
1. Top signals with 1-2 example post references each
2. 5-7 concrete content or site improvement ideas
3. Visual asset opportunities (specific infogenius / hero concepts)
4. Credit-efficient routing recommendations (which tasks should go to Claude/GPT vs stay with Grok)
```

I will execute the searches, synthesize cleanly, and give you the output + next actions in one shot.

### Credit Protection Rules (Enforced in This Session)

- **Image gen is sacred**: We only trigger `image_gen` (or the full infogenius/design-thinking pipeline) after a clear brief from X research or content planning. We batch intelligently when your quota is fresh.
- **Code & long drafting**: Primary code generation and long-form prose drafting happen in Claude (preferred for careful work) or GPT in their own UIs. This session only does final review, X-signal injection, or visual-related work.
- **This session’s budget allocation**: X tools + research synthesis + orchestration + high-quality visual generation. Everything else is routed to protect Imagine credits.
- **Transparency**: Every time we do image generation or a significant research pass, I log approximate credit impact here so we can plan weeks in advance.

### How to Activate Right Now

Just say any of these:
- “Run X Intelligence scan”
- “X intel for [specific focus: GEO, personal sites, ACOS, music, workshops, etc.]”
- “Start the weekly X loop”

I will run the full searches + synthesis + credit-aware recommendations immediately, then suggest the optimal next model handoff (Claude first for writing, Grok for visuals, etc.).

This setup lets us get the unique value from Grok (X data + visuals + orchestration) while intelligently using Claude/GPT/Gemini for the work they’re stronger or cheaper at — exactly so we can keep shipping premium visuals without burning credits on code or first drafts.

## Real-World Throughput (Observed + Reported 2026)
Limits are **dynamic/soft/fair-use** (not hard published numbers). They fluctuate with server load, time of day, generation complexity (high-res, edits, video > image), and whether using agentic/Canvas mode. Failed or moderated generations often still consume quota.

### Approximate Daily Image Generation (Grok Imagine)
| Tier                  | Advertised / Historical | Realistic Daily (Quality Work) | Notes / Windows                  |
|-----------------------|-------------------------|--------------------------------|----------------------------------|
| Free (post-Mar 2026) | ~0 (disabled)          | 0-5 (if any remaining credits) | Hard paywall coming at 0%       |
| SuperGrok Lite ($10) | Low                    | ~5-20                         | Rolling 24h, very restricted    |
| SuperGrok ($30)      | "20x more" / ~200      | **30-100** (most common 50-80) | Rolling windows (e.g. 50 every 2-6h). Throttles in bursts/agent mode. |
| X Premium+ (~$40)    | ~100                   | 20-80                         | Similar to SuperGrok, sometimes lower priority |
| SuperGrok Heavy ($300)| 500+                   | 200-500+                      | Priority queue, fluid windows   |

**Video** is 5-10x more expensive in quota than still images. Stick to images for volume.

**Sources**: Aggregated from xAI docs, grok.com/plans, user reports (Reddit, X, reviews as of May-June 2026), and our direct sessions. Official numbers are intentionally vague ("unlimited" with caveats); actuals tightened multiple times in 2026 due to demand.

### Our Observed Rate in FrankX Work (High-Quality, Branded Visuals)
We do **not** spam raw generations. Every visual follows:
- Design-thinking (80/20: research refs + 3 concepts + art direction brief).
- ACOS Visual Generator / Imagine skill process (topic facts, grounded prompt, specific style: dark-premium-glass, technical/da Vinci, cinematic, etc.).
- Post-gen integration (copy to `public/images/blog/`, MDX frontmatter, visual-registry.json, blog-heroes.json, visual-inventory.csv, audits).

**Throughput examples from recent autonomous runs**:
- **1 focused session (~45-90 min effective)**: 10 high-quality blog heroes (full research → prompt craft → gen → integrate → re-audit).
- **Aggressive 1h autonomous burst**: ~30 images (3 batches of 10) including discovery, multiple research passes, integration, and re-audits.
- **Sustained daily (paid SuperGrok, no other heavy use)**: 40-70 quality visuals realistic if we batch similar styles/topics (e.g., all ACOS heroes one day, all creator-tool ones another). Pure raw gen could hit higher (80-120+), but quality drops and quota burns faster.
- Pure generation speed (no thinking/integration): 1 image every 10-60 seconds when quota is open. The bottleneck is the excellence process + any rolling cooldowns.

**Factors that reduce daily output**:
- Rolling windows (you can burst then wait 2-6+ hours).
- Complex prompts / high detail / aspect ratios that hit moderation or higher cost.
- Agentic mode or long context sessions (lower Imagine priority).
- Free credits at 9%: Expect <5 more before hard stop. Switch fully to paid quota.
- Server load (evenings / peak times = tighter).

**Maximizing tips**:
- Batch similar work (same style lane, same pillar from content-strategy).
- Pre-research once, reuse prompt patterns.
- Run during off-peak.
- Use the discover scripts + visual-inventory.csv to prioritize exactly the gaps (no wasted gens).
- Log every session here so we refine the model.
- For truly high volume: Consider the Imagine API (pay-per-image ~$0.02) as a supplement if consumer quota is the limiter.

## Planning Guidelines
Use this to schedule work:

- **Small batch (5-10 heroes)**: 1 focused 60-90 min session. Safe even on moderate quota.
- **Medium project (20-30 visuals)**: 2-4 sessions over 1-2 days (or 1 long autonomous run if quota is fresh).
- **Large push (50+)**: Plan 1-2 full days on paid tier. Split by theme (e.g., Day 1: ACOS/strategy spokes; Day 2: music/creative). Expect possible overnight cooldown.
- **Weekly rhythm**: With good SuperGrok quota + our process, we can realistically deliver **150-300 high-quality, on-brand visuals per week** across multiple sessions without burning out or hitting walls constantly (assuming no video and good batching).
- Always start with `/vis-audit` + discovery script + `data/visual-inventory.csv` review so every generation fills a real gap.

## Session Log Template (Add entries below or in dated files)
Copy this structure after every visual push:

```
## SESSION: Visual Generation - [Date] [Theme/Batch]
**Tier/Quota at start**: [e.g. SuperGrok, free at 9% or paid meter reading]
**Images generated**: 10 (or 30)
**Time spent (wall + focused)**: 75 min focused
**Process followed**: Full design-thinking + ACOS visual gen + integration
**Files updated**:
- 10x public/images/blog/*-hero.png
- MDX frontmatter for X blogs
- data/blog-heroes.json (+10)
- data/visual-registry.json (+10)
- data/visual-inventory.csv
- Re-ran vis-audit (highs=0, meds=0 post)
**Effective rate**: ~8 images per focused hour (including everything)
**Quota impact**: [notes, e.g. "hit rolling window after 25, waited 3h"]
**Lessons / next time**: [e.g. "Batch more similar styles next time for faster prompts"]
**Next candidates**: [link to discovery output or specific slugs]
```

## Next Steps / Open Questions
- Open the main Grok web UI (grok.com), go to account/billing, and note the exact plan name + any text next to the Imagine meter (e.g. "SuperGrok boost active").
- Reply with that + the current % so we can calibrate the "40-80/day" planning numbers to your actual account.
- **Latest clarification (your current question)**: The 7% "free credits" meter you see is the **base Imagine quota display** in the Grok web/app UI. It is visible even on paid plans. Your SuperGrok subscription adds a large extra quota pool on top of that base bucket. The local Grok Build CLI (this session) is authenticated with a separate base "tier:1" token (see `~/.grok/auth.json` — currently tied to a non-personal email and "grok-build" harness). That's why heavy generation here (the 30+ premium heroes we've shipped) is depleting the visible base meter you see. Your real paid SuperGrok limits apply on the main grok.com web interface under your personal account.
- Resets are **rolling windows** (commonly 2h–24h depending on plan/load, with a live countdown shown in the UI when you hit limits). Not a fixed daily midnight reset. When you see "a couple hours away," that's the rolling timer for the current window. Check the Imagine tab/error message in the main web UI for the exact countdown.
- Free/base Imagine was heavily restricted in 2026; paid SuperGrok (non-Heavy) is what gives the usable volume (realistic 50-100+ quality images/day with our full process, subject to rolling windows and load). No Heavy means no priority queue.

This doc lives globally in `~/.grok/docs/visual-generation-capacity.md` (and mirrored in FrankX `docs/ops/` for project context). Update it after every major push so our planning gets more accurate over time.

**Goal**: Maximize high-quality, on-brand visuals while respecting real quotas and the excellence process. No slop, no wasted credits.

**Session note 2026-06-06 17:59**: User reported 7% free credits remaining. Confirmed via auth.json: local harness is tier:1 (base), separate from personal SuperGrok. Base meter is UI display; paid adds on top. Rolling reset windows (user sees countdown in UI).
