import deploymentContract from "./deployment-contract.json";

export const DEPLOYMENT_CONTRACT = Object.freeze(deploymentContract);
export const DEPLOY_PAGE_URL = "/deploy";

const deployParams = [
  ["repository-url", deploymentContract.repositoryUrl],
  ["root-directory", deploymentContract.rootDirectory],
  ["project-name", deploymentContract.projectName],
  ["repository-name", deploymentContract.repositoryName],
] as const;

export const VERCEL_DEPLOY_URL = `https://vercel.com/new/clone?${deployParams
  .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  .join("&")}`;
