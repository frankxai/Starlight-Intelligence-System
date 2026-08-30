#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const REPO_ROOT = resolve(SITE_ROOT, "..");
const read = (path) => readFileSync(join(REPO_ROOT, path), "utf8");
const json = (path) => JSON.parse(read(path));
const failures = [];

const referencePath = "foundry/examples/academy-portfolio-40.reference.json";
const referenceSource = read(referencePath);
const atlas = JSON.parse(referenceSource);
const plugin = json("plugins/starlight-academy-fabric/.codex-plugin/plugin.json");
const marketplace = json(".agents/plugins/marketplace.json");
const page = read("site/src/app/academy/page.tsx");
const component = read("site/src/components/academy/AcademyAtlas.tsx");
const model = read("site/src/lib/academy-atlas.ts");
const nav = read("site/src/lib/nav.ts");
const sitemap = read("site/src/app/sitemap.ts");
const vercelIgnore = read("site/scripts/vercel-ignore-build.mjs");

function expect(condition, message) {
  if (!condition) failures.push(message);
}

const houses = atlas.houses ?? [];
const packs = houses.flatMap((house) => house.packs ?? []);
const packIds = packs.map((pack) => pack.id);
const habitatIds = new Set((atlas.habitats ?? []).map((habitat) => habitat.id));
const pricingIds = new Set((atlas.pricingTiers ?? []).map((tier) => tier.id));
const skillNames = [
  "compose-domain-pack",
  "map-learner-journey",
  "design-learning-cell",
  "govern-managed-capacity",
  "plan-institutional-adoption",
];

expect(atlas.kind === "academy-portfolio-reference", "the Atlas must remain an explicitly proposed reference");
expect(atlas.release?.status === "proposed-reference", "the release may not imply a live forty-academy portfolio");
expect(houses.length === 5, "the portfolio must contain exactly five public houses");
expect(houses.every((house) => house.packs?.length === 8), "every public house must contain exactly eight packs");
expect(packs.length === 40, "the Atlas must contain exactly forty domain packs");
expect(new Set(packIds).size === 40, "all forty domain-pack identifiers must be unique");
expect(atlas.portfolio?.topLevelBrandLimit === 5, "the portfolio may not turn forty packs into forty top-level brands");
expect(atlas.portfolio?.activePublicReferences === 1, "exactly one source-backed public path is allowed in this reference");
expect(atlas.portfolio?.activeRevenueBets === 1, "exactly one paid validation bet is allowed in this reference");
expect(packs.filter((pack) => pack.status === "active-public-reference").length === 1, "one pack must be source-backed");
expect(packs.filter((pack) => pack.status === "validation-bet").length === 1, "one pack must be the paid validation bet");
expect(packs.filter((pack) => pack.status === "proposed-next").length === 4, "four packs must remain in Next");
expect(packs.filter((pack) => pack.status === "proposed-option").length === 34, "thirty-four packs must remain parked in Later");

const accessFlags = [
  "completeLearningPathWithoutPayment",
  "allModulesAndMissionsPublic",
  "rubricsAndCredentialThresholdsPublic",
  "localOrBringYourOwnKeySupported",
  "learnerExportWithoutPayment",
  "credentialEligibilityWithoutPayment",
  "identicalAssessmentStandardAcrossTiers",
];
expect(accessFlags.every((flag) => atlas.openAccess?.[flag] === true), "learning, local execution, export, and equal assessment must remain free");
expect(atlas.commerce?.status === "parked-design", "commerce must remain an unimplemented parked design");
expect(atlas.commerce?.agentAuthority === "recommend-only", "agents may only recommend published payment options");
expect(atlas.commerce?.requiresHumanRatifiedPriceBook === true, "a human-ratified price book is required");
expect(atlas.commerce?.requiresExplicitBuyerConfirmation === true, "explicit buyer confirmation is required");
expect(atlas.commerce?.entitlementReceiptRequired === true, "a deterministic entitlement receipt is required");
expect(atlas.commerce?.prohibited?.some((rule) => rule.includes("change a price")), "agent price changes must remain prohibited");
expect(atlas.pricingTiers?.length === 6, "the Atlas must expose six transparent capacity tiers including Commons");
expect(atlas.pricingTiers?.[0]?.id === "commons" && atlas.pricingTiers[0].priceHypothesis === "€0", "the first tier must be the zero-price Commons");

