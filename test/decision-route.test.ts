import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CLEF_FLASH_MODEL, prepareClefFlashRequest, routeDecision, routeShadowOperations, SHADOW_STORAGE_PACKET,
  type DecisionAdmission,
} from "../src/runtime-bridge/decision-route.js";

const NOW = "2026-11-03T02:25:00.000Z";
const ACCOUNT = "0123456789abcdef0123456789abcdef";
const MARKER = "SECRET-MARKER-DO-NOT-EGRESS";

function admission(patch: Partial<DecisionAdmission> = {}): DecisionAdmission {
  return {
    now: NOW,
    ramFreeBytes: 5 * 1024 * 1024 * 1024,
    budgetRemainingUsd: 1,
    maxCallUsd: 0.01,
    cloudPermitted: true,
    providerAvailable: true,
    allowNetwork: true,
    evidenceMaxAgeMs: 60 * 60 * 1000,
    timeoutMs: 50,
    ...patch,
  };
}

function packet(patch: Record<string, unknown> = {}) {
  return { ...SHADOW_STORAGE_PACKET, ...patch };
}

test("shadow storage packet routes to the storage programme and approves nothing", async () => {
  const result = await routeShadowOperations(SHADOW_STORAGE_PACKET, admission({
    ramFreeBytes: 2.8 * 1024 * 1024 * 1024,
    cloudPermitted: false,
    allowNetwork: false,
    providerAvailable: false,
  }));
  assert.equal(result.status, "decided");
  assert.equal(result.owner, "storage-programme");
  assert.equal(result.effect, "hold");
  assert.equal(result.authority, "recommendation-only");
  assert.deepEqual(result.approvals, { deletion: false, merge: false, credentials: false, spend: false });
  assert.equal(result.provider.id, "baseline");
  assert.equal(result.evidenceId, "disk-free-121.68gib");
});

test("delete, merge, credential, and spend language stays a human recommendation", async () => {
  for (const summary of ["delete the restic archive", "merge the storage branch", "rotate the credential", "spend on R2"]) {
    const result = await routeDecision({ packet: packet({ summary, packetId: "pkt-human-gate" }), admission: admission(), provider: "baseline" });
    assert.equal(result.owner, "frank");
    assert.equal(result.effect, "human");
    assert.equal(result.approvals.deletion, false);
    assert.equal(result.approvals.merge, false);
    assert.equal(result.approvals.credentials, false);
    assert.equal(result.approvals.spend, false);
  }
});

test("an unmatched public packet abstains", async () => {
  const result = await routeDecision({
    packet: packet({ summary: "The afternoon note has no lane." }),
    admission: admission(),
    provider: "baseline",
  });
  assert.equal(result.status, "abstain");
  assert.equal(result.owner, "unknown");
  assert.equal(result.reason, "no-matching-owner");
});

test("stale evidence fails before a provider call", async () => {
  let calls = 0;
  const result = await routeDecision({
    packet: packet({ capturedAt: "2026-11-03T00:00:00.000Z" }),
    admission: admission({ evidenceMaxAgeMs: 60_000 }),
    provider: "clef-flash",
    accountId: ACCOUNT,
    token: "token",
    fetchImpl: async () => { calls += 1; throw new Error("called"); },
  });
  assert.equal(result.reason, "stale-evidence");
  assert.equal(calls, 0);
  assert.equal(JSON.stringify(result).includes(MARKER), false);
});

test("privacy denial blocks cloud for restricted, internal, and unknown packets", async () => {
  let calls = 0;
  for (const classification of ["restricted", "internal", "unknown"] as const) {
    const result = await routeDecision({
      packet: packet({ classification, summary: `note ${MARKER}` }),
      admission: admission(),
      provider: "clef-flash",
      accountId: ACCOUNT,
      token: "token",
      fetchImpl: async () => { calls += 1; throw new Error("called"); },
    });
    assert.equal(result.reason, "privacy-denied");
    assert.equal(JSON.stringify(result).includes(MARKER), false);
  }
  const hostDenied = await routeDecision({
    packet: packet(),
    admission: admission({ cloudPermitted: false }),
    provider: "clef-flash",
    fetchImpl: async () => { calls += 1; throw new Error("called"); },
  });
  assert.equal(hostDenied.reason, "privacy-denied");
  assert.equal(calls, 0);
});

test("low RAM, a closed budget, an unavailable provider, and a closed network do not fetch", async () => {
  let calls = 0;
  const fetchImpl: typeof fetch = async () => { calls += 1; throw new Error("called"); };
  const cases = [
    admission({ ramFreeBytes: 1024 }),
    admission({ maxCallUsd: 0 }),
    admission({ providerAvailable: false }),
    admission({ allowNetwork: false }),
  ];
  const reasons = ["capacity-held", "budget-denied", "provider-unavailable", "network-not-admitted"];
  for (let i = 0; i < cases.length; i += 1) {
    const result = await routeDecision({
      packet: packet(), admission: cases[i], provider: "clef-flash", accountId: ACCOUNT, token: "token", fetchImpl,
    });
    assert.equal(result.reason, reasons[i]);
  }
  assert.equal(calls, 0);
});

