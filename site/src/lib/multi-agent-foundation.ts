import { constellationProtocol } from "@/lib/constellation-protocol";

export const FOUNDATION_OBJECTS = [
  ["mission_brief", "starlight.mission_brief.v1", "Outcome, human owner, scope, constraints, acceptance, budget, and deadline."],
  ["agent_profile", "agent-card.v1", "Identity, responsibility, capabilities, non-capabilities, tools, memory, gates, and evaluations."],
  ["skill_contract", "SKILL.md + manifest", "Portable behavior with versioned inputs, outputs, dependencies, examples, tests, and failure states."],
  ["swarm_profile", "starlight.swarm_profile.v1", "Topology, active roles, routing, state ownership, write scopes, verifier, gates, and fallback."],
  ["task_packet", "starlight.task_packet.v1", "Bounded objective, context references, inputs, output contract, constraints, privacy, budget, and expiry."],
  ["memory_policy", "starlight.memory_policy.v1", "Scopes, provenance, freshness, privacy class, retention, sharing, contradiction, and deletion behavior."],
  ["tool_policy", "starlight.tool_policy.v1", "Allow, deny, approval, cost, credential, side-effect, revocation, and rollback rules."],
  ["handoff_packet", "starlight.handoff.v1", "Completed work, decisions, artifacts, evidence, unresolved risks, and next bounded action."],
  ["run_receipt", "starlight.run_receipt.v1", "Actors, inputs, tools, outputs, checks, failures, cost, duration, verdict, and rollback evidence."],
  ["evolution_release", "starlight.evolution_release.v1", "Version delta, boundaries, compatibility, migrations, eval comparison, lineage, and retirement."],
] as const;

export const CONTROL_ROLES = [
  ["human_sovereign", "Authority", "Mission, veto, credentials, irreversible decisions, promotion, and accountability."],
  ["conductor", "Coordination", "Decomposition, routing, sequencing, conflict visibility, and synthesis."],
  ["scout", "Discovery", "Signals, sources, assumptions, unknowns, and opportunity framing."],
  ["builder", "Execution", "One bounded implementation or production surface and its artifact."],
  ["critic", "Adversarial quality", "Counterexamples, failure modes, revision requests, and quality pressure."],
  ["steward", "Continuity", "Memory, provenance, budgets, version lineage, and resource boundaries."],
  ["verifier", "Release evidence", "Independent acceptance, failed-gate visibility, receipt integrity, and rollback readiness."],
] as const;

export const RUNTIME_TRUTH_STATES = [
  ["designed", "Contracts exist; no install or execution implied."],
  ["packaged", "Portable artifacts and digests exist; runtime compatibility is still unproven."],
  ["installed", "An adapter placed the pack in a runtime; authority and model quality remain unproven."],
  ["admitted", "Current policy, identity, budget, tools, and data scopes allow a bounded run."],
  ["exercised", "A named workflow ran and emitted an artifact plus receipt."],
  ["verified-live", "Current authenticated operation, acceptance, cost, and rollback evidence passed."],
  ["held", "A gate failed, evidence is missing, or human approval is required."],
  ["retired", "The version is intentionally unavailable and has a migration or archive note."],
] as const;

export const TOPOLOGY_CONTRACTS = [
  ["conductor-specialists", "One mission owner routes to two to five bounded specialists and one verifier."],
  ["pipeline", "Sequential stages exchange versioned artifacts and checkpoints."],
  ["parallel-council", "Independent perspectives converge through an explicit conflict map and synthesis."],
  ["shared-blackboard", "Append-only evidence, hypotheses, ownership, and supersession drive evolving state."],
  ["builder-critic", "A bounded draft–critique–revision loop closes through an independent verdict."],
] as const;

