import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { scanEstate, parseFrontmatter } from "../foundry/agent-ontology/agent-ontology.mjs";
import { buildCatalog, checkOrWrite, CATALOG_PATH, CONTRACTS_PATH, GRAPH_PATH, IDENTITIES_PATH, listProfiles, ROOT, validateCatalog } from "../scripts/build-specialist-catalog.mjs";
import { buildExport, composeInstructions, selectSpecialist, writeExport } from "../scripts/export-specialist.mjs";

const { catalog, graph } = buildCatalog();
const contracts = JSON.parse(readFileSync(join(ROOT, CONTRACTS_PATH), "utf8"));
const hash = (text) => createHash("sha256").update(text).digest("hex");

function fixture(fn) {
  const dir = mkdtempSync(join(tmpdir(), "sis-specialist-"));
  try {
    for (const path of [...catalog.sources.map((source) => source.path), CATALOG_PATH, GRAPH_PATH]) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      copyFileSync(join(ROOT, path), join(dir, path));
    }
    return fn(dir);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test("catalog deterministically covers every source profile without changing identities", () => {
  assert.deepEqual(buildCatalog(), { catalog, graph });
  assert.equal(checkOrWrite(ROOT, true).count, listProfiles().length);
  assert.deepEqual(catalog.agents.map((agent) => agent.source.path), listProfiles());
  assert.equal(new Set(catalog.agents.map((agent) => agent.name)).size, catalog.count);
  const ontology = scanEstate({ includeSkills: false }).records.filter((record) => record.estate === "sis" && record.kind === "agent");
  for (const card of catalog.agents) {
    const original = readFileSync(join(ROOT, card.source.path), "utf8");
    assert.equal(card.profileName, parseFrontmatter(original).fm.name);
    assert.equal(card.source.sha256, hash(original));
    assert.equal(card.ontologyId, ontology.find((record) => record.sourceRef === card.source.path)?.id);
    assert.ok(card.acceptance.length >= 2);
    assert.equal(card.authority.automaticMoneyMovement, false);
    assert.deepEqual(card.authority.toolsGrantedByCatalog, []);
    assert.equal(card.readiness.deployment, "unverified");
    assert.ok(card.identityProvenance.curatedOperationalProposal.includes("name"));
  }
  assert.notEqual(selectSpecialist(catalog, "sage").id, selectSpecialist(catalog, "starlight-sage").id);
  assert.equal(selectSpecialist(catalog, "starlight-sage-seat").id, "sage");
});

test("projected skills have actual local definitions and unknown legacy references stay findings", () => {
  for (const card of catalog.agents) {
    for (const skill of card.skills) {
      assert.match(skill.id, /^[a-z0-9][a-z0-9/-]+$/);
      assert.equal(hash(readFileSync(join(ROOT, skill.source.path), "utf8")), skill.source.sha256);
    }
    assert.ok(!card.skills.some((skill) => ["Domain", "Validation", "Execution"].includes(skill.id)));
    for (const unresolved of card.unresolvedSkills) {
      assert.ok(!card.skills.some((skill) => skill.id === unresolved.declared));
    }
  }
  assert.ok(selectSpecialist(catalog, "starlight-navigator").skills.some((skill) => skill.id === "intelligence/strategic-reasoning"));
});

test("source edits and newly added profiles invalidate the checked projection", () => {
  fixture((dir) => {
    const profile = catalog.agents[0].source.path;
    writeFileSync(join(dir, profile), readFileSync(join(dir, profile), "utf8") + "\nChanged source.\n");
    assert.throws(() => checkOrWrite(dir, true), /Stale/);
  });
  fixture((dir) => {
    writeFileSync(join(dir, "agents/new-specialist.md"), "---\nname: new-specialist\ntier: core\ndomain: research\n---\n# New specialist\n");
    assert.throws(() => buildCatalog(dir), /Missing specialist identity/);
  });
  fixture((dir) => {
    writeFileSync(join(dir, IDENTITIES_PATH), JSON.stringify({ ...JSON.parse(readFileSync(join(dir, IDENTITIES_PATH), "utf8")), orphan: { role: "Orphan" } }));
    assert.throws(() => buildCatalog(dir), /Identity overrides without profiles/);
  });
});

test("graph rejects broken references and maker/checker collisions", () => {
  const dangling = structuredClone(graph);
  dangling.edges.push({ from: "agent:missing", to: "agent:starlight-evaluator", relation: "review" });
  assert.throws(() => validateCatalog(catalog, dangling), /Dangling/);
  const self = structuredClone(graph);
  self.edges.push({ from: "agent:starlight-evaluator", to: "agent:starlight-evaluator", relation: "review" });
  assert.throws(() => validateCatalog(catalog, self), /Self-review/);
  const swarm = structuredClone(graph);
  swarm.swarmTemplates[0].verifier = swarm.swarmTemplates[0].lead;
  assert.throws(() => validateCatalog(catalog, swarm), /maker\/checker collision/);
  assert.equal(graph.nodes.filter((node) => node.kind === "agent").length, catalog.count);
});

test("all specialists export inspectable instruction packages without claiming native execution", () => {
  for (const card of catalog.agents) {
    const files = buildExport(catalog, card, contracts);
    const prompt = files.get(`${card.id}/AGENTS.md`);
    assert.ok(prompt.startsWith(`# ${card.name}\n`));
    assert.ok(prompt.includes(card.purpose));
    for (const check of card.acceptance) assert.ok(prompt.includes(check));
    assert.ok(files.has(`${card.id}/source-profile.md`));
    const manifest = JSON.parse(files.get(`${card.id}/export-manifest.json`));
    assert.equal(manifest.status, "generated");
    assert.equal(manifest.nativeConfiguration, "not-generated");
    assert.deepEqual(manifest.runtimeEvidence, []);
    for (const file of manifest.files) assert.equal(hash(files.get(file.path)), file.sha256);
  }
  const card = selectSpecialist(catalog, "starlight-adapter-crewai");
  const eve = buildExport(catalog, card, contracts, { target: "eve-instructions", alias: "Hikari" });
  assert.ok(eve.has(`agent/subagents/${card.slug}/instructions.md`));
  assert.ok(![...eve.keys()].some((path) => path.endsWith("/agent.ts")));
  assert.ok([...eve.values()].some((text) => text.includes("Node 24+")));
  assert.throws(() => composeInstructions(card, contracts, { alias: "bad\nlabel" }), /Alias/);
  assert.throws(() => buildExport(catalog, card, contracts, { target: "everything-ready" }), /Target/);
});

test("exports reject source-tree destinations and different-content overwrites", () => {
  const card = selectSpecialist(catalog, "starlight-navigator");
  const files = buildExport(catalog, card, contracts);
  assert.throws(() => writeExport(files, join(ROOT, "agents/catalog/export")), /outside agents/);
  const out = mkdtempSync(join(tmpdir(), "sis-export-"));
  try {
    const paths = writeExport(files, out);
    assert.equal(paths.length, files.size);
    assert.ok(paths.every(existsSync));
    assert.deepEqual(writeExport(files, out), paths);
    writeFileSync(paths[0], "User customization\n");
    assert.throws(() => writeExport(files, out), /overwrite different content/);
    assert.equal(readFileSync(paths[0], "utf8"), "User customization\n");
  } finally { rmSync(out, { recursive: true, force: true }); }
});
