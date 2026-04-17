export interface Contradiction {
    entryA: {
        id: string;
        vault: string;
        content: string;
        createdAt: string;
    };
    entryB: {
        id: string;
        vault: string;
        content: string;
        createdAt: string;
    };
    similarity: number;
    type: "potential";
    detectedAt: string;
}
type Entry = Contradiction["entryA"];
export declare class ContradictionDetector {
    private tokenize;
    private trigrams;
    private hasOpposing;
    similarity(a: string, b: string): number;
    private readEntries;
    scanVaults(vaultDir: string, options?: {
        minSimilarity?: number;
        limit?: number;
    }): Contradiction[];
    checkEntry(content: string, vault: string, existing: Entry[]): Contradiction[];
}
export {};
//# sourceMappingURL=contradiction.d.ts.map