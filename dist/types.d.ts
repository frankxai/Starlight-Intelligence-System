/**
 * Starlight Intelligence System v2.0 — Type Definitions
 *
 * Universal Context Standard for AI-augmented creator workflows.
 * Designed to work with Claude Code, Cursor, Windsurf, or any LLM tool.
 */
export interface UserProfile {
    name: string;
    title: string;
    domains: string[];
    values: string[];
    voice: VoiceGuidelines;
}
export interface VoiceGuidelines {
    do: string[];
    dont: string[];
    tone: string;
    examples?: string[];
}
export interface TechStack {
    framework: string;
    language: string;
    styling: string;
    deployment: string;
    database?: string;
    extras?: Record<string, string>;
}
export interface BrandSystem {
    colors: Record<string, string>;
    tagline: string;
    attributes: string[];
    typography?: Record<string, string>;
}
export interface AgentDefinition {
    id: string;
    name: string;
    type: "specialist" | "meta";
    description: string;
    skills: string[];
    triggers: {
        keywords: string[];
        filePatterns?: string[];
    };
}
export interface AgentRegistry {
    version: string;
    agents: AgentDefinition[];
}
export interface SkillDefinition {
    id: string;
    type: "technical" | "domain" | "creative" | "workflow";
    priority: "critical" | "high" | "medium";
    description: string;
    triggers: {
        keywords: string[];
        files?: string[];
    };
}
export interface MemoryEntry {
    id: string;
    content: string;
    category: "pattern" | "decision" | "insight" | "error" | "preference";
    tags: string[];
    confidence: number;
    createdAt: string;
    source?: string;
}
export interface MemorySearchOptions {
    query: string;
    category?: MemoryEntry["category"];
    limit?: number;
    minConfidence?: number;
}
export interface MemoryStats {
    totalEntries: number;
    byCategory: Record<string, number>;
    oldestEntry?: string;
    newestEntry?: string;
}
export interface ContextOptions {
    /** Target AI tool (affects output format) */
    target: "claude-code" | "cursor" | "windsurf" | "generic";
    /** Which layers to include */
    layers: ContextLayer[];
    /** Maximum token budget for the context */
    maxTokens?: number;
    /** Project-specific overrides */
    project?: ProjectContext;
}
export type ContextLayer = "identity" | "knowledge" | "strategy" | "agents" | "memory";
export interface ProjectContext {
    name: string;
    path: string;
    stack?: TechStack;
    conventions?: string[];
    activeSkills?: string[];
}
export interface GeneratedContext {
    content: string;
    layers: ContextLayer[];
    tokenEstimate: number;
    target: ContextOptions["target"];
    generatedAt: string;
}
export interface ReasoningStrategy {
    id: string;
    name: string;
    description: string;
    steps: string[];
    bestFor: string[];
}
export interface SystemStats {
    version: string;
    agents: number;
    skills: number;
    memories: number;
    strategies: number;
    contextLayers: number;
}
//# sourceMappingURL=types.d.ts.map