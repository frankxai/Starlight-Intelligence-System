# Starlight Queen Orchestrator Pack

> Single-operator autonomic fleet management layer.
> Built on SIP — Subscription Tier.

## Overview
Automates background operations that human operators do not actively monitor:
- Fleet node heartbeat and health sweeping
- Memory dreaming and promotion queue processing
- Thin overlay telemetry integration (Langfuse EU, OpenRouter)
- Strict fail-closed escalation gates on money, credentials, and deployments

## Permissions
- `fs:read:repo` — Scans fleet status and repository health.
- `fs:write:repo` — Updates consolidation logs and dreaming state.
- `task-scheduler:register` — Runs recurring autonomic background loops.
- `network:fetch:telemetry` — Emits structured traces to Langfuse.
