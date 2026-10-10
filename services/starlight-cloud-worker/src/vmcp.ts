/**
 * Virtual MCP (vMCP) Edge JIT Context Synthesis Engine
 * Slashes LLM agent context token inflation by up to 85% via dynamic intent & AST routing.
 * Built on SIP v1.1.1
 */

import type { VirtualToolDefinition, VmcpRequest, VmcpResponse } from './types.js';

export class EdgeVirtualMcpRouter {
  private readonly tools: VirtualToolDefinition[] = [];

  constructor() {
    this.registerDefaultCatalog();
  }

  private registerDefaultCatalog(): void {
    this.register({
      name: 'ts_ast_check',
      description: 'Tree-sitter AST invariant verification for TypeScript diffs',
      inputSchema: { type: 'object', properties: { file: { type: 'string' } } },
      scope: 'ast_compilation',
      tokenCostEst: 450,
      upstreamServer: 'starlight-invariants',
    });

    this.register({
      name: 'vault_query',
      description: 'Semantic vector and full-text search across 6 Starlight Epistemic Vaults',
      inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
      scope: 'memory_retrieval',
      tokenCostEst: 380,
      upstreamServer: 'starlight-memory',
    });

    this.register({
      name: 'vault_append',
      description: 'Append verified insight or execution receipt to persistent memory',
      inputSchema: { type: 'object', properties: { content: { type: 'string' } } },
      scope: 'memory_write',
      tokenCostEst: 410,
      upstreamServer: 'starlight-memory',
    });

    this.register({
      name: 'audio_dsp_suno',
      description: 'Suno audio synthesis, stem separation, and catalog metadata tagging',
      inputSchema: { type: 'object', properties: { prompt: { type: 'string' } } },
      scope: 'creative_audio',
      tokenCostEst: 820,
      upstreamServer: 'starlight-audio',
    });

    this.register({
      name: 'cloudflare_deploy',
      description: 'Deploy serverless worker, mutate D1 schemas, or reindex Vectorize',
      inputSchema: { type: 'object', properties: { script: { type: 'string' } } },
      scope: 'cloudflare_infra',
      tokenCostEst: 1100,
      upstreamServer: 'cloudflare-bindings',
    });

    this.register({
      name: 'sentinel_security_scan',
      description: 'Run cryptographic attestation, secret leak audit, and CVE check',
      inputSchema: { type: 'object', properties: { targetPath: { type: 'string' } } },
      scope: 'governance_audit',
      tokenCostEst: 640,
      upstreamServer: 'starlight-sentinel',
    });
  }

  public register(tool: VirtualToolDefinition): void {
    this.tools.push(tool);
  }

  /**
   * Synthesizes the optimal toolset dynamically just-in-time for the agent's context envelope.
   */
  public synthesize(req: VmcpRequest): VmcpResponse {
    const intentLower = req.activeIntent.toLowerCase();
    const fileLower = (req.activeFilePath || '').toLowerCase();

    const selectedScopes = new Set<string>();

    // 1. AST & Code Engineering Scopes
    if (intentLower.includes('refactor') || intentLower.includes('code') || intentLower.includes('bug') ||
        fileLower.endsWith('.ts') || fileLower.endsWith('.tsx') || fileLower.endsWith('.rs')) {
      selectedScopes.add('ast_compilation');
    }

    // 2. Memory & Knowledge Scopes
    if (intentLower.includes('memory') || intentLower.includes('vault') || intentLower.includes('search') ||
        intentLower.includes('recall') || intentLower.includes('learn') || fileLower.includes('memory/')) {
      selectedScopes.add('memory_retrieval');
      selectedScopes.add('memory_write');
    }

    // 3. Audio & Music Scopes
    if (intentLower.includes('audio') || intentLower.includes('music') || intentLower.includes('suno') ||
        fileLower.includes('dsp') || fileLower.includes('audio')) {
      selectedScopes.add('creative_audio');
    }

    // 4. Cloudflare Infrastructure Scopes
    if (intentLower.includes('deploy') || intentLower.includes('worker') || intentLower.includes('cloudflare') ||
        fileLower.includes('wrangler')) {
      selectedScopes.add('cloudflare_infra');
    }

    // 5. Governance & Security Scopes
    if (intentLower.includes('audit') || intentLower.includes('security') || intentLower.includes('secret') ||
        intentLower.includes('verify')) {
      selectedScopes.add('governance_audit');
    }

    // Default fallback: Always keep memory retrieval mounted if nothing matched
    if (selectedScopes.size === 0) {
      selectedScopes.add('memory_retrieval');
    }

    const mounted = this.tools.filter(t => selectedScopes.has(t.scope));

    const unfilteredTokenCost = this.tools.reduce((sum, t) => sum + t.tokenCostEst, 0);
    const filteredTokenCost = mounted.reduce((sum, t) => sum + t.tokenCostEst, 0);
    const tokenSavingsPercent = unfilteredTokenCost > 0 
      ? Math.round(((unfilteredTokenCost - filteredTokenCost) / unfilteredTokenCost) * 1000) / 10
      : 0;

    return {
      activeIntent: req.activeIntent,
      activeFilePath: req.activeFilePath,
      activeTools: mounted,
      metrics: {
        totalRegisteredTools: this.tools.length,
        activeToolsMounted: mounted.length,
        unfilteredTokenCost,
        filteredTokenCost,
        tokenSavingsPercent,
      },
    };
  }
}
