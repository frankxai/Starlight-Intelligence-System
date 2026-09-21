import assert from "node:assert/strict";
import test from "node:test";

import { fetchGitHubTextFile } from "./github-content.mjs";

function encodedResponse(text, status = 200) {
  return new Response(
    JSON.stringify({ content: Buffer.from(text).toString("base64") }),
    { status, headers: { "content-type": "application/json" } },
  );
}

function recordingLogger() {
  const warnings = [];
  const errors = [];
  return {
    logger: {
      warn: (...args) => warnings.push(args),
      error: (...args) => errors.push(args),
    },
    warnings,
    errors,
  };
}

test("retries a transient transport timeout and returns decoded content", async () => {
  let calls = 0;
  const { logger, warnings, errors } = recordingLogger();
  const timeout = new TypeError("fetch failed", {
    cause: Object.assign(new Error("write ETIMEDOUT"), {
      code: "ETIMEDOUT",
      syscall: "write",
    }),
  });

  const content = await fetchGitHubTextFile("owner/repo", "vault.jsonl", {
    fetchImpl: async (_url, init) => {
      calls += 1;
      assert.equal(init.next.revalidate, 3600);
      if (calls === 1) throw timeout;
      return encodedResponse("recovered");
    },
    retryDelayMs: 0,
    logger,
  });

  assert.equal(content, "recovered");
  assert.equal(calls, 2);
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0][1].error.cause.code, "ETIMEDOUT");
  assert.equal(errors.length, 0);
});

test("aborts each hung attempt at its own deadline", async () => {
  let calls = 0;
  const signals = [];
  const { logger, warnings, errors } = recordingLogger();

  const fetchImpl = async (_url, init) => {
    calls += 1;
    signals.push(init.signal);

    return new Promise((_resolve, reject) => {
      if (init.signal.aborted) {
        reject(init.signal.reason);
        return;
      }
      init.signal.addEventListener("abort", () => reject(init.signal.reason), {
        once: true,
      });
    });
  };

  await assert.rejects(
    fetchGitHubTextFile("owner/repo", "vault.jsonl", {
      fetchImpl,
      requestTimeoutMs: 10,
      retryDelayMs: 0,
      logger,
    }),
    (error) => error instanceof Error && error.name === "TimeoutError",
  );

  assert.equal(calls, 2);
  assert.equal(signals.length, 2);
  assert.notEqual(signals[0], signals[1]);
  assert.ok(signals.every((signal) => signal.aborted));
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0][1].error.name, "TimeoutError");
  assert.equal(errors.length, 1);
  assert.equal(errors[0][1].error.name, "TimeoutError");
});

test("retries a transient GitHub 5xx response", async () => {
  let calls = 0;
  const { logger, warnings } = recordingLogger();

  const content = await fetchGitHubTextFile("owner/repo", "vault.jsonl", {
    fetchImpl: async () => {
      calls += 1;
      return calls === 1 ? new Response(null, { status: 503 }) : encodedResponse("ok");
    },
    retryDelayMs: 0,
    logger,
  });

  assert.equal(content, "ok");
  assert.equal(calls, 2);
  assert.equal(warnings.length, 1);
});

test("rethrows a persistent transport failure so ISR keeps the last good render", async () => {
  let calls = 0;
  const { logger, warnings, errors } = recordingLogger();
  const timeout = new TypeError("fetch failed", {
    cause: Object.assign(new Error("write ETIMEDOUT"), { code: "ETIMEDOUT" }),
  });

  await assert.rejects(
    fetchGitHubTextFile("owner/repo", "vault.jsonl", {
      fetchImpl: async () => {
        calls += 1;
        throw timeout;
      },
      retryDelayMs: 0,
      logger,
    }),
    timeout,
  );

  assert.equal(calls, 2);
  assert.equal(warnings.length, 1);
  assert.equal(errors.length, 1);
  assert.equal(errors[0][1].repo, "owner/repo");
  assert.equal(errors[0][1].path, "vault.jsonl");
});

test("treats only a 404 as an absent optional file", async () => {
  let calls = 0;
  const { logger, warnings, errors } = recordingLogger();

  const content = await fetchGitHubTextFile("owner/repo", "missing.jsonl", {
    fetchImpl: async () => {
      calls += 1;
      return new Response(null, { status: 404 });
    },
    retryDelayMs: 0,
    logger,
  });

  assert.equal(content, null);
  assert.equal(calls, 1);
  assert.equal(warnings.length, 0);
  assert.equal(errors.length, 0);
});

test("fails closed on a non-retryable authorization response", async () => {
  let calls = 0;
  const { logger, errors } = recordingLogger();

  await assert.rejects(
    fetchGitHubTextFile("owner/repo", "vault.jsonl", {
      fetchImpl: async () => {
        calls += 1;
        return new Response(null, { status: 401 });
      },
      retryDelayMs: 0,
      logger,
    }),
    /returned 401/,
  );

  assert.equal(calls, 1);
  assert.equal(errors.length, 1);
});
