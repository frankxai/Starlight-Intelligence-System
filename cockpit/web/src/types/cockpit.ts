/**
 * Starlight Cockpit — Core Domain Types
 * Built on Starlight Intelligence Protocol (SIP) v1.1.1
 */

export type VaultType =
  | 'strategic'
  | 'technical'
  | 'creative'
  | 'operational'
  | 'wisdom'
  | 'horizon';

export interface VaultMetadata {
  id: VaultType;
  name: string;
  glyph: string;
  color: string;
  glowColor: string;
  description: string;
  retention: 'Permanent' | '90-day Rolling';
  writers: string[];
  readers: string;
  tags: string[];
}

export interface VaultEntry {
  id: string;
  vault: VaultType;
  content: string;
  category: string;
  confidence: string;
  tags: string[];
  source: string;
  author?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export type AgentId =
  | 'orchestrator'
  | 'architect'
  | 'sentinel'
  | 'weaver'
  | 'prime'
  | 'navigator'
  | 'hermes';

export type AgentStatus = 'idle' | 'deliberating' | 'executing';

export interface AgentNodeData {
  id: AgentId;
  name: string;
  role: string;
  domain: string;
  model: string;
  tier: 'Core' | 'Specialist' | 'Foundation';
  status: AgentStatus;
  voice: string;
  activeVaults: VaultType[];
  lastOutput?: string;
  avatarColor: string;
}

export type GateType = 'santa-review' | 'sip-consensus';
export type GateStatus = 'pending' | 'auditing' | 'ratified' | 'rejected';

export interface ExecutionGateData {
  id: string;
  name: string;
  gateType: GateType;
  status: GateStatus;
  criteria: {
    name: string;
    passed: boolean;
    evidence?: string;
  }[];
  verdict?: string;
  consensusId?: string;
}

export type NodeType = 'memoryVault' | 'agent' | 'executionGate';

export interface CanvasNode<T = unknown> {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  data: T;
  selected?: boolean;
}

export interface CanvasEdge {
  id: string;
  source: string; // node ID
  target: string; // node ID
  active: boolean;
  animated?: boolean;
  color?: string;
  label?: string;
}

export interface CouncilMemberState {
  agentId: AgentId;
  agentName: string;
  roleTitle: string;
  status: 'idle' | 'streaming' | 'concluded';
  content: string;
  verdict?: 'APPROVED' | 'RATIFIED' | 'CONVERGED' | 'FLAGGED';
  score?: number;
  citations: string[];
}

export interface SipConsensusArtifact {
  sip_version: string;
  protocol: string;
  consensus_id: string;
  timestamp: string;
  topic: string;
  connected_vaults: VaultType[];
  council: {
    architect: {
      verdict: string;
      summary: string;
      spec_hash: string;
      invariants_passed: boolean;
    };
    sentinel: {
      verdict: string;
      summary: string;
      taste_score: number;
      security_cleared: boolean;
      pii_veil_checked: boolean;
    };
    prime: {
      verdict: string;
      summary: string;
      execution_plan: string[];
      convergence_confidence: number;
    };
  };
  consensus_status: 'RATIFIED' | 'REJECTED';
  attestation: {
    signature: string;
    seal: string;
    verified_by: string;
    fingerprint: string;
  };
}

export interface SearchQueryResult {
  entry: VaultEntry;
  score: number;
  matchType: 'exact' | 'fts' | 'vector';
  latencyMs: number;
}
