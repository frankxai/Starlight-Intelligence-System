# /sis-forge — Substrate command (pre-alpha)

> Auto-extract patterns from the user's SIS-tracked corpus and emit a density bucket report. Pre-alpha ships Phases 1+2 only; Phase 3 (proposal assembly) and Phase 4 (Board + spawn) follow in alpha/beta.

**Tier:** Substrate-class (Phase 4 in later versions touches verticals/, STACK.md, REGISTRY.md)
**Version:** v8.x-pre-alpha
**Spec:** `docs/superpowers/specs/2026-05-17-sis-forge-design.md`

## Pre-alpha invocation

```
/sis-forge
  [--exclude-source <name>...]       # skip: transcripts | vault | prompts | repos | external
  [--include-pattern <glob>]
  [--since <ISO-date>]
  [--dry-run]                        # run extractors + classifier, print summary, skip output file
```

Phase 4 flags (`--commit`, `--mode`) are reserved but inert in pre-alpha.

## Phase 1 — Corpus Pull

Dispatch 5 sub-agents in parallel via Agent tool:

1. `agents/sis-extractor-transcripts.md` — pulls from `~/.claude/projects/*`
2. `agents/sis-extractor-vault.md` — pulls from `memory/`
3. `agents/sis-extractor-prompts.md` — pulls from `skills/` + `agents/` + `commands/`
4. `agents/sis-extractor-repos.md` — pulls from repo portfolio audit
5. `agents/sis-extractor-external.md` — adaptive Notion / Drive / Cowork

Each sub-agent writes atoms as JSONL to `.sis-forge/atoms-<source>-<ts>.jsonl`.

Apply `--exclude-source` by skipping the matching sub-agent. Apply `--include-pattern` and `--since` by passing them into each sub-agent's invocation prompt.

After all five complete, concatenate JSONL files:

```bash
cat .sis-forge/atoms-*-<ts>.jsonl > .sis-forge/last-corpus-<ts>.jsonl
```

## Phase 2 — Classifier

Run the Phase 2 CLI:

```bash
npx tsx tools/sis-forge/cli.ts .sis-forge/last-corpus-<ts>.jsonl
```

Output: `.sis-forge/buckets-<ts>.json` with the full `BucketReport`. Stdout summarizes:

```json
{
  "mode": "auto-build" | "propose-menu" | "empower",
  "totalAtoms": <number>,
  "byBucket": { "signature": N, "framework": N, "anecdote": N },
  "clusterCount": <number>,
  "outPath": ".sis-forge/buckets-<ts>.json"
}
```

## Genius protocol contract

Per `/discover-genius` reasoning protocol step 1: corpus must be actively delivered, never guessed. The 5-adapter pull constitutes **explicit, enumerable corpus delivery**. User invocation = consent signal. Sources are listed in `.sis-forge/last-corpus-<ts>.jsonl`; user can `--exclude-source` any of them.

## Pre-alpha exit codes

| Code | Meaning |
|------|---------|
| 0    | Success — bucket report written |
| 50   | Pre-flight failed (missing dependency) |
| 60   | Atom budget exhausted (> 20k atoms) |
| 64   | Usage error (bad flag) |
| 66   | Input file missing |

## What pre-alpha does NOT do

- No roadmap doc / proposal output (lands in alpha)
- No `/starlight-board` invocation (lands in beta)
- No `/spawn-domain-stack` invocation (lands in beta)
- No explicit-ack prompt (lands in beta)
- No companion skill auto-activation (lands in stable)
- No empower-mode handoff to `/discover-genius` (lands in alpha)

## Limitations

The density classifier biases toward refinement over exploration — patterns repeated ≥3 times surface; novel ideas thought once do not. See spec §11 for the structural counter-pressures and the quarterly-run mitigation rule.

---

**Built on SIP** — Substrate command, v8.x-pre-alpha
- Layers used: [file-contract, attestation, commands]
- Verticals: starlight-intelligence-system@v8.x-pre-alpha
- Reproducibility: corpus snapshot at `.sis-forge/last-corpus-<ts>.jsonl`
