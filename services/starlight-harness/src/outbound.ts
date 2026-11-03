// Every HTTP and HTTPS request a sandbox makes lands here. The sandbox holds no credential:
// this entrypoint checks the request against src/policy.ts and adds the AI Gateway token or a
// GitHub App installation token only after the request has left the sandbox.

import { WorkerEntrypoint } from 'cloudflare:workers';
import { GithubApp } from '../../starlight-control-plane/src/github.ts';
import { decide, type OutboundContext, type SandboxScope } from './policy.ts';

export interface OutboundEnv {
  AI_GATEWAY_ACCOUNT_ID: string;
  AI_GATEWAY_ID: string;
  AI_GATEWAY_TOKEN: string;
  GITHUB_APP_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
  REPOS: string;
  ALLOW_REGISTRIES?: string;
}

const MAX_PUSH_BYTES = 100 * 1024 * 1024;
let app: GithubApp | undefined;

export function outboundContext(env: OutboundEnv): OutboundContext {
  return {
    gatewayAccount: env.AI_GATEWAY_ACCOUNT_ID,
    gatewayId: env.AI_GATEWAY_ID,
    repos: env.REPOS.split(',').map((r) => r.trim()).filter(Boolean),
    allowRegistries: env.ALLOW_REGISTRIES !== 'false',
  };
}

export class Outbound extends WorkerEntrypoint<OutboundEnv, SandboxScope> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    // A push is judged by the refs it names, so its body is read before the decision.
    let body: Uint8Array | undefined;
    if (request.method === 'POST' && url.hostname === 'github.com' && url.pathname.endsWith('/git-receive-pack')) {
      const buf = await request.arrayBuffer();
      if (buf.byteLength > MAX_PUSH_BYTES) return new Response('push too large\n', { status: 413 });
      body = new Uint8Array(buf);
    }
    const scope = (this.ctx.props as SandboxScope | undefined) ?? null;
    const verdict = decide(request.method, request.url, outboundContext(this.env), scope, body);
    if (!verdict.allow) return new Response(`${verdict.reason}\n`, { status: 403 });
    app ??= new GithubApp(this.env.GITHUB_APP_ID, this.env.GITHUB_APP_PRIVATE_KEY);

    const headers = new Headers(request.headers);
    if (verdict.add === 'ai-gateway') {
      // Claude Code sends a placeholder key; forwarding it would make the model call fail.
      headers.delete('x-api-key');
      headers.delete('authorization');
      headers.set('cf-aig-authorization', `Bearer ${this.env.AI_GATEWAY_TOKEN}`);
    } else if (verdict.add === 'github') {
      const [, owner, repo] = url.pathname.split('/');
      const token = await app.installationToken(owner, repo.replace(/\.git$/, ''));
      headers.set('authorization', `Basic ${btoa(`x-access-token:${token}`)}`);
    } else {
      headers.delete('authorization');
    }
    return fetch(new Request(request.url, {
      method: request.method, headers, redirect: 'manual',
      body: body ?? (request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body),
    }));
  }
}
