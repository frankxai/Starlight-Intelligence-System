import { createHash } from "node:crypto";

export const INSTRUCTION_COMPILER_SCHEMA = "starlight.instruction-compiler-contract.v1" as const;

export const AUTHORITY_ORDER = [
  "host-system",
  "host-developer",
  "host-user",
  "untrusted-reference-data",
] as const;

export type Authority = (typeof AUTHORITY_ORDER)[number];

export const SOURCE_KINDS = [
  "AGENTS.md",
  "CLAUDE.md",
  "GEMINI.md",
  "SKILL.md",
  "policy",
  "brand-pack",
  "route-pack",
  "schema",
  "example",
] as const;

export type SourceKind = (typeof SOURCE_KINDS)[number];

export const LIFECYCLES = [
  "draft",
  "active",
  "deprecated",
  "retired",
  "generated",
] as const;

export type Lifecycle = (typeof LIFECYCLES)[number];

const ATOM_REQUIRED = [
  "id",
  "sourceRef",
  "sourceKind",
  "owner",
  "scope",
  "activation",
  "contentHash",
  "tokenEstimate",
  "lifecycle",
  "generated",
] as const;

export interface InstructionAtom {
  id: string;
  sourceRef: string;
  sourceKind: SourceKind;
  /** Claimed only. Ranking uses hostBindings, never this field. */
  authority?: Authority;
  owner: string;
  scope: string;
  activation: string;
  contentHash: string;
  tokenEstimate: number;
  lifecycle: Lifecycle;
  generated: boolean;
  requires?: string[];
  conflictsWith?: string[];
  supersedes?: string[];
  proof?: string;
}

export interface InstructionHostBinding {
  atomId: string;
  hostMessageRole: Authority;
}

export interface CompileRequest {
  packId: string;
  taskId: string;
  correlationId: string;
  targetHarness: string;
  repoRef: string;
  routeId: string;
  riskClass: string;
  tokenBudget: number;
  atoms: InstructionAtom[];
  hostBindings: InstructionHostBinding[];
  admissionOverride?: boolean;
}

export interface ExcludedAtom {
  id: string;
  reason: string;
}

export interface ContextPack {
  schema: typeof INSTRUCTION_COMPILER_SCHEMA;
  packId: string;
  taskId: string;
  correlationId: string;
  targetHarness: string;
  repoRef: string;
  routeId: string;
  riskClass: string;
  tokenBudget: number;
  selectedAtoms: string[];
  tokenMass: number;
  admissionOverride: boolean;
  excludedAtoms: ExcludedAtom[];
  sourceDigest: string;
  expectedReceipts: string[];
  halted: boolean;
  haltReason?: string;
}

const REQUEST_REQUIRED = [
  "packId",
  "taskId",
  "correlationId",
  "targetHarness",
  "repoRef",
  "routeId",
  "riskClass",
  "tokenBudget",
] as const;

function authorityRank(role: Authority): number {
  return AUTHORITY_ORDER.indexOf(role);
}

