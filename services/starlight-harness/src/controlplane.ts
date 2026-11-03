// The harness is just another worker on the control plane: it claims, heartbeats, completes and
// releases over the same authenticated API every agent uses, through a service binding.

import type { ClaimedTask } from './policy.ts';

export interface Fetcher {
  fetch(input: string, init?: RequestInit): Promise<Response>;
}

export interface Claim {
  task: ClaimedTask;
  fence: string;
  expiresAt: number;
}

export class ControlPlaneError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class ControlPlane {
  private service: Fetcher;
  private token: string;

  constructor(service: Fetcher, token: string) {
    this.service = service;
    this.token = token;
  }

  private async call(method: string, path: string, body?: unknown): Promise<any> {
    const res = await this.service.fetch(`https://control-plane.internal${path}`, {
      method,
      headers: { authorization: `Bearer ${this.token}`, ...(body ? { 'content-type': 'application/json' } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({})) as Record<string, unknown>;
    if (!res.ok) throw new ControlPlaneError(res.status, String(data.error ?? `control plane answered ${res.status}`));
    return data;
  }

  async claim(kinds: string[]): Promise<Claim | null> {
    const r = await this.call('POST', '/v1/tasks/claim', { kinds });
    return r.task ? { task: r.task, fence: r.fence, expiresAt: r.expiresAt } : null;
  }

  // Leases held by one agent, read from the queue itself so the harness keeps no counter of its own.
  async leasesHeldBy(agentId: string): Promise<number> {
    const r = await this.call('GET', '/v1/status');
    return (r.leases as { agent_id: string }[]).filter((l) => l.agent_id === agentId).length;
  }

  heartbeat(id: string, fence: string) {
    return this.call('POST', `/v1/tasks/${encodeURIComponent(id)}/heartbeat`, { fence });
  }

  complete(id: string, fence: string, resultRef: string) {
    return this.call('POST', `/v1/tasks/${encodeURIComponent(id)}/complete`, { fence, resultRef });
  }

  release(id: string, fence: string, reason: string) {
    return this.call('POST', `/v1/tasks/${encodeURIComponent(id)}/release`, { fence, reason: reason.slice(0, 500) });
  }
}