export const TEMPLATE_DOWNLOADS = [
  ["AGENTS.template.md", "System-level authority, topology, packet, verification, and evolution contract."],
  ["agent-profile.template.json", "Portable agent identity and boundary profile."],
  ["swarm-profile.template.json", "Team composition, routing, state, verifier, and human gates."],
  ["task-packet.template.json", "One context-preserving unit of delegated work."],
  ["run-receipt.template.json", "Execution, cost, evidence, verdict, and rollback record."],
  ["evolution-release.template.json", "Evidence-backed capability and version lineage record."],
] as const;

export const VISUAL_SCENE_TYPES = [
  ["team-tableau", "16:9", "Show five agents as one legible house with distinct ownership.", ".ai house story"],
  ["workflow-in-action", "16:9", "Show one bounded handoff, artifact, tool boundary, or evidence path.", ".ai workflow"],
  ["human-gate", "4:5", "Show a human operator controlling a meaningful irreversible boundary.", ".academy trust lesson"],
  ["proof-artifact", "1:1", "Give a pack, receipt, evaluation, or memory object a tactile identity.", ".org evidence"],
  ["evolution-poster", "9:16", "Show capability growth with identity, boundaries, and lineage intact.", "release and story"],
] as const;

export const VISUAL_EXPANSION_50 = constellationProtocol.houses.flatMap((house, houseIndex) =>
  VISUAL_SCENE_TYPES.map(([sceneId, aspect, purpose, surface], sceneIndex) => ({
    id: `${house.id}-${sceneId}`,
    sequence: houseIndex * 5 + sceneIndex + 1,
    house_id: house.id,
    house_name: house.name,
    scene_type: sceneId,
    aspect_ratio: aspect,
    purpose,
    target_surface: surface,
    status:
      house.id === "sovereign-command" && sceneId === "team-tableau"
        ? "generated_inspected"
        : "planned",
    proof_url:
      house.id === "sovereign-command" && sceneId === "team-tableau"
        ? "https://starlightintelligence.ai/assets/constellation/sovereign-command-team-tableau.webp"
        : null,
    rights_status: "generated-owned",
    text_policy: "No generated text, logos, UI, labels, or charts. Exact information is rendered in code.",
  })),
);

export const FOUNDATION_PACK = {
  schema_version: "starlight.multi_agent_foundation_pack.v1",
  id: "starlight-multi-agent-foundation",
  version: "1.0.0",
  status: "public_design_foundation",
  generated_on: "2026-08-15",
  truth_contract: {
    grants_runtime_authority: false,
    includes_private_memory: false,
    proves_install_state: false,
    live_eval_status: "not_run",
    claim: "This pack defines public design contracts and examples. It does not grant tools, credentials, private memory, production admission, or live model performance.",
  },
  source: {
    canonical_agent_repository: constellationProtocol.source.canonical_repository,
    canonical_agent_commit: constellationProtocol.source.canonical_commit,
    canonical_catalog_sha256: constellationProtocol.source.canonical_catalog_sha256,
    capability_pack_digest: constellationProtocol.source.capability_pack_digest,
  },
  counts: {
    protocol_objects: FOUNDATION_OBJECTS.length,
    control_roles: CONTROL_ROLES.length,
    topology_patterns: TOPOLOGY_CONTRACTS.length,
    canonical_swarms: constellationProtocol.counts.swarms,
    canonical_agents: constellationProtocol.counts.agents,
    visual_expansion_briefs: VISUAL_EXPANSION_50.length,
  },
  objects: FOUNDATION_OBJECTS.map(([id, schema, purpose]) => ({ id, schema, purpose })),
  control_roles: CONTROL_ROLES.map(([id, kind, ownership]) => ({ id, kind, ownership })),
  topology_patterns: TOPOLOGY_CONTRACTS.map(([id, contract]) => ({ id, contract })),
  runtime_truth_states: RUNTIME_TRUTH_STATES.map(([id, meaning]) => ({ id, meaning })),
  templates: TEMPLATE_DOWNLOADS.map(([file, purpose]) => ({
    file,
    purpose,
    href: `/downloads/constellation/foundation/${file}`,
  })),
  visual_expansion_href: "/downloads/constellation/foundation/visual-expansion-50.v1.json",
} as const;
