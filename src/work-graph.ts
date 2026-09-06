export type WorkGraphEventKind =
  | "intent.captured"
  | "work.admitted"
  | "run.started"
  | "artifact.produced"
  | "change.opened"
  | "check.passed"
  | "deployment.succeeded"
  | "verification.passed"
  | "work.blocked"
  | "work.completed";

export type WorkGraphSourceSystem =
  | "human"
  | "hermes"
  | "telegram"
  | "codex"
  | "claude"
  | "antigravity"
  | "github"
  | "ci"
  | "deployment"
  | "observatory"
  | "other";

export interface WorkGraphEvent {
  schemaVersion: "1.0";
  eventId: string;
  workId: string;
  correlationId: string;
  projectId: string;
  kind: WorkGraphEventKind;
  source: {
    system: WorkGraphSourceSystem;
    sourceId: string;
    uri?: string;
  };
  actorId: string;
  occurredAt: string;
  observedAt: string;
  evidenceRefs: string[];
  visibility: "public" | "internal" | "private" | "restricted";
  retention: "ephemeral" | "operational" | "audit";
  summary: string;
  data?: Record<string, unknown>;
}

export interface CompletionRequirements {
  artifact: boolean;
  change: boolean;
  checks: boolean;
  deployment: boolean;
  verification: boolean;
}

export type ProofKind = keyof CompletionRequirements;

export interface WorkGraphIssue {
  code: "completion-gate-failed" | "event-id-conflict" | "invalid-event";
  eventId: string;
  workId: string;
  message: string;
}

export interface WorkGraphWorkItem {
  workId: string;
  projectId: string;
  correlationId: string;
  admitted: boolean;
  requirements: CompletionRequirements;
  proofEventIds: Record<ProofKind, string[]>;
  missingProofs: ProofKind[];
  readyToComplete: boolean;
  completed: boolean;
  blocked: boolean;
  lastObservedAt: string;
}

export interface WorkGraphProjection {
  workItems: WorkGraphWorkItem[];
  issues: WorkGraphIssue[];
}

export interface ParsedWorkGraphJsonl {
  events: WorkGraphEvent[];
  issues: WorkGraphIssue[];
}

const EMPTY_REQUIREMENTS: CompletionRequirements = {
  artifact: false,
  change: false,
  checks: false,
  deployment: false,
  verification: false,
};

const EVENT_KINDS = new Set<WorkGraphEventKind>([
  "intent.captured",
  "work.admitted",
  "run.started",
  "artifact.produced",
  "change.opened",
  "check.passed",
  "deployment.succeeded",
  "verification.passed",
  "work.blocked",
  "work.completed",
]);

const SOURCE_SYSTEMS = new Set<WorkGraphSourceSystem>([
  "human",
  "hermes",
  "telegram",
  "codex",
  "claude",
  "antigravity",
  "github",
  "ci",
  "deployment",
  "observatory",
  "other",
]);

const EVENT_FIELDS = new Set([
  "schemaVersion",
  "eventId",
  "workId",
  "correlationId",
  "projectId",
  "kind",
  "source",
  "actorId",
  "occurredAt",
  "observedAt",
  "evidenceRefs",
  "visibility",
  "retention",
  "summary",
  "data",
]);
const SOURCE_FIELDS = new Set(["system", "sourceId", "uri"]);
const REQUIREMENT_FIELDS = ["artifact", "change", "checks", "deployment", "verification"] as const;
const RFC3339_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRfc3339Instant(value: unknown): value is string {
  return nonEmptyString(value) && RFC3339_INSTANT.test(value) && Number.isFinite(Date.parse(value));
}

function validateEvent(value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return ["event must be a JSON object"];
  }

  const event = value as Record<string, unknown>;
  const errors: string[] = [];
  for (const field of Object.keys(event)) {
    if (!EVENT_FIELDS.has(field)) errors.push(`unknown event field: ${field}`);
  }
  if (event.schemaVersion !== "1.0") errors.push("schemaVersion must be 1.0");
  for (const field of ["eventId", "workId", "correlationId", "projectId", "actorId", "summary"] as const) {
    if (!nonEmptyString(event[field])) errors.push(`${field} must be a non-empty string`);
  }
  if (!EVENT_KINDS.has(event.kind as WorkGraphEventKind)) errors.push("kind is not supported");
  if (!isRfc3339Instant(event.occurredAt)) {
    errors.push("occurredAt must be a timezone-bearing RFC 3339 instant");
  }
  if (!isRfc3339Instant(event.observedAt)) {
    errors.push("observedAt must be a timezone-bearing RFC 3339 instant");
  }
  if (!Array.isArray(event.evidenceRefs) || event.evidenceRefs.length === 0 ||
      event.evidenceRefs.some((ref) => !nonEmptyString(ref))) {
    errors.push("evidenceRefs must contain at least one non-empty reference");
  }
  if (!["public", "internal", "private", "restricted"].includes(String(event.visibility))) {
    errors.push("visibility is not supported");
  }
  if (!["ephemeral", "operational", "audit"].includes(String(event.retention))) {
    errors.push("retention is not supported");
  }
  if (!event.source || typeof event.source !== "object" || Array.isArray(event.source)) {
    errors.push("source must be an object");
  } else {
    const source = event.source as Record<string, unknown>;
    for (const field of Object.keys(source)) {
      if (!SOURCE_FIELDS.has(field)) errors.push(`unknown source field: ${field}`);
    }
    if (!SOURCE_SYSTEMS.has(source.system as WorkGraphSourceSystem)) {
      errors.push("source.system is not supported");
    }
    if (!nonEmptyString(source.sourceId)) errors.push("source.sourceId must be a non-empty string");
    if (source.uri !== undefined && !nonEmptyString(source.uri)) {
      errors.push("source.uri must be a non-empty string when provided");
    }
  }
  if (event.data !== undefined &&
      (!event.data || typeof event.data !== "object" || Array.isArray(event.data))) {
    errors.push("data must be an object when provided");
  }
  if (event.kind === "work.admitted") {
    const data = event.data as Record<string, unknown> | undefined;
    const requirements = data?.requirements;
    if (!requirements || typeof requirements !== "object" || Array.isArray(requirements)) {
      errors.push("work.admitted data.requirements must be an object");
    } else {
      const requirementRecord = requirements as Record<string, unknown>;
      for (const field of Object.keys(requirementRecord)) {
        if (!REQUIREMENT_FIELDS.includes(field as typeof REQUIREMENT_FIELDS[number])) {
          errors.push(`unknown requirements field: ${field}`);
        }
      }
      for (const field of REQUIREMENT_FIELDS) {
        if (typeof requirementRecord[field] !== "boolean") {
          errors.push(`data.requirements.${field} must be a boolean`);
        }
      }
    }
  }
  return errors;
}

