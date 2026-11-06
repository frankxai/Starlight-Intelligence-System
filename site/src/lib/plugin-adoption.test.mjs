import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { PLUGIN_ADOPTION, getPluginStarterLatestManifest, getPluginModulesLatestManifest } from "./plugin-starter-download.ts";

const repoRoot = new URL("../../../", import.meta.url);

test("the public JSON distinguishes Codex archives from unverified ChatGPT listings", () => {
  const starter = getPluginStarterLatestManifest();
  const modules = getPluginModulesLatestManifest();
  assert.equal(starter.host, "codex-local");
  assert.equal(modules.host, "codex-local");
  assert.equal(starter.adoption.publicDirectory.status, "unverified");
  assert.equal(starter.adoption.publicDirectory.listingUrl, null);
  assert.deepEqual(modules.publicDirectory, starter.adoption.publicDirectory);
  assert.equal(starter.plugins.length, 4);
  assert.equal(modules.plugins.length, 6);
  for (const asset of [...starter.assets, ...modules.assets]) {
    assert.ok(asset.href.startsWith("https://github.com/frankxai/Starlight-Intelligence-System/releases/"));
  }
});

test("source cards point to real, separately identified licensed packages", () => {
  for (const candidate of PLUGIN_ADOPTION.candidates) {
    const manifestPath = new URL(`${candidate.sourcePath}/plugin.json`, repoRoot);
    assert.ok(existsSync(manifestPath), fileURLToPath(manifestPath));
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    assert.equal(candidate.id, manifest.name);
    assert.equal(candidate.sourceLicense, manifest.license);
    assert.equal(candidate.sourceUrl, `https://github.com/frankxai/Starlight-Intelligence-System/tree/main/${candidate.sourcePath}`);
    assert.equal(candidate.publicDirectoryStatus, "unverified");
    assert.equal(candidate.publicDirectoryUrl, null);
    assert.ok(candidate.prompt.length > 100);
  }
});

test("the adoption registry publishes no private account identity or connection", () => {
  const payload = JSON.stringify(PLUGIN_ADOPTION);
  for (const pattern of [/(?:plugins?|Plugin)_[a-f0-9]{20,}/, /app-[a-f0-9]{20,}/, /workspace_[a-f0-9]+/, /libfile_/, /connector_/, /Bearer\s/, /sk-[A-Za-z0-9]/, /mcp\.starlightintelligence\.ai/]) {
    assert.doesNotMatch(payload, pattern);
  }
  for (const doc of PLUGIN_ADOPTION.officialDocs) {
    assert.equal(new URL(doc.href).origin, "https://developers.openai.com");
    assert.ok(new URL(doc.href).pathname.startsWith("/plugins/"));
  }
});

test("unverified directory state cannot produce an install link", () => {
  const view = readFileSync(new URL("../components/PluginAdoption.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(view, /href=\{[^}]*publicDirectoryUrl/);
  assert.doesNotMatch(view, /chatgpt\.com\/(?:plugins|g)\//);
  assert.doesNotMatch(view, />\s*(?:Install|Connect|Buy|Subscribe)(?:\s|<)/i);
  assert.match(view, /ChatGPT directory: unverified/);
  assert.match(view, /role="status"/);
  assert.match(view, /Copy is unavailable/);
  assert.match(view, /<textarea[^>]*readOnly/);
});
