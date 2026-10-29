import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { BUILD_KITS, LAUNCH_WORKBOOK } from "./build-kits.ts";

const site = new URL("../", import.meta.url);
const text = (path) => readFileSync(new URL(path, site), "utf8");
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

test("every offered local destination exists and external source links stay public", () => {
  assert.equal(new Set(BUILD_KITS.map((kit) => kit.id)).size, BUILD_KITS.length);
  for (const kit of BUILD_KITS) {
    assert.ok(kit.outcome && kit.requires && kit.boundary);
    assert.ok(["Public source", "Published local modules"].includes(kit.status));
    const [path, fragment] = kit.href.split("#");
    const route = path || "/kits";
    assert.ok(existsSync(new URL(`app${route}/page.tsx`, site)), kit.href);
    if (fragment === "launch-workbook") assert.equal(fragment, LAUNCH_WORKBOOK.id);
    else if (fragment) assert.ok(text("components/PluginAdoption.tsx").includes(`id="${fragment}"`));
    const source = new URL(kit.sourceHref);
    assert.equal(source.origin, "https://github.com");
    assert.ok(source.pathname.startsWith("/frankxai/Starlight-Intelligence-System"));
  }
});

test("every workbook promise has a file and matching published checksum", () => {
  const publicRoot = new URL("../public", site);
  const manifest = JSON.parse(readFileSync(new URL(`${publicRoot.href}/downloads/launch-workbook-manifest.json`), "utf8"));
  const folder = new URL(`${publicRoot.href}${LAUNCH_WORKBOOK.directory}/`);
  assert.deepEqual(LAUNCH_WORKBOOK.files.map((file) => file.name).sort(), readdirSync(folder).sort());
  assert.deepEqual(manifest.files.map((file) => file.name).sort(), readdirSync(folder).sort());
  for (const file of manifest.files) {
    const bytes = readFileSync(new URL(file.name, folder));
    assert.equal(bytes.length, file.bytes, file.name);
    assert.equal(sha256(bytes), file.sha256, file.name);
    assert.ok(bytes.length > 200, `${file.name} is a substantive deliverable`);
  }
  const archive = readFileSync(new URL(`${publicRoot.href}${LAUNCH_WORKBOOK.archive}`));
  assert.equal(manifest.archive, LAUNCH_WORKBOOK.archive);
  assert.equal(manifest.version, LAUNCH_WORKBOOK.version);
  assert.equal(archive.length, manifest.bytes);
  assert.equal(sha256(archive), manifest.sha256);
  assert.equal(archive.readUInt32LE(0), 0x04034b50, "ZIP local header");
  assert.equal(archive.readUInt32LE(archive.length - 22), 0x06054b50, "ZIP end directory");
  assert.equal(archive.readUInt16LE(archive.length - 12), LAUNCH_WORKBOOK.files.length);
});

test("the workbook preserves rights, uncertain economics and explicit availability", () => {
  const base = "../public/downloads/launch-workbook-v1/";
  assert.match(text(`${base}LICENSE`), /MIT License/);
  assert.match(text(`${base}LICENSE`), /Copyright \(c\) 2026 Frank Riemer/);
  assert.match(text(`${base}worked-example.md`), /Fictional demonstration/);
  assert.match(text(`${base}worked-example.md`), /not a published\noffer/);
  assert.match(text(`${base}economics.csv`), /IF\(COUNT\(B2:B7\)=6/);
  assert.match(text(`${base}distribution-plan.md`), /UTMs label visits; they do not install analytics/);
  assert.match(text("app/kits/page.tsx"), /does not establish ChatGPT directory approval/);
  assert.doesNotMatch(text("app/kits/page.tsx"), /chatgpt\.com\/(?:plugins|g)\//);
});

test("public deliverables contain no account identifiers or private connection URLs", () => {
  const values = [JSON.stringify(BUILD_KITS), JSON.stringify(LAUNCH_WORKBOOK), text("app/kits/page.tsx"), ...LAUNCH_WORKBOOK.files.map((file) => text(`../public${LAUNCH_WORKBOOK.directory}/${file.name}`))];
  for (const value of values) {
    for (const pattern of [/(?:plugins?|Plugin)_[a-f0-9]{20,}/, /workspace_[a-f0-9]+/, /libfile_/, /connector_/, /Bearer\s+[A-Za-z0-9]/, /sk-[A-Za-z0-9]{12}/, /mcp\.starlightintelligence\.ai/]) assert.doesNotMatch(value, pattern);
  }
});

test("the kits journey is discoverable and has a clean canonical URL", () => {
  assert.match(text("app/kits/page.tsx"), /canonical: "\/kits"/);
  assert.match(text("app/sitemap.ts"), /"\/kits"/);
  assert.match(text("lib/nav.ts"), /href: "\/kits"/);
  assert.match(text("app/download/page.tsx"), /href="\/kits"/);
});
