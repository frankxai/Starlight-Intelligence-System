import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import {
  assertNoSymlinkPath,
  hashFile,
  hashTree,
  readJson,
  verifyFileDigestClosure,
} from "./io.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", "..");
const DEFAULT_VENDOR_DIRECTORY = join(
  ROOT,
  "foundry",
  "vendor",
  "agent-plugins",
  "1.0.0",
);
const DEFAULT_TOOLCHAIN_LOCK = join(ROOT, "foundry", "validators", "toolchain.lock.v1.json");
const NPM_LOCK_PATH = join(ROOT, "package-lock.json");
const IMPLEMENTATION_PATH = fileURLToPath(import.meta.url);
const SOURCE_CLOSURE_PATHS = [
  "package-lock.json",
  "package.json",
  "tools/foundry/lib/io.mjs",
  "tools/foundry/lib/upstream-conformance.mjs",
];
const require = createRequire(import.meta.url);
const AJV_VERSION = require("ajv/package.json").version;

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function treeSha256(root) {
  return sha256(Buffer.from(JSON.stringify(hashTree(root))));
}

function canonicalObject(value) {
  if (Array.isArray(value)) return value.map(canonicalObject);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalObject(value[key])]),
    );
  }
  return value;
}

function normalizeAjvErrors(errors = []) {
  return (errors ?? [])
    .map((error) => ({
      path: error.instancePath || "$",
      keyword: error.keyword,
      schemaPath: error.schemaPath,
      message: error.message ?? "schema validation failed",
      params: canonicalObject(error.params ?? {}),
    }))
    .sort((left, right) =>
      `${left.path}|${left.keyword}|${left.schemaPath}`.localeCompare(
        `${right.path}|${right.keyword}|${right.schemaPath}`,
      ),
    );
}

export function verifyAgentPluginSchemaCache(
  vendorDirectory = DEFAULT_VENDOR_DIRECTORY,
  { toolchainLockPath = DEFAULT_TOOLCHAIN_LOCK } = {},
) {
  const directory = resolve(vendorDirectory);
  const provenancePath = assertNoSymlinkPath(directory, "provenance.json");
  if (!existsSync(provenancePath) || !lstatSync(provenancePath).isFile()) {
    throw new Error(`Agent Plugins schema provenance is missing: ${provenancePath}`);
  }
  const provenance = readJson(provenancePath);
  const toolchain = readJson(resolve(toolchainLockPath));
  const npmLock = readJson(NPM_LOCK_PATH);
  const ajvLock = npmLock.packages?.["node_modules/ajv"];
  const portableLock = toolchain.portable;
  const sourceClosure = verifyFileDigestClosure(
    ROOT,
    portableLock?.validator?.sourceClosure,
    SOURCE_CLOSURE_PATHS,
    "Portable Agent Plugins validator",
  );
  const actualProvenanceSha256 = hashFile(provenancePath).sha256;
  const implementationSha256 = hashFile(IMPLEMENTATION_PATH).sha256;
  if (
    portableLock?.specification !== `Agent Plugins ${provenance.specificationVersion}` ||
    portableLock?.sourceCommit !== provenance.upstreamCommit ||
    portableLock?.provenanceSha256 !== actualProvenanceSha256 ||
    portableLock?.validator?.version !== AJV_VERSION ||
    portableLock?.validator?.version !== ajvLock?.version ||
    portableLock?.validator?.integrity !== ajvLock?.integrity ||
    portableLock?.validator?.implementationPath !== "tools/foundry/lib/upstream-conformance.mjs" ||
    portableLock?.validator?.implementationSha256 !== implementationSha256
  ) {
    throw new Error("Agent Plugins validator, provenance, or source commit drifted from the reviewed toolchain lock");
  }
  const schemaNames = ["plugin.schema.json", "mcp.schema.json"];
  const schemas = {};
  const records = [];

  for (const name of schemaNames) {
    const record = provenance.schemas?.[name];
    if (
      !record?.source ||
      !record?.immutableSource ||
      !/^[a-f0-9]{40}$/.test(record?.gitBlob ?? "") ||
      !/^[a-f0-9]{64}$/.test(record?.sha256 ?? "") ||
      !Number.isInteger(record?.bytes)
    ) {
      throw new Error(`Agent Plugins provenance is incomplete for ${name}`);
    }
    const path = assertNoSymlinkPath(directory, name);
    if (!existsSync(path) || !lstatSync(path).isFile()) {
      throw new Error(`Vendored Agent Plugins schema is missing: ${path}`);
    }
    const bytes = readFileSync(path);
    const actualSha256 = sha256(bytes);
    const lockedSchema = portableLock.schemas?.[name];
    if (
      lockedSchema?.gitBlob !== record.gitBlob ||
      lockedSchema?.sha256 !== record.sha256 ||
      lockedSchema?.bytes !== record.bytes
    ) {
      throw new Error(`Agent Plugins ${name} provenance drifted from the reviewed toolchain lock`);
    }
    if (actualSha256 !== record.sha256) {
      throw new Error(
        `Vendored Agent Plugins schema digest mismatch for ${name}: expected ${record.sha256}, received ${actualSha256}`,
      );
    }
    if (bytes.byteLength !== record.bytes) {
      throw new Error(
        `Vendored Agent Plugins schema byte length mismatch for ${name}: expected ${record.bytes}, received ${bytes.byteLength}`,
      );
    }
    schemas[name] = JSON.parse(bytes.toString("utf8"));
    records.push({
      name,
      source: record.source,
      immutableSource: record.immutableSource,
      gitBlob: record.gitBlob,
      sha256: actualSha256,
      bytes: bytes.byteLength,
      cacheVerified: true,
    });
  }

  return {
    specificationVersion: provenance.specificationVersion,
    sourceCommit: provenance.upstreamCommit,
    license: provenance.license?.spdx,
    provenanceSha256: actualProvenanceSha256,
    toolchainLockSha256: hashFile(resolve(toolchainLockPath)).sha256,
    validator: {
      package: "ajv",
      version: AJV_VERSION,
      integrity: ajvLock.integrity,
      implementationSha256,
      packageLockSha256: hashFile(NPM_LOCK_PATH).sha256,
      sourceClosure,
    },
    records,
    schemas,
  };
}

