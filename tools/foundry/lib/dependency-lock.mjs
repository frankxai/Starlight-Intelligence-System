import { parse } from "yaml";
import { readUtf8 } from "./io.mjs";

/** Resolve only the root importer's exact registry dependencies, never a transitive match. */
export function readPnpmDependencyLock(path) {
  const lock = parse(readUtf8(path));
  if (lock?.lockfileVersion !== "9.0" || !lock.importers?.["."] || !lock.packages) {
    throw new Error("Unsupported or incomplete pnpm dependency lock");
  }
  const importer = lock.importers["."];
  const packages = {};
  for (const [name, reference] of Object.entries({ ...importer.dependencies, ...importer.devDependencies })) {
    if (typeof reference?.version !== "string") throw new Error(`Missing root dependency version: ${name}`);
    // Local packages cannot establish registry validator provenance.
    if (reference.version.startsWith("link:")) continue;
    const version = reference.version.split("(")[0];
    if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
      throw new Error(`Non-registry root dependency: ${name}`);
    }
    const integrity = lock.packages[`${name}@${version}`]?.resolution?.integrity;
    if (typeof integrity !== "string" || !/^sha512-[A-Za-z0-9+/]+={0,2}$/.test(integrity)) {
      throw new Error(`Missing root dependency integrity: ${name}`);
    }
    packages[`node_modules/${name}`] = { version, integrity };
  }
  return { packages };
}
