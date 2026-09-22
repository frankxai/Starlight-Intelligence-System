// node --experimental-strip-types --test src/lib/desk/cascade.test.mjs
//
// The cascade, proven without a key and without a network: every provider call
// is a canned response, so these assertions hold on the day whether or not the
// venue Wi-Fi does.
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  computeGroundingRate,
  parseClaims,
  parseContradictions,
  parseJudgement,
  runDesk,
  sectionsPresent,
  MODELS,
} from "./cascade.ts";
import { receiptProblems } from "./run-receipt.ts";
import { readAtoms } from "./vault.ts";

const SOURCES = [
  { title: "A", url: "https://example.org/a", content: "Alpha body text." },
  { title: "B", url: "https://example.org/b", content: "Beta body text." },
];

function jsonResponse(body) {
  return {
    ok: true,
    status: 200,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

function completion(content, input = 1000, output = 200) {
  return jsonResponse({
    choices: [{ message: { content } }],
    usage: { prompt_tokens: input, completion_tokens: output },
  });
}

const CLAIMS_JSON = JSON.stringify({
  claims: [
    { text: "Alpha holds.", quote: "Alpha body text.", url: "https://example.org/a", confidence: 0.9 },
    { text: "Beta holds.", quote: "Beta body text.", url: "https://example.org/b", confidence: 0.7 },
    { text: "Invented.", quote: "nowhere", url: "https://elsewhere.invalid/x", confidence: 0.9 },
  ],
});

const BRIEF = `## HYPOTHESIS
Alpha explains the result [1].
## METHOD
Two sources were read [1].
## SETUP
Local.
## RESULTS
Beta also holds [2].
## TAKEAWAY
Both hold [1][2].
## NEXT
Test a third.`;

/** A fetch that answers retrieval once and then each model stage in order. */
function scriptedFetch(script) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url: String(url), body: init?.body ? JSON.parse(init.body) : null });
    const next = script.shift();
    if (!next) throw new Error(`unscripted call to ${url}`);
    return typeof next === "function" ? next(String(url)) : next;
  };
  impl.calls = calls;
  return impl;
}

function config(fetchImpl) {
  let tick = 0;
  const now = () => (tick += 100);
  return {
    question: "Does alpha hold?",
    provider: { apiKey: "test", fetchImpl, now },
    retrieval: { apiKey: "test", fetchImpl, now },
    now: () => 1_790_000_000_000,
    clock: () => "2026-09-23T09:30:00Z",
  };
}

test("a full run cites its claims, scores itself, and issues a complete receipt", async () => {
  const fetchImpl = scriptedFetch([
    jsonResponse({ results: SOURCES }),
    completion(CLAIMS_JSON),
    completion(BRIEF, 2000, 600),
    completion(JSON.stringify({ score: 8.4, rationale: "Cited throughout." }), 900, 80),
  ]);
  const run = await runDesk(config(fetchImpl));

  assert.equal(run.sources.length, 2);
  assert.equal(run.claims.length, 2, "the claim quoting an unseen URL is dropped");
  assert.equal(run.groundingRate, 1);
  assert.equal(run.judgement?.score, 8.4);
  assert.deepEqual(sectionsPresent(run.brief).length, 6);

  assert.deepEqual(receiptProblems(run.receipt), [], "the receipt is structurally complete");
  assert.equal(run.receipt.verdict, "PASS");
  assert.equal(run.receipt.run.kind, "desk.brief");
  assert.deepEqual(
    run.receipt.stages.map((stage) => `${stage.name}:${stage.status}`),
    ["recall:skipped", "retrieve:ok", "extract:ok", "synthesize:ok", "contradict:skipped", "judge:ok", "remember:skipped"],
  );
  assert.equal(run.receipt.evidence.length, 2, "each source is evidence");
  assert.equal(run.receipt.totals.tokens.input, 3900);
  assert.equal(run.receipt.totals.tokens.output, 880);

  // Prices start unverified, so no stage invents a euro figure.
  assert.equal(run.pricesVerified, false);
  assert.ok(run.receipt.stages.every((stage) => stage.costEur === undefined));
  assert.equal(run.receipt.totals.costEur, 0);

  const models = fetchImpl.calls.slice(1).map((call) => call.body.model);
  assert.deepEqual(models, [MODELS.extract, MODELS.synthesize, MODELS.judge], "small, large, other family");
});

