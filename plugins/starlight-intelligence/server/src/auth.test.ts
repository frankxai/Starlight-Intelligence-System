import assert from "node:assert/strict";
import test from "node:test";
import {
  authenticateAccessRequest,
  AuthorizationError,
  authorizationResponse,
  MCP_ALLOWED_CORS_HEADERS,
  resolveAllowedCorsOrigin,
  type AccessEnv,
} from "./auth.js";

const env: AccessEnv = {
  CF_ACCESS_TEAM_DOMAIN: "example.cloudflareaccess.com",
  CF_ACCESS_AUD: "audience",
  STARLIGHT_ALLOWED_EMAILS: "founder@example.com, operator@example.com",
};

test("rejects requests without a Cloudflare Access assertion", async () => {
  await assert.rejects(
    () => authenticateAccessRequest(new Request("https://mcp.example.com/mcp"), env),
    (error: unknown) => error instanceof AuthorizationError && error.status === 401,
  );
});

test("rejects a valid identity outside the explicit allowlist", async () => {
  const request = new Request("https://mcp.example.com/mcp", {
    headers: { "Cf-Access-Jwt-Assertion": "test-token" },
  });
  await assert.rejects(
    () =>
      authenticateAccessRequest(request, env, async () => ({
        sub: "access-user-2",
        email: "unknown@example.com",
      })),
    (error: unknown) => error instanceof AuthorizationError && error.status === 403,
  );
});

test("returns a normalized actor for an allowlisted identity", async () => {
  const request = new Request("https://mcp.example.com/mcp", {
    headers: { "Cf-Access-Jwt-Assertion": "test-token" },
  });
  const actor = await authenticateAccessRequest(request, env, async () => ({
    sub: "access-user-1",
    email: "Founder@Example.com",
    name: "Founder",
  }));
  assert.deepEqual(actor, { id: "access-user-1", email: "founder@example.com", name: "Founder" });
});

test("resolveAllowedCorsOrigin reflects only allowlisted HTTPS or localhost origins and never wildcard", () => {
  const allow = ["chatgpt.com", "mcp.starlightintelligence.ai", "localhost"];
  assert.equal(resolveAllowedCorsOrigin("https://chatgpt.com", allow), "https://chatgpt.com");
  assert.equal(resolveAllowedCorsOrigin("http://localhost:8788", allow), "http://localhost:8788");
  assert.equal(resolveAllowedCorsOrigin("http://chatgpt.com", allow), null);
  assert.equal(resolveAllowedCorsOrigin("https://evil.example.com", allow), null);
  assert.equal(resolveAllowedCorsOrigin(null, allow), null);
});

test("MCP_ALLOWED_CORS_HEADERS preserves modern MCP routing headers alongside Cloudflare Access", () => {
  for (const requiredHeader of [
    "Accept",
    "Cf-Access-Jwt-Assertion",
    "Mcp-Session-Id",
    "MCP-Protocol-Version",
    "Mcp-Method",
    "Mcp-Name",
    "Last-Event-ID",
  ]) {
    assert.equal(
      MCP_ALLOWED_CORS_HEADERS.includes(requiredHeader),
      true,
      `missing preflight header ${requiredHeader}`,
    );
  }

  const corsAuthErr = authorizationResponse(
    new AuthorizationError("Cloudflare Access authentication is required."),
    "https://chatgpt.com",
  );
  assert.equal(corsAuthErr.status, 401);
  assert.equal(corsAuthErr.headers.get("Access-Control-Allow-Origin"), "https://chatgpt.com");
  assert.equal(corsAuthErr.headers.get("Vary"), "Origin");
});
