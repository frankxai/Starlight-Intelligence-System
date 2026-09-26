// node --experimental-strip-types --import ./scripts/test/register.mjs --test src/lib/desk/signing.test.mjs
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";

import { deskSigningKey } from "./signing.ts";

const DESK = "-----BEGIN PRIVATE KEY-----\ndesk\n-----END PRIVATE KEY-----";
const PERSONAL = "-----BEGIN PRIVATE KEY-----\npersonal\n-----END PRIVATE KEY-----";

test("a deployment signs only with the Desk key", () => {
  assert.deepEqual(deskSigningKey({ VERCEL: "1", DESK_SIGNING_KEY: DESK, SIS_SIGNING_KEY: PERSONAL }), {
    pem: DESK,
    source: "DESK_SIGNING_KEY",
  });
});

test("a deployment never falls back to the personal key", () => {
  assert.equal(deskSigningKey({ VERCEL: "1", SIS_SIGNING_KEY: PERSONAL }), null, "an unsigned draft, not Frank's key on a host");
  assert.equal(deskSigningKey({ VERCEL: "1", DESK_SIGNING_KEY: "  ", SIS_SIGNING_KEY: PERSONAL }), null);
});

test("the personal key is never read on a deployment, not even to check it is there", () => {
  const env = new Proxy(
    { VERCEL: "1" },
    {
      get(target, name) {
        if (name === "SIS_SIGNING_KEY") throw new Error("the deployed Desk read SIS_SIGNING_KEY");
        return target[name];
      },
    },
  );
  assert.equal(deskSigningKey(env), null);
});

test("on a laptop the Desk key still wins, and the personal key is the fallback", () => {
  assert.equal(deskSigningKey({ DESK_SIGNING_KEY: DESK, SIS_SIGNING_KEY: PERSONAL }).source, "DESK_SIGNING_KEY");
  assert.deepEqual(deskSigningKey({ SIS_SIGNING_KEY: PERSONAL }), { pem: PERSONAL, source: "SIS_SIGNING_KEY" });
  assert.equal(deskSigningKey({}), null);
});

test("the chosen key is the PEM as given, ready for the signer", () => {
  const { privateKey } = generateKeyPairSync("ed25519");
  const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  assert.equal(deskSigningKey({ VERCEL: "1", DESK_SIGNING_KEY: `${pem}\n` }).pem, pem.trim());
});
