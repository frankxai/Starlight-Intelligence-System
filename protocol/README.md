# SIP graph — v0.1.0

A versioned extension of the **Starlight Intelligence Protocol** (`../SIP.md`, v1.1.1).

SIP layers 1–6 govern files, attestation, the MCP registry, command tiers, sovereignty and
archetypes. They say what a compliant repository *carries* and what its parties *owe each other*.
They say nothing about the shape of the evidence a node publishes about its own work.

This directory adds that: **a proposed SIP layer 7, the evidence graph.** It is proposed until
`SIP.md` itself lists it (target: SIP v1.2.0); until then `SIP.md` and its six layers remain the
source of truth. Twelve node types and thirteen edge
types, where every element declares an owner, provenance, a version, a visibility, and the
evaluation rule it is judged by. It is a strict addition — nothing in SIP v1.1.1 changes, and a
repository can be SIP-compliant without publishing a graph at all.

Version namespace is independent of SIP's: profiles declare `sipGraphVersion: "0.1.0"`.

## What is here

| File | What it is |
|---|---|
| `sip-graph.v0.1.0.schema.json` | JSON Schema 2020-12 for a profile. Structure only. Loads under a strict validator — no non-keywords. |
| `sip-graph.v0.1.0.endpoints.json` | The published edge endpoint matrix, as data. JSON Schema cannot express it; rule G7 enforces it. |
| `conform.mjs` | Zero-dependency conformance checker. Prints a receipt. |
| `lib/graph.mjs` | Validator core and the claim-trace walk. No I/O, no dependencies. |
| `lib/mask.mjs` | The projection masking function. Intended to be vendored verbatim by the site explorer, so page and protocol cannot disagree (the explorer has not shipped yet). |
| `sign.mjs` | Signs a PASS receipt: Ed25519, DSSE v1 envelope, in-toto v1 Statement. `keygen` makes a key pair. Refuses FAIL. |
| `verify.mjs` | Verifies a signed receipt against trusted public keys; `--profile` re-runs the check on the exact bytes. |
| `lib/dsse.mjs` | DSSE pre-authentication encoding, statement wrapping, sign and verify. No I/O. |
| `lib/jsonschema.mjs` | A refusing-by-default JSON Schema 2020-12 subset checker, used by the tests when ajv is absent. |
| `COMPATIBILITY.md` | What bumps major, what bumps minor, what a consumer must reject. |
| `PROJECTION.md` | The public/private boundary and rules P1–P5. |
| `INSTALL.md` | How an external repository adopts this and produces a receipt. |
| `receipt.v0.1.0.schema.json` | The receipt format, so receipts are machine-comparable. |
| `fixtures/valid-profile.json` | Reference profile. Must PASS. |
| `fixtures/leaky-profile.json` | Negative fixture. Must FAIL P1–P5. |
| `test/conform.test.mjs`, `test/sign.test.mjs` | `node --test`, no test framework. |

## Run it

```bash
node protocol/conform.mjs protocol/fixtures/valid-profile.json    # exit 0, PASS
node protocol/conform.mjs protocol/fixtures/leaky-profile.json    # exit 1, FAIL
node --test protocol/test/conform.test.mjs protocol/test/sign.test.mjs   # CI: .github/workflows/protocol.yml

node protocol/sign.mjs keygen .sip                                  # once
node protocol/conform.mjs protocol/fixtures/valid-profile.json --json receipt.json
node protocol/sign.mjs receipt.json --key .sip/sip-signing.key       # receipt.dsse.json
node protocol/verify.mjs receipt.dsse.json --pub .sip/sip-signing.pub --profile protocol/fixtures/valid-profile.json
```

Nothing installs. Node ≥ 18 and the files in this directory are the whole toolchain; signing uses only `node:crypto`.

## The twelve node types

| Type | Id prefix | What it holds | Required body |
|---|---|---|---|
| Identity | `sip:identity:` | A party with decision rights | `kind` |
| Agent | `sip:agent:` | A thing that acts on an identity's behalf | `harness` |
| Capability | `sip:capability:` | A bounded action an agent may take | `action`, `scope` |
| MemoryRecord | `sip:memory-record:` | Durable state with a retention term | `retention`, `contentRef` |
| Claim | `sip:claim:` | An assertion that can be true or false | `statement` |
| Source | `sip:source:` | Something a claim can be checked against | `locator` |
| Attestation | `sip:attestation:` | A signed statement about another element | `statementType` |
| Policy | `sip:policy:` | A rule that governs elements | `rule`, `enforcement` |
| Decision | `sip:decision:` | A policy applied to a case, with a rationale | `outcome`, `rationale` |
| Artifact | `sip:artifact:` | Something produced and locatable | `locator` |
| Evaluation | `sip:evaluation:` | A test run and its result | `method`, `result` |
| Projection | `sip:projection:` | What a given audience is shown | `audience`, `include` |

## The thirteen edge types

`asserts` · `derivedFrom` · `supports` · `contradicts` · `governedBy` · `decides` ·
`underPolicy` · `grants` · `exercises` · `produces` · `evaluates` · `attests` · `projects`

Each has a legal endpoint-type pairing, published in `sip-graph.v0.1.0.endpoints.json` and enforced
by rule G7. An edge outside the matrix is rejected: the
graph refuses to record a relationship it has no rule for.

## The rules

Structural rules **G1–G11** and version rule **C1** are enforced against every profile.
Projection rules **P1–P5** are enforced against every `Projection` node. All seventeen appear in
the receipt with a pass/fail and, on failure, the specific element at fault.

## Why a graph, and where it stops

A graph earns its place here because the questions are relational: *who owns this*, *what was it
derived from*, *which policy governed the decision*, *what may this audience see*. It is a set of
typed JSON files validated by a pure function — no database, no server, no service. If a future
version needs indexed queries over many profiles, that is a consumer's problem to solve on top of
this contract, not a reason to change it.

## Status

v0.1.0 is a first published contract, not a ratified standard. It has one reference profile, one
negative fixture and seventeen enforced rules. It has no external adopters yet. Nothing in this
directory should be cited as evidence of adoption.

---

**Built on SIP** · graph v0.1.0 · extends SIP v1.1.1 · MIT
