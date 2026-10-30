import { DurableObject } from 'cloudflare:workers';
import { migrate, sweep, type Identity, type Sql } from './core.ts';
import { handleRequest, type HandlerEnv, type Op, type QueueStub } from './handler.ts';
import { execute } from './ops.ts';

interface Env extends HandlerEnv {
  CONTROL_PLANE: DurableObjectNamespace<ControlPlane>;
}

// The whole estate shares one queue so leases, path collisions and maker != checker are decided
// in one serialized place. One object comfortably covers a few hundred tasks a day.
const QUEUE_NAME = 'estate';

export class ControlPlane extends DurableObject<Env> {
  private sql: Sql;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    const storage = ctx.storage;
    this.sql = {
      exec: (query, ...binds) => storage.sql.exec(query, ...binds).toArray() as Record<string, unknown>[],
      transaction: (fn) => storage.transactionSync(fn),
    };
    ctx.blockConcurrencyWhile(async () => migrate(this.sql));
  }

  async run(op: Op, who: Identity, args: Record<string, unknown>) {
    const result = execute(this.sql, op, who, args, Date.now(), () => crypto.randomUUID());
    await this.armAlarm();
    return result;
  }

  async alarm() {
    sweep(this.sql, Date.now());
    await this.armAlarm();
  }

  // Alarms do not repeat, and each wake costs money: arm one only for the next lease expiry.
  private async armAlarm() {
    const next = this.sql.exec('SELECT MIN(expires_at) AS next FROM leases')[0]?.next;
    if (typeof next !== 'number') return;
    const current = await this.ctx.storage.getAlarm();
    if (current === null || current > next) await this.ctx.storage.setAlarm(next);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const object = env.CONTROL_PLANE.get(env.CONTROL_PLANE.idFromName(QUEUE_NAME));
    const stub: QueueStub = { run: (op, who, args) => object.run(op, who, args) };
    return handleRequest(request, env, stub);
  },
} satisfies ExportedHandler<Env>;
