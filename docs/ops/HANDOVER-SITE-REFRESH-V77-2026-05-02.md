# Handover — v7.7 Site Refresh PR

**Date:** 2026-05-02
**Operator:** Claude Code (Opus 4.7, 1M context, ultrawork mode)
**Branch:** `site-refresh-v77` (forked from `main`)
**Tier:** Operational. No substrate edit. No `/luminor-board` pre-pass.
**Plan executed:** `docs/superpowers/plans/2026-05-02-site-refresh-v77.md`
**Skills invoked:** `superpowers:executing-plans` + `superpowers:subagent-driven-development`

---

## TL;DR

Marketing surface has been pulled forward ~3 substrate versions. The homepage no longer says "six semantic vaults" — it now leads with **9 intelligence layers, 35 agents, 70+ commands, 3 reference Domain Sub-Stack verticals**. Three new routes ship: `/verticals`, `/cockpit`, `/explainer`. The `/architecture` page is bumped from JSONL-only framing to the canonical 10-IS taxonomy. Footer carries a Newcomer column linking the friend-starter Claude Project pack.

| Metric | Before | After |
|---|---|---|
| Homepage framing | "Six semantic vaults" (v7.0) | **9 intelligence layers + Domain Sub-Stack Tier (v7.6)** |
| Public verticals story | invisible | **3 cards on /verticals** with counts + QUICK-START links |
| Cockpit story | invisible | **/cockpit teaser** — 4 surfaces, voice loop, brain viz, drafts on disk |
| Long-form explainer | repo-only `docs/public/starlight-intelligence-system.md` | **mirrored at /explainer** via `react-markdown` |
| /architecture | "Six semantic vaults" framing | **10-IS table** mirroring `docs/ARCHITECTURE.md` |
| Footer | 3 columns, generic | **4 columns + Newcomer + new-route nav** |
| OG/title/meta | "memory layer for humans and AI agents" | **"Persistent context for AI agents · Built on SIP"** |

**Quality gates:** `npx tsc --noEmit` exit 0 · `pnpm build` clean · 23/23 routes generate · all 5 changed/new routes return 200 with expected key phrases on dev server smoke test.

---

## What shipped (with file paths)

### 1. Homepage rewrite — `site/src/app/page.tsx`

Full replacement preserving aesthetic (mesh orbs, dot grid, Luminor philosophy quote, benediction layer, live vault stream, agent-API terminal block, final CTA).

- **Hero:** "Persistent context. Sovereign by architecture." gradient headline. New paragraph copy with the 9-layer / 35-agent / 70+-command / 3-vertical numbers.
- **Three CTA cards** (per plan): Adopt SIP → `/protocol` · Run the reference build → `/quickstart` · Spawn your vertical → `/verticals`.
- **Stats bar:** 9 layers · 35 agents · 70+ commands · 3 reference verticals · 6 platform adapters.
- **NEW: 9 Intelligence Layers section** — 9 cards (Self/Genius, Second Brain, Brand, Business, Creator, Wealth, Code, Voice & Video, Family) with closer paragraph linking `/architecture` for full 10-IS table.
- **NEW: Domain Sub-Stack Tier section** — 3 vertical summary cards with CTA to `/verticals`.
- **NEW: Cockpit teaser block** — 4-surface schematic linking `/cockpit`.
- **Final CTA:** Three paths (Adopt SIP / Run reference / Spawn vertical).

### 2. `/verticals` — `site/src/app/verticals/page.tsx` (new)

3 cards (People · Sound · Music IS) with:
- Tagline + sub-system pills
- Stat tripod (sub-systems / commands / agents)
- "Open QUICK-START" button to `verticals/<v>/QUICK-START.md` on GitHub
- "Agents" button to `verticals/<v>/AGENTS.md` on GitHub
- Closer section explaining `/spawn-domain-stack` pattern with code snippet

### 3. `/cockpit` — `site/src/app/cockpit/page.tsx` (new)

