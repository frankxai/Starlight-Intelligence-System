# Starlight core

Portable memory contracts and context projection, with zero runtime dependencies.
ES modules use standard JavaScript APIs without Node imports. The release verifier
limits JavaScript runtime files to less than 20,000 bytes; declarations and retained
JSON schemas have a separate archive size in the release receipt.

```sh
npm install @starlight-intelligence/core
```

```ts
import { recallContext, type MemoryProvider } from '@starlight-intelligence/core';

declare const memory: Pick<MemoryProvider, 'recall'>;
const context = await recallContext('Project constraints', {
  memory, tenantId: 'team-a', workspaceId: 'project-a',
});
```

The host supplies an authenticated provider and trusted scope. Records must match
that scope and be public, or private-shareable with explicit `allowShareable: true`.
Private, secret, regulated, expired, and malformed records are excluded.
Sharing grants must be actual booleans; strings such as `"false"` are rejected
before the provider is called.
Context contains only sanitized facts or summaries, bounded by `limit`, `maxCharacters`,
and `timeoutMs`. Raw content and provider metadata are excluded. Recall failures
stop the request with a fixed message. Cancellation reaches cooperative providers;
the timeout also bounds waiting for providers that ignore cancellation.

An optional `retention_until` must be a parseable string. Present numbers, arrays,
null and other malformed values exclude the record rather than letting JavaScript
coerce them into dates. A `delete_by` record requires a deadline. Invalid records
do not prevent valid neighboring records from being recalled.

Exports include `VaultEntry`, `VaultType`, `MemoryEvent`, `SIPAttestation`,
`HarnessContract`, `VeilSanitizer`, `MemoryProvider`, and `SISMemoryRecord`.
Existing schema subpaths remain available. Attestation and harness types describe
contracts; hosts implement signature verification and authorization.

`SanitizationGateway` extends SIS's regex sanitizer with common provider tokens,
database URIs, private-key blocks and named secret fields in context objects.
It handles configured patterns, not every possible secret or personal datum. Hosts can supply
a stricter `VeilSanitizer`; a sanitizer failure never permits unsanitized output.
Retrieved facts remain untrusted data and can contain prompt injection.

The portable runtime is suitable for standard browser and edge module environments.
CI checks dependency and import restrictions and cold-imports the runtime in a
fresh Node process after removing `process`, `Buffer`, and `global`. That check
exercises sanitization, scoped recall, and cancellation using standard web APIs.
It does not execute a browser or edge worker. Browser/edge
provider deployments require their own integration checks. This package ships no
database, credentials, private vault, or local filesystem implementation.

Code and schemas: MIT.
