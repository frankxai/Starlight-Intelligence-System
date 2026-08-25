import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, "..");
const repoRoot = resolve(siteRoot, "..");
const contractPath = resolve(siteRoot, "src/lib/deployment-contract.json");
const contract = JSON.parse(readFileSync(contractPath, "utf8"));

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};
const read = (relativePath) => readFileSync(resolve(repoRoot, relativePath), "utf8");

expect(contract.schemaVersion === "1.0.0", "deployment contract schemaVersion must be 1.0.0");
expect(contract.productName === "Starlight Explorer", "deployment product must be named Starlight Explorer");
expect(
  contract.repositoryUrl === "https://github.com/frankxai/Starlight-Intelligence-System",
  "deployment source must be the canonical public repository",
);
expect(contract.rootDirectory === "site", "Vercel root directory must be site");
expect(contract.projectName === "starlight-explorer", "default Vercel project name must be stable");
expect(contract.repositoryName === "starlight-explorer", "default cloned repository name must be stable");
expect(
  Array.isArray(contract.requiredEnvironmentVariables) && contract.requiredEnvironmentVariables.length === 0,
  "the default public Explorer must remain deployable without environment variables",
);

for (const relativePath of [
  "site/package.json",
  "site/vercel.json",
  "site/src/app/deploy/page.tsx",
  "site/src/lib/deployment.ts",
  "metrics/current.json",
]) {
  expect(existsSync(resolve(repoRoot, relativePath)), `missing deploy source: ${relativePath}`);
}

const deploymentSource = read("site/src/lib/deployment.ts");
for (const parameter of ["repository-url", "root-directory", "project-name", "repository-name"]) {
  expect(deploymentSource.includes(parameter), `deployment URL is missing ${parameter}`);
}

const navSource = read("site/src/lib/nav.ts");
const headerSource = read("site/src/components/Header.tsx");
const deployPage = read("site/src/app/deploy/page.tsx");
const siteReadme = read("site/README.md");
const rootReadme = read("README.md");

expect(navSource.includes('href: "/deploy"'), "Build navigation must expose /deploy");
expect(headerSource.includes("Deploy Explorer"), "global CTA must name the deployable product");
expect(deployPage.toLowerCase().includes("sovereign runtime"), "deploy page must explain the sovereign runtime boundary");
expect(deployPage.includes("Zero required environment variables"), "deploy page must state the environment contract");
expect(siteReadme.includes("What Vercel creates"), "site README must document the hosted artifact");
expect(siteReadme.includes("What remains local"), "site README must document the local boundary");
expect(rootReadme.includes("Deploy Starlight Explorer"), "root README must name the deployable product");

if (failures.length > 0) {
  console.error("Deploy contract failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(
  `Deploy contract passed: ${contract.productName} → ${contract.repositoryUrl} (${contract.rootDirectory}/), ${contract.requiredEnvironmentVariables.length} required environment variables.`,
);