No live embed (localhost-only by design). Sections:
- Hero: "Four surfaces. One brain. Local-first."
- 4-cell SVG schematic of surfaces (Zellij / PowerShell / LCC Dashboard `:3007` / Phone PWA `:3008`)
- Voice loop diagram: STT (Groq Whisper) → LLM → TTS (ElevenLabs Brian Flash) with latencies
- 7-tool grid (shell, file_write, claude_prompt, claude_code_launch, open_url, linear_issue, workflow_run)
- Brain viz section explaining the 4-event lifecycle and trace_id correlation
- Drafts-on-disk section (`~/Desktop/jarvis-drafts/`)
- Privacy posture (4 bullets — 127.0.0.1 default, Groq/ElevenLabs HTTPS, packet log on your disk, privacy gate posture)
- CTA: Fork on GitHub / Read quickstart

### 4. `/explainer` — `site/src/app/explainer/page.tsx` (new)

Server component reads `docs/public/starlight-intelligence-system.md` at build time, strips the H1 + first hr block, renders body via `react-markdown` with `remark-gfm`. Source-of-truth banner at top points to GitHub blob. Mirror, never fork.

- **Markdown styling:** custom `.explainer-prose` class added to `globals.css` — H2/H3/H4, paragraphs, lists, links, code, pre, blockquotes, hr, GFM tables. Matches site aesthetic (violet accent, dark surfaces, mono code).

### 5. `/architecture` rewrite — `site/src/app/architecture/page.tsx`

Was stale ("Six semantic vaults"). Now:
- **Hero:** "Ten Intelligence Systems. Composed, not stacked."
- **Foundation section:** kept the JSONL-truth framing + 4-step flow (JSONL → SQLite → MCP → AI tools).
- **NEW: 10-IS table** — full layer enumeration (0 Substrate · 1 Genius · 2 Second Brain · 3 Brand · 4 Business · 5 Creator · 6 Wealth · 7 Code · 8 Voice & Video · 9 Family · Health cross-cutting · Spiritual optional · ★ Starlight Orchestrator master). Per-row: tier, purpose, vault namespace, posture chip.
- **Domain Sub-Stack Tier section** — links to `/verticals`.
- **Composition rules** — 5 bullets from `docs/ARCHITECTURE.md`.
- **Cross-tool compounding** — kept (5 platforms → starlight-sis).
- **Extension model** — new section explaining the 11th-IS named procedure.

### 6. Footer — `site/src/components/Footer.tsx`

Was 3 columns (Starlight desc · Navigate · Connect). Now 4 columns:
1. **Starlight Intelligence** — updated description ("Persistent context for AI agents…").
2. **Newcomer** — Friend Starter (GitHub) · Onboarding (`/quickstart`) · Welcome guide (`ONBOARDING.md` GitHub blob).
3. **Navigate** — expanded: `/verticals` · `/cockpit` · `/explainer` · `/architecture` · `/protocol` · `/vaults` · `/docs` · API.
4. **Connect** — GitHub · Arcanea (unchanged).

Grid: `md:grid-cols-2 lg:grid-cols-4` so it stacks gracefully on mobile/tablet.

### 7. Header — `site/src/components/Header.tsx`

Three-tier nav:
- **Desktop (lg)**: Verticals · Cockpit · Architecture · Protocol · Quickstart · Explainer · Vaults · GitHub · Deploy
- **Tablet (sm-lg)**: Verticals · Cockpit · Quickstart · Architecture · GitHub
- **Mobile (<sm)**: Verticals · Quickstart · Docs

### 8. Layout OG/meta — `site/src/app/layout.tsx`

- **Title default:** "Starlight Intelligence — Persistent context for AI agents · Built on SIP"
- **Description:** "A persistent context and memory architecture for AI agents. 9 intelligence layers, 35 agents, 70+ commands, 3 reference Domain Sub-Stack verticals. Built on the Starlight Intelligence Protocol. Local-first. Forkable. Free."
- **OpenGraph + Twitter:** matching titles + descriptions.

