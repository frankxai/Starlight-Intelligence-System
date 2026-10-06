# Engineering

How change lands on `main` in [Starlight Intelligence](https://github.com/frankxai/Starlight-Intelligence-System).

This is the merge gate. It is not a deployment runbook, not a brand guide, and not permission to claim a live service.

## Gate

A pull request merges only when every line below is true.

1. It is not a draft. A proposal stays a proposal until the author marks it ready.
2. Required checks are green on **this** head. A green run on an older commit does not count after `main` moves through the same files.
3. GitHub reports the merge clean. A conflict gets a rebase and a fresh run. Do not force-merge.
4. The diff matches the claim. Docs that describe a private Worker, OAuth, or a publication must match a probe from this change, or they must say the probe failed.
5. Security patches (reject-malformed, GHSA, lockfile-only) ship when harness is green. A grouped minor/patch stack waits until someone reads the lockfile diff.
6. Source on `main` is not a Cloudflare deploy, a credential, a managed OAuth grant, or a store publication. Those stay manual gates.

Squash is the default. The commit title keeps the pull number.

## What we do not merge

- Red `harness`, `contracts-and-compiler`, `kernel`, or `continuity-gate`.
- Heads whose body says a paired eval has not run.
- Drafts, including Copilot drafts, until a person marks them ready and checks the citations.
- Ontology or AGENTS.md contract changes that have not been asked for in the current pass.

If the merge API returns "base branch was modified", retry once. If it returns a conflict, comment the rebase and stop.

## Pass on 6 October 2026

Landed on `main`:

| Pull | What | Evidence |
| --- | --- | --- |
| #296 | `ip-address` 10.7.3 in the plugin | harness, verify, scan green |
| #291 | Workspace session import reports scope | continuity-gate and harness green; lockfile untouched |
| #280 | Reality Architect registered as an external SIP vertical | kernel CI green; pointer only |
| #277 | Portable plugin 0.3 and read-only capability workflows | harness, verify, design, editorial green. Host render still open |
| #305 | `source-map-js` 1.2.2 in `/site` | harness, scan, contracts green |
| #297 | `hono` 4.13.13 in the plugin | already merged at 02:49 UTC, including the `serveStatic` decode fix |

Held:

| Pull | Why |
| --- | --- |
| #269 | Scoped recall tests are green on the old head and conflict with current main. Rebase, do not force. |
| #298 | `fast-uri` bump. `contracts-and-compiler` and `harness` failed. |
| #293 and the other grouped bumps | Not read. Rebase after the plugin merge, then review the lockfile. |
| #301, #175, and the other drafts | Still drafts. |

## Next, in order

1. Rebase #269 and rerun the scope tests.
2. Rebase #298. Merge only if contracts and harness go green.
3. Read #293 alone. Do not stack it with another plugin lockfile change.
4. `starlight-command-center`: review the ready Home pulls one at a time.
5. `starlight-technology`: framework bump only if that repo's build is green. Leave the Creator Studio draft alone.
6. `starlight-memory`: do not merge the embedding cache until the paired eval the author named has actually run.

## Local proof, when you touch code

Run the check the path owns. Do not invent a green result.

- Plugin: `npm test` and `npm run build` inside `plugins/starlight-intelligence`.
- Continuity: the continuity test file named in the pull, then `continuity-gate` on the pull.
- Kernel docs under `docs/reality-architecture`: the kernel workflow, not a site build.
- Foundry lockfile: `contracts-and-compiler` must be green. A prose "tests passed" note does not replace it.

Built on SIP. A merged pull is evidence of source. It is not evidence of production.
