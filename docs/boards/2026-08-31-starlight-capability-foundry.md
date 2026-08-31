# Board decision: Starlight Capability Foundry

Date: 2026-08-31  
Decision: PROCEED WITH CONDITIONS  
Scope: cross-ecosystem capability release, validation, evidence, distribution, and continuous refinement

## Decision question

Should Starlight make cross-ecosystem skill/MCP/plugin/app/custom-agent packaging and release assurance a key product, and should the current Foundry become its canonical platform layer?

## Options reviewed

| Option | Description |
|---|---|
| A | Keep Foundry as internal tooling and ship each ecosystem manually |
| B | Build a generic marketplace first |
| C | Build Capability Foundry as the release/assurance plane; add Exchange after reliability |
| D | Standardize only on MCP and ignore host-native packaging |

## Board perspectives

| Perspective | Finding |
|---|---|
| Venture | Multi-host release pain is real and recurring; assurance is a sharper wedge than a broad catalog |
| Platform | One portable source plus explicit adapters prevents repository and semantic fragmentation |
| Developer ecosystem | Agent Plugins 1.0.0 is the best portable core, but native overlays and host tests remain necessary |
| Security/provenance | Receipts, secret isolation, permission review, redaction, SBOM, and authenticated attestations are mandatory |
| Operations | P0 must be narrow; real clean-install and update/uninstall runners determine margin |
| GTM | Sell launch and ongoing release confidence to existing capability vendors before self-serve marketplace supply |
| Red team | The largest risk is false compatibility/support claims created from package shape or screenshots alone |

## Scoring

Scale: 1 poor, 5 strong.

| Criterion | A Manual | B Marketplace first | C Foundry release plane | D MCP only |
|---|---:|---:|---:|---:|
| Customer pain | 2 | 3 | 5 | 3 |
| Differentiation | 1 | 2 | 5 | 2 |
| Technical leverage | 1 | 3 | 5 | 4 |
| Trust and defensibility | 1 | 2 | 5 | 2 |
| Near-term feasibility | 3 | 2 | 4 | 4 |
| Enterprise path | 1 | 3 | 5 | 3 |
| Scope control | 2 | 1 | 4 | 3 |
| Weighted conclusion | 1.6 | 2.3 | 4.8 | 3.0 |

## Verdict

Choose option C.

Capability Foundry becomes the canonical Starlight product layer for:

- portable capability contracts;
- deterministic host packaging;
- runtime and authentication policy;
- clean install and lifecycle validation;
- screenshots, recordings, traces, logs, and listing evidence;
- expiring platform receipts;
- drift detection and smallest-layer repair;
- receipt-derived GTM and, later, Exchange catalog state.

The marketplace is a downstream distribution product. It does not become the source of truth.

## Conditions

1. No public verified, published, or supported claim without a current receipt.
2. Structural schema validation must never be described as cryptographic signature verification.
3. Human consent, legal, billing, privacy, and final marketplace submission remain human gates.
4. P0 is OpenAI/ChatGPT/Codex, Claude, Cursor, and VS Code/Copilot.
5. starlight-creator-mcp is the first reference runtime.
6. SIS remains the contract authority; AIS consumes receipts.
7. Third-party publisher and license provenance are explicit.
8. Packages and evidence contain no secrets or customer data.
9. Exchange discovery work waits for the 90-day reliability gates.
10. Each host surface can be paused or retired independently.

## Immediate authorization

Authorized in this foundational slice:

- contracts and machine-readable registry;
- portable/OpenAI/Claude skills-only package scaffolding;
- compiler safety and target-gating changes;
- local conformance/invariant tests;
- GitHub workflow and issue template;
- architecture, GTM, roadmap, and Codex handover;
- creation of review PR and implementation issues.

Not authorized by this decision alone:

- production credentials;
- paid infrastructure;
- connected-account consent;
- marketplace submission or publication;
- public support badges;
- merging the PR;
- production deployment.

## Proof gates

### 14-day gate

- pinned upstream/native validators in CI;
- authenticated attestation verifier;
- production-shaped starlight-creator-mcp staging runtime;
- one clean host runner;
- evidence redaction and durable storage design;
- two design-partner conversations.

### 30-day gate

- first complete P0 reference release candidate;
- support-state indexing in AIS;
- marketplace submission kits reviewed;
- measured runner labor and failure modes.

### 90-day gate

Proceed toward Exchange only if the spec’s receipt coverage, install reliability, update/uninstall, privacy, design-partner willingness-to-pay, and margin gates pass.

## Kill or narrow triggers

- host testing cannot be made repeatable;
- fewer than two design partners complete P0 verification;
- evidence handling creates unacceptable privacy risk;
- host review/policy dependencies dominate the value;
- repeated adapter labor prevents viable gross margin;
- public claims cannot be kept receipt-backed.

## SIP attestation

The decision preserves capability-first architecture, deterministic contracts, least privilege, evidence before promotion, explicit human authority, and ratified evolution. It changes no substrate contract; it extends the Foundry operational/release layer.
