# GitOps Cost Heal — 2026-08-26

The canonical Vercel project is `site`, which owns `starlightintelligence.org`. The duplicate project `starlight-intelligence-system` had no unique production domain and was removed after verification; its historic deployments were permanently deleted, while the canonical project and domains were preserved.

This repository now has one automatic deployment route: the canonical Vercel project's native Git integration. `.github/workflows/vercel-deploy.yml` remains available as a confirmation-gated manual production fallback, but no longer starts on every `site/` push and cannot create a second deployment for the same commit.

`site/vercel.json` now ignores a deployment when Vercel's previous and current commit SHAs contain no changes under the configured `site/` root. If either SHA is unavailable or Git cannot determine the diff, the command exits non-zero and Vercel builds, preserving the fail-open safety posture.

The high-frequency Harness check now skips draft PR iterations, runs when a draft becomes ready, cancels stale runs through its existing concurrency guard, and has a 20-minute ceiling. No required branch-protection status was configured on `main`, so this changes cost timing without bypassing a required merge check.

Rollback is a normal Git revert. Re-enabling automatic CLI deployment is safe only after native Git deployment is explicitly disabled for the canonical Vercel project.
