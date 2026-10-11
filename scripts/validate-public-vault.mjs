#!/usr/bin/env node
/**
 * Validate vault-registry.json + in-repo public vaults + the contributor template.
 * Zero npm deps. `node scripts/validate-public-vault.mjs`
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CATEGORIES = [
  "strategic",
  "technical",
  "creative",
  "operational",
  "wisdom",
  "horizon",
];
const SECRET_KEYS = new Set([
  "api_key",
  "apikey",
  "password",
  "token",
  "secret",
  "private_key",
  "authorization",
  "access_token",
]);
const ISO =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export function parseJsonl(text, source) {
  const errors = [];
  const records = [];
  const lines = String(text).replace(/^\uFEFF/, "").split(/\r?\n/);
  lines.forEach((raw, index) => {
    if (!raw.trim()) return;
    try {
      const record = JSON.parse(raw.replace(/^\uFEFF/, ""));
      records.push({ record, source: `${source}:${index + 1}` });
    } catch (err) {
      errors.push(`${source}:${index + 1}: invalid JSON (${err.message})`);
    }
  });
  return { records, errors };
}

export function validateEntry(record, source, { allowExample = false } = {}) {
  const errors = [];
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return [`${source}: record must be a JSON object`];
  }
  for (const key of Object.keys(record)) {
    if (SECRET_KEYS.has(key.toLowerCase())) {
      errors.push(`${source}: forbidden field '${key}'`);
    }
  }
  if (record.privacy === "private" || record.privacy === "secret") {
    errors.push(`${source}: private/secret entries cannot be public`);
  }
  if (typeof record.id !== "string" || !record.id.trim()) {
    errors.push(`${source}: missing id`);
  }
  const text = record.wish || record.insight || record.meditation;
  if (typeof text !== "string" || !text.trim()) {
    errors.push(`${source}: need wish, insight, or meditation`);
  }
  if (typeof record.createdAt !== "string" || !ISO.test(record.createdAt)) {
    errors.push(`${source}: createdAt must be ISO-8601`);
  }
  if (record.tags && (!Array.isArray(record.tags) || record.tags.some((t) => typeof t !== "string"))) {
    errors.push(`${source}: tags must be an array of strings`);
  }
  if (
    !allowExample &&
    Array.isArray(record.tags) &&
    record.tags.includes("example")
  ) {
    errors.push(`${source}: example/template lines cannot ship in public-vault/`);
  }
  return errors;
}

export function validateProfile(profile, source) {
  const errors = [];
  if (!profile || typeof profile !== "object") {
    return [`${source}: profile.json must be an object`];
  }
  for (const key of ["name", "bio", "avatar"]) {
    if (typeof profile[key] !== "string" || !profile[key].trim()) {
      errors.push(`${source}: missing ${key}`);
    }
  }
  return errors;
}

export function validateRegistry(registry) {
  const errors = [];
  const vaults = registry?.vaults;
  if (!Array.isArray(vaults) || vaults.length === 0) {
    return ["vault-registry.json: vaults[] is required"];
  }
  const seen = new Map();
  for (const [i, vault] of vaults.entries()) {
    const where = `vault-registry.json[${i}]`;
    for (const key of ["slug", "name", "repo", "path", "avatar", "bio"]) {
      if (typeof vault[key] !== "string" || !vault[key].trim()) {
        errors.push(`${where}: missing ${key}`);
      }
    }
    if (vault.slug) {
      if (!/^[a-z0-9-]+$/.test(vault.slug)) {
        errors.push(`${where}: slug must be lowercase kebab-case`);
      }
      if (seen.has(vault.slug)) {
        errors.push(`${where}: duplicate slug '${vault.slug}'`);
      } else {
        seen.set(vault.slug, where);
      }
    }
    if (vault.slug === "horizon") {
      errors.push(`${where}: slug cannot be a vault name; slugs are people`);
    }
    if (vault.repo && !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(vault.repo)) {
      errors.push(`${where}: repo must be owner/name`);
    }
  }
  return errors;
}

function readJson(path, source) {
  try {
    return { value: JSON.parse(readFileSync(path, "utf8")), errors: [] };
  } catch (err) {
    return { value: null, errors: [`${source}: ${err.message}`] };
  }
}

export function validateVaultDir(dir, { allowExample = false, label } = {}) {
  const errors = [];
  const profilePath = join(dir, "profile.json");
  if (!existsSync(profilePath)) {
    errors.push(`${label}/profile.json: missing`);
  } else {
    const { value, errors: parseErrors } = readJson(profilePath, `${label}/profile.json`);
    errors.push(...parseErrors);
    if (value) errors.push(...validateProfile(value, `${label}/profile.json`));
  }
  for (const cat of CATEGORIES) {
    const file = join(dir, `${cat}.jsonl`);
    if (!existsSync(file)) {
      errors.push(`${label}/${cat}.jsonl: missing`);
      continue;
    }
    const text = readFileSync(file, "utf8");
    const { records, errors: lineErrors } = parseJsonl(text, `${label}/${cat}.jsonl`);
    errors.push(...lineErrors);
    for (const { record, source } of records) {
      errors.push(...validateEntry(record, source, { allowExample }));
    }
  }
  return errors;
}

export function validateRepo(root = ROOT) {
  const errors = [];
  const registryPath = join(root, "vault-registry.json");
  if (!existsSync(registryPath)) {
    return ["vault-registry.json: missing"];
  }
  const { value: registry, errors: parseErrors } = readJson(
    registryPath,
    "vault-registry.json"
  );
  errors.push(...parseErrors);
  if (registry) errors.push(...validateRegistry(registry));

  const templateDir = join(root, "templates", "public-vault");
  errors.push(
    ...validateVaultDir(templateDir, {
      allowExample: true,
      label: "templates/public-vault",
    })
  );

  if (registry?.vaults) {
    for (const vault of registry.vaults) {
      if (vault.repo !== "frankxai/Starlight-Intelligence-System") continue;
      const dir = join(root, vault.path);
      errors.push(
        ...validateVaultDir(dir, {
          allowExample: false,
          label: vault.path,
        })
      );
    }
  }
  return errors;
}

function isMain() {
  if (!process.argv[1]) return false;
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
}

if (isMain()) {
  const errors = validateRepo(ROOT);
  if (errors.length) {
    console.error(`Public vault invalid (${errors.length} error(s)):`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  console.log("Public vault registry + template valid.");
}
