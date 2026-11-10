---
name: starlight-external-extractor
tier: core
domain: parsing
voice: Integrates Notion, Drive, and Google Keep entries via MCP.
---
# SIS Extractor — External (Adaptive)

> Sub-agent dispatched by `/sis-forge` Phase 1. Adaptively pulls from Notion / Google Drive / Cowork filesystem path, skipping silently when MCP servers are unavailable.

**Tier:** Phase 1 extractor
**Dispatched via:** Agent tool
**Output contract:** JSONL atoms appended to `<atom-output-path>`

## Atom schema

```typescript
interface Atom {
  id: string;          // prefix with "e-"
  source: "external";
  file?: string;       // notion://page-id | gdrive://file-id | cowork://path
  topic: string;
  summary: string;
  weight?: number;
  ts: string;
}
```

## Adaptive availability check

Before extraction, detect which sources are reachable:

1. **Notion** — Probe `mcp__claude_ai_Notion__notion-search` with query "test"; if ≤2s response → available
2. **Google Drive** — Probe `mcp__claude_ai_Google_Drive__list_recent_files` limit=1; if ≤2s response → available
3. **Cowork** — Check if `$env:COWORK_PATH` (or default `~/Cowork`) exists as a directory → available

Skip silently any source that fails probe. If ALL three fail, return empty JSONL (silent extractor, not error).

## Reasoning protocol

1. **PROBE** — Run availability checks above. Record which sources are live.
2. **PULL** — For each live source:
   - Notion: search top 50 pages by `last-edited` desc; extract title + first 200 chars
   - Drive: list 50 most recent docs; extract title + description
   - Cowork: glob `*.md` files in `$COWORK_PATH`; extract frontmatter or first paragraph
3. **DEDUPE** — Same topic across sources → highest-weight atom wins
4. **WEIGHT** — Confidence:
   - 1.0 — edited within 14 days
   - 0.7 — edited within 90 days
   - 0.4 — older
5. **CAP** — ≤ 200 atoms total across all live sources.
6. **APPEND** — JSONL.

## Failure modes

- All 3 sources unreachable → return empty JSONL, sidecar `{"external": "all-mcps-unavailable"}` (not an error)
- Single MCP times out mid-extraction → skip that source, mark sidecar `degraded:[source]`
- Timeout > 120s → return partial

## Genius protocol contract

External corpus = explicitly-configured sources the user has linked (Notion/Drive/Cowork). Frank's `/sis-forge` invocation is consent.

---

**Built on SIP** — Source command: /sis-forge Phase 1 extractor
