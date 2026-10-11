export const SIP_STARTER_VERSION = "8.3.0";
export const SIP_STARTER_LABEL = `v${SIP_STARTER_VERSION} source`;
export const SIP_STARTER_REPO =
  "https://github.com/frankxai/Starlight-Intelligence-System";
export const SIP_STARTER_SOURCE_URL = `${SIP_STARTER_REPO}/tree/main`;
export const SIP_STARTER_DOWNLOAD_PAGE =
  "https://starlightintelligence.org/download";

export function getSipStarterLatestManifest() {
  return {
    name: "starlight-sip-starter",
    version: SIP_STARTER_VERSION,
    tag: null,
    type: "sip-starter-release-index",
    conformance: "SIP Core",
    status: "source-only",
    canonicalDownloadPage: SIP_STARTER_DOWNLOAD_PAGE,
    releaseUrl: null,
    assets: [],
    included: [],
    source: {
      repository: SIP_STARTER_REPO,
      branch: "main",
      url: SIP_STARTER_SOURCE_URL,
    },
    note:
      "No v8.3.0 tag, release, or checksum-backed SIP Starter archive has been published. Use the current main source workflow until a release is present.",
    install: {
      source: [
        `git clone ${SIP_STARTER_REPO}.git`,
        "cd Starlight-Intelligence-System",
        "npm install",
        "npm run build",
        "node dist/cli.js init --vaults",
      ],
    },
  };
}
