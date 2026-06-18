import { DEFAULT_PROVIDER_CAPABILITIES } from "./resources.js";
import type {
  ForgetRequest,
  MemoryProvider,
  ProviderCapabilities,
  RecallRequest,
  RecallResult,
  SISMemoryRecord,
} from "./types.js";

export class InMemoryLocalCoreProvider implements MemoryProvider {
  readonly name = "local_core";
  readonly capabilities: ProviderCapabilities = DEFAULT_PROVIDER_CAPABILITIES.local_core;
  private readonly records = new Map<string, SISMemoryRecord>();

  async remember(record: SISMemoryRecord): Promise<SISMemoryRecord> {
    this.records.set(record.memory_id, record);
    return record;
  }

  async recall(request: RecallRequest): Promise<RecallResult[]> {
    const queryTerms = tokenize(request.query);
    const limit = Math.max(1, request.limit ?? 10);
    const minScore = request.min_score ?? 0;

    return Array.from(this.records.values())
      .filter((record) => record.tenant_id === request.tenant_id)
      .map((record) => scoreRecord(record, queryTerms))
      .filter((result) => result.score > minScore)
      .sort((a, b) => b.score - a.score || b.record.importance - a.record.importance)
      .slice(0, limit);
  }

  async forget(request: ForgetRequest): Promise<boolean> {
    const record = this.records.get(request.memory_id);
    if (!record || record.tenant_id !== request.tenant_id) return false;
    return this.records.delete(request.memory_id);
  }
}

function scoreRecord(record: SISMemoryRecord, queryTerms: string[]): RecallResult {
  const haystack = [
    record.raw_content,
    record.normalized_fact,
    record.summary,
    record.vault,
    record.memory_type,
    ...record.entities.map((entity) => entity.name),
    ...record.relations.flatMap((relation) => [relation.subject, relation.predicate, relation.object]),
  ].filter(Boolean).join(" ");

  const haystackTerms = new Set(tokenize(haystack));
  const matched = queryTerms.filter((term) => haystackTerms.has(term));
  const lexical = queryTerms.length === 0 ? 0 : matched.length / queryTerms.length;
  const weighted = lexical * 0.7 + record.importance * 0.15 + record.confidence * 0.1 + record.trust * 0.05;

  return {
    record,
    score: Number(weighted.toFixed(6)),
    matched_terms: matched,
  };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2);
}
