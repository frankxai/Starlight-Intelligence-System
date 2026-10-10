import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { UniversalKnowledgeTree } from '../src/knowledge/index.js';

describe('UniversalKnowledgeTree', () => {
  it('initializes and seeds foundational axioms across all 10 universal domains', () => {
    const tree = new UniversalKnowledgeTree();
    assert.ok(tree.getNodeCount() >= 40, 'Should have pre-seeded at least 40 ground axioms');
    
    // Check physics axiom
    const thermo = tree.getNode('axiom:physics_cosmology:1');
    assert.ok(thermo);
    assert.equal(thermo?.domain, 'physics_cosmology');
    assert.equal(thermo?.kind, 'axiom');
  });

  it('queries nodes by domain and text search', () => {
    const tree = new UniversalKnowledgeTree();
    const cognitiveNodes = tree.query({ domains: ['cognitive_ai'] });
    assert.ok(cognitiveNodes.length > 0);
    assert.equal(cognitiveNodes[0].domain, 'cognitive_ai');

    const searchResults = tree.query({ queryText: 'entropy' });
    assert.ok(searchResults.length >= 2, 'Should find entropy in physics and information domains');
  });

  it('emits discoveries and detects contradictions', () => {
    const tree = new UniversalKnowledgeTree();

    const discovery = tree.emitDiscovery({
      node: {
        domain: 'epistemology_truth',
        kind: 'hypothesis',
        title: 'Verifiable Agent Grounding',
        statement: 'Agents equipped with reality.md conformance checks commit 80% fewer ungrounded assumptions.',
        falsificationCriteria: 'Falsified if randomized trials show equal or higher assumption rate with reality.md active.',
        confidence: 0.9,
        certaintyCapped: false,
        provenance: {
          creator: 'starlight-queen',
          method: 'empirical_test',
          sourceUri: 'starlight://trials/grounding-v1',
        },
        tags: ['reality.md', 'anti-slop', 'empirical'],
      },
      linksTo: [
        {
          targetId: 'axiom:epistemology_truth:3',
          kind: 'derives_from',
          rationale: 'Directly operationalizes the sovereign personal context contract axiom.',
        }
      ]
    });

    assert.ok(discovery.node.id.startsWith('disc:epistemology_truth:'));
    assert.equal(discovery.edges.length, 1);
    assert.equal(discovery.contradictions.length, 0);

    // Now emit a conflicting node to test contradiction detection
    const conflicting = tree.emitDiscovery({
      node: {
        domain: 'epistemology_truth',
        kind: 'hypothesis',
        title: 'Unconstrained Agent Hallucination Superiority',
        statement: 'Agents without reality.md produce strictly higher accuracy.',
        falsificationCriteria: 'Falsified if error rate exceeds 5%.',
        confidence: 0.6,
        certaintyCapped: false,
        provenance: {
          creator: 'adversary',
          method: 'empirical_test',
        },
        tags: ['counter-claim'],
      },
      linksTo: [
        {
          targetId: discovery.node.id,
          kind: 'contradicts',
          rationale: 'Opposing empirical claims regarding reality.md efficacy.',
        }
      ]
    });

    assert.equal(conflicting.contradictions.length, 1);
    assert.equal(conflicting.contradictions[0].nature, 'direct_contradiction');
  });

  it('projects sub-graph into an agent context window with token estimate', () => {
    const tree = new UniversalKnowledgeTree();
    const projection = tree.projectSubgraph(['axiom:physics_cosmology:1', 'axiom:information_computation:1'], 1);
    
    assert.ok(projection.nodes.length >= 2);
    assert.ok(projection.contextMarkdown.includes('Starlight Epistemic Context Subgraph'));
    assert.ok(projection.tokenEstimate > 50);
  });
});
