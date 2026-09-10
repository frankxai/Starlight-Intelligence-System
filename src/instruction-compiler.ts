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
  "hostMessageRole",
] as const;

export interface InstructionAtom {
  id: string;
  sourceRef: string;
  sourceKind: SourceKind;
  /** Ignored for ranking. Authority is assigned from hostMessageRole. */
  authority?: Authority;
  owner: string;
  scope: string;
  activation: string;
  contentHash: string;
  tokenEstimate: number;
  lifecycle: Lifecycle;
  generated: boolean;
  hostMessageRole: Authority;
  requires?: string[];
  conflictsWith?: string[];
  supersedes?: string[];
  proof?: string;
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
    excludedAtoms: excluded,
    sourceDigest: "",
    expectedReceipts: [],
    halted: true,
    haltReason: reason,
  };
}

function assignedAuthority(atom: InstructionAtom): Authority {
  return atom.hostMessageRole;
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function digestSelected(atoms: InstructionAtom[]): string {
  const payload = atoms
    .map((atom) => `${atom.id}:${atom.contentHash}`)
    .sort()
    .join("|");
  return createHash("sha256").update(payload).digest("hex");
}

/**
 * Minimum sufficient instruction compiler.
 * No estate crawl. Authority comes from host message role, never from a filename.
 */
export function compileInstructionPack(req: CompileRequest): ContextPack {
  const excluded: ExcludedAtom[] = [];

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

  const ranked: InstructionAtom[] = [];
  for (const atom of req.atoms) {
    for (const field of ATOM_REQUIRED) {
      if (field === "generated") {
        if (typeof atom.generated !== "boolean") {
          return halt(req, `missing-required-field:${field}`, [
            ...excluded,
            { id: atom?.id ?? "", reason: `missing:${field}` },
          ]);
        }
        continue;
      }
      if (field === "tokenEstimate") {
        if (!Number.isFinite(atom.tokenEstimate) || atom.tokenEstimate < 0) {
          return halt(req, `missing-required-field:${field}`, [
            ...excluded,
            { id: atom?.id ?? "", reason: `missing:${field}` },
          ]);
        }
        continue;
      }
      const value = atom[field];
      if (isBlank(value)) {
        return halt(req, `missing-required-field:${field}`, [
          ...excluded,
          { id: atom?.id ?? "", reason: `missing:${field}` },
        ]);
      }
    }

    if (!(SOURCE_KINDS as readonly string[]).includes(atom.sourceKind)) {
      return halt(req, `unknown-source-kind:${atom.sourceKind}`, [
        ...excluded,
        { id: atom.id, reason: "unknown-source-kind" },
      ]);
    }
    if (!(AUTHORITY_ORDER as readonly string[]).includes(atom.hostMessageRole)) {
      return halt(req, `unknown-host-role:${String(atom.hostMessageRole)}`, [
        ...excluded,
        { id: atom.id, reason: "unknown-host-role" },
      ]);
    }
    if (!(LIFECYCLES as readonly string[]).includes(atom.lifecycle)) {
      return halt(req, `unknown-lifecycle:${atom.lifecycle}`, [
        ...excluded,
        { id: atom.id, reason: "unknown-lifecycle" },
      ]);
    }
    if (isBlank(atom.owner)) {
      return halt(req, "orphan-atom-without-owner", [
        ...excluded,
        { id: atom.id, reason: "orphan" },
      ]);
    }
    ranked.push(atom);
  }

  const byId = new Map(ranked.map((atom) => [atom.id, atom]));

  for (const atom of ranked) {
    if (!atom.generated) continue;
    const source = ranked.find(
      (other) =>
        other.id !== atom.id &&
        !other.generated &&
        (other.contentHash === atom.contentHash ||
          other.sourceRef === atom.sourceRef ||
          (atom.supersedes ?? []).includes(other.id) === false &&
            other.sourceRef.replace(/\.generated$/, "") === atom.sourceRef.replace(/\.generated$/, "")),
    );
    if (!source) continue;
    if (authorityRank(assignedAuthority(atom)) < authorityRank(assignedAuthority(source))) {
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

  for (const atom of ranked) {
    for (const otherId of atom.conflictsWith ?? []) {
      const other = byId.get(otherId);
      if (!other || dropped.has(atom.id) || dropped.has(otherId)) continue;

      const aRank = authorityRank(assignedAuthority(atom));
      const bRank = authorityRank(assignedAuthority(other));
      const aSupersedes = (atom.supersedes ?? []).includes(other.id);
      const bSupersedes = (other.supersedes ?? []).includes(atom.id);

      if (aRank === bRank && !aSupersedes && !bSupersedes) {
        return halt(req, "unresolved-conflict", [
          ...excluded,
          { id: atom.id, reason: `conflict:${other.id}` },
          { id: other.id, reason: `conflict:${atom.id}` },
        ]);
      }

      const winner = aRank < bRank || (aRank === bRank && aSupersedes) ? atom : other;
      const loser = winner === atom ? other : atom;

      const winnerIsHost = authorityRank(assignedAuthority(winner)) <= 1;
      const loserIsRepoScoped =
        loser.sourceKind === "AGENTS.md" ||
        loser.sourceKind === "CLAUDE.md" ||
        loser.sourceKind === "GEMINI.md";
      const repoWonOverHost =
        !winnerIsHost &&
        loserIsRepoScoped === false &&
        (winner.sourceKind === "AGENTS.md" ||
          winner.sourceKind === "CLAUDE.md" ||
          winner.sourceKind === "GEMINI.md") &&
        authorityRank(assignedAuthority(loser)) <= 1;
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
    excludedAtoms: excluded,
    sourceDigest: digestSelected(deduped),
    expectedReceipts: [`instruction-pack:${req.packId}`],
    halted: false,
  };
}
