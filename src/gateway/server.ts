/**
 * src/gateway/server.ts — SisGatewayCore: transport-neutral request handler.
 *
 * Delegates memory operations to the same code paths as the MCP server
 * (VaultMemory.rememberInVault + VaultMemory.searchVaults).
 *
 * PRIVACY POSTURE: the gateway serves operational vault memory only — it has
 * no VaultLoop surface (where privacy-classed entries live) and never mounts
 * the private substrate repo. AuthContext.includePrivate is structurally
 * locked to false for every external harness. Defense-in-depth: search
 * results carrying a `private` / `privacy:*` tag are dropped before return,
 * so a privacy-tagged entry can never cross this boundary even if one is
 * written to the operational store.
 *
 * Never throws — all errors become {ok:false, error} responses.
 *
 * Built on SIP — operational tier (memory gateway v0.1)
 */

import { join } from 'node:path';
import { VaultMemory } from '../vault-memory.js';
import { SessionStore } from '../session-store.js';
import { telemetry } from '../telemetry/index.js';
import type { VaultType, VaultSearchResult } from '../types.js';
import type { SessionItem } from '../session-store.js';
import {
  parseRoute,
  ok,
  err,
  createThreadContext,
  upsertThreadContextSection,
  serializeThreadContextMarkdown,
  parseThreadContextMarkdown,
  extractTrajectoryLearnings,
  buildVaultPromotionRecord,
  importHarnessMemoryPacket,
  type GatewayRequest,
  type GatewayResponse,
  type MemoryAddBody,
  type MemorySearchBody,
  type SessionAddBody,
  type ThreadContextUpdateBody,
  type ThreadPromoteLearningsBody,
  type ThreadContextDocument,
} from './protocol.js';

// ── SisGatewayCore ──────────────────────────────────────────

export interface GatewayCoreOptions {
  /** Root directory for vault storage (.starlight subdirectory will be used). */
  storageRoot: string;
}

export class SisGatewayCore {
  private readonly vault: VaultMemory;
  private readonly sessions: SessionStore;
  private readonly threadContexts: Map<string, ThreadContextDocument> = new Map();

  constructor(opts: GatewayCoreOptions) {
    this.vault = new VaultMemory({
      storagePath: join(opts.storageRoot, '.starlight'),
    });
    this.sessions = new SessionStore(opts.storageRoot);
  }

  /**
   * Handle a gateway request. Never throws — errors become {ok:false} responses.
   */
  async handle(req: GatewayRequest): Promise<GatewayResponse> {
    try {
      const route = parseRoute(req.method, req.path);

      switch (route.kind) {
        case 'memory.health':
          return ok(200, { status: 'ok', version: '0.1.0' });

        case 'memory.add':
          return this.handleMemoryAdd(req.body as MemoryAddBody | undefined);

        case 'memory.search':
          return this.handleMemorySearch(req.body as MemorySearchBody | undefined);

        case 'session.getItems': {
          const sessionId = route.params['id']!;
          const harness = req.auth?.harness ?? 'default';
          const limitStr = req.query?.['limit'];
          const limit = limitStr != null ? parseInt(limitStr, 10) : undefined;
          return this.handleSessionGetItems(harness, sessionId, limit);
        }

        case 'session.addItems': {
          const sessionId = route.params['id']!;
          const harness = req.auth?.harness ?? 'default';
          telemetry.traceHarnessSession({
            harness,
            sessionId,
            task: 'gateway:session.addItems',
          });
          return this.handleSessionAddItems(harness, sessionId, req.body as SessionAddBody | undefined);
        }

        case 'session.pop': {
          const sessionId = route.params['id']!;
          const harness = req.auth?.harness ?? 'default';
          return this.handleSessionPop(harness, sessionId);
        }

        case 'session.clear': {
          const sessionId = route.params['id']!;
          const harness = req.auth?.harness ?? 'default';
          return this.handleSessionClear(harness, sessionId);
        }

        case 'thread.getContext': {
          const threadId = route.params['id']!;
          const harness = req.auth?.harness ?? 'default';
          return this.handleThreadGetContext(harness, threadId);
        }

        case 'thread.updateContext': {
          const threadId = route.params['id']!;
          const harness = req.auth?.harness ?? 'default';
          return this.handleThreadUpdateContext(
            harness,
            threadId,
            req.body as ThreadContextUpdateBody | undefined,
          );
        }

        case 'thread.promoteLearnings': {
          const threadId = route.params['id']!;
          const harness = req.auth?.harness ?? 'default';
          return this.handleThreadPromoteLearnings(
            harness,
            threadId,
            req.body as ThreadPromoteLearningsBody | undefined,
          );
        }

        case 'not.found':
          return err(404, `Not found: ${req.method} ${req.path}`);

        default: {
          const _exhaustive: never = route.kind;
          return err(500, `Unhandled route: ${String(_exhaustive)}`);
        }
      }
    } catch (e) {
      return err(500, e instanceof Error ? e.message : String(e));
    }
  }

