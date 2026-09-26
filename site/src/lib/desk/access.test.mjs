// node --experimental-strip-types --import ./scripts/test/register.mjs --test src/lib/desk/access.test.mjs
import assert from "node:assert/strict";
import test from "node:test";

import { BAD_TOKEN, CLOSED_WITHOUT_COUNTER, bearer, deskAccess, tokensMatch } from "./access.ts";

const KV = { KV_REST_API_URL: "https://kv.example.upstash.io", KV_REST_API_TOKEN: "kv-token" };
const TOKEN = "desk-access-token-0123456789";

test("on Vercel with a durable counter the route is public and counted", () => {
  assert.deepEqual(deskAccess({ VERCEL: "1", ...KV }, null), { ok: true, limiter: "durable", authorized: false });
});

test("on Vercel without a durable counter the public gets 503", () => {
  assert.deepEqual(deskAccess({ VERCEL: "1" }, null), { ok: false, status: 503, error: CLOSED_WITHOUT_COUNTER });
  assert.deepEqual(
    deskAccess({ VERCEL: "1", DESK_ACCESS_TOKEN: TOKEN }, null),
    { ok: false, status: 503, error: CLOSED_WITHOUT_COUNTER },
    "a configured token does not open the door for requests that do not carry it",
  );
});

test("on Vercel without a durable counter a valid token runs, uncounted", () => {
  assert.deepEqual(deskAccess({ VERCEL: "1", DESK_ACCESS_TOKEN: TOKEN }, `Bearer ${TOKEN}`), {
    ok: true,
    limiter: "none",
    authorized: true,
  });
});

test("a valid token with a durable counter is still counted against the day", () => {
  assert.deepEqual(deskAccess({ VERCEL: "1", DESK_ACCESS_TOKEN: TOKEN, ...KV }, `Bearer ${TOKEN}`), {
    ok: true,
    limiter: "durable",
    authorized: true,
  });
});

test("a wrong token is refused with 401 wherever it is sent", () => {
  const refused = { ok: false, status: 401, error: BAD_TOKEN };
  assert.deepEqual(deskAccess({ VERCEL: "1", DESK_ACCESS_TOKEN: TOKEN }, "Bearer nope"), refused);
  assert.deepEqual(deskAccess({ VERCEL: "1", DESK_ACCESS_TOKEN: TOKEN, ...KV }, "Bearer nope"), refused);
  assert.deepEqual(deskAccess({ DESK_ACCESS_TOKEN: TOKEN }, `Bearer ${TOKEN}x`), refused);
});

test("with no token configured, a bearer header grants nothing", () => {
  assert.deepEqual(deskAccess({ VERCEL: "1" }, "Bearer anything"), { ok: false, status: 503, error: CLOSED_WITHOUT_COUNTER });
  assert.deepEqual(deskAccess({ VERCEL: "1", DESK_ACCESS_TOKEN: "   " }, "Bearer    "), {
    ok: false,
    status: 503,
    error: CLOSED_WITHOUT_COUNTER,
  });
});

test("off Vercel the in-memory counter stands in", () => {
  assert.deepEqual(deskAccess({}, null), { ok: true, limiter: "memory", authorized: false });
  assert.deepEqual(deskAccess({ ...KV }, null), { ok: true, limiter: "durable", authorized: false }, "a durable counter wins locally too");
});

test("the bearer token is read strictly", () => {
  assert.equal(bearer(`Bearer ${TOKEN}`), TOKEN);
  assert.equal(bearer(`bearer ${TOKEN}`), TOKEN);
  assert.equal(bearer(TOKEN), null);
  assert.equal(bearer("Basic abc"), null);
  assert.equal(bearer("Bearer a b"), null);
  assert.equal(bearer(null), null);
});

test("tokens compare equal only when they are equal, whatever their lengths", () => {
  assert.equal(tokensMatch(TOKEN, TOKEN), true);
  assert.equal(tokensMatch(TOKEN.slice(0, -1), TOKEN), false);
  assert.equal(tokensMatch("", TOKEN), false);
  assert.equal(tokensMatch(`${TOKEN}${TOKEN}`, TOKEN), false);
});