function halt(req: CompileRequest, reason: string, excluded: ExcludedAtom[]): ContextPack {
  return {
    schema: INSTRUCTION_COMPILER_SCHEMA,
    packId: req.packId ?? "",
    taskId: req.taskId ?? "",
    correlationId: req.correlationId ?? "",
    targetHarness: req.targetHarness ?? "",
    repoRef: req.repoRef ?? "",
    routeId: req.routeId ?? "",
    riskClass: req.riskClass ?? "",
    tokenBudget: req.tokenBudget ?? 0,
    selectedAtoms: [],
    tokenMass: 0,
    admissionOverride: req.admissionOverride === true,
    excludedAtoms: excluded,
    sourceDigest: "",
    expectedReceipts: [],
    halted: true,
    haltReason: reason,
  };
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function digestSelected(atoms: InstructionAtom[]): string {
  const payload = JSON.stringify(atoms.map((atom) => [atom.id, atom.contentHash]).sort((a, b) => a[0].localeCompare(b[0])));
  return createHash("sha256").update(payload).digest("hex");
}

export function validateInstructionAtom(atom: InstructionAtom): string | null {
  if (!atom || typeof atom !== "object") return "invalid-atom";
  for (const field of ATOM_REQUIRED) {
    if (field === "generated") {
      if (typeof atom.generated !== "boolean") return `missing:${field}`;
      continue;
    }
    if (field === "tokenEstimate") {
      if (!Number.isFinite(atom.tokenEstimate) || atom.tokenEstimate < 0) return `missing:${field}`;
      continue;
    }
    if (isBlank(atom[field])) return `missing:${field}`;
  }
  if (!(SOURCE_KINDS as readonly string[]).includes(atom.sourceKind)) {
    return `unknown-source-kind:${atom.sourceKind}`;
  }
  if (!(LIFECYCLES as readonly string[]).includes(atom.lifecycle)) {
    return `unknown-lifecycle:${atom.lifecycle}`;
  }
  if (atom.generated !== (atom.lifecycle === "generated")) return "inconsistent-generated-lifecycle";
  if (isBlank(atom.owner)) return "orphan";
  for (const field of ["requires", "conflictsWith", "supersedes"] as const) {
    if (atom[field] !== undefined &&
      (!Array.isArray(atom[field]) || atom[field]!.some(isBlank))) return `invalid:${field}`;
  }
  return null;
}

function bindHostRoles(req: CompileRequest): Map<string, Authority> | { error: string; excluded: ExcludedAtom[] } {
  if (!Array.isArray(req.hostBindings)) {
    return { error: "missing-required-field:hostBindings", excluded: [] };
  }

  const bindings = new Map<string, Authority>();
  const excluded: ExcludedAtom[] = [];

  for (const binding of req.hostBindings) {
    if (isBlank(binding?.atomId)) {
      return { error: "missing-required-field:hostBindings.atomId", excluded };
    }
    if (!(AUTHORITY_ORDER as readonly string[]).includes(binding.hostMessageRole)) {
      excluded.push({ id: binding.atomId, reason: "unknown-host-role" });
      return { error: `unknown-host-role:${String(binding.hostMessageRole)}`, excluded };
    }
    if (bindings.has(binding.atomId)) {
      excluded.push({ id: binding.atomId, reason: "duplicate-host-binding" });
      return { error: `duplicate-host-binding:${binding.atomId}`, excluded };
    }
    bindings.set(binding.atomId, binding.hostMessageRole);
  }

  return bindings;
}

/**
 * Minimum sufficient instruction compiler.
 * No estate crawl. Authority comes from trusted hostBindings, never from
 * a filename or an atom claiming priority.
 */
export function compileInstructionPack(req: CompileRequest): ContextPack {
  const excluded: ExcludedAtom[] = [];
  if (!req || typeof req !== "object") return halt({} as CompileRequest, "invalid-request", excluded);
  if (req.admissionOverride !== undefined && typeof req.admissionOverride !== "boolean") {
    return halt(req, "invalid-admission-override", excluded);
  }

  for (const field of REQUEST_REQUIRED) {
    if (field === "tokenBudget") {
      if (!Number.isFinite(req.tokenBudget) || req.tokenBudget < 0) {
        return halt(req, `missing-required-field:${field}`, excluded);
      }
      continue;
    }
    if (isBlank(req[field])) {
      return halt(req, `missing-required-field:${field}`, excluded);
    }
  }

  if (!Array.isArray(req.atoms)) {
    return halt(req, "missing-required-field:atoms", excluded);
  }

  const bound = bindHostRoles(req);
  if (!(bound instanceof Map)) {
    return halt(req, bound.error, bound.excluded);
  }

  const ranked: InstructionAtom[] = [];
  const atomIds = new Set<string>();
  for (const atom of req.atoms) {
    const invalid = validateInstructionAtom(atom);
    if (invalid) {
      return halt(req, invalid.startsWith("missing:") ? `missing-required-field:${invalid.slice(8)}` : invalid, [
        ...excluded,
        { id: atom?.id ?? "", reason: invalid },
      ]);
    }
    if (atomIds.has(atom.id)) return halt(req, `duplicate-atom-id:${atom.id}`, excluded);
    atomIds.add(atom.id);
    if (!bound.has(atom.id)) {
      return halt(req, `missing-host-binding:${atom.id}`, [
        ...excluded,
        { id: atom.id, reason: "missing-host-binding" },
      ]);
    }
    ranked.push(atom);
  }

  const byId = new Map(ranked.map((atom) => [atom.id, atom]));
  const roleOf = (atom: InstructionAtom): Authority => bound.get(atom.id)!;

  for (const atom of ranked) {
    if (!atom.generated) continue;
    const sources = ranked.filter(
      (other) =>
        other.id !== atom.id &&
        !other.generated &&
        (other.contentHash === atom.contentHash ||
          other.sourceRef === atom.sourceRef ||
          other.sourceRef.replace(/\.generated$/, "") === atom.sourceRef.replace(/\.generated$/, "")),
    );
    const source = sources.find((source) => authorityRank(roleOf(atom)) < authorityRank(roleOf(source)));
    if (source) {
      return halt(req, "generated-outranks-source", [
        ...excluded,
        {
          id: atom.id,
          reason: `generated-mirror-outranks:${source.id}`,
        },
      ]);
    }
  }

  const dropped = new Set<string>();
  // A mirror or inactive draft must never suppress an authoritative rule.
  for (const atom of ranked) {
    if (atom.generated || atom.lifecycle !== "active") {
      dropped.add(atom.id);
      excluded.push({ id: atom.id, reason: atom.generated
        ? "generated-mirror-not-authority" : `inactive-lifecycle:${atom.lifecycle}` });
    }
  }
  ranked.sort((a, b) => authorityRank(roleOf(a)) - authorityRank(roleOf(b)) || a.id.localeCompare(b.id));

  for (const atom of ranked) {
    const related = new Set([...(atom.conflictsWith ?? []), ...(atom.supersedes ?? [])]);
    for (const otherId of related) {
      const other = byId.get(otherId);
      if (!other || dropped.has(atom.id) || dropped.has(otherId)) continue;

      const aRank = authorityRank(roleOf(atom));
      const bRank = authorityRank(roleOf(other));
      const aSupersedes = (atom.supersedes ?? []).includes(other.id);
      const bSupersedes = (other.supersedes ?? []).includes(atom.id);

      if (aRank === bRank && aSupersedes === bSupersedes) {
        return halt(req, "unresolved-conflict", [
          ...excluded,
          { id: atom.id, reason: `conflict:${other.id}` },
          { id: other.id, reason: `conflict:${atom.id}` },
        ]);
      }

      const winner = aRank < bRank || (aRank === bRank && aSupersedes) ? atom : other;
      const loser = winner === atom ? other : atom;

      const winnerIsHost = authorityRank(roleOf(winner)) <= 1;
      const loserIsRepoScoped =
        loser.sourceKind === "AGENTS.md" ||
        loser.sourceKind === "CLAUDE.md" ||
        loser.sourceKind === "GEMINI.md";
      const repoWonOverHost =
        !winnerIsHost &&
        (winner.sourceKind === "AGENTS.md" ||
          winner.sourceKind === "CLAUDE.md" ||
          winner.sourceKind === "GEMINI.md") &&
        authorityRank(roleOf(loser)) <= 1;
      if (repoWonOverHost) {
        return halt(req, "scoped-repo-overrides-host", [
          ...excluded,
          { id: winner.id, reason: "scoped-repo-claimed-priority" },
        ]);
      }

      dropped.add(loser.id);
      excluded.push({
        id: loser.id,
        reason:
          winnerIsHost && loserIsRepoScoped
            ? "scoped-repo-cannot-override-host"
            : `outranked-by:${winner.id}`,
      });
    }
  }

  for (const atom of ranked) {
    if (atom.generated && !dropped.has(atom.id)) {
      dropped.add(atom.id);
      excluded.push({ id: atom.id, reason: "generated-mirror-not-authority" });
    }
  }

  const selected = ranked.filter((atom) => !dropped.has(atom.id));
  const seenHash = new Set<string>();
  const deduped: InstructionAtom[] = [];
  for (const atom of selected) {
    if (seenHash.has(atom.contentHash)) {
      excluded.push({ id: atom.id, reason: "duplicate-content-hash" });
      continue;
    }
    seenHash.add(atom.contentHash);
    deduped.push(atom);
  }

  const selectedIds = new Set(deduped.map((atom) => atom.id));
  for (const atom of deduped) {
    for (const dependency of atom.requires ?? []) {
      if (!selectedIds.has(dependency)) return halt(req, `missing-dependency:${atom.id}:${dependency}`, excluded);
    }
  }

  const tokenMass = deduped.reduce((sum, atom) => sum + atom.tokenEstimate, 0);
  if (tokenMass > req.tokenBudget && !req.admissionOverride) {
    return halt(req, "over-token-budget", [
      ...excluded,
      ...deduped.map((atom) => ({ id: atom.id, reason: "budget-halt" })),
    ]);
  }

  return {
    schema: INSTRUCTION_COMPILER_SCHEMA,
    packId: req.packId,
    taskId: req.taskId,
    correlationId: req.correlationId,
    targetHarness: req.targetHarness,
    repoRef: req.repoRef,
    routeId: req.routeId,
    riskClass: req.riskClass,
    tokenBudget: req.tokenBudget,
    selectedAtoms: deduped.map((atom) => atom.id),
    tokenMass,
    admissionOverride: req.admissionOverride === true,
    excludedAtoms: excluded,
    sourceDigest: digestSelected(deduped),
    expectedReceipts: [`instruction-pack:${req.packId}`],
    halted: false,
  };
}
