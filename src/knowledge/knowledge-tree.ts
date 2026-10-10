/**
 * Starlight Universal Knowledge Management — The Epistemic Knowledge Tree Engine
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import { UNIVERSAL_DOMAINS } from './domains.js';
import type {
  ContradictionReport,
  EpistemicProvenance,
  KnowledgeEdge,
  KnowledgeNode,
  KnowledgeQuery,
  SubgraphProjection,
} from './types.js';

export class UniversalKnowledgeTree {
  private readonly nodes: Map<string, KnowledgeNode> = new Map();
  private readonly edges: Map<string, KnowledgeEdge> = new Map();
  private readonly outgoingEdges: Map<string, string[]> = new Map();
  private readonly incomingEdges: Map<string, string[]> = new Map();

  constructor() {
    this.seedFoundationalAxioms();
  }

  /**
   * Pre-seed the knowledge tree with the ground axioms of the 10 universal domains.
   */
  private seedFoundationalAxioms(): void {
    const now = new Date().toISOString();
    const systemProvenance: EpistemicProvenance = {
      creator: 'starlight-substrate',
      method: 'axiom_declaration',
      sourceUri: 'starlight://protocol/foundations/v1.1.1',
    };

    for (const [domainKey, domainDef] of Object.entries(UNIVERSAL_DOMAINS)) {
      domainDef.firstPrinciples.forEach((principle, index) => {
        const nodeId = `axiom:${domainKey}:${index + 1}`;
        this.addNode({
          id: nodeId,
          domain: domainDef.domain,
          kind: 'axiom',
          title: `${domainDef.name} — First Principle ${index + 1}`,
          statement: principle,
          falsificationCriteria: 'Falsified only if an empirical contradiction is formally demonstrated against basic physical reality.',
          confidence: 1.0,
          certaintyCapped: false,
          provenance: systemProvenance,
          temporal: {
            validFrom: '2026-01-01T00:00:00Z',
            validUntil: null,
            assertedAt: now,
          },
          tags: ['first-principle', domainKey, 'grundnorm'],
        });
      });
    }
  }

  /**
   * Add a node to the knowledge tree with rigorous epistemic validation.
   */
  public addNode(node: KnowledgeNode): KnowledgeNode {
    if (!node.id) throw new Error('KnowledgeNode must possess a unique id');
    if (!node.statement || !node.statement.trim()) throw new Error('KnowledgeNode statement cannot be empty');
    if (!node.falsificationCriteria || !node.falsificationCriteria.trim()) {
      throw new Error(`KnowledgeNode ${node.id} lacks falsification criteria. Every scientific node must define what would disprove it.`);
    }

    // Enforce certainty capping if confidence is asserted too high without formal proof
    let adjustedConfidence = node.confidence;
    let certaintyCapped = node.certaintyCapped;
    if (adjustedConfidence >= 0.95 && node.provenance.method !== 'formal_proof' && node.provenance.method !== 'axiom_declaration') {
      adjustedConfidence = 0.85;
      certaintyCapped = true;
    }

    const validatedNode: KnowledgeNode = {
      ...node,
      confidence: adjustedConfidence,
      certaintyCapped,
      temporal: {
        ...node.temporal,
        assertedAt: node.temporal.assertedAt || new Date().toISOString(),
      },
      tags: Array.from(new Set(node.tags || [])),
    };

    this.nodes.set(validatedNode.id, validatedNode);
    if (!this.outgoingEdges.has(validatedNode.id)) this.outgoingEdges.set(validatedNode.id, []);
    if (!this.incomingEdges.has(validatedNode.id)) this.incomingEdges.set(validatedNode.id, []);

    return validatedNode;
  }

  /**
   * Add a directed epistemic edge between two nodes.
   */
  public addEdge(edge: KnowledgeEdge): KnowledgeEdge {
    if (!this.nodes.has(edge.sourceId)) throw new Error(`Source node not found: ${edge.sourceId}`);
    if (!this.nodes.has(edge.targetId)) throw new Error(`Target node not found: ${edge.targetId}`);

    this.edges.set(edge.id, edge);

    const outList = this.outgoingEdges.get(edge.sourceId) || [];
    outList.push(edge.id);
    this.outgoingEdges.set(edge.sourceId, outList);

    const inList = this.incomingEdges.get(edge.targetId) || [];
    inList.push(edge.id);
    this.incomingEdges.set(edge.targetId, inList);

    return edge;
  }

  /**
   * Query the knowledge tree across semantic domains, tags, or temporal point-in-time.
   */
  public query(options: KnowledgeQuery = {}): KnowledgeNode[] {
    const asOfTime = options.asOfDate ? new Date(options.asOfDate).getTime() : Date.now();
    let results: KnowledgeNode[] = Array.from(this.nodes.values());

    // 1. Temporal filter
    results = results.filter((node) => {
      const fromTime = new Date(node.temporal.validFrom).getTime();
      const untilTime = node.temporal.validUntil ? new Date(node.temporal.validUntil).getTime() : Infinity;
      const isTemporallyValid = asOfTime >= fromTime && asOfTime <= untilTime;

      if (options.activeOnly !== false && node.temporal.invalidatedAt) {
        return false;
      }
      return isTemporallyValid;
    });

    // 2. Domain filter
    if (options.domains && options.domains.length > 0) {
      const domainSet = new Set(options.domains);
      results = results.filter((node) => domainSet.has(node.domain));
    }

    // 3. Kind filter
    if (options.kinds && options.kinds.length > 0) {
      const kindSet = new Set(options.kinds);
      results = results.filter((node) => kindSet.has(node.kind));
    }

    // 4. Confidence filter
    if (typeof options.minConfidence === 'number') {
      results = results.filter((node) => node.confidence >= options.minConfidence!);
    }

    // 5. Tag filter
    if (options.tags && options.tags.length > 0) {
      results = results.filter((node) => options.tags!.some((t) => node.tags.includes(t)));
    }

    // 6. Text search
    if (options.queryText && options.queryText.trim()) {
      const terms = options.queryText.toLowerCase().split(/\s+/);
      results = results.filter((node) => {
        const text = `${node.title} ${node.statement} ${node.tags.join(' ')}`.toLowerCase();
        return terms.every((term) => text.includes(term));
      });
    }

    // 7. Limit
    if (options.maxNodes && options.maxNodes > 0) {
      results = results.slice(0, options.maxNodes);
    }

    return results;
  }

  /**
   * Emit a new scientific discovery or verified insight into the knowledge tree,
   * linking it to parent axioms or hypotheses, and verifying consistency.
   */
  public emitDiscovery(params: {
    node: Omit<KnowledgeNode, 'id' | 'temporal'> & { id?: string };
    linksTo: Array<{ targetId: string; kind: KnowledgeEdge['kind']; rationale: string }>;
  }): { node: KnowledgeNode; edges: KnowledgeEdge[]; contradictions: ContradictionReport[] } {
    const id = params.node.id || `disc:${params.node.domain}:${Date.now()}`;
    const now = new Date().toISOString();

    const createdNode = this.addNode({
      ...params.node,
      id,
      temporal: {
        validFrom: now,
        validUntil: null,
        assertedAt: now,
      },
    });

    const createdEdges: KnowledgeEdge[] = [];
    params.linksTo.forEach((link, idx) => {
      const edge = this.addEdge({
        id: `edge:${id}->${link.targetId}:${idx}`,
        sourceId: id,
        targetId: link.targetId,
        kind: link.kind,
        weight: 1.0,
        rationale: link.rationale,
        temporal: {
          validFrom: now,
          validUntil: null,
          assertedAt: now,
        },
      });
      createdEdges.push(edge);
    });

    const contradictions = this.detectContradictions(id);

    return {
      node: createdNode,
      edges: createdEdges,
      contradictions,
    };
  }

  /**
   * Scan for contradictions or certainty violations surrounding a given node or the whole graph.
   */
  public detectContradictions(nodeId?: string): ContradictionReport[] {
    const reports: ContradictionReport[] = [];
    const checkEdges = Array.from(this.edges.values()).filter((e) => {
      if (nodeId) return e.sourceId === nodeId || e.targetId === nodeId;
      return true;
    });

    for (const edge of checkEdges) {
      if (edge.kind === 'contradicts') {
        const source = this.nodes.get(edge.sourceId);
        const target = this.nodes.get(edge.targetId);
        if (source && target) {
          // If both nodes are active in the same temporal window, it's a conflict!
          const bothActive = !source.temporal.invalidatedAt && !target.temporal.invalidatedAt;
          if (bothActive) {
            reports.push({
              nodeA: source,
              nodeB: target,
              edge,
              nature: 'direct_contradiction',
              description: `Active contradiction between "${source.title}" and "${target.title}": ${edge.rationale}`,
              resolved: false,
              suggestedFalsifier: `Execute experiment comparing falsification criteria of ${source.id} vs ${target.id}`,
            });
          }
        }
      }
    }

    return reports;
  }

  /**
   * Project a sub-graph into an agent-friendly, token-budgeted Markdown context block.
   */
  public projectSubgraph(nodeIds: string[], maxDepth: number = 2): SubgraphProjection {
    const visitedNodes = new Set<string>();
    const includedEdges: KnowledgeEdge[] = [];

    const queue: Array<{ id: string; depth: number }> = nodeIds.map((id) => ({ id, depth: 0 }));

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      if (visitedNodes.has(id)) continue;
      visitedNodes.add(id);

      if (depth < maxDepth) {
        const outgoing = this.outgoingEdges.get(id) || [];
        for (const edgeId of outgoing) {
          const edge = this.edges.get(edgeId);
          if (edge) {
            includedEdges.push(edge);
            if (!visitedNodes.has(edge.targetId)) {
              queue.push({ id: edge.targetId, depth: depth + 1 });
            }
          }
        }
      }
    }

    const nodes = Array.from(visitedNodes)
      .map((id) => this.nodes.get(id)!)
      .filter(Boolean);

    // Format into compact, high-density Markdown
    let md = `## 🌌 Starlight Epistemic Context Subgraph\n\n`;
    for (const n of nodes) {
      md += `### [${n.kind.toUpperCase()}] ${n.title} (\`${n.id}\`)\n`;
      md += `- **Domain**: ${UNIVERSAL_DOMAINS[n.domain]?.name || n.domain}\n`;
      md += `- **Statement**: ${n.statement}\n`;
      md += `- **Falsifier**: ${n.falsificationCriteria}\n`;
      md += `- **Confidence**: ${(n.confidence * 100).toFixed(0)}%${n.certaintyCapped ? ' (Capped)' : ''}\n\n`;
    }

    if (includedEdges.length > 0) {
      md += `### Epistemic Relationships\n`;
      for (const e of includedEdges) {
        md += `- \`${e.sourceId}\` **${e.kind.toUpperCase()}** \`${e.targetId}\` (${e.rationale})\n`;
      }
      md += `\n`;
    }

    // Estimate tokens roughly (1 token ~= 4 characters)
    const tokenEstimate = Math.ceil(md.length / 4);

    return {
      nodes,
      edges: includedEdges,
      contextMarkdown: md,
      tokenEstimate,
    };
  }

  public getNodeCount(): number {
    return this.nodes.size;
  }

  public getEdgeCount(): number {
    return this.edges.size;
  }

  public getNode(id: string): KnowledgeNode | undefined {
    return this.nodes.get(id);
  }
}
