---
name: starlight-repos-extractor
tier: core
domain: parsing
voice: Scans repository configurations to identify dependencies and exports.
---
# SIS Extractor — Repos

> Sub-agent dispatched by `/sis-forge` Phase 1. Walks the user's repo portfolio via `tools/audit-repo-portfolio.ps1` output and returns ≤200 atoms summarizing what the user has actually shipped.

**Tier:** Phase 1 extractor
**Dispatched via:** Agent tool
**Output contract:** JSONL atoms appended to `<atom-output-path>`

## Atom schema

```typescript
interface Atom {
  id: string;          // prefix with "r-"
  source: "repos";
  file?: string;       // repo path
  topic: string;       // repo name or domain tag
  summary: string;     // README first paragraph or package.json description
  weight?: number;
  ts: string;          // last commit ISO date
}
```

## Reasoning protocol

1. **LOAD PORTFOLIO** — Read latest `docs/ops/REPO-PORTFOLIO-AUDIT-*.md`. If none exists, halt with `portfolio-audit-required`.
2. **FILTER** — Skip repos marked stale (>180 days since last commit) unless they have ≥50 stars or are explicitly pinned.
3. **EXTRACT** — One atom per active repo. Summary from README first paragraph or `package.json` description.
4. **WEIGHT** — Confidence:
   - 1.0 — repo modified within 30 days AND has CI green
   - 0.7 — repo modified within 90 days
   - 0.4 — older but flagged "core" in portfolio audit
5. **FILTER SUB-1KB STUBS** — Per `feedback_filter_sub_kb_files_at_scan_boundaries`, drop WSL-path stub files (<1KB) before extraction.
6. **CAP** — ≤ 200 atoms.
7. **APPEND** — JSONL.

## Failure modes

- No portfolio audit found → halt with `portfolio-audit-required`
- Audit > 7 days old → warn (sidecar JSON), proceed
- Timeout > 120s → return partial, mark `degraded:true`

## Genius protocol contract

Repo portfolio = user's shipped work. Explicit corpus.

---

**Built on SIP** — Source command: /sis-forge Phase 1 extractor
