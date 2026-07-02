# /portfolio-snapshot

Generate a fresh sanitized portfolio snapshot before running a Strategy Session.

## Usage

```
/portfolio-snapshot [--source rotki|notion|manual]
```

## What this command does

Pulls current portfolio state from a configured source (Rotki MCP, Notion MCP, or manual input) and writes a snapshot at `snapshots/<id>.md` (operator-private path; never the OSS repo for real data).

Format conforms to `schemas/portfolio-snapshot.schema.json`:
- Total value (or `redacted` for shareability)
- Allocation per asset class
- Target allocation
- Drift per class
- Entity split (personal / Operating BV / Holding BV / etc.)
- Exchange concentration (sanitized)

## Required configuration

For Tier 1+ runs:
- Rotki running locally + Rotki MCP configured (`07-mcp-integration.md`)
- OR Notion Wealth Command Hub with proper schema + Notion MCP

For Tier 0:
- Manual input — agent prompts for current allocations

## Output

Writes `<private-path>/snapshots/<id>.md` with the portfolio snapshot.

The Strategy Session references this snapshot via `portfolio_snapshot_ref`. The OSS repo never contains the real snapshot — only the reference.

## Privacy

Snapshots are operator-private by default. Configure the snapshot path outside the substrate repo. The substrate documents the schema; operators store the data.

## See also

- `architecture/01-three-tier-security.md` — why snapshots are Tier-3 only and what that means
- `PRIVACY-BOUNDARY.md` — what never goes in the OSS repo
