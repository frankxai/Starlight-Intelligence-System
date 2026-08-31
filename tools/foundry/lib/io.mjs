import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, relative, resolve, sep } from "node:path";

export function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read JSON at ${path}: ${error.message}`);
  }
}

export function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function writeText(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value.endsWith("\n") ? value : `${value}\n`, "utf8");
}

export function resolveInside(base, candidate) {
  const root = resolve(base);
  const target = resolve(root, candidate);
  if (target !== root && !target.startsWith(`${root}${sep}`)) {
    throw new Error(`Path escapes allowed root: ${candidate}`);
  }
  return target;
}

export function assertEmptyOrMissing(path, force = false) {
  if (!existsSync(path)) return;
  const stat = statSync(path);
  if (!stat.isDirectory()) {
    throw new Error(`Output path exists and is not a directory: ${path}`);
  }
  if (!force && readdirSync(path).length > 0) {
    throw new Error(`Output directory is not empty: ${path}. Pass --force to replace generated files.`);
  }
}

export function walkFiles(root, options = {}) {
  const ignored = new Set(options.ignored ?? [".git", "node_modules"]);
  const results = [];

  const absoluteRoot = resolve(root);

  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = resolve(current, entry.name);
      if (entry.isSymbolicLink()) {
        const path = relative(absoluteRoot, absolute).split(sep).join("/");
        throw new Error(`Refusing symbolic link in artifact tree: ${path}`);
      }
      if (ignored.has(entry.name)) continue;
      if (entry.isDirectory()) {
        walk(absolute);
      } else if (entry.isFile()) {
        results.push(absolute);
      }
    }
  }

  if (existsSync(absoluteRoot)) {
    const rootStat = lstatSync(absoluteRoot);
    if (rootStat.isSymbolicLink()) {
      throw new Error("Refusing symbolic link in artifact tree: .");
    }
    if (rootStat.isFile()) results.push(absoluteRoot);
    if (rootStat.isDirectory()) walk(absoluteRoot);
  }
  return results.sort();
}

export function hashFile(path) {
  const bytes = readFileSync(path);
  return {
    sha256: createHash("sha256").update(bytes).digest("hex"),
    bytes: bytes.byteLength,
  };
}

export function hashTree(root, options = {}) {
  const exclude = new Set(options.exclude ?? []);
  return walkFiles(root)
    .map((absolute) => {
      const path = relative(root, absolute).split(sep).join("/");
      if (exclude.has(path)) return null;
      return { path, ...hashFile(absolute) };
    })
    .filter(Boolean);
}

export function slugToTitle(slug) {
  return slug
    .split(/[-/]/)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function yamlQuote(value) {
  return JSON.stringify(String(value));
}
