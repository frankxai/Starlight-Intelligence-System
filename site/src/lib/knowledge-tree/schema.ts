// ─────────────────────────────────────────────────────────────────────────────
// Starlight Knowledge Tree — Graph Schema
//
// This module contains only TypeScript types. No runtime values live here.
//
// Design intent: this schema is the durable substrate for the Knowledge Tree
// vision. All renderers (2D constellation, 3D fly-through, rooms, game layer)
// consume the same Domain / KnowledgeNode / KnowledgeEdge shape. Swap the
// renderer without touching data.
//
// Stage roadmap:
//  Stage 1 (current): 2D constellation — react-force-graph-2d
//  Stage 2:           3D fly-through — react-force-graph-3d (same {nodes,links})
//  Stage 3:           Rooms / spatial — domain clusters become navigable spaces
//  Stage 4:           Game layer — quests, progression, evidence linking
//
// TODO(knowledge-tree-data): The seed graph in data.ts is hand-authored for
// Stage 1. Future hydration: build-time loader that reads JSON from the
// frankxai/starlight-knowledge-tree repo's data/ directory, or a thin
// /api/knowledge-tree route that fetches it at request time. The renderer
// accepts GraphData and will work unchanged when the data source is swapped.
// No database, no auth required for this surface.
// ─────────────────────────────────────────────────────────────────────────────

import type { Accent } from "@/lib/accents";

// ── Domain ────────────────────────────────────────────────────────────────────
// A top-level knowledge branch. Each domain has a visual accent that propagates
// to all its nodes in the graph renderer.

export interface Domain {
  /** Stable slug identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** Tailwind Accent token (from @/lib/accents). Maps to the site's color system. */
  accent: Accent;
  /** One-sentence description of the domain. */
  blurb: string;
}

// ── KnowledgeNode ─────────────────────────────────────────────────────────────
// A node in the knowledge graph. Corresponds to a unit of understanding or
// capability at a specific progression level.

export type NodeKind =
  | "concept"      // Abstract understanding — the "what" and "why"
  | "skill"        // Executable capability — "I can do X"
  | "practice"     // Repeated application — "I do X regularly"
  | "artifact"     // Produced output — "I built/shipped X"
  | "evidence"     // Verified proof — "Here is the result"
  | "contribution" // Public value added — "Others can build on X"
  | "quest";       // Open challenge — "X is unsolved / in progress"

export interface KnowledgeNode {
  /** Stable slug identifier. */
  id: string;
  /** Short human-readable label for the node. */
  label: string;
  /** Progression kind of this node. */
  kind: NodeKind;
  /** Which domain this node belongs to. */
  domainId: string;
  /** Optional one-paragraph summary. */
  summary?: string;
}

// ── KnowledgeEdge ─────────────────────────────────────────────────────────────
// A directed relationship between two nodes in the graph.

export type EdgeRelation =
  | "unlocks"       // Mastering source node makes target node reachable
  | "requires"      // Target node requires source node as prerequisite
  | "part-of"       // Source node is a component of target node
  | "contributes-to"; // Source node is evidence/work toward target node

export interface KnowledgeEdge {
  /** Source node id. */
  source: string;
  /** Target node id. */
  target: string;
  /** Semantic relationship. */
  relation: EdgeRelation;
}

// ── Graph ─────────────────────────────────────────────────────────────────────
// Top-level container consumed by the renderer. Matches the {nodes, links}
// shape expected by react-force-graph-2d / react-force-graph-3d with no
// adaptation needed.

export interface KnowledgeGraph {
  domains: Domain[];
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

// ── Selectors (helper types) ───────────────────────────────────────────────────
// These are the return types for selector functions exported from data.ts.

/** nodes grouped by domainId */
export type NodesByDomain = Record<string, KnowledgeNode[]>;

/** adjacency list: nodeId → array of neighbor nodeIds */
export type NeighborMap = Record<string, string[]>;
