export const PLUGIN_STARTER_TAG = "plugins-public-starter-2026-06-17";
export const PLUGIN_STARTER_MODULE_NAME =
  "starlight-public-plugin-starter-2026-06-17-codex-20260617165242";
export const PLUGIN_STARTER_REPO =
  "https://github.com/frankxai/Starlight-Intelligence-System";
export const PLUGIN_STARTER_RELEASE_URL = `${PLUGIN_STARTER_REPO}/releases/tag/${PLUGIN_STARTER_TAG}`;
export const PLUGIN_STARTER_ASSET_BASE = `${PLUGIN_STARTER_REPO}/releases/download/${PLUGIN_STARTER_TAG}`;
export const PLUGIN_STARTER_DOWNLOAD_PAGE =
  "https://starlightintelligence.org/download#codex-plugin-starter";
export const PLUGIN_STARTER_SHA256 =
  "047daee5a50b0e9dddb991deeec90106feac4b254ca231ecc49c6978bf64d11b";

export const PLUGIN_STARTER_PLUGINS = [
  "enterprise-ai-coe-ops",
  "health-intelligence-ops",
  "prompt-eval-lab",
  "vibe-os-frequency-lab",
] as const;

export const PLUGIN_STARTER_DOWNLOADS = [
  {
    label: "Plugin starter ZIP",
    filename: `${PLUGIN_STARTER_MODULE_NAME}.zip`,
    href: `${PLUGIN_STARTER_ASSET_BASE}/${PLUGIN_STARTER_MODULE_NAME}.zip`,
    sha256: PLUGIN_STARTER_SHA256,
  },
  {
    label: "SHA256 checksum",
    filename: `${PLUGIN_STARTER_MODULE_NAME}.zip.sha256`,
    href: `${PLUGIN_STARTER_ASSET_BASE}/${PLUGIN_STARTER_MODULE_NAME}.zip.sha256`,
  },
  {
    label: "GitHub prerelease",
    filename: PLUGIN_STARTER_TAG,
    href: PLUGIN_STARTER_RELEASE_URL,
  },
] as const;

export function getPluginStarterLatestManifest() {
  return {
    name: "starlight-public-plugin-starter",
    tag: PLUGIN_STARTER_TAG,
    type: "codex-plugin-starter-release-index",
    status: "public-prerelease",
    canonicalDownloadPage: PLUGIN_STARTER_DOWNLOAD_PAGE,
    releaseUrl: PLUGIN_STARTER_RELEASE_URL,
    checksum: {
      algorithm: "sha256",
      value: PLUGIN_STARTER_SHA256,
      asset: `${PLUGIN_STARTER_MODULE_NAME}.zip.sha256`,
    },
    assets: PLUGIN_STARTER_DOWNLOADS,
    plugins: PLUGIN_STARTER_PLUGINS,
    marketplaceName: "starlight-public",
    install: [
      `unzip ${PLUGIN_STARTER_MODULE_NAME}.zip`,
      "codex plugin marketplace add <path-to-extracted-bundle>",
      ...PLUGIN_STARTER_PLUGINS.map(
        (plugin) => `codex plugin add ${plugin}@starlight-public`,
      ),
    ],
    privateSuitePolicy:
      "The private 29-plugin suite is distributed separately for internal operators after publication sanitization.",
  };
}
