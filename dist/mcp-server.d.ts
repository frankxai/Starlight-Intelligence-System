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
export declare class StarlightMcpServer {
    private tools;
    private vaultDir;
    constructor(vaultDir: string);
    private reg;
    private registerTools;
    handleRequest(request: JsonRpcRequest): JsonRpcResponse | null;
    start(): void;
}
export {};
//# sourceMappingURL=mcp-server.d.ts.map