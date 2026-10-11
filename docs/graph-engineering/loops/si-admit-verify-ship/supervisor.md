# Supervisor — si-admit-verify-ship

Independent checker. Do not fill this as the maker.

## Identity

- Supervisor actor must differ from the executor named in `ledger.md`.
- Preferred: Claude review CLI, or a later Hermes turn that only reads.

## Re-run from disk

1. `git status --porcelain=v1 --untracked-files=all` in this worktree.
2. Confirm `docs/graph-engineering/CONTRACT.md` still forbids per-agent graphs, GraphRAG-as-memory, and a third orchestrator.
3. `npm run test:work-graph`
4. `npm run test:graph-engineering`
5. Confirm a draft PR URL exists before marking verify passed.
6. Confirm no `private/`, `.env`, or transcript dump was staged.

## Verdict

- `PASS` only if every command above was actually run and the PR exists.
- `HOLD` if gates pass but the PR or a human gate is missing.
- `FAIL` if the contract drifted or tests failed.

Do not accept a maker saying "tests passed."
