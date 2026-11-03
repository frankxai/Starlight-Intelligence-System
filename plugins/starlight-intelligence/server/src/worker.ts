import { createMcpHandler } from "agents/mcp/server";
import {
  authenticateAccessRequest,
  AuthorizationError,
  authorizationResponse,
  resolveAllowedCorsOrigin,
  type AccessEnv,
} from "./auth.js";
import { createStarlightServer } from "./mcp.js";
import { StarlightStore } from "./store.js";
import { SupabaseWorkspaceAdapter } from "./store-supabase.js";

const MAX_MCP_BODY_BYTES = 1_048_576; // 1 MiB ceiling on JSON-RPC payloads

export interface Env extends AccessEnv {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
  STARLIGHT_TENANT_SLUG: string;
  STARLIGHT_MCP_HOST: string;
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/healthz") {
      return json({ status: "ok", service: "starlight-intelligence", version: "0.3.0" });
    }
    if (url.pathname !== "/mcp") return json({ error: "not_found" }, 404);

    const canonicalHost = env.STARLIGHT_MCP_HOST?.trim() || "mcp.starlightintelligence.ai";
    const allowedOriginHostnames = [
      "chatgpt.com",
      "chat.openai.com",
      "platform.openai.com",
      canonicalHost,
      "localhost",
    ];
    const matchedOrigin = resolveAllowedCorsOrigin(
      request.headers.get("origin"),
      allowedOriginHostnames,
    );

    if (request.method === "OPTIONS") {
      if (!matchedOrigin) {
        return json({ error: "origin_not_allowed" }, 403);
      }
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": matchedOrigin,
          "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, Cf-Access-Jwt-Assertion, Mcp-Session-Id, MCP-Protocol-Version",
          "Access-Control-Max-Age": "86400",
          Vary: "Origin",
        },
      });
    }

    const declaredLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(declaredLength) && declaredLength > MAX_MCP_BODY_BYTES) {
      return json({ error: "payload_too_large" }, 413);
    }

    try {
      const actor = await authenticateAccessRequest(request, env);
      const adapter = SupabaseWorkspaceAdapter.fromCredentials({
        url: env.SUPABASE_URL,
        secretKey: env.SUPABASE_SECRET_KEY,
        tenantSlug: env.STARLIGHT_TENANT_SLUG,
      });
      const store = new StarlightStore({ adapter });
      const endpointHost = url.hostname;
      const corsOrigin = matchedOrigin ?? `https://${canonicalHost}`;
      const handler = createMcpHandler(() => createStarlightServer({ store, actor }), {
        route: "/mcp",
        legacy: "stateless",
        allowedHostnames: Array.from(new Set([endpointHost, canonicalHost])),
        allowedOriginHostnames,
        corsOptions: { origin: corsOrigin },
        onerror(error) {
          console.error("Starlight MCP request failed", {
            name: error.name,
            message: error.message,
            requestId: request.headers.get("cf-ray") ?? crypto.randomUUID(),
          });
        },
      });
      const response = await handler(request, env, ctx);
      const headers = new Headers(response.headers);
      headers.set("Vary", "Origin");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      if (error instanceof AuthorizationError) return authorizationResponse(error);
      console.error("Starlight MCP authorization boundary failed", {
        name: error instanceof Error ? error.name : "UnknownError",
        requestId: request.headers.get("cf-ray") ?? crypto.randomUUID(),
      });
      return json({ error: "internal_error" }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
