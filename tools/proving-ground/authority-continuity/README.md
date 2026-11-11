# Authority continuity

Explore what happens to an approval when an agent remembers a document, hands work to a colleague, or resumes after an interrupted action.

This is an **offline contract replay** in the existing Proving Ground harness lane. Fourteen authored traces form seven benign/adversarial pairs. Three mock controls expose differences between prompt policy, ordinary scoped authorization and approval binding with recovery reconciliation. No model is called and no external action is performed.

```sh
node --test tools/proving-ground/authority-continuity/replay.test.mjs
node tools/proving-ground/authority-continuity/replay.mjs
```

Node 22 or 24 is required. No package installation, credentials or paid inference is needed. The CLI prints JSON to standard output; redirect it to a private evidence file when needed.

## What the replay establishes

Fixtures cover persistent memory, a handoff claiming approval, revocation, altered artifacts, lost acknowledgements, tenant isolation and expiry. Observations are untrusted data. The trusted test controller owns grants and revocation; fixture actions cannot create either. The ordinary scoped baseline checks tenant, subject, destination scope, expiry, revision and revocation. The additional control binds the approved recipient/artifact and consumes one approval exactly once in its single-process mock ledger.

Every emitted effect is scored against the original authorized intent. Reports count unauthorized effects and benign completion separately. Source and dataset hashes accompany the receipt. Unknown model, token and cost measurements remain null. A deny-everything implementation fails the benign completion requirement.

The input traces already specify the proposed actions. Consequently these results say nothing about whether a model follows injected text, detects poisoning, or chooses a useful recovery action. The candidate control is a test oracle and reference behavior, not a production credential service. Its in-memory ledger does not establish distributed race safety, durable exactly-once delivery or cancellation of an already dispatched action. The fixture assumes trusted session identity; authenticating real callers remains an adapter responsibility.

## Research continuation

The study and literature belong to the existing research method/domain owners. This module supplies executable fixture semantics under [portfolio safety evaluation #144](https://github.com/frankxai/agentic-ops/issues/144). [Research and compute #199](https://github.com/frankxai/agentic-ops/issues/199) owns program access.

Next gate: compare this narrow contract with AgentDojo/CaMeL and other prior work, then bind an actual permitted model/tool adapter to the same oracle. Freeze held-out scenarios, record native run IDs/configuration and all-attempt costs, and seek independent reproduction. Preserve public-model safety policies and isolate restricted cyber projects from customer traffic. A synthetic replay does not satisfy a model evaluation or production release gate.

## Contribution and release

Add a failing fixture before changing behavior. Explain which real workflow the case represents, what the attacker controls, the expected authorized effect and the strongest practical baseline. Keep customer data and credentials out of fixtures. Submit changes through review; the current implementation needs independent exact-revision review before integration. Files inherit the repository's MIT license. No protocol or Arcanea canon is changed.
