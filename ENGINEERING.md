# Engineering

How change lands on `main` in Starlight Intelligence.

This is the merge gate. It is not a deployment runbook and it is not permission to claim a live service.

## Gate

A pull merges only when every line is true.

1. It is not a draft.
2. Required checks are green on this head. A green run on an older commit does not survive a conflicting move of `main`.
3. GitHub reports the merge clean. A conflict or a dirty dependabot head gets a rebase, then a fresh run. Do not force-merge.
4. The diff matches the claim. A private Worker, OAuth grant, or publication is a separate manual gate.
5. A security advisory with green harness and contracts ships. A grouped minor stack waits until the lockfile is read.
6. If the pull says a local signer such as `tools/pr-gate.mjs` must sign the head, wait for that signature.
7. Source on `main` is not a Cloudflare deploy, a credential, or a store publication.

Squash is the default. Keep the pull number in the title.

## Do not merge

- Red `harness`, `contracts-and-compiler`, `kernel`, `continuity-gate`, or `verify`.
- Drafts, including Copilot drafts and the Command Center Home drafts.
- Heads whose body says a paired eval has not run, or whose merge is conditioned on an unsigned local gate.
- `AGENTS.md` contract splits (#175, #324, #325) until the author marks the ready slice and the checks are green on that slice alone.

If the merge API says the base branch was modified, retry once. If it conflicts, comment and stop.

## Pass on 10 October 2026

Landed:

| Pull | What | Evidence |
| --- | --- | --- |
| #334 | `sharp` 0.35.5 in `/console` | harness, scan, design, editorial green |
| #326 | Starlight Agent Designer, skills-only | harness, contracts, scan, reference-checks green. No runtime deployed |

Already on `main` from the 6 October pass: #277 plugin 0.3, #291 workspace scope, #280 Reality Architect pointer, #296 `ip-address` 10.7.3, #305 `source-map-js` 1.2.2, #297 `hono` 4.13.13.

Held:

| Pull | Why |
| --- | --- |
| #298 | `fast-uri` 3.1.8 fixes GHSA-hrr3-gc8f-f4qj. Checks were green, then the pull went dirty. Rebase, then merge. |
| #27 in starlight-memory | Clean and `verify` green. Author requires `pr-gate.mjs` on that exact head. |
| #175 and drafts #324 #325 | Ontology and AGENTS.md contract. Not this pass. |
| #340 #330 #328 | Drafts. Memory isolation and context capture stay draft until marked ready. |
| Command Center #65 #66 #68 | Still drafts. #51 was not line-reviewed this hour. |

## Next, in order

1. After Dependabot rebases #298, merge it if harness and contracts are green again.
2. Sign starlight-memory #27 with `pr-gate.mjs`, then squash.
3. Read one Command Center Home draft, mark it ready only if the diff stays inside Home, then merge that one.
4. Leave grouped bumps #331–#333 and #335–#338 until each lockfile is read on its own.
5. Do not stack another plugin lockfile change on the same day as a designer merge.

## Local proof

Run the check the path owns. Do not invent a green result.

- Designer: `node --test test/agent-designer.test.mjs` and `node scripts/sync-agent-designer-plugin.mjs --check`.
- Plugin cloud package: `npm test` inside `plugins/starlight-intelligence`.
- Foundry lockfile: `contracts-and-compiler` must be green.
- Memory projection: `node --test test/continuity-recall.test.mjs`, then the repo `verify` job, then `pr-gate.mjs` when the pull requires it.

Built on SIP. A merged pull is evidence of source. It is not evidence of production.
