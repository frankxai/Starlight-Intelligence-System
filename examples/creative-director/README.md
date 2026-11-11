# Creative director draft kernel

An operational Starlight example for typed creative workflows and governed context selection. This is original implementation informed by node-based creative tools. It does not amend SIP, dispatch media, authenticate a tenant, grant spend or approve publication.

## Run

```sh
node --test examples/creative-director/kernel.test.mjs
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


## Assess a revision and continue only the necessary work

`assessWorkflow(workflow, artifacts, receipts, policy)` extends the existing graph
and semantic keys with a deterministic assessment. Select release/output node IDs;
the assessment visits their ancestors, preserves current accepted outputs, and
lists the first repairable nodes plus the remaining repair order. It never dispatches.

The host supplies a current artifact manifest and separate acceptance receipts:

```js
const artifacts = [{
  nodeId: "audio", nodeKey: keys.audio, sha256: observedArtifactDigest,
  producerId: "audio-maker"
}];
const receipts = [{
  nodeId: "audio", nodeKey: keys.audio, artifactSha256: observedArtifactDigest,
  verifierId: "audio-checker", verdict: "accepted",
  evidenceDigest: observedReviewDigest, inputDigests: {}
}];
const assessment = await assessWorkflow(workflow, artifacts, receipts, {
  requiredNodeIds: ["export"], allowedVerifierIds: ["audio-checker"]
});
```

This partial example leaves all other required nodes unaccepted. Every required
source, context, generation, review and export node needs its own current manifest
and receipt. All digests use `sha256:` followed by 64 lowercase hex digits.
`inputDigests` maps each direct predecessor node ID to the current artifact digest
actually inspected by that node's verifier. It must cover exactly those predecessors.
The verifier must be allowed by the supplied policy and different from the producer.

A semantic edit invalidates the affected node keys and downstream evidence.
Changed artifact bytes also invalidate a receipt even when its semantic key is
unchanged; changed predecessor bytes invalidate consumers. A locally matching
receipt cannot rescue a descendant whose prerequisite remains unaccepted.
Duplicates are rejected, rather than choosing an arbitrary newest receipt.
The caller must select a single current receipt per node before assessing.

`preservedNodeIds` contains accepted prerequisites in the requested scope.
`repairOrder` contains every unaccepted node in that scope; `readyRepairNodes`
contains only those whose prerequisites are accepted. A repair may mean restoring
an artifact, obtaining missing review, or regenerating output. These are planning
results, not executable work authorizations. Unrelated graph branches appear in
`excludedNodeIds`. Reassess after supplying new artifact and evidence manifests.

`estimatedRepairMinor` sums current fixture generation quotes for paid nodes in
the repair order. It excludes review and other costs, may overestimate when only
review is needed, and is neither actual usage nor a spending reservation.
`actualCostMinor` remains `null`. The assessment digest binds the requested
revision, selected output scope, current subject digests, supplied identities,
policy and result; no clock or provider call affects it.

The host must read and hash actual artifact/evidence bytes, authenticate producers
and verifiers, enforce tenancy/rights/permissions, and admit execution separately.
This pure function only checks the supplied bindings. It verifies no signatures,
artifact bytes or reviewer quality. `releaseReady:true` means the supplied evidence
is internally consistent for the requested graph; it does not approve publication.
The original typed graph remains the topology owner. This API adds no scheduler,
router, storage service, generic work-graph format or production protocol.

## Product owners

Starlight owns this pure reference. Arcanea owns worlds, canon and its application graph. GenCreator owns CreatorPack, voice, source permissions and its AgentRuntime. Browser labs generated from this source are inspectable draft projections and must not create a second product data plane.

Read AGENTS.md, SKILL.md and team.json here for the scoped handoff. The global `starlight-creative-execution` skill coordinates verified releases; it does not replace existing product agents.

## Evidence

`kernel.test.mjs` covers graph topology, data shape, serialization bounds, revision binding, safe quotes, invalidation, namespace boundaries and context filtering. The `Creative director proof` workflow runs these tests, checks generated projections and exercises all three HTTP-served labs at 375/768/1440. Browser regressions cover actual downloads, newer edits during export, malformed restore, saved planning settings, preserved creator writing and voice dependencies. Existing public pages are captured separately as design references. Inspect the uploaded images alongside the recorded checks.
