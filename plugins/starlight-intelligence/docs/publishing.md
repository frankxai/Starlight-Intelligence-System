# Publication path

## Release verification

```bash
npm ci
npm run validate
npm run check
npm test
npm run build
```

CI verifies plugin changes. Production deployment is a separate manual `workflow_dispatch` action through the protected `starlight-plugin-production` GitHub environment. A passing source PR does not establish live Access or Supabase configuration.

## Remote service gate

| Gate | Acceptance condition |
| --- | --- |
| Transport | Stable HTTPS endpoint at `/mcp`; initialize, list, resource, and tool calls pass |
| Identity | Cloudflare Access Managed OAuth completes in ChatGPT |
| Authorization | Access JWT issuer, audience, expiry, subject, and allowlisted email are validated |
| Storage | Supabase preserves tenant, versions, revisions, and audit events |
| Privacy | Retention, export, deletion, privacy policy, and terms match actual behavior |
| Reliability | Worker logs, deployment rollback, health check, and availability monitoring exist |
| UI | Versioned URI, exact CSP, headless parity, and supported host rendering pass |

## Register and publish

1. Complete [cloud-deployment.md](cloud-deployment.md).
2. In ChatGPT developer mode, add `https://mcp.starlightintelligence.ai/mcp` and complete Access login.
3. Run Scan Tools. Confirm fourteen tools and four skills, then execute `evals/golden-cases.json`. Verify the fullscreen preference in the host rather than inferring placement from resource metadata.
4. Keep the Agent Plugins 1.0 root manifest and legacy OpenAI overlay synchronized. Add a root `mcp.json` only after the actual private connection is verified; do not invent a backend mapping or expose runtime secrets.
5. Submit a reviewed version through the plugin portal.
6. For later tool metadata, UI, or skill changes, refresh/scan and submit a new version. Published metadata and skills are reviewed snapshots rather than live directory sync.
