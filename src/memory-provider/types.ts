export type ProviderName =
  | "local_core"
  | "holographic"
  | "openviking"
  | "byterover"
  | "mem0"
  | "hindsight"
  | "honcho"
  | "supermemory"
  | "retaindb"
  | "memori"
  | "letta_runtime"
  | string;

export type MemoryProviderMode =
  | "canonical_write"
  | "derived_local_write"
  | "redacted_fact_write"
  | "graph_projection"
  | "document_or_session_ingest"
  | "peer_observation"
  | "runtime_context";

export type PrivacyClass = "public" | "private-shareable" | "private" | "secret" | "regulated";

export type RetentionPolicy = "ephemeral" | "rolling_90d" | "permanent" | "append_only" | "delete_by";

export type SISMemoryType =
  | "working"
  | "episodic"
  | "semantic"
  | "procedural"
  | "profile"
  | "policy"
  | "aspirational";

export type SISVault = "strategic" | "technical" | "creative" | "operational" | "wisdom" | "horizon";

export type ProcessModel =
  | "embedded_lightweight"
  | "shared_daemon"
  | "remote_api"
  | "shared_daemon_or_remote_api"
  | "external_runtime";

export interface SISMemoryRecord {
  memory_id: string;
  tenant_id: string;
  workspace_id?: string;
  agent_id?: string;
  user_id?: string;
  source: {
    system: string;
    event_id?: string;
    session_id?: string;
    turn_id?: string;
    uri?: string;
  };
  modality: "text" | "voice" | "image" | "video" | "file" | "code" | "event";
  memory_type: SISMemoryType;
  vault?: SISVault;
  raw_content?: string;
  normalized_fact?: string;
  summary?: string;
  entities: Array<{ id?: string; name: string; type?: string; confidence?: number }>;
  relations: Array<{ subject: string; predicate: string; object: string; confidence?: number }>;
  time_range?: { start?: string; end?: string; observed_at?: string };
  importance: number;
  confidence: number;
  trust: number;
  privacy_class: PrivacyClass;
  retention_policy: RetentionPolicy;
  retention_until?: string;
  provenance: Array<{
    event_id: string;
    transform: "raw" | "redacted" | "extracted" | "summarized" | "embedded" | "graph_projected" | "provider_imported";
    at: string;
  }>;
  provider_shadow_refs: Record<string, {
    provider_record_id: string;
    container?: string;
    url?: string;
    last_synced_at: string;
    sync_state: "pending" | "synced" | "failed" | "deleted";
  }>;
}

export interface TenantMemoryPolicy {
  tenant_id: string;
  local_only?: boolean;
  local_provider?: ProviderName;
  default_cloud_memory?: ProviderName;
  graph_memory?: boolean;
  enterprise_connectors?: boolean;
  peer_modeling?: boolean;
  developer_cli_memory?: boolean;
  knowledge_browsing?: boolean;
  local_compositional_recall?: boolean;
  allow_regulated_external_mirror?: boolean;
}

export interface ProviderRoute {
  provider: ProviderName;
  mode: MemoryProviderMode;
  reason: string;
}

export interface ProviderCapabilities {
  provider: ProviderName;
  process_model: ProcessModel;
  authority: "primary" | "adapter" | "accelerator" | "runtime";
  ram_profile: "low" | "medium" | "high" | "remote";
  supports_batching: boolean;
  per_agent_instance_allowed: boolean;
  notes: string;
}

export interface RecallRequest {
  tenant_id: string;
  query: string;
  limit?: number;
  min_score?: number;
}

export interface RecallResult {
  record: SISMemoryRecord;
  score: number;
  matched_terms: string[];
}

export interface ForgetRequest {
  tenant_id: string;
  memory_id: string;
}

export interface MemoryProvider {
  readonly name: ProviderName;
  readonly capabilities: ProviderCapabilities;
  remember(record: SISMemoryRecord): Promise<SISMemoryRecord>;
  recall(request: RecallRequest): Promise<RecallResult[]>;
  forget(request: ForgetRequest): Promise<boolean>;
}

export interface ProviderResourcePlan {
  providers: ProviderName[];
  max_embedded_heavy_processes_per_machine: number;
  requires_singleton_broker: ProviderName[];
  remote_or_lightweight: ProviderName[];
  notes: string[];
}
