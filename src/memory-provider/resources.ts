import type { ProviderCapabilities, ProviderName, ProviderResourcePlan } from "./types.js";

export const DEFAULT_PROVIDER_CAPABILITIES: Record<string, ProviderCapabilities> = {
  local_core: {
    provider: "local_core",
    process_model: "embedded_lightweight",
    authority: "primary",
    ram_profile: "low",
    supports_batching: true,
    per_agent_instance_allowed: true,
    notes: "SIS-owned JSONL/SQLite/vault path. The only authoritative store.",
  },
  holographic: {
    provider: "holographic",
    process_model: "embedded_lightweight",
    authority: "adapter",
    ram_profile: "low",
    supports_batching: true,
    per_agent_instance_allowed: true,
    notes: "Local SQLite fact store; acceptable per machine, but still prefer a gateway for write fan-in.",
  },
  openviking: {
    provider: "openviking",
    process_model: "shared_daemon",
    authority: "adapter",
    ram_profile: "medium",
    supports_batching: true,
    per_agent_instance_allowed: false,
    notes: "Run one server per machine/tenant, never one OpenViking process per terminal agent.",
  },
  byterover: {
    provider: "byterover",
    process_model: "shared_daemon_or_remote_api",
    authority: "adapter",
    ram_profile: "medium",
    supports_batching: true,
    per_agent_instance_allowed: false,
    notes: "CLI memory should be mediated by SIS gateway when many coding agents are active.",
  },
  mem0: {
    provider: "mem0",
    process_model: "remote_api",
    authority: "accelerator",
    ram_profile: "remote",
    supports_batching: true,
    per_agent_instance_allowed: false,
    notes: "Use as a remote/batched extraction API behind SIS. Do not spawn local Mem0 runtimes per terminal.",
  },
  hindsight: {
    provider: "hindsight",
    process_model: "shared_daemon_or_remote_api",
    authority: "accelerator",
    ram_profile: "medium",
    supports_batching: true,
    per_agent_instance_allowed: false,
    notes: "Use cloud or one local embedded service for graph/reflection; route through SIS for fan-in.",
  },
  honcho: {
    provider: "honcho",
    process_model: "remote_api",
    authority: "accelerator",
    ram_profile: "remote",
    supports_batching: true,
    per_agent_instance_allowed: false,
    notes: "Peer modeling is remote/self-hosted API; SIS should cache and cadence calls.",
  },
  supermemory: {
    provider: "supermemory",
    process_model: "remote_api",
    authority: "accelerator",
    ram_profile: "remote",
    supports_batching: true,
    per_agent_instance_allowed: false,
    notes: "Connector/context backend; keep sessions batched and avoid recursive capture pollution.",
  },
  retaindb: {
    provider: "retaindb",
    process_model: "remote_api",
    authority: "accelerator",
    ram_profile: "remote",
    supports_batching: true,
    per_agent_instance_allowed: false,
    notes: "Cloud typed memory option; SIS remains canonical.",
  },
  memori: {
    provider: "memori",
    process_model: "remote_api",
    authority: "accelerator",
    ram_profile: "remote",
    supports_batching: true,
    per_agent_instance_allowed: false,
    notes: "Candidate cloud backend; enable only after eval scorecard clears baseline.",
  },
  letta_runtime: {
    provider: "letta_runtime",
    process_model: "external_runtime",
    authority: "runtime",
    ram_profile: "high",
    supports_batching: false,
    per_agent_instance_allowed: false,
    notes: "Agent runtime, not SIS memory authority. Run bounded workers, not per-shell background runtimes.",
  },
};

export function estimateProviderResourcePlan(providers: ProviderName[]): ProviderResourcePlan {
  const unique = Array.from(new Set(providers));
  const requiresSingleton: ProviderName[] = [];
  const remoteOrLightweight: ProviderName[] = [];

  for (const provider of unique) {
    const caps = DEFAULT_PROVIDER_CAPABILITIES[provider];
    if (!caps) continue;
    if (!caps.per_agent_instance_allowed) requiresSingleton.push(provider);
    if (caps.process_model === "remote_api" || caps.process_model === "embedded_lightweight") {
      remoteOrLightweight.push(provider);
    }
  }

  return {
    providers: unique,
    max_embedded_heavy_processes_per_machine: 0,
    requires_singleton_broker: requiresSingleton,
    remote_or_lightweight: remoteOrLightweight,
    notes: [
      "Never spawn per terminal agent memory providers; route all agents through the SIS memory gateway/router.",
      "Batch provider writes asynchronously and cache recalls per session to support dozens of concurrent coding agents.",
      "Keep local_core authoritative so external provider outages or RAM pressure degrade capability, not truth.",
    ],
  };
}
