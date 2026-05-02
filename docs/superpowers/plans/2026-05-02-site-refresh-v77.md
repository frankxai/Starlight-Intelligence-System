# Site Refresh — v7.7 (post-demo)

**Window:** 2026-05-02 → 2026-05-04 (Saturday afternoon → Monday).
**Tier:** Operational (no substrate file edits).
**Owner:** Frank.
**Trigger:** post-2026-05-01 cockpit demos. Marketing surface is ~3 substrate versions behind the system it describes; demos created incoming traffic to a homepage that reads as v7.0.

---

## Why this plan exists

The audit dated 2026-04-30 surfaced four structural gaps on `starlightintelligence.org`:

1. **Homepage description is pre-v7.4** — "Six semantic vaults" framing, when the actual architecture is **9 universal IS layers + Domain Sub-Stack Tier** (35 agents, 70+ commands, 3 reference verticals).
2. **No `/verticals` page** — the productization story (People + Sound + Music IS as 3 reference Domain Sub-Stacks) has zero public surface.
3. **No `/cockpit` teaser** — the most concrete artifact in the system (4-surface local Jarvis-grade cockpit) is invisible publicly.
4. **`docs/public/starlight-intelligence-system.md`** — polished public explainer lives in repo, not on site.

A visitor lands on the homepage and cannot see Music IS, the cockpit, or the 9-IS architecture. **Conversion gap.**

This plan closes the gap with a single PR. No new infrastructure. Reuses existing Next.js 16 / Tailwind 4 / src/ layout in `site/`.

---

## Scope

| Change | File(s) | Effort |
|---|---|---|
| Homepage description rewrite (9-IS + Domain Sub-Stack framing) | `site/src/app/page.tsx` | 30 min |
| New `/verticals` route — 3 cards (People, Sound, Music IS) | `site/src/app/verticals/page.tsx` (new) + nav link | 90 min |
| New `/cockpit` teaser route — what the local cockpit does (no demo embed) | `site/src/app/cockpit/page.tsx` (new) + nav link | 60 min |
| Footer link to `friend-starter/` Claude Project pack | `site/src/components/Footer.tsx` (or layout) | 15 min |
| `/architecture` page bump to 9-IS framing if stale | `site/src/app/architecture/page.tsx` | 30 min |
| Mirror `docs/public/starlight-intelligence-system.md` as `/explainer` | `site/src/app/explainer/page.tsx` (new, MDX or markdown render) | 45 min |
| OG / meta description update | `site/src/app/layout.tsx` | 15 min |

**Total: ~4 hours single push.** One PR, one Vercel deploy, one tweet.

---

## Sequencing

### Step 1 — homepage rewrite (30 min)

Replace the "memory layer for humans and AI agents — six semantic vaults" framing with:

> **Starlight Intelligence System** — A persistent context and memory architecture for AI agents.
> Built on the **Starlight Intelligence Protocol (SIP)** — a sovereign substrate anyone can adopt, fork, or compose with.
> 9 intelligence layers, 35 agents, 70+ commands, 3 reference Domain Sub-Stack verticals (People · Sound · Music). Local-first. Forkable. Free.

Three CTA cards below:
- **Adopt SIP** → `/protocol` (canonical spec)
- **Run the reference build** → `/quickstart`
- **Spawn your own vertical** → `/verticals`

Keep the badge (`/badge/v1.1.0`). Keep the existing aesthetic.

### Step 2 — `/verticals` page (90 min)

Three cards. Each card: vertical name, tagline, sub-system count, command count, agent count, link to `verticals/<vertical>/QUICK-START.md` mirror in repo (link to GitHub blob URL — no need to mirror full content yet).

```
┌──────────────────────────────────────────┐
│  PEOPLE INTELLIGENCE                     │
│  Calibrated, structured, neuroscience-   │
│  grounded. Hiring · Performance ·        │
│  Training · Culture · Talent · Org.      │
│  6 sub-systems · 28 commands · 6 agents  │
│  [Open QUICK-START →]                    │
└──────────────────────────────────────────┘
```

Same for Sound Intelligence (composition / production / catalog / performance / audience / sync; 6 / 30 / 6) and Music IS (Frank-operated; 6 + 1 / 8 / 7).

Closer paragraph at bottom: "The pattern generalizes. `/spawn-domain-stack` spawns a 4-7-sub-system vertical from any sovereign domain (Capital · Spatial · Clinical · Legal · etc.). See [forking-domain-stacks.md]."

### Step 3 — `/cockpit` teaser (60 min)

Single page. **No live embed** (cockpit is localhost-only). Describes what the local cockpit does:

- **4 surfaces:** Zellij terminal cockpit · PowerShell launcher · LCC dashboard `:3007` · Phone PWA `:3008`
- **Voice → tool execution loop:** STT (Groq Whisper) → LLM + 7 tools (shell, file_write, claude_prompt, claude_code_launch, open_url, linear_issue, workflow_run) → TTS (ElevenLabs Brian Flash)
- **Brain viz:** live 3D thought-graph clustered by intent
- **Drafts on disk:** every file Jarvis writes lands at `~/Desktop/jarvis-drafts/`
- **Privacy:** 100% local. Groq + ElevenLabs over HTTPS for inference; no cloud storage.

