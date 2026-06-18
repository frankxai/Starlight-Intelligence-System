export const SIP_STARTER_VERSION = "8.3.0";
export const SIP_STARTER_TAG = `v${SIP_STARTER_VERSION}`;
export const SIP_STARTER_MODULE_NAME = `starlight-sip-starter-v${SIP_STARTER_VERSION}`;
export const SIP_STARTER_REPO =
  "https://github.com/frankxai/Starlight-Intelligence-System";
export const SIP_STARTER_RELEASE_BASE = `${SIP_STARTER_REPO}/releases`;
export const SIP_STARTER_RELEASE_URL = `${SIP_STARTER_RELEASE_BASE}/tag/${SIP_STARTER_TAG}`;
export const SIP_STARTER_ASSET_BASE = `${SIP_STARTER_RELEASE_BASE}/download/${SIP_STARTER_TAG}`;
export const SIP_STARTER_DOWNLOAD_PAGE =
  "https://starlightintelligence.org/download";

export const SIP_STARTER_DOWNLOADS = [
  {
    label: "ZIP",
    filename: `${SIP_STARTER_MODULE_NAME}.zip`,
    href: `${SIP_STARTER_ASSET_BASE}/${SIP_STARTER_MODULE_NAME}.zip`,
  },
  {
    label: "TAR.GZ",
    filename: `${SIP_STARTER_MODULE_NAME}.tar.gz`,
    href: `${SIP_STARTER_ASSET_BASE}/${SIP_STARTER_MODULE_NAME}.tar.gz`,
  },
  {
    label: "Checksums",
    filename: `${SIP_STARTER_MODULE_NAME}.sha256`,
    href: `${SIP_STARTER_ASSET_BASE}/${SIP_STARTER_MODULE_NAME}.sha256`,
  },
  {
    label: "Manifest",
    filename: "release-manifest.json",
    href: `${SIP_STARTER_ASSET_BASE}/release-manifest.json`,
  },
] as const;

export const SIP_STARTER_INCLUDED = [
  "AGENTS.md",
  "SKILL.md",
  "MEMORY.md",
  "SOUL.md",
  "STACK.md",
  "CANON.md",
  "SIP.md",
  "SIP-QUICKSTART.md",
  "public-vault/",
  "mcp.json.example",
  "starlight-module.json",
  "README.md",
  "QUICKSTART.md",
  "INSTALL.md",
  "VALIDATION.md",
  "UPGRADE-PATH.md",
  "EXCELLENCE-CHECKLIST.md",
  "RELEASE-NOTES.md",
  "install.sh",
  "install.ps1",
  "validate-sip-starter.mjs",
] as const;

export function getSipStarterLatestManifest() {
  return {
    name: "starlight-sip-starter",
    version: SIP_STARTER_VERSION,
    tag: SIP_STARTER_TAG,
    type: "sip-starter-release-index",
    conformance: "SIP Core",
    canonicalDownloadPage: SIP_STARTER_DOWNLOAD_PAGE,
    releaseUrl: SIP_STARTER_RELEASE_URL,
    assets: SIP_STARTER_DOWNLOADS,
    included: SIP_STARTER_INCLUDED,
    install: {
      unix: [
        `curl -LO ${SIP_STARTER_ASSET_BASE}/${SIP_STARTER_MODULE_NAME}.tar.gz`,
        `tar -xzf ${SIP_STARTER_MODULE_NAME}.tar.gz`,
        `sh ${SIP_STARTER_MODULE_NAME}/install.sh /path/to/your/repo`,
      ],
      windows: [
        `Invoke-WebRequest -Uri ${SIP_STARTER_ASSET_BASE}/${SIP_STARTER_MODULE_NAME}.zip -OutFile ${SIP_STARTER_MODULE_NAME}.zip`,
        `Expand-Archive ${SIP_STARTER_MODULE_NAME}.zip -DestinationPath .`,
        `pwsh .\\${SIP_STARTER_MODULE_NAME}\\install.ps1 -TargetPath C:\\path\\to\\your\\repo`,
      ],
    },
  };
}
