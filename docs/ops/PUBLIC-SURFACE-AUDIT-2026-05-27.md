# Public-Surface Audit — 2026-05-27 (T-1 to Madrid)

Frank flies to Madrid 2026-05-28 for Google AI Live. This audit covers 11 high-leverage public routes Google engineers are most likely to land on when Frank hands out URLs. Read-only — no code changes made.

## P0 — Block-Madrid (fix tonight)

**P0-1 — `/research/memory-foundations` serves soft-404 (HTTP 200 + "Research not found" title)**
- URL: https://starlightintelligence.org/research/memory-foundations
- Live response: HTTP 200, but `<title>Research not found — Starlight Intelligence</title>` and rendered "Research not found" body
- Root cause: canonical slug is `memory-foundations-2026-05` (per `site/src/lib/research.ts:35`). The short slug `memory-foundations` is not in `RESEARCH_SLUGS` → `notFound()` triggers in `site/src/app/research/[slug]/page.tsx:86`, but Vercel/Next.js still returns HTTP 200 for the cached error response.
- Risk: this is *the* artifact Frank will most likely share at Google AI Live (it's the headline substrate research). Any badge/handout/social/QR pointing to the short slug serves a "not found" page to Google engineers.
- Verification: `curl -sL https://starlightintelligence.org/research/memory-foundations-2026-05` returns the correct `<title>Memory Foundations for SIS — Starlight Intelligence</title>` — only the short slug breaks.
- Fix options (Frank decides):
  - (a) Add a 308 redirect `/research/memory-foundations → /research/memory-foundations-2026-05` (preserves any printed/copied URLs)
  - (b) Add `memory-foundations` as an alias slug in `RESEARCH_SLUGS` mapping to the same entry
  - (c) Update every external reference to use the dated slug (riskiest — any miss = soft-404)

## P1 — Should-fix (Wednesday afternoon)

**P1-1 — Duplicate "| FrankX | FrankX" in `<title>` on `/ai-architecture` and `/partnerships/google`**
- `frankx.ai/ai-architecture` → `<title>AI Architecture | System Design for Intelligent Applications | FrankX | FrankX</title>`
- `frankx.ai/partnerships/google` → `<title>FrankX × Google Cloud — Gemini + ADK AI CoE Practice | FrankX | FrankX</title>`
- Likely cause: metadata template appending `| FrankX` while page-level title already contains it. SERP-visible and looks unpolished to a Google audience.
- Other audited frankx routes are clean (single suffix or none).

**P1-2 — Four SIS routes missing `og:image` meta**
- Missing `og:image`: `/architecture`, `/protocol`, `/research`, `/verticals`
- Has `og:image`: `/` (root), `/research/memory-foundations` (technically the soft-404 inherits its parent template — verify post-P0)
- Risk: when Google engineers (or anyone) share these URLs in Slack/X/LinkedIn, the social card will be a blank/default — bad first impression.

## P2 — Polish (post-Madrid)

**P2-1 — `<title>` on `/protocol` includes version string `v1.0.0`**
- `<title>Starlight Intelligence Protocol — v1.0.0 — Starlight Intelligence</title>`
- Functional, but SIP has shipped v1.1.1 (per MEMORY.md "SIP v1.1.1 encoded-self amendment"). Either bump to v1.1.1 or drop the version from the title.

**P2-2 — `2026-04-22` date present on `/protocol`** (informational only)
- This is the protocol's intentional `publishedAt`, not a "Last updated" claim. Verify it's the right field. Not stale per the audit rubric (date >= 2026-04).

**P2-3 — "Oracle" mentions on `/ai-architecture` and `/partnerships/google`** (informational only)
- All 30+ Oracle mentions are literal company references (OCI, OCI GenAI, Oracle ADK, Oracle 23ai, etc.) — fine per the audit rubric. Includes one explicit non-endorsement disclaimer on the multi-cloud page (line 717). No "oracle"-as-mystic-language found.
- Frank's posture as "AI Architect at Oracle EMEA" is consistent across both sites.

**P2-4 — "Revolutionary" appears once on `/guides/agent-card-a2a-spec`** (informational only)
- Line 73 of the MDX: `**Bad:** "AI-Powered Revolutionary Research Platform™"` — explicit anti-pattern example, not a voice violation.

**P2-5 — "Journey" appears once in `app/ai-architecture/page.tsx:363`** (comment only)
- JSX comment `{/* Journey Steps - Visual progression */}` — not user-visible. Live HTML scan of `frankx-arch` found zero `journey` occurrences in visible text.

## Route-by-route table

| Route | HTTP | Voice | Dates | Links | Meta | Verdict |
|---|---|---|---|---|---|---|
| frankx.ai/ | 200 | clean | none | clean | title+desc+og:image | PASS |
| frankx.ai/guides/agent-card-a2a-spec | 200 | "Revolutionary" in Bad-example only (OK) | none | clean | title+desc+og:image | PASS |
| frankx.ai/partnerships/google | 200 | clean (Oracle = company ref) | none | clean (4 spot-checks 200) | dup `\| FrankX \| FrankX` in title | P1 |
| frankx.ai/workshops/build-first-ai-agent | 200 | clean | none | clean | title+desc+og:image | PASS |
| frankx.ai/ai-architecture | 200 | clean ("Journey" only in JSX comment) | none | clean | dup `\| FrankX \| FrankX` in title | P1 |
| starlightintelligence.org/ | 200 | clean | none | clean | title+desc+og:image | PASS |
| starlightintelligence.org/research | 200 | clean | 2026-05-17, 2026-05-20 (fresh) | clean | title+desc, **no og:image** | P1 |
| starlightintelligence.org/research/memory-foundations | 200 | clean (page is soft-404) | none | clean | title="Research not found" | **P0** |
| starlightintelligence.org/architecture | 200 | clean | none | clean | title+desc, **no og:image** | P1 |
| starlightintelligence.org/verticals | 200 | clean | none | clean | title+desc, **no og:image** | P1 |
| starlightintelligence.org/protocol | 200 | clean | 2026-04-22 (intentional publishedAt) | clean | title shows v1.0.0 (SIP is v1.1.1), **no og:image** | P1+P2 |

## Methodology

- Live curl: yes — all 11 routes fetched via `curl -sL --max-time 15` into `.audit-tmp/*.html`
- Local source read: yes — `frankx-prod-sync/` (app router) + `Starlight-Intelligence-System/site/` (Next.js + `src/lib/research.ts` + `data/workshops.ts`)
- Voice scan: case-insensitive grep on rendered visible text (HTML stripped of script/style/tags) for the 13 banned terms. "Oracle" + "journey" + "revolutionary" results manually triaged per audit rubric.
- Date scan: regex `(2026|2025)-[0-9]{2}-[0-9]{2}` across all 11 HTML payloads. No Q1 2026 dates found.
- Link rot: regex search for `localhost`, `127.0.0.1`, `/404` hrefs across all 11 pages — zero hits. Spot-checked 4 non-obvious internal links on `/partnerships/google` → all HTTP 200.
- Meta: grep for `<title`, `name="description"`, `property="og:image"`.
- Auditor: Claude (T2 background agent, Opus 4.7)
- Audit duration: ~12 min (within 15-min budget)
- Working tree: `Starlight-Intelligence-System` (clean per pre-session `git status`)

## Key takeaway for Frank

**Two ships matter tonight:**
1. The `/research/memory-foundations` short-slug fix (P0) — this is the artifact you'll most likely hand a Google engineer.
2. The duplicate-`| FrankX` title cleanup on `/ai-architecture` + `/partnerships/google` (P1) — these are the next two routes a Google engineer would click after the root.

Everything else holds — voice is clean, dates are fresh, links work, meta is mostly intact. Substrate surfaces are Madrid-ready modulo the soft-404 trap.

---

## Extended audit — 2026-05-27 (overnight pass)

Covered 13 additional starlightintelligence.org routes Google engineers might land on if they explore past the primary surfaces. All 13 return HTTP 200; no soft-404s; no stale dates; no link rot; no title duplication.

## P0 — Block-Madrid additions

none — all 13 extended routes hold clean on the hard blockers (no soft-404, no Q1 stale dates, no link rot, no broken titles).

## P1 — Should-fix additions

**P1-3 — `/explainer` H2 contains banned voice word "journey"**
- URL: https://starlightintelligence.org/explainer
- Match: `<h2>How it works — the journey</h2>` (user-visible section heading)
- Risk: explainer is the canonical "what is this" page for non-coders — exactly the page a Google engineer skimming the substrate would open after the root. "Journey" is on the banned list per the primary audit rubric.
- Fix options: rename to "How it works — the five phases" or "How it works — the flow" (consistent with adjacent phase numbering already on the page).

**P1-4 — Eight extended routes missing `og:image` meta**
- Missing: `/quickstart`, `/explainer`, `/featured`, `/badge`, `/changelog`, `/cockpit`, `/yolo`, `/vaults/frank`
- Have og:image: `/benediction`, `/docs`, `/vaults` (index), `/vaults/frank/strategic`, `/vaults/frank/technical`
- Same root cause as P1-2 in the primary audit — pages overriding `openGraph` in metadata without re-including `images` lose the auto-discovered inheritance from `app/opengraph-image.tsx`.
- Risk: `/quickstart`, `/explainer`, `/changelog` are likely-shared URLs at Madrid. `/vaults/frank` is the public-vault entry — sharing it on social = blank card.

## P2 — Polish additions

**P2-6 — "unlock" appears once on `/yolo` in technical phase-in gate description** (informational only)
- Body text: "Session 4 unlock requires Phase-In Review pass."
- Context: literal technical gate-unlock language from `yolo-scope.json` Phase-In Review (per CLAUDE.md §/yolo Hive). Not marketing-flavored "unlock your potential" — leaving as-is, but logging for completeness.

**P2-7 — Strategic/Technical vault subpages render h2 only (no h1) on initial HTML**
- `/vaults/frank/strategic` and `/vaults/frank/technical` ship visible content (21+22 entries respectively) but the SSR HTML has no `<h1>`. The breadcrumb-style header `Frank / ◆ Strategic` carries the page identity instead.
- Risk: minor SEO + accessibility (screen readers and Google may not pick up a primary heading). Not Madrid-blocking. Verdict: P2.

## Extended route table

| Route | HTTP | Voice | Dates | Soft-404? | og:image | Verdict |
|---|---|---|---|---|---|---|
| /quickstart | 200 | clean | none | no | **missing** | P1 (og) |
| /explainer | 200 | "journey" in h2 | none | no | **missing** | **P1** (voice+og) |
| /featured | 200 | clean | none | no | **missing** | P1 (og) |
| /badge | 200 | clean | none | no | **missing** | P1 (og) |
| /benediction | 200 | clean | none | no | present | PASS |
| /changelog | 200 | clean | none | no | **missing** | P1 (og) |
| /cockpit | 200 | clean | none | no | **missing** | P1 (og) |
| /docs | 200 | clean | none | no | present | PASS |
| /yolo | 200 | "unlock" (tech term, OK) | none | no | **missing** | P1 (og) |
| /vaults | 200 | clean | none | no | present | PASS |
| /vaults/frank | 200 | clean | none | no | **missing** | P1 (og) |
| /vaults/frank/strategic | 200 | clean | none | no | present | PASS (P2 h1) |
| /vaults/frank/technical | 200 | clean | none | no | present | PASS (P2 h1) |

## Methodology

- Same as primary audit. Live curl `--max-time 15` for all 13 routes in parallel (HTML cached to `.audit-tmp-ext/`).
- Voice scan: case-insensitive word-boundary grep on visible body text (tags stripped) for all 13 banned terms.
- Date scan: regex `2026-0[1-3]-[0-9]{2}` across all 13 payloads. Zero Q1 dates.
- Soft-404 check: scanned body text for "research not found", "page not found", "404 — not found", "could not be found". Zero hits.
- og:image: counted occurrences of `property="og:image"` and `name="og:image"` in served HTML.
- Title dup: checked `<title>` for "Starlight Intelligence" appearing > 1x. Zero hits.
- Link rot: grep for `href="(localhost|127.0.0.1|/404)"`. Zero hits.
- Auditor: Claude (overnight pass, Opus 4.7 1M).
- Audit duration: ~7 min (within 12-min budget).

## Updated key takeaway for Frank

Primary audit's two-ship list still stands. Extended audit adds **one voice fix** worth folding into tonight's pass:

3. `/explainer` h2 "How it works — the journey" → rename (Madrid-relevant because /explainer is the canonical non-coder landing page).

og:image gaps (now 12 routes total — 4 from primary + 8 from extended) are the same single root cause: page-level `openGraph` metadata overriding without re-declaring `images`. Single template fix in `site/src/app/*/page.tsx` covers all 12. Worth doing tonight if there's time post-P0; otherwise post-Madrid.

Extended routes are otherwise Madrid-ready.
