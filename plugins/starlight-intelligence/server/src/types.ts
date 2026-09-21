export type VentureHealth = "clear" | "watch" | "critical";
export type VentureStatus = "active" | "incubating" | "paused";
export type WorkStatus = "backlog" | "ready" | "in_progress" | "blocked" | "done" | "cancelled";
export type Priority = "low" | "medium" | "high" | "critical";
export type DecisionStatus = "proposed" | "approved" | "rejected" | "superseded";
export type RecordType = "venture" | "objective" | "work_item" | "decision" | "evidence";

export interface Metric {
  key: string;
  label: string;
  value: number;
  unit: string;
  target?: number;
  trend?: "up" | "flat" | "down";
}

export interface Objective {
  id: string;
  title: string;
  owner: string;
  status: "active" | "at_risk" | "achieved" | "paused";
  progress: number;
  due_date?: string;
}

export interface Venture {
  id: string;
  name: string;
  kind: string;
  mission: string;
  status: VentureStatus;
  health: VentureHealth;
  version: number;
  metrics: Metric[];
  objectives: Objective[];
  created_at: string;
  updated_at: string;
}

export interface WorkItem {
  id: string;
  venture_id: string;
  objective_id?: string;
  title: string;
  description?: string;
  owner: string;
  status: WorkStatus;
  priority: Priority;
  due_date?: string;
  dependencies: string[];
  version: number;
  created_at: string;
  updated_at: string;
}

export interface Decision {
  id: string;
  venture_id: string;
  title: string;
  context: string;
  decision: string;
  tradeoffs: string[];
  owner: string;
  status: DecisionStatus;
  evidence_ids: string[];
  review_date?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  venture_id: string;
  title: string;
  source_type: "url" | "document" | "metric" | "observation";
  source_url?: string;
  note?: string;
  supports_decision_ids: string[];
  captured_at: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  record_id: string;
  record_type: RecordType;
  actor: string;
  at: string;
  detail?: string;
}

export interface WorkspaceState {
  schema_version: 1;
  revision: number;
  workspace: {
    id: string;
    name: string;
    doctrine: string;
    created_at: string;
    updated_at: string;
  };
  ventures: Venture[];
  work_items: WorkItem[];
  decisions: Decision[];
  evidence: Evidence[];
  audit_events: AuditEvent[];
}

export interface PortfolioSnapshot {
  snapshot_id: string;
  generated_at: string;
  revision: number;
  workspace: WorkspaceState["workspace"];
  summary: {
    ventures: number;
    active_work: number;
    blocked_work: number;
    critical_work: number;
    pending_decisions: number;
    evidence_records: number;
  };
  ventures: Venture[];
  work_items: WorkItem[];
  decisions: Decision[];
  evidence: Evidence[];
}

export interface SearchResult {
  id: string;
  type: RecordType;
  venture_id?: string;
  title: string;
  snippet: string;
  status?: string;
  updated_at: string;
  source_url?: string;
  score: number;
}