test("a failed stage is recorded and still yields a readable receipt", async () => {
  const fetchImpl = scriptedFetch([
    jsonResponse({ results: SOURCES }),
    { ok: false, status: 400, json: async () => ({}), text: async () => "bad request" },
  ]);
  const run = await runDesk(config(fetchImpl));

  assert.equal(run.claims.length, 0);
  assert.equal(run.brief, "");
  assert.equal(run.groundingRate, 0);
  assert.deepEqual(receiptProblems(run.receipt), []);
  assert.equal(run.receipt.verdict, "PARTIAL", "one stage landed, one failed: the verdict says so");
  assert.deepEqual(
    run.receipt.stages.map((stage) => `${stage.name}:${stage.status}`),
    [
      "recall:skipped",
      "retrieve:ok",
      "extract:failed",
      "synthesize:skipped",
      "contradict:skipped",
      "judge:skipped",
      "remember:skipped",
    ],
  );
  assert.match(run.receipt.stages[2].note ?? "", /400/);
});

test("a throttled stage is retried once, then succeeds", async () => {
  const fetchImpl = scriptedFetch([
    jsonResponse({ results: SOURCES }),
    { ok: false, status: 429, json: async () => ({}), text: async () => "slow down" },
    completion(CLAIMS_JSON),
    completion(BRIEF, 2000, 600),
    completion(JSON.stringify({ score: 7, rationale: "Fine." }), 900, 80),
  ]);
  const run = await runDesk(config(fetchImpl));
  assert.equal(run.claims.length, 2);
  assert.equal(run.receipt.verdict, "PASS");
});

test("grounding rate counts markers in the brief, never a model's self-report", () => {
  const claims = [1, 2, 3, 4].map((index) => ({ index, text: "t", quote: "q", url: "u", confidence: 1 }));
  assert.equal(computeGroundingRate("cites [1] and [3]", claims), 0.5);
  assert.equal(computeGroundingRate("cites nothing", claims), 0);
  assert.equal(computeGroundingRate("[1][2][3][4]", claims), 1);
  assert.equal(computeGroundingRate("[1]", []), 0, "no claims is no grounding");
});

test("malformed model output degrades instead of throwing", () => {
  assert.deepEqual(parseClaims("not json", SOURCES.map((s, i) => ({ ...s, index: i + 1 }))), []);
  assert.deepEqual(parseClaims(JSON.stringify({ claims: "nope" }), []), []);
  assert.equal(parseJudgement("not json"), null);
  assert.equal(parseJudgement(JSON.stringify({ rationale: "no score" })), null);
  // Fenced and prose-wrapped JSON still parse: models wrap output more often than not.
  assert.equal(parseJudgement("```json\n{\"score\":6}\n```")?.score, 6);
  assert.equal(parseJudgement("Here you go: {\"score\":9.25} — done")?.score, 9.3);
});

test("a judged score is clamped into the rubric's range", () => {
  assert.equal(parseJudgement(JSON.stringify({ score: 44 }))?.score, 10);
  assert.equal(parseJudgement(JSON.stringify({ score: -3 }))?.score, 0);
});

