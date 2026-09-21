import assert from "node:assert/strict";
import test from "node:test";
import { authenticateAccessRequest, AuthorizationError, type AccessEnv } from "./auth.js";

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
