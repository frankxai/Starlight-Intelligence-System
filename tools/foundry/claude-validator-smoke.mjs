#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
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
const MANIFEST_PATH = join(PLUGIN, ".claude-plugin", "plugin.json");
const MANIFEST = readJson(MANIFEST_PATH);
const TOOLCHAIN_LOCK_PATH = join(ROOT, "foundry", "validators", "toolchain.lock.v1.json");
const TOOLCHAIN_LOCK = readJson(TOOLCHAIN_LOCK_PATH);
const NATIVE_LOCK_PATH = join(NATIVE_ROOT, "package-lock.json");
const NPM_LOCK = readJson(NATIVE_LOCK_PATH);
const CLAUDE_LOCK = NPM_LOCK.packages["node_modules/@anthropic-ai/claude-code"];
const CLAUDE_PACKAGE = readJson(
  join(NATIVE_ROOT, "node_modules", "@anthropic-ai", "claude-code", "package.json"),
);
const SOURCE_CLOSURE_PATHS = [
  "foundry/validators/native/package-lock.json",
  "foundry/validators/native/package.json",
  "tools/foundry/claude-validator-smoke.mjs",
  "tools/foundry/lib/io.mjs",
  "tools/foundry/lib/package-payload.mjs",
];
const OUTPUT_INDEX = process.argv.indexOf("--out");
const OUTPUT = OUTPUT_INDEX >= 0 ? process.argv[OUTPUT_INDEX + 1] : null;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function redact(value, configDirectory) {
  return String(value)
    .replaceAll(configDirectory, "<CLAUDE_TEST_CONFIG>")
    .replaceAll(ROOT, "<REPOSITORY_ROOT>");
}

function isolatedEnvironment(configDirectory) {
  const allowed = ["PATH", "PATHEXT", "SYSTEMROOT", "WINDIR", "COMSPEC", "TMPDIR", "TEMP", "TMP", "LANG", "LC_ALL", "TERM", "TZ"];
  const env = Object.fromEntries(
    allowed.filter((key) => process.env[key] !== undefined).map((key) => [key, process.env[key]]),
  );
  return {
    ...env,
    HOME: configDirectory,
    USERPROFILE: configDirectory,
    CLAUDE_CONFIG_DIR: configDirectory,
  };
}

function run(binary, args, env, configDirectory) {
  const execution = spawnSync(binary, args, {
    cwd: ROOT,
    env,
    encoding: "utf8",
    shell: false,
    timeout: 30_000,
  });
  const stdout = redact(execution.stdout ?? "", configDirectory);
  const stderr = redact(execution.stderr ?? "", configDirectory);
  return {
    argv: ["claude", ...args.map((arg) => redact(arg, configDirectory))],
    exitCode: execution.status,
    signal: execution.signal,
    stdoutSha256: sha256(stdout),
    stderrSha256: sha256(stderr),
    stdout,
    stderr,
  };
}

function main() {
  const expected = TOOLCHAIN_LOCK.claude.strictValidator;
  const sourceClosure = verifyFileDigestClosure(
    ROOT,
    expected.sourceClosure,
    SOURCE_CLOSURE_PATHS,
    "Claude strict validator smoke",
  );
  if (
    expected.state !== "active" ||
    CLAUDE_PACKAGE.version !== expected.version ||
    CLAUDE_LOCK?.version !== expected.version ||
    CLAUDE_LOCK?.integrity !== expected.integrity
  ) {
    throw new Error(`Claude validator lock drift: expected ${expected.version}, installed ${CLAUDE_PACKAGE.version}`);
  }
  const isMusl =
    process.platform === "linux" &&
    !process.report?.getReport()?.header?.glibcVersionRuntime;
  const platformKey = `${process.platform}-${process.arch}${isMusl ? "-musl" : ""}`;
  const platformExpected = expected.platformPackages?.[platformKey];
  const platformLocked = platformExpected
    ? NPM_LOCK.packages[`node_modules/${platformExpected.package}`]
    : null;
  if (
    !platformExpected ||
    platformLocked?.version !== platformExpected.version ||
    platformLocked?.integrity !== platformExpected.integrity
  ) {
    throw new Error(`Claude platform binary is not pinned for ${platformKey}`);
  }
  const configDirectory = mkdtempSync(join(tmpdir(), "starlight-claude-validator-"));
  const binary = join(
    NATIVE_ROOT,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "claude.cmd" : "claude",
  );
  const env = isolatedEnvironment(configDirectory);
  try {
    const commands = [
      run(binary, ["--version"], env, configDirectory),
      run(binary, ["plugin", "validate", PLUGIN, "--strict"], env, configDirectory),
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
        name: "claude-plugin-validate-strict",
        authority: expected.authority,
        package: expected.package,
        version: expected.version,
        integrity: expected.integrity,
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
      commands,
      status: commands.every((command) => command.exitCode === 0) ? "pass" : "fail",
      claimBoundary: "Claude strict validation proves native package structure only. It is not installation, connected runtime, marketplace review, publication, or support evidence.",
    };
    if (OUTPUT) writeJson(resolve(OUTPUT), report);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    if (report.status !== "pass") process.exitCode = 1;
  } finally {
    rmSync(configDirectory, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  console.error(`Claude validator smoke error: ${error.message}`);
  process.exitCode = 1;
}
