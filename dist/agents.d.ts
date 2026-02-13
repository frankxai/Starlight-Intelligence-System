/**
 * Agent Registry — Aligned with ACOS v8 specialist agents
 *
 * Provides task routing logic: given a query/file path,
 * recommend the best agent and skill set.
 */
import type { AgentDefinition, AgentRegistry } from "./types.js";
declare const ACOS_AGENTS: AgentDefinition[];
export declare class AgentRouter {
    private agents;
    constructor(agents?: AgentDefinition[]);
    /**
     * Route a task to the best agent based on query keywords and file patterns.
     * Returns agents sorted by relevance score.
     */
    route(query: string, filePaths?: string[]): AgentRecommendation[];
    /**
     * Get an agent by ID.
     */
    getAgent(id: string): AgentDefinition | undefined;
    /**
     * Get the full registry.
     */
    getRegistry(): AgentRegistry;
    /**
     * Add a custom agent to the registry.
     */
    addAgent(agent: AgentDefinition): void;
    private explainMatch;
}
export interface AgentRecommendation {
    agent: AgentDefinition;
    score: number;
    reason: string;
}
export { ACOS_AGENTS };
//# sourceMappingURL=agents.d.ts.map