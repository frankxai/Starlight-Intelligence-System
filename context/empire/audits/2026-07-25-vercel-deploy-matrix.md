# Vercel deploy matrix — team "Starlight Intelligence" — 2026-07-25

> Source: Vercel API sweep of all 50 projects. Triage: production-live = custom domain + recent READY deploy; stale = >60 days since deploy; experiment = no custom domain / never deployed / v0 scratch.

## Summary: 19 production-live · 6 stale · 25 experiments

## Canonical live-sites list (custom domains)

| # | Domain | Vercel project | Framework | Last deploy | Notes |
|---|---|---|---|---|---|
| 1 | frankx.ai | frankx-ai-vercel-website | nextjs | 2026-07-24 | Flagship |
| 2 | starlightintelligence.org | site | nextjs | 2026-07-24 | Substrate public site |
| 3 | agenticincome.ai | agenticincome | nextjs | 2026-07-24 | EARN hub |
| 4 | agenticpassiveincome.com | agenticpassiveincome | nextjs | 2026-07-22 | AUTOMATE spoke |
| 5 | disruptivepassiveincome.com | **dpi-open-core** | nextjs | 2026-07-24 | Domain migrated off old `disruptivepassiveincome` project |
| 6 | go.agenticincome.ai | go-agenticincome | nextjs | 2026-07-21 | Funnel |
| 7 | aiarchitectacademy.com | aiarchitectacademy | ? | 2026-07-24 | Academy |
| 8 | realityarchitect.ai | realityarchitect | nextjs | 2026-07-24 | Method site |
| 9 | gencreator.ai | gencreator-ai | nextjs | 2026-07-24 | Creator CoE |
| 10 | gencreator.community | gencreator-community | nextjs | 2026-07-18 | Community |
| 11 | vibeclubs.ai | vibeclubs-web | nextjs | 2026-07-24 | Events |
| 12 | bluelifecommons.org | blue-life-commons | nextjs | 2026-07-24 | Marine commons |
| 13 | oceanintelligence.app | ocean-intelligence | nextjs | 2026-07-18 | Marine agents |
| 14 | arcanea.academy | arcanea-academy | nextjs | 2026-07-18 | Arcanea learning |
| 15 | arcanea.dev + arcanean.org + arcanealabs.com | arcanea-domain-portals | ? | 2026-07-18 | Portal shell |
| 16 | starlightintelligence.academy | starlight-intelligence-academy | nextjs | 2026-07-18 | Academy |
| 17 | cecilia.chat | cecilia-chat | ? | 2026-07-18 | Client project |
| 18 | anaceciliacancino.com | ana | ? | 2026-07-17 | Client project |
| 19 | animelegends.ai | anime-legends | nextjs | 2026-07-11 | Anime vertical |
| 20 | lobe.arcanea.ai | arcanea-lobechat-labs | nextjs | 2026-03-01 | **STALE** — domain live, no deploy in ~146 days |

## Red flags

1. **Arcanea apex missing from this team**: `arcanea-ai-app` deploys READY but has **no custom domain** (vercel.app only); `arcanea-ai-appx` — the project the repo's own CLAUDE.md calls production — is in **ERROR** state (last 2026-07-10). Where arcanea.ai resolves is not controlled by any healthy project in this team. Needs resolution.
2. **trinityaicoaching stale since 2025-09-19** (~10 months) yet frankx.ai links /trinity-ai.
3. **Deploy errors**: arcanea-ai-appx (ERROR), anime-studio-landing (ERROR), web (ERROR), author-os (CANCELED).
4. **9 projects never deployed** (frankx-codex-plugins-team-blog, frankx-ai-architecture-20260712, ana-production-excellence-20260710, go-agenticincome-trust-2026-07-10, grok-creative-studio, agentmail-template-starkhq, frankx-vision-deploy, 5× v0-*) — candidates for deletion.
5. **Stale with READY state**: my-library (Apr), vercel-ai-gateway-demo (Mar), v0-ai-misuse-mitigation (Feb), anime-studio-landing (May, ERROR).

## Cleanup recommendation

Delete or archive the 9 never-deployed + 5 v0-* projects (14 total) → team drops from 50 to ~36 projects; then decide the Arcanea production project once and give it the apex domain.
