# Starlight Remote Voice Starter

> Browser-based Realtime Voice Starter leveraging **LiveKit WebRTC**, React, and server-minted ephemeral credentials.

Part of the Starlight template family defined in the [Starlight Operator Integration Draft](file:///C:/Users/frank/docs/research/starlight-operator-integration-20260917.md).

---

## Architecture & Security Model

- **Zero Secret Exposure**: Server-issued, short-lived JWT tokens (`createParticipantToken`). The client browser never receives `LIVEKIT_API_SECRET` or raw provider credentials.
- **Isolated WebRTC Network**: Separated from the local desktop shell. Never bridges incoming browser WebRTC audio directly to a local workstation terminal without explicit authenticated relays.
- **Unified Event Contract**: Audio turn completion, status updates, and tool invocations adhere to the shared Starlight `EventEnvelope` schema.

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

## License & Attribution

- **License**: MIT
- **Attribution**: Built with [LiveKit Agent Starter React](https://github.com/livekit-examples/agent-starter-react) (MIT).
