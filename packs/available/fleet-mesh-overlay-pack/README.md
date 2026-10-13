# Fleet Mesh Overlay Pack

> Distributed multi-node agent orchestration and telemetry layer for Starlight Intelligence System (SIS).
> Built on SIP — Subscription Tier.

## Overview
Provides distributed orchestration and cross-machine coordination across Starlight agent fleets:
- **Multi-Node Agent Orchestration**: Multi-agent task routing, role allocation, and swarm coordination.
- **Cross-Machine Blackboard Synchronization**: Shared state blackboard sync with conflict resolution.
- **Langfuse & OpenRouter Telemetry**: Real-time distributed tracing, cost-tracking, and evaluation hooks.

## Permissions
- `fs:read:repo` — Inspects fleet node configurations and task graphs.
- `network:fetch:fleet-mesh` — Facilitates peer-to-peer node communication and blackboard sync.
- `network:fetch:telemetry` — Emits structured spans and traces to Langfuse / OpenRouter.
- `task-scheduler:register` — Schedules background heartbeat and swarm state sync tasks.
