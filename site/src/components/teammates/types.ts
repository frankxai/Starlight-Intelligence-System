export type ModelTier = "light" | "standard" | "frontier";

export type TeammateStatus = "idle" | "running" | "waiting_approval";

export interface ExecutionStep {
  id: string;
  summary: string;
  durationMs: number;
  status: "success" | "running" | "error" | "pending";
  command?: string;
  tool?: string;
  output?: string;
  diff?: string;
}

export interface ApprovalRequest {
  id: string;
  type: "FINANCIAL" | "GIT_MERGE" | "DEPLOYMENT" | "PUBLIC_BROADCAST";
  title: string;
  description: string;
  consequences: string;
  details?: Record<string, string>;
  status: "pending" | "approved" | "rejected";
}

export interface TeammateMessage {
  id: string;
  sender: "user" | "teammate" | "system";
  content: string;
  timestamp: string;
  executionTree?: ExecutionStep[];
  approvalRequest?: ApprovalRequest;
}

export interface Teammate {
  id: string;
  name: string;
  role: string;
  domain: string;
  voice: string;
  avatarColor: string;
  status: TeammateStatus;
  unreadCount: number;
  lastActive: string;
  modelTier: ModelTier;
  connectedTools: string[];
  activeVaults: string[];
  messages: TeammateMessage[];
}

export interface ProjectContext {
  id: string;
  name: string;
  description: string;
  activeBranch: string;
  linkedVaults: string[];
}