export function parseWorkGraphJsonl(input: string): ParsedWorkGraphJsonl {
  const events: WorkGraphEvent[] = [];
  const issues: WorkGraphIssue[] = [];

  for (const [index, raw] of input.split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (!line) continue;
    let value: unknown;
    try {
      value = JSON.parse(line);
    } catch (error) {
      issues.push({
        code: "invalid-event",
        eventId: `line:${index + 1}`,
        workId: "unknown",
        message: `Line ${index + 1} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      });
      continue;
    }

    const errors = validateEvent(value);
    if (errors.length > 0) {
      const candidate = value as Record<string, unknown>;
      issues.push({
        code: "invalid-event",
        eventId: nonEmptyString(candidate.eventId) ? candidate.eventId : `line:${index + 1}`,
        workId: nonEmptyString(candidate.workId) ? candidate.workId : "unknown",
        message: `Line ${index + 1}: ${errors.join("; ")}`,
      });
      continue;
    }

    events.push(value as WorkGraphEvent);
  }

  return { events, issues };
}

function completionRequirements(event: WorkGraphEvent): CompletionRequirements {
  const raw = event.data?.requirements;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...EMPTY_REQUIREMENTS };
  }

  const value = raw as Record<string, unknown>;
  return {
    artifact: value.artifact === true,
    change: value.change === true,
    checks: value.checks === true,
    deployment: value.deployment === true,
    verification: value.verification === true,
  };
}

function proofKind(kind: WorkGraphEventKind): ProofKind | null {
  switch (kind) {
    case "artifact.produced":
      return "artifact";
    case "change.opened":
      return "change";
    case "check.passed":
      return "checks";
    case "deployment.succeeded":
      return "deployment";
    case "verification.passed":
      return "verification";
    default:
      return null;
  }
}

function missingProofs(item: WorkGraphWorkItem): ProofKind[] {
  return (Object.keys(item.requirements) as ProofKind[]).filter(
    (kind) => item.requirements[kind] && item.proofEventIds[kind].length === 0,
  );
}

export function projectWorkGraph(events: readonly WorkGraphEvent[]): WorkGraphProjection {
  const items = new Map<string, WorkGraphWorkItem>();
  const issues: WorkGraphIssue[] = [];
  const observedEvents = new Map<string, string>();

  for (const event of [...events].sort((a, b) =>
    a.observedAt.localeCompare(b.observedAt) || a.eventId.localeCompare(b.eventId)
  )) {
    const serialized = JSON.stringify(event);
    const prior = observedEvents.get(event.eventId);
    if (prior) {
      if (prior !== serialized) {
        issues.push({
          code: "event-id-conflict",
          eventId: event.eventId,
          workId: event.workId,
          message: `Event id ${event.eventId} was reused with a different payload`,
        });
      }
      continue;
    }
    observedEvents.set(event.eventId, serialized);

    let item = items.get(event.workId);
    if (!item) {
      item = {
        workId: event.workId,
        projectId: event.projectId,
        correlationId: event.correlationId,
        admitted: false,
        requirements: { ...EMPTY_REQUIREMENTS },
        proofEventIds: {
          artifact: [],
          change: [],
          checks: [],
          deployment: [],
          verification: [],
        },
        missingProofs: [],
        readyToComplete: false,
        completed: false,
        blocked: false,
        lastObservedAt: event.observedAt,
      };
      items.set(event.workId, item);
    }

    item.lastObservedAt = event.observedAt;
    if (event.kind === "work.admitted") {
      item.admitted = true;
      item.requirements = completionRequirements(event);
    }

    const proof = proofKind(event.kind);
    if (proof) item.proofEventIds[proof].push(event.eventId);
    if (event.kind === "work.blocked") item.blocked = true;

    item.missingProofs = missingProofs(item);
    item.readyToComplete = item.admitted && item.missingProofs.length === 0 && !item.blocked;

    if (event.kind === "work.completed") {
      if (item.readyToComplete) {
        item.completed = true;
      } else {
        issues.push({
          code: "completion-gate-failed",
          eventId: event.eventId,
          workId: event.workId,
          message: !item.admitted
            ? "Completion refused; work was not admitted"
            : `Completion refused; missing proof: ${item.missingProofs.join(", ") || "work is blocked"}`,
        });
      }
    }
  }

  return {
    workItems: [...items.values()].sort((a, b) => a.workId.localeCompare(b.workId)),
    issues,
  };
}
