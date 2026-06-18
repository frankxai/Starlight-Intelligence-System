---
name: starlight-transcripts-extractor
tier: core
domain: parsing
voice: Extracts structured JSONL memory atoms from terminal logs.
---
# SIS Extractor — Transcripts

> Sub-agent dispatched by `/sis-forge` Phase 1. Walks `~/.claude/projects/*` via the Cross-Repo Indexer and returns ≤200 atoms summarizing recurring patterns in session transcripts.

**Tier:** Phase 1 extractor (peer with vault / prompts / repos / external)
**Dispatched via:** Agent tool with subagent_type=general-purpose (no dedicated subagent_type; the .md provides the instructions)
**Output contract:** JSONL atoms appended to `<atom-output-path>` (provided by caller)

## Atom schema (see `tools/sis-forge/atom-schema.ts`)

```typescript
interface Atom {
  id: string;          // unique within this extractor — prefix with "t-"
  source: "transcripts";
  file?: string;       // ~/.claude/projects/<project>/<file>
  topic: string;       // 1-3 word label
  summary: string;     // ≤ 200 chars, what this atom captures
  weight?: number;     // 0.0-1.0 — extractor's confidence this is signal not noise
  ts: string;          // ISO date of the underlying transcript
}
```

## Reasoning protocol

1. **INDEX** — Use the Cross-Repo Indexer to enumerate session transcript files under `~/.claude/projects/*`. Do not load each in full; use the indexer's `summary` field per chunk.
2. **TOPIC EXTRACT** — Group chunks by topic via keyword density. Each topic becomes one candidate atom.
3. **FILTER** — Drop chunks that are pure tooling noise (file paths, error tracebacks without context, command logs).
4. **WEIGHT** — Confidence scoring:
   - 1.0 — explicit user statement of intent / framework / decision
   - 0.7 — repeated topic across ≥3 sessions
   - 0.4 — single mention with low-context signal
5. **CAP** — Return ≤ 200 atoms total. If more candidates exist, return top-200 by weight.
6. **APPEND** — Write atoms to `<atom-output-path>` as JSONL (one atom per line, no trailing newline).

## Failure modes

- Cross-Repo Indexer not initialized → halt, surface `cross-repo-indexer-uninitialized` error
- Permissions denied on `~/.claude/projects/` → halt, surface `permission-denied` error
- Timeout > 120s → return whatever atoms produced so far, mark output `degraded:true` in a sidecar JSON

## Genius protocol contract

This extractor pulls from a known, enumerable source (`~/.claude/projects/*`). Per `commands/sis-forge.md` §"Genius protocol contract", this constitutes corpus delivery — not corpus-guessing — under `/discover-genius` reasoning protocol step 1.

---

**Built on SIP** — Source command: /sis-forge Phase 1 extractor
