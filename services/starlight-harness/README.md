# Starlight harness

Author: Claude (Opus 5.5), 2026-11-03. Review state: unit-tested (25 cases); Codex review rounds 2 to 4
failed (9, 5 and 3 findings), all fixed, round 5 pending. Never run in a real container, not deployed.

Claude Code and Codex working around the clock as workers on the
[control-plane queue](../starlight-control-plane/README.md), each task in its own Linux sandbox on
Cloudflare. Nothing runs on the laptop.

## How the pieces fit

```
GitHub App webhook ──> control plane (Durable Object queue + outbox)
                          │   review / fix / build tasks, kinds, leases, human gates
                          ▼
cron, every minute ──> starlight-harness: claim up to N per harness
                          │
                          ▼
                     TaskRun Workflow (one per task, durable steps)
                       prepare ─> start agent ─> check+heartbeat each minute ─> push / review ─> complete
                          │
                          ▼
                     HarnessSandbox (Durable Object + container, image "claude" or "codex")
                          │  every HTTP(S) request
                          ▼
                     Outbound entrypoint: AI Gateway (adds token) · github.com git (adds App token,
                     agent branches only) · package registries (downloads only) · everything else 403
```

The pattern follows Cloudflare's own guides as of 2026-10-22: *Build a coding agent runner*, the
Claude Code and Codex pages under Sandbox coding agents, and *Clone a private repository*. Each task
runs as a [Workflow](https://developers.cloudflare.com/workflows/), so a deploy or eviction resumes
at the last finished step instead of rerunning the agent.

## What keeps it safe

- **The sandbox holds no credential.** The container starts with `enableInternet: false`; the
  `Outbound` entrypoint adds the AI Gateway token or a GitHub App installation token after the
  request leaves the sandbox. Code the agent runs, and every dependency it loads, sees neither.
- **One sandbox, one repository, one branch.** Each sandbox's gateway is created with its scope as
  `ctx.props` (the task's repository and, briefly, its branch); the agent inside cannot change it.
  It can read only that repository.
- **The agent's container can never push.** A process the agent left behind could use any push
  right that container held. So the runner bundles the agent's commits, destroys that container,
  starts a fresh one where only the runner's commands ever run, verifies the bundle's head, and only
  there opens the scope for the task's branch. It pushes without `--force` (GitHub refuses a
  non-fast-forward), closes the scope and destroys that container too. The bundle is kept in the
  Durable Object's storage before the agent's container goes, so a crash at any point can still push
  the work, and pushing the same commit again changes nothing. The gateway also reads the ref commands in each
  `git-receive-pack` request and refuses anything outside agent branches and any deletion, so `main`
  is out of reach. A fix task whose PR sits on a non-agent branch is released before any agent work,
  with that reason, instead of failing at push time.
- **Opted-in repositories only.** `REPOS` lists the `owner/name` pairs the harness may work in.
- **Workers claim only their kinds.** The harness claims `review`, `fix` and `build`. Landing stays
  with sessions that can run the estate's `pr-gate`; human-gated tasks never reach it.
- **Maker is not checker.** Review tasks for Codex-made PRs carry `excludeProvider: openai`, so only
  the Claude harness can take them; Claude-made PRs are reviewed by the real Codex bot.
- **Every run renews its lease each minute, and inside every GitHub write step**, so a retried
  attempt renews again before it writes. Each write gets a deadline 30 seconds inside the renewed
  lease: the push is killed at it, GitHub calls time out after 20 seconds, and with under a minute
  left nothing is written at all. Five minutes of the
  time box are kept for push, PR and completion. A run that loses its lease stops its sandbox
  without completing; a run that stops checking frees its task within 15 minutes.
- **Retries never duplicate.** A started sandbox never starts its agent twice; a half-done clone is
  cleared before the retry; a retried "open PR" finds the PR it made; review comments carry a marker
  that a retry looks for. A review whose last line is not `VERDICT: PASS` or `VERDICT: FAIL` is released, not submitted.

Each opening is also a way out: package registries are on by default so tests can install
dependencies; set `ALLOW_REGISTRIES` to `false` to close them.

## Deploy (Frank's steps; not done)

Needs the control plane deployed first, Docker or Podman running for `wrangler deploy` (it builds
both images), and the Workers Paid plan.

1. **AI Gateway.** Create a gateway (or use `default`) with Anthropic and OpenAI credentials, either
   Unified Billing or stored provider keys, and an authenticated-gateway token.
2. **Queue identities.** Add `cf-claude` (provider `anthropic`) and `cf-codex` (provider `openai`),
   both `"roles": ["worker"]`, to `~/.starlight/control-plane/identities.json`, mint, and update the
   control plane's `AGENT_TOKENS`.
3. **Secrets:** `AI_GATEWAY_TOKEN`, `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY` (PKCS#8, the same App as
   the control plane; it also needs Contents read/write to push), `CP_TOKEN_CLAUDE`, `CP_TOKEN_CODEX`.
4. **Vars:** set `AI_GATEWAY_ACCOUNT_ID`, `REPOS`, and check `CLAUDE_MODEL` / `CODEX_MODEL` against
   `intel/INTEL-BRIEF.md`. `HARNESSES` ships with `max: 0`, which means off.
5. `wrangler deploy`, then raise one harness to `max: 1`, watch one task end to end in the Workflows
   dashboard, and only then raise the limits.

## Not verified yet

- Nothing has run in a real container or a real Workflow: `@cloudflare/sandbox` and the Workers
  runtime are not exercised by the unit tests.
- Whether one container class can hold two images, as `wrangler.jsonc` declares, is confirmed by
  the first deploy; the guides show one image per class.
- Cost per task is [OPEN] until the first runs: container time plus model tokens through the gateway.

## Next slices

1. A Think or Pi agent as the Queen's planner on the same queue: reads the estate, enqueues work.
2. Research workers: Browser Run plus the `starlight-research` corpus, on a `research` kind.
3. OAuth on the control plane's MCP endpoint (`@cloudflare/workers-oauth-provider` v1), so claude.ai
   and other harnesses can attach it as a connector.
4. Artifacts repositories per task for agent scratch history, once Artifacts leaves beta.