### 9. globals.css — `site/src/app/globals.css`

Added `.explainer-prose` block (~80 lines) for markdown body styling on `/explainer`. Self-contained, no Tailwind plugin dependency.

### 10. New deps — `site/package.json`

- `react-markdown@10.1.0`
- `remark-gfm@4.0.1`

97 transitive packages. `pnpm-lock.yaml` updated. No version bumps to existing deps.

---

## Verification ledger

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **exit 0** (clean) |
| `pnpm build` | **clean** — 23 pages generated (4 changed routes + 1 added: `/verticals`, `/cockpit`, `/explainer`) |
| Static generation | All 5 changed/new routes generate as `○ (Static)` with 1h revalidate |
| Dev server smoke (`/`, `/verticals`, `/cockpit`, `/explainer`, `/architecture`) | **all 200**, body sizes 71-163 KB |
| Content fidelity smoke | Each route contains expected key phrases (verified via grep): "Persistent context" + "9 intelligence layers" + "35 agents" / "People Intelligence" + "spawn-domain-stack" / "Four surfaces" + "Zellij" / "Phase 1" + "Built on SIP" / "Ten Intelligence" + "Starlight Orchestrator" |
| Spec compliance review | Dispatched parallel subagent — see `[reviewer verdict]` (separate artifact) |
| Lighthouse | Not run in this session — Frank to check post-deploy |

---

## Plan acceptance criteria checklist

- [x] `/` no longer says "six semantic vaults"; reads 9-IS + Domain Sub-Stack
- [x] `/verticals` lists People, Sound, Music IS with accurate counts (6/28/6, 6/30/6, 6+1/8/7)
- [x] `/cockpit` teaser describes the local cockpit (no live embed, no screenshot — placeholder schematic instead)
- [x] Footer has a "Newcomer" column with friend-starter link
- [x] `/architecture` shows 10-layer architecture (mirrors canonical `docs/ARCHITECTURE.md`)
- [x] `/explainer` renders `docs/public/starlight-intelligence-system.md` content
- [x] `<title>` and `<meta name="description">` updated
- [x] `next build` clean
- [ ] Vercel deploy preview checked manually before merge — **Frank to verify post-PR**
- [ ] Lighthouse score not regressed (baseline pre-PR) — **Frank to run post-deploy**
- [ ] Production URL reflects new homepage within 5 min of merge — **Frank to verify**

---

## What was NOT touched — and exactly why

| Surface | Why skipped |
|---|---|
| `site/public/cockpit-screenshot.png` | Frank captures from demo machine — `/cockpit` page uses 4-cell SVG schematic placeholder until then |
| Substrate files (`SIP.md`, `SIS.md`, `ALLIANCE.md`, etc.) | Operational tier work; substrate edits would require `/luminor-board` pre-pass |
| Demo path (orb, `tools.mjs`, `start-cockpit.ps1`) | Demo on 2026-04-30 was successful; no autonomous edits |
| `verticals/<v>/` content | Plan scoped these as future work; v7.7 only updates marketing surface |
| `/luminor-board` invocation | Operational tier ships under `/superintelligence` without pre-board — this is correct per CLAUDE.md v7.5.1+ governance |
| `git push origin` | Frank curates ship gate. Branch is local until you push |

---

## Files touched (clean diff inventory)

```
Modified:
  site/src/app/page.tsx                — homepage rewrite
  site/src/app/layout.tsx              — OG/meta + title
  site/src/app/architecture/page.tsx   — 10-IS bump
  site/src/app/globals.css             — .explainer-prose styles
  site/src/components/Header.tsx       — new nav links + 3-tier breakpoints
  site/src/components/Footer.tsx       — Newcomer column + expanded Navigate
  site/package.json                    — react-markdown + remark-gfm
  site/pnpm-lock.yaml                  — lockfile

Net-new:
  site/src/app/verticals/page.tsx      — 3 vertical cards + spawn pattern
  site/src/app/cockpit/page.tsx        — 4-surface teaser
  site/src/app/explainer/page.tsx      — markdown mirror
  docs/ops/HANDOVER-SITE-REFRESH-V77-2026-05-02.md  — this file
```

