/**
 * Starlight Managed Cloud & Service Mesh — Core Type Contracts
 * Built on SIP v1.1.1
 */

export type EpistemicTier = 
  | 'strategic'   // ◆ Strategic decisions & outcomes
  | 'technical'   // ⬡ Architectures, code patterns, schemas
  | 'creative'    // ✦ Voice, aesthetic rules, narratives
  | 'operational' // ▸ Workflows, receipts, execution traces
  | 'wisdom'      // ◎ High-order principles, cross-domain laws
  | 'horizon';    // ↗ Vision, future roadmaps, long bets

export interface MemoryAtom {
  id: string;
  tenantId: string;
  tier: EpistemicTier;
  namespace: string;
  content: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  isEncrypted?: boolean;
  createdAt: string;
  updatedAt: string;
  halfLifeDays: number;
}

export interface IngestionRequest {
  tier?: EpistemicTier;
  namespace?: string;
  content: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  isEncrypted?: boolean;
  halfLifeDays?: number;
}

export interface IngestionResult {
  success: boolean;
  id: string;
  tier: EpistemicTier;
  namespace: string;
  piiScrubbed: boolean;
  vectorId: string;
  createdAt: string;
}

export interface QueryRequest {
  query: string;
  tier?: EpistemicTier;
  namespace?: string;
  limit?: number;
  minScore?: number;
  includeDecayed?: boolean;
}

export interface QueryResult {
  atom: MemoryAtom;
  vectorScore: number;
  textScore: number;
  decayWeight: number;
  combinedScore: number;
  provenance: string;
}

export interface QueryResponse {
  query: string;
  count: number;
  results: QueryResult[];
  latencyMs: number;
  edgeRegion: string;
}

export interface VirtualToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  scope: string;
  tokenCostEst: number;
  upstreamServer: string;
}

export interface VmcpRequest {
  agentId: string;
  activeIntent: string;
  activeFilePath?: string;
  leasedWorktree?: string;
}

export interface VmcpResponse {
  activeIntent: string;
  activeFilePath?: string;
  activeTools: VirtualToolDefinition[];
  metrics: {
    totalRegisteredTools: number;
    activeToolsMounted: number;
    unfilteredTokenCost: number;
    filteredTokenCost: number;
    tokenSavingsPercent: number;
  };
}

export interface SwarmLeaseRequest {
  agentId: string;
  worktree: string;
  paths: string[];
  ttlSeconds?: number;
}

export interface SwarmLeaseResponse {
  leaseId: string;
  agentId: string;
  worktree: string;
  paths: string[];
  acquiredAt: string;
  expiresAt: string;
  status: 'acquired' | 'conflict';
  conflictWith?: string;
  storageBackend?: 'd1' | 'kv' | 'memory-component';
}

export interface TenantContext {
  tenantId: string;
  orgName: string;
  plan: 'solo' | 'studio' | 'enterprise';
  quotaRemaining: number;
  byovEnabled: boolean;
}

export type TaskComplexityTier = 'mechanical' | 'balanced' | 'deep_reasoning';

export interface CostRoutingDecision {
  complexityTier: TaskComplexityTier;
  selectedModel: string;
  selectedProvider: 'workers-ai' | 'anthropic' | 'openai' | 'edge-sim';
  estimatedInputTokens: number;
  estimatedCostUsd: number;
  rationale: string;
}

export interface A2AAgentSkill {
  id: string;
  name: string;
  description: string;
  tags: string[];
  examples?: string[];
}

export interface A2AAgentCard {
  schemaVersion: '1.0.0';
  name: string;
  description: string;
  url: string;
  version: string;
  protocol: string;
  attestation: string;
  provider: {
    organization: string;
    url: string;
  };
  capabilities: {
    streaming: boolean;
    pushNotifications: boolean;
    stateTransitionHistory: boolean;
    mcpTransport: 'streamable-http';
    mcpEndpoint: string;
    mcpSpecVersion: string;
    epistemicVaults: number;
  };
  authentication: {
    schemes: string[];
    protectedApiStatus: 'available' | 'unavailable';
    reason: string;
  };
  defaultInputModes: string[];
  defaultOutputModes: string[];
  skills: A2AAgentSkill[];
}
