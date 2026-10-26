/**
 * A2A Protocol Agent Card Descriptor — Starlight Cloud Worker
 * Implements /.well-known/agent.json discovery per A2A 1.0 specification.
 *
 * Built on SIP v1.1.1
 */

import type { A2AAgentCard } from './types.js';

export function buildCloudWorkerAgentCard(origin: string, verifierConfigured: boolean): A2AAgentCard {
  const baseUrl = origin.replace(/\/+$/, '');
  return {
    schemaVersion: '1.0.0',
    name: 'Starlight Cloud Mesh & Sovereign Memory Gateway',
    description:
      'Edge-native epistemic memory substrate (6 semantic vaults with 90-day temporal half-life and RRF hybrid fusion), stateless Streamable HTTP vMCP router, cost-aware AI gateway, and durable swarm worktree lease coordinator.',
    url: baseUrl,
    version: '0.3.0-edge',
    protocol: 'SIP-1.1.1',
    attestation: 'Built on SIP v1.1.1',
    provider: {
      organization: 'Starlight Intelligence Systems',
      url: 'https://starlightintelligence.org',
    },
    capabilities: {
      streaming: false,
      pushNotifications: false,
      stateTransitionHistory: true,
      mcpTransport: 'streamable-http',
      mcpEndpoint: `${baseUrl}/v1/mcp`,
      mcpSpecVersion: '2026-07-28',
      epistemicVaults: 6,
    },
    authentication: {
      schemes: ['Bearer'],
      protectedApiStatus: verifierConfigured ? 'available' : 'unavailable',
      reason: verifierConfigured
        ? 'verified_identity_authority_bound'
        : 'identity_membership_verifier_missing',
    },
    defaultInputModes: ['application/json'],
    defaultOutputModes: ['application/json'],
    skills: [
      {
        id: 'vault-memory-query',
        name: 'Epistemic Vault Hybrid Search',
        description:
          'Reciprocal Rank Fusion (RRF) + 90-day temporal decay search across Strategic, Technical, Creative, Operational, Wisdom, and Horizon memory vaults.',
        tags: ['memory', 'vault', 'rrf', 'search', 'rag'],
        examples: ['POST /v1/memory/query {"query": "D1 write acknowledgement invariant", "tier": "technical"}'],
      },
      {
        id: 'vault-memory-append',
        name: 'Edge Veil Scrubbed Memory Ingestion',
        description:
          'Scrubs secrets/PII via Edge Veil, classifies epistemic tier, and persists memory atoms with affirmative D1 write acknowledgement.',
        tags: ['memory', 'ingestion', 'veil', 'd1'],
        examples: ['POST /v1/memory/append {"content": "Verified stateless MCP HTTP transport", "tier": "technical"}'],
      },
      {
        id: 'mcp-streamable-http',
        name: 'Stateless Streamable HTTP MCP Endpoint',
        description:
          'Stateless JSON-RPC 2.0 Model Context Protocol endpoint (MCP 2026-07-28 spec) supporting initialize, ping, tools/list, and tools/call.',
        tags: ['mcp', 'streamable-http', 'json-rpc', 'tools'],
        examples: ['POST /v1/mcp {"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'],
      },
      {
        id: 'vmcp-jit-synthesis',
        name: 'Virtual MCP JIT Context Synthesis',
        description:
          'Dynamically filters MCP tool catalogs based on active agent intent and file AST scope to reduce context token overhead by up to 85%.',
        tags: ['vmcp', 'context-optimization', 'mcp'],
        examples: ['POST /v1/vmcp/synthesize {"agentId": "architect", "activeIntent": "refactor cloudflare worker"}'],
      },
      {
        id: 'cost-aware-ai-gateway',
        name: 'Cost-Aware Multi-Model AI Gateway',
        description:
          'OpenAI-compatible /v1/chat/completions endpoint with complexity classification (mechanical, balanced, deep_reasoning), KV semantic prompt caching, and vault memory injection.',
        tags: ['llm', 'routing', 'cost-optimization', 'semantic-cache'],
        examples: ['POST /v1/chat/completions {"model": "starlight-auto", "messages": [{"role": "user", "content": "..."}]}'],
      },
      {
        id: 'swarm-worktree-lease',
        name: 'Swarm Worktree Lease Arbitration',
        description:
          'Path-scoped multi-agent worktree lease acquisition and release backed by Cloudflare D1 and KV.',
        tags: ['swarm', 'leases', 'coordination', 'git-worktree'],
        examples: ['POST /v1/swarm/lease/acquire {"agentId": "codex", "worktree": "sis-wave2", "paths": ["src/index.ts"]}'],
      },
    ],
  };
}
