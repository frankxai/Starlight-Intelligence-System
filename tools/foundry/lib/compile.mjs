import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { basename, dirname, join, parse, relative, resolve } from "node:path";
import {
  assertNoSymlinkPath,
  hashTree,
  resolveInside,
  walkFiles,
  writeJson,
  writeText,
} from "./io.mjs";
import { resolveCapabilities } from "./graph.mjs";
import { assertValid, getContract } from "./schema.mjs";
import {
  renderAgent,
  renderOpenAiYaml,
  renderPackageReadme,
  renderShortDescription,
  renderSkill,
} from "./render.mjs";

function packContractName(kind) {
  return `${kind}-pack`;
}

function assertPersistentAgentBoundary(pack) {
  const boundaryFields = [
    "persistentDecisionRights",
    "distinctMemoryScope",
    "constrainedToolBoundary",
    "ownershipTransfer",
    "ongoingTrigger",
  ];
  if (!boundaryFields.some((field) => pack.necessity[field] === true)) {
    throw new Error(
      "Agent creation refused: no persistent policy boundary is proven. Compile a skill or temporary task worker instead.",
    );
  }
}

function assertSubset(label, values, allowedValues) {
  const allowed = new Set(allowedValues);
  const missing = values.filter((value) => !allowed.has("*") && !allowed.has(value));
  if (missing.length > 0) {
    throw new Error(`${label} exceeds the Task Envelope: ${missing.join(", ")}`);
  }
}

function assertPackWithinEnvelope(pack, envelope) {
  assertSubset(
    "Deployment target",
    pack.deployment.targets,
    envelope.deployment.targets,
  );

  if (pack.toolPolicy) {
    assertSubset(
      "Tool permission",
      pack.toolPolicy.allow,
      envelope.permissions.tools.allow,
    );
    const denied = new Set(envelope.permissions.tools.deny);
    const conflicts = pack.toolPolicy.allow.filter((tool) => denied.has(tool));
    if (conflicts.length > 0) {
      throw new Error(`Pack allows tools forbidden by the Task Envelope: ${conflicts.join(", ")}`);
    }
  }

  if (pack.memoryContract) {
    assertSubset(
      "Memory read permission",
      pack.memoryContract.read,
      envelope.permissions.memory.read,
    );
    assertSubset(
      "Memory write permission",
      pack.memoryContract.write,
      envelope.permissions.memory.write,
    );
  }

  const maxAgentTurns = envelope.constraints.budget?.maxAgentTurns;
  if (
    pack.kind === "agent" &&
    maxAgentTurns !== undefined &&
    pack.termination.maxTurns > maxAgentTurns
  ) {
    throw new Error(
      `Agent maxTurns ${pack.termination.maxTurns} exceeds Task Envelope maxAgentTurns ${maxAgentTurns}.`,
    );
  }
}

function capabilityNode(graph, id) {
  const normalized = id.includes(":") ? id : `skill:${id}`;
  return graph.nodes.find((node) => node.id === normalized);
}

function assertPackCapabilities(pack, graph, resolution) {
  let references = [];
  if (pack.kind === "skill") references = pack.dependencies;
  if (pack.kind === "agent") references = pack.skills;
  if (pack.kind === "swarm") references = pack.roles.flatMap((role) => role.capabilities);
  if (pack.kind === "vertical") references = pack.capabilities;
  if (pack.kind === "plugin") references = pack.skills;

  const missing = [...new Set(references)].filter((id) => !capabilityNode(graph, id));
  if (missing.length > 0) {
    throw new Error(`Pack references unregistered capabilities: ${missing.join(", ")}`);
  }
  const selected = new Set(resolution.selected);
  const unselected = [...new Set(references)]
    .map((id) => capabilityNode(graph, id)?.id)
    .filter((id) => id && !selected.has(id));
  if (unselected.length > 0) {
    throw new Error(
      `Pack references capabilities not explicitly selected by the Task Envelope: ${unselected.join(", ")}`,
    );
  }
  if (pack.kind === "plugin") {
    const destinations = new Map();
    for (const skill of pack.skills) {
      const terminalName = capabilityNode(graph, skill).id.split("/").at(-1);
      const existing = destinations.get(terminalName);
      if (existing) {
        throw new Error(
          `Plugin packaging collision: ${existing} and ${skill} both compile to skills/${terminalName}.`,
        );
      }
      destinations.set(terminalName, skill);
    }
  }
}

