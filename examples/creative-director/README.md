# Creative director draft kernel

An operational Starlight example for typed creative workflows and governed context selection. This is original implementation informed by node-based creative tools. It does not amend SIP, dispatch media, authenticate a tenant, grant spend or approve publication.

## Run

```sh
npm run test:creative-draft
node examples/creative-director/plan.mjs
node examples/creative-director/plan.mjs --workflow examples/creative-director/creator-workflow.json
```

The plan command prints a portable draft manifest with dependency waves, semantic keys and explicit `externalDispatchAuthorized:false`. Supply `--output /path/manifest.json` to save it. No credentials or packages are needed.

## Contracts

- Typed ports, mandatory inputs, single input binding, cycle rejection and bounded JSON.
- Immutable revision-checked data proposals and downstream invalidation.
- Semantic keys include tenant, world, accepted world revision, node data and parent keys; canvas layout is separate.
- Context selection excludes another tenant/world/revision, revoked records and proposals before ranking.
- Required context fails rather than silently truncating. The offline byte/framing estimator ignores supplied token counts; production must count the complete prompt with the chosen model tokenizer.
- Synthetic quotes and browser-supplied policy are planning inputs, never authorization.
- Node schemas cover fields used by this example; production adapters must add model-specific input and output contracts, source/reference/output digests and current capabilities.

The Glass Tide and creator examples are fictional. The world example is one five-second scene with two still candidates. Its provider model IDs, availability and quotes must be verified before an actual run. GenCreator's example is a local content mission, not a persisted CreatorPack.

## Product owners

Starlight owns this pure reference. Arcanea owns worlds, canon and its application graph. GenCreator owns CreatorPack, voice, source permissions and its AgentRuntime. Browser labs generated from this source are inspectable draft projections and must not create a second product data plane.

Read AGENTS.md, SKILL.md and team.json here for the scoped handoff. The global `starlight-creative-execution` skill coordinates verified releases; it does not replace existing product agents.

## Evidence

`kernel.test.mjs` covers graph topology, data shape, serialization bounds, revision binding, safe quotes, invalidation, namespace boundaries and context filtering. The `Creative director proof` workflow runs these tests and captures existing public reference pages at 375/768/1440 before web implementation. A passing capture job is not a visual verdict; inspect the uploaded images.
