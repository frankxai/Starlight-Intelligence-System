import academyPackRecord from "../../../foundry/contracts/academy-fabric/fixtures/valid/academy-pack.json";
import competencyGraphRecord from "../../../foundry/contracts/academy-fabric/fixtures/valid/competency-graph-graph-engineering.json";
import executionGraphRecord from "../../../foundry/contracts/academy-fabric/fixtures/valid/execution-graph-mission-zero.json";
import academyGraphStewardRecord from "../../../foundry/examples/academy-graph-steward.agent-pack.json";
import learnerGraphNavigatorRecord from "../../../foundry/examples/learner-graph-navigator.agent-pack.json";
import pluginManifestRecord from "../../../plugins/starlight-graph-engineering/.codex-plugin/plugin.json";

export type RecordOrigin = "fixture" | "schema-derived" | "hypothetical";
export type ClaimState = "sourced" | "derived" | "hypothesized" | "not-applicable";
export type ObservatoryMode = "competency" | "execution";

export type ObservatoryNode = {
  id: string;
  kind: string;
  name: string;
  description: string;
  lifecycle: string;
  recordOrigin: RecordOrigin;
  claimState: ClaimState;
  executor?: string;
  sideEffectClass?: string;
  toolScopes?: string[];
  retry?: {
    idempotent: boolean;
    maxAttempts: number;
    backoff: string;
  };
  completionCondition?: string;
};

export type ObservatoryEdge = {
  id: string;
  from: string;
  to: string;
  relation: string;
  recordOrigin: RecordOrigin;
  claimState: ClaimState;
  authorityTransfer?: boolean;
};

export type ObservatoryGraph = {
  id: string;
  mode: ObservatoryMode;
  name: string;
  description: string;
  status: string;
  recordOrigin: RecordOrigin;
  nodes: ObservatoryNode[];
  edges: ObservatoryEdge[];
  qualityGates: Array<{ label: string; value: boolean; expected: boolean }>;
};

export type AcademyGraphModel = {
  modelVersion: string;
  releaseLabel: string;
  academy: {
    name: string;
    purpose: string;
    releaseStatus: string;
    pathwayName: string;
    pathwayStatus: string;
  };
  competency: ObservatoryGraph;
  execution: ObservatoryGraph;
  mission: {
    label: string;
    targetIdentity: string;
    outcome: string;
    proofCondition: string;
    baseline: string;
    graphJustification: string[];
    bounds: {
      maxSteps: number;
      maxRounds: number;
      maxWallSeconds: number;
      currency: string;
      amountMinor: number;
    };
  };
  openAccess: {
    completePathWithoutPayment: boolean;
    localOrByokExecutionSupported: boolean;
    credentialEligibilityWithoutPayment: boolean;
    exportWithoutPayment: boolean;
    identicalAssessmentStandard: boolean;
    freeCoreIncludes: string[];
    paidDifferentiators: string[];
  };
  plugin: {
    name: string;
    version: string;
    license: string;
    description: string;
    skills: string[];
  };
  agents: Array<{
    id: string;
    version: string;
    description: string;
    status: "compiled candidate — not activated";
    deniedAuthority: string[];
  }>;
  previews: {
    evidence: {
      recordOrigin: "hypothetical";
      state: string;
      artifacts: string[];
      law: string;
    };
    passport: {
      recordOrigin: "hypothetical";
      projection: string;
      requires: string[];
      excludes: string[];
      law: string;
    };
  };
  sources: Array<{ label: string; path: string }>;
};

type RawCompetencyNode = (typeof competencyGraphRecord.nodes)[number];
type RawExecutionNode = (typeof executionGraphRecord.nodes)[number];

const words = (value: string) => value.replaceAll("_", " ");

const qualityGates = (record: object) =>
  Object.entries(record as Record<string, boolean>).map(([label, value]) => ({
    label,
    value,
    expected: label === "containsCommercialEntitlement" ? false : true,
  }));

const competencyNodes: ObservatoryNode[] = competencyGraphRecord.nodes.map(
  (node: RawCompetencyNode) => ({
    id: node.id,
    kind: node.kind,
    name: node.name,
    description:
      "description" in node && typeof node.description === "string"
        ? node.description
        : `${words(node.kind)} in the public capability path.`,
    lifecycle: node.lifecycle,
    recordOrigin: "fixture",
    claimState: node.claimState as ClaimState,
  }),
);

const executionNodes: ObservatoryNode[] = executionGraphRecord.nodes.map(
  (node: RawExecutionNode) => ({
    id: node.id,
    kind: node.kind,
    name: node.name,
    description: node.completionCondition,
    lifecycle: executionGraphRecord.status,
    recordOrigin: "fixture",
    claimState: "not-applicable",
    executor: node.executor.kind,
    sideEffectClass: node.authority.sideEffectClass,
    toolScopes: node.authority.toolScopes,
    retry: node.retry,
    completionCondition: node.completionCondition,
  }),
);

const agentRecords = [academyGraphStewardRecord, learnerGraphNavigatorRecord];

