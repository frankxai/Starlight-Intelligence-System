import test from "node:test";
import assert from "node:assert/strict";
import { linkPublicSpecialists } from "../scripts/link-public-specialists.mjs";

const commit = "a".repeat(40);
const catalog = { sourceDigest: "b".repeat(64), agents: [{ id: "starlight-prime", source: { path: "agents/starlight-prime.md", sha256: "c".repeat(64) } }] };
const portfolio = { schema_version: "starlight.civilization_portfolio.v2", counts: { agents: 2 }, rings: [{ agents: [
  { agent_id: "astra-sovereign", lineage: { source_identifier: "starlight-prime.md" } },
  { agent_id: "new-profile", lineage: { source_identifier: "starlight-missing.md" } },
] }] };

test("exact lineage remains separate from identity and unknown sources remain unresolved", () => {
  const graph = linkPublicSpecialists(portfolio, catalog, commit, "d".repeat(64));
  assert.equal(graph.links[0].from, "public:astra-sovereign");
  assert.equal(graph.links[0].to, "sis:starlight-prime");
  assert.equal(graph.links[0].identityEquivalent, false);
  assert.equal(graph.links[0].grantsAuthority, false);
  assert.equal(graph.counts.exactLinks, 1);
  assert.equal(graph.counts.unresolved, 1);
  assert.equal(graph.unresolved[0].publicAgentId, "new-profile");
});

test("ambiguous identity counts and unbound revisions fail", () => {
  assert.throws(() => linkPublicSpecialists(portfolio, catalog, "main", "digest"));
  const duplicate = structuredClone(portfolio);
  duplicate.rings[0].agents[1].agent_id = "astra-sovereign";
  assert.throws(() => linkPublicSpecialists(duplicate, catalog, commit, "digest"));
});
