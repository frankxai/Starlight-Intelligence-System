# Publication path

## Release verification

```bash
npm ci
npm run validate
npm run check
npm test
npm run build
```

CI runs the same commands for every plugin change. The production workflow deploys automatically from `main` through the protected `starlight-plugin-production` GitHub environment.

## Remote service gate

| Gate | Acceptance condition |
| --- | --- |
| Transport | Stable HTTPS endpoint at `/mcp`; initialize, list, resource, and tool calls pass |
| Identity | Cloudflare Access Managed OAuth completes in ChatGPT |
| Authorization | Access JWT issuer, audience, expiry, subject, and allowlisted email are validated |
| Storage | Supabase preserves tenant, versions, revisions, and audit events |
| Privacy | Retention, export, deletion, privacy policy, and terms match actual behavior |
| Reliability | Worker logs, deployment rollback, health check, and availability monitoring exist |
| UI | Versioned URI, exact CSP, headless parity, and inline rendering pass |

## Register and publish

1. Complete [cloud-deployment.md](cloud-deployment.md).
2. In ChatGPT developer mode, add `https://mcp.starlightintelligence.ai/mcp` and complete Access login.
3. Run Scan Tools. Confirm ten tools and four skills, then execute `evals/golden-cases.json`.
4. Save the generated technical app mapping in `.app.json` when the production endpoint exists, and reference it from the plugin manifest if the current packaging flow requires that mapping.
5. Submit a reviewed version through the plugin portal.
6. For later tool metadata, UI, or skill changes, refresh/scan and submit a new version. Published metadata and skills are reviewed snapshots rather than live directory sync.
