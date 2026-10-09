// node --import ./scripts/test/register.mjs --test src/lib/desk/references.test.mjs
import assert from "node:assert/strict";
import test from "node:test";

import { checkClaims } from "./cascade.ts";
import { referenceList } from "./references.ts";

const SOURCES = [
  { index: 1, title: "Alpha paper", url: "https://example.org/a", content: "The alpha effect held in all three trials. A second alpha trial ran in 2025 with the same protocol." },
  { index: 2, title: "Beta report", url: "https://example.org/b", content: "Beta replicated the finding under the same conditions." },
  { index: 3, title: "", url: "https://example.org/c", content: "Gamma measured nothing of note in this particular setup." },
];

function claimsFrom(...entries) {
  const text = JSON.stringify({
    claims: entries.map(([quote, url]) => ({ text: quote, quote, url, confidence: 0.8 })),
  });
  return checkClaims(text, SOURCES).claims;
}

test("two claims from the same source each get their own entry, numbered as the brief cites them", () => {
  const claims = claimsFrom(
    ["The alpha effect held in all three trials", "https://example.org/a"],
    ["A second alpha trial ran in 2025 with the same protocol", "https://example.org/a"],
  );
  const references = referenceList(claims, SOURCES);
  assert.deepEqual(
    references.map((reference) => [reference.index, reference.title, reference.url]),
    [
      [1, "Alpha paper", "https://example.org/a"],
      [2, "Alpha paper", "https://example.org/a"],
    ],
    "[2] resolves to the second alpha quote, whatever source 2 is",
  );
  assert.equal(references[1].quote, "A second alpha trial ran in 2025 with the same protocol");
});

test("claims in a different order from retrieval resolve by claim index", () => {
  const claims = claimsFrom(
    ["Beta replicated the finding under the same conditions", "https://example.org/b"],
    ["Gamma measured nothing of note in this particular setup", "https://example.org/c"],
    ["The alpha effect held in all three trials", "https://example.org/a"],
  );
  const references = referenceList(claims, SOURCES);
  for (const claim of claims) {
    const entry = references.find((reference) => reference.index === claim.index);
    assert.equal(entry.url, claim.url, `[${claim.index}] points at the source its claim quotes`);
    assert.equal(entry.quote, claim.quote);
  }
  assert.deepEqual(
    references.map((reference) => `[${reference.index}] ${reference.title}`),
    ["[1] Beta report", "[2] https://example.org/c", "[3] Alpha paper"],
    "entry n is list position n; a source without a title shows its URL",
  );
});

test("the list follows claim index even when claims arrive out of order", () => {
  const references = referenceList(
    [
      { index: 2, quote: "second", url: "https://example.org/b" },
      { index: 1, quote: "first", url: "https://example.org/a" },
    ],
    SOURCES,
  );
  assert.deepEqual(references.map((reference) => reference.index), [1, 2]);
  assert.deepEqual(referenceList([], SOURCES), []);
});
