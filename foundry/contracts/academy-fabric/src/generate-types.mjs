import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileFromFile } from "json-schema-to-typescript";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const schemaDir = join(root, "schemas", "v0.1");
const outputDir = join(root, "generated", "v0.1");
await mkdir(outputDir, { recursive: true });
for (const name of (await readdir(schemaDir)).filter((value) => value.endsWith(".schema.json") && value !== "common.schema.json")) {
  const output = await compileFromFile(join(schemaDir, name), { bannerComment: "/* Generated from Academy Fabric JSON Schema. Do not edit. */" });
  await writeFile(join(outputDir, name.replace(".schema.json", ".d.ts")), output);
}
