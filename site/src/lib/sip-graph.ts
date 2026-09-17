// Presentation-side reader for a SIP graph profile.
//
// The canonical contract, its rules and its validator live in the repo-root
// `protocol/` directory and run under `node --test`. Nothing here validates
// anything: the page renders the receipt produced by `protocol/conform.mjs`
// and uses the walk below only to lay the trace out. If the two ever disagree
// about what a profile means, `protocol/lib/graph.mjs` is right.

import { promises as fs } from "fs";
import path from "path";

// The masking function itself is the protocol's, vendored byte-for-byte by
// site/scripts/sync-protocol-graph.mjs and pinned by a test. Re-implementing it
// here is how a page ends up publishing more than the validator allows — which
// is exactly what the first version of this file did with `assertedBy`.
import { maskElement } from "./generated/sip-mask.mjs";

export type Visibility = "public" | "alliance" | "private" | "secret";

export type NodeType =
  | "Identity"
  | "Agent"
  | "Capability"
  | "MemoryRecord"
  | "Claim"
  | "Source"
  | "Attestation"
  | "Policy"
  | "Decision"
  | "Artifact"
  | "Evaluation"
  | "Projection";

export interface Provenance {
  origin: "authored" | "derived" | "imported" | "observed";
  at: string;
  method?: string;
  sources?: string[];
}

export interface GraphNode {
  id: string;
  type: NodeType;
  version: string;
  owner: string;
  visibility: Visibility;
  provenance: Provenance;
  evaluation: { rule: string; result?: string; at?: string };
  label?: string;
  body: Record<string, unknown>;
  private?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  type: string;
  from: string;
  to: string;
  version: string;
  owner: string;
  visibility: Visibility;
  provenance: Provenance;
  evaluation?: { rule: string };
}

export interface Profile {
  sipGraphVersion: string;
  profile?: { id?: string; subject?: string; generatedAt?: string; note?: string };
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Receipt {
  tool: string;
  sipGraphVersion: string;
  declaredGraphVersion: string | null;
  subject: string | null;
  profileId: string | null;
  profileSha256: string;
  checkedAt: string;
  counts: { nodes: number; edges: number; projections: number; byType?: Record<string, number> };
  verdict: "PASS" | "FAIL";
  rules: { id: string; title: string; status: "pass" | "fail"; findings: string[] }[];
}

export type TracedNode = GraphNode | { id: string; type: NodeType; withheld: true };

export interface TraceStage {
  key: string;
  label: string;
  question: string;
  nodes: { node: TracedNode; withheld: boolean }[];
}

export interface Trace {
  claim: GraphNode;
  claimWithheld: boolean;
  assertedBy: { node: TracedNode; withheld: boolean } | null;
  audience: "owner" | "public";
  stages: TraceStage[];
}

const CONTENT_DIR = ["content", "protocol-graph"];

export async function readProfile(): Promise<Profile> {
  const raw = await fs.readFile(path.join(process.cwd(), ...CONTENT_DIR, "profile.json"), "utf8");
  return JSON.parse(raw) as Profile;
}

export async function readReceipt(): Promise<Receipt> {
  const raw = await fs.readFile(path.join(process.cwd(), ...CONTENT_DIR, "receipt.json"), "utf8");
  return JSON.parse(raw) as Receipt;
}

const STAGE_QUESTIONS: Record<string, string> = {
  source: "What can this be checked against?",
  policy: "Which rule governs it?",
  memory: "What durable state does it rest on?",
  artifact: "What was produced from it?",
  evaluation: "Who tested it, and what happened?",
  attestation: "Who signed for it?",
};

/**
 * Walk one claim in the canonical stage order:
 * source -> policy -> memory -> artifact -> evaluation -> attestation.
 *
 * Under `audience: "public"` the walk resolves the profile's public Projection
 * and masks everything outside it. A masked node keeps its id and type and
 * loses everything else, so the page can show that a link was withheld without
 * showing what it held.
 */
export function traceClaim(
  profile: Profile,
  claimId: string,
  audience: "owner" | "public"
): Trace | null {
  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const claim = byId.get(claimId);
  if (!claim) return null;

  let visible: Set<string> | null = null;
  if (audience === "public") {
    const projection = profile.nodes.find(
      (n) => n.type === "Projection" && n.body?.audience === "public"
    );
    const include = (projection?.body?.include as string[] | undefined) ?? [];
    visible = new Set(include);
  }

  const out = (edgeType: string, from: string) =>
    profile.edges
      .filter((e) => e.type === edgeType && e.from === from)
      .map((e) => byId.get(e.to))
      .filter((n): n is GraphNode => Boolean(n));

  const into = (edgeType: string, to: string) =>
    profile.edges
      .filter((e) => e.type === edgeType && e.to === to)
      .map((e) => byId.get(e.from))
      .filter((n): n is GraphNode => Boolean(n));

  const asserters = into("asserts", claimId);
  const agent = asserters.find((n) => n.type === "Agent") ?? asserters[0] ?? null;
  const derived = out("derivedFrom", claimId);

  const raw: { key: string; label: string; nodes: GraphNode[] }[] = [
    { key: "source", label: "Source", nodes: derived.filter((n) => n.type === "Source") },
    { key: "policy", label: "Policy", nodes: out("governedBy", claimId) },
    { key: "memory", label: "Memory", nodes: derived.filter((n) => n.type === "MemoryRecord") },
    { key: "artifact", label: "Artifact", nodes: agent ? out("produces", agent.id) : [] },
    {
      key: "evaluation",
      label: "Evaluation",
      nodes: into("supports", claimId).filter((n) => n.type === "Evaluation"),
    },
    { key: "attestation", label: "Attestation", nodes: into("attests", claimId) },
  ];

  const mask = (n: GraphNode): { node: TracedNode; withheld: boolean } => {
    const masked = maskElement(n, visible) as unknown as TracedNode & { withheld: boolean };
    return { node: masked, withheld: masked.withheld };
  };

  return {
    claim,
    claimWithheld: Boolean(visible && !visible.has(claim.id)),
    assertedBy: agent ? mask(agent) : null,
    audience,
    stages: raw.map((s) => ({
      ...s,
      question: STAGE_QUESTIONS[s.key],
      nodes: s.nodes.map(mask),
    })),
  };
}

export function listClaims(profile: Profile): GraphNode[] {
  return profile.nodes.filter((n) => n.type === "Claim");
}
