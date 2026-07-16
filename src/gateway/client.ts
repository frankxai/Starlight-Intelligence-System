/**
 * src/gateway/client.ts — GatewayTransport interface + InProcess/Http transports
 * and SisMemoryClient convenience wrapper.
 *
 * Transport options:
 *   InProcessTransport — wraps SisGatewayCore directly (zero network overhead,
 *     ideal for tests and in-process use)
 *   HttpTransport — reads gateway.json + gateway.token; optionally auto-spawns
 *     the daemon when ECONNREFUSED and autoSpawn is true
 *
 * Built on SIP — operational tier (memory gateway v0.1)
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { request as httpRequest } from 'node:http';
import { SisGatewayCore } from './server.js';
import type { GatewayRequest, GatewayResponse } from './protocol.js';
import type { VaultType } from '../types.js';
import type { SessionItem } from '../session-store.js';

// ── Transport interface ──────────────────────────────────────

export interface GatewayTransport {
  request(req: GatewayRequest): Promise<GatewayResponse>;
}

// ── InProcessTransport ───────────────────────────────────────

/**
 * Wraps SisGatewayCore for in-process use. Zero network overhead.
 * Ideal for tests.
 */
export class InProcessTransport implements GatewayTransport {
  private readonly core: SisGatewayCore;

  constructor(core: SisGatewayCore) {
    this.core = core;
  }

  async request(req: GatewayRequest): Promise<GatewayResponse> {
    // Enforce auth context for in-process: external harnesses always get
    // includePrivate = false
    const secureReq: GatewayRequest = {
      ...req,
      auth: { harness: req.auth?.harness ?? 'inprocess', includePrivate: false },
    };
    return this.core.handle(secureReq);
  }
}

// ── HttpTransport ─────────────────────────────────────────────

export interface HttpTransportOptions {
  /**
   * Root directory where gateway.json and gateway.token live.
   * Defaults to process.cwd().
   */
  storageRoot?: string;
  /**
   * If true, spawn the daemon automatically when ECONNREFUSED.
   * The daemon is spawned detached so it outlives the client process.
   * Default: false.
   */
  autoSpawn?: boolean;
  /**
   * Harness identifier (used for session namespace).
   * Default: 'http-client'
   */
  harness?: string;
  /** Request timeout in milliseconds. Default: 10_000. */
  timeoutMs?: number;
}

interface GatewayJson {
  port: number;
  host: string;
  pid: number;
}

export class HttpTransport implements GatewayTransport {
  private readonly storageRoot: string;
  private readonly autoSpawn: boolean;
  private readonly harness: string;
  private readonly timeoutMs: number;

  constructor(opts: HttpTransportOptions = {}) {
    this.storageRoot = opts.storageRoot ?? process.cwd();
    this.autoSpawn = opts.autoSpawn ?? false;
    this.harness = opts.harness ?? 'http-client';
    this.timeoutMs = opts.timeoutMs ?? 10_000;
  }

  async request(req: GatewayRequest): Promise<GatewayResponse> {
    const { port, host, token } = await this.readGatewayInfo();
    const secureReq: GatewayRequest = {
      ...req,
      auth: { harness: this.harness, includePrivate: false },
    };

    try {
      return await this.sendHttp(host, port, token, secureReq);
    } catch (e: unknown) {
      const isConnRefused =
        e instanceof Error &&
        (e.message.includes('ECONNREFUSED') || (e as NodeJS.ErrnoException).code === 'ECONNREFUSED');

      if (isConnRefused && this.autoSpawn) {
        await this.spawnDaemon();
        // Re-read gateway info after spawn
        const info2 = await this.readGatewayInfo();
        return this.sendHttp(info2.host, info2.port, info2.token, secureReq);
      }
      throw e;
    }
  }

  private readGatewayInfo(): Promise<{ port: number; host: string; token: string }> {
    const jsonFile = join(this.storageRoot, 'gateway.json');
    const tokenFile = join(this.storageRoot, 'gateway.token');

    if (!existsSync(jsonFile) || !existsSync(tokenFile)) {
      if (!this.autoSpawn) {
        return Promise.reject(
          new Error(
            `SIS gateway not running (no gateway.json at ${this.storageRoot}). ` +
            'Start the daemon or pass autoSpawn: true.'
          )
        );
      }
      return this.spawnDaemon().then(() => this.readGatewayInfo());
    }

    const info = JSON.parse(readFileSync(jsonFile, 'utf-8')) as GatewayJson;
    const token = readFileSync(tokenFile, 'utf-8').trim();
    return Promise.resolve({ port: info.port, host: info.host, token });
  }

