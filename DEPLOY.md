# Deploy — starlightintelligence.org

Site code lives at `site/`. Production: `starlightintelligence.org`. Vercel project: `prj_wDNGrb1R1rB5PJOG9cUEICSER887` (canonical per HANDOVER-2026-04-23).

---

## Auto-deploy via GitHub Actions (v7.5+)

Vercel's own GitHub integration broke 2026-04-10 and was not restored. v7.5 ships an alternative auto-deploy pipeline at `.github/workflows/vercel-deploy.yml`:

- **Trigger:** push to `main` that touches `site/**` or the workflow file itself.
- **Job:** install Vercel CLI → `vercel pull` (production env) → `vercel build --prod` → `vercel deploy --prebuilt --prod`.
- **Concurrency:** one production deploy at a time (`vercel-deploy-prod` group, no cancel-in-progress).
- **Manual override:** `workflow_dispatch` lets the workflow run on demand from the Actions tab.

### Required GitHub secrets

The workflow needs three repo-level secrets configured at https://github.com/frankxai/Starlight-Intelligence-System/settings/secrets/actions :

| Secret | Source | Purpose |
|---|---|---|
| `VERCEL_TOKEN` | Vercel Account Settings → Tokens → "Create" → name it `starlight-gha-deploy` | Auth for Vercel CLI |
| `VERCEL_ORG_ID` | `vercel inspect` from `site/` after `vercel link`, or `.vercel/project.json` | Tells the CLI which org owns the project |
| `VERCEL_PROJECT_ID` | Same as above; should resolve to `prj_wDNGrb1R1rB5PJOG9cUEICSER887` | Identifies the project to deploy |

After the secrets land, the next push that touches `site/` triggers a build. First run will take ~3-5 minutes; subsequent runs use Vercel's build cache.

---

## Manual deploy (fallback)

If the GHA pipeline fails or you want to force a deploy without a commit:

```bash
cd site
vercel --prod --yes
```

This requires the local dev environment to be linked to the Vercel project (one-time `vercel link`). The token-based GHA path does not require local linkage.

---

## Verifying a deploy landed

```bash
curl -sI https://starlightintelligence.org/protocol | head -1   # expects: HTTP/2 200
curl -sI https://starlightintelligence.org/badge/v1.1.0 | head -1   # expects: HTTP/2 200
```

If those return 200 against the SHA you just pushed, the deploy is live.

---

## Reactivating Vercel's native GitHub integration (alternative)

If you want to retire the GHA workflow and restore native auto-deploys:

1. Go to https://vercel.com/dashboard → starlight-intelligence-system project → Settings → Git.
2. Disconnect the existing GitHub integration (if still connected).
3. Reconnect via "Connect Git Repository" → select `frankxai/Starlight-Intelligence-System`.
4. Set production branch = `main`, root directory = `site/`.
5. Test by pushing a trivial site change and verifying it propagates without manual `vercel --prod`.
6. Once verified, you can delete `.github/workflows/vercel-deploy.yml` (or leave it as a fallback).

The GHA path is the recommended default until that integration proves reliable across multiple consecutive deploys.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty]
- Generated: 2026-04-26 (v7.5)