function prepareOutputDirectory({ output, packageId, force, registry, root }) {
  const protectedOutputs = new Set([
    parse(output).root,
    resolve(root),
    resolve(root, ".."),
    realpathSync(resolve(root)),
    realpathSync(resolve(root, "..")),
  ]);
  const resolvedOutput = existsSync(output) ? realpathSync(output) : output;
  if (protectedOutputs.has(output) || protectedOutputs.has(resolvedOutput)) {
    throw new Error(`Refusing broad or repository-root output directory: ${output}`);
  }
  if (!existsSync(output)) return;
  if (!statSync(output).isDirectory()) {
    throw new Error(`Output path exists and is not a directory: ${output}`);
  }
  if (readdirSync(output).length === 0) return;
  if (!force) {
    throw new Error(`Output directory is not empty: ${output}. Pass --force to replace a managed package.`);
  }

  const manifestPath = join(output, "foundry-manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(
      `Refusing --force for unmanaged output directory: ${output}. A valid Foundry manifest is required.`,
    );
  }
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    throw new Error(`Refusing --force because the existing Foundry manifest is invalid JSON: ${error.message}`);
  }
  assertValid(
    manifest,
    getContract(registry, "foundry-manifest"),
    registry,
    "Existing Foundry Manifest",
  );
  if (manifest.packageId !== packageId) {
    throw new Error(
      `Refusing --force: output belongs to package "${manifest.packageId}", not "${packageId}".`,
    );
  }
  rmSync(output, { recursive: true, force: false });
}

function copySkill(root, node, destination) {
  const source = assertNoSymlinkPath(root, node.path);
  const skillDirectory = join(destination, "skills", node.id.replace(/^skill:/, "").split("/").at(-1));
  mkdirSync(skillDirectory, { recursive: true });
  if (basename(source) === "SKILL.md") {
    walkFiles(dirname(source));
    cpSync(dirname(source), skillDirectory, { recursive: true });
  } else {
    walkFiles(source);
    cpSync(source, join(skillDirectory, "SKILL.md"));
  }
}

const AGENT_PLUGIN_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
const AGENT_PLUGIN_MCP_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json";

function assertPortablePluginInputs(pack) {
  if (pack.id.endsWith("-") || pack.id.includes("--")) {
    throw new Error(
      `Plugin id "${pack.id}" is not Agent Plugins v1 conformant: trailing and doubled hyphens are forbidden.`,
    );
  }
  if (!pack.mcpServerUrl) return;
  let endpoint;
  try {
    endpoint = new URL(pack.mcpServerUrl);
  } catch {
    throw new Error(`Plugin MCP endpoint is not a valid absolute URL: ${pack.mcpServerUrl}`);
  }
  if (
    endpoint.protocol !== "https:" ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash
  ) {
    throw new Error(
      "Plugin MCP endpoint must use HTTPS and must not contain user information, a query, or a fragment.",
    );
  }
}

function renderAuthor(publisher) {
  const author = {
    name: publisher.name,
    url: publisher.homepage,
  };
  if (publisher.email) author.email = publisher.email;
  return author;
}

function renderPortablePluginManifest(pack) {
  const manifest = {
    $schema: AGENT_PLUGIN_SCHEMA,
    name: pack.id,
    version: pack.version,
    description: pack.description,
    author: renderAuthor(pack.publisher),
    homepage: pack.publisher.homepage,
    repository: pack.publisher.repository,
    license: pack.publisher.license,
  };
  if (pack.publisher.keywords?.length) manifest.keywords = pack.publisher.keywords;
  return manifest;
}

