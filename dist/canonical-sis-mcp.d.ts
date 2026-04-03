export interface CanonicalSisMcpToolDefinition {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
}
export interface CanonicalSisMcpResourceDefinition {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
}
export interface CanonicalSisResourcePayload extends CanonicalSisMcpResourceDefinition {
    text: string;
}
export declare function getCanonicalSisMcpTools(): CanonicalSisMcpToolDefinition[];
export declare function getCanonicalSisMcpResources(sisRoot?: string): CanonicalSisMcpResourceDefinition[];
export declare function readCanonicalSisMcpResource(uri: string, sisRoot?: string): CanonicalSisResourcePayload;
export declare function callCanonicalSisMcpTool(name: string, args?: Record<string, unknown>, sisRoot?: string): Promise<Record<string, unknown>>;
//# sourceMappingURL=canonical-sis-mcp.d.ts.map