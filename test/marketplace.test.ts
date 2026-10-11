import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  StarlightMarketplace,
  type MarketplaceItem,
  type MarketplaceItemKind,
} from '../src/marketplace/index.js';

describe('StarlightMarketplace & Ecosystem Hub', () => {
  it('initializes with the curated ecosystem catalog', () => {
    const marketplace = new StarlightMarketplace();
    const stats = marketplace.getStats();

    assert.ok(stats.totalItems >= 14, `Expected at least 14 items, got ${stats.totalItems}`);
    assert.ok(stats.skillPacksCount >= 4, 'Should include skill packs');
    assert.ok(stats.mcpServersCount >= 4, 'Should include MCP servers');
    assert.ok(stats.harnessProfilesCount >= 4, 'Should include harness profiles');
    assert.ok(stats.cloudServicesCount >= 3, 'Should include managed cloud services');
    assert.ok(stats.verticalStacksCount >= 2, 'Should include vertical stacks');
  });

  it('retrieves items by ID', () => {
    const marketplace = new StarlightMarketplace();
    const item = marketplace.getItem('starlight-mcp');

    assert.ok(item, 'Item starlight-mcp should exist');
    assert.equal(item?.id, 'starlight-mcp');
    assert.equal(item?.kind, 'mcp_server');
    assert.equal(item?.pricingTier, 'free');
    assert.ok(item?.verifiedAttestation, 'Should have verified SIP attestation');
  });

  it('filters items by kind', () => {
    const marketplace = new StarlightMarketplace();
    const mcpItems = marketplace.search({ kind: 'mcp_server' });

    assert.ok(mcpItems.length >= 4);
    for (const item of mcpItems) {
      assert.equal(item.kind, 'mcp_server');
    }

    const cloudItems = marketplace.search({ kind: 'cloud_service' });
    assert.ok(cloudItems.length >= 3);
    for (const item of cloudItems) {
      assert.equal(item.kind, 'cloud_service');
    }
  });

  it('filters items by search query across name, description, and tags', () => {
    const marketplace = new StarlightMarketplace();

    const canvasResults = marketplace.search({ query: 'spatial' });
    assert.ok(canvasResults.length >= 1);
    assert.ok(canvasResults.some((i: MarketplaceItem) => i.id === 'starlight-agent-canvas'));

    const animeResults = marketplace.search({ query: 'anime' });
    assert.ok(animeResults.length >= 1);
    assert.ok(animeResults.some((i: MarketplaceItem) => i.id === 'anime-legends-mascots'));

    const pgvectorResults = marketplace.search({ query: 'pgvector' });
    assert.ok(pgvectorResults.length >= 1);
    assert.ok(pgvectorResults.some((i: MarketplaceItem) => i.id === 'postgres-vector-mcp'));
  });

  it('lists featured items and categories correctly', () => {
    const marketplace = new StarlightMarketplace();
    const featured = marketplace.listFeatured();

    assert.ok(featured.length >= 5, 'Should have featured items marked with star');
    for (const item of featured) {
      assert.equal(item.featured, true);
    }

    const categories = marketplace.listCategories();
    assert.ok(categories.includes('Agent Memory'));
    assert.ok(categories.includes('Spatial Reasoning'));
    assert.ok(categories.includes('Harness Presets'));
    assert.ok(categories.includes('Managed Cloud'));
  });

  it('supports registering dynamic community items with SIP attestations', () => {
    const marketplace = new StarlightMarketplace();
    const initialCount = marketplace.getStats().totalItems;

    const communityItem: MarketplaceItem = {
      id: 'community-quantum-optimizer',
      name: 'Quantum Circuit Simulator Skill',
      version: '0.1.0',
      kind: 'skill_pack',
      category: 'Science & DeepTech',
      description: 'Quantum annealing simulation skill pack for agentic material science exploration.',
      author: 'DeepTech Collective',
      pricingTier: 'free',
      tags: ['quantum', 'annealing', 'materials-science'],
      capabilities: ['sim:quantum_anneal', 'sim:hamiltonian_ground_state'],
      permissions: ['fs:read:repo', 'cpu:high_compute'],
      installCommand: 'starlight pack install community-quantum-optimizer',
      verifiedAttestation: true,
      manifestSha: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    };

    marketplace.registerItem(communityItem);
    assert.equal(marketplace.getStats().totalItems, initialCount + 1);

    const found = marketplace.getItem('community-quantum-optimizer');
    assert.ok(found);
    assert.equal(found?.author, 'DeepTech Collective');
  });
});