for (const pack of packs) {
  expect(typeof pack.identity === "string" && pack.identity.length > 2, `${pack.id}: learner identity is required`);
  expect(typeof pack.promise === "string" && pack.promise.length > 20, `${pack.id}: a specific promise is required`);
  expect(typeof pack.persona?.ageBand === "string", `${pack.id}: an age-band market signal is required`);
  expect(typeof pack.persona?.stage === "string", `${pack.id}: a learner stage is required`);
  expect(typeof pack.persona?.currentReality === "string", `${pack.id}: current learner reality is required`);
  expect(typeof pack.persona?.friction === "string", `${pack.id}: learner friction is required`);
  expect(Array.isArray(pack.proposedModules) && pack.proposedModules.length >= 3, `${pack.id}: at least three proposed modules are required`);
  expect(typeof pack.academicExperience === "string" && typeof pack.communityExperience === "string", `${pack.id}: academic and community experiences are required`);
  expect(typeof pack.freeOutcome === "string" && typeof pack.managedCapacity === "string", `${pack.id}: free outcome and managed capacity are required`);
  expect(typeof pack.willingnessHypothesis === "string" && pack.willingnessHypothesis.length > 20, `${pack.id}: willingness to pay must be labeled as a hypothesis`);
  expect(pricingIds.has(pack.pricingTier), `${pack.id}: pricing tier ${pack.pricingTier} must resolve`);
  expect(Array.isArray(pack.habitatIds) && pack.habitatIds.length >= 2, `${pack.id}: at least two reachable habitats are required`);
  expect(pack.habitatIds.every((id) => habitatIds.has(id)), `${pack.id}: every habitat reference must resolve`);
}

expect((atlas.habitats ?? []).every((habitat) => habitat.url.startsWith("https://")), "all learner-habitat sources must use HTTPS");
expect((atlas.agentCandidates ?? []).length === 3, "three bounded agent candidates must be visible");
expect(atlas.agentCandidates.every((agent) => agent.status === "compiled-candidate-not-activated" && agent.authority === "draft-only"), "all portfolio agents must remain inactive and draft-only");
expect(atlas.agentCandidates.every((agent) => agent.denied.some((scope) => scope.includes("payment") || scope.includes("price") || scope.includes("contract"))), "every candidate must deny a financial or contracting authority");

expect(plugin.skills === "./skills/", "the Academy Fabric plugin must remain skills-only");
expect(plugin.license === "MIT", "the Academy Fabric plugin must remain MIT licensed");
expect(plugin.interface?.capabilities?.length === 5, "the Academy Fabric plugin must expose five reusable capabilities");
expect(!Object.hasOwn(plugin, "mcpServers") && !Object.hasOwn(plugin, "apps") && !Object.hasOwn(plugin, "hooks"), "the plugin may not imply MCP, app, hook, or authentication infrastructure");
expect(marketplace.plugins?.some((entry) => entry.name === "starlight-academy-fabric" && entry.source?.path === "./plugins/starlight-academy-fabric"), "the local marketplace must expose the Academy Fabric plugin");

for (const skill of skillNames) {
  const directory = join(REPO_ROOT, "plugins", "starlight-academy-fabric", "skills", skill);
  const skillPath = join(directory, "SKILL.md");
  const yamlPath = join(directory, "agents", "openai.yaml");
  expect(existsSync(skillPath), `${skill}: SKILL.md is required`);
  expect(existsSync(yamlPath), `${skill}: agents/openai.yaml is required`);
  if (existsSync(skillPath)) {
    const source = readFileSync(skillPath, "utf8");
    expect(!source.includes("[TODO:"), `${skill}: unfinished scaffold text is forbidden`);
  }
}

expect(page.includes("<AcademyAtlas model={academyAtlasModel} />") && page.includes("alternates: { canonical: CANONICAL_URL }"), "the /academy page must be canonical and model-backed");
expect(model.includes("academy-portfolio-40.reference.json"), "the public Atlas must compile from the machine-readable reference");
expect(component.includes("Forty paths.") && component.includes("One open academy."), "the core public promise must remain visible");
expect(component.includes("Proposed price, not observed willingness to pay."), "the interface must label willingness-to-pay as a hypothesis");
expect(component.includes("Discovery habitat · not an Academy partnership"), "the interface must not imply institutional partnership");
expect(component.includes("Autonomous recommendation. Deterministic payment."), "the human-ratified commerce boundary must remain visible");
expect(component.includes("inactive · draft only"), "candidate agents must remain visibly inactive");
expect(nav.includes('{ href: "/academy", label: "Academy Atlas"'), "Academy Atlas must remain in shared navigation");
expect(sitemap.includes('"/academy"') && sitemap.includes('"/academy/graphs"'), "both Academy public routes must remain discoverable");
expect(vercelIgnore.includes("../foundry/examples/academy-portfolio-40.reference.json") && vercelIgnore.includes("../plugins/starlight-academy-fabric"), "Atlas and plugin changes must invalidate the Vercel ignore gate");

const forbiddenLanguage = "evidence sprint";
expect(!referenceSource.toLowerCase().includes(forbiddenLanguage) && !component.toLowerCase().includes(forbiddenLanguage), "the rejected program language may not re-enter the Academy Atlas");

if (failures.length > 0) {
  console.error("Academy Atlas contract failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Academy Atlas contract passed: five houses, forty packs, one source-backed path, one revenue bet, open learning, transparent pricing hypotheses, and draft-only agents remain explicit.");
