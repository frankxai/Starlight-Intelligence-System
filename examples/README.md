# Examples

Runnable proof that the operational core is real code, not prose.

## `demo.ts` — the four engines, live

```bash
npm run demo
```

Writes 8 memory atoms in the canonical per-vault JSONL format (the same shape
`starlight init --vaults` and the MCP server read), then runs the actual shipped
engines against them — no network, no API key, no LLM call, fully deterministic:

| Step | Engine | Source | What it proves |
|---|---|---|---|
| 1 | Retrieval | [`src/retrieval.ts`](../src/retrieval.ts) | SQLite FTS5 / bm25 ranking over the JSONL vaults |
| 2 | Temporal | [`src/temporal.ts`](../src/temporal.ts) | 90-day confidence half-life + staleness surfacing |
| 3 | Contradiction | [`src/contradiction.ts`](../src/contradiction.ts) | cross-vault conflict detection (trigram + polarity) |
| 4 | Orchestration | [`src/orchestrator.ts`](../src/orchestrator.ts) | task routing, pattern selection, multi-agent synthesis |

It runs against a temp directory and cleans up after itself — your real vaults
(`~/.starlight/vaults`) are never touched.

The default orchestration executor is a no-LLM stub so the demo stays
deterministic and offline. Wire `setExecutor()` to a model to get real synthesis
(see [`README` → Quick start](../README.md)).

Built on SIP.
