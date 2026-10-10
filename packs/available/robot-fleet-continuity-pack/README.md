# Robot Fleet Continuity Pack

> Multi-agent cognitive fleet to physical robot fleet continuity adapter.
> Built on SIP — Subscription Tier.

## Overview
Connects Starlight cognitive agents to physical robot fleets using:
- ROS2 & Zenoh actuator abstraction
- Continuous spatial landmark tracking
- Fail-closed Benevolent Emergency Stop

## Permissions
- `fs:read:repo` — Reads goal checklists and environment specifications.
- `network:fetch:robot-middleware` — Communicates with ROS2/Zenoh middleware endpoints.
- `task-scheduler:register` — Runs high-frequency safety heartbeat daemons.
