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
import { dirname, join, relative, resolve, sep } from "node:path";
import { TextDecoder } from "node:util";

const UTF8_DECODER = new TextDecoder("utf-8", { fatal: true });

export function readUtf8(path) {
  try {
    return UTF8_DECODER.decode(readFileSync(path));
  } catch (error) {
    throw new Error(`Cannot decode UTF-8 at ${path}: ${error.message}`);
  }
}

export function readJson(path) {
  try {
    return JSON.parse(readUtf8(path));
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

export function assertNoSymlinkPath(base, candidate) {
  const root = resolve(base);
  const target = resolveInside(root, candidate);
  const parts = relative(root, target).split(sep).filter(Boolean);
  let current = root;
  for (const part of ["", ...parts]) {
    if (part) current = join(current, part);
    if (!existsSync(current)) break;
    if (lstatSync(current).isSymbolicLink()) {
      const path = relative(root, current).split(sep).join("/") || ".";
      throw new Error(`Refusing symbolic link in source path: ${path}`);
    }
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

export function walkFiles(root) {
  const forbiddenNames = new Set([".git", "node_modules"]);
  const results = [];

  const absoluteRoot = resolve(root);

  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = resolve(current, entry.name);
      const path = relative(absoluteRoot, absolute).split(sep).join("/");
      if (entry.isSymbolicLink()) {
        throw new Error(`Refusing symbolic link in artifact tree: ${path}`);
      }
      if (forbiddenNames.has(entry.name)) {
        throw new Error(`Refusing forbidden path in artifact tree: ${path}`);
      }
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

export function verifyFileDigestClosure(root, closure, expectedPaths, label) {
  const expected = [...expectedPaths].sort();
  const actual = closure && typeof closure === "object" && !Array.isArray(closure)
    ? Object.keys(closure).sort()
    : [];
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${label} source closure paths drifted: expected ${expected.join(", ")}, received ${actual.join(", ")}`,
    );
  }

  return expected.map((path) => {
    const expectedSha256 = closure[path];
    if (!/^[a-f0-9]{64}$/u.test(expectedSha256 ?? "")) {
      throw new Error(`${label} source closure has an invalid digest for ${path}`);
    }
    const absolute = assertNoSymlinkPath(root, path);
    if (!existsSync(absolute) || !lstatSync(absolute).isFile()) {
      throw new Error(`${label} source closure file is missing or not regular: ${path}`);
    }
    const actualSha256 = hashFile(absolute).sha256;
    if (actualSha256 !== expectedSha256) {
      throw new Error(
        `${label} source closure digest mismatch for ${path}: expected ${expectedSha256}, received ${actualSha256}`,
      );
    }
    return { path, sha256: actualSha256 };
  });
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
