# Memory Bus — the shared write surface

> One append-only log every harness and every session writes to. Local or cloud,
> Claude or Codex or Cursor or Gemini — same file. This is what makes "everything
> interconnected and updated" a mechanism instead of a hope.

## Why this exists

The old cross-repo indexer only saw `~/.claude/projects/*` on one machine, so
work done by any other harness (or any cloud session) was invisible. The bus
fixes that by being **in-repo and git-versioned** — it travels with the repo and
every session can read and append to it.

## Files

- `atoms.jsonl` — the log. One JSON object per line. Append-only. Never rewritten.

## Atom schema

Every line is one atom. Two producers write here:

**1. Discovery atoms** (from `scripts/org-poller.mjs`):
```json
{"ts":"2026-07-13T19:30:00Z","kind":"repo.discovered","source":"org-poller","repo":"ana-ai-business-kit","slug":"frankxai/ana-ai-business-kit","visibility":"public","pushed_at":"2026-07-13T16:12:09Z"}
{"ts":"...","kind":"repo.updated","source":"org-poller","repo":"...","slug":"...","pushed_at":"..."}
```

**2. Session-end atoms** (from `scripts/mesh-atom.mjs`, written by any harness on wrap):
```json
{"ts":"2026-07-13T19:45:00Z","kind":"session.end","source":"claude","repo":"Starlight-Intelligence-System","branch":"claude/...","summary":"Built the interconnection mesh spine","commits":["06dccac","dd064ca"],"next":"wire the cloud routine"}
```

### Field contract

| field | required | meaning |
|---|---|---|
| `ts` | yes | ISO-8601 UTC timestamp |
| `kind` | yes | `repo.discovered` \| `repo.updated` \| `session.end` |
| `source` | yes | producer: `org-poller` \| harness name (`claude`/`codex`/`cursor`/`gemini`) |
| `repo` | yes | short repo name |
| `slug` | disc. | `owner/repo` (discovery atoms) |
| `branch` | session | branch worked on |
| `summary` | session | one line, plain language, no hype |
| `commits[]` | session | short SHAs produced |
| `next` | session | the handoff — what the next session should pick up |

## Rules

- **Append-only.** Consolidation reads the log and writes summaries elsewhere (the vaults); it never mutates atoms.
- **`MEMORY.md` stays authoritative per repo.** The bus indexes cross-repo; each repo's `MEMORY.md` remains its own durable narrative. `mesh-atom.mjs` updates both.
- **No secrets.** Atoms are summaries and identifiers, never tokens, keys, or file contents.

Built on SIP.
