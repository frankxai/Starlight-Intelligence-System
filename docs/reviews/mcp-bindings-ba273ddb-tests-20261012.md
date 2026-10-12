# Bounded Source-Derived Execution Report: frankxai/Starlight-Intelligence-System PR366

## Executive Summary
- **Target Repository**: `frankxai/Starlight-Intelligence-System`
- **Candidate Commit**: `ba273ddbab4d0f4d025f4db42beffcb82ccf99b8`
- **Base Commit**: `34dcd4365266cdb04d35d42e81f771f06f58c145`
- **Execution Date**: 2026-10-12
- **Execution Outcome**: **EXECUTED (16 PASS / 0 FAIL on Candidate; 12 PASS / 4 FAIL on Baseline Counterfactual)**

---

## Environment & Tooling Specifications
- **Node.js**: `v22.22.1`
- **TypeScript (Compiler)**: `v5.9.3`
- **@modelcontextprotocol/client**: `v2.3.1`
- **@modelcontextprotocol/server**: `v2.3.1`
- **zod**: `v4.6.5`
- **Execution OS / Kernel**: `Linux 6.6.137+ x86_64`
- **Scratch Workspace Location**: `/tmp/mcp-eval/` (outside Git repository boundaries)

---

## Bounded Execution Methodology & Scratch Construction

### 1. Candidate Environment Construction (`/tmp/mcp-eval/candidate`)
1. Created clean temporary directory `/tmp/mcp-eval/candidate`.
2. Extracted candidate Git blobs for exact PR366 files:
   - `packages/mcp-server/src/index.ts` (`a2eee424cdc10861eaaf5c3df844498636c14e54`)
   - `packages/mcp-server/src/cli.ts` (`029272828b809a721bd598bda7ccfd7cb0efca61`)
   - `packages/mcp-server/src/gateway.ts` (`ddcb7b7ebf97fc18928ddbde3867c4ec1fb51fa0`)
   - `packages/mcp-server/test/server.test.mjs` (`f9fdd161cd68fc83eb8e716a6d672687b015d464`)
   - `packages/mcp-server/tsconfig.json` (`6aa494d48a1a36ea917b11c9ea55fe5cf0247df6`)
   - `packages/mcp-server/package.json` (`faaa57ca0d84edc90e0c904fa7f10b06a5a04407`)
3. Adjusted local `package.json` to resolve workspace link to core package, ran `npm install` for official SDKs (`@modelcontextprotocol/server@2.3.1`, `@modelcontextprotocol/client@2.3.1`, `zod@4.6.5`, `typescript@5.9.3`).
4. Linked local `@starlight-intelligence/core` dependency to `/app/packages/core`.
5. Transpiled TypeScript source using installed `npx tsc -p tsconfig.json`.
6. Executed full test suite: `node --test test/server.test.mjs`.

### 2. Baseline Counterfactual Construction (`/tmp/mcp-eval/baseline`)
1. Created clean temporary directory `/tmp/mcp-eval/baseline`.
2. Extracted exact 34dcd436 base blob for `packages/mcp-server/src/index.ts` (`708bc4bc7fb0533b74dd352c0cc18d72dcfa6cb8`).
3. Copied candidate test file `server.test.mjs` (`f9fdd161cd68fc83eb8e716a6d672687b015d464`) and metadata into baseline scratch package.
4. Installed identical SDK versions and linked `@starlight-intelligence/core`.
5. Transpiled baseline `index.ts` with identical TypeScript compiler (`v5.9.3`).
6. Executed test suite: `node --test test/server.test.mjs`.

---

## Test Execution Outputs

### Candidate Execution (PR366 / ba273ddb)
**Command**: `node --test test/server.test.mjs` (in `/tmp/mcp-eval/candidate`)

