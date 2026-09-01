#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { hashFile, readJson, verifyFileDigestClosure, writeJson } from "./lib/io.mjs";
import { openAIPluginPayload } from "./lib/package-payload.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const NATIVE_ROOT = join(ROOT, "foundry", "validators", "native");
const PLUGIN = join(ROOT, "plugins", "starlight-foundry");
const MANIFEST_PATH = join(PLUGIN, ".codex-plugin", "plugin.json");
const MANIFEST = readJson(MANIFEST_PATH);
const CODEX_PACKAGE = readJson(
  join(NATIVE_ROOT, "node_modules", "@openai", "codex", "package.json"),
);
const TOOLCHAIN_LOCK_PATH = join(ROOT, "foundry", "validators", "toolchain.lock.v1.json");
const TOOLCHAIN_LOCK = readJson(TOOLCHAIN_LOCK_PATH);
const NATIVE_LOCK_PATH = join(NATIVE_ROOT, "package-lock.json");
const NPM_LOCK = readJson(NATIVE_LOCK_PATH);
const CODEX_LOCK = NPM_LOCK.packages["node_modules/@openai/codex"];
const SOURCE_CLOSURE_PATHS = [
  "foundry/validators/native/package-lock.json",
  "foundry/validators/native/package.json",
  "tools/foundry/codex-loader-smoke.mjs",
  "tools/foundry/lib/io.mjs",
  "tools/foundry/lib/package-payload.mjs",
];
const OUTPUT_INDEX = process.argv.indexOf("--out");
const OUTPUT = OUTPUT_INDEX >= 0 ? process.argv[OUTPUT_INDEX + 1] : null;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function redact(value, home) {
  return String(value)
    .replaceAll(home, "<CODEX_TEST_HOME>")
    .replaceAll(ROOT, "<REPOSITORY_ROOT>");
}

function isolatedEnvironment(home) {
  const allowed = ["PATH", "PATHEXT", "SYSTEMROOT", "WINDIR", "COMSPEC", "TMPDIR", "TEMP", "TMP", "LANG", "LC_ALL", "TERM", "TZ"];
  const env = Object.fromEntries(
    allowed.filter((key) => process.env[key] !== undefined).map((key) => [key, process.env[key]]),
  );
  return { ...env, HOME: home, USERPROFILE: home, CODEX_HOME: home };
}

function commandRecord(binary, args, env, home) {
  const execution = spawnSync(binary, args, {
    cwd: ROOT,
    env,
    encoding: "utf8",
    shell: false,
    timeout: 30_000,
  });
  const stdout = redact(execution.stdout ?? "", home);
  const stderr = redact(execution.stderr ?? "", home);
  return {
    argv: ["codex", ...args.map((arg) => redact(arg, home))],
    exitCode: execution.status,
    signal: execution.signal,
    stdoutSha256: sha256(stdout),
    stderrSha256: sha256(stderr),
    stdout,
    stderr,
  };
}

function pluginEntries(record) {
  try {
    const value = JSON.parse(record.stdout);
    return Array.isArray(value)
      ? value
      : [
          ...(Array.isArray(value.installed) ? value.installed : []),
          ...(Array.isArray(value.available) ? value.available : []),
          ...(Array.isArray(value.plugins) ? value.plugins : []),
          ...(value.name ? [value] : []),
        ];
  } catch {
    return [];
  }
}

function hasPlugin(record, { installed, requireSource = true }) {
  return pluginEntries(record).some((plugin) => {
      const name = plugin.name ?? plugin.plugin?.name;
      const isInstalled = Boolean(plugin.installed ?? plugin.installation?.installed);
      const source = String(plugin.source?.path ?? "").replaceAll("\\", "/");
      return (
        name === MANIFEST.name &&
        plugin.version === MANIFEST.version &&
        plugin.marketplaceName === "starlight-local" &&
        (!requireSource || source === "<REPOSITORY_ROOT>/plugins/starlight-foundry") &&
        (installed === undefined || isInstalled === installed)
      );
    });
}

function main() {
  const sourceClosure = verifyFileDigestClosure(
    ROOT,
    TOOLCHAIN_LOCK.openai?.codexLoader?.sourceClosure,
    SOURCE_CLOSURE_PATHS,
    "Codex loader smoke",
  );
  if (
    CODEX_PACKAGE.version !== TOOLCHAIN_LOCK.openai.codexLoader.version ||
    CODEX_LOCK?.version !== TOOLCHAIN_LOCK.openai.codexLoader.version ||
    CODEX_LOCK?.integrity !== TOOLCHAIN_LOCK.openai.codexLoader.integrity
  ) {
    throw new Error(
      `Codex loader lock drift: expected ${TOOLCHAIN_LOCK.openai.codexLoader.version}, installed ${CODEX_PACKAGE.version}`,
    );
  }
  const platformKey = `${process.platform}-${process.arch}`;
  const platformExpected = TOOLCHAIN_LOCK.openai.codexLoader.platformPackages?.[platformKey];
  const platformLocked = platformExpected
    ? NPM_LOCK.packages[`node_modules/${platformExpected.package}`]
    : null;
  if (
    !platformExpected ||
    platformLocked?.version !== platformExpected.version ||
    platformLocked?.integrity !== platformExpected.integrity
  ) {
    throw new Error(`Codex platform binary is not pinned for ${platformKey}`);
  }
  const home = mkdtempSync(join(tmpdir(), "starlight-codex-loader-"));
  const binary = join(
    NATIVE_ROOT,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "codex.cmd" : "codex",
  );
  const env = isolatedEnvironment(home);
  const commands = [];
  try {
    commands.push(commandRecord(binary, ["--version"], env, home));
    commands.push(commandRecord(binary, ["plugin", "marketplace", "add", ROOT, "--json"], env, home));
    const available = commandRecord(binary, ["plugin", "list", "--available", "--json"], env, home);
    commands.push(available);
    commands.push(
      commandRecord(binary, ["plugin", "add", `${MANIFEST.name}@starlight-local`, "--json"], env, home),
    );
    const added = commands.at(-1);
    const installed = commandRecord(binary, ["plugin", "list", "--json"], env, home);
    commands.push(installed);
    const installedCache = join(
      home,
      "plugins",
      "cache",
      "starlight-local",
      MANIFEST.name,
      MANIFEST.version,
    );
    const installedCacheIdentity = existsSync(installedCache)
      ? {
          manifestSha256: hashFile(join(installedCache, ".codex-plugin", "plugin.json")).sha256,
          packagePayloadSha256: openAIPluginPayload(installedCache).sha256,
        }
      : null;
    commands.push(
      commandRecord(binary, ["plugin", "remove", `${MANIFEST.name}@starlight-local`, "--json"], env, home),
    );
    const removed = commandRecord(binary, ["plugin", "list", "--json"], env, home);
    commands.push(removed);
    commands.push(
      commandRecord(binary, ["plugin", "marketplace", "remove", "starlight-local", "--json"], env, home),
    );

    const assertions = [
      {
        id: "all-commands-exit-zero",
        passed: commands.every((command) => command.exitCode === 0),
      },
      { id: "marketplace-discovers-plugin", passed: hasPlugin(available, { installed: undefined }) },
      {
        id: "install-command-reports-version",
        passed: hasPlugin(added, { installed: undefined, requireSource: false }),
      },
      { id: "plugin-reports-installed", passed: hasPlugin(installed, { installed: true }) },
      {
        id: "installed-cache-matches-source",
        passed:
          installedCacheIdentity?.manifestSha256 === hashFile(MANIFEST_PATH).sha256 &&
          installedCacheIdentity?.packagePayloadSha256 === openAIPluginPayload(PLUGIN).sha256,
      },
      { id: "plugin-removed", passed: !hasPlugin(removed, { installed: true }) },
    ];
    const report = {
      schemaVersion: "1.0.0",
      subject: {
        name: MANIFEST.name,
        version: MANIFEST.version,
        manifestSha256: hashFile(MANIFEST_PATH).sha256,
        packagePayloadSha256: openAIPluginPayload(PLUGIN).sha256,
      },
      validator: {
        name: "official-codex-loader-smoke",
        authority: TOOLCHAIN_LOCK.openai.codexLoader.authority,
        package: "@openai/codex",
        version: CODEX_PACKAGE.version,
        integrity: CODEX_LOCK.integrity,
        platformPackage: {
          name: platformExpected.package,
          version: platformLocked.version,
          integrity: platformLocked.integrity,
        },
        toolchainLockSha256: sha256(readFileSync(TOOLCHAIN_LOCK_PATH)),
        packageLockSha256: sha256(readFileSync(NATIVE_LOCK_PATH)),
        sourceClosure,
      },
      environment: {
        platform: process.platform,
        architecture: process.arch,
        node: process.version,
      },
      lifecycle: ["version", "marketplace-add", "discover", "install", "list", "remove", "verify-removal", "marketplace-remove"],
      installedCache: installedCacheIdentity,
      commands,
      assertions,
      status: assertions.every((assertion) => assertion.passed) ? "pass" : "fail",
      claimBoundary: "A Codex loader lifecycle is local host evidence only. It is not ChatGPT runtime, Platform upload, the OpenAI skill safety/security scan, directory review, publication, or support evidence. Scan Tools remains specific to a future MCP-backed candidate.",
    };
    if (OUTPUT) writeJson(resolve(OUTPUT), report);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    if (report.status !== "pass") process.exitCode = 1;
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  console.error(`Codex loader smoke error: ${error.message}`);
  process.exitCode = 1;
}
