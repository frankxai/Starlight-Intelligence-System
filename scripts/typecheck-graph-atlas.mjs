#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const siteRoot = join(root, "site");
const args = process.argv.slice(2);
const dependencyIndex = args.indexOf("--dependency-root");
const dependencyRoot = dependencyIndex >= 0 ? resolve(args[dependencyIndex + 1]) : siteRoot;
const configPath = join(siteRoot, "tsconfig.json");
const config = ts.parseConfigFileTextToJson(configPath, readFileSync(configPath, "utf8"));
if (config.error) {
  console.error(ts.formatDiagnostic(config.error, formatHost()));
  process.exit(1);
}
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, siteRoot);
const options = { ...parsed.options, noEmit: true, incremental: false, skipLibCheck: true };
const host = ts.createCompilerHost(options);
const defaultResolve = host.resolveModuleNames?.bind(host);
const fallbackFile = join(dependencyRoot, "src", "__graph_atlas_resolution__.ts");

host.resolveModuleNames = (moduleNames, containingFile) => moduleNames.map((name) => {
  const primary = ts.resolveModuleName(name, containingFile, options, host).resolvedModule;
  if (primary) return primary;
  if (name.startsWith(".") || name.startsWith("@/")) return defaultResolve?.([name], containingFile)?.[0];
  return ts.resolveModuleName(name, fallbackFile, options, host).resolvedModule;
});

const files = [
  join(siteRoot, "src/app/graph-atlas/page.tsx"),
  join(siteRoot, "src/app/graph-atlas/GraphAtlasClient.tsx"),
  join(siteRoot, "src/lib/graph-atlas-data.generated.ts"),
];
for (const file of files) {
  if (!existsSync(file)) {
    console.error(`missing ${file}`);
    process.exit(1);
  }
}
const program = ts.createProgram(files, options, host);
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length > 0) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost()));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, files: files.length, dependencyRoot: dependencyRoot === siteRoot ? "site" : "fallback" }));

function formatHost() {
  return {
    getCanonicalFileName: (file) => file,
    getCurrentDirectory: () => root,
    getNewLine: () => "\n",
  };
}
