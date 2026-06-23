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

export const PLUGIN_MODULES_TAG =
  "starlight-intelligence-modules-2026-06-19";
export const PLUGIN_MODULES_MODULE_NAME =
  "starlight-intelligence-modules-public-suite-2026-06-19";
export const PLUGIN_MODULES_RELEASE_URL = `${PLUGIN_STARTER_REPO}/releases/tag/${PLUGIN_MODULES_TAG}`;
export const PLUGIN_MODULES_ASSET_BASE = `${PLUGIN_STARTER_REPO}/releases/download/${PLUGIN_MODULES_TAG}`;
export const PLUGIN_MODULES_SHA256 =
  "D37133C3CB60A32D578984E30EF34711FAA6B4F45456321F0127FBCA6804AD30";

export const PLUGIN_MODULES_PLUGINS = [
  "founder-command-kit",
  "revenue-engine-kit",
  "starlight-system-module",
  "arcanea-world-engine",
  "enterprise-ai-kit",
  "creator-product-kit",
] as const;

export const PLUGIN_PRODUCT_KITS = [
  {
    label: "Founder Command Kit",
    filename: "starlight-founder-command-kit-2026-06-19.zip",
    sha256: "D22002A6856CD43D1169B4156966FE6FFE5B5F954924ADC6BBE5C18235DD5FE3",
    status: "Public-ready wrapper",
  },
  {
    label: "Revenue Engine Kit",
    filename: "starlight-revenue-engine-kit-2026-06-19.zip",
    sha256: "018B73298A8CF4D3674AF826F1D6F19A2FB96B4BC0858DB34AE1BD708B3EE8DE",
    status: "Public-ready wrapper",
  },
  {
    label: "Starlight System Module",
    filename: "starlight-system-module-2026-06-19.zip",
    sha256: "DA7EE9F78A29A8B2CFA0B6624A932E1FA8684C6B6BA1DD13AABEB82FCD874914",
    status: "Public-ready wrapper",
  },
  {
    label: "Arcanea World Engine",
    filename: "arcanea-world-engine-kit-2026-06-19.zip",
    sha256: "25683CD6A5D07CAEFA40FA91811CA985DA958BD76CE0B6570BECB89C0036D209",
    status: "Public wrapper after IP review",
  },
  {
    label: "Enterprise AI Kit",
    filename: "starlight-enterprise-ai-kit-2026-06-19.zip",
    sha256: "DE911DA82A4E39A07979989B49DC5C27280F39BE94969489B1789FC3460B1838",
    status: "Public-ready wrapper",
  },
  {
    label: "Creator Product Kit",
    filename: "starlight-creator-product-kit-2026-06-19.zip",
    sha256: "08F8DB92780608AFBB350EA451CCDB544BD680D8B01B24C0C1EAB31E02A06A03",
    status: "Public-ready wrapper",
  },
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

export const PLUGIN_MODULES_DOWNLOADS = [
  {
    label: "Public suite ZIP",
    filename: `${PLUGIN_MODULES_MODULE_NAME}.zip`,
    href: `${PLUGIN_MODULES_ASSET_BASE}/${PLUGIN_MODULES_MODULE_NAME}.zip`,
    sha256: PLUGIN_MODULES_SHA256,
  },
  {
    label: "SHA256 checksum",
    filename: `${PLUGIN_MODULES_MODULE_NAME}.zip.sha256`,
    href: `${PLUGIN_MODULES_ASSET_BASE}/${PLUGIN_MODULES_MODULE_NAME}.zip.sha256`,
  },
  {
    label: "GitHub release",
    filename: PLUGIN_MODULES_TAG,
    href: PLUGIN_MODULES_RELEASE_URL,
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
      "The private 52-plugin suite is distributed separately for internal operators after publication sanitization.",
    publicModules: getPluginModulesLatestManifest(),
  };
}

export function getPluginModulesLatestManifest() {
  return {
    name: "starlight-intelligence-modules-public-suite",
    tag: PLUGIN_MODULES_TAG,
    type: "codex-plugin-public-suite-release-index",
    status: "public-ready-wrapper-suite",
    canonicalDownloadPage:
      "https://starlightintelligence.org/download#starlight-intelligence-modules",
    releaseUrl: PLUGIN_MODULES_RELEASE_URL,
    checksum: {
      algorithm: "sha256",
      value: PLUGIN_MODULES_SHA256,
      asset: `${PLUGIN_MODULES_MODULE_NAME}.zip.sha256`,
    },
    assets: PLUGIN_MODULES_DOWNLOADS,
    productKits: PLUGIN_PRODUCT_KITS.map((kit) => ({
      ...kit,
      href: `${PLUGIN_MODULES_ASSET_BASE}/${kit.filename}`,
      checksumHref: `${PLUGIN_MODULES_ASSET_BASE}/${kit.filename}.sha256`,
    })),
    plugins: PLUGIN_MODULES_PLUGINS,
    marketplaceName: "starlight-public-modules",
    install: [
      `unzip ${PLUGIN_MODULES_MODULE_NAME}.zip`,
      "codex plugin marketplace add <path-to-extracted-bundle>",
      ...PLUGIN_MODULES_PLUGINS.map(
        (plugin) => `codex plugin add ${plugin}@starlight-public-modules`,
      ),
    ],
    privateSuitePolicy:
      "The full 52-plugin suite remains private-only; public distribution uses sanitized wrapper modules.",
  };
}
