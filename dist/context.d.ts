/**
 * Context Engine — The core of SIS v2
 *
 * Generates portable context injections for any AI tool.
 * Takes identity, knowledge, strategy, and memory layers
 * and compiles them into optimized system prompts.
 */
import type { ContextOptions, GeneratedContext, UserProfile, TechStack, BrandSystem, AgentDefinition, ReasoningStrategy, MemoryEntry } from "./types.js";
declare const DEFAULT_PROFILE: UserProfile;
declare const DEFAULT_STACK: TechStack;
declare const DEFAULT_BRAND: BrandSystem;
declare const DEFAULT_STRATEGIES: ReasoningStrategy[];
export interface ContextEngineConfig {
    profile?: UserProfile;
    stack?: TechStack;
    brand?: BrandSystem;
    strategies?: ReasoningStrategy[];
    agents?: AgentDefinition[];
    memories?: MemoryEntry[];
}
export declare class ContextEngine {
    private profile;
    private stack;
    private brand;
    private strategies;
    private agents;
    private memories;
    constructor(config?: ContextEngineConfig);
    /**
     * Generate a context injection for the target AI tool.
     * Assembles requested layers into a single document.
     */
    generate(options: ContextOptions): GeneratedContext;
    private buildLayer;
    /** Update the user profile */
    setProfile(profile: UserProfile): void;
    /** Update the tech stack */
    setStack(stack: TechStack): void;
    /** Update the brand system */
    setBrand(brand: BrandSystem): void;
    /** Set the agent registry */
    setAgents(agents: AgentDefinition[]): void;
    /** Set relevant memories for context injection */
    setMemories(memories: MemoryEntry[]): void;
    /** Add a reasoning strategy */
    addStrategy(strategy: ReasoningStrategy): void;
}
export { DEFAULT_PROFILE, DEFAULT_STACK, DEFAULT_BRAND, DEFAULT_STRATEGIES, };
//# sourceMappingURL=context.d.ts.map