import test from "node:test";
import * as assert from "node:assert/strict";
import { buildSanitizedEnvironment, validateWorkingDirectory } from "../src/acp/client.js";

test("buildSanitizedEnvironment strips ambient provider credentials", () => {
  // Simulate ambient dirty environment
  process.env.OPENAI_API_KEY = "sk-fake-ambient-key";
  process.env.ANTHROPIC_API_KEY = "sk-ant-fake-ambient-key";
  process.env.GH_TOKEN = "ghp_fake_ambient_token";

  const cleanEnv = buildSanitizedEnvironment({
    scopedCredentials: {
      OPENAI_API_KEY: "sk-scoped-injected-key",
    },
    extraEnv: {
      UNAUTHORIZED_SECRET_KEY: "should-be-stripped",
      SAFE_APP_FLAG: "true",
    },
  });

  // Ambient keys not scoped must not appear
  assert.equal(cleanEnv.ANTHROPIC_API_KEY, undefined);
  assert.equal(cleanEnv.GH_TOKEN, undefined);

  // Scoped keys must match explicit argument
  assert.equal(cleanEnv.OPENAI_API_KEY, "sk-scoped-injected-key");

  // Sensitive-named extraEnv must be filtered
  assert.equal(cleanEnv.UNAUTHORIZED_SECRET_KEY, undefined);
  assert.equal(cleanEnv.SAFE_APP_FLAG, "true");
  assert.equal(cleanEnv.STARLIGHT_OPERATOR_CONTAINED, "1");
});

test("validateWorkingDirectory enforces allowed roots", () => {
  const allowed = [process.cwd()];

  // Current dir should succeed
  const validPath = validateWorkingDirectory(process.cwd(), allowed);
  assert.ok(validPath);

  // Relative traversal escaping root should throw
  assert.throws(() => {
    validateWorkingDirectory("../../../windows/system32", allowed);
  });
});
