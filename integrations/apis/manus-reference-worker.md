# Manus Reference Worker

This adapter position lets Codex or Hermes delegate bounded work to Manus API v2 without making Manus the source of truth.

## Use for

- wide reference research that benefits from autonomous breadth;
- a disposable alternative site or interaction prototype;
- long-running isolated work where a webhook is more useful than holding a local agent session;
- presentation, report, or data-processing variants that will be reviewed before use.

Do not delegate ordinary repo edits, small visual fixes, or work Codex can complete with direct source access.

## Contract

Every invocation supplies:

- `purpose`, `brand`, `surface`, and `acceptance_criteria`;
- canonical input files or URLs;
- an output destination that is not a production branch;
- a maximum credit/budget policy enforced by the caller;
- a timeout and webhook/polling policy;
- a list of allowed connectors;
- explicit publication and external-write policy;
- the reference lock from `REFERENCE-INTELLIGENCE.md`.

Every result returns:

- task and project IDs;
- files, checkpoints, or URLs produced;
- source ledger and limitations;
- cost/usage receipt;
- comparison against acceptance criteria;
- a promotion recommendation, never an automatic canon decision.

## Authentication

Use API v2 at `https://api.manus.ai` with `MANUS_API_KEY` in a secret manager or local environment. Never commit keys. API keys provide broad account access; use separate development and production keys and rotate any exposed value.

Install current API guidance for Codex:

```bash
npx skills add https://open.manus.ai/docs --skill manus-api --agent codex --global --yes
```

## Default policy

- Allowed without a second gate: create an isolated task, attach approved input files, read results, stop a task.
- Requires a human confirmation gate: connector writes, public website publication, custom-domain changes, production repository writes, outbound messages, and spending beyond the caller's declared ceiling.
- Forbidden: secrets in prompts or artifacts, source-of-truth promotion by Manus, and production publication from an unreviewed checkpoint.

## Promotion

A winning output is exported into an owning GitHub repository branch. Codex performs deterministic validation, visual comparison, accessibility checks, and preference review. Notion receives the decision record. Manus-hosted state remains an experiment unless explicitly adopted.
