# Graph adoption kit

Inspect an existing repository, declare one bounded workflow, and verify that its instructions and graph have not drifted. Node.js 18+ and Git are sufficient. No package installation, API keys, database or standing agents.

This is a report-only adoption tool, not a scheduler, authorization service or deployment agent. The TypeScript loop engine in this repository records supplied receipts; a host must independently resolve artifacts and authenticate actors. Never treat either tool's success as permission to publish.

## Try it in this checkout

```sh
node tools/graph-adoption/cli.mjs inspect .
node tools/graph-adoption/cli.mjs check .
node tools/graph-adoption/cli.mjs mermaid . docs/graph-engineering/loops/diamond-review.v1.json
node --test tools/graph-adoption/core.test.mjs
```

`check` returns JSON with `ok: true`, source SHA-256 digests and measured instruction bytes. It does not run the manifest's check commands. Exit codes: 0 = completed, 1 = conformance failed, 2 = usage/access/parse failure. Mermaid output visualizes the supplied topology; it does not establish that its runtime works.

Graph checks here are intentionally structural only (nonempty unique node IDs and valid edge endpoints). They do **not** call the TypeScript `compileLoopGraph` or check its brakes, cycles, role or terminal invariants. In the SIS runtime, also run `npm run test:work-graph`; a foreign runtime needs its own compiler and tests.

## Bring an existing repository

1. Copy this four-file directory (`core.mjs`, `cli.mjs`, `core.test.mjs`, `README.md`) into your repository after reviewing the source and MIT license at the repository root. Pin the upstream commit in your change description.
2. Add a `graph-adoption.json` using this repository's example. Choose the real instruction files, local graph file, owner, distinct maker/checker identities and commands your maintainers actually run. Keep publication, spend, credential and destructive actions human-gated.
3. Run `check .`. Fix missing files and budget overruns. A byte budget is an exact input-size limit, **not** a provider token count. Measure actual billed tokens separately.
4. Run your declared checks yourself. Ask a different provider to review the resulting artifacts. Submit one draft PR; promote only after the repository's normal release gates pass.

Keep your existing AGENTS.md and harness settings. Add only a short pointer to the adoption manifest when useful; do not copy a global instruction corpus or elevate a skill above the host's instruction hierarchy. Skills are loaded only when selected, fully read, with their required references. Runtime rules remain the responsibility of the host.

## Portfolio coverage without bulk mutation

```sh
node tools/graph-adoption/cli.mjs portfolio /absolute/path/to/repositories
```

Only immediate Git roots are inspected, serially. It includes tracked hidden instruction paths, excludes ignored files, and never reads instruction contents during discovery. Source-candidate/mirror counts are filename heuristics, not proof of canonical authority. Dirty and unreadable repositories are explicit. Home and drive roots are refused.

The report includes local repository names, branch names and commits: **keep it private**. Worktrees outside the explicit root and repositories only on GitHub are outside coverage. `declared-unchecked` means a manifest exists, not that it passes. No automatic rollout, remote push, branch creation, scheduled work or instruction rewriting occurs.

Safety boundary: path checks reject existing symlinks/junctions and private/generated paths, but validation and file reads are not one atomic filesystem operation. Stop concurrent writers before checking selected sources; this tool is not a security sandbox for a hostile, actively changing checkout. Git fsmonitor hooks and recursive submodule traversal are disabled during inspection. Byte totals cover only explicitly selected sources, not ambient host prompts or subsequently loaded references.

## Adopt by domain

| Domain | First workflow | Independent evidence |
| --- | --- | --- |
| Software | issue → patch → tests → review | exact commit and test result |
| Design | brief → composition → export → critique | inspected desktop/mobile exports |
| Content | source brief → draft → facts/voice review | claim ledger and approved artifact |
| Research | question → parallel sources → code merge → synthesis | primary-source citations |
| Revenue | demand → offer hypothesis → review | real demand evidence, no live charge |
| Operations | sensor → classification → proposal | timestamped observations, no repair |

Start with one operating owner, domain stewards and temporary workflow leads. Share graph contracts across domains; keep each brand's voice, rights, audience and publishing authority separate. A heartbeat proves a process signalled, not that a workflow produced a useful outcome.

## Limits and contribution path

Current: inventory, local conformance, source binding and topology export. Target: dependency-aware instruction compilation, authenticated receipts, durable resume, OpenTelemetry/Langfuse adapters and automated cross-repo PR rollout. These are not implemented by this kit.

`evaluateLoopGraph` is a conservative admission assessment: an already exhausted budget halts it. `runLoopEngine` records each step against its incremental declared cost and may accept a zero-cost step at the exact cost ceiling. The assessment is not a step-for-step dry-run predictor; neither API meters actual provider spending.

Contribute one failing fixture and a narrow fix. Keep the CLI dependency-free and read-only. Test path escapes, missing inputs, non-Git roots and dirty checkouts. Do not put real telemetry, private repository inventories or provider credentials in fixtures.
