import test from "node:test";
import * as assert from "node:assert/strict";
import { validateLoopbackRequest } from "../src/server/loopback.js";
import { type IncomingMessage } from "node:http";

test("validateLoopbackRequest rejects non-loopback IP", () => {
  const req = {
    socket: { remoteAddress: "192.168.1.100" },
    headers: {},
  } as unknown as IncomingMessage;

  const result = validateLoopbackRequest(req, { authToken: "secret-token" });
  assert.equal(result.valid, false);
  assert.equal(result.status, 403);
});

test("validateLoopbackRequest rejects missing or invalid Bearer token", () => {
  const reqNoToken = {
    socket: { remoteAddress: "127.0.0.1" },
    headers: {},
  } as unknown as IncomingMessage;

  const resultNoToken = validateLoopbackRequest(reqNoToken, { authToken: "secret-token" });
  assert.equal(resultNoToken.valid, false);
  assert.equal(resultNoToken.status, 401);

  const reqBadToken = {
    socket: { remoteAddress: "127.0.0.1" },
    headers: { authorization: "Bearer wrong-token" },
  } as unknown as IncomingMessage;

  const resultBadToken = validateLoopbackRequest(reqBadToken, { authToken: "secret-token" });
  assert.equal(resultBadToken.valid, false);
  assert.equal(resultBadToken.status, 401);
});

test("validateLoopbackRequest admits valid loopback call with bearer token", () => {
  const req = {
    socket: { remoteAddress: "127.0.0.1" },
    headers: {
      authorization: "Bearer secret-token",
      origin: "http://127.0.0.1:8765",
    },
  } as unknown as IncomingMessage;

  const result = validateLoopbackRequest(req, { authToken: "secret-token" });
  assert.equal(result.valid, true);
  assert.equal(result.status, 200);
});