One screenshot or recorded GIF (capture once from the demo). No live demo path.

### Step 4 — footer (15 min)

Add a single footer column "Newcomer":
- Friend Starter (Claude Project pack) → `https://github.com/frankxai/Starlight-Intelligence-System/tree/main/integrations/starter-packs/friend-starter`
- Onboarding → `/quickstart`
- Welcome → `https://github.com/frankxai/Starlight-Intelligence-System/blob/main/ONBOARDING.md`

### Step 5 — `/architecture` bump (30 min)

If still says "6 vaults" or pre-v7.4 framing, replace with current 9-layer + Domain Sub-Stack diagram. The `docs/ARCHITECTURE.md` in repo is canonical — mirror its top section.

### Step 6 — `/explainer` mirror (45 min)

Render `docs/public/starlight-intelligence-system.md` as MDX or via `react-markdown`. This is the polished public-facing long-form. Mirror, don't fork — keep `docs/public/` as source of truth.

### Step 7 — OG / meta (15 min)

In `site/src/app/layout.tsx` update:
- `title` → "Starlight Intelligence — Persistent context for AI agents · Built on SIP"
- `description` → 9-IS framing (one sentence)
- `og:image` → optionally regenerate; current is fine

---

## Out of scope (deliberately)

- **Live cockpit embed** — the cockpit is localhost-only by design. A public iframe would require auth + tunneling — premature.
- **Vertical detail pages** (`/verticals/people-intelligence`, etc.) — links to GitHub blobs are sufficient for v1.
- **Pricing page** — productization economics live in `verticals/music-is/STRATEGY.md` Phase 5 spec, but v7.6 is not yet shipping a paid tier. Premature.
- **Newsletter / email signup** — separate decision; not on site refresh critical path.
- **Auth / dashboard / login** — site is marketing/canonical. Not an app.

---

## Acceptance criteria

- [ ] `/` no longer says "six semantic vaults"; reads 9-IS + Domain Sub-Stack
- [ ] `/verticals` lists People, Sound, Music IS with accurate counts
- [ ] `/cockpit` teaser describes the local cockpit (no live embed)
- [ ] Footer has a "Newcomer" column with friend-starter link
- [ ] `/architecture` shows 9-layer architecture (or links to canonical doc)
- [ ] `/explainer` renders `docs/public/starlight-intelligence-system.md` content
- [ ] `<title>` and `<meta name="description">` updated
- [ ] `next build` clean
- [ ] Vercel deploy preview checked manually before merge
- [ ] Lighthouse score not regressed (baseline pre-PR)
- [ ] Production URL (`starlightintelligence.org`) reflects new homepage within 5 min of merge

---

## Risk + mitigation

| Risk | Mitigation |
|---|---|
| Vercel auto-deploy regresses (per memory `project_vercel_manual.md` — broken since 2026-04-10, restored via GHA at v7.5) | Verify GHA `vercel-deploy.yml` fires on merge. If silent, run `vercel --prod` from `site/` manually. |
| Stale OG cache shows old description | Trigger Twitter/LinkedIn cache refresh post-deploy via debugger tools. |
| Markdown render of `docs/public/starlight-intelligence-system.md` breaks on heavy markdown features | Use `react-markdown` with sanitize; avoid raw HTML. Test heavy-table sections specifically. |
| Site copy gets ahead of substrate again in 2 weeks | Close loop: every substrate `/luminor-board` ratification at vN+1 includes a "site update needed?" check item in the board verdict template. |

---

## Future (v7.7+ next pass — not this PR)

- Per-vertical landing pages (`/verticals/people-intelligence`, etc.) with full QUICK-START rendered
- Live registry of forks ("Built on SIP" attestations indexed)
- Public vault browser improvements (current `/vaults` is functional but minimal)
- A `/spawn` interactive page that walks a visitor through `/spawn-domain-stack` decisions

---

## File checklist for the PR

- `site/src/app/page.tsx` — rewrite
- `site/src/app/layout.tsx` — meta
- `site/src/app/verticals/page.tsx` — NEW
- `site/src/app/cockpit/page.tsx` — NEW
- `site/src/app/explainer/page.tsx` — NEW
- `site/src/app/architecture/page.tsx` — bump if stale
- `site/src/components/Footer.tsx` (or wherever footer lives) — newcomer column
- `site/public/cockpit-screenshot.png` — single asset (capture once from demo)

**Estimated PR diff:** +600 LOC, -150 LOC. Reviewable in one sitting.

---

**Built on SIP** — operational-tier post-demo plan · 2026-05-02 → 2026-05-04 · No substrate edits · Single PR · One deploy.
