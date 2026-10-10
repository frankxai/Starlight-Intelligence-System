# Starlight memory for the AI SDK

Use a scoped memory provider with Vercel AI SDK 7 `generateText` and `streamText`.
The adapter uses the SDK's model middleware and leaves execution, streaming,
tool calls, retries, and usage reporting with the SDK.

```sh
npm install @starlight-intelligence/ai-sdk ai
```

With an existing model and authenticated `memory` provider, integration takes two lines:

```ts
import { withStarlightMemory } from '@starlight-intelligence/ai-sdk';
const model = withStarlightMemory(baseModel, { memory, tenantId: 'team-a', workspaceId: 'project-a' });
```

```ts
import { streamText } from 'ai';
const result = streamText({ model, prompt: 'What constraints did we agree on?' });
return result.toTextStreamResponse();
```

In a Next.js server route, derive scope from authenticated session claims, never
from untrusted request fields. Construct a separate wrapped model for each scope.
Do not send provider credentials to the browser. The adapter reads the most recent
user text, recalls through the host's provider, and adds bounded sanitized facts
as labeled untrusted reference data. It performs no implicit memory writes.
User text exceeding the 16,000-character retrieval budget skips recall while
preserving the complete original model prompt. It is not truncated across a
possible secret. Shorter queries are sanitized before provider egress.

The core projection excludes private, secret, regulated, expired, cross-tenant,
and cross-workspace records. `allowShareable: true` permits private-shareable facts
only after host authorization. Provider or sanitizer failure prevents model execution.
`timeoutMs` defaults to 5 seconds; model cancellation is propagated to recall.
Empty recall leaves the prompt unchanged. Retrieval adds one provider read per
model invocation and may repeat on SDK retries or tool steps. Providers own billing
and caching; this package has no global tenant cache.

Peer range: `ai ^7.0.130`. Tests use the real SDK with deterministic model fixtures
for generation and streaming. Earlier SDK majors and live model providers are not
covered. Untrusted-reference labeling reduces accidental instruction confusion;
it does not guarantee resistance to prompt injection. Use host policy and evaluation
for sensitive workflows.

Code: MIT.
