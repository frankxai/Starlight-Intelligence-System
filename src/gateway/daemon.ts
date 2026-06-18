/**
 * src/gateway/daemon.ts — HTTP daemon for SIS Memory Gateway.
 *
 * - Binds to 127.0.0.1 on an ephemeral port (or configured port)
 * - Generates a random bearer token at startup
 * - Writes port + pid + token to <storageRoot>/gateway.json and
 *   <storageRoot>/gateway.token (600 permissions where supported)
 * - Spawn guard via lock directory — two daemons cannot start
 * - Rejects all requests without the correct Authorization: Bearer <token>
 * - Clean shutdown on SIGINT / SIGTERM
 *
 * Built on SIP — operational tier (memory gateway v0.1)
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  chmodSync,
} from 'node:fs';
import { join } from 'node:path';
import { SisGatewayCore } from './server.js';
import type { GatewayRequest } from './protocol.js';

// ── Types ────────────────────────────────────────────────────

export interface DaemonOptions {
  /** Root directory for storage. Defaults to process.cwd(). */
  storageRoot?: string;
  /** Port to bind. 0 = OS-assigned ephemeral. Default: 0. */
  port?: number;
  /** Bind address. Default: '127.0.0.1'. */
  host?: string;
}

export interface DaemonInfo {
  port: number;
  pid: number;
  host: string;
  startedAt: string;
}

// ── Constants ────────────────────────────────────────────────

const SPAWN_LOCK_NAME = 'gateway-spawn.lock';
const GATEWAY_JSON = 'gateway.json';
const GATEWAY_TOKEN = 'gateway.token';

// ── HTTP helpers ─────────────────────────────────────────────

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', chunk => chunks.push(chunk as Buffer));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

// ── SIS Gateway Daemon ───────────────────────────────────────

export class SisGatewayDaemon {
  private readonly storageRoot: string;
  private readonly core: SisGatewayCore;
  private token: string = '';
  private spawnLockPath: string;
  private spawnLockAcquired = false;
  private server: import('node:http').Server | null = null;

  constructor(opts: DaemonOptions = {}) {
    this.storageRoot = opts.storageRoot ?? process.cwd();
    this.core = new SisGatewayCore({ storageRoot: this.storageRoot });
    this.spawnLockPath = join(this.storageRoot, SPAWN_LOCK_NAME);
  }

  /**
   * Start the HTTP daemon.
   * Returns the bound port. Throws if the spawn-guard lock is already held.
   */
  async start(opts: DaemonOptions = {}): Promise<number> {
    // Acquire spawn guard
    const lockPath = this.spawnLockPath;
    try {
      mkdirSync(lockPath);
      this.spawnLockAcquired = true;
    } catch {
      throw new Error(
        `SIS gateway daemon already running (spawn guard at ${lockPath}). ` +
        'Use the existing daemon or stop it first.'
      );
    }

    // Generate token
    this.token = randomBytes(32).toString('hex');

    // Write token file
    if (!existsSync(this.storageRoot)) {
      mkdirSync(this.storageRoot, { recursive: true });
    }
    const tokenFile = join(this.storageRoot, GATEWAY_TOKEN);
    writeFileSync(tokenFile, this.token, 'utf-8');
    try { chmodSync(tokenFile, 0o600); } catch { /* ignore on Windows */ }

    // Create HTTP server
    const host = opts.host ?? '127.0.0.1';
    const desiredPort = opts.port ?? 0;

    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      // Auth check
      const authHeader = req.headers['authorization'] ?? '';
      const expectedAuth = `Bearer ${this.token}`;
      if (authHeader !== expectedAuth) {
        sendJson(res, 401, { ok: false, error: 'Unauthorized' });
        return;
      }

      // Parse request
      const method = (req.method ?? 'GET').toUpperCase() as GatewayRequest['method'];
      const fullUrl = req.url ?? '/';
      const [pathPart, queryPart] = fullUrl.split('?', 2) as [string, string | undefined];
      const query: Record<string, string> = {};
      if (queryPart) {
        for (const pair of queryPart.split('&')) {
          const [k, v] = pair.split('=', 2);
          if (k) query[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
        }
      }

      let body: unknown = undefined;
      if (method === 'POST' || method === 'DELETE') {
        try {
          const raw = await readBody(req);
          if (raw.trim()) body = JSON.parse(raw);
        } catch {
          sendJson(res, 400, { ok: false, error: 'Invalid JSON body' });
          return;
        }
      }

      const gatewayReq: GatewayRequest = {
        method,
        path: pathPart,
        query,
        body,
        auth: { harness: 'http', includePrivate: false },
      };

      const response = await this.core.handle(gatewayReq);
      sendJson(res, response.status, response.ok ? response.body : { ok: false, error: response.error });
    });

    await new Promise<void>((resolve, reject) => {
      server.on('error', reject);
      server.listen(desiredPort, host, () => resolve());
    });

    const addr = server.address();
    const port = typeof addr === 'object' && addr ? addr.port : desiredPort;

    // Save server reference for stop()
    this.server = server;

    // Write gateway.json
    const info: DaemonInfo = {
      port,
      pid: process.pid,
      host,
      startedAt: new Date().toISOString(),
    };
    writeFileSync(join(this.storageRoot, GATEWAY_JSON), JSON.stringify(info, null, 2), 'utf-8');

    // GC interval (10 minutes) if --expose-gc was passed
    if (typeof (global as any).gc === 'function') {
      setInterval(() => {
        try {
          (global as any).gc();
        } catch { /* ignore */ }
      }, 10 * 60 * 1000).unref();
    }

    // Register shutdown handlers
    const shutdown = () => {
      this.stop().finally(() => process.exit(0));
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);

    return port;
  }

  /**
   * Gracefully stop the HTTP server and release the spawn lock.
   * Resolves when the server has closed.
   */
  stop(): Promise<void> {
    return new Promise((resolve) => {
      this.releaseSpawnLock();
      if (!this.server) { resolve(); return; }
      this.server.close(() => {
        this.server = null;
        resolve();
      });
    });
  }

  private releaseSpawnLock(): void {
    if (this.spawnLockAcquired) {
      try { rmSync(this.spawnLockPath, { recursive: true, force: true }); } catch { /* ignore */ }
      this.spawnLockAcquired = false;
    }
  }
}

// ── CLI entry-point ──────────────────────────────────────────

// When executed directly: node dist/gateway/daemon.js [storageRoot] [port]
const isMain =
  process.argv[1]?.endsWith('daemon.js') ||
  process.argv[1]?.endsWith('daemon.ts');

if (isMain) {
  const storageRoot = process.argv[2] ?? process.cwd();
  const port = process.argv[3] ? parseInt(process.argv[3], 10) : 0;
  const daemon = new SisGatewayDaemon({ storageRoot });
  daemon.start({ port }).then(boundPort => {
    process.stdout.write(`SIS gateway listening on 127.0.0.1:${boundPort}\n`);
  }).catch(e => {
    process.stderr.write(String(e) + '\n');
    process.exit(1);
  });
}