export function validateAgentPluginValue({
  kind,
  value,
  vendorDirectory = DEFAULT_VENDOR_DIRECTORY,
}) {
  const schemaName = kind === "plugin" ? "plugin.schema.json" : kind === "mcp" ? "mcp.schema.json" : null;
  if (!schemaName) throw new Error(`Unknown Agent Plugins manifest kind: ${kind}`);
  const cache = verifyAgentPluginSchemaCache(vendorDirectory);
  const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
  const validate = ajv.compile(cache.schemas[schemaName]);
  const valid = Boolean(validate(value));
  return {
    valid,
    errors: normalizeAjvErrors(validate.errors),
    validator: {
      name: "agent-plugins-json-schema",
      implementation: "ajv",
      ...cache.validator,
      dialect: "https://json-schema.org/draft/2020-12/schema",
    },
    schema: cache.records.find((record) => record.name === schemaName),
    provenanceSha256: cache.provenanceSha256,
    toolchainLockSha256: cache.toolchainLockSha256,
  };
}

export function validateAgentPluginPackage(
  packageDirectory,
  { vendorDirectory = DEFAULT_VENDOR_DIRECTORY } = {},
) {
  const directory = resolve(packageDirectory);
  if (!existsSync(directory) || !lstatSync(directory).isDirectory()) {
    throw new Error(`Agent Plugin package directory does not exist: ${directory}`);
  }
  if (lstatSync(directory).isSymbolicLink()) {
    throw new Error(`Refusing symbolic link as Agent Plugin package root: ${directory}`);
  }

  const checks = [];
  let portableManifest = null;
  for (const [kind, required] of [["plugin", true], ["mcp", false]]) {
    const name = `${kind}.json`;
    const path = assertNoSymlinkPath(directory, name);
    if (!existsSync(path)) {
      checks.push({ file: name, required, present: false, valid: !required, errors: [] });
      continue;
    }
    if (!lstatSync(path).isFile()) {
      throw new Error(`Agent Plugins manifest is not a regular file: ${path}`);
    }
    let value;
    try {
      value = readJson(path);
      if (kind === "plugin") portableManifest = value;
    } catch (error) {
      checks.push({
        file: name,
        required,
        present: true,
        sha256: hashFile(path).sha256,
        valid: false,
        errors: [{
          path: "$",
          keyword: "parse",
          schemaPath: "",
          message: error.message,
          params: {},
        }],
      });
      continue;
    }
    const result = validateAgentPluginValue({ kind, value, vendorDirectory });
    checks.push({
      file: name,
      required,
      present: true,
      sha256: hashFile(path).sha256,
      valid: result.valid,
      errors: result.errors,
      schema: result.schema,
    });
  }

  const cache = verifyAgentPluginSchemaCache(vendorDirectory);
  return {
    schemaVersion: "1.0.0",
    subject: {
      type: "agent-plugin-package",
      name: portableManifest?.name ?? basename(directory),
      version: portableManifest?.version ?? null,
      manifestSha256: checks.find((check) => check.file === "plugin.json")?.sha256 ?? null,
      packageTreeSha256: treeSha256(directory),
    },
    validator: {
      name: "agent-plugins-json-schema",
      implementation: "ajv",
      ...cache.validator,
      dialect: "https://json-schema.org/draft/2020-12/schema",
    },
    invocation: {
      argv: [
        "node",
        "tools/foundry/cli.mjs",
        "conformance",
        "<agent-plugin-dir>",
        "--out",
        "<report.json>",
      ],
      output: {
        mediaType: "application/json",
        channels: ["stdout", "--out file"],
        content: "this report",
      },
    },
    upstream: {
      specificationVersion: cache.specificationVersion,
      sourceCommit: cache.sourceCommit,
      license: cache.license,
      provenanceSha256: cache.provenanceSha256,
      toolchainLockSha256: cache.toolchainLockSha256,
      schemas: cache.records,
    },
    checks,
    status: checks.every((check) => check.valid) ? "pass" : "fail",
    claimBoundary: "Schema conformance is package evidence only; it is not a host install, runtime, publication, or support claim.",
  };
}