test("a run writes its claims to the vault, and the next run reads them back", async () => {
  const dir = await mkdtemp(join(tmpdir(), "desk-cascade-"));
  const vaultPath = join(dir, "desk-vault.jsonl");

  const first = await runDesk({
    ...config(
      scriptedFetch([
        jsonResponse({ results: SOURCES }),
        completion(CLAIMS_JSON),
        completion(BRIEF, 2000, 600),
        completion(JSON.stringify({ score: 8, rationale: "Cited." }), 900, 80),
      ]),
    ),
    vaultPath,
  });

  assert.equal(first.related.length, 0, "an empty vault recalls nothing");
  assert.equal(first.remembered, 2, "both surviving claims become beliefs");
  assert.deepEqual(
    first.receipt.stages.map((stage) => `${stage.name}:${stage.status}`),
    ["recall:ok", "retrieve:ok", "extract:ok", "synthesize:ok", "contradict:skipped", "judge:ok", "remember:ok"],
  );
  assert.ok(
    first.receipt.evidence.some((item) => item.kind === "vault" && item.ref === vaultPath),
    "the vault the run wrote to is evidence",
  );

  const stored = await readAtoms(vaultPath);
  assert.deepEqual(stored.map((atom) => atom.claim), ["Alpha holds.", "Beta holds."]);

  const second = await runDesk({
    ...config(
      scriptedFetch([
        jsonResponse({ results: SOURCES }),
        completion(CLAIMS_JSON),
        completion(BRIEF, 2000, 600),
        completion(
          JSON.stringify({
            contradictions: [
              { priorId: stored[0].id, newClaim: "Alpha fails.", reason: "Opposite finding." },
              { priorId: "never-held", newClaim: "Invented disagreement.", reason: "None." },
            ],
          }),
          800,
          60,
        ),
        completion(JSON.stringify({ score: 8, rationale: "Cited." }), 900, 80),
      ]),
    ),
    vaultPath,
  });

  assert.equal(second.related.length, 2, "the prior run's beliefs are recalled");
  assert.deepEqual(
    second.contradictions.map((item) => item.priorClaim),
    ["Alpha holds."],
    "a contradiction against a belief nobody holds is dropped",
  );
  assert.equal(second.contradictions[0].newClaim, "Alpha fails.");
  assert.deepEqual(
    second.receipt.stages.map((stage) => `${stage.name}:${stage.status}`),
    ["recall:ok", "retrieve:ok", "extract:ok", "synthesize:ok", "contradict:ok", "judge:ok", "remember:ok"],
  );
  assert.equal((await readAtoms(vaultPath)).length, 4, "memory accumulates rather than replaces");
});

test("an unwritable vault costs the run its memory, not its brief", async () => {
  const dir = await mkdtemp(join(tmpdir(), "desk-cascade-"));
  // A file where the vault expects a directory: the append cannot land.
  const blocker = join(dir, "blocked");
  await writeFile(blocker, "not a directory", "utf8");

  const run = await runDesk({
    ...config(
      scriptedFetch([
        jsonResponse({ results: SOURCES }),
        completion(CLAIMS_JSON),
        completion(BRIEF, 2000, 600),
        completion(JSON.stringify({ score: 8, rationale: "Cited." }), 900, 80),
      ]),
    ),
    vaultPath: join(blocker, "vault.jsonl"),
  });

  assert.equal(run.remembered, 0);
  assert.equal(run.brief.length > 0, true, "the brief still ships");
  assert.equal(run.receipt.stages.at(-1).status, "failed");
  assert.equal(run.receipt.verdict, "PARTIAL", "a lost write is visible in the verdict, not hidden");
  assert.deepEqual(receiptProblems(run.receipt), []);
});

test("contradictions are kept only where they name a belief that was recalled", () => {
  const held = [
    { id: "a", kind: "belief", question: "q", claim: "Held one.", quote: "q", url: "u", confidence: 1, receiptId: "r", at: "t" },
  ];
  assert.deepEqual(parseContradictions("not json", held), []);
  assert.deepEqual(parseContradictions(JSON.stringify({ contradictions: "nope" }), held), []);
  assert.deepEqual(parseContradictions(JSON.stringify({ contradictions: [{ priorId: "b", newClaim: "x" }] }), held), []);
  assert.deepEqual(parseContradictions(JSON.stringify({ contradictions: [{ priorId: "a", newClaim: "" }] }), held), []);
  const twice = parseContradictions(
    JSON.stringify({ contradictions: [{ priorId: "a", newClaim: "x" }, { priorId: "a", newClaim: "y" }] }),
    held,
  );
  assert.deepEqual(twice, [{ priorId: "a", priorClaim: "Held one.", newClaim: "x", reason: "" }], "one entry per prior belief");
});
