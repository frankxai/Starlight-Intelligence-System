# Durable Blockchain Vault Pack

> Sovereign permanence extension for Starlight Intelligence System (SIS).
> Built on SIP — Subscription Tier.

## Overview
Provides 3-tier storage durability for memory vaults and Horizon Vault entries:
1. **Local SQLite FTS5** + append-only JSONL
2. **Encrypted Managed Cloud Backup**
3. **Decentralized Blockchain Permanence** (Arweave / IPFS / EVM Merkle state anchoring)

## Permissions
- `fs:read:repo` — Reads vault contents for snapshotting.
- `fs:write:vaults` — Updates consolidation state and receipts.
- `network:fetch:blockchain-rpc` — Dispatches Merkle roots and metadata to decentralized storage nodes.
