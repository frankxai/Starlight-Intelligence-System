import { createHash } from "node:crypto";
import { access, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const candidates = [
  process.env.STARLIGHT_INTELLIGENCE_WEB_ROOT,
  resolve(siteRoot, "..", "..", "starlight-intelligence-web"),
  resolve(siteRoot, "..", "..", "..", "repos", "starlight-intelligence-web"),
].filter(Boolean);

let webRoot;
for (const candidate of candidates) {
  try {
    await access(resolve(candidate, "data", "constellation-portfolio.public.json"));
    webRoot = candidate;
    break;
  } catch {
    // Try the next verified estate layout.
  }
}

if (!webRoot) {
  throw new Error(
    "Unable to locate starlight-intelligence-web; set STARLIGHT_INTELLIGENCE_WEB_ROOT",
  );
}

const agentConfigCandidates = [
  process.env.STARLIGHT_AGENT_CONFIG_ROOT,
  resolve(siteRoot, "..", "..", "agent-config-constellation-plugin"),
  resolve(siteRoot, "..", "..", "..", "repos", "starlight-agent-config"),
].filter(Boolean);

let pluginAssetRoot;
for (const candidate of agentConfigCandidates) {
  const assetRoot = resolve(
    candidate,
    "core",
    "plugins",
    "starlight-constellation",
    "assets",
  );
  try {
    await access(resolve(assetRoot, "pack-index.json"));
    pluginAssetRoot = assetRoot;
    break;
  } catch {
    // Try the next verified estate layout.
  }
}

if (!pluginAssetRoot) {
  throw new Error(
    "Unable to locate the Starlight Constellation plugin pack; set STARLIGHT_AGENT_CONFIG_ROOT",
  );
}

const sourceDownloadRoot = resolve(
  webRoot,
  "public",
  "downloads",
  "starlight-constellation",
);
const artifactNames = [
  "portfolio.public.json",
  "visual-provenance.manifest.json",
  "capability-pack.manifest.json",
];

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const portfolioRaw = await readFile(
  resolve(webRoot, "data", "constellation-portfolio.public.json"),
);
const portfolio = JSON.parse(portfolioRaw.toString("utf8"));
const releaseRaw = await readFile(resolve(sourceDownloadRoot, "release.manifest.json"));
const release = JSON.parse(releaseRaw.toString("utf8"));
const pluginIndexRaw = await readFile(resolve(pluginAssetRoot, "pack-index.json"));
const pluginIndex = JSON.parse(pluginIndexRaw.toString("utf8"));
const agentPackRaw = await readFile(resolve(pluginAssetRoot, "agent-pack.manifest.json"));
const agentPack = JSON.parse(agentPackRaw.toString("utf8"));
const skillPackRaw = await readFile(resolve(pluginAssetRoot, "skill-pack.manifest.json"));
const skillPack = JSON.parse(skillPackRaw.toString("utf8"));
const marketplacePackRaw = await readFile(
  resolve(pluginAssetRoot, "marketplace-pack.manifest.json"),
);
const marketplacePack = JSON.parse(marketplacePackRaw.toString("utf8"));

if (portfolio.schema_version !== "starlight.public_agent_portfolio.v1") {
  throw new Error(`Unsupported portfolio schema: ${portfolio.schema_version}`);
}
if (release.schema_version !== "starlight.public_constellation_release.v1") {
  throw new Error(`Unsupported release schema: ${release.schema_version}`);
}
if (
  portfolio.truth_contract?.private_memory_included !== false ||
  portfolio.truth_contract?.grants_authority !== false
) {
  throw new Error("Protocol projection requires a public, non-authoritative catalog");
}
if (portfolio.counts?.swarms !== 10 || portfolio.counts?.agents !== 50) {
  throw new Error("Protocol projection requires the canonical 10-house / 50-agent release");
}
if (
  pluginIndex.schema_version !== "starlight.constellation_plugin_pack.v1" ||
  pluginIndex.counts?.houses !== 10 ||
  pluginIndex.counts?.agents !== 50 ||
  pluginIndex.source?.catalog_sha256 !== portfolio.source.catalog_sha256 ||
  pluginIndex.source?.public_projection_sha256 !== sha256(portfolioRaw) ||
  pluginIndex.source?.capability_pack_digest !== portfolio.capability_pack.content_digest ||
  pluginIndex.packs?.agent_pack !== agentPack.content_digest ||
  pluginIndex.packs?.skill_pack !== skillPack.content_digest ||
  marketplacePack.artifacts?.agent_pack?.content_digest !== agentPack.content_digest ||
  marketplacePack.artifacts?.skill_pack?.content_digest !== skillPack.content_digest ||
  marketplacePack.truth_contract?.grants_authority !== false
) {
  throw new Error("Plugin pack receipts do not bind to the canonical public release");
}

const downloadRoot = resolve(siteRoot, "public", "downloads", "constellation");
await mkdir(downloadRoot, { recursive: true });

for (const artifactName of artifactNames) {
  const bytes = await readFile(resolve(sourceDownloadRoot, artifactName));
  const receipt = release.artifacts.find((artifact) => artifact.name === artifactName);

  if (!receipt || receipt.sha256 !== sha256(bytes) || receipt.bytes !== bytes.byteLength) {
    throw new Error(`Release receipt mismatch for ${artifactName}`);
  }

  await copyFile(resolve(sourceDownloadRoot, artifactName), resolve(downloadRoot, artifactName));
}

await copyFile(
  resolve(sourceDownloadRoot, "release.manifest.json"),
  resolve(downloadRoot, "release.manifest.json"),
);
await copyFile(
  resolve(pluginAssetRoot, "agent-pack.manifest.json"),
  resolve(downloadRoot, "agent-pack.manifest.json"),
);
await copyFile(
  resolve(pluginAssetRoot, "skill-pack.manifest.json"),
  resolve(downloadRoot, "skill-pack.manifest.json"),
);
await copyFile(
  resolve(pluginAssetRoot, "marketplace-pack.manifest.json"),
  resolve(downloadRoot, "marketplace-pack.manifest.json"),
);
await copyFile(
  resolve(pluginAssetRoot, "pack-index.json"),
  resolve(downloadRoot, "plugin-pack.index.json"),
);

const houses = [];
let visualCount = 0;

for (const swarm of portfolio.swarms) {
  const agents = [];

  for (const agent of swarm.agents) {
    const sourceAsset = resolve(
      webRoot,
      "public",
      agent.visual_asset.href.replace(/^\//, ""),
    );
    const targetHref = `/assets/constellation-protocol/v1/${swarm.id}/${agent.id}.webp`;
    const targetAsset = resolve(siteRoot, "public", targetHref.replace(/^\//, ""));
    const bytes = await readFile(sourceAsset);

    if (sha256(bytes) !== agent.visual_asset.sha256) {
      throw new Error(`Visual digest mismatch for ${agent.id}`);
    }

    await mkdir(dirname(targetAsset), { recursive: true });
    await copyFile(sourceAsset, targetAsset);
    visualCount += 1;

    agents.push({
      id: agent.id,
      display_name: agent.display_name,
      role_title: agent.role_title,
      role_kind: agent.role_kind,
      status: agent.status,
      skill_refs: agent.skill_refs,
      capabilities: agent.capabilities,
      non_capabilities: agent.non_capabilities,
      stop_conditions: agent.stop_conditions,
      escalation_conditions: agent.escalation_conditions,
      graph: agent.graph,
      receipts: agent.source_receipts,
      visual: {
        href: targetHref,
        sha256: agent.visual_asset.sha256,
        width: agent.visual_asset.width,
        height: agent.visual_asset.height,
        inspection_status: agent.visual_asset.inspection_status,
        rights_status: agent.visual_asset.rights_status,
      },
      profile_url: `https://starlightintelligence.ai${agent.profile_href}`,
    });
  }

  houses.push({
    id: swarm.id,
    name: swarm.name,
    purpose: swarm.purpose,
    lead_agent_id: swarm.lead_agent_id,
    shared_stop_conditions: swarm.shared_stop_conditions,
    shared_escalation_conditions: swarm.shared_escalation_conditions,
    agents,
  });
}

if (visualCount !== 50) {
  throw new Error(`Expected 50 verified visuals, found ${visualCount}`);
}

const protocolProjection = {
  schema_version: "starlight.constellation_protocol_projection.v1",
  generated_on: portfolio.generated_on,
  status: "draft_public_protocol_projection",
  truth_contract: {
    website_is_projection: true,
    grants_authority: false,
    private_memory_included: false,
    live_eval_status: portfolio.truth_contract.live_eval_status,
    runtime_install_status: portfolio.truth_contract.runtime_install_status,
    claim: portfolio.truth_contract.claim,
  },
  source: {
    canonical_repository: portfolio.source.repository,
    canonical_commit: portfolio.source.commit,
    canonical_catalog_sha256: portfolio.source.catalog_sha256,
    public_projection_sha256: sha256(portfolioRaw),
    public_release_sha256: sha256(releaseRaw),
    capability_pack_digest: portfolio.capability_pack.content_digest,
    visual_manifest_sha256: portfolio.source.visual_manifest_sha256,
    plugin_pack_sha256: sha256(pluginIndexRaw),
    agent_pack_digest: agentPack.content_digest,
    skill_pack_digest: skillPack.content_digest,
  },
  counts: portfolio.counts,
  packaging_ledger: [
    {
      primitive: "agent_profile",
      state: "public_projection_ready",
      artifact: "portfolio.public.json",
      authority: "descriptive_only",
    },
    {
      primitive: "skill_pack",
      state: "reference_pack_ready",
      artifact: "skill-pack.manifest.json",
      authority: "methods_only_no_tool_grants",
    },
    {
      primitive: "agent_pack",
      state: "blueprint_pack_ready",
      artifact: "agent-pack.manifest.json",
      authority: "preview_only_not_runtime_admitted",
    },
    {
      primitive: "team_pack",
      state: "team_contracts_ready",
      artifact: "plugin-pack.index.json",
      authority: "ten_descriptive_teams_no_runtime_lease",
    },
    {
      primitive: "plugin",
      state: "validated_source_ready",
      artifact: "plugin-pack.index.json",
      authority: "blueprint_adapter_only_user_install_required",
    },
    {
      primitive: "marketplace_pack",
      state: "local_listing_ready",
      artifact: "marketplace-pack.manifest.json",
      authority: "no_commercial_entitlement_or_runtime_authority",
    },
  ],
  trust_chain: [
    "Canonical source catalog compiled deterministically.",
    "Public projection allowlists fields and excludes private memory.",
    "Release manifest receipts the portfolio, visual provenance, and capability manifest.",
    "Every portrait digest is rechecked before protocol publication.",
    "Agent, skill, plugin, and local marketplace receipts are bound to the same public catalog digest.",
    "Structural eval linkage is visible; live model evaluation remains not_run.",
    "Authenticated runtime leases and named human approval remain external to every web artifact.",
  ],
  houses,
};

const output = `${JSON.stringify(protocolProjection, null, 2)}\n`;
const dataPath = resolve(siteRoot, "src", "data", "constellation-protocol.public.json");
const publicPath = resolve(downloadRoot, "constellation-protocol.public.json");

await mkdir(dirname(dataPath), { recursive: true });
await writeFile(dataPath, output, "utf8");
await writeFile(publicPath, output, "utf8");

console.log(
  `[OK] Protocol projection: ${houses.length} houses, ${visualCount} verified portraits, ${portfolio.truth_contract.live_eval_status} live-eval status`,
);
