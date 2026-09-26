# Issue #197 public experience QA · 2026-09-23

Base evidence: `origin/main` `a54cc7090f53ebe4f79765ba01e6a459d835b2dd`. This report covers the issue #197 site branch before deployment. The site describes local code and tests, not a hosted Command Center, measured transfer, or live federation.

## Build and functional checks

| Check | Result |
| --- | --- |
| `npm run build` in `site/` | Pass; includes vault-fetch, metrics, public-install, layout, deploy contracts, TypeScript, and Next build. |
| `node site/scripts/check-public-notes.mjs` | Pass: schema, one curated record, export boundary, and path privacy. |
| `GET /api/notes` | 200 JSON. |
| `GET /api/notes/intelligence-should-compound` | 200 JSON, versioned public record. |
| `GET /api/notes/private-vault` | 404. |
| `node site/scripts/export-next-era.mjs` | 21 standalone SVG files from seven source records. |
| XML parse of all exports | Pass; each has `<title>` and `<desc>`. |
| Design evidence validation | Pass for `site/design-loop-evidence.json`. |
| Anti-slop scanner | Pass (100/100); visual inspection remains the meaningful gate. |

## Rendered review

The production build was inspected at 1600×900 and 390×844 on `/`, `/story`, `/architecture`, `/proof`, and `/notes`. Each page had exactly one main landmark and one H1. Document scroll width remained within the viewport at both sizes. The 390px navigation button was 44px tall, opened with an expanded state, and exposed the route links. A mobile architecture code-block overflow was found, corrected, rebuilt, and rechecked.

Adversary review found closed desktop dropdown links could receive keyboard focus. The panels now use `inert` while closed. In the production build, the closed Explore panel had an inert attribute, its links were absent from the accessibility tree, and Tab moved from Explore directly to Build.

The primary homepage action was visible in the first desktop and mobile viewport. The desktop CTA sat at approximately y=763–813 of a 900px viewport. Captures:

An anonymous rebuild encountered a 403 from the existing GitHub vault-content fetch during `/featured` prerender. The authenticated rebuild passed; the build process received a session-scoped GitHub token without printing or storing its value. This is an existing external build dependency, not a claim that the new Notes API requires a token.

- [Homepage](screenshots/issue-197-home-desktop.png)
- [Story](screenshots/issue-197-story-desktop.png)
- [Architecture](screenshots/issue-197-architecture-desktop.png)
- [Proof](screenshots/issue-197-proof-desktop.png)
- [Notes](screenshots/issue-197-notes-desktop.png)
- [Product 4:5 at 360px](screenshots/issue-197-product-social-4x5.png)
- [Product 1:1 at 360px](screenshots/issue-197-product-social-square.png)

An independent visual review found an initially linear loop, disconnected brand diagram, four hardcoded product statuses, incomplete diagram equivalents, and illegible social status text. The exports were revised to show a return path, a shared infrastructure rail, all seven statuses from the architecture content source, semantic diagram descriptions, embedded licensed fonts, and a separate readable social composition. The reviewer scored the final visual system **27/30**. The product social asset now points to the live GitHub source while `/proof` awaits deployment.

Evidence Mode and Horizon Mode share Inter/Newsreader, spacing, rule structure, and mineral green accent across the site and 16:9/4:5/1:1 exports. Developer architecture uses the same web system; the partner one-pager in `docs/brand/partner-operating-thesis-v1.md` is source text awaiting release review. No essential motion was added; the CSS includes a reduced-motion route for small interactions. Exported SVG text is selectable, with title/description; the Story page supplies semantic captions and diagram descriptions outside the images.

## Release boundary

- `/proof`, `/story`, and the revised `/architecture` are production-build artifacts in this branch. Their live host status has not been asserted. Verify the preview before promotion and the public host after deployment.
- The product status is pinned to the audited commit. A separate Foundry lock repair may change the next snapshot but does not retroactively alter main evidence.
- The single public Note is manually allowlisted. It is an example of the export model, not evidence of generational preservation.
- A verified venture-to-venture improvement record does not exist yet. The metric remains unmeasured.
