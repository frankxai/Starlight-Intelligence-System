# Publication Plan — [Topic]

> How this research lands on the public web and inside SIS chronicle.

---

## Target

**Route:** `starlightintelligence.org/research/[slug]`
**Source file:** `docs/research/published/[slug].md`
**Renderer:** `site/src/app/research/[slug]/page.tsx` (Next.js MDX)

## AEO / discoverability

| Element | Decision |
|---|---|
| Title tag | [Specific question this research answers] |
| Meta description | [TL;DR from OVERVIEW, ~150 chars] |
| H1 | Same as title (avoid mismatch) |
| Schema.org type | `ScholarlyArticle` |
| Citation block | First 200 words includes the recommendation + sources |
| llms.txt entry | YES — substrate-tier research is canon |

## SEO seed terms

- [Primary term]
- [Secondary terms]
- [Long-tail / question-shape phrases — match Frank's transcript questions for AEO]

## Distribution

| Channel | Form | Status |
|---|---|---|
| starlightintelligence.org/research/[slug] | Long-form | Primary |
| Chronicle weekly Palace Review | Mention + link | After /bless |
| MEMORY.md auto-memory | One-line index entry | After /bless |
| Cross-repo (FrankX, Arcanea) | If substrate-tier and broadly relevant | Optional |
| llms.txt / robots.txt | Indexed | Always |

## Anti-AI-slop checks (before publish)

- [ ] No bulleted list longer than 7 items without good reason
- [ ] No "In this article we will explore..." preambles
- [ ] No emoji
- [ ] Every claim has an inline source citation OR is marked opinion
- [ ] Falsifier section present
- [ ] Date in title/frontmatter (research has a half-life)
- [ ] SIP attestation footer

## /bless gate

Published research is automatically a `/bless` candidate. Ratification adds it to `docs/chronicle/blessings.jsonl`.

---

*Built on SIP — YYYY-MM-DD*
