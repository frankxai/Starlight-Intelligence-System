/**
 * Context Engine — The core of SIS v2
 *
 * Generates portable context injections for any AI tool.
 * Takes identity, knowledge, strategy, and memory layers
 * and compiles them into optimized system prompts.
 */
// ── Default Data ────────────────────────────────────────────
const DEFAULT_PROFILE = {
    name: "FrankX",
    title: "AI Architect & Creator",
    domains: [
        "AI Systems Architecture",
        "Music Production (AI)",
        "Web Development",
        "Digital Products",
        "Content Creation",
    ],
    values: ["Excellence", "Craftsmanship", "Humility", "Depth", "Genuine"],
    voice: {
        do: [
            "Lead with results and specifics",
            "Precise technical language",
            "Show don't tell",
            "Confident but understated",
            "Studio energy at 2am",
        ],
        dont: [
            "Spiritual or guru language",
            "Grandiose claims",
            "Over-explain philosophy",
            "Self-help tone",
            "Emojis unless requested",
        ],
        tone: "Technical depth with creative flair. The builder who ships.",
    },
};
const DEFAULT_STACK = {
    framework: "Next.js 15 (App Router)",
    language: "TypeScript 5.7+ (Strict)",
    styling: "Tailwind CSS v4",
    deployment: "Vercel",
    extras: {
        fonts: "Inter, Playfair Display, JetBrains Mono",
        animation: "Framer Motion",
        state: "React Server Components + Zustand",
    },
};
const DEFAULT_BRAND = {
    colors: {
        navy: "#0F172A",
        purple: "#AB47C7",
        cyan: "#43BFE3",
        gold: "#F59E0B",
        emerald: "#10B981",
    },
    tagline: "Build what matters.",
    attributes: ["Precise", "Bold", "Genuine", "Creative", "Warm"],
    typography: {
        body: "Inter 17px/1.8",
        headings: "Inter (tight tracking)",
        accent: "Playfair Display (blockquotes)",
        code: "JetBrains Mono",
    },
};
const DEFAULT_STRATEGIES = [
    {
        id: "first-principles",
        name: "First Principles",
        description: "Deconstruct assumptions, verify fundamentals, reconstruct from truth.",
        steps: [
            "Identify the core problem (not the symptom)",
            "List all assumptions being made",
            "Verify each assumption against evidence",
            "Reconstruct the solution from verified truths",
            "Test against edge cases",
        ],
        bestFor: ["architecture decisions", "debugging", "system design"],
    },
    {
        id: "pre-action-checklist",
        name: "Pre-Action Checklist",
        description: "Prevent costly mistakes by thinking before acting.",
        steps: [
            "What specific problem are we solving?",
            "Who experiences this problem?",
            "What's the simplest solution?",
            "What could go wrong? (SEO, users, irreversibility)",
            "Is this reversible? If not, get explicit approval.",
        ],
        bestFor: ["structural changes", "URL modifications", "page deletions"],
    },
    {
        id: "systems-thinking",
        name: "Systems Thinking",
        description: "Map the network, simulate flows, optimize the whole.",
        steps: [
            "Map all components and their connections",
            "Identify feedback loops (positive and negative)",
            "Simulate second-order effects of proposed changes",
            "Find leverage points for maximum impact",
            "Optimize for the whole system, not individual parts",
        ],
        bestFor: ["performance optimization", "architecture planning", "scaling decisions"],
    },
];
// ── Token Estimation ────────────────────────────────────────
function estimateTokens(text) {
    // Rough estimate: ~4 chars per token for English
    return Math.ceil(text.length / 4);
}
// ── Layer Builders ──────────────────────────────────────────
function buildIdentityLayer(profile) {
    const lines = [
        `## Identity: ${profile.name}`,
        `**${profile.title}**`,
        "",
        `Domains: ${profile.domains.join(", ")}`,
        `Values: ${profile.values.join(", ")}`,
        "",
        "### Voice",
        `Tone: ${profile.voice.tone}`,
        "",
        "**Do:**",
        ...profile.voice.do.map((d) => `- ${d}`),
        "",
        "**Don't:**",
        ...profile.voice.dont.map((d) => `- ${d}`),
    ];
    return lines.join("\n");
}
function buildKnowledgeLayer(stack, brand) {
    const lines = [
        "## Technical Knowledge",
        "",
        "### Stack",
        `- Framework: ${stack.framework}`,
        `- Language: ${stack.language}`,
        `- Styling: ${stack.styling}`,
        `- Deployment: ${stack.deployment}`,
    ];
    if (stack.database)
        lines.push(`- Database: ${stack.database}`);
    if (stack.extras) {
        for (const [key, value] of Object.entries(stack.extras)) {
            lines.push(`- ${key}: ${value}`);
        }
    }
    lines.push("", "### Brand", `Tagline: "${brand.tagline}"`, `Attributes: ${brand.attributes.join(", ")}`, "", "Colors:", ...Object.entries(brand.colors).map(([name, hex]) => `- ${name}: ${hex}`));
    return lines.join("\n");
}
function buildStrategyLayer(strategies) {
    const lines = ["## Reasoning Strategies", ""];
    for (const s of strategies) {
        lines.push(`### ${s.name}`, s.description, "", "Steps:", ...s.steps.map((step, i) => `${i + 1}. ${step}`), "", `Best for: ${s.bestFor.join(", ")}`, "");
    }
    return lines.join("\n");
}
function buildAgentLayer(agents) {
    const lines = [
        "## Available Agents",
        "",
        `${agents.length} specialist agents available:`,
        "",
    ];
    for (const agent of agents) {
        lines.push(`### ${agent.name} (${agent.type})`, agent.description, `Skills: ${agent.skills.join(", ")}`, `Triggers: ${agent.triggers.keywords.join(", ")}`, "");
    }
    return lines.join("\n");
}
function buildMemoryLayer(memories) {
    if (memories.length === 0)
        return "";
    const lines = [
        "## Relevant Memories",
        "",
        `${memories.length} relevant entries:`,
        "",
    ];
    for (const mem of memories) {
        lines.push(`- [${mem.category}] ${mem.content}`, `  (confidence: ${mem.confidence}, ${mem.createdAt})`, "");
    }
    return lines.join("\n");
}
// ── Format Wrappers ─────────────────────────────────────────
function wrapForTarget(content, target) {
    switch (target) {
        case "claude-code":
            // Claude Code reads CLAUDE.md — output as markdown
            return `# Starlight Intelligence Context\n\n${content}`;
        case "cursor":
            // Cursor reads .cursorrules — output as rules format
            return [
                "# Starlight Intelligence — Cursor Rules",
                "",
                "Follow these guidelines for all code generation:",
                "",
                content,
            ].join("\n");
        case "windsurf":
            // Windsurf reads .windsurfrules
            return [
                "# Starlight Intelligence — Windsurf Rules",
                "",
                content,
            ].join("\n");
        case "generic":
        default:
            return content;
    }
}
export class ContextEngine {
    profile;
    stack;
    brand;
    strategies;
    agents;
    memories;
    constructor(config = {}) {
        this.profile = config.profile ?? DEFAULT_PROFILE;
        this.stack = config.stack ?? DEFAULT_STACK;
        this.brand = config.brand ?? DEFAULT_BRAND;
        this.strategies = config.strategies ?? DEFAULT_STRATEGIES;
        this.agents = config.agents ?? [];
        this.memories = config.memories ?? [];
    }
    /**
     * Generate a context injection for the target AI tool.
     * Assembles requested layers into a single document.
     */
    generate(options) {
        const { target, layers, maxTokens = 4000, } = options;
        const sections = [];
        for (const layer of layers) {
            const section = this.buildLayer(layer);
            if (section)
                sections.push(section);
        }
        let content = sections.join("\n\n---\n\n");
        // Add project context if provided
        if (options.project) {
            const projectSection = [
                "## Project Context",
                "",
                `Project: ${options.project.name}`,
                `Path: ${options.project.path}`,
            ];
            if (options.project.conventions?.length) {
                projectSection.push("", "Conventions:", ...options.project.conventions.map((c) => `- ${c}`));
            }
            content = projectSection.join("\n") + "\n\n---\n\n" + content;
        }
        // Wrap for target format
        content = wrapForTarget(content, target);
        // Trim if over budget
        const estimate = estimateTokens(content);
        if (estimate > maxTokens) {
            // Truncate from the end, keeping critical layers
            const targetLength = maxTokens * 4;
            content = content.slice(0, targetLength) + "\n\n[Context trimmed to fit token budget]";
        }
        return {
            content,
            layers,
            tokenEstimate: estimateTokens(content),
            target,
            generatedAt: new Date().toISOString(),
        };
    }
    buildLayer(layer) {
        switch (layer) {
            case "identity":
                return buildIdentityLayer(this.profile);
            case "knowledge":
                return buildKnowledgeLayer(this.stack, this.brand);
            case "strategy":
                return buildStrategyLayer(this.strategies);
            case "agents":
                return buildAgentLayer(this.agents);
            case "memory":
                return buildMemoryLayer(this.memories);
            default:
                return "";
        }
    }
    /** Update the user profile */
    setProfile(profile) {
        this.profile = profile;
    }
    /** Update the tech stack */
    setStack(stack) {
        this.stack = stack;
    }
    /** Update the brand system */
    setBrand(brand) {
        this.brand = brand;
    }
    /** Set the agent registry */
    setAgents(agents) {
        this.agents = agents;
    }
    /** Set relevant memories for context injection */
    setMemories(memories) {
        this.memories = memories;
    }
    /** Add a reasoning strategy */
    addStrategy(strategy) {
        this.strategies.push(strategy);
    }
}
// ── Convenience Exports ─────────────────────────────────────
export { DEFAULT_PROFILE, DEFAULT_STACK, DEFAULT_BRAND, DEFAULT_STRATEGIES, };
//# sourceMappingURL=context.js.map