---
type: handover
date: 2026-05-05
sprint: SIS-2026-W19
sweep: S4 (public site excellence)
operator: claude-opus-4-7-1m (SIS sweep S4 worker)
status: shipped
---

# Dark Deploy Investigation — gencreator.ai + vibeclubs.ai

## TL;DR

Both sites returned `404 / DEPLOYMENT_NOT_FOUND` on apex+www despite local repos existing. Investigation found a **shared root cause** (Vercel security gate blocking `next-mdx-remote@5.x`) plus per-site delivery gaps (no Vercel project linked / project existed but no domain attached / SSO protection on by default).

Both sites are now LIVE 200 on apex + www. No destructive ops, no domain re-registration, no Frank-WIP touched.

| Site | Apex | www | Status |
|---|---|---|---|
| gencreator.ai | 200 | 200 | LIVE |
| vibeclubs.ai | 200 | 200 | LIVE |

---

## gencreator.ai

- **Local repo:** `C:\Users\frank\gencreator.ai` · `main` · `83cb1e7` (a11y: WCAG 2.2 polish) · 1 untracked dir (`docs/ops/HANDOVER-FROM-SIS-QUEEN-2026-05-04.md`)
- **Tech stack:** Next.js 16 + React 19 + Tailwind 4 + Supabase + Sentry + framer-motion + three.js. Single-package repo (not turborepo). pnpm.
- **Vercel project:** **Did not exist** before this sweep. Created via `vercel link --yes --project gencreator-ai` (project ID `prj_nIryRFHID247Sh0DEp2oH1T4amnO`).
- **DNS state:** Apex + www served by `216.150.x.x` Vercel anycast (correct). NS = `ns1/ns2.vercel-dns.com` (Vercel-hosted DNS, registrar = Vercel). Domain expires 2028-04-06.
- **GitHub Actions:** No deploy workflow in `.github/workflows`. CI workflow exists separately in workflow runs (last run success, no Vercel hook).
- **Category:** **B** (repo healthy, Vercel project missing — never deployed).
- **Root cause:** Two layers.
  1. No Vercel project linked to the repo → domain had nowhere to route → Vercel responded `DEPLOYMENT_NOT_FOUND` for any request.
  2. After linking, first prod build failed Vercel's vulnerability gate on `next-mdx-remote@5.0.0` (single-page consumer in `app/research/[slug]/page.tsx` using the `/rsc` import). v6 keeps the same `/rsc` API; bump is safe.
- **Action taken:**
  1. `vercel link --yes --project gencreator-ai` (auto-added `.vercel` to `.gitignore`).
  2. Bumped `next-mdx-remote ^5.0.0 → ^6.0.0` in `package.json`, refreshed `pnpm-lock.yaml`.
  3. Committed (commit `4c67806` on `main`) and pushed to `frankxai/gencreator.ai`.
  4. `vercel --prod --yes` → deploy `https://gencreator-ffliufq6k-starlight-intelligence.vercel.app` (Ready).
  5. `vercel alias set <deploy> gencreator.ai` and `... www.gencreator.ai`.
  6. PATCH `/v9/projects/{id}?teamId=...` with `{"ssoProtection": null}` to disable team-default Vercel Authentication.
- **Verification:** `curl -sI https://gencreator.ai` → `200`. `curl -sI https://www.gencreator.ai` → `200`. Body served is the production homepage (not a Vercel placeholder).

## vibeclubs.ai

- **Local repo:** `C:\Users\frank\vibeclubs.ai` · `main` · `5e3722c` before sweep, `4d012bd` after · turborepo monorepo with apps/web (Next.js 16) + apps/extension (Plasmo Chrome ext) + 3 internal packages. **Dirty Frank-WIP working tree** (8 modified files in `apps/extension/contents/` and `apps/web/app/...` + 4 untracked dirs). Surgical fix isolated to files NOT in WIP.
- **Tech stack:** Next.js 16 + React 19 + framer-motion + Tailwind. Turborepo + pnpm@9. Apps/web is a sub-package; build runs through turbo.
- **Vercel project:** **Existed** as `vibeclubs-web` (project ID `prj_eZ2DDrIt3eP9o8P6EqUzsqBHhHPD`, root dir `apps/web`, created 4d ago). Latest production deploy was in **Error** state from 2026-04-30 — never had a successful prod build.
- **DNS state:** Apex + www served by `216.150.x.x` Vercel anycast (correct). NS = `ns1/ns2.vercel-dns.com`. Domain expires 2028-04-06. Domain was registered in Vercel but **NOT attached to any project**.
- **GitHub Actions:** 5 workflows present (ci, voice-audit, club-validate, release-packages). Latest CI runs from 2026-04-23 show 3 of last 5 in `failure`. Vercel deploy is via Git integration, not GHA.
- **Category:** **D + E** (Vercel project healthy in metadata but its only prod deploy failed; same `next-mdx-remote@5.x` security gate).
- **Root cause:** Two layers.
  1. `apps/web/package.json` pinned `next-mdx-remote@^5.0.0` → Vercel build gate failed all prod deploys silently after the validation step. Build artifacts compiled cleanly, then Vercel's post-build vulnerability check rejected with `Vulnerable version of next-mdx-remote detected`.
  2. Even if a deploy had succeeded, no domain was attached to the project, so apex would still 404.
