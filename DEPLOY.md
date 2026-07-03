# Deploy — starlightintelligence.org

Site code lives at `site/` (a server-rendered Next.js app — live route handlers,
`sitemap.ts`/`robots.ts`, and `metadataBase`, so it needs a Node/serverless host, not a
static bucket). Production: `starlightintelligence.org`. Vercel project:
`starlight-intelligence-system` / `prj_wDNGrb1R1rB5PJOG9cUEICSER887` (canonical per
HANDOVER-2026-04-23).

The repo is the **source**; Vercel is the **host**. GitHub does not serve the site.

---

## How it deploys (Vercel native Git integration)

Deploys are owned by **Vercel's native GitHub integration** — no repo secrets, no CLI
workflow to maintain:

- **Preview** — every pull request gets an automatic preview deployment + a `vercel[bot]`
  comment with the preview URL. (Confirmed working; that is the `*-git-<branch>.vercel.app`
  URL you see on a PR — it is *not* production.)
- **Production** — a push to `main` that changes `site/` rebuilds and ships to
  `starlightintelligence.org`. Project config: production branch `main`, root directory
  `site/` (Vercel dashboard → Settings → Git).

There is **no GitHub Actions deploy workflow** and none is needed. The old
`.github/workflows/vercel-deploy.yml` CLI pipeline (a stopgap from when the native
integration briefly broke in 2026-04) was **retired 2026-07-03** once native integration
was confirmed working — it was dormant (secret-gated, skipping) and duplicated the CI
build gate. See `ATTESTATIONS.md` for the retirement record.

### CI build gate (independent of Vercel)

`.github/workflows/harness-check.yml` has a `web` job that runs `next build` on `site/`
(and `console/`) on **every PR and push to `main`**. A broken site build fails the PR in
GitHub before Vercel ever deploys — so build breakage can't reach production silently.
No secrets required.

---

## Manual deploy (fallback)

To force a production deploy without a commit (e.g. to re-ship an unchanged `main`):

```bash
cd site
vercel --prod --yes
```

Requires a one-time `vercel link` to the project. Rarely needed — native integration
handles `main` automatically.

---

## Verifying a deploy landed

```bash
curl -sI https://starlightintelligence.org/protocol      | head -1   # expects: HTTP/2 200
curl -sI https://starlightintelligence.org/badge/v1.1.0  | head -1   # expects: HTTP/2 200
```

If those return 200 for the SHA you just pushed, production is live. The DNS → Vercel
domain attachment is configured in the Vercel dashboard (not in the repo).

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty]
- Generated: 2026-04-26 (v7.5) · Rewritten 2026-07-03 (native-integration consolidation)
