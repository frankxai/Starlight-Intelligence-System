import assert from "node:assert/strict";
import test from "node:test";
import { enforceBodyLimit, PayloadTooLargeError } from "./body-limit.js";

const URL_MCP = "https://mcp.starlightintelligence.ai/mcp";

function streamOf(totalBytes: number, chunkBytes = 64 * 1024): ReadableStream<Uint8Array> {
  let sent = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (sent >= totalBytes) {
        controller.close();
        return;
      }
      const size = Math.min(chunkBytes, totalBytes - sent);
      sent += size;
      controller.enqueue(new Uint8Array(size).fill(0x20));
    },
  });
}

function streamedRequest(totalBytes: number): Request {
  return new Request(URL_MCP, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: streamOf(totalBytes),
    duplex: "half",
  } as RequestInit);
}

test("rejects a declared Content-Length over the limit without reading the body", async () => {
  const request = new Request(URL_MCP, {
    method: "POST",
    headers: { "content-length": String(2 * 1024 * 1024) },
    body: "{}",
  });
  await assert.rejects(enforceBodyLimit(request, 1024), PayloadTooLargeError);
});

test("rejects a streamed body without Content-Length once it exceeds the limit", async () => {
  const request = streamedRequest(1_048_576 + 1);
  assert.equal(request.headers.get("content-length"), null);
  await assert.rejects(enforceBodyLimit(request), PayloadTooLargeError);
});

test("passes a streamed body under the limit through with identical bytes and headers", async () => {
  const request = streamedRequest(200_000);
  const limited = await enforceBodyLimit(request);
  assert.equal(limited.method, "POST");
  assert.equal(limited.headers.get("content-type"), "application/json");
  const bytes = new Uint8Array(await limited.arrayBuffer());
  assert.equal(bytes.byteLength, 200_000);
  assert.ok(bytes.every((b) => b === 0x20));
});

test("leaves bodiless requests untouched", async () => {
  const request = new Request(URL_MCP, { method: "GET" });
  assert.equal(await enforceBodyLimit(request), request);
});
