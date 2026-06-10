# Metrics Truth Rule

Before writing public claims about Frank Riemer, FrankX.ai, Arcanea, Starlight Intelligence Systems, Agentic Creator OS, or related ecosystems:

1. Read `metrics/current.json` when available.
2. Never hardcode fast-moving numbers in prose unless the metric includes `last_verified`.
3. Use "as of [date]" for exact figures.
4. Use ranges or "minimum historic snapshot" when freshness is uncertain.
5. Distinguish:
   - built
   - contributed to
   - influenced
   - supported
   - advised
   - experimented with
6. For enterprise/commercial impact, avoid claiming ownership of full deals unless explicitly verified.
7. Prefer phrasing that shows compounding velocity:
   "tracked snapshot," "living ledger," "minimum public count," "production velocity," "as of last verified update."

---

## Why this rule exists

Fast-moving numbers (agent counts, skill counts, transmission counts, vault entries, downstream consumers, deployment counts) rot in prose the moment they're written. A claim baked into `../ECOSYSTEM_ARCHITECTURE.md` or a landing page is wrong by next week and embarrassing by next quarter. The fix is not "update everything constantly" — the fix is to route claims through a single ledger and qualify them with a verifiable date.

This rule extends the existing CANON discipline (see `../CANON.md`) and the Karpathy-distilled hygiene in `../AGENTS.md`: "State assumptions out loud … verify against real files, real output, or real tests before acting."

## How to use `metrics/current.json`

`metrics/current.json` is the living ledger. Every entry MUST include `value`, `last_verified` (ISO date), and `source`. If a metric is not in the ledger, do not invent it — either leave it out, use a qualified range, or add it to the ledger first with a verified source.

Expected shape for each entry under the top-level `metrics` object:

```json
{
  "metrics": {
    "production_agents": {
      "value": 47,
      "last_verified": "2026-05-01",
      "source": "agents/AGENT_REGISTRY.md",
      "ownership": "built",
      "stale": false,
      "notes": "Optional context — methodology, caveats, related metrics."
    }
  }
}
```

Required: `value`, `last_verified`, `source`. Optional: `ownership` (one of the verbs below), `stale` (default `false`), `notes`. When the underlying number can no longer be reproduced from the source, set `stale: true` rather than deleting the entry.

When writing prose:

- **Exact**: "47 production agents as of 2026-05-01"
- **Range**: "between 40 and 50 production agents (last verified 2026-04)"
- **Snapshot floor**: "minimum 40 production agents (tracked snapshot, 2026-Q1)"
- **Velocity**: "tracked snapshot growing — see `metrics/current.json`"

## Ownership language — pick one

| Verb              | Meaning                                                                  |
| ----------------- | ------------------------------------------------------------------------ |
| built             | Frank shipped this end-to-end as primary author/owner.                   |
| contributed to    | Frank made material code or design contributions to a shared effort.     |
| influenced        | Frank's ideas, talks, or writing shaped direction; not a direct shipper. |
| supported         | Frank reviewed, amplified, or assisted the work in a supporting role.    |
| advised           | Frank gave formal or informal counsel; did not implement.                |
| experimented with | Frank prototyped or explored this; not a production claim.               |

For enterprise/commercial impact: never claim ownership of a full deal unless the ledger records the `ownership` field as `built` or `contributed to` with a verified source.

## Updating the ledger

1. Open a PR that edits `metrics/current.json` only.
2. Every changed metric MUST update `last_verified` and reference a verifiable source (URL, screenshot path, dashboard, invoice).
3. Don't delete history — append. The ledger is a record, not a leaderboard.
4. If a metric became unverifiable, mark it `stale: true` rather than removing it.

## Out of scope

Stable facts (founding year, layer model, canonical paths) don't need ledger entries. This rule is about numbers that change.