Estimated diff: **~+1,200 / -200 LOC** (the v77 plan estimated +600/-150; came in slightly larger because of the comprehensive layer cards on the homepage and the full 10-IS table on `/architecture`).

---

## Risks + mitigation

| Risk | Mitigation |
|---|---|
| Vercel auto-deploy regresses (broken since 2026-04-10, restored via GHA at v7.5) | Verify GHA `vercel-deploy.yml` fires on merge. If silent, run `vercel --prod` from `site/` manually per `project_vercel_manual.md` memory |
| Stale OG cache shows old description on Twitter/LinkedIn | Trigger debugger refresh post-deploy |
| `/explainer` markdown renders break on heavy GFM features | `react-markdown` with `remark-gfm` handles tables/strikethrough; smoke tested on dev server (`Phase 1` + `Phase 5` + `Built on SIP` all rendered) |
| Site copy gets ahead of substrate again in 2 weeks | Future: every substrate `/luminor-board` ratification at vN+1 includes a "site update needed?" check item in the board verdict template |
| Multiple lockfile warning on `pnpm build` | Pre-existing. Harmless. Caused by Windows user dir + repo root + site/ all having lockfiles |

---

## Recommended sequencing for Frank

1. **Read this handover** + the spec reviewer verdict (~5 min).
2. **Visual review** of dev server (still running on `:3000`) or run `cd site && pnpm dev` if killed. Click through `/`, `/verticals`, `/cockpit`, `/explainer`, `/architecture`. Verify the aesthetic matches.
3. **Capture cockpit screenshot** from your demo machine → `site/public/cockpit-screenshot.png`. Optional — current schematic placeholder is acceptable for v1.
4. **Commit** the branch (or fold in selectively):
   ```bash
   git add site/src/app/page.tsx site/src/app/layout.tsx site/src/app/architecture/page.tsx \
           site/src/app/verticals/page.tsx site/src/app/cockpit/page.tsx site/src/app/explainer/page.tsx \
           site/src/app/globals.css site/src/components/Header.tsx site/src/components/Footer.tsx \
           site/package.json site/pnpm-lock.yaml \
           docs/ops/HANDOVER-SITE-REFRESH-V77-2026-05-02.md
   git commit -m "feat(site): v7.7 refresh — homepage + /verticals + /cockpit + /explainer + 10-IS architecture"
   ```
5. **Push + PR:**
   ```bash
   git push -u origin site-refresh-v77
   gh pr create --title "feat(site): v7.7 refresh — homepage + /verticals + /cockpit + /explainer" \
                --body "..."
   ```
6. **Vercel preview check** — verify deploy preview renders correctly on the PR.
7. **Merge** when satisfied.
8. **Post-deploy:** verify `starlightintelligence.org` reflects new homepage within 5 min. If not, run `vercel --prod` from `site/` manually.
9. **Tweet** linking the new explainer or verticals page.

---

## Carry-forwards (NOT this PR)

- **Per-vertical landing pages** (`/verticals/people-intelligence`, etc.) with full QUICK-START rendered — v7.8 next pass.
- **Cockpit screenshot** swap once Frank captures from demo machine.
- **Live registry of forks** ("Built on SIP" attestations indexed) — v7.8+.
- **`/spawn` interactive page** that walks visitors through `/spawn-domain-stack` decisions — v7.8+.
- **Public vault browser improvements** — v7.8+.

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Verticals: starlight-intelligence-system@v7.7-pre · operational tier site refresh
- Generated: 2026-05-02
- Operator: Claude Code (Opus 4.7, 1M context)
- No substrate edits · No demo-path edits · No `/luminor-board` pre-pass required · Single PR
