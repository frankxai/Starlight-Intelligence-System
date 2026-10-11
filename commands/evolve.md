# /evolve

Translate a Foundry Evidence Receipt into a smallest-responsible-layer patch proposal.

## Syntax

```text
/evolve <package-or-receipt>
```

## Execution

```bash
node tools/foundry/cli.mjs evolve <evidence-receipt.json> --out <evolution-proposal.json>
```

## Rules

1. Start from a real receipt, not aesthetic dissatisfaction or aggregate score alone.
2. Map each failed or pending required test to the smallest responsible layer:
   - contract or compiler;
   - procedure or runtime;
   - evidence policy;
   - renderer or packaging;
   - taste profile;
   - permissions or guardrails;
   - routing or budget;
   - registry or adapter.
3. Do not auto-apply. The proposal records `apply: false`.
4. Security and drift patches require approval.
5. Re-run the same failing test after patching; do not move the goalpost.
6. Write durable learning only after the new receipt passes.
