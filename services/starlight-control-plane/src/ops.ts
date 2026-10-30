// One operation in, one {status, body} out. The Durable Object and the test fake both call this,
// so the HTTP tests exercise the same code path production runs.

import * as core from './core.ts';
import type { Identity, Sql } from './core.ts';
import type { Op } from './handler.ts';

export function execute(
  sql: Sql, op: Op, who: Identity, args: Record<string, unknown>, now: number, newId: () => string,
): { status: number; body: unknown } {
  try {
    const id = args.id as string;
    switch (op) {
      case 'enqueue': {
        const r = core.enqueue(sql, who, args as unknown as core.EnqueueInput, now, newId);
        return { status: r.duplicate ? 200 : 201, body: r };
      }
      case 'approve': return { status: 200, body: core.approve(sql, who, id, now) };
      case 'claim': return { status: 200, body: core.claim(sql, who, { repo: typeof args.repo === 'string' ? args.repo : undefined }, now) };
      case 'heartbeat': return { status: 200, body: core.heartbeat(sql, who, id, now) };
      case 'complete': return { status: 200, body: core.complete(sql, who, id, args.resultRef, now) };
      case 'release': return { status: 200, body: core.release(sql, who, id, args.reason, now) };
      case 'verify': return { status: 200, body: core.verify(sql, who, id, args.verdict, args.note, now) };
      case 'get': return { status: 200, body: core.getTask(sql, id) };
      case 'status': return { status: 200, body: core.status(sql) };
    }
  } catch (err) {
    if (err instanceof core.QueueError) return { status: err.status, body: { error: err.message } };
    throw err;
  }
}
