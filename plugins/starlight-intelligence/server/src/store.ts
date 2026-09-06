import type {
  AuditEvent,
  Decision,
  DecisionStatus,
  Evidence,
  PortfolioSnapshot,
  Priority,
  RecordType,
  SearchResult,
  WorkItem,
  WorkStatus,
  WorkspaceState,
} from "./types.js";

export class StarlightError extends Error {
  constructor(
    public readonly code: "NOT_FOUND" | "CONFLICT" | "VALIDATION" | "CONFIRMATION_REQUIRED",
    message: string,
  ) {
    super(message);
  }
}

export interface WorkspaceAdapter {
  read(): Promise<WorkspaceState>;
  write(expectedRevision: number, state: WorkspaceState): Promise<boolean>;
}

export interface StoreOptions {
  adapter: WorkspaceAdapter;
  now?: () => Date;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class StarlightStore {
  private readonly adapter: WorkspaceAdapter;
  private readonly now: () => Date;
  private writeTail: Promise<void> = Promise.resolve();

  constructor(options: StoreOptions) {
    this.adapter = options.adapter;
    this.now = options.now ?? (() => new Date());
  }

  private isoNow(): string {
    return this.now().toISOString();
  }

  private async readUnlocked(): Promise<WorkspaceState> {
    const state = await this.adapter.read();
    if (state.schema_version !== 1) {
      throw new StarlightError("VALIDATION", `Unsupported schema version: ${String(state.schema_version)}`);
    }
    return state;
  }

  async read(): Promise<WorkspaceState> {
    await this.writeTail;
    return clone(await this.readUnlocked());
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.writeTail.then(operation, operation);
    this.writeTail = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private async mutate<T>(
    actor: string,
    action: string,
    recordType: RecordType,
    recordId: string,
    detail: string,
    mutation: (state: WorkspaceState, now: string) => T,
  ): Promise<{ value: T; revision: number }> {
    return this.enqueue(async () => {
      const state = await this.readUnlocked();
      const expectedRevision = state.revision;
      const now = this.isoNow();
      const value = mutation(state, now);
      state.revision += 1;
      state.workspace.updated_at = now;
      const event: AuditEvent = {
        id: `event_${crypto.randomUUID()}`,
        action,
        record_id: recordId,
        record_type: recordType,
        actor,
        at: now,
        detail,
      };
      state.audit_events.push(event);
      if (!(await this.adapter.write(expectedRevision, state))) {
        throw new StarlightError(
          "CONFLICT",
          `Workspace changed while writing revision ${expectedRevision}; read the latest state and retry.`,
        );
      }
      return { value: clone(value), revision: state.revision };
    });
  }

  async createWorkItem(input: {
    venture_id: string;
    objective_id?: string;
    title: string;
    description?: string;
    owner: string;
    priority: Priority;
    due_date?: string;
    dependencies?: string[];
    actor?: string;
  }): Promise<{ work_item: WorkItem; revision: number }> {
    const id = `work_${crypto.randomUUID()}`;
    const result = await this.mutate(
      input.actor ?? "user",
      "work_item.created",
      "work_item",
      id,
      input.title,
      (state, now) => {
        const venture = state.ventures.find((candidate) => candidate.id === input.venture_id);
        if (!venture) throw new StarlightError("NOT_FOUND", `Unknown venture: ${input.venture_id}`);
        if (input.objective_id && !venture.objectives.some((objective) => objective.id === input.objective_id)) {
          throw new StarlightError(
            "VALIDATION",
            `Objective ${input.objective_id} does not belong to venture ${input.venture_id}`,
          );
        }
        for (const dependency of input.dependencies ?? []) {
          if (!state.work_items.some((item) => item.id === dependency)) {
            throw new StarlightError("VALIDATION", `Unknown dependency: ${dependency}`);
          }
        }
        const item: WorkItem = {
          id,
          venture_id: input.venture_id,
          objective_id: input.objective_id,
          title: input.title,
          description: input.description,
          owner: input.owner,
          status: "backlog",
          priority: input.priority,
          due_date: input.due_date,
          dependencies: input.dependencies ?? [],
          version: 1,
          created_at: now,
          updated_at: now,
        };
        state.work_items.push(item);
        return item;
      },
    );
    return { work_item: result.value, revision: result.revision };
  }

  async transitionWorkItem(input: {
    work_item_id: string;
    expected_version: number;
    status: WorkStatus;
    rationale: string;
    user_confirmed?: boolean;
    actor?: string;
  }): Promise<{ work_item: WorkItem; revision: number }> {
    const terminal = input.status === "done" || input.status === "cancelled";
    if (terminal && input.user_confirmed !== true) {
      throw new StarlightError(
        "CONFIRMATION_REQUIRED",
        `Transition to ${input.status} requires explicit user confirmation.`,
      );
    }
    const result = await this.mutate(
      input.actor ?? "user",
      "work_item.transitioned",
      "work_item",
      input.work_item_id,
      `${input.status}: ${input.rationale}`,
      (state, now) => {
        const item = state.work_items.find((candidate) => candidate.id === input.work_item_id);
        if (!item) throw new StarlightError("NOT_FOUND", `Unknown work item: ${input.work_item_id}`);
        if (item.version !== input.expected_version) {
          throw new StarlightError(
            "CONFLICT",
            `Version conflict for ${item.id}: expected ${input.expected_version}, current ${item.version}`,
          );
        }
        if (item.status === "cancelled" && input.status !== "cancelled") {
          throw new StarlightError("VALIDATION", "Cancelled work cannot be reopened by a transition.");
        }
        item.status = input.status;
        item.version += 1;
        item.updated_at = now;
        return item;
      },
    );
    return { work_item: result.value, revision: result.revision };
  }

  async recordDecision(input: {
    venture_id: string;
    title: string;
    context: string;
    decision: string;
    tradeoffs?: string[];
    owner: string;
    status: DecisionStatus;
    evidence_ids?: string[];
    review_date?: string;
    user_confirmed?: boolean;
    actor?: string;
  }): Promise<{ decision: Decision; revision: number }> {
    if ((input.status === "approved" || input.status === "rejected") && input.user_confirmed !== true) {
      throw new StarlightError(
        "CONFIRMATION_REQUIRED",
        `Decision status ${input.status} requires explicit user confirmation.`,
      );
    }
    const id = `decision_${crypto.randomUUID()}`;
    const result = await this.mutate(
      input.actor ?? "user",
      "decision.recorded",
      "decision",
      id,
      input.title,
      (state, now) => {
        if (!state.ventures.some((venture) => venture.id === input.venture_id)) {
          throw new StarlightError("NOT_FOUND", `Unknown venture: ${input.venture_id}`);
        }
        for (const evidenceId of input.evidence_ids ?? []) {
          if (!state.evidence.some((evidence) => evidence.id === evidenceId)) {
            throw new StarlightError("VALIDATION", `Unknown evidence: ${evidenceId}`);
          }
        }
        const decision: Decision = {
          id,
          venture_id: input.venture_id,
          title: input.title,
          context: input.context,
          decision: input.decision,
          tradeoffs: input.tradeoffs ?? [],
          owner: input.owner,
          status: input.status,
          evidence_ids: input.evidence_ids ?? [],
          review_date: input.review_date,
          version: 1,
          created_at: now,
          updated_at: now,
        };
        state.decisions.push(decision);
        return decision;
      },
    );
    return { decision: result.value, revision: result.revision };
  }

  async registerEvidence(input: {
    venture_id: string;
    title: string;
    source_type: Evidence["source_type"];
    source_url?: string;
    note?: string;
    supports_decision_ids?: string[];
    captured_at?: string;
    actor?: string;
  }): Promise<{ evidence: Evidence; revision: number }> {
    if (!input.source_url && !input.note) {
      throw new StarlightError("VALIDATION", "Evidence requires a source URL or a note.");
    }
    const id = `evidence_${crypto.randomUUID()}`;
    const result = await this.mutate(
      input.actor ?? "user",
      "evidence.registered",
      "evidence",
      id,
      input.title,
      (state, now) => {
        if (!state.ventures.some((venture) => venture.id === input.venture_id)) {
          throw new StarlightError("NOT_FOUND", `Unknown venture: ${input.venture_id}`);
        }
        for (const decisionId of input.supports_decision_ids ?? []) {
          if (!state.decisions.some((decision) => decision.id === decisionId)) {
            throw new StarlightError("VALIDATION", `Unknown decision: ${decisionId}`);
          }
        }
        const evidence: Evidence = {
          id,
          venture_id: input.venture_id,
          title: input.title,
          source_type: input.source_type,
          source_url: input.source_url,
          note: input.note,
          supports_decision_ids: input.supports_decision_ids ?? [],
          captured_at: input.captured_at ?? now,
          version: 1,
          created_at: now,
          updated_at: now,
        };
        state.evidence.push(evidence);
        for (const decisionId of evidence.supports_decision_ids) {
          const decision = state.decisions.find((candidate) => candidate.id === decisionId);
          if (decision && !decision.evidence_ids.includes(id)) {
            decision.evidence_ids.push(id);
            decision.version += 1;
            decision.updated_at = now;
          }
        }
        return evidence;
      },
    );
    return { evidence: result.value, revision: result.revision };
  }

  async getSnapshot(options: { venture_ids?: string[]; include_closed?: boolean } = {}): Promise<PortfolioSnapshot> {
    const state = await this.read();
    const ventureIds = new Set(options.venture_ids ?? state.ventures.map((venture) => venture.id));
    const ventures = state.ventures.filter((venture) => ventureIds.has(venture.id));
    const closed = new Set<WorkStatus>(["done", "cancelled"]);
    const workItems = state.work_items.filter(
      (item) => ventureIds.has(item.venture_id) && (options.include_closed || !closed.has(item.status)),
    );
    const decisions = state.decisions.filter((decision) => ventureIds.has(decision.venture_id));
    const evidence = state.evidence.filter((record) => ventureIds.has(record.venture_id));
    const generatedAt = this.isoNow();
    return {
      snapshot_id: `snapshot_${state.revision}_${generatedAt}`,
      generated_at: generatedAt,
      revision: state.revision,
      workspace: state.workspace,
      summary: {
        ventures: ventures.length,
        active_work: workItems.filter((item) => item.status === "ready" || item.status === "in_progress").length,
        blocked_work: workItems.filter((item) => item.status === "blocked").length,
        critical_work: workItems.filter((item) => item.priority === "critical").length,
        pending_decisions: decisions.filter((decision) => decision.status === "proposed").length,
        evidence_records: evidence.length,
      },
      ventures,
      work_items: workItems,
      decisions,
      evidence,
    };
  }

  async getRecord(id: string): Promise<{ type: RecordType; record: unknown; venture_id?: string }> {
    const state = await this.read();
    const venture = state.ventures.find((candidate) => candidate.id === id);
    if (venture) return { type: "venture", record: venture, venture_id: venture.id };
    for (const parent of state.ventures) {
      const objective = parent.objectives.find((candidate) => candidate.id === id);
      if (objective) return { type: "objective", record: objective, venture_id: parent.id };
    }
    const workItem = state.work_items.find((candidate) => candidate.id === id);
    if (workItem) return { type: "work_item", record: workItem, venture_id: workItem.venture_id };
    const decision = state.decisions.find((candidate) => candidate.id === id);
    if (decision) return { type: "decision", record: decision, venture_id: decision.venture_id };
    const evidence = state.evidence.find((candidate) => candidate.id === id);
    if (evidence) return { type: "evidence", record: evidence, venture_id: evidence.venture_id };
    throw new StarlightError("NOT_FOUND", `Unknown record: ${id}`);
  }

  async search(input: {
    query: string;
    venture_id?: string;
    types?: RecordType[];
    limit?: number;
  }): Promise<SearchResult[]> {
    const state = await this.read();
    const tokens = input.query.toLowerCase().split(/\s+/).filter(Boolean);
    const acceptedTypes = new Set<RecordType>(input.types ?? ["venture", "objective", "work_item", "decision", "evidence"]);
    const results: SearchResult[] = [];
    const push = (result: Omit<SearchResult, "score">, haystack: string) => {
      if (input.venture_id && result.venture_id !== input.venture_id && result.id !== input.venture_id) return;
      const normalized = haystack.toLowerCase();
      const score = tokens.reduce((total, token) => total + (normalized.includes(token) ? 1 : 0), 0);
      if (score > 0 || tokens.length === 0) results.push({ ...result, score });
    };

    if (acceptedTypes.has("venture")) {
      for (const venture of state.ventures) {
        push(
          {
            id: venture.id,
            type: "venture",
            venture_id: venture.id,
            title: venture.name,
            snippet: venture.mission,
            status: venture.health,
            updated_at: venture.updated_at,
          },
          `${venture.name} ${venture.kind} ${venture.mission} ${venture.status} ${venture.health}`,
        );
      }
    }
    if (acceptedTypes.has("objective")) {
      for (const venture of state.ventures) {
        for (const objective of venture.objectives) {
          push(
            {
              id: objective.id,
              type: "objective",
              venture_id: venture.id,
              title: objective.title,
              snippet: `${objective.owner}; ${objective.progress}% complete`,
              status: objective.status,
              updated_at: venture.updated_at,
            },
            `${objective.title} ${objective.owner} ${objective.status}`,
          );
        }
      }
    }
    if (acceptedTypes.has("work_item")) {
      for (const item of state.work_items) {
        push(
          {
            id: item.id,
            type: "work_item",
            venture_id: item.venture_id,
            title: item.title,
            snippet: item.description ?? `${item.owner}; ${item.priority} priority`,
            status: item.status,
            updated_at: item.updated_at,
          },
          `${item.title} ${item.description ?? ""} ${item.owner} ${item.status} ${item.priority}`,
        );
      }
    }
    if (acceptedTypes.has("decision")) {
      for (const decision of state.decisions) {
        push(
          {
            id: decision.id,
            type: "decision",
            venture_id: decision.venture_id,
            title: decision.title,
            snippet: decision.decision,
            status: decision.status,
            updated_at: decision.updated_at,
          },
          `${decision.title} ${decision.context} ${decision.decision} ${decision.tradeoffs.join(" ")} ${decision.status}`,
        );
      }
    }
    if (acceptedTypes.has("evidence")) {
      for (const evidence of state.evidence) {
        push(
          {
            id: evidence.id,
            type: "evidence",
            venture_id: evidence.venture_id,
            title: evidence.title,
            snippet: evidence.note ?? evidence.source_url ?? evidence.source_type,
            updated_at: evidence.updated_at,
            source_url: evidence.source_url,
          },
          `${evidence.title} ${evidence.note ?? ""} ${evidence.source_url ?? ""} ${evidence.source_type}`,
        );
      }
    }
    return results
      .sort((left, right) => right.score - left.score || right.updated_at.localeCompare(left.updated_at))
      .slice(0, input.limit ?? 10);
  }
}
