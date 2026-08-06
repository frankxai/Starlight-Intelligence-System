# Starlight Explorer

The public, inspectable interface for the Starlight Intelligence System. It presents the Starlight Intelligence Protocol, architecture, research, public knowledge maps, and read-only public vault surfaces as a standalone Next.js application.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffrankxai%2FStarlight-Intelligence-System&root-directory=site&project-name=starlight-explorer&repository-name=starlight-explorer)

[Understand the deployment boundary](https://starlightintelligence.org/deploy) · [View the live Explorer](https://starlightintelligence.org) · [Run the sovereign system](../SETUP.md)

## What Vercel creates

The button starts Vercel's public repository clone flow with four explicit settings:

| Setting | Value |
| --- | --- |
| Source | `frankxai/Starlight-Intelligence-System` |
| Root Directory | `site/` |
| Default project | `starlight-explorer` |
| Default cloned repository | `starlight-explorer` |
| Required environment variables | None |

The resulting project contains:

- the public protocol, architecture, research, and documentation experience;
- Cosmos, Knowledge Tree, Memory Palace, and public vault views;
- read-only public API routes such as `/api/vaults`;
- Git-connected preview and production deployments.

Vercel clones the full repository and builds from `site/`. Keeping the repository root available is intentional: the site imports the verified metrics ledger at `metrics/current.json` during the build.

## What remains local

The hosted Explorer is the publication layer. These capabilities stay in your operator-controlled environment:

- private vault contents and personal memory;
- the MCP server and agent runtime processes;
- credentials, provider keys, and local configuration;
- workers, orchestration, and control-plane services.

Use the repository [setup guide](../SETUP.md) when the goal is to run the intelligence system itself.

## Run locally

From the repository root:

```bash
cd site
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Open `http://localhost:3000`. A full checkout is required because the build reads the repository-level metrics ledger.

## Quality gates

```bash
corepack pnpm check:metrics
corepack pnpm check:public-install-contract
corepack pnpm check:layout-contract
corepack pnpm check:deploy-contract
corepack pnpm lint
corepack pnpm build
```

The deployment contract is machine-readable at [`src/lib/deployment-contract.json`](src/lib/deployment-contract.json). The build fails when the source, Root Directory, zero-secret promise, CTA language, or documentation drifts from that contract.

## Verify a deployment

After Vercel reports `Ready`, open:

- `/protocol` — the open substrate specification;
- `/architecture` — the system model;
- `/research` — published substrate research;
- `/api/vaults` — the read-only public vault index.

Git integration creates previews for future commits. Connect a custom domain only after the generated Vercel URL passes those checks.

## Customize and update

Edit routes in `src/app`, shared components in `src/components`, and public assets in `public`. Preserve the deployment contract when changing the project boundary.

To pull future upstream work into the cloned repository:

```bash
git remote add upstream https://github.com/frankxai/Starlight-Intelligence-System.git
git fetch upstream
git merge upstream/main
```

Review the diff and let Vercel create a preview before merging changes into the production branch.

## Design authority

`taste.md` (repo root) governs judgment; `site/DESIGN.md` governs the visual system. Read both before UI work.

**Built on SIP — Starlight Intelligence Protocol v1.1.1**