function renderPortableMcpManifest(pack) {
  return {
    $schema: AGENT_PLUGIN_MCP_SCHEMA,
    mcpServers: {
      foundry: {
        type: "streamable-http",
        url: pack.mcpServerUrl,
      },
    },
  };
}

function renderCodexMcpManifest(pack) {
  return {
    foundry: {
      type: "http",
      url: pack.mcpServerUrl,
    },
  };
}

function renderClaudeMcpManifest(pack) {
  return {
    mcpServers: {
      foundry: {
        type: "http",
        url: pack.mcpServerUrl,
      },
    },
  };
}

function renderCodexPluginManifest(pack) {
  const firstSkill = pack.skills[0].split("/").at(-1);
  const manifest = {
    name: pack.id,
    version: pack.version,
    description: pack.description,
    author: renderAuthor(pack.publisher),
    homepage: pack.publisher.homepage,
    repository: pack.publisher.repository,
    license: pack.publisher.license,
    skills: "./skills/",
    interface: {
      displayName: pack.displayName,
      shortDescription: renderShortDescription(pack.description),
      longDescription: pack.description,
      developerName: pack.publisher.name,
      category: "Productivity",
      capabilities: ["Skills"],
      websiteURL: pack.publisher.homepage,
      defaultPrompt: [
        `Use $${firstSkill} to begin.`,
        "Apply the selected skill and return evidence for the result.",
      ],
    },
  };
  if (pack.publisher.keywords?.length) manifest.keywords = pack.publisher.keywords;
  if (pack.mcpServerUrl) manifest.mcpServers = "./.mcp.json";
  return manifest;
}

function renderClaudePluginManifest(pack) {
  const manifest = {
    $schema: "https://json.schemastore.org/claude-code-plugin-manifest.json",
    name: pack.id,
    displayName: pack.displayName,
    version: pack.version,
    description: pack.description,
    author: renderAuthor(pack.publisher),
    homepage: pack.publisher.homepage,
    repository: pack.publisher.repository,
    license: pack.publisher.license,
    skills: "./skills/",
  };
  if (pack.publisher.keywords?.length) manifest.keywords = pack.publisher.keywords;
  if (pack.mcpServerUrl) manifest.mcpServers = "./.claude-mcp.json";
  return manifest;
}

function writeKindArtifacts({ root, output, pack, graph }) {
  if (pack.kind === "skill") {
    writeText(join(output, "skill", "SKILL.md"), renderSkill(pack));
    writeText(join(output, "skill", "agents", "openai.yaml"), renderOpenAiYaml(pack));
    return;
  }
  if (pack.kind === "agent") {
    writeText(join(output, "agent", "AGENT.md"), renderAgent(pack));
    writeJson(join(output, "agent", "policy.json"), {
      decisionRights: pack.decisionRights,
      toolPolicy: pack.toolPolicy,
      memoryContract: pack.memoryContract,
      handoffs: pack.handoffs,
      termination: pack.termination,
    });
    return;
  }
  if (pack.kind === "swarm") {
    writeJson(join(output, "swarm", "task-graph.json"), pack);
    return;
  }
  if (pack.kind === "vertical") {
    writeJson(join(output, "vertical", "vertical-pack.json"), pack);
    return;
  }
  if (pack.kind === "plugin") {
    const pluginRoot = join(output, "plugin");
    const targets = new Set(pack.deployment.targets);
    const emitsOpenAi = ["openai-plugin", "chatgpt-work", "codex"].some((target) =>
      targets.has(target),
    );
    const emitsClaude = targets.has("claude-code");

    writeJson(join(pluginRoot, "plugin.json"), renderPortablePluginManifest(pack));
    if (emitsOpenAi) {
      writeJson(
        join(pluginRoot, ".codex-plugin", "plugin.json"),
        renderCodexPluginManifest(pack),
      );
    }
    if (emitsClaude) {
      writeJson(
        join(pluginRoot, ".claude-plugin", "plugin.json"),
        renderClaudePluginManifest(pack),
      );
    }
    if (pack.mcpServerUrl) {
      writeJson(join(pluginRoot, "mcp.json"), renderPortableMcpManifest(pack));
      if (emitsOpenAi) {
        writeJson(join(pluginRoot, ".mcp.json"), renderCodexMcpManifest(pack));
      }
      if (emitsClaude) {
        writeJson(join(pluginRoot, ".claude-mcp.json"), renderClaudeMcpManifest(pack));
      }
    }
    for (const skill of pack.skills) {
      const node = capabilityNode(graph, skill);
      copySkill(root, node, pluginRoot);
    }
  }
}