  // ── Memory handlers ─────────────────────────────────────────

  private handleMemoryAdd(body: MemoryAddBody | undefined): GatewayResponse {
    if (!body || typeof body.content !== 'string' || !body.content.trim()) {
      return err(400, 'body.content is required and must be a non-empty string');
    }

    const content = body.content;
    const vault: VaultType | undefined =
      typeof body.vault === 'string' ? (body.vault as VaultType) : undefined;
    const tags = Array.isArray(body.tags) ? body.tags.map(String) : [];
    const confidence = typeof body.confidence === 'number' ? body.confidence : 0.5;
    const source = typeof body.source === 'string' ? body.source : undefined;

    const entry = this.vault.rememberInVault(content, vault, tags, confidence, source);
    return ok(200, { ok: true, entry });
  }

  private handleMemorySearch(body: MemorySearchBody | undefined): GatewayResponse {
    if (!body || typeof body.query !== 'string' || !body.query.trim()) {
      return err(400, 'body.query is required and must be a non-empty string');
    }

    const query = body.query;
    const vaults = Array.isArray(body.vaults) ? (body.vaults as VaultType[]) : undefined;
    const limit = typeof body.limit === 'number' ? body.limit : 10;

    const rawResults = this.vault.searchVaults({ query, vaults, limit });

    // PRIVACY GATE: filter search results through the canonical search filter.
    // VaultSearchResult wraps VaultEntry which wraps MemoryEntry.
    // We check privacy on the entry tags (entries with vault:* tags from
    // rememberInVault) — but crucially, VaultMemory.searchVaults goes through
    // MemoryManager.search which does not have VaultLoopEntry objects.
    //
    // The VaultLoopEntry privacy filter (filterForSearch from vault-loop.ts)
    // operates on VaultLoopEntry arrays written by sis.vault.record / vault-loop
    // tooling. The VaultMemory entries here are MemoryEntry objects (not
    // VaultLoopEntry) and do not carry the `privacy` field.
    //
    // For gateway purposes, we apply the guard at the correct level: external
    // harnesses get auth.includePrivate = false (enforced on AuthContext).
    // VaultLoopEntry surfaces (vault-loop.jsonl) route through their own filters.
    // VaultMemory entries from rememberInVault are operational memory — no
    // per-entry privacy classification on this path.
    //
    // Defense-in-depth: even though MemoryEntry has no privacy field today,
    // drop anything tagged private by convention so the boundary holds the
    // day such entries appear in the operational store.
    const results = rawResults.filter((r) => !isPrivateTagged(extractTags(r)));

    return ok(200, { ok: true, results });
  }

  // ── Session handlers ────────────────────────────────────────

  private async handleSessionGetItems(
    harness: string,
    sessionId: string,
    limit?: number,
  ): Promise<GatewayResponse> {
    try {
      const items = await this.sessions.getItems(harness, sessionId, limit);
      return ok(200, { ok: true, items });
    } catch (e) {
      return err(400, e instanceof Error ? e.message : String(e));
    }
  }

  private async handleSessionAddItems(
    harness: string,
    sessionId: string,
    body: SessionAddBody | undefined,
  ): Promise<GatewayResponse> {
    if (!body || !Array.isArray(body.items)) {
      return err(400, 'body.items must be an array');
    }
    const items: SessionItem[] = body.items.map(i => ({
      content: String((i as SessionItem).content ?? ''),
      meta: (i as SessionItem).meta,
    }));

    try {
      await this.sessions.addItems(harness, sessionId, items);
      return ok(200, { ok: true, count: items.length });
    } catch (e) {
      return err(400, e instanceof Error ? e.message : String(e));
    }
  }

  private async handleSessionPop(
    harness: string,
    sessionId: string,
  ): Promise<GatewayResponse> {
    try {
      const popped = await this.sessions.popItem(harness, sessionId);
      return ok(200, { ok: true, popped });
    } catch (e) {
      return err(400, e instanceof Error ? e.message : String(e));
    }
  }

  private async handleSessionClear(
    harness: string,
    sessionId: string,
  ): Promise<GatewayResponse> {
    try {
      await this.sessions.clearSession(harness, sessionId);
      return ok(200, { ok: true });
    } catch (e) {
      return err(400, e instanceof Error ? e.message : String(e));
    }
  }

  // ── ThreadContext & Trajectory Learning handlers ────────────