  private sendHttp(
    host: string,
    port: number,
    token: string,
    req: GatewayRequest,
  ): Promise<GatewayResponse> {
    return new Promise((resolve, reject) => {
      let url = req.path;
      if (req.query && Object.keys(req.query).length > 0) {
        const qs = new URLSearchParams(req.query).toString();
        url = `${url}?${qs}`;
      }

      const body = req.body != null ? JSON.stringify(req.body) : '';
      const options = {
        hostname: host,
        port,
        path: url,
        method: req.method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-SIS-Harness': this.harness,
          ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
        },
      };

      const httpReq = httpRequest(options, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', chunk => chunks.push(chunk as Buffer));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf-8');
          let parsed: unknown;
          try { parsed = JSON.parse(raw); } catch { parsed = { ok: false, error: raw }; }
          const status = res.statusCode ?? 500;
          if (status >= 200 && status < 300) {
            resolve({ ok: true, status, body: parsed });
          } else {
            const errMsg = (parsed as { error?: string })?.error ?? raw;
            resolve({ ok: false, status, error: errMsg });
          }
        });
        res.on('error', reject);
      });

      httpReq.setTimeout(this.timeoutMs, () => {
        httpReq.destroy(new Error(`Gateway request timed out after ${this.timeoutMs}ms`));
      });
      httpReq.on('error', reject);

      if (body) httpReq.write(body);
      httpReq.end();
    });
  }

  private spawnDaemon(): Promise<void> {
    return new Promise((resolve) => {
      // Locate the daemon entry point
      const daemonScript = join(
        new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'),
        'gateway', 'daemon.js'
      );

      const child = spawn(process.execPath, [daemonScript, this.storageRoot], {
        detached: true,
        stdio: 'ignore',
      });
      child.unref();

      // Give the daemon a moment to write gateway.json
      setTimeout(resolve, 600);
    });
  }
}

// ── SisMemoryClient ───────────────────────────────────────────

/**
 * High-level convenience client. Wraps a transport with typed methods
 * matching the API v1 route table.
 */
export class SisMemoryClient {
  private readonly transport: GatewayTransport;
  private readonly harness: string;

  constructor(transport: GatewayTransport, harness = 'default') {
    this.transport = transport;
    this.harness = harness;
  }

  async health(): Promise<{ status: string }> {
    const res = await this.transport.request({ method: 'GET', path: '/v1/memory/health' });
    if (!res.ok) throw new Error(res.error);
    return res.body as { status: string };
  }

  async addMemory(params: {
    content: string;
    vault?: VaultType;
    tags?: string[];
    confidence?: number;
    source?: string;
  }): Promise<unknown> {
    const res = await this.transport.request({
      method: 'POST',
      path: '/v1/memory/add',
      body: params,
      auth: { harness: this.harness, includePrivate: false },
    });
    if (!res.ok) throw new Error(res.error);
    return res.body;
  }

  async searchMemory(params: {
    query: string;
    vaults?: VaultType[];
    limit?: number;
    retrieval_mode?: 'hybrid' | 'lexical';
  }): Promise<unknown> {
    const res = await this.transport.request({
      method: 'POST',
      path: '/v1/memory/search',
      body: params,
      auth: { harness: this.harness, includePrivate: false },
    });
    if (!res.ok) throw new Error(res.error);
    return res.body;
  }

  async getSessionItems(sessionId: string, limit?: number): Promise<SessionItem[]> {
    const query: Record<string, string> = {};
    if (limit != null) query['limit'] = String(limit);
    const res = await this.transport.request({
      method: 'GET',
      path: `/v1/sessions/${sessionId}/items`,
      query,
      auth: { harness: this.harness, includePrivate: false },
    });
    if (!res.ok) throw new Error(res.error);
    return ((res.body as { items: SessionItem[] }).items);
  }

  async addSessionItems(sessionId: string, items: SessionItem[]): Promise<void> {
    const res = await this.transport.request({
      method: 'POST',
      path: `/v1/sessions/${sessionId}/items`,
      body: { items },
      auth: { harness: this.harness, includePrivate: false },
    });
    if (!res.ok) throw new Error(res.error);
  }

  async popSessionItem(sessionId: string): Promise<boolean> {
    const res = await this.transport.request({
      method: 'POST',
      path: `/v1/sessions/${sessionId}/pop`,
      auth: { harness: this.harness, includePrivate: false },
    });
    if (!res.ok) throw new Error(res.error);
    return (res.body as { popped: boolean }).popped;
  }

  async clearSession(sessionId: string): Promise<void> {
    const res = await this.transport.request({
      method: 'DELETE',
      path: `/v1/sessions/${sessionId}`,
      auth: { harness: this.harness, includePrivate: false },
    });
    if (!res.ok) throw new Error(res.error);
  }
}
