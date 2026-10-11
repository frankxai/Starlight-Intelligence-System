# /prove

Independently evaluate a capability package or artifact and issue an evidence receipt.

## Syntax

```text
/prove <package-or-artifact>
```

## Evidence lanes

`static`, `behavioral`, `factual`, `artifact`, `taste`, `security`, `economic`, and `drift`.

Only lanes declared required by the Task Envelope block promotion. Every unrun required lane remains visible as pending.

## Execution

```bash
node tools/foundry/cli.mjs prove <package-directory>
```

Use `--execute-commands` only when the Task Envelope allows the exact executable. Commands run as argv with `shell: false`.

Use `--evidence <json>` to attach human or independent judge results. A taste judge result does not count unless it is marked producer-independent.

## Verdicts

| Status | Meaning |
|---|---|
| `validated` | Every declared required lane passed |
| `experimental` | Required evidence is pending or skipped |
| `revise` | A required test failed |
| `rejected` | A critical security test failed |

The receipt includes test results, lane coverage, SHA-256 artifact digests, and unresolved proof. “Looks good” is not a verdict.
