import type { MemoryProvider, RecallRequest, RecallResult } from './provider.js';
import type { VeilSanitizer, VaultType } from './contracts.js';
import { SanitizationGateway } from './veil.js';

export interface RecallOptions {
  memory: Pick<MemoryProvider, 'recall'>;
  tenantId: string;
  workspaceId?: string;
  allowShareable?: boolean;
  sanitizer?: VeilSanitizer;
  limit?: number;
  maxCharacters?: number;
  timeoutMs?: number;
}

export interface ContextMemory {
  id: string;
  content: string;
  score: number;
  vault?: VaultType;
}

/** Filter before projecting: raw content, entities and provider metadata never leave here. */
export function projectRecall(results: RecallResult[], options: RecallOptions, now = Date.now()): ContextMemory[] {
  const limit = options.limit ?? 5;
  const budget = options.maxCharacters ?? 8_000;
  if (!options.tenantId.trim() || (options.workspaceId !== undefined && !options.workspaceId.trim())
      || !Number.isInteger(limit) || limit < 1 || limit > 100
      || !Number.isInteger(budget) || budget < 1 || budget > 100_000) {
    throw new Error('Invalid memory scope or context budget');
  }
  const sanitizer = options.sanitizer ?? new SanitizationGateway();
  const context: ContextMemory[] = [];
  const seen = new Set<string>();
  let remaining = budget;
  for (const result of results.slice(0, 1_000)) {
    const record = result?.record;
    if (!record || record.tenant_id !== options.tenantId
        || (options.workspaceId !== undefined && record.workspace_id !== options.workspaceId)
        || (record.privacy_class !== 'public' && !(options.allowShareable && record.privacy_class === 'private-shareable'))
        || typeof record.memory_id !== 'string' || !record.memory_id || seen.has(record.memory_id)
        || !Number.isFinite(result.score)) continue;
    if (record.retention_policy === 'delete_by' && record.retention_until === undefined) continue;
    if (record.retention_until !== undefined) {
      const expiry = Date.parse(record.retention_until);
      if (!Number.isFinite(expiry) || expiry <= now) continue;
    }
    const text = record.normalized_fact ?? record.summary;
    if (typeof text !== 'string' || !text.trim() || text.length > 100_000) continue;
    // A throwing sanitizer aborts the request; never fall back to unsanitized text.
    const content = sanitizer.sanitize(text).slice(0, remaining);
    if (!content.trim()) continue;
    const id = sanitizer.sanitize(record.memory_id).slice(0, 256);
    const vault = ['strategic', 'technical', 'creative', 'operational', 'wisdom', 'horizon'].includes(record.vault ?? '') ? record.vault : undefined;
    context.push({ id, content, score: result.score, ...(vault ? { vault } : {}) });
    seen.add(record.memory_id);
    remaining -= content.length;
    if (context.length >= limit || remaining <= 0) break;
  }
  return context;
}

/** Reads are bounded even when a provider ignores cooperative cancellation. */
export async function recallContext(query: string, options: RecallOptions, signal?: AbortSignal): Promise<ContextMemory[]> {
  if (!query.trim() || query.length > 16_000) throw new Error('Invalid recall query');
  const timeoutMs = options.timeoutMs ?? 5_000;
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 60_000) throw new Error('Invalid recall timeout');
  // Validate configuration before asking the provider to perform any work.
  projectRecall([], options);
  if (signal?.aborted) throw new Error('Memory recall cancelled');
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let rejectWait: (reason: Error) => void = () => {};
  const cancelled = new Promise<never>((_, reject) => { rejectWait = reject; });
  const abort = () => { controller.abort(); rejectWait(new Error('Memory recall cancelled')); };
  signal?.addEventListener('abort', abort, { once: true });
  timer = setTimeout(() => {
    controller.abort();
    rejectWait(new Error('Memory recall timed out'));
  }, timeoutMs);
  try {
    const request: RecallRequest = { tenant_id: options.tenantId, workspace_id: options.workspaceId,
      query, limit: options.limit ?? 5, signal: controller.signal };
    const results = await Promise.race([Promise.resolve().then(() => options.memory.recall(request)), cancelled]);
    if (controller.signal.aborted) throw new Error('Memory recall cancelled');
    return projectRecall(results, options);
  } catch {
    // Provider error messages may contain credentials, paths or raw memory.
    throw new Error('Memory recall unavailable or denied');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