test("malformed model output is rejected and does not fall through to another provider", async () => {
  let calls = 0;
  const result = await routeDecision({
    packet: packet(),
    admission: admission(),
    provider: "clef-flash",
    fallbackProvider: "jev",
    accountId: ACCOUNT,
    token: "local-test-token",
    fetchImpl: async () => {
      calls += 1;
      return new Response(JSON.stringify({ answers: { owner: "storage-programme" } }), { status: 200 });
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.reason, "malformed-output");
  assert.equal(result.approvals.deletion, false);
  assert.equal(JSON.stringify(result).includes("local-test-token"), false);
});

test("a provider error refuses the configured cloud fallback", async () => {
  let calls = 0;
  const result = await routeDecision({
    packet: packet(),
    admission: admission(),
    provider: "clef-flash",
    fallbackProvider: "jev",
    accountId: ACCOUNT,
    token: "token",
    fetchImpl: async () => { calls += 1; return new Response("no", { status: 503 }); },
  });
  assert.equal(calls, 1);
  assert.equal(result.reason, "fallback-refused");
  assert.equal(result.provider.id, "clef-flash");
});

test("a timeout is a failure and does not call a second provider", async () => {
  let calls = 0;
  const result = await routeDecision({
    packet: packet(),
    admission: admission({ timeoutMs: 20 }),
    provider: "clef-flash",
    accountId: ACCOUNT,
    token: "token",
    fetchImpl: (_url, init) => new Promise((_resolve, reject) => {
      calls += 1;
      init?.signal?.addEventListener("abort", () => {
        const error = new Error("aborted");
        error.name = "AbortError";
        reject(error);
      });
    }),
  });
  assert.equal(calls, 1);
  assert.equal(result.reason, "timeout");
});

test("Jev and Liquid are not dispatched from this route", async () => {
  let calls = 0;
  const fetchImpl: typeof fetch = async () => { calls += 1; throw new Error("called"); };
  const jev = await routeDecision({ packet: packet(), admission: admission(), provider: "jev", fetchImpl });
  const liquid = await routeDecision({ packet: packet(), admission: admission(), provider: "liquid-local", fetchImpl });
  assert.equal(jev.reason, "provider-not-dispatched");
  assert.equal(liquid.reason, "local-runtime-not-admitted");
  assert.equal(calls, 0);
});

test("a Clef payload that tries to approve deletion is rejected", async () => {
  const result = await routeDecision({
    packet: packet(),
    admission: admission(),
    provider: "clef-flash",
    accountId: ACCOUNT,
    gatewayId: "starlight-observe",
    token: "local-test-token",
    fetchImpl: async (url, init) => {
      assert.equal(url, `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/ai/run`);
      assert.equal(init?.headers && (init.headers as Record<string, string>)["cf-aig-gateway-id"], "starlight-observe");
      const body = JSON.parse(String(init?.body));
      assert.equal(body.model, CLEF_FLASH_MODEL);
      assert.equal(body.input.model, "clef-flash");
      assert.equal(Object.hasOwn(body, "Authorization"), false);
      return new Response(JSON.stringify({
        success: true,
        result: {
          approvals: { deletion: true },
          answers: {
            owner: { choice: "frank", probabilities: { frank: 0.99 } },
            effect: { choice: "human", probabilities: { human: 0.99 } },
          },
        },
      }), { status: 200 });
    },
  });
  assert.equal(result.reason, "malformed-output");
  assert.equal(result.approvals.deletion, false);
});

test("a confident Clef choice is recorded as a recommendation with usage", async () => {
  const result = await routeDecision({
    packet: packet(),
    admission: admission(),
    provider: "clef-flash",
    accountId: ACCOUNT,
    token: "local-test-token",
    monotonicMs: (() => { let n = 0; return () => n++; })(),
    fetchImpl: async () => new Response(JSON.stringify({
      success: true,
      result: {
        answers: {
          owner: { choice: "storage-programme", probabilities: { "storage-programme": 0.91 } },
          effect: { choice: "hold", probabilities: { hold: 0.8 } },
        },
        usage: { prompt_tokens: 40, completion_tokens: 0 },
      },
    }), { status: 200 }),
  });
  assert.equal(result.status, "decided");
  assert.equal(result.owner, "storage-programme");
  assert.equal(result.effect, "hold");
  assert.equal(result.usage.inputTokens, 40);
  assert.equal(result.usage.outputTokens, 0);
  assert.equal(result.authority, "recommendation-only");
  assert.equal(JSON.stringify(result).includes("local-test-token"), false);
});

test("low confidence abstains", async () => {
  const result = await routeDecision({
    packet: packet(),
    admission: admission(),
    provider: "clef-flash",
    accountId: ACCOUNT,
    token: "token",
    fetchImpl: async () => new Response(JSON.stringify({
      answers: {
        owner: { choice: "sis", probabilities: { sis: 0.4 } },
        effect: { choice: "observe", probabilities: { observe: 0.9 } },
      },
    }), { status: 200 }),
  });
  assert.equal(result.status, "abstain");
  assert.equal(result.reason, "low-confidence");
});

test("the prepared Clef request is public System One input and carries no credential", () => {
  const prepared = prepareClefFlashRequest(SHADOW_STORAGE_PACKET.summary, ACCOUNT, "starlight-observe");
  assert.equal(prepared.body.model, CLEF_FLASH_MODEL);
  assert.equal(Object.hasOwn(prepared.headers, "Authorization"), false);
  assert.equal(prepared.headers["cf-aig-gateway-id"], "starlight-observe");
  assert.equal(prepared.body.input.questions.owner.criteria.unknown.includes("not clear"), true);
  assert.throws(() => prepareClefFlashRequest("ok", "../etc", "starlight-observe"));
});
