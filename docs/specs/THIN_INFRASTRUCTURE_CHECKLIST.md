# Thin Infrastructure Planning Checklist

> Architecture checklist for solopreneurs and sovereign fleet commanders.
> Local compute vs Cloud compute, Durable storage, and Observability pointers.
> Built on SIP — Systems Architecture Tier

---

## 1. Core Doctrine: The Thin Overlay
Do not own or manage infrastructure that a thin API adapter can solve.
Own your **memory**, your **contracts**, your **keys**, and your **taste**. Rent commodity inference and bandwidth.

```
┌─────────────────────────────────────────────────────────────┐
│                 SOVEREIGN CORE (YOU OWN)                     │
│  • Memory Vaults (Local NVMe SQLite FTS5 + JSONL)           │
│  • Charter & Invariants (SOUL.md, SIP contracts)            │
│  • Encryption Keys & Identity Attestations                  │
├─────────────────────────────────────────────────────────────┤
│                 THIN OVERLAY (YOU RENT)                     │
│  • Inference: OpenRouter / Provider SDKs                    │
│  • Observability: Langfuse EU (Traces, Costs, Evals)        │
│  • Edge Delivery: Cloudflare Workers / Vercel Edge          │
│  • Physical Actuation: ROS2 / Zenoh Middleware             │
│  • Durable Anchoring: Arweave / IPFS decentralized storage  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Infrastructure Planning Matrix

### Dimension 1: Compute (Local vs Cloud)
- **Local Workstation / Rig (Primary):**
  - Minimum: 32 GB RAM, 8+ Cores, 1 TB NVMe SSD (PCIe 4.0+).
  - Recommended: 64 GB+ RAM, Apple Silicon (M3/M4 Max) or Linux Rig with NVIDIA RTX 4090 / 5090 (for local embeddings + fast SQLite vector querying).
  - Workload: Memory indexing, AST parsing, Sentinel security audits, local agent harness loops (Claude Code, Grok, Codex, Antigravity).
- **Cloud Commodity Compute (Secondary):**
  - Use headless cloud runners (Hetzner, Railway, Modal) ONLY for 24/7 background dreaming daemons or batch scraping.
  - Fail-closed: Never store unencrypted private vault keys on third-party VMs.

### Dimension 2: Storage & Durability (3-Tier Model)
- **Tier 1 (Hot):** Local NVMe SSD SQLite FTS5 (`starlight.db`) + append-only `.jsonl` files. Zero external network dependency.
- **Tier 2 (Warm):** Encrypted multi-node sync via P2P (Syncthing) or managed encrypted S3/R2 snapshots.
- **Tier 3 (Permanent):** Blockchain-anchored Merkle root export to Arweave / IPFS. "Never lose this" archival for Horizon Vault and fundamental strategic decisions.

### Dimension 3: Networking & Privacy Gateway
- **The Veil (Sanitization):** All outgoing LLM context passes through local PII scrubbing before hitting external endpoints.
- **Tailscale / WireGuard:** Private mesh networking between your workstation, mobile devices, and robot actuators. Never expose raw agent ports to the public internet.

### Dimension 4: Observability Pointers (Thin Overlay)
- **Tracing & Cost Attribution:** **Langfuse EU** (EU data residency, self-hosted or cloud).
  - Every agent dispatch, tool call, and token consumption is recorded under a unified `traceId`.
  - Zero heavy proprietary tracing daemons.
- **Model Routing:** **OpenRouter** or direct API keys with fallback cascades:
  - Complex systems / Council: Claude 3.7 Sonnet / GPT-5
  - High-speed code execution / Search: Gemini 2.5 Flash / Grok 3
  - Local offline fallback: Ollama (Qwen 2.5 Coder 32B / Llama 3.3 70B)

### Dimension 5: Physical Actuation (Robotics Bridge)
- **Middleware:** ROS2 Humble / Iron or Zenoh.
- **Heartbeat SLA:** 100ms safety ping.
- **Emergency Stop:** Software fail-closed trip wire that instantly cuts motor power if benevolent charter boundaries are violated.

---

## 3. The 10-Minute Solopreneur Pre-Flight Checklist

- [ ] **Local Memory Initialized:** `memory/vaults/` populated with `strategic`, `technical`, `creative`, `operational`, `wisdom`, and `horizon`.
- [ ] **The Veil Active:** Secret scrubbing enabled for API keys and operator PII.
- [ ] **Model Router Configured:** Primary and fallback LLM endpoints verified in `.secrets/.env.master`.
- [ ] **Langfuse Telemetry Bound:** `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` pointing to EU endpoint.
- [ ] **Starlight Queen Enabled:** Autonomic background loop registered with fail-closed safety on money and deploys.
- [ ] **Blockchain Durability Ready:** Snapshot export script verified (`tools/anchor-horizon.ts`).

---

*Attested: Built on SIP · Systems Architecture Checklist*
