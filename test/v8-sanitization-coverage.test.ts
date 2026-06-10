/**
 * v8.0 SanitizationGateway coverage contract test.
 *
 * Asserts:
 *  1. Every pattern documented in docs/v8/SANITIZATION-COVERAGE.md as "Covered"
 *     is actually scrubbed by the gateway.
 *  2. Every pattern documented as "Known-NOT-covered" is genuinely NOT scrubbed,
 *     so coverage drift (e.g. someone deletes a regex without updating docs) is
 *     caught loudly rather than silently regressing trust.
 *
 * Board: REVISE-A.2 (2026-05-11)
 *
 * Test fixtures use low-entropy synthetic strings (e.g. "aaaa…", "1234…") that
 * match our scrubbing regex but do not trip GitHub secret-scanning's high-entropy
 * detectors. Real-looking high-entropy strings get blocked at push time, even in
 * test files. The regex doesn't care about entropy — only shape.
 *
 * For prefixes that secret-scanning recognizes by shape alone (Stripe sk_live_,
 * Anthropic sk-ant-, GitHub ghp_ / github_pat_), the prefix is built piecewise
 * from concatenated string fragments so the contiguous literal never appears
 * in source.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { SanitizationGateway } from "../src/sanitization.js";

const MASK = "[REDACTED]";

function expectScrubbed(label: string, input: string): void {
  const g = new SanitizationGateway({ maskString: MASK });
  const out = g.sanitize(input);
  assert.notStrictEqual(out, input, `[${label}] should have been scrubbed but wasn't:\n  in:  ${input}\n  out: ${out}`);
  assert.ok(out.includes(MASK), `[${label}] expected mask token in output: ${out}`);
}

function expectUntouched(label: string, input: string): void {
  const g = new SanitizationGateway({ maskString: MASK });
  const out = g.sanitize(input);
  assert.strictEqual(out, input, `[${label}] is documented as NOT covered but was scrubbed — update docs or remove pattern:\n  in:  ${input}\n  out: ${out}`);
}

// ── Covered patterns ─────────────────────────────────────────────

test("v8 sanitization: OpenAI-style keys are scrubbed", () => {
  // sk- + 48 chars
  expectScrubbed("openai", "key=sk-" + "a".repeat(48));
});

test("v8 sanitization: Slack tokens are scrubbed", () => {
  // xoxb- + 10–48 chars
  expectScrubbed("slack-xoxb", "token=xoxb-" + "1".repeat(24));
});

test("v8 sanitization: GitHub PAT tokens are scrubbed", () => {
  // github_pat_ + 36 chars. Prefix split to avoid source-scan trip.
  const ghPatPrefix = "github" + "_" + "pat" + "_";
  expectScrubbed("github-pat", "auth: " + ghPatPrefix + "z".repeat(36));
});

test("v8 sanitization: GitHub ghp tokens are scrubbed", () => {
  // ghp_ + 36 chars. Prefix split to avoid source-scan trip.
  const ghpPrefix = "ghp" + "_";
  expectScrubbed("ghp", "auth: " + ghpPrefix + "z".repeat(36));
});

test("v8 sanitization: Google API keys are scrubbed", () => {
  // AIza + 35 chars
  expectScrubbed("google", "key=AIza" + "z".repeat(35));
});

test("v8 sanitization: JWTs are scrubbed", () => {
  expectScrubbed(
    "jwt",
    "Authorization: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.x9C8sM4xZQ"
  );
});

test("v8 sanitization: Bearer tokens are scrubbed", () => {
  expectScrubbed("bearer", "Authorization: Bearer abc.def-ghi_jkl~mno");
});

test("v8 sanitization: JSON password fields are scrubbed", () => {
  expectScrubbed("json-password", '{"password": "hunter2"}');
});

test("v8 sanitization: JSON private_key fields are scrubbed", () => {
  expectScrubbed("json-private-key", '{"private_key": "-----BEGIN-----"}');
});

test("v8 sanitization: emails are scrubbed", () => {
  expectScrubbed("email", "Contact sample.operator@example.com for details.");
});

test("v8 sanitization: phone numbers are scrubbed (US)", () => {
  expectScrubbed("phone-us", "Call (415) 555-1234 today");
});

test("v8 sanitization: phone numbers are scrubbed (intl)", () => {
  expectScrubbed("phone-intl", "Reach me at +31 612 345 6789 anytime");
});

test("v8 sanitization: US SSN is scrubbed", () => {
  expectScrubbed("ssn-us", "SSN: 123-45-6789");
});

// ── Known-NOT-covered patterns (coverage-drift guards) ───────────

test("v8 sanitization: Stripe live keys are NOT covered (documented gap)", () => {
  // Prefix built piecewise so the contiguous literal never appears in source.
  // Also avoids 10-digit substrings (phone-regex false positive per docs).
  const stripePrefix = "sk" + "_" + "live" + "_";
  expectUntouched("stripe-live", "key=" + stripePrefix + "a".repeat(40));
});

test("v8 sanitization: AWS access keys are NOT covered (documented gap)", () => {
  // AKIA + repeated low-entropy chars.
  expectUntouched("aws-access", "aws_access_key_id=AKIA" + "Z".repeat(16));
});

test("v8 sanitization: Anthropic sk-ant keys are NOT covered (documented gap)", () => {
  // Prefix split to avoid Anthropic-prefix secret scanner.
  const antPrefix = "sk" + "-" + "ant" + "-" + "api03_";
  expectUntouched("sk-ant", "ANTHROPIC_API_KEY=" + antPrefix + "a".repeat(40));
});

test("v8 sanitization: HuggingFace hf_ tokens are NOT covered (documented gap)", () => {
  expectUntouched("hf", "HF_TOKEN=hf_" + "a".repeat(34));
});

test("v8 sanitization: Postgres URIs are NOT covered (documented gap)", () => {
  // Fixture avoids `user@host` (email-regex false positive on user:secret@host pattern).
  expectUntouched(
    "postgres-uri",
    "DATABASE_URL=postgres://localhost:5432/myapp"
  );
});

test("v8 sanitization: SSH private key blocks are NOT covered (documented gap)", () => {
  expectUntouched(
    "ssh-key",
    "-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNz...\n-----END OPENSSH PRIVATE KEY-----"
  );
});

test("v8 sanitization: IBAN is NOT covered (documented gap)", () => {
  expectUntouched("iban", "Account: NL91 ABNA 0417 1643 00");
});

test("v8 sanitization: personal names are NOT covered (documented gap)", () => {
  expectUntouched("name", "Meeting with Frank Riemer tomorrow at 10am.");
});

test("v8 sanitization: physical addresses are NOT covered (documented gap)", () => {
  expectUntouched(
    "address",
    "Ship to: Herengracht 123, 1015 BG Amsterdam, Netherlands"
  );
});

// ── Sanity: mask string is configurable ──────────────────────────

test("v8 sanitization: custom mask string is applied", () => {
  const g = new SanitizationGateway({ maskString: "<<<HIDDEN>>>" });
  const out = g.sanitize("email me at user@example.com");
  assert.ok(out.includes("<<<HIDDEN>>>"));
  assert.ok(!out.includes("user@example.com"));
});

// ── Sanity: deep context sanitize ────────────────────────────────

test("v8 sanitization: nested objects are deep-sanitized", () => {
  const g = new SanitizationGateway({ maskString: MASK });
  const result = g.sanitizeContext({
    email: "x@y.com",
    nested: { token: "sk-" + "a".repeat(48) },
    safe: 42,
  });
  assert.notStrictEqual((result as { email: string }).email, "x@y.com");
  assert.notStrictEqual(
    ((result as { nested: { token: string } }).nested).token,
    "sk-" + "a".repeat(48)
  );
  assert.strictEqual((result as { safe: number }).safe, 42);
});
