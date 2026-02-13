/**
 * Starlight Intelligence System v2.0
 *
 * Universal Context Standard — Portable cognitive architecture
 * for AI-augmented creator workflows.
 *
 * Core capabilities:
 * 1. Context Engine — Generate optimized system prompts for any AI tool
 * 2. Memory Manager — Persistent cross-session knowledge
 * 3. Agent Router — Intelligent task routing aligned with ACOS v8
 *
 * @example
 * ```typescript
 * import { StarlightIntelligence } from "@frankx/starlight-intelligence-system";
 *
 * const sis = new StarlightIntelligence();
 * sis.initialize();
 *
 * // Generate context for Claude Code
 * const context = sis.generateContext({
 *   target: "claude-code",
 *   layers: ["identity", "knowledge", "strategy", "agents"],
 * });
 *
 * // Route a task to the best agent
 * const recommendations = sis.routeTask("write a blog post about AI agents");
 *
 * // Store a learning
 * sis.remember({
 *   content: "Never use clay/claymorphic style in image generation",
 *   category: "preference",
 *   tags: ["design", "images", "brand"],
 *   confidence: 1.0,
 * });
 * ```
 */
import { ContextEngine } from "./context.js";
import { MemoryManager } from "./memory.js";
import { AgentRouter, ACOS_AGENTS } from "./agents.js";
// ── Main Class ──────────────────────────────────────────────
export class StarlightIntelligence {
    context;
    memory;
    router;
    initialized = false;
    constructor(options) {
        this.context = new ContextEngine({
            profile: options?.profile,
            stack: options?.stack,
            brand: options?.brand,
            agents: options?.agents ?? ACOS_AGENTS,
        });
        this.memory = new MemoryManager(options?.memoryPath);
        this.router = new AgentRouter(options?.agents ?? ACOS_AGENTS);
    }
    /**
     * Initialize the system: load persistent memories from disk.
     */
    initialize() {
        if (this.initialized)
            return;
        this.memory.load();
        this.initialized = true;
    }
    /**
     * Generate a context injection for the target AI tool.
     */
    generateContext(options) {
        // If memory layer requested, inject relevant memories
        if (options.layers.includes("memory")) {
            const recentMemories = this.memory.getRecent(20);
            this.context.setMemories(recentMemories);
        }
        return this.context.generate(options);
    }
    /**
     * Route a task to the best agent(s).
     */
    routeTask(query, filePaths) {
        return this.router.route(query, filePaths);
    }
    /**
     * Store a learning/memory entry.
     */
    remember(entry) {
        const stored = this.memory.add(entry);
        this.memory.save();
        return stored;
    }
    /**
     * Search stored memories.
     */
    searchMemories(options) {
        return this.memory.search(options);
    }
    /**
     * Get memory statistics.
     */
    getMemoryStats() {
        return this.memory.getStats();
    }
    /**
     * Get an agent by ID.
     */
    getAgent(id) {
        return this.router.getAgent(id);
    }
    /**
     * Get system statistics.
     */
    getStats() {
        return {
            version: "2.0.0",
            agents: this.router.getRegistry().agents.length,
            skills: this.router
                .getRegistry()
                .agents.reduce((sum, a) => sum + a.skills.length, 0),
            memories: this.memory.size,
            strategies: 3, // Default strategies count
            contextLayers: 5,
        };
    }
    /**
     * Save memories to disk.
     */
    save() {
        this.memory.save();
    }
}
// ── Re-exports ──────────────────────────────────────────────
export { ContextEngine, DEFAULT_PROFILE, DEFAULT_STACK, DEFAULT_BRAND } from "./context.js";
export { MemoryManager } from "./memory.js";
export { AgentRouter, ACOS_AGENTS } from "./agents.js";
//# sourceMappingURL=index.js.map