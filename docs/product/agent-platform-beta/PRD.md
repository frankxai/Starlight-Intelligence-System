# Agent platform beta — product requirements v0.1

Status: implementation candidate, not a public release. Owner: SIS Foundry. Audience: developers who want a governed, portable agent team. Built on SIP.

## Promise and boundary

A developer can inspect an agent's source, compiled identity, permissions, verifier, and host projection before choosing to install anything. The first useful outcome is an offline, no-spend verification in a fresh repository. SIS owns agent and capability truth; Claude Code, Codex, and supported cloud hosts retain execution authority. This product is not a new scheduler, model gateway, memory store, or generic agent loop.

The portable open core contains public-safe agent definitions, the Foundry compiler/router, a scoped installer, documentation, and tests. Private estate paths, credentials, business data, premium packs, and live authority never enter the npm artifact.

## User stories and acceptance

1. As a newcomer, I can run `starlight team doctor`, see supported hosts and blockers, preview `starlight team plan`, and complete `starlight team verify` without credentials, API calls, or filesystem changes.
2. As a Claude Code developer, I can explicitly install one scoped, read-only agent projection into a repository, inspect the exact changes, and roll them back without disturbing pre-existing files.
3. As a Codex or cloud-session developer, I can see an accurate compatibility verdict. A projection is not called installed or safe where the host cannot enforce its tool allowlist or where cloud configuration has not been exercised.
4. As an operator, I can distinguish `source available`, `compiled`, `installed`, `fixture verified`, `host exercised`, and `production active`. No state silently promotes to the next.

Beta exit targets: a new user reaches a verified dry run in under ten minutes on Windows, macOS, and Linux; no credential or outbound network requirement; deterministic hashes for identical inputs; zero cross-root writes in tests; no unreviewed public claim of live A2A, cloud parity, or team success. Measure route success and unnecessary delegation against a frozen single-agent baseline before any default model selection.

## Out of scope for the first beta

Automatic fanout, provider billing, hosted execution, public A2A endpoints, global installation, automatic merge/deploy/send, and a new visual cockpit. Later host adapters and ACOS creator packs remain separate opt-in releases.

## Release gate

Require a packed-artifact leak/license audit, clean install on three operating systems, tool-boundary tests, independent review, and a receipt linking every public claim to current code. Live orchestration trials and the 60-cell eval belong to Swarm/Evals after machine and spend admission; fixture success is not live quality evidence.
