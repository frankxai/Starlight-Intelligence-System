# Vercel Deploy Findings

## Observed baseline — 2026-08-25

- Canonical source: `frankxai/Starlight-Intelligence-System`, production branch `main`.
- Canonical Vercel project: `site` (`prj_wDNGrb1R1rB5PJOG9cUEICSER887`), linked to the GitHub repository with `site/` as the app surface.
- Production domains: `starlightintelligence.org` and `www.starlightintelligence.org`.
- Current production deployment at baseline: `dpl_F3MXVT1h3xiYagk6gzKrh1EmGzvS`, commit `b9df93544845a8ab036fe356085563e77c975067`, READY.
- The repository has a second unlinked Vercel project named `starlight-intelligence-system`; it is not the production domain owner. Deletion is an unrelated human-gated operation.
- The global header gives `Deploy` the strongest visual treatment.
- The current target is `vercel.com/new/clone?...&root-directory=site` with no product explanation and no default project/repository name.
- The current `site/README.md` is untouched Create Next App boilerplate.
- The root README displays a deployment-workflow status badge, but no honest one-click product explanation.
- The one-click action deploys the public Next.js site. It does not deploy the local SIS runtime, MCP server, private vaults, personal memory, agent workers, or orchestration.
- The site needs no secrets or external data store for its default public experience.

## Decision

The deployable product is **Starlight Explorer**: a hosted, read-only public interface for the protocol, architecture, research, knowledge surfaces, public vault endpoints, and source-first onboarding.

The central CTA is justified only when it names that product and explains the boundary before the user creates a Vercel project. The header therefore routes to an internal `/deploy` product page. The page owns the external one-click Vercel action.

## Vercel source contract

Vercel's current first-party Deploy Button documentation explicitly supports `root-directory` for monorepos. The canonical source remains the full repository, with:

- `repository-url=https://github.com/frankxai/Starlight-Intelligence-System`
- `root-directory=site`

- `project-name=starlight-explorer`
- `repository-name=starlight-explorer`

The full repository must remain available during the build because the Explorer imports the verified repository-level `metrics/current.json` ledger. The resulting project and cloned repository names are legible in the user's account. The machine-readable deployment contract is enforced by the production build.

## Product boundary

| Vercel creates | Stays local / separate |
| --- | --- |
| Forked Git repository | Private semantic vaults |
| Next.js Explorer project | MCP server process |
| Public protocol and research UI | Local agent definitions and workers |
| Read-only public endpoints | Credentials and personal memory |
| Preview/production deployment workflow | Orchestration and machine control |
