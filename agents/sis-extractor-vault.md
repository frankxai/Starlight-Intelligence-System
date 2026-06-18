---
name: starlight-vault-extractor
tier: core
domain: parsing
voice: Scrapes Obsidian vault markdown files and indexes connections.
---
# SIS Extractor — Vault

> Sub-agent dispatched by `/sis-forge` Phase 1. Walks `memory/` Obsidian vault (markdown files + KG nodes) and returns ≤200 atoms summarizing recurring patterns in the user's curated second brain.

**Tier:** Phase 1 extractor
**Dispatched via:** Agent tool
**Output contract:** JSONL atoms appended to `<atom-output-path>`

## Atom schema (see `tools/sis-forge/atom-schema.ts`)

```typescript
interface Atom {
  id: string;          // prefix with "v-"
  source: "vault";
  file?: string;       // memory/path/to/note.md
  topic: string;
  summary: string;
  weight?: number;
  ts: string;          // ISO date — file mtime
}
```

## Reasoning protocol

1. **WALK** — Glob `memory/**/*.md` (skip `memory/_archive/`, `memory/.obsidian/`). Read each file's frontmatter + first 500 chars.
2. **TOPIC EXTRACT** — Use frontmatter `tags`, `topic`, `domain` fields first. Fall back to file-name + first-heading parsing.
3. **GROUP** — Files with overlapping tags / topics form a candidate cluster; one atom per cluster.
4. **WEIGHT** — Confidence:
   - 1.0 — explicit framework / methodology note with ≥3 cross-references
   - 0.7 — recurring topic across ≥3 files
   - 0.4 — single note without backlinks
5. **CAP** — ≤ 200 atoms, top-weighted.
6. **APPEND** — JSONL to `<atom-output-path>`.

## Failure modes

- `memory/` does not exist → halt, surface `vault-missing` error
- Glob returns 0 markdown files → return empty JSONL (silent extractor — not an error)
- Timeout > 120s → return partial, mark `degraded:true`

## Genius protocol contract

`memory/` is the user's curated vault — explicit corpus delivery by virtue of being maintained. Not guessing.

---

**Built on SIP** — Source command: /sis-forge Phase 1 extractor
