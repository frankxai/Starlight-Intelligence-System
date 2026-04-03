export declare const SIS_VAULT_NAMES: readonly ["strategic", "technical", "creative", "operational", "wisdom", "horizon"];
export declare const SIS_CONFIDENCE_LEVELS: readonly ["low", "medium", "high"];
export type SisVaultName = (typeof SIS_VAULT_NAMES)[number];
export type SisConfidenceLevel = (typeof SIS_CONFIDENCE_LEVELS)[number];
export interface SisEntryTypeDefinition {
    description: string;
    requiredMetadata: string[];
}
export declare const SIS_ENTRY_TYPES: {
    readonly generic: {
        readonly description: "Default freeform memory entry.";
        readonly requiredMetadata: [];
    };
    readonly project_learning: {
        readonly description: "Reusable learning tied to a project or product surface.";
        readonly requiredMetadata: ["project"];
    };
    readonly routine_learning: {
        readonly description: "Learning about a routine, habit, ritual, or workflow.";
        readonly requiredMetadata: ["routine"];
    };
    readonly state_learning: {
        readonly description: "Learning about a state, energy mode, or flow condition.";
        readonly requiredMetadata: ["state"];
    };
    readonly prompt_pack: {
        readonly description: "Reusable prompt or prompt pack memory.";
        readonly requiredMetadata: ["packName"];
    };
    readonly creative_asset: {
        readonly description: "Creative asset, song, library artifact, or aesthetic pattern.";
        readonly requiredMetadata: ["assetName"];
    };
};
export type SisEntryTypeName = keyof typeof SIS_ENTRY_TYPES;
export interface SisWriteInput {
    vault: string;
    content: string;
    tags?: string[] | string;
    category?: string;
    source?: string;
    confidence?: string;
    author?: string;
    context?: string;
    entryType?: string;
    metadata?: Record<string, unknown> | string;
    project?: string;
    routine?: string;
    state?: string;
    packName?: string;
    assetName?: string;
}
export interface SisNormalizedWriteInput {
    vault: SisVaultName;
    content: string;
    tags: string[];
    category?: string;
    source?: string;
    confidence: SisConfidenceLevel;
    author?: string;
    context?: string;
    entryType: SisEntryTypeName;
    metadata: Record<string, unknown>;
}
export interface SisValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    normalized: SisNormalizedWriteInput;
}
export interface CanonicalSisEntry {
    id: string | null;
    vault: SisVaultName;
    createdAt: string | null;
    tags: string[];
    content: string;
    entryType: SisEntryTypeName;
    metadata: Record<string, unknown>;
    raw: Record<string, unknown>;
}
export interface CanonicalSisValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export interface CanonicalSisVaultStats {
    sisRoot: string;
    vaultCounts: Record<SisVaultName, number>;
}
export declare function resolveCanonicalSisHome(root?: string): string;
export declare function ensureCanonicalSisLayout(root?: string): string;
export declare function parseTagsValue(value?: string[] | string): string[];
export declare function parseMetadataValue(value?: Record<string, unknown> | string): Record<string, unknown>;
export declare function buildTypedMetadata(input: SisWriteInput): Record<string, unknown>;
export declare function validateSisWriteInput(input: SisWriteInput): SisValidationResult;
export declare function normalizeSisReadEntry(vault: SisVaultName, entry: Record<string, unknown>): CanonicalSisEntry;
export declare function validateCanonicalSisEntry(vault: SisVaultName, entry: Record<string, unknown>): CanonicalSisValidationResult;
export declare function validateCanonicalSisVaultRows(vault: SisVaultName, entries: Record<string, unknown>[]): CanonicalSisValidationResult;
export declare function safeRead(path: string): string;
export declare function parseJsonl(path: string): Record<string, unknown>[];
export declare function getCanonicalSisVaultPath(vault: SisVaultName, root?: string): string;
export declare function buildCanonicalSisEntry(input: SisNormalizedWriteInput): Record<string, unknown>;
export declare function appendJsonl(path: string, entry: Record<string, unknown>): void;
export declare function appendCanonicalSisEntry(input: SisWriteInput, root?: string): {
    entry: Record<string, unknown>;
    path: string;
    warnings: string[];
};
export declare function readCanonicalSisVault(vault: SisVaultName, root?: string): CanonicalSisEntry[];
export declare function getCanonicalSisStats(root?: string): CanonicalSisVaultStats;
//# sourceMappingURL=canonical-sis.d.ts.map