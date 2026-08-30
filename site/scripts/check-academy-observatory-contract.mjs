#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const REPO_ROOT = resolve(SITE_ROOT, "..");
const read = (path) => readFileSync(join(REPO_ROOT, path), "utf8");
const json = (path) => JSON.parse(read(path));
const failures = [];

const competency = json(
  "foundry/contracts/academy-fabric/fixtures/valid/competency-graph-graph-engineering.json",
);
const execution = json(
  "foundry/contracts/academy-fabric/fixtures/valid/execution-graph-mission-zero.json",
);
const academyPack = json(
  "foundry/contracts/academy-fabric/fixtures/valid/academy-pack.json",
);
const plugin = json(
  "plugins/starlight-graph-engineering/.codex-plugin/plugin.json",
);
const page = read("site/src/app/academy/graphs/page.tsx");
const model = read("site/src/lib/academy-graphs.ts");
const observatory = read(
  "site/src/components/academy/AcademyGraphObservatory.tsx",
);
const directedGraph = read(
  "site/src/components/academy/AcademyDirectedGraph.tsx",
);
const nav = read("site/src/lib/nav.ts");
const sitemap = read("site/src/app/sitemap.ts");
const vercel = read("site/vercel.json");
const vercelIgnore = read("site/scripts/vercel-ignore-build.mjs");

function expect(condition, message) {
  if (!condition) failures.push(message);
}

expect(
  competency.nodes.length === 8 && competency.edges.length === 7,
  "the public CompetencyGraph must remain an 8-node, 7-edge fixture",
);
expect(
  competency.nodes.filter((node) => node.claimState === "sourced").length === 1,
  "the plugin must remain the only sourced capability node",
);
expect(
  competency.nodes.some((node) => node.claimState === "hypothesized"),
  "the contributor opportunity must remain visibly hypothesized",
);
expect(
  execution.nodes.length === 4 && execution.edges.length === 3,
  "Mission Zero must remain the bounded four-node execution fixture",
);
expect(
  execution.nodes.filter(
    (node) =>
      node.executor.kind === "human" &&
      node.authority.sideEffectClass === "consequential",
  ).length === 1,
  "Mission Zero must retain exactly one consequential human gate",
);
expect(
  execution.edges.every((edge) => edge.authorityTransfer === false),
  "Mission Zero edges may not transfer authority",
);
expect(
  execution.termination.maxSpend.amountMinor === 0,
  "Mission Zero maximum fixture spend must remain zero",
);
expect(
  academyPack.openAccessContract.completePathWithoutPayment &&
    academyPack.openAccessContract.localOrByokExecutionSupported &&
    academyPack.openAccessContract.credentialEligibilityWithoutPayment &&
    academyPack.openAccessContract.exportWithoutPayment &&
    academyPack.openAccessContract.identicalAssessmentStandard,
  "the complete path, local execution, proof eligibility, export, and assessment standard must remain free",
);
expect(
  plugin.skills === "./skills/" &&
    plugin.interface.capabilities.length === 6,
  "the plugin must remain a six-capability skills-only pack",
);
expect(
  page.includes('alternates: { canonical: CANONICAL_URL }') &&
    page.includes("<AcademyGraphObservatory model={academyGraphModel} />"),
  "the /academy/graphs page must retain canonical metadata and the fixture-backed Observatory",
);
expect(
  model.includes('recordOrigin: "hypothetical"') &&
    observatory.includes("What comes next is visible—and not yet real.") &&
    observatory.includes("No private learner fixture is exposed."),
  "evidence and Passport projections must remain explicitly hypothetical and redacted",
);
expect(
  observatory.includes("No approval, evidence verification, competence decision, or credential was created."),
  "the Mission Zero preview must stop at the human gate without implying an approval or credential",
);
expect(
  observatory.includes("Preview Mission Zero") &&
    !observatory.includes("Run Mission Zero") &&
    observatory.includes("experimental reference topology"),
  "the interface must describe Mission Zero as an experimental projection, never a live run or active topology",
);
expect(
  directedGraph.includes("semantic graph") &&
    directedGraph.includes("graph.edges.map((edge)") &&
    directedGraph.includes("Typed relations"),
  "every graph must retain a viewport-independent semantic node and typed-edge projection",
);
expect(
  observatory.includes("No checkout, entitlement graph, or autonomous payment authority is implemented."),
  "managed commerce must remain parked and non-operational",
);
expect(
  model.includes("academy-graph-steward.agent-pack.json") &&
    model.includes("learner-graph-navigator.agent-pack.json"),
  "both rendered Agent Pack candidates must remain linked to their canonical source records",
);
expect(
  nav.includes('{ href: "/academy", label: "Academy Atlas"'),
  "Academy Atlas must remain in the shared navigation model",
);
expect(
  sitemap.includes('"/academy/graphs"'),
  "/academy/graphs must remain discoverable in the sitemap",
);
expect(
  vercel.includes("scripts/vercel-ignore-build.mjs") &&
    vercelIgnore.includes("../foundry/contracts/academy-fabric") &&
    vercelIgnore.includes("../foundry/examples/academy-portfolio-40.reference.json") &&
    vercelIgnore.includes("../plugins/starlight-academy-fabric") &&
    vercelIgnore.includes("../plugins/starlight-graph-engineering"),
  "Academy contract, Atlas, and plugin changes must invalidate the Vercel ignore gate",
);

if (failures.length > 0) {
  console.error("Academy Observatory contract failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Academy Observatory contract passed: two authoritative graphs, one human gate, zero fixture spend, free proof/export, and hypothetical projections remain explicit.",
);
