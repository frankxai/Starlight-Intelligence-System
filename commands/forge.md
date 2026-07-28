# /forge

Compile a user intent into the smallest justified portable capability package.

## Syntax

```text
/forge skill <brief>
/forge agent <brief>
/forge swarm <brief>
/forge vertical <brief>
/forge plugin <brief>
```

## Routing

| Kind | Skill | Gate |
|---|---|---|
| `skill` | `foundry/skill-forge` | Reusable procedure without persistent autonomy |
| `agent` | `foundry/agent-forge` | At least one durable policy boundary |
| `swarm` | `foundry/system-forge` | Multiple distinct roles plus termination |
| `vertical` | `foundry/system-forge` | Recurrent domain constraints and capability composition |
| `plugin` | `foundry/system-forge` | Validated skills packaged for ChatGPT Work and Codex |

## Execution

1. Write and validate a Task Envelope.
2. Resolve existing capabilities against the generated capability graph.
3. Author the kind-specific pack.
4. Compile:

   ```bash
   node tools/foundry/cli.mjs forge \
     --envelope <task-envelope.json> \
     --pack <kind-pack.json> \
     --out <package-directory>
   ```

5. Run `/prove` before claiming the package is validated.

## Non-negotiable behavior

- Do not create an agent when a skill or temporary worker owns the outcome.
- Do not infer permission to publish, spend, delete, expand access, or change substrate.
- Do not silently accept lexical capability suggestions; record the selection decision.
- Do not describe a task graph as executed unless runtime spans or receipts exist.
