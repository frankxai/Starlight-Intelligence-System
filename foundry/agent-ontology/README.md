# foundry/agent-ontology — scanner · capability-graph atlas · SOUL compiler · router

Zero-dependency Node ESM. Reads every agent definition an estate holds (SIS agent markdown, Claude
Code subagents, GitHub Copilot agents, Arcanea YAML teams, Agent Cards, forge specs, constitutions)
plus SKILL.md packages in seven runtimes, into one record shaped like the Agent Card
(`identity / mind / will / body`) with provenance. From that record:

| File | Does |
|---|---|
| `agent-ontology.mjs` | the scanner; `--stats`, `--dump <name>` |
| `gen-agent-atlas.mjs` | projects the Foundry capability graph (`contracts/capability-graph.schema.json`, validated recursively every run) + `agents.atlas.json` + `AGENT-ATLAS.md`; `--check` fails on drift |
| `agent-compile.mjs` | composes an agent's SOUL in a fixed seven-layer order (`SOUL.md`) and emits `claude-code`, `claude-sdk`, `soul`, `context-pack` (a CompileRequest `compileInstructionPack` accepts), `a2a` (AgentCard v1.0.0 + SIP extension) |
| `agent-route.mjs` | one router: intent/files/brand/risk-class signals, work shape read from the routing matrix, verifier never the maker, refuse/ambiguous instead of guessing |

The scanner resolves the estate root from `STARLIGHT_ESTATE` when vendored here:

```
set STARLIGHT_ESTATE=C:\Users\frank\starlight
node foundry/agent-ontology/tests/agent-ontology.test.mjs
node foundry/agent-ontology/tests/agent-compile.test.mjs
node foundry/agent-ontology/tests/agent-route.test.mjs
node foundry/agent-ontology/agent-route.mjs "review this PR for security issues before merge"
```

Without an estate the scan is empty by design; the tests that need real files say so. The
control-plane copy in `starlight/tools` is the working source until this lands; keep them identical.
Gate record: Grok 4.6 read-only pass 3 → PASS 0.91 after two ITERATE rounds (see the PR body).
