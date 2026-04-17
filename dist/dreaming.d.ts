import { type Contradiction } from "./contradiction.js";
export interface DreamResult {
    extractedInsights: Array<{
        content: string;
        suggestedVault: string;
        confidence: number;
        source: string;
    }>;
    contradictions: Contradiction[];
    promotions: Array<{
        entryId: string;
        fromVault: string;
        toVault: "wisdom";
        reason: string;
    }>;
    processedFiles: number;
    timestamp: string;
}
export declare class DreamingAgent {
    private readonly vaultDir;
    private readonly detector;
    constructor(vaultDir: string);
    dream(sessionsDir: string): DreamResult;
    extractInsights(sessionData: Record<string, unknown>): Array<{
        content: string;
        suggestedVault: string;
        confidence: number;
    }>;
    identifyPromotions(vaultDir: string): DreamResult["promotions"];
    detectContradictions(vaultDir: string): Contradiction[];
    private readVaultEntries;
}
//# sourceMappingURL=dreaming.d.ts.map