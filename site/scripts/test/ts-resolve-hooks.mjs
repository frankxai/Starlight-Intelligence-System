/**
 * Module hooks for node's test runner. Test-only: the app itself is built by
 * Turbopack and never loads this file.
 *
 * resolve  lets a test import the extensionless relative specifiers that
 *          Next's bundler expects ("./provider") by trying the TypeScript
 *          file next to them.
 * load     turns a .ts or .tsx file into JavaScript with the TypeScript
 *          compiler the site already has as a devDependency
 *          (transpileModule: types removed, nothing type-checked). Node 20
 *          has no type stripping and Node 22 has it only behind a flag or in
 *          later minors, so the suite does its own and runs the same on both.
 *          `npx tsc --noEmit` is the type check.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const SUFFIXES = [".ts", ".tsx", "/index.ts"];

export async function resolve(specifier, context, next) {
  if (!specifier.startsWith(".")) return next(specifier, context);
  try {
    return await next(specifier, context);
  } catch (error) {
    for (const suffix of SUFFIXES) {
      try {
        return await next(specifier + suffix, context);
      } catch {
        // try the next suffix
      }
    }
    throw error;
  }
}

export async function load(url, context, next) {
  if (!url.startsWith("file:") || !/\.tsx?$/.test(new URL(url).pathname)) return next(url, context);
  const path = fileURLToPath(url);
  const { outputText } = ts.transpileModule(await readFile(path, "utf8"), {
    fileName: path,
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      isolatedModules: true,
      inlineSourceMap: true,
      inlineSources: true,
    },
  });
  return { format: "module", source: outputText, shortCircuit: true };
}