- **Action taken:**
  1. Surgical edit only: `apps/web/package.json` → `next-mdx-remote ^5.0.0 → ^6.0.0`.
  2. `pnpm install --no-frozen-lockfile` to refresh root `pnpm-lock.yaml` (workspace lockfile).
  3. **Staged ONLY** `apps/web/package.json` + `pnpm-lock.yaml`. Frank's 8 modified files + 4 untracked dirs **left untouched**.
  4. Committed (commit `4d012bd` on `main`) and pushed to `frankxai/vibeclubs`. Vercel's GitHub integration auto-rebuilt → `vibeclubs-4ugrz9nvc-starlight-intelligence.vercel.app` Ready in 42s.
  5. `vercel alias set <deploy> vibeclubs.ai` and `... www.vibeclubs.ai`.
  6. PATCH disable `ssoProtection` on the project.
- **Verification:** `curl -sI https://vibeclubs.ai` → `200`. `curl -sI https://www.vibeclubs.ai` → `200`. Frank's WIP confirmed still in working tree post-commit (`git status` shows the same 8M + 4?? entries).

---

## Cross-cutting findings

1. **Vercel team-default security policy turns on SSO protection for all new projects.** Both new/recovered projects needed an explicit `ssoProtection: null` PATCH to be reachable by the public. This is a one-time fix per project, but worth knowing for every future SIS-domain spin-up.
2. **`next-mdx-remote@5.0.0` is now hard-blocked by Vercel.** Audit all SIS-adjacent repos that depend on it — bump to `^6.0.0` proactively. The `/rsc` import path is preserved; no code change needed.
3. **The 5.0.0 advisory likely landed late April 2026** — both repos' last successful CI predates the gate, but their first attempted prod deploys (for vibeclubs, 2026-04-30; for gencreator, never tried) failed against it.
4. **Vercel CLI 42.2.0 changed `vercel domains add` semantics.** It now expects a single arg (domain only); to attach to a project, use `vercel alias set <deployment-url> <domain>` instead. Worth pinning in SIS deploy runbooks.
5. **PowerShell + Vercel CLI noisy stderr.** Every `vercel` invocation emits a `node.exe : Vercel CLI 42.2.0` block to stderr that PowerShell renders as a `RemoteException`. Always inspect actual stdout — the "errors" are cosmetic.

## Files / commits touched

| Repo | Commit | Files |
|---|---|---|
| `frankxai/gencreator.ai` | `4c67806` | `package.json`, `pnpm-lock.yaml`, `.gitignore` (auto from `vercel link`) |
| `frankxai/vibeclubs` | `4d012bd` | `apps/web/package.json`, `pnpm-lock.yaml` |
| `frankxai/Starlight-Intelligence-System` | this commit | `docs/ops/HANDOVER-DARK-DEPLOY-INVESTIGATION-2026-05-05.md` |

## Vercel project IDs (for future ops)

- `gencreator-ai` → `prj_nIryRFHID247Sh0DEp2oH1T4amnO` (org `team_q6LNT6rnFRlqlcjBJ2Wxz6PE`)
- `vibeclubs-web` → `prj_eZ2DDrIt3eP9o8P6EqUzsqBHhHPD` (same team)

## Constraints honored

- No new domains registered.
- No registrar settings touched.
- No Vercel team settings changed (only per-project `ssoProtection` field).
- No GitHub repos archived/deleted.
- vibeclubs.ai had dirty Frank-WIP working tree; only files NOT in WIP set were staged. Frank's 8 modified files + 4 untracked dirs remain in his working tree, untouched.
- No BOM introduced; new SIS file is UTF-8 plain.

## What I did NOT do (deferred or skipped)

- Did not touch the `gencreator.ai` `docs/ops/HANDOVER-FROM-SIS-QUEEN-2026-05-04.md` untracked file — that is Frank's prior handover artifact, not mine to commit.
- Did not add a GitHub Actions Vercel deploy workflow to gencreator.ai — Vercel's GitHub integration handles auto-deploy on push to `main` once the project is linked. Adding a redundant GHA would be over-engineering.
- Did not bump `next-mdx-remote` in any other Frank-owned repos preemptively. That is a separate sweep recommendation; flagged in cross-cutting finding #2.
- Did not run `pnpm approve-builds` on either repo — the warning is non-blocking and approval is Frank's call.

## Sweep status

- **S4 → COMPLETE.** Both dark deploys recovered. Sites live on apex + www. Two minimal commits to operational repos. SIS handover written.
