# Managed Durability Pack

> Sovereign multi-region durability and archival anchoring extension for Starlight Intelligence System (SIS).
> Built on SIP — Subscription Tier.

## Overview
Extends Starlight's MIT open-core substrate with enterprise-grade managed durability:
- **Automatic Multi-Region Replication**: Asynchronous multi-node replication across primary and edge vaults.
- **Continuous Snapshot Backup**: Scheduled automated snapshots with point-in-time recovery.
- **Arweave & IPFS Archival Anchoring**: Decentralized cryptographic permanence with Merkle state receipts.

## Permissions
- `fs:read:repo` — Reads vault contents for snapshotting and state verification.
- `fs:write:vaults` — Persists backup manifests and anchor receipts.
- `network:fetch:replication-api` — Synchronizes state across multi-region replication targets.
- `network:fetch:blockchain-rpc` — Dispatches Merkle roots and archival payloads to decentralized storage nodes.
