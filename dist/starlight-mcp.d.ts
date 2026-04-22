#!/usr/bin/env node
export interface McpTool {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
}
interface JsonRpcRequest {
    jsonrpc?: string;
    method: string;
    params?: unknown;
    id?: number | string | null;
}
interface JsonRpcResponse {
    jsonrpc: '2.0';
    id: number | string | null;
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    };
}
export interface RegistryEntry {
    name: string;
    sip_version?: string;
    owner?: string;
    status?: string;
    repo?: string;
    endpoint?: string;
    provides?: string[];
    requires?: string[];
    license?: string;
    attestation?: string;
}
export interface VerticalEntry {
    name: string;
    class?: string;
    domain?: string;
    owner?: string;
    status?: string;
    repo?: string;
    public_surface?: string;
    canon?: string;
}
export interface AllianceRow {
    alliance: string;
    members?: string;
    role?: string;
    status?: string;
}
export interface AttestationParsed {
    substrate_version: string | null;
    layers: string[];
    verticals: string[];
    canon: string[];
    nodes: string[];
    generated: string | null;
}
/**
 * Parse REGISTRY.md into a list of registry entries.
 * Format: each entry begins with `### <name>` and is followed by bullet
 * lines of the shape `- **key:** value` (per Layer 3 schema).
 */
export declare function parseRegistry(md: string): RegistryEntry[];
/**
 * Parse VERTICALS.md into a list of vertical entries.
 * Format: each vertical begins with `### <name>` under the
 * "## Sovereign verticals" section. Same bullet shape as registry.
 */
export declare function parseVerticals(md: string): VerticalEntry[];
/**
 * Parse a "Built on SIP" attestation block out of arbitrary markdown.
 * Accepts both the minimum form (SIP.md § Layer 2 lines 41-49) and the
 * extended form emitted by /sip-attest (lines 42-63 of sip-attest.md).
 */
export declare function parseAttestation(content: string): {
    found: boolean;
    parsed: AttestationParsed;
    issues: string[];
};
/**
 * Parse the alliance table out of MEMORY.md. The public template renders
 * an empty (placeholder) table — that's expected; we return [].
 */
export declare function parseAllianceTable(md: string): AllianceRow[];
export declare class StarlightSubstrateMcpServer {
    private tools;
    private substrateDir;
    constructor(substrateDir: string);
    private reg;
    private substrateFile;
    private registerTools;
    handleRequest(request: JsonRpcRequest): JsonRpcResponse | null;
    start(): void;
}
export {};
//# sourceMappingURL=starlight-mcp.d.ts.map