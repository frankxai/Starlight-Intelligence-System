#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "artifacts", "releases", "sip-starter");
const MODULE_PREFIX = "starlight-sip-starter";
const SIP_VERSION = "1.1.1";
const REPO_URL = "https://github.com/frankxai/Starlight-Intelligence-System";
const DOWNLOAD_URL = "https://starlightintelligence.org/download";
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const check = args.has("--check");

const REQUIRED_ROOT_FILES = [
  "AGENTS.md",
  "SKILL.md",
  "MEMORY.md",
  "SOUL.md",
  "STACK.md",
  "CANON.md",
  "SIP.md",
  "SIP-QUICKSTART.md",
];

const PUBLIC_VAULT_FILES = [
  "public-vault/creative.jsonl",
  "public-vault/horizon.jsonl",
  "public-vault/operational.jsonl",
  "public-vault/profile.json",
  "public-vault/strategic.jsonl",
  "public-vault/technical.jsonl",
  "public-vault/wisdom.jsonl",
];

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function posix(path) {
  return path.replace(/\\/g, "/");
}

async function loadPackage() {
  return JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
}

async function loadSourceFiles() {
  const files = [];
  for (const relPath of [...REQUIRED_ROOT_FILES, ...PUBLIC_VAULT_FILES]) {
    const absPath = join(ROOT, relPath);
    if (!existsSync(absPath)) {
      throw new Error(`Required SIP starter source is missing: ${relPath}`);
    }
    files.push({
      path: relPath,
      buffer: await readFile(absPath),
    });
  }
  return files;
}

function generatedFiles(pkg, sourceFiles) {
  const moduleName = `${MODULE_PREFIX}-v${pkg.version}`;
  const sourceFileSummaries = sourceFiles.map((file) => ({
    path: file.path,
    bytes: file.buffer.byteLength,
    sha256: sha256(file.buffer),
  }));

  const starlightModule = {
    name: "starlight-sip-starter",
    version: pkg.version,
    type: "sip-starter",
    conformance: "sip-core",
    sipVersion: SIP_VERSION,
    sourceRepo: REPO_URL,
    releaseUrl: `${REPO_URL}/releases/tag/v${pkg.version}`,
    canonicalDownloadPage: DOWNLOAD_URL,
    npmPackage: pkg.name,
    includedFiles: sourceFileSummaries,
    requires: {
      node: pkg.engines?.node ?? ">=18.0.0",
      mcpClient: "optional",
    },
    upgradePath: {
      fullRuntime: pkg.name,
      install: `npx -p ${pkg.name} starlight init --vaults`,
      docs: "https://starlightintelligence.org/quickstart",
    },
  };

  const mcpExample = {
    mcpServers: {
      "starlight-sis": {
        command: "node",
        args: [
          `node_modules/${pkg.name}/dist/mcp-server.js`,
        ],
      },
    },
  };
  const installTargets = [
    ...REQUIRED_ROOT_FILES,
    ...PUBLIC_VAULT_FILES,
    "README.md",
    "QUICKSTART.md",
    "VALIDATION.md",
    "UPGRADE-PATH.md",
    "EXCELLENCE-CHECKLIST.md",
    "RELEASE-NOTES.md",
    "mcp.json.example",
    "starlight-module.json",
    "install.ps1",
    "install.sh",
    "validate-sip-starter.mjs",
  ];
  const installTargetsJson = JSON.stringify(installTargets, null, 2);
  const installTargetsPs = installTargets
    .map((file) => `  "${file}"`)
    .join(",\n");
  const installTargetsSh = installTargets.join("\n");

  return [
    {
      path: "README.md",
      text: `# Starlight SIP Starter v${pkg.version}

This starter turns any repo or workspace into a SIP-conformant intelligence system seed.

SIP is the Starlight Intelligence Protocol: a portable file contract for memory, agents, provenance, and sovereignty. You can use this starter without adopting the full Starlight runtime.

## What is included

- Core SIP files: AGENTS.md, SKILL.md, MEMORY.md, SOUL.md, STACK.md, CANON.md
- Protocol references: SIP.md and SIP-QUICKSTART.md
- Public vault seeds in public-vault/
- mcp.json.example for optional Starlight runtime integration
- starlight-module.json for automation and release attestation
- Validation and upgrade guidance

## Install

Unpack this archive and run the installer for your operating system. Existing files are skipped unless you opt in to overwrite behavior.

\`\`\`bash
tar -xzf starlight-sip-starter-v${pkg.version}.tar.gz
sh ${moduleName}/install.sh /path/to/your/repo
\`\`\`

On Windows:

\`\`\`powershell
Expand-Archive starlight-sip-starter-v${pkg.version}.zip -DestinationPath .
pwsh .\\${moduleName}\\install.ps1 -TargetPath C:\\path\\to\\your\\repo
\`\`\`

Then read QUICKSTART.md, INSTALL.md, and EXCELLENCE-CHECKLIST.md. Update MEMORY.md, SOUL.md, and CANON.md with your own domain.

## Full runtime path

When you want the operational MCP server, vault tooling, and reference runtime:

\`\`\`bash
npx -p ${pkg.name} starlight init --vaults
\`\`\`

Built on SIP - Starlight Intelligence Protocol v${SIP_VERSION}.
`,
    },
    {
      path: "QUICKSTART.md",
      text: `# Quickstart

1. Copy the starter files into your repo root.
2. Edit MEMORY.md with the first durable decisions, commitments, and open forks for your domain.
3. Edit SOUL.md with the non-drifting essence of the system.
4. Edit CANON.md with the constants, archetypes, and names your agents must preserve.
5. Run the local validator.
6. Add a Built-on-SIP attestation block to the next shared artifact you publish.

Minimum Core conformance requires SKILL.md and MEMORY.md. AGENTS.md is required when you expose more than one agent or role.

Local validation:

\`\`\`bash
node validate-sip-starter.mjs .
\`\`\`

Optional runtime:

\`\`\`bash
npm install ${pkg.name}
node node_modules/${pkg.name}/dist/mcp-server.js --list-tools
\`\`\`

Canonical docs: ${DOWNLOAD_URL}
`,
    },
    {
      path: "VALIDATION.md",
      text: `# Validation

Fast local check:

\`\`\`bash
node validate-sip-starter.mjs .
\`\`\`

Before sharing this module or claiming SIP conformance:

- SKILL.md exists and describes the behavior contract.
- MEMORY.md exists and contains dated durable state.
- AGENTS.md exists if the system has more than one agent or role.
- At least one shared artifact carries a Built-on-SIP attestation block.
- No private secrets, identity vectors, private vaults, or credentials are present.
- starlight-module.json version matches the GitHub Release tag.
- Release artifact checksums match release-manifest.json.

For full Starlight runtime validation, run this from the source repo:

\`\`\`bash
npm run verify
npm run package:sip-starter:check
\`\`\`
`,
    },
    {
      path: "UPGRADE-PATH.md",
      text: `# Upgrade Path

The SIP Starter is the open core. It gives you the portable file contract.

Upgrade when you want:

- MCP tools for agent-accessible memory.
- JSONL vaults and retrieval.
- Starlight reference agents, skills, commands, and operational runbooks.
- Site, cockpit, evaluation, and release discipline surfaces.

Install the full runtime:

\`\`\`bash
npx -p ${pkg.name} starlight init --vaults
\`\`\`

Keep the SIP files as your sovereign layer. The runtime should serve the contract, not replace it.
`,
    },
    {
      path: "INSTALL.md",
      text: `# Install

The starter is designed to be copied into any repo without needing the full runtime.

## Unix/macOS/Linux

\`\`\`bash
sh install.sh /path/to/your/repo
\`\`\`

To overwrite existing files deliberately:

\`\`\`bash
SIP_INSTALL_FORCE=1 sh install.sh /path/to/your/repo
\`\`\`

## Windows PowerShell

\`\`\`powershell
pwsh .\\install.ps1 -TargetPath C:\\path\\to\\your\\repo
\`\`\`

To overwrite existing files deliberately:

\`\`\`powershell
pwsh .\\install.ps1 -TargetPath C:\\path\\to\\your\\repo -Force
\`\`\`

The installer runs validate-sip-starter.mjs after copying files.
`,
    },
    {
      path: "EXCELLENCE-CHECKLIST.md",
      text: `# Excellence Checklist

Use this before publishing, sending to a client, or turning the starter into a vertical intelligence system.

- The repo has a clear purpose in README.md.
- MEMORY.md has dated durable decisions, not transient notes.
- SOUL.md names what must not drift.
- CANON.md names the durable vocabulary, archetypes, and constraints.
- AGENTS.md only lists roles that can be explained and operated.
- SKILL.md describes behavior in operational language.
- public-vault/ contains shareable seeds only.
- starlight-module.json points to the exact release and source.
- The release archive checksum matches the SHA256 file.
- A visible Built-on-SIP attestation exists in the published artifact.
- Private strategy, identities, credentials, and private vaults are absent.
`,
    },
    {
      path: "RELEASE-NOTES.md",
      text: `# Release Notes

## v${pkg.version}

- SIP Core starter package with root intelligence-system files.
- Public vault seed files for creative, horizon, operational, profile, strategic, technical, and wisdom memory.
- Local installers for Unix/macOS/Linux and Windows PowerShell.
- Local validator for package and repo adoption checks.
- Machine-readable starlight-module.json and release-manifest.json support.
- Upgrade path to the full Starlight runtime.

Canonical download page: ${DOWNLOAD_URL}
GitHub release: ${REPO_URL}/releases/tag/v${pkg.version}
`,
    },
    {
      path: "install.ps1",
      text: `param(
  [string]$TargetPath = ".",
  [switch]$Force
)

$ErrorActionPreference = "Stop"
$SourceRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$TargetRoot = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($TargetPath)

New-Item -ItemType Directory -Path $TargetRoot -Force | Out-Null

$Files = @(
${installTargetsPs}
)

foreach ($File in $Files) {
  $Source = Join-Path $SourceRoot $File
  $Destination = Join-Path $TargetRoot $File

  if (-not (Test-Path -LiteralPath $Source)) {
    throw "Missing package file: $File"
  }

  if ((Test-Path -LiteralPath $Destination) -and -not $Force) {
    Write-Host "Skipped existing $File"
    continue
  }

  $DestinationDir = Split-Path -Parent $Destination
  if ($DestinationDir) {
    New-Item -ItemType Directory -Path $DestinationDir -Force | Out-Null
  }

  Copy-Item -LiteralPath $Source -Destination $Destination -Force:$Force
  Write-Host "Installed $File"
}

node (Join-Path $SourceRoot "validate-sip-starter.mjs") $TargetRoot
`,
    },
    {
      path: "install.sh",
      text: `#!/usr/bin/env sh
set -eu

target="\${1:-.}"
force="\${SIP_INSTALL_FORCE:-0}"
source_root="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

mkdir -p "$target"

files='
${installTargetsSh}
'

for file in $files; do
  source_file="$source_root/$file"
  destination_file="$target/$file"

  if [ ! -f "$source_file" ]; then
    echo "Missing package file: $file" >&2
    exit 1
  fi

  if [ -e "$destination_file" ] && [ "$force" != "1" ]; then
    echo "Skipped existing $file"
    continue
  fi

  mkdir -p "$(dirname -- "$destination_file")"
  cp "$source_file" "$destination_file"
  echo "Installed $file"
done

node "$source_root/validate-sip-starter.mjs" "$target"
`,
    },
    {
      path: "validate-sip-starter.mjs",
      text: `#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const targetRoot = process.argv[2] ?? process.cwd();
const requiredFiles = ${installTargetsJson};
const minimumFiles = ["SKILL.md", "MEMORY.md"];
const missing = requiredFiles.filter((file) => !existsSync(join(targetRoot, file)));
const thin = minimumFiles.filter((file) => {
  const path = join(targetRoot, file);
  return existsSync(path) && readFileSync(path, "utf8").trim().length < 80;
});

if (missing.length > 0) {
  console.error("SIP starter validation failed. Missing files:");
  for (const file of missing) console.error("- " + file);
  process.exit(1);
}

if (thin.length > 0) {
  console.error("SIP starter validation failed. These core files look too thin:");
  for (const file of thin) console.error("- " + file);
  process.exit(1);
}

const modulePath = join(targetRoot, "starlight-module.json");
const moduleManifest = JSON.parse(readFileSync(modulePath, "utf8"));
if (moduleManifest.type !== "sip-starter" || moduleManifest.conformance !== "sip-core") {
  console.error("SIP starter validation failed. starlight-module.json must declare sip-starter / sip-core.");
  process.exit(1);
}

console.log("SIP starter validation passed: " + targetRoot);
console.log("Version: " + moduleManifest.version);
console.log("Conformance: " + moduleManifest.conformance);
`,
    },
    {
      path: "mcp.json.example",
      text: `${JSON.stringify(mcpExample, null, 2)}\n`,
    },
    {
      path: "starlight-module.json",
      text: `${JSON.stringify(starlightModule, null, 2)}\n`,
    },
  ];
}

async function stageFiles(moduleName, sourceFiles, generated) {
  const stageDir = join(OUT_DIR, moduleName);
  await rm(stageDir, { recursive: true, force: true });

  const staged = [];
  for (const file of sourceFiles) {
    const dest = join(stageDir, file.path);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, file.buffer);
    staged.push({ path: file.path, buffer: file.buffer });
  }
  for (const file of generated) {
    const buffer = Buffer.from(file.text, "utf8");
    const dest = join(stageDir, file.path);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, buffer);
    staged.push({ path: file.path, buffer });
  }
  staged.sort((a, b) => a.path.localeCompare(b.path));
  return { stageDir, staged };
}

function writeTarHeader(name, size, mtime) {
  const header = Buffer.alloc(512);
  header.write(name, 0, Math.min(Buffer.byteLength(name), 100), "utf8");
  header.write("0000644\0", 100, 8, "ascii");
  header.write("0000000\0", 108, 8, "ascii");
  header.write("0000000\0", 116, 8, "ascii");
  header.write(size.toString(8).padStart(11, "0") + "\0", 124, 12, "ascii");
  header.write(Math.floor(mtime / 1000).toString(8).padStart(11, "0") + "\0", 136, 12, "ascii");
  header.write("        ", 148, 8, "ascii");
  header.write("0", 156, 1, "ascii");
  header.write("ustar\0", 257, 6, "ascii");
  header.write("00", 263, 2, "ascii");
  let sum = 0;
  for (const byte of header) sum += byte;
  header.write(sum.toString(8).padStart(6, "0") + "\0 ", 148, 8, "ascii");
  return header;
}

function makeTarGz(moduleName, files) {
  const chunks = [];
  const mtime = Date.UTC(2026, 0, 1);
  for (const file of files) {
    const entryName = posix(`${moduleName}/${file.path}`);
    if (Buffer.byteLength(entryName) > 100) {
      throw new Error(`Tar entry path is too long for ustar header: ${entryName}`);
    }
    chunks.push(writeTarHeader(entryName, file.buffer.byteLength, mtime));
    chunks.push(file.buffer);
    const padding = (512 - (file.buffer.byteLength % 512)) % 512;
    if (padding) chunks.push(Buffer.alloc(padding));
  }
  chunks.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(chunks), { level: 9, mtime: 0 });
}

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime() {
  const date = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
  const time = (date.getUTCHours() << 11) | (date.getUTCMinutes() << 5) | (date.getUTCSeconds() / 2);
  const day = ((date.getUTCFullYear() - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate();
  return { time: time >>> 0, date: day >>> 0 };
}

function makeZip(moduleName, files) {
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;
  const { time, date } = dosDateTime();

  for (const file of files) {
    const name = Buffer.from(posix(`${moduleName}/${file.path}`), "utf8");
    const crc = crc32(file.buffer);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(file.buffer.byteLength, 18);
    local.writeUInt32LE(file.buffer.byteLength, 22);
    local.writeUInt16LE(name.byteLength, 26);
    local.writeUInt16LE(0, 28);
    localChunks.push(local, name, file.buffer);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(file.buffer.byteLength, 20);
    central.writeUInt32LE(file.buffer.byteLength, 24);
    central.writeUInt16LE(name.byteLength, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralChunks.push(central, name);
    offset += local.byteLength + name.byteLength + file.buffer.byteLength;
  }

  const centralSize = centralChunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localChunks, ...centralChunks, end]);
}

async function writeArtifacts(pkg, moduleName, files) {
  await mkdir(OUT_DIR, { recursive: true });
  const zipName = `${moduleName}.zip`;
  const tarName = `${moduleName}.tar.gz`;
  const zipBuffer = makeZip(moduleName, files);
  const tarBuffer = makeTarGz(moduleName, files);
  const artifacts = [
    { filename: zipName, buffer: zipBuffer },
    { filename: tarName, buffer: tarBuffer },
  ];

  for (const artifact of artifacts) {
    await writeFile(join(OUT_DIR, artifact.filename), artifact.buffer);
  }

  const checksumLines = artifacts
    .map((artifact) => `${sha256(artifact.buffer)}  ${artifact.filename}`)
    .join("\n");
  await writeFile(join(OUT_DIR, `${moduleName}.sha256`), `${checksumLines}\n`);

  const manifest = {
    name: "starlight-sip-starter",
    version: pkg.version,
    type: "sip-starter-release",
    generatedAt: new Date().toISOString(),
    sourceRepo: REPO_URL,
    releaseUrl: `${REPO_URL}/releases/tag/v${pkg.version}`,
    canonicalDownloadPage: DOWNLOAD_URL,
    artifacts: artifacts.map((artifact) => ({
      filename: artifact.filename,
      bytes: artifact.buffer.byteLength,
      sha256: sha256(artifact.buffer),
    })).concat({
      filename: `${moduleName}.sha256`,
      bytes: Buffer.byteLength(`${checksumLines}\n`),
      sha256: sha256(Buffer.from(`${checksumLines}\n`, "utf8")),
    }),
  };
  await writeFile(join(OUT_DIR, "release-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return { artifacts, manifest };
}

async function verifyArtifacts(moduleName, files, manifest) {
  const expected = new Set(files.map((file) => file.path));
  for (const required of [
    "README.md",
    "QUICKSTART.md",
    "INSTALL.md",
    "VALIDATION.md",
    "UPGRADE-PATH.md",
    "EXCELLENCE-CHECKLIST.md",
    "RELEASE-NOTES.md",
    "install.ps1",
    "install.sh",
    "validate-sip-starter.mjs",
    "mcp.json.example",
    "starlight-module.json",
  ]) {
    if (!expected.has(required)) {
      throw new Error(`Generated starter is missing ${required}`);
    }
  }
  for (const artifact of manifest.artifacts) {
    const artifactPath = join(OUT_DIR, artifact.filename);
    if (!existsSync(artifactPath)) {
      throw new Error(`Missing release artifact: ${artifact.filename}`);
    }
    const buffer = await readFile(artifactPath);
    if (buffer.byteLength !== artifact.bytes) {
      throw new Error(`Artifact byte mismatch: ${artifact.filename}`);
    }
    if (sha256(buffer) !== artifact.sha256) {
      throw new Error(`Artifact checksum mismatch: ${artifact.filename}`);
    }
  }
  const moduleManifest = JSON.parse(files.find((file) => file.path === "starlight-module.json").buffer.toString("utf8"));
  if (moduleManifest.conformance !== "sip-core") {
    throw new Error("starlight-module.json must declare sip-core conformance");
  }
  if (moduleManifest.version !== moduleName.replace(`${MODULE_PREFIX}-v`, "")) {
    throw new Error("starlight-module.json version does not match module artifact name");
  }
}

async function main() {
  const pkg = await loadPackage();
  const moduleName = `${MODULE_PREFIX}-v${pkg.version}`;
  const sourceFiles = await loadSourceFiles();
  const generated = generatedFiles(pkg, sourceFiles);
  const allPaths = [...sourceFiles.map((file) => file.path), ...generated.map((file) => file.path)].sort();

  if (dryRun) {
    console.log(`SIP starter dry run: ${moduleName}`);
    console.log(`Would write artifacts to ${relative(ROOT, OUT_DIR)}`);
    for (const file of allPaths) console.log(`- ${file}`);
    return;
  }

  await rm(OUT_DIR, { recursive: true, force: true });
  const { staged } = await stageFiles(moduleName, sourceFiles, generated);
  const { manifest } = await writeArtifacts(pkg, moduleName, staged);

  if (check) {
    await verifyArtifacts(moduleName, staged, manifest);
    console.log(`SIP starter package check passed: ${moduleName}`);
  } else {
    console.log(`SIP starter packaged: ${moduleName}`);
  }
  console.log(`Artifacts: ${posix(relative(ROOT, OUT_DIR))}`);
  console.log(`Files: ${staged.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
