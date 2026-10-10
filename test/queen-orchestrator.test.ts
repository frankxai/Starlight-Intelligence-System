import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { StarlightQueen } from '../src/queen/index.js';

describe('StarlightQueen Meta-Orchestrator', () => {
  it('initializes with all 10 harness profiles and knowledge tree integration', () => {
    const queen = new StarlightQueen();
    const claude = queen.getHarness('claude-code');
    const antigravity = queen.getHarness('antigravity');
    const codex = queen.getHarness('codex');

    assert.ok(claude);
    assert.equal(claude?.vendor, 'Anthropic');
    assert.ok(antigravity);
    assert.equal(antigravity?.vendor, 'Google');
    assert.ok(codex);
    assert.equal(codex?.vendor, 'OpenAI');

    assert.ok(queen.getKnowledgeTree().getNodeCount() >= 40);
  });

  it('dynamically synthesizes specialized sub-swarms based on mission intent', () => {
    const queen = new StarlightQueen();
    
    // PhD Research Swarm synthesis
    const researchSwarm = queen.designSwarm('Investigate quantum decoherence limits in warm biological matrices');
    assert.ok(researchSwarm.roles.includes('phd_researcher'));
    assert.equal(researchSwarm.aestheticStandard, 'apple_minimalist');

    // Creative Cinema Swarm synthesis
    const cinemaSwarm = queen.designSwarm('Produce anime teaser scene featuring Akashi and Kage with sakuga motion');
    assert.ok(cinemaSwarm.roles.includes('art_director'));
    assert.equal(cinemaSwarm.aestheticStandard, 'rituals_sensory_luxury');

    // Revenue Swarm synthesis
    const revSwarm = queen.designSwarm('Automate affiliate redirect monetization for top AI developer tools');
    assert.ok(revSwarm.roles.includes('revenue_operator'));
    assert.equal(revSwarm.aestheticStandard, 'tesla_relentless_speed');
  });

  it('synthesizes custom tool connectors for a swarm', () => {
    const queen = new StarlightQueen();
    const swarm = queen.designSwarm('Build high-performance edge redirect engine');
    const connectors = queen.synthesizeToolConnectors(swarm);

    assert.ok(connectors.length >= 1);
    assert.ok(connectors.some(c => c.name === 'starlight_knowledge_tree'));
  });

  it('executes a swarm mission with adversarial Santa loop convergence', async () => {
    const queen = new StarlightQueen();
    const swarm = queen.designSwarm('Formalize epistemic confidence indicators', 'phd_research_deep');
    
    const execution = await queen.executeSwarmMission(swarm.id);
    assert.equal(execution.status, 'converged_passed');
    assert.ok(execution.iterations >= 2);
    assert.ok(execution.reviewerCritique?.includes('Approved'));
    assert.ok(execution.verifiedGates.length > 0);
  });

  it('generates an executive high-status Founder Cockpit Briefing', () => {
    const queen = new StarlightQueen();
    queen.designSwarm('Full estate synchronization');
    const briefing = queen.generateFounderCockpitBriefing();

    assert.ok(briefing.includes('Starlight Queen Executive Cockpit Briefing'));
    assert.ok(briefing.includes('Multi-Harness Fleet Telemetry'));
    assert.ok(briefing.includes('Apple (zero-slop minimalism) × Rituals (contemplative sensory luxury)'));
  });
});
