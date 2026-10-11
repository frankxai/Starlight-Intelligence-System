# Vercel Deploy Product Plan

## Outcome

Turn the ambiguous global `Deploy` CTA into an honest, useful Starlight Explorer product path, then prove the exact one-click Vercel contract through source checks, a GitHub preview deployment, independent review, and production verification after merge.

## Done when

- A visitor can explain what Vercel will create before leaving Starlight.
- The one-click URL uses Vercel's documented repository-subdirectory source format and names the resulting project and repository.
- The hosted product is named consistently as **Starlight Explorer**.
- Public copy distinguishes the hosted explorer from the local SIS runtime, MCP server, private vaults, agents, and orchestration.
- The root README and `site/README.md` provide useful install, deploy, customize, verify, and update paths.
- A deterministic contract check fails if the URL or product boundary drifts.
- Targeted source checks and the Vercel preview are green.
- The exact release diff receives an independent verifier verdict.
- The branch is squash-merged to `main` and the production deployment is READY on `starlightintelligence.org`.

## Work lanes

| Lane | Owner | Paths | Proof |
| --- | --- | --- | --- |
| Product boundary | Codex writer | `site/src/app/deploy/`, `site/src/lib/deployment.ts` | deploy-contract check + rendered preview |
| Navigation and discovery | Codex writer | `site/src/lib/nav.ts`, `site/src/components/Header.tsx`, `site/src/app/sitemap.ts` | lint + link assertions |
| Repository value | Codex writer | `README.md`, `site/README.md` | copy lint + deploy-contract check |
| Release verification | GitHub CI, CodeRabbit, Vercel | exact pushed commit | green checks + READY preview + reviewed diff |

## Constraints

- One writer in the canonical worktree `C:\Users\frank\starlight\worktrees\sis-vercel-deploy-product-20260825`.
- Preserve the dirty primary checkout and all unrelated user files.
- Local build/browser/swarm workloads remain held while Peak Performance reports insufficient RAM.
- Use cloud preview and repository CI rather than starting another local server.
- Stage only explicit owned paths.
- No secrets, billing, DNS, project deletion, or Vercel account-setting mutation.

## Steps

1. Capture Git, live site, Vercel project, deployment, CTA, and repository baseline.
2. Lock the product and scene brief.
3. Implement the deploy page, centralized contract, navigation, README, and deterministic checker.
4. Run safe local static checks; push one coherent preview.
5. Inspect preview HTML, headers, routes, CI, and independent review; repair all blockers.
6. Squash-merge to `main`; verify production commit, domain, and error state; update memory.

## Rollback

Revert the single squash merge on `main`. The prior Vercel production deployment remains a rollback candidate and no Vercel project settings, DNS, secrets, or data stores are changed by this work.
