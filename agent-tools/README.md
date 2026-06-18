# agent-tools/

Local dispatch receipts, council outputs, and verification artifacts. **Not** canonical product code.

- `dispatch-ledger.jsonl` — append-only si-dispatch provenance (gitignored)
- `council-*.json` — council run receipts (gitignored)
- Committed docs live under `docs/ops/` (hero demos, ops receipts)

Regenerate with:

```powershell
./scripts/si-dispatch.ps1 -Lanes grok,codex -Task "ping" -Ledger
./scripts/si-council.ps1 -Seats grok,codex -Mode ping -Ledger
```