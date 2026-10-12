# Starlight Operator Workspace Starter

> Sovereign, multi-agent execution workspace built on the **Agent Client Protocol (ACP)** with **assistant-ui** external store primitives and strict loopback isolation.

Part of the Starlight template family defined in the [Starlight Operator Integration Draft](file:///C:/Users/frank/docs/research/starlight-operator-integration-20260917.md).

---

## Capabilities & Architecture

- **Scoped Agent Dispatch**: Launches subagents (Claude, Codex, OpenCode, Gemini) with strictly isolated environments. Never spreads ambient developer tokens or parent process environment variables into children.
- **Continuous Timeline UI**: Uses `@assistant-ui/react` with `ExternalStoreRuntime`, retaining full state ownership inside Starlight rather than delegating state to third-party stores.
- **Fail-Closed Loopback Server**: Validates true socket loopback addresses (`127.0.0.1`, `::1`), Bearer tokens, and origin headers.
- **Capacity & Idle Reaping**: Bounded concurrent agent sessions (`maxConcurrentSessions: 3`) with automated idle session teardown.
- **Universal Event Envelope**: Every run state transition emits a typed `EventEnvelope` containing run ID, provider session ID, sequence number, capability, and artifact links—with zero credentials in the event stream.

---

## Quickstart

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env.local

# 3. Run test suite
pnpm test

# 4. Start local development server
pnpm dev
```

---

## Security Invariants

1. **Child Environment Scoping**: `buildSanitizedEnvironment()` strips `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GH_TOKEN`, and other ambient secrets unless explicitly injected as an approved scoped credential.
2. **Directory Escape Guard**: `validateWorkingDirectory()` resolves real symlink targets against configured allowed roots to block path traversal outside project bounds.
3. **No Network Exposure by Default**: Listens exclusively on `127.0.0.1` behind authenticated Bearer tokens.

---

## License & Attribution

- **License**: MIT
- **Attribution**: Built with [assistant-ui](https://github.com/assistant-ui/assistant-ui) (MIT) and the Agent Client Protocol (ACP) specification.
