import { DurableObject } from 'cloudflare:workers';
import { enqueue, migrate, sweep, QueueError, SYSTEM_PRODUCER, type Identity, type Sql } from './core.ts';
import { makerFromBranch, parseRouting, recurringTasks, type Action } from './events.ts';
import { GithubApp, type GithubApi } from './github.ts';
import { handleRequest, type HandlerEnv, type Op, type QueueStub } from './handler.ts';
import { execute } from './ops.ts';
import { drain, drainLocal, ingest, migrateOutbox, nextDue } from './outbox.ts';
import { d1Store, nullStore, runReview, type AiBinding, type ReviewEnv, type ReviewMessage } from './review.ts';

interface Env extends HandlerEnv, ReviewEnv {
  CONTROL_PLANE: DurableObjectNamespace<ControlPlane>;
  // Workers AI, called through AI Gateway "starlight-review" (STARLIGHT_REVIEW_GATEWAY).
  AI?: AiBinding;
  // Queue producer and consumer for cf-review runs (docs/control-plane/DEPLOY.md).
  REVIEW_QUEUE?: Queue<ReviewMessage>;
  GITHUB_APP_ID?: string;
  // PKCS#8 PEM of the App's private key (see src/github.ts for the one-line conversion).
  GITHUB_APP_PRIVATE_KEY?: string;
}

// The whole estate shares one queue so leases, path collisions and maker != checker are decided
// in one serialized place. One object comfortably covers a few hundred tasks a day.
const QUEUE_NAME = 'estate';
const RECURRING_CRON = '0 6 * * *';

export class ControlPlane extends DurableObject<Env> {
  private sql: Sql;
  private github: GithubApi | null;
  private draining = false;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    const storage = ctx.storage;
    this.sql = {
      exec: (query, ...binds) => storage.sql.exec(query, ...binds).toArray() as Record<string, unknown>[],
      transaction: (fn) => storage.transactionSync(fn),
    };
    this.github = env.GITHUB_APP_ID && env.GITHUB_APP_PRIVATE_KEY
      ? new GithubApp(env.GITHUB_APP_ID, env.GITHUB_APP_PRIVATE_KEY)
      : null;
    ctx.blockConcurrencyWhile(async () => {
      migrate(this.sql);
      migrateOutbox(this.sql);
    });
  }

  async run(op: Op, who: Identity, args: Record<string, unknown>) {
    const result = execute(this.sql, op, who, args, Date.now(), () => crypto.randomUUID());
    this.armAlarm();
    return result;
  }

  async ingest(delivery: string, actions: Action[]) {
    const result = ingest(this.sql, delivery, actions, Date.now(), () => crypto.randomUUID());
    if (!result.duplicate) this.ctx.waitUntil(this.drainOutbox());
    this.armAlarm();
    return result;
  }

  async daily() {
    const routing = parseRouting(this.env.ROUTING);
    if (!routing) return { enqueued: 0 };
    let enqueued = 0;
    for (const task of recurringTasks(routing, Date.now())) {
      try {
        if (!enqueue(this.sql, SYSTEM_PRODUCER, task, Date.now(), () => crypto.randomUUID()).duplicate) enqueued++;
      } catch (err) {
        if (!(err instanceof QueueError)) throw err;
        console.warn('recurring task refused', { id: task.id, reason: err.message });
      }
    }
    return { enqueued };
  }

  async drainOutbox() {
    const routing = parseRouting(this.env.ROUTING);
    if (this.draining) return { skipped: true };
    // Without App credentials or routing, remote rows simply wait; nothing is lost or half-done.
    if (!this.github || !routing) return { done: drainLocal(this.sql, Date.now(), () => crypto.randomUUID()).length, remote: 'waiting' };
    this.draining = true;
    try {
      return await drain(this.sql, this.github, routing, Date.now(), () => crypto.randomUUID(), 10, { reviewQueue: this.env.REVIEW_QUEUE });
    } finally {
      this.draining = false;
      this.armAlarm();
    }
  }

  async alarm() {
    sweep(this.sql, Date.now());
    await this.drainOutbox();
    this.armAlarm();
  }

  // Alarms do not repeat, and each wake costs money: arm exactly one, for whichever comes first,
  // the next lease expiry or the next outbox retry. Read and written with no await in between.
  private armAlarm() {
    const lease = this.sql.exec('SELECT MIN(expires_at) AS next FROM leases')[0]?.next;
    // Remote rows are due only when drainOutbox could send them: credentials and valid routing.
    const due = nextDue(this.sql, this.github !== null && parseRouting(this.env.ROUTING) !== null);
    const times = [lease, due].filter((t): t is number => typeof t === 'number');
    if (times.length) void this.ctx.storage.setAlarm(Math.min(...times));
    else void this.ctx.storage.deleteAlarm();
  }
}

function queue(env: Env) {
  return env.CONTROL_PLANE.get(env.CONTROL_PLANE.idFromName(QUEUE_NAME));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const object = queue(env);
    const stub: QueueStub = {
      run: (op, who, args) => object.run(op, who, args),
      ingest: (delivery, actions) => object.ingest(delivery, actions),
    };
    return handleRequest(request, env, stub);
  },
  // Every 10 minutes is a safety net for the outbox (the alarm normally drains it); once a day
  // the recurring research and health tasks are enqueued.
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    const object = queue(env);
    ctx.waitUntil(event.cron === RECURRING_CRON ? object.daily() : object.drainOutbox());
  },
  // cf-review runs here, not in the Durable Object: a review takes minutes and must not hold up the
  // outbox. A GitHub error throws and the message is retried; model errors are block verdicts.
  async queue(batch: MessageBatch<ReviewMessage>, env: Env): Promise<void> {
    if (!env.AI || !env.GITHUB_APP_ID || !env.GITHUB_APP_PRIVATE_KEY) {
      console.error('cf-review: AI binding or GitHub App credentials missing; retrying later');
      batch.retryAll({ delaySeconds: 300 });
      return;
    }
    const github = new GithubApp(env.GITHUB_APP_ID, env.GITHUB_APP_PRIVATE_KEY);
    const store = env.REVIEWS_DB ? d1Store(env.REVIEWS_DB) : nullStore;
    for (const message of batch.messages) {
      try {
        const result = await runReview(message.body, {
          ai: env.AI, github, store, env, makerProvider: makerFromBranch(message.body.branch)?.provider ?? null,
        });
        console.log('cf-review', { pr: `${message.body.owner}/${message.body.repo}#${message.body.number}`, sha: message.body.sha, ...('body' in result ? { ...result, body: undefined } : result) });
        message.ack();
      } catch (err) {
        console.error('cf-review failed; will retry', { sha: message.body?.sha, error: String((err as Error)?.message ?? err).slice(0, 300) });
        message.retry({ delaySeconds: 60 });
      }
    }
  },
} satisfies ExportedHandler<Env, ReviewMessage>;
