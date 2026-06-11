# Machine Physical Resource & Hardware Watchdog

The Machine directory tracks the raw system hardware metrics, CPU/RAM telemetry, active processes (such as subagent RAM bounds), and local Restic backup states. It ensures the host operating system has the resources necessary to execute complex concurrent agent tasks without thrashing or exceeding memory budgets.

## Standard Location
* **Repository source:** `core/telemetry/machine/`
* **Local state location:** `~/.starlight/machine/` (ignored by Git)
* **Junction mapping:** `~/.machine/` $\rightarrow$ `~/.starlight/machine/`

## Core Telemetry Files

### 1. `capacity.json`
Local hardware capability records. Holds total CPU cores, physical memory limits, swap thresholds, and storage capacity limits.
* **Fields:**
  * `cpuCores`: Total logical processors.
  * `totalMemoryGb`: Total system memory in Gigabytes.
  * `diskTotalGb`: Total drive size.
  * `diskFreeGb`: Available storage.

### 2. `telemetry.jsonl`
Append-only log of performance metrics during swarm executions. Tracks CPU load and active memory usage.
* Used by `starlight status` and watchdog agents to flag system stress.

### 3. `backups.jsonl`
Logs local Restic backup histories (timestamps, file counts, sizes, status).

---
*Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)*