```text
TAP version 13
# Subtest: factory binds recall to the selected provider method and original receiver
ok 1 - factory binds recall to the selected provider method and original receiver
  ---
  duration_ms: 58.70273
  type: 'test'
  ...
# Subtest: factory binds writes without freezing provider state
ok 2 - factory binds writes without freezing provider state
  ---
  duration_ms: 5.211633
  type: 'test'
  ...
# Subtest: factory binds deletion to the selected method and original receiver
ok 3 - factory binds deletion to the selected method and original receiver
  ---
  duration_ms: 4.061417
  type: 'test'
  ...
# Subtest: factory binds sanitizer for both provider egress and writes with its receiver
ok 4 - factory binds sanitizer for both provider egress and writes with its receiver
  ---
  duration_ms: 5.312996
  type: 'test'
  ...
# Subtest: official client initializes, lists read-only tools, calls sanitized recall, and denies injected scope
ok 5 - official client initializes, lists read-only tools, calls sanitized recall, and denies injected scope
  ---
  duration_ms: 34.399648
  type: 'test'
  ...
# Subtest: writes and deletion require host grants; stored text is sanitized and errors are redacted
ok 6 - writes and deletion require host grants; stored text is sanitized and errors are redacted
  ---
  duration_ms: 8.651494
  type: 'test'
  ...
# Subtest: factory rejects malformed host grants and blank workspace before registering tools
ok 7 - factory rejects malformed host grants and blank workspace before registering tools
  ---
  duration_ms: 6.73944
  type: 'test'
  ...
# Subtest: standalone installed CLI speaks stdio to the official client and reconnects to the same gateway
ok 8 - standalone installed CLI speaks stdio to the official client and reconnects to the same gateway
  ---
  duration_ms: 644.526261
  type: 'test'
  ...
# Subtest: gateway cancels failed upstream bodies before rejecting recall
ok 9 - gateway cancels failed upstream bodies before rejecting recall
  ---
  duration_ms: 3.519792
  type: 'test'
  ...
# Subtest: gateway denies cross-tenant reads, credentials in URL and plaintext remote transport
ok 10 - gateway denies cross-tenant reads, credentials in URL and plaintext remote transport
  ---
  duration_ms: 0.824947
  type: 'test'
  ...
# Subtest: exported gateway rejects unsupported workspace isolation and validates budgets before HTTP
ok 11 - exported gateway rejects unsupported workspace isolation and validates budgets before HTTP
  ---
  duration_ms: 5.37469
  type: 'test'
  ...
# Subtest: gateway excludes malformed expiry and privacy tags even when shareable recall is authorized
ok 12 - gateway excludes malformed expiry and privacy tags even when shareable recall is authorized
  ---
  duration_ms: 5.356093
  type: 'test'
  ...
# Subtest: sensitive and malformed caller IDs never reach write or delete providers
ok 13 - sensitive and malformed caller IDs never reach write or delete providers
  ---
  duration_ms: 13.423024
  type: 'test'
  ...
# Subtest: gateway privacy tags with surrounding whitespace override public tags before MCP projection
ok 14 - gateway privacy tags with surrounding whitespace override public tags before MCP projection
  ---
  duration_ms: 6.691339
  type: 'test'
  ...
# Subtest: unknown privacy classifications remain private despite explicit sharing permission
ok 15 - unknown privacy classifications remain private despite explicit sharing permission
  ---
  duration_ms: 2.703342
  type: 'test'
  ...
# Subtest: private-shareable overrides public and still requires an explicit host sharing grant
ok 16 - private-shareable overrides public and still requires an explicit host sharing grant
  ---
  duration_ms: 5.15648
  type: 'test'
  ...
1..16
# tests 16
# suites 0
# pass 16
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1149.854266
```

**Candidate Test Metrics**: Total: 16 | Passed: 16 | Failed: 0 | Exit Code: 0

---

### Baseline Counterfactual Execution (34dcd436 Base `index.ts` + PR366 Tests)
**Command**: `node --test test/server.test.mjs` (in `/tmp/mcp-eval/baseline`)

