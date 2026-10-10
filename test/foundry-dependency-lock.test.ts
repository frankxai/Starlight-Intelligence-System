import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { stringify } from "yaml";
import { readPnpmDependencyLock } from "../tools/foundry/lib/dependency-lock.mjs";

test("pnpm provenance follows the root importer and rejects missing or ambiguous registry identity", () => {
  const root = mkdtempSync(join(tmpdir(), "foundry-lock-"));
  const path = join(root, "pnpm-lock.yaml");
  const integrity = "sha512-" + Buffer.alloc(64, 1).toString("base64");
  const fixture = () => ({ lockfileVersion: "9.0", importers: { ".": { devDependencies: {
    ajv: { specifier: "8.20.0", version: "8.20.0" },
    local: { specifier: "workspace:^", version: "link:packages/core" },
  } } }, packages: { "ajv@8.20.0": { resolution: { integrity } },
    "ajv@9.0.0": { resolution: { integrity: "sha512-" + Buffer.alloc(64, 2).toString("base64") } } } });
  const read = (value: any) => { writeFileSync(path, stringify(value)); return readPnpmDependencyLock(path); };
  try {
    assert.deepEqual(read(fixture()).packages, { "node_modules/ajv": { version: "8.20.0", integrity } });
    for (const mutate of [
      (lock: any) => { lock.lockfileVersion = "10.0"; },
      (lock: any) => { delete lock.importers["."]; },
      (lock: any) => { delete lock.packages["ajv@8.20.0"]; },
      (lock: any) => { delete lock.packages["ajv@8.20.0"].resolution.integrity; },
      (lock: any) => { lock.importers["."].devDependencies.ajv.version = "file:elsewhere"; },
      (lock: any) => { delete lock.importers["."].devDependencies.ajv.version; },
    ]) {
      const lock = fixture(); mutate(lock); assert.throws(() => read(lock));
    }
    writeFileSync(path, "lockfileVersion: '9.0'\nlockfileVersion: '10.0'\n");
    assert.throws(() => readPnpmDependencyLock(path));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
