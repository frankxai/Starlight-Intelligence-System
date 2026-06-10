# Spec — /chronicle route on starlightintelligence.org

**Date:** 2026-05-18 (W21 Monday)
**Status:** spec — gated for implementation this week
**Tier:** operational (site edit; no Board needed; doctrinally bounded by `starlight-chronicle` SKILL.md "Public surface rules")
**Estimated effort:** 1-2h (single-session shippable)

---

## Premise

The Chronicle practice now lives in SIS (`docs/chronicle/`) and globally (`~/.claude/commands/{palace,bless,chronicle}.md` + `~/.claude/skills/starlight-chronicle/`). A public-facing surface that names the practice — without leaking its private contents — completes the trio (private practice + private archive + public manifesto).

Per `starlight-chronicle` SKILL.md "Public surface rules":
> `/chronicle` on frankx.ai is the **manifesto only** — the practice itself, not the contents. Like `/library/approach`.
> `/chronicle/letters/{slug}` carries selectively published witness letters. **Each letter is opt-in.** Nothing is published automatically. The default state of every Palace Review is private.

This spec inherits the FrankX doctrine directly. The SIS instance does NOT re-invent the surface; it instantiates the same manifesto-only doctrine on starlightintelligence.org.

## Frame

Two routes, one source:

- **`/chronicle`** — the manifesto. Reads from `docs/chronicle/0-state-of-the-palace.md` § Preamble (lineage paragraph) + a curated "What the Chronicle is" introduction. Static, dignified, non-promotional. ~600-800 words.
- **`/chronicle/letters/<slug>`** — selectively published Palace Review excerpts. Default state: nothing. Each letter is an opt-in addition (markdown file in `docs/chronicle/public-letters/`) that surfaces. **The default of every Palace Review remains private.**

## Scope

### In-scope (Phase 1 — manifesto only)

- `site/src/app/chronicle/page.tsx` — manifesto page, modeled exactly on `/explainer` + `/changelog`. Hero + source-of-truth banner + ReactMarkdown body + CTA.
- `site/scripts/sync-chronicle-manifesto.mjs` — build-time copy of `docs/chronicle/MANIFESTO.md` → `site/content/chronicle-manifesto.md`
- `docs/chronicle/MANIFESTO.md` — the 600-800 word public-facing manifesto. NEW FILE. Draws from `starlight-chronicle` SKILL.md "Lineage" paragraph + "What the Chronicle is for" + cadence overview. Excludes implementation details.
- Header nav addition: "Chronicle" link between "Vaults" and "Changelog"
- Empty `docs/chronicle/public-letters/` dir with `README.md` documenting the opt-in protocol

### Out-of-scope (Phase 2+)

- `/chronicle/letters/<slug>` route — defer until at least one Palace Review has been judged opt-in-worthy. Reservation is the principle.
- Auto-publishing of Palace Reviews — explicitly forbidden by SKILL.md ("The skill must never produce a public-letter draft unless explicitly asked").
- Hero image generation — defer to a Palace Review where the visual layer earns its place.

## Implementation steps

1. Write `docs/chronicle/MANIFESTO.md` — draws from `starlight-chronicle` SKILL.md but is a **standalone artifact**, not a copy. Frank-DNA voice (cool, premium, intellectual; not preening). Architect register.
2. Write `site/scripts/sync-chronicle-manifesto.mjs` modeled exactly on `sync-explainer.mjs` + `sync-changelog.mjs`
3. Write `site/src/app/chronicle/page.tsx` modeled exactly on `site/src/app/changelog/page.tsx`. ISR `revalidate = 3600`. Source-of-truth banner links to `docs/chronicle/MANIFESTO.md` on GitHub + the founding witness for those who want depth.
4. Add `<NavLink href="/chronicle">Chronicle</NavLink>` to `site/src/components/Header.tsx` desktop + mobile nav (between Vaults and Changelog)
5. Run sync script + verify content lands
6. Local build: `pnpm --filter site build` and check `/chronicle` renders
7. `vercel --prod --yes` from `site/`
8. Commit: `feat(site): /chronicle route — manifesto-only per SKILL.md doctrine`

## Test / verification

- `/chronicle` loads on starlightintelligence.org
- Hero + body + CTA render with no broken images
- Source-of-truth banner links resolve (GitHub MANIFESTO.md + GitHub state-of-palace)
- No private Palace Review content is visible anywhere on the page
- Header nav link works on desktop + mobile

## Falsifier

If at 30 days post-launch (2026-06-17) the `/chronicle` route has had zero opt-in letters added AND no inbound traffic OR if it gets repurposed for anything beyond the manifesto, the route failed its register-discipline test → collapse to a single section inside `/explainer` and remove the standalone page.

## Dependencies / unblocking

- **Depends on:** existing `/explainer` + `/changelog` patterns (proven). `sync-*.mjs` script convention. Header nav structure.
- **Unblocks:** public credibility surface for the Chronicle practice. Makes the four-cadence discipline legible to alliance partners + sovereign forkers without requiring them to read the SKILL.md source.

## Open questions for Board pre-pass (if Phase 2 letters arrive)

1. Are letters published per-post under MIT? Per-letter under CC-BY-NC? Per the SKILL.md "no spiritual-bypass vocabulary" — what's the editorial review process before a letter ships?
2. Does the SIS-instance manifesto differ from the FrankX manifesto, or do they share source? (Recommendation: SIS has its own substrate-tier framing; FrankX has the brand-tier framing. Two manifestos, same lineage paragraph.)

---

**Built on SIP** — /chronicle route spec · 2026-05-18 (W21) · operational-tier