```text
TAP version 13
# Subtest: factory binds recall to the selected provider method and original receiver
not ok 1 - factory binds recall to the selected provider method and original receiver
  ---
  duration_ms: 79.018937
  type: 'test'
  location: '/tmp/mcp-eval/baseline/test/server.test.mjs:24:1'
  failureType: 'testCodeFailure'
  error: |-
    Expected values to be strictly equal:
    
    0 !== 1
    
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: 1
  actual: 0
  operator: 'strictEqual'
  stack: |-
    TestContext.<anonymous> (file:///tmp/mcp-eval/baseline/test/server.test.mjs:40:12)
    async Test.run (node:internal/test_runner/test:1054:7)
    async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3)
  ...
# Subtest: factory binds writes without freezing provider state
not ok 2 - factory binds writes without freezing provider state
  ---
  duration_ms: 6.157339
  type: 'test'
  location: '/tmp/mcp-eval/baseline/test/server.test.mjs:46:1'
  failureType: 'testCodeFailure'
  error: |-
    Expected values to be strictly equal:
    
    1 !== 0
    
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: 0
  actual: 1
  operator: 'strictEqual'
  stack: |-
    TestContext.<anonymous> (file:///tmp/mcp-eval/baseline/test/server.test.mjs:58:12)
    async Test.run (node:internal/test_runner/test:1054:7)
    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
  ...
# Subtest: factory binds deletion to the selected method and original receiver
not ok 3 - factory binds deletion to the selected method and original receiver
  ---
  duration_ms: 4.517322
  type: 'test'
  location: '/tmp/mcp-eval/baseline/test/server.test.mjs:66:1'
  failureType: 'testCodeFailure'
  error: |-
    Expected values to be strictly equal:
    
    1 !== 0
    
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: 0
  actual: 1
  operator: 'strictEqual'
  stack: |-
    TestContext.<anonymous> (file:///tmp/mcp-eval/baseline/test/server.test.mjs:78:12)
    async Test.run (node:internal/test_runner/test:1054:7)
    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
  ...
# Subtest: factory binds sanitizer for both provider egress and writes with its receiver
not ok 4 - factory binds sanitizer for both provider egress and writes with its receiver
  ---
  duration_ms: 6.230973
  type: 'test'
  location: '/tmp/mcp-eval/baseline/test/server.test.mjs:84:1'
  failureType: 'testCodeFailure'
  error: |-
    Expected values to be strictly equal:
    + actual - expected
    
    + 'fixture-private'
    - '[REDACTED]'
    
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: '[REDACTED]'
  actual: 'fixture-private'
  operator: 'strictEqual'
  stack: |-
    TestContext.<anonymous> (file:///tmp/mcp-eval/baseline/test/server.test.mjs:102:12)
    async Test.run (node:internal/test_runner/test:1054:7)
    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
  ...
# Subtest: official client initializes, lists read-only tools, calls sanitized recall, and denies injected scope
ok 5 - official client initializes, lists read-only tools, calls sanitized recall, and denies injected scope
  ---
  duration_ms: 39.826114
  type: 'test'
  ...
# Subtest: writes and deletion require host grants; stored text is sanitized and errors are redacted
ok 6 - writes and deletion require host grants; stored text is sanitized and errors are redacted
  ---
  duration_ms: 11.705853
  type: 'test'
  ...
# Subtest: factory rejects malformed host grants and blank workspace before registering tools
ok 7 - factory rejects malformed host grants and blank workspace before registering tools
  ---
  duration_ms: 10.156544
  type: 'test'
  ...
# Subtest: standalone installed CLI speaks stdio to the official client and reconnects to the same gateway
ok 8 - standalone installed CLI speaks stdio to the official client and reconnects to the same gateway
  ---
  duration_ms: 704.000737
  type: 'test'
  ...
# Subtest: gateway cancels failed upstream bodies before rejecting recall
ok 9 - gateway cancels failed upstream bodies before rejecting recall
  ---
  duration_ms: 4.72961
  type: 'test'
  ...
# Subtest: gateway denies cross-tenant reads, credentials in URL and plaintext remote transport
ok 10 - gateway denies cross-tenant reads, credentials in URL and plaintext remote transport
  ---
  duration_ms: 1.782409
  type: 'test'
  ...
# Subtest: exported gateway rejects unsupported workspace isolation and validates budgets before HTTP
ok 11 - exported gateway rejects unsupported workspace isolation and validates budgets before HTTP
  ---
  duration_ms: 6.637116
  type: 'test'
  ...
# Subtest: gateway excludes malformed expiry and privacy tags even when shareable recall is authorized
ok 12 - gateway excludes malformed expiry and privacy tags even when shareable recall is authorized
  ---
  duration_ms: 6.040352
  type: 'test'
  ...
# Subtest: sensitive and malformed caller IDs never reach write or delete providers
ok 13 - sensitive and malformed caller IDs never reach write or delete providers
  ---
  duration_ms: 17.016334
  type: 'test'
  ...
# Subtest: gateway privacy tags with surrounding whitespace override public tags before MCP projection
ok 14 - gateway privacy tags with surrounding whitespace override public tags before MCP projection
  ---
  duration_ms: 7.687668
  type: 'test'
  ...
# Subtest: unknown privacy classifications remain private despite explicit sharing permission
ok 15 - unknown privacy classifications remain private despite explicit sharing permission
  ---
  duration_ms: 2.79206
  type: 'test'
  ...
# Subtest: private-shareable overrides public and still requires an explicit host sharing grant
ok 16 - private-shareable overrides public and still requires an explicit host sharing grant
  ---
  duration_ms: 6.233378
  type: 'test'
  ...
1..16
# tests 16
# suites 0
# pass 12
# fail 4
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1296.465791
```

**Baseline Test Metrics**: Total: 16 | Passed: 12 | Failed: 4 | Exit Code: 1

---

## Baseline Regression Analysis
The 4 failures in the baseline counterfactual confirm that without PR366's `index.ts` changes:
1. `factory binds recall`: Baseline invoked replaced `memory.recall` function instead of original method (`memory.calls` was 0 instead of 1).
2. `factory binds writes`: Baseline invoked replaced `memory.remember` function (`replacements` was 1 instead of 0).
3. `factory binds deletion`: Baseline invoked replaced `memory.forget` function (`replacements` was 1 instead of 0).
4. `factory binds sanitizer`: Baseline used replaced `sanitizer.sanitize` method, bypassing redaction (`'fixture-private'` returned unredacted instead of `'[REDACTED]'`).

PR366 fixes all 4 regressions precisely as specified.

---

## Execution Limitations & Cleanup Outcome
- **Execution Limits**: All tests executed within local temporary scratch space `/tmp/mcp-eval/`. No network connections to live providers, databases, or paid APIs were made.
- **Cleanup Outcome**: Temporary scratch directory `/tmp/mcp-eval` was cleaned and removed post-execution. No child processes or lingering background jobs were left running.