export function compilePackage({
  root,
  envelope,
  pack,
  output,
  graph,
  registry,
  force = false,
}) {
  assertValid(envelope, getContract(registry, "task-envelope"), registry, "Task Envelope");
  assertValid(pack, getContract(registry, packContractName(pack.kind)), registry, `${pack.kind} pack`);
  assertValid(graph, getContract(registry, "capability-graph"), registry, "Capability Graph");

  if (envelope.kind !== pack.kind) {
    throw new Error(`Task Envelope kind "${envelope.kind}" does not match pack kind "${pack.kind}".`);
  }
  if (pack.id !== envelope.id) {
    throw new Error(`Task Envelope id "${envelope.id}" does not match pack id "${pack.id}".`);
  }
  if (pack.kind === "agent") assertPersistentAgentBoundary(pack);
  if (pack.kind === "plugin") assertPortablePluginInputs(pack);
  assertPackWithinEnvelope(pack, envelope);
  const resolution = resolveCapabilities(envelope, graph);
  assertPackCapabilities(pack, graph, resolution);

  const absoluteOutput = resolve(output);
  prepareOutputDirectory({
    output: absoluteOutput,
    packageId: pack.id,
    force,
    registry,
    root,
  });
  mkdirSync(absoluteOutput, { recursive: true });

  writeJson(join(absoluteOutput, "task-envelope.json"), envelope);
  writeJson(join(absoluteOutput, `${pack.kind}-pack.json`), pack);
  writeJson(join(absoluteOutput, "capability-resolution.json"), resolution);
  writeKindArtifacts({ root, output: absoluteOutput, pack, graph });
  writeText(join(absoluteOutput, "README.md"), renderPackageReadme(envelope, pack, resolution));

  const artifactDigests = hashTree(absoluteOutput);
  const manifest = {
    $schema: "https://starlightintelligence.org/schemas/foundry/foundry-manifest.schema.json",
    schemaVersion: "1.0.0",
    packageId: pack.id,
    packageVersion: pack.version,
    kind: pack.kind,
    compiledAt: new Date().toISOString(),
    compiler: "starlight-foundry/0.1.0",
    sources: {
      envelope: "task-envelope.json",
      pack: `${pack.kind}-pack.json`,
      resolution: "capability-resolution.json",
    },
    deploymentTargets: pack.deployment.targets,
    artifacts: artifactDigests,
    proofCommand: "node tools/foundry/cli.mjs prove <package-directory>",
  };
  assertValid(
    manifest,
    getContract(registry, "foundry-manifest"),
    registry,
    "Foundry Manifest",
  );
  writeJson(join(absoluteOutput, "foundry-manifest.json"), manifest);

  return {
    output: absoluteOutput,
    manifest,
    files: hashTree(absoluteOutput).map((entry) => entry.path),
  };
}

export function inspectCompiledPackage(packageDirectory) {
  const root = resolve(packageDirectory);
  const manifestPath = resolveInside(root, "foundry-manifest.json");
  if (!existsSync(manifestPath)) throw new Error(`No foundry-manifest.json in ${root}`);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  return { root, manifest };
}
