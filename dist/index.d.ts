import Anthropic from '@anthropic-ai/sdk';
export { Anthropic };
interface MemoryEntry {
    id: string;
    content: string;
    metadata: Record<string, unknown>;
    created_at: Date;
}
interface ArcaneanSkill {
    id: string;
    name: string;
    element: 'fire' | 'water' | 'earth' | 'wind' | 'void' | 'integration';
    powerLevel: number;
    description: string;
    category: string;
}
interface ArcaneanAgent {
    id: string;
    name: string;
    guardian: string;
    element: string;
    specialty: string;
    personality: string;
    command: string;
}
interface ArcaneanGuardian {
    id: string;
    name: string;
    element: string;
    domain: string;
    personality: string;
    godbeast: string;
    wisdom: string[];
    powers: string[];
    gateAlignment: number;
}
interface EvolutionProgress {
    userId: string;
    currentGate: number;
    experiencePoints: number;
    skills: string[];
    guardians: string[];
    challengesCompleted: number;
    lastUpdated: Date;
    achievements: string[];
}
interface PremiumReasoningOptions {
    guardian?: string;
    context?: Record<string, unknown>;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
}
interface ReasoningResult {
    reasoning: string;
    guardian: string | null;
    arcaneanContext: boolean;
    tokensUsed: number;
    executionTime: number;
}
interface MemorySearchResult {
    entry: MemoryEntry;
    arcaneanInsight: string;
    elementResonance: string;
    relevanceScore: number;
}
declare const TEN_GATES: {
    gate: number;
    name: string;
    element: string;
    threshold: number;
}[];
declare const GUARDIANS: ArcaneanGuardian[];
declare const SKILLS: ArcaneanSkill[];
declare const AGENTS: ArcaneanAgent[];
declare class MemoryLayer {
    private memoryManager;
    private supabaseClient;
    private storageType;
    private tableName;
    initialize(options?: {
        supabaseUrl?: string;
        supabaseKey?: string;
    }): Promise<void>;
    private initializeSupabase;
    add(entry: Record<string, unknown>): Promise<void>;
    search(query: string, options?: {
        limit?: number;
        threshold?: number;
    }): Promise<MemoryEntry[]>;
    getRecent(limit?: number): Promise<MemoryEntry[]>;
    getStats(): Promise<{
        totalEntries: number;
        storageType: string;
        oldestMemory: Date | null;
        newestMemory: Date | null;
    }>;
}
declare class GuardianAISystem {
    private guardians;
    private activeGuardian;
    private affinityScore;
    constructor();
    getGuardian(name: string): ArcaneanGuardian | null;
    getAllGuardians(): ArcaneanGuardian[];
    getGuardianByGate(gate: number): ArcaneanGuardian | null;
    activateGuardian(name: string): ArcaneanGuardian | null;
    getActiveGuardian(): ArcaneanGuardian | null;
    getAffinityScore(name: string): number;
    getRecommendedGuardian(query: string): ArcaneanGuardian | null;
    getGuardianPowers(name: string): string[];
    getGuardianWisdom(name: string): string[];
}
declare class EvolutionTracker {
    private userProgress;
    initializeUser(userId: string): EvolutionProgress;
    getProgress(userId: string): EvolutionProgress;
    addExperience(userId: string, points: number): EvolutionProgress;
    addSkill(userId: string, skill: string): EvolutionProgress;
    addGuardianAffinity(userId: string, guardian: string): EvolutionProgress;
    completeChallenge(userId: string, _challengeId: string): EvolutionProgress;
    private calculateGate;
    getGateInfo(gate: number): {
        name: string;
        element: string;
        nextThreshold: number;
        currentThreshold: number;
    } | null;
    getEvolutionPath(gate: number): string[];
    private getGuardianForGate;
    getLeaderboard(limit?: number): EvolutionProgress[];
}
declare class PremiumCommandInterface {
    private starlight;
    private commands;
    constructor(starlight: StarlightIntelligence);
    private registerCommands;
    execute(command: string, args: string[]): Promise<unknown>;
    getHelpText(): string;
    getCommands(): string[];
}
export declare class StarlightIntelligence {
    private memoryLayer;
    private guardianSystem;
    private evolutionTracker;
    private commandInterface;
    private claudeClient;
    private langChainModel;
    private initialized;
    constructor();
    initialize(options?: {
        supabaseUrl?: string;
        supabaseKey?: string;
        openaiKey?: string;
    }): Promise<void>;
    isInitialized(): boolean;
    reason(query: string, options?: PremiumReasoningOptions): Promise<ReasoningResult>;
    private createArcaneaPrompt;
    private generateLocalReasoning;
    sendStarlightNote(content: string, targetDate?: Date): Promise<{
        success: boolean;
        message: string;
        quantumSignature: string;
    }>;
    private generateQuantumSignature;
    searchMemory(query: string): Promise<MemorySearchResult[]>;
    private analyzeArcaneanPattern;
    private detectElementResonance;
    trackProgress(userProgress: {
        userId?: string;
        guardian?: string;
        skills?: string[];
    }): Promise<{
        currentGate: number;
        nextGate: number;
        guardianGuidance: string;
        evolutionPath: string[];
    }>;
    private getProgressInsight;
    getGuardianInfo(name: string): ArcaneanGuardian | null;
    getAllGuardians(): ArcaneanGuardian[];
    getEvolutionStatus(userId: string): Promise<{
        progress: EvolutionProgress;
        gateInfo: {
            name: string;
            element: string;
            nextThreshold: number;
            currentThreshold: number;
        } | null;
    } | null>;
    recordEvolutionAction(userId: string, action: string, value: string): Promise<EvolutionProgress>;
    getSystemStats(): Promise<{
        version: string;
        guardians: number;
        skills: number;
        agents: number;
        gates: number;
        initialized: boolean;
    }>;
    getMemoryStats(): Promise<ReturnType<typeof this.memoryLayer.getStats>>;
    getRecentMemories(limit?: number): Promise<MemoryEntry[]>;
    invokeAgent(agentCommand: string, _args: string[]): Promise<{
        agent: ArcaneanAgent;
        message: string;
    }>;
    executeCommand(command: string, args: string[]): Promise<unknown>;
    getCommands(): string[];
}
declare const starlight: StarlightIntelligence;
export default starlight;
export { starlight, GUARDIANS, SKILLS, AGENTS, TEN_GATES, MemoryLayer, GuardianAISystem, EvolutionTracker, PremiumCommandInterface };
//# sourceMappingURL=index.d.ts.map