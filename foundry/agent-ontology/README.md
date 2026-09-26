# foundry/agent-ontology — scanner · capability-graph atlas · SOUL compiler · router

Zero-dependency Node ESM. In full-estate mode, reads agent definitions the estate holds (SIS agent markdown, Claude
Code subagents, GitHub Copilot agents, Arcanea YAML teams, Agent Cards, forge specs, constitutions)
plus SKILL.md packages in available runtimes, into one record shaped like the Agent Card
(`identity / mind / will / body`) with provenance. From that record:

| File | Does |
|---|---|
| `agent-ontology.mjs` | the scanner; `--stats`, `--dump <name>` |
| `gen-agent-atlas.mjs` | projects the Foundry capability graph (`contracts/capability-graph.schema.json`, validated recursively every run) + `agents.atlas.json` + `AGENT-ATLAS.md`; `--check` fails on drift |
| `agent-compile.mjs` | composes an agent's SOUL in a fixed seven-layer order (`SOUL.md`) and emits `claude-code`, `claude-sdk`, `soul`, `context-pack` (a CompileRequest `compileInstructionPack` accepts), `a2a` (AgentCard v1.0.0 + SIP extension) |
| `agent-route.mjs` | one router: intent/files/brand/risk-class signals, work shape read from the routing matrix, verifier never the maker, refuse/ambiguous instead of guessing |
| `team-cli.mjs` | offline `starlight team` preview, no-spend fixture, opt-in repo-scoped Claude projection, conservative rollback |

The npm package exposes the typed `./foundry` subpath. The packaged beta contains a public-safe `starlight-team-guide` source, not the full estate roster. See `docs/product/agent-platform-beta/QUICKSTART.md`. A2A cards are templates with `.invalid` interfaces until a host binds and tests an HTTPS endpoint; schema-shaped output is not an interoperable exchange claim.

In a public SIS checkout, the scanner reads only checked-in SIS agents and skills. It does not
read the operator's home directory. The compiler uses checked-in portable kernel, brand,
constitution, authority, and verification sources when the full estate policy files are unavailable. An unbound agent's
Claude Code and SDK projections are restricted to `Read, Glob, Grep`.

For the full private multi-repo estate, opt in explicitly:

```
set STARLIGHT_ESTATE=<operator-estate-root>
set STARLIGHT_SCAN_HOME=1
node foundry/agent-ontology/tests/agent-ontology.test.mjs
node foundry/agent-ontology/tests/agent-compile.test.mjs
node foundry/agent-ontology/tests/agent-route.test.mjs
node foundry/agent-ontology/agent-route.mjs "review this PR for security issues before merge"
```

The public-checkout gate needs no private files:

```
node foundry/agent-ontology/tests/portable.test.mjs
```

The control-plane copy in `starlight/tools` remains a separate operational copy until an
intentional, reviewed sync. Do not publish its generated private graph into this repository.
Gate record: Grok 4.6 read-only pass 3 → PASS 0.91 after two ITERATE rounds (see the PR body).
