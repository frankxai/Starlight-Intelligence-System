export interface AgentRecord {
  id: string; kind: 'agent' | 'skill' | 'constitution'; name: string; estate: string; brand: string;
  sourceRef: string; sourceKind: string; contentHash: string; tokenEstimate: number;
  identity: { displayName: string; tagline: string; voice: string; values: string[]; boundaries: string[]; soulRef: string | null };
  mind: { skills: string[]; kb: string[]; memoryScope: string | null; approach: string };
  will: { toolsAllow: string[]; toolsDeny: string[]; humanGates: string[]; handoffs: Array<{ to: string; when: string }>; mcpServers: string[] };
  body: { model: string | null; surfaces: string[]; harness: string | null; workingDirectories: string[] };
  routing: { description: string; keywords: string[]; intents: string[]; files: string[]; verbs: string[]; domain: string | null; tier: string | null; rank: string | null; status: string | null; verifier: string | null };
  provenance: { scanned: boolean; lifecycle: string; family: string | null; headings: string[]; body?: string | null };
}
export type Capability = AgentRecord & { kind: 'skill' };
export interface IdentityAtom { id: string; layer: string; sourceRef: string; sourceKind: string; contentHash: string; tokenEstimate: number; required: boolean; activation: string; text: string }
export interface ComposedSoul { atoms: IdentityAtom[]; selected: IdentityAtom[]; excluded: Array<{ id: string; reason: string }>; sourceDigest: string; tokenEstimate: number; markdown: string }
export interface CompileRequest {
  packId: string; taskId: string; correlationId: string; targetHarness: string; repoRef: string; routeId: string; riskClass: string; tokenBudget: number;
  atoms: Array<{ id: string; sourceRef: string; sourceKind: string; owner: string; scope: string; activation: string; contentHash: string; tokenEstimate: number; lifecycle: string; generated: false }>;
  hostBindings: Array<{ atomId: string; hostMessageRole: 'host-system' | 'host-developer' | 'host-user' }>;
}
export interface RouteDecision {
  schema: 'starlight.route.v1'; request: string; resolution: 'resolved' | 'ambiguous' | 'refused'; reason?: string;
  maker: { id: string; name: string; score: number; sourceRef: string; tools: string[] } | null;
  verifier: { id: string; name: string; score: number; crossProviderLane: string | null } | null;
  riskClass: string; gates: string[]; candidates: Array<{ id: string; score: number; why: string[] }>;
}
export interface VerificationReceipt { status: 'fixture-verified' | 'failed' | 'unsupported'; noSpend?: boolean; hostExercised?: false; installed?: boolean; deterministic?: boolean; bytesMatch?: boolean; sourceMatches?: boolean; identityDigest?: string; reason?: string }
export interface TeamPlan { schema: 'starlight.team-plan.v1'; status: 'ready-to-install' | 'collision' | 'preview-only'; host: string; reason?: string; agent?: string; sourceRef?: string; sourceHash?: string; identityDigest?: string; target?: string; contentHash?: string; preview?: string; tools?: string[]; humanGates?: string[]; fixtureCostCeilingUsd?: 0; executionCostCeilingUsd?: null; existing?: string; manifest?: string; writes: string[] }
export interface TeamOptions { root?: string; agent?: string; host?: string; yes?: boolean; acceptHash?: string; json?: boolean }
export function scanEstate(options?: { includeSkills?: boolean; includeGlobalSkills?: boolean }): { records: AgentRecord[]; sources: unknown[]; warnings: string[] };
export function composeSoul(record: AgentRecord, options?: { budget?: number }): ComposedSoul;
export function toCompileRequest(record: AgentRecord, soul: ComposedSoul, options?: { budget?: number; targetHarness?: string }): CompileRequest;
export function toA2ACard(record: AgentRecord, soul: ComposedSoul, options?: { baseUrl?: string; protocolBinding?: 'HTTP+JSON' | 'JSONRPC' | 'GRPC'; includeSourceRef?: boolean }): { file: string; content: string };
export function toClaudeCode(record: AgentRecord, soul: ComposedSoul): { file: string; content: string };
export function lintClaude(name: string, raw: string): Array<{ severity: string; code: string; detail: string }>;
export function route(request: string, options?: { records?: AgentRecord[]; top?: number; threshold?: number; brand?: string; estate?: string; files?: string[]; harness?: string }): RouteDecision;
export function makeTeamPlan(options?: TeamOptions): TeamPlan;
export function runTeamCommand(command: 'init' | 'doctor' | 'plan' | 'install' | 'verify' | 'rollback', options?: TeamOptions): TeamPlan | VerificationReceipt | Record<string, unknown>;