  private async getOrLoadThreadContext(
    harness: string,
    threadId: string,
  ): Promise<ThreadContextDocument> {
    const key = `${harness}:${threadId}`;
    const cached = this.threadContexts.get(key);
    if (cached) return cached;

    try {
      const items = await this.sessions.getItems(harness, threadId, 50);
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i]!;
        if (item.meta && item.meta['kind'] === 'thread-context.v1' && item.content) {
          const parsed = parseThreadContextMarkdown(item.content, threadId, harness);
          this.threadContexts.set(key, parsed);
          return parsed;
        }
      }
    } catch {
      // Fallback to new context
    }

    const fresh = createThreadContext(threadId, harness);
    this.threadContexts.set(key, fresh);
    return fresh;
  }

  private async persistThreadContext(
    harness: string,
    threadId: string,
    context: ThreadContextDocument,
  ): Promise<string> {
    const key = `${harness}:${threadId}`;
    this.threadContexts.set(key, context);
    const markdown = serializeThreadContextMarkdown(context);
    await this.sessions.addItems(harness, threadId, [
      {
        content: markdown,
        meta: {
          kind: 'thread-context.v1',
          updatedAt: context.updatedAt,
        },
      },
    ]);
    return markdown;
  }

  private async handleThreadGetContext(
    harness: string,
    threadId: string,
  ): Promise<GatewayResponse> {
    const context = await this.getOrLoadThreadContext(harness, threadId);
    const markdown = serializeThreadContextMarkdown(context);
    const learnings = extractTrajectoryLearnings(context);
    return ok(200, { ok: true, context, markdown, learnings });
  }

  private async handleThreadUpdateContext(
    harness: string,
    threadId: string,
    body: ThreadContextUpdateBody | undefined,
  ): Promise<GatewayResponse> {
    if (!body || typeof body !== 'object') {
      return err(400, 'Request body is required for thread context update');
    }

    let current = await this.getOrLoadThreadContext(harness, threadId);

    if (body.importPacket && typeof body.importPacket === 'object') {
      const { harness: sourceHarness, rawText } = body.importPacket;
      if (typeof sourceHarness !== 'string' || typeof rawText !== 'string') {
        return err(400, 'importPacket requires harness and rawText strings');
      }
      const imported = importHarnessMemoryPacket(sourceHarness, rawText, {
        sessionId: threadId,
      });
      for (const sectionKey of Object.keys(imported.document.sections) as Array<
        keyof typeof imported.document.sections
      >) {
        const items = imported.document.sections[sectionKey];
        if (items.length > 0) {
          current = upsertThreadContextSection(current, sectionKey, items, 'append');
        }
      }
    } else if (body.sectionKey && Array.isArray(body.items)) {
      current = upsertThreadContextSection(
        current,
        body.sectionKey,
        body.items.map(String),
        body.mode ?? 'append',
      );
    } else {
      return err(400, 'Provide either { sectionKey, items, mode? } or { importPacket }');
    }

    const markdown = await this.persistThreadContext(harness, threadId, current);
    const learnings = extractTrajectoryLearnings(current);
    return ok(200, { ok: true, context: current, markdown, learnings });
  }

  private async handleThreadPromoteLearnings(
    harness: string,
    threadId: string,
    body: ThreadPromoteLearningsBody | undefined,
  ): Promise<GatewayResponse> {
    const context = await this.getOrLoadThreadContext(harness, threadId);
    const allLearnings = extractTrajectoryLearnings(context);
    const filterIds =
      body && Array.isArray(body.learningIds) && body.learningIds.length > 0
        ? new Set(body.learningIds.map(String))
        : null;
    const selected = filterIds
      ? allLearnings.filter((l) => filterIds.has(l.id))
      : allLearnings;

    const entries = [];
    const reviewerSource = body?.source ?? `${harness}:${threadId}`;
    for (const learning of selected) {
      const record = buildVaultPromotionRecord(learning, reviewerSource);
      if (!record || !record.content) continue;
      const entry = this.vault.rememberInVault(
        record.content,
        record.vault,
        record.tags,
        record.confidence,
        record.reviewerId,
      );
      entries.push({ learningId: learning.id, vault: record.vault, entry });
    }

    return ok(200, { ok: true, promotedCount: entries.length, entries });
  }
}

// ── Privacy helpers (defense-in-depth tag filter) ───────────

function extractTags(result: VaultSearchResult): string[] {
  const tags = result.entry?.tags;
  return Array.isArray(tags) ? tags.map(String) : [];
}

function isPrivateTagged(tags: string[]): boolean {
  return tags.some((t) => {
    const tag = t.toLowerCase();
    return tag === 'private' || tag.startsWith('privacy:');
  });
}
