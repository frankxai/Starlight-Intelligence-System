# Starlight Board — Foundry source lock and Windows fixture repair

Date: 2026-09-23
Proposal: Refresh the reviewed Foundry validator source-closure digest for `package.json` after main added the Arena lane, and make the symlink security fixture report Windows privilege limits without suppressing the forbidden `node_modules` assertion. No compiler or validation policy changes.

**Sovereign:** I challenge any lock update that silently blesses changed validator code or dependencies. The proposed digest change must be limited to the exact root manifest bytes, with the existing independent closure paths and fail-closed checks retained.

**Seer:** I challenge a portability exception that might normalize untested symlink rejection on Windows. The test should skip only the symlink subcases when Windows denies fixture creation, while preserving those assertions wherever symlinks are available.

**Harmonizer:** I challenge a change that would weaken the existing Foundry board's requirement for current receipts. This is a local evidence repair; it must not be turned into a host compatibility, marketplace approval, or production support claim.

**Strategist:** I challenge broad repair of an unrelated package upgrade in this lane. Keeping the lock exact and the test narrow restores a meaningful preflight at low change risk.

**Verifier:** I challenge a paper-only fix. Run the focused v9.2 test and OpenAI package preflight; a negative drift probe should still reject a wrong digest.

**Overseer:** The load-bearing concern is accidental weakening of the lock or symlink security assertions. The strongest case for proceeding is that the current main has a source manifest change unrelated to Foundry and a Windows fixture privilege failure that prevents the remaining security assertion from running.

**Recommendation:** REVISE

**Rationale:** Proceed with a one-file digest refresh and a narrowly conditional test fixture adjustment, then require executable positive and negative evidence before the coordinator proposes a merge.

## Execution evidence

- Current `main` at `a54cc7090f53ebe4f79765ba01e6a459d835b2dd` has `package.json` SHA-256 `11448bdb9c780ffd0bdba5b65826f74b8601a52dc60525bc982ca003f679fea4`; the existing `package-lock.json` digest still matches. The two source-closure entries now pin the current manifest bytes. The validator implementations, rules digest, dependency versions, and lock policy are unchanged.
- `node --import tsx --test test/v92-foundry.test.ts`: 31 pass, 0 fail, 2 symlink fixtures skipped because this Windows session denies symlink creation with `EPERM`. The forbidden `node_modules` artifact assertion passes independently.
- `node tools/foundry/cli.mjs preflight-openai plugins/starlight-foundry`: `status: pass`, including `rules-lock: pass`; external upload, scan, runtime, review, and publication gates remain open.
- Negative probe with an intentionally wrong `package.json` source digest: rejected by `verifyAgentPluginSchemaCache` with a source-closure digest mismatch. This confirms the lock remains fail closed.

---
**Built on SIP** — Starlight Intelligence Protocol

Substrate: starlightintelligence.org/protocol v1.1.1
Layers used: attestation, sovereignty
Verticals: none
Canon: none
Nodes: Starlight Holding BV · role: architect · substrate and Foundry governance
Generated: 2026-09-23
Attestation is compounding, not credit transfer: every composition strengthens every node.
---
