import { createMcpHandler } from "agents/mcp/server";
import {
  authenticateAccessRequest,
  AuthorizationError,
  authorizationResponse,
  type AccessEnv,
} from "./auth.js";
import { createStarlightServer } from "./mcp.js";
import { StarlightStore } from "./store.js";
import { SupabaseWorkspaceAdapter } from "./store-supabase.js";

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
      return json({ status: "ok", service: "starlight-intelligence", version: "0.2.0" });
    }
    if (url.pathname !== "/mcp") return json({ error: "not_found" }, 404);

    try {
      const actor = await authenticateAccessRequest(request, env);
      const adapter = SupabaseWorkspaceAdapter.fromCredentials({
        url: env.SUPABASE_URL,
        secretKey: env.SUPABASE_SECRET_KEY,
        tenantSlug: env.STARLIGHT_TENANT_SLUG,
      });
      const store = new StarlightStore({ adapter });
      const endpointHost = url.hostname;
      const handler = createMcpHandler(() => createStarlightServer({ store, actor }), {
        route: "/mcp",
        legacy: "stateless",
        allowedHostnames: Array.from(new Set([endpointHost, env.STARLIGHT_MCP_HOST])),
        allowedOriginHostnames: [
          "chatgpt.com",
          "chat.openai.com",
          "platform.openai.com",
          env.STARLIGHT_MCP_HOST,
          "localhost",
        ],
        corsOptions: { origin: "*" },
        onerror(error) {
          console.error("Starlight MCP request failed", {
            name: error.name,
            message: error.message,
            requestId: request.headers.get("cf-ray") ?? crypto.randomUUID(),
          });
        },
      });
      return handler(request, env, ctx);
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
