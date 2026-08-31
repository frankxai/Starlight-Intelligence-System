# Cloud deployment runbook

## Automated path

The repository workflows validate every change. Production deployment is an explicit GitHub environment action and runs `wrangler deploy` only after type checks, tests, plugin validation, and the UI/Worker build pass.

Required GitHub production secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN` with Workers Scripts write permission

Required Worker secrets:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` (backend secret/service-role credential; never expose it to UI code)
- `CF_ACCESS_TEAM_DOMAIN`
- `CF_ACCESS_AUD`
- `STARLIGHT_ALLOWED_EMAILS` as a comma-separated allowlist

The non-secret tenant slug and canonical hostname live in `wrangler.jsonc`.

## Cloudflare Access

1. Deploy once to the generated `workers.dev` URL.
2. Add `mcp.starlightintelligence.ai` as the Worker custom domain.
3. In Zero Trust → Access controls → AI controls → MCP servers, add `https://mcp.starlightintelligence.ai/mcp`.
4. Enable Access Managed OAuth and permit only the intended identity provider/account.
5. Copy the Access application audience tag into `CF_ACCESS_AUD`; set the team domain such as `team.cloudflareaccess.com` in `CF_ACCESS_TEAM_DOMAIN`.
6. Put the same permitted email addresses in `STARLIGHT_ALLOWED_EMAILS`.

Access performs the interactive OAuth flow. The Worker then validates `Cf-Access-Jwt-Assertion` against the Access JWKS, issuer, audience, expiry, subject, and email allowlist before creating any MCP server or Supabase client.

## ChatGPT connection and test

1. Enable developer mode and add the production `/mcp` URL.
2. Complete the Access login and consent flow.
3. Run Scan Tools. Confirm ten tools, four imported skills, and the `ui://starlight/command-center/v2.html` resource.
4. Run every case in `evals/golden-cases.json`.
5. Confirm anonymous requests fail, terminal transitions require confirmation, stale writes conflict, and the command center renders once from a complete snapshot.
6. After any tool metadata, skill, or UI change, refresh/scan again. Publish a new reviewed plugin version for production metadata changes.

## Rollback

- Cloudflare Worker: roll back to the previous Worker version in the dashboard or redeploy a prior Git commit.
- Database: the migration is additive. Do not delete `starlight_workspaces` during an application rollback; the previous Worker version can be restored without data loss.
- UI: breaking changes require a new `ui://` URI. Never reuse a prior URI for incompatible HTML, JavaScript, or CSS.

No local Codex installation is required for deployment or runtime.