export const academyGraphModel: AcademyGraphModel = {
  modelVersion: "starlight.mission-zero.public-demo/v0.1",
  releaseLabel: "Mission Zero contract preview",
  academy: {
    name: academyPackRecord.name,
    purpose: academyPackRecord.purpose,
    releaseStatus: academyPackRecord.releaseStatus,
    pathwayName: academyPackRecord.pathways[0].name,
    pathwayStatus: academyPackRecord.pathways[0].status,
  },
  competency: {
    id: competencyGraphRecord.metadata.id,
    mode: "competency",
    name: competencyGraphRecord.name,
    description: competencyGraphRecord.description,
    status: competencyGraphRecord.status,
    recordOrigin: "fixture",
    nodes: competencyNodes,
    edges: competencyGraphRecord.edges.map((edge) => ({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      relation: edge.relation,
      recordOrigin: "fixture" as const,
      claimState: edge.claimState as ClaimState,
    })),
    qualityGates: qualityGates(competencyGraphRecord.qualityGates),
  },
  execution: {
    id: executionGraphRecord.metadata.id,
    mode: "execution",
    name: "Mission Zero execution graph",
    description: executionGraphRecord.objective,
    status: executionGraphRecord.status,
    recordOrigin: "fixture",
    nodes: executionNodes,
    edges: executionGraphRecord.edges.map((edge) => ({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      relation: edge.type,
      recordOrigin: "fixture" as const,
      claimState: "not-applicable" as const,
      authorityTransfer: edge.authorityTransfer,
    })),
    qualityGates: qualityGates(executionGraphRecord.qualityGates),
  },
  mission: {
    label: "GE-M00 — Graph or No Graph?",
    targetIdentity: "Evidence-led Graph Architect",
    outcome:
      "Choose, contract, and defend the smallest governed execution topology against an unfamiliar constraint change.",
    proofCondition: "Accepted evidence bundle plus a live human-assessed defense.",
    baseline: `${words(executionGraphRecord.baseline.kind)} retained as comparator`,
    graphJustification: executionGraphRecord.graphJustification.map(words),
    bounds: {
      maxSteps: executionGraphRecord.termination.maxSteps,
      maxRounds: executionGraphRecord.termination.maxRounds,
      maxWallSeconds: executionGraphRecord.termination.maxWallSeconds,
      currency: executionGraphRecord.termination.maxSpend.currency,
      amountMinor: executionGraphRecord.termination.maxSpend.amountMinor,
    },
  },
  openAccess: {
    completePathWithoutPayment: academyPackRecord.openAccessContract.completePathWithoutPayment,
    localOrByokExecutionSupported: academyPackRecord.openAccessContract.localOrByokExecutionSupported,
    credentialEligibilityWithoutPayment:
      academyPackRecord.openAccessContract.credentialEligibilityWithoutPayment,
    exportWithoutPayment: academyPackRecord.openAccessContract.exportWithoutPayment,
    identicalAssessmentStandard: academyPackRecord.openAccessContract.identicalAssessmentStandard,
    freeCoreIncludes: academyPackRecord.openAccessContract.freeCoreIncludes,
    paidDifferentiators: academyPackRecord.openAccessContract.paidDifferentiators,
  },
  plugin: {
    name: pluginManifestRecord.interface.displayName,
    version: pluginManifestRecord.version,
    license: pluginManifestRecord.license,
    description: pluginManifestRecord.interface.longDescription,
    skills: pluginManifestRecord.interface.capabilities,
  },
  agents: agentRecords.map((agent) => ({
    id: agent.id,
    version: agent.version,
    description: agent.description,
    status: "compiled candidate — not activated" as const,
    deniedAuthority: agent.toolPolicy.deny,
  })),
  previews: {
    evidence: {
      recordOrigin: "hypothetical",
      state: "No Mission Zero artifact or Evidence Bundle record exists yet.",
      artifacts: ["design", "decision record", "evaluation", "defense record"],
      law: "Machine preflight may report findings. Only an authorized human may decide competence or issue a credential.",
    },
    passport: {
      recordOrigin: "hypothetical",
      projection: "Synthetic, redacted public-portfolio projection",
      requires: ["active consent", "purpose match", "revocation", "verified evidence before demonstrated"],
      excludes: ["raw telemetry", "chain of thought", "hidden assessment", "financial data", "unrelated history"],
      law: "Export remains free. Credentialed state requires a separate human-issued credential.",
    },
  },
  sources: [
    {
      label: "CompetencyGraph fixture",
      path: "foundry/contracts/academy-fabric/fixtures/valid/competency-graph-graph-engineering.json",
    },
    {
      label: "ExecutionGraph fixture",
      path: "foundry/contracts/academy-fabric/fixtures/valid/execution-graph-mission-zero.json",
    },
    {
      label: "AcademyPack fixture",
      path: "foundry/contracts/academy-fabric/fixtures/valid/academy-pack.json",
    },
    {
      label: "Graph Engineering plugin",
      path: "plugins/starlight-graph-engineering/.codex-plugin/plugin.json",
    },
  ],
};
