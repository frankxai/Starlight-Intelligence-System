# Starlight Explorer Deploy Product Brief

## Surface

Public hybrid product/marketing route at `/deploy` plus the global CTA, repository onboarding, and deterministic deploy contract.

## Audience and job

The primary visitor is an experienced AI builder, technical founder, or agent-system operator. They want a public, inspectable surface they can own and adapt without confusing a hosted website with the local intelligence runtime.

Their first useful win is understanding the deployment boundary in under a minute, then creating a named Vercel project without secrets or hidden infrastructure.

## Language brief

- Visitor vocabulary: fork, project, public site, deployment, source, endpoint, local runtime, private memory.
- Internal vocabulary to avoid: Queen lanes, estate control plane, swarm admission, provider routing.
- Dominant anxiety: “Am I deploying the actual agent system, or only a website?”
- Required proof: exact source directory, exact outputs, explicit exclusions, no-secret requirement, update path, public route examples.
- Emotional transition: ambiguity → control.
- Primary action: **Deploy Starlight Explorer**.

## Product loop

1. Inspect the two-layer boundary.
2. Confirm what Vercel will create and what remains local.
3. Open the preconfigured Vercel clone flow.
4. Receive a forked repository and hosted Explorer.
5. Verify protocol, source, and health routes.
6. Customize source and let Git integration create future previews.

## Scene brief

## Concepts considered

1. **Boundary ledger — selected.** An asymmetric source-to-host trace paired with a precise hosted/local ledger. It answers the visitor's dominant question with the fewest visual primitives and no new runtime.
2. **Deployment terminal receipt.** A full console metaphor that made the page feel like an internal operator surface and raised the cognitive load for first-time visitors.
3. **Two-plane constellation.** A spatial hosted/local diagram that fit the brand world but needed custom motion or WebGL to explain the deployment sequence reliably.

## Component inventory

- Reuse: global `Header`, `Footer`, `StarlightMark`, layout typography, dot grid, focus behavior, and `transition-micro` motion token.
- Add: one static `/deploy` route, one machine-readable deployment contract, and one contract checker.
- External action: Vercel clone flow only after the boundary is visible.
- New dependencies, media, WebGL, and client state: none.

### Scene 1 — The boundary

- Job: answer the deploy question immediately.
- Dominant idea: a central deployment corridor splitting into hosted Explorer and local intelligence runtime.
- Copy: concrete nouns and mechanisms; no hype.
- Interaction: compact source → build → live trace with inspectable labels.
- Static first frame: fully understandable without motion or JavaScript state.
- Mobile: trace becomes a vertical sequence; two boundary panels stack.
- Reduced motion: identical static composition.

### Scene 2 — What arrives

- Job: make the one-click artifact tangible.
- Evidence: forked repo, Next.js project, public routes, Git previews, zero required secrets.
- Composition: one evidence ledger, not a generic equal-card feature grid.

### Scene 3 — What stays sovereign

- Job: prevent category error.
- Evidence: private vaults, MCP runtime, workers, credentials, and orchestration remain outside Vercel.

### Scene 4 — Deploy and verify

- Job: create the project with informed consent.
- Primary CTA: Deploy Starlight Explorer.
- Secondary routes: inspect source and run the local quickstart.
- After-action proof: named route checks and update instructions.

## Motion and assets

Motion job: reveal the deployment trace from source to public URL. Use existing CSS/Track A timing only; no new runtime, image, 3D, video, or external asset. The static story carries the entire meaning.

## Quality and performance budget

- Reuse existing Starlight tokens, typography, header, footer, and page shell.
- No new dependency or client component.
- No new remote asset or rights surface.
- Keep the route server-rendered and mostly static.
- Keyboard focus, tap targets, semantics, contrast, mobile composition, and reduced-motion behavior must remain native.

**Built on SIP — Starlight Intelligence Protocol v1.1.1**
