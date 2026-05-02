# Subdomain Roadmap — nested-routes-first

> Default: nested routes inside the active brand domain. Promote a route to a
> subdomain only when the route earns it.

> **Status:** v0.1 — drafted 2026-05-03 from `.intake/2 Chatgpt 02.05 - Copy.txt`. Working position; the actual deploys happen one at a time as each surface earns its split.

## The principle

Splitting a surface to a subdomain costs:

- A new Vercel project (or equivalent)
- A new SSL cert + DNS record
- A new analytics stream
- A new SEO surface that has to earn its own backlinks
- A new "where does this content live" question every time you add something

A subdomain pays for those costs only if the surface has independent revenue, a distinct audience, separate canonical canon, or a technical isolation requirement.

Until then, **nested routes inside the brand domain are cheaper, faster, and easier to consolidate when the strategy shifts.**

## Promotion criteria

Promote a nested route → subdomain when **two or more** of these are true:

- **Independent revenue stream** — the surface has its own pricing, its own customers, and they don't substantially overlap with the parent domain's audience.
- **Distinct audience** — the visitor demographics are different enough that the parent's content is noise to them.
- **Separate canonical canon** — the surface's voice / visual / governance is distinct from the parent's (e.g., Arcanea's mythic register vs FrankX's commercial register).
- **Technical isolation** — the surface needs different runtime, different rate limits, different auth, or different deployment cadence.

## Roadmap (candidate subdomains)

These are *candidates*, not commitments. Each gets promoted when it meets the criteria.

### From `frankx.ai` (commercial)

| Candidate subdomain | Source nested route | Promotes when |
|---|---|---|
| `sis.frankx.ai` | `frankx.ai/sis` | SIS-as-product earns Tier-1 sprint customers > 10/yr |
| `workforce.frankx.ai` | `frankx.ai/workforce` | People Intelligence has 5+ paying productized clients |
| `markets.frankx.ai` | `frankx.ai/markets` | Market intelligence becomes a separate offering (currently a gap) |
| `studio.frankx.ai` | `frankx.ai/studio` | Music IS audience grows distinct from FrankX commercial audience |

### From `arcanea.ai` (mythic / IP)

| Candidate subdomain | Source nested route | Promotes when |
|---|---|---|
| `intelligence.arcanea.ai` | `arcanea.ai/intelligence` | Arcanea Luminors are the primary entry point for a distinct cohort |
| `codex.arcanea.ai` | `arcanea.ai/codex` | The canon browser becomes a destination, not just a reference |
| `luminors.arcanea.ai` | `arcanea.ai/luminors` | The agent gallery has its own visitors, not just curiosity-clicks from /codex |

### From `starlightintelligence.org` (substrate / open spec)

This domain stays single — it is the open protocol surface. Subdomain splits would dilute the spec's authority. Internal pages (`/protocol`, `/architecture`, `/verticals`, `/cockpit`, `/explainer`) stay nested.

## Anti-pattern

Splitting subdomains *before* the surface earns them produces:

- Multiple thin sites that nobody finds because none of them have backlinks
- Confused visitors who can't find the related page on the "other" subdomain
- A maintenance burden that scales with the split count, not with the value

When in doubt: **keep it nested**.

## Reconciliation note

The current `starlightintelligence.org` is the open-spec surface. The proposed `sis.frankx.ai` (when it earns promotion) is the productized SIS-as-service surface. These are *different products* with the same substrate underneath — same protocol, different audiences, different commercial layer. The split is intentional once it earns.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Source: `.intake/2 Chatgpt 02.05 - Copy.txt`
- Drafted: 2026-05-03
