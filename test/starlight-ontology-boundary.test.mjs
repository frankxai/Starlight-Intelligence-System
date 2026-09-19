import test from "node:test";
import assert from "node:assert/strict";
import { rules, violations } from "../scripts/starlight-ontology-lint.mjs";

test("canonical prohibited statements remain represented", () => {
  const samples = [
    "Starlight is God",
    "Lumina is Starlight",
    "Shinkami is God",
    "The Tao is The Source",
    "all religions teach Starlight",
    "Kunlun was actually Arcanea",
    "the future as collapsible by attention",
  ];
  for (const sample of samples) {
    assert.ok(rules.some(([, pattern]) => pattern.test(sample)), `missing rule for: ${sample}`);
  }
});

test("repository corpus respects the ontology boundary", async () => {
  assert.deepEqual(await violations(), []);
});
