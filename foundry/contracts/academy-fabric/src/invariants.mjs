const parseTime = (value) => value ? Date.parse(value) : Number.NaN;
const READ_FIRST_TOOL_SCOPES = new Set([
  "academy.pack.read",
  "academy.mission.read",
  "academy.passport.read",
  "academy.evidence.metadata.read",
  "academy.credential.verify",
  "academy.agent-attestation.verify",
  "academy.receipt.verify",
  "academy.competency-graph.read",
  "academy.execution-graph.read",
  "academy.schema.read",
  "academy.schema.validate",
  "academy.evidence.preflight"
]);

const sameRef = (left, right) => Boolean(left?.id && right?.id && left.id === right.id);
const sameVersionedRef = (ref, target) => (
  ref?.id === target?.metadata?.id &&
  ref?.version === target?.metadata?.recordVersion &&
  ref?.digest === target?.metadata?.provenance?.contentDigest
);

const duplicateValues = (values) => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];

function reachableNodeIds(entryIds, edges) {
  const adjacency = new Map();
  for (const edge of edges ?? []) {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from).push(edge.to);
  }
  const reached = new Set(entryIds ?? []);
  const queue = [...reached];
  while (queue.length) {
    for (const next of adjacency.get(queue.shift()) ?? []) {
      if (reached.has(next)) continue;
      reached.add(next);
      queue.push(next);
    }
  }
  return reached;
}

function hasDirectedCycle(nodeIds, edges) {
  const adjacency = new Map(nodeIds.map((id) => [id, []]));
  for (const edge of edges ?? []) adjacency.get(edge.from)?.push(edge.to);
  const visiting = new Set();
  const visited = new Set();
  const visit = (id) => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const next of adjacency.get(id) ?? []) if (visit(next)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  return nodeIds.some(visit);
}

function collectReferenceIds(value, key = "", output = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectReferenceIds(item, key, output);
    return output;
  }
  if (!value || typeof value !== "object") {
    if ((key.endsWith("Ref") || key.endsWith("Refs")) && typeof value === "string") output.push(value);
    return output;
  }
  if ((key.endsWith("Ref") || key.endsWith("Refs")) && typeof value.id === "string") output.push(value.id);
  for (const [childKey, childValue] of Object.entries(value)) collectReferenceIds(childValue, childKey, output);
  return output;
}

export function validateInvariants(schemaName, record) {
  const errors = [];
  const fail = (code, message, path = "$") => errors.push({ code, message, path });
  const metadata = record?.metadata;

  if (metadata) {
    if (parseTime(metadata.updatedAt) < parseTime(metadata.createdAt)) {
      fail("AUDIT_TIME_ORDER", "updatedAt must not precede createdAt", "$.metadata.updatedAt");
    }
    if (metadata.scope === "global" && metadata.dataClassification === "restricted") {
      fail("GLOBAL_RESTRICTED_SCOPE", "Restricted records cannot use global scope", "$.metadata.scope");
    }
  }

  switch (schemaName) {
    case "academy-pack.schema.json":
      if (record.releaseStatus === "published" && metadata?.maturity !== "active") {
        fail("PACK_PUBLISHED_NOT_ACTIVE", "Published packs must be active", "$.metadata.maturity");
      }
      if (record.releaseStatus === "published" && !record.openAccessContract?.completePathWithoutPayment) {
        fail("PACK_PUBLIC_PATH_PAYMENT_GATED", "Published packs require a complete path that does not depend on payment", "$.openAccessContract.completePathWithoutPayment");
      }
      if (record.releaseStatus === "published" && !metadata?.license) {
        fail("PACK_LICENSE_MISSING", "Published packs require an explicit license and rights holder", "$.metadata.license");
      }
      break;
    case "learning-contract.schema.json":
      if (["accepted", "active", "paused", "completed"].includes(record.status) &&
          (!record.acceptance?.learnerAccepted || !record.acceptance?.academyAccepted)) {
        fail("CONTRACT_NOT_MUTUALLY_ACCEPTED", "An active learning contract requires learner and academy acceptance", "$.acceptance");
      }
      if (["public_open", "local", "commons"].includes(record.access?.accessBasis) && record.access?.entitlementPolicyRef) {
        fail("OPEN_ACCESS_ENTITLEMENT_COUPLING", "Public, local, and Commons learning cannot require an entitlement policy", "$.access.entitlementPolicyRef");
      }
      if (["local", "byok"].includes(record.resourceEnvelope?.executionMode) && record.resourceEnvelope?.academyHostedUsageLimits?.length) {
        fail("LOCAL_EXECUTION_HOSTED_QUOTA", "Local and BYOK execution must not consume an Academy-hosted quota", "$.resourceEnvelope.academyHostedUsageLimits");
      }
      if (["hosted_capped", "sponsored_hosted", "managed_private"].includes(record.resourceEnvelope?.executionMode) && !record.resourceEnvelope?.academyHostedUsageLimits?.length) {
        fail("HOSTED_EXECUTION_UNBOUNDED", "Hosted execution requires at least one transparent hard usage limit", "$.resourceEnvelope.academyHostedUsageLimits");
      }
      break;
    case "competency-graph.schema.json": {
      const nodes = record.nodes ?? [];
      const edges = record.edges ?? [];
      const nodeIds = nodes.map((node) => node.id);
      const nodeIdSet = new Set(nodeIds);
      const duplicateNodeIds = duplicateValues(nodeIds);
      const duplicateEdgeIds = duplicateValues(edges.map((edge) => edge.id));
      if (record.status === "active" && metadata?.visibility === "public" && !metadata?.license) fail("COMPETENCY_GRAPH_LICENSE_MISSING", "Active public competency graphs require an explicit license", "$.metadata.license");
      if (duplicateNodeIds.length) fail("COMPETENCY_GRAPH_DUPLICATE_NODE", "Competency graph node identifiers must be unique", "$.nodes");
      if (duplicateEdgeIds.length) fail("COMPETENCY_GRAPH_DUPLICATE_EDGE", "Competency graph edge identifiers must be unique", "$.edges");
      if ((record.rootNodeIds ?? []).some((id) => !nodeIdSet.has(id))) fail("COMPETENCY_GRAPH_ROOT_UNRESOLVED", "Every graph root must resolve to a node", "$.rootNodeIds");
      if (edges.some((edge) => !nodeIdSet.has(edge.from) || !nodeIdSet.has(edge.to))) fail("COMPETENCY_GRAPH_EDGE_UNRESOLVED", "Every graph edge endpoint must resolve", "$.edges");
      const reached = reachableNodeIds(record.rootNodeIds, edges);
      if (nodes.some((node) => !reached.has(node.id))) fail("COMPETENCY_GRAPH_ORPHAN_NODE", "Every competency graph node must be reachable from a declared root", "$.nodes");
      const prerequisiteEdges = edges.filter((edge) => edge.relation === "requires");
      if (hasDirectedCycle(nodeIds, prerequisiteEdges)) fail("COMPETENCY_GRAPH_PREREQUISITE_CYCLE", "Prerequisite edges must be acyclic", "$.edges");
      const nodeById = new Map(nodes.map((node) => [node.id, node]));
      for (const competency of nodes.filter((node) => node.kind === "competency" && node.lifecycle === "active")) {
        const reachableKinds = new Set([...reachableNodeIds([competency.id], edges)].map((id) => nodeById.get(id)?.kind));
        const requiredKinds = ["mission", "artifact_type", "evidence_requirement"];
        if (requiredKinds.some((kind) => !reachableKinds.has(kind)) || (!reachableKinds.has("rubric") && !reachableKinds.has("evaluator"))) {
          fail("COMPETENCY_GRAPH_PROOF_PATH_INCOMPLETE", "Every active competency must reach a mission, artifact, evidence requirement, and rubric or evaluator", `$.nodes[${nodes.indexOf(competency)}]`);
        }
      }
      break;
    }
    case "execution-graph.schema.json": {
      const nodes = record.nodes ?? [];
      const edges = record.edges ?? [];
      const nodeIds = nodes.map((node) => node.id);
      const nodeIdSet = new Set(nodeIds);
      const nodeById = new Map(nodes.map((node) => [node.id, node]));
      if (["experimental", "validated"].includes(record.status) && metadata?.visibility === "public" && !metadata?.license) fail("EXECUTION_GRAPH_LICENSE_MISSING", "Published experimental or validated execution graphs require an explicit license", "$.metadata.license");
      if (duplicateValues(nodeIds).length) fail("EXECUTION_GRAPH_DUPLICATE_NODE", "Execution graph node identifiers must be unique", "$.nodes");
      if (duplicateValues(edges.map((edge) => edge.id)).length) fail("EXECUTION_GRAPH_DUPLICATE_EDGE", "Execution graph edge identifiers must be unique", "$.edges");
      if ([...(record.entryNodeIds ?? []), ...(record.terminalNodeIds ?? []), ...(record.recovery?.checkpointNodeIds ?? [])].some((id) => !nodeIdSet.has(id))) {
        fail("EXECUTION_GRAPH_REFERENCE_UNRESOLVED", "Entry, terminal, and checkpoint references must resolve", "$");
      }
      if (edges.some((edge) => !nodeIdSet.has(edge.from) || !nodeIdSet.has(edge.to))) fail("EXECUTION_GRAPH_EDGE_UNRESOLVED", "Every execution edge endpoint must resolve", "$.edges");
      const reached = reachableNodeIds(record.entryNodeIds, edges);
      if (nodes.some((node) => !reached.has(node.id))) fail("EXECUTION_GRAPH_UNREACHABLE_NODE", "Every execution node must be reachable from an entry", "$.nodes");
      for (const terminalId of record.terminalNodeIds ?? []) {
        if (nodeById.get(terminalId)?.kind !== "terminal") fail("EXECUTION_GRAPH_TERMINAL_KIND", "Every terminal reference must target a terminal node", "$.terminalNodeIds");
        if (edges.some((edge) => edge.from === terminalId)) fail("EXECUTION_GRAPH_TERMINAL_OUTBOUND", "Terminal nodes cannot have outgoing edges", "$.edges");
      }
      for (const checkpointId of record.recovery?.checkpointNodeIds ?? []) {
        if (nodeById.get(checkpointId)?.kind !== "checkpoint") fail("EXECUTION_GRAPH_CHECKPOINT_KIND", "Recovery checkpoints must target checkpoint nodes", "$.recovery.checkpointNodeIds");
      }
      for (const [index, node] of nodes.entries()) {
        const consequential = ["consequential", "irreversible"].includes(node.authority?.sideEffectClass);
        const incomingHumanApproval = edges.some((edge) => edge.to === node.id && edge.type === "approval" && nodeById.get(edge.from)?.executor?.kind === "human");
        if (consequential && node.executor?.kind !== "human" && !incomingHumanApproval) {
          fail("EXECUTION_GRAPH_HUMAN_GATE_MISSING", "Consequential non-human execution requires an incoming approval edge from a human node", `$.nodes[${index}]`);
        }
        if (node.authority?.sideEffectClass === "irreversible" && !node.compensationRef && !incomingHumanApproval) {
          fail("EXECUTION_GRAPH_COMPENSATION_MISSING", "Irreversible execution requires compensation or a prior human approval gate", `$.nodes[${index}]`);
        }
      }
      if (sameRef(record.evaluation?.independentVerifierRef, metadata?.createdByRef)) {
        fail("EXECUTION_GRAPH_BUILDER_IS_VERIFIER", "The graph builder cannot be its independent verifier", "$.evaluation.independentVerifierRef");
      }
      if (record.status === "validated" && record.evaluation?.promotionStatus !== "validated") {
        fail("EXECUTION_GRAPH_FALSE_PROMOTION", "A validated graph requires a validated proof receipt", "$.evaluation.promotionStatus");
      }
      break;
    }
    case "learning-passport.schema.json": {
      if (record.projectionType === "public_portfolio" && metadata?.visibility !== "public") {
        fail("PASSPORT_PUBLIC_VISIBILITY", "A public portfolio projection must be explicitly public", "$.metadata.visibility");
      }
      if (Object.hasOwn(record, "rawTelemetry")) {
        fail("PASSPORT_RAW_TELEMETRY", "Learning passports must not contain raw telemetry");
      }
      const generatedAt = parseTime(record.generatedAt);
      const cutoffAt = parseTime(record.sourceCutoffAt);
      const shareExpiresAt = parseTime(record.sharePolicy?.expiresAt);
      if (cutoffAt > generatedAt) fail("PASSPORT_FUTURE_SOURCE_CUTOFF", "Passport sourceCutoffAt cannot follow generatedAt", "$.sourceCutoffAt");
      if (shareExpiresAt <= generatedAt) fail("PASSPORT_SHARE_EXPIRED", "Passport sharing must expire after projection generation", "$.sharePolicy.expiresAt");
      const grantRefs = new Set(record.sharePolicy?.consentGrantRefs ?? []);
      const checks = record.sharePolicy?.consentStatusChecks ?? [];
      const checkRefs = new Set(checks.map((check) => check.grantRef));
      if (grantRefs.size !== checkRefs.size || [...grantRefs].some((ref) => !checkRefs.has(ref))) {
        fail("PASSPORT_CONSENT_CHECK_MISMATCH", "Every consent grant requires exactly one admission-time status check", "$.sharePolicy.consentStatusChecks");
      }
      if ([...grantRefs].some((ref) => !(metadata?.consentRefs ?? []).includes(ref))) {
        fail("PASSPORT_CONSENT_NOT_BOUND", "Passport metadata must bind every consent grant used by its share policy", "$.metadata.consentRefs");
      }
      for (const [index, check] of checks.entries()) {
        const checkedAt = parseTime(check.checkedAt);
        if (checkedAt > generatedAt || generatedAt - checkedAt > 300000) {
          fail("PASSPORT_STALE_CONSENT_CHECK", "Consent status must be checked no more than five minutes before projection generation", `$.sharePolicy.consentStatusChecks[${index}].checkedAt`);
        }
        if (parseTime(check.validUntil) < shareExpiresAt) {
          fail("PASSPORT_CONSENT_EXPIRES_EARLY", "Consent validity cannot end before the share grant", `$.sharePolicy.consentStatusChecks[${index}].validUntil`);
        }
        if (!sameRef(check.subjectRef, record.subjectRef)) {
          fail("PASSPORT_CONSENT_SUBJECT_MISMATCH", "Consent status subject must match the Passport subject", `$.sharePolicy.consentStatusChecks[${index}].subjectRef`);
        }
        if (!sameRef(check.proof?.signerRef, record.subjectRef) || check.proof?.purpose !== "approval") {
          fail("PASSPORT_CONSENT_PROOF_INVALID", "Consent status proof must be an approval signed by the Passport subject", `$.sharePolicy.consentStatusChecks[${index}].proof`);
        }
      }
      break;
    }
    case "mission-contract.schema.json":
      if (!record.roles?.some((role) => role.role === "accountable_owner" && role.principalRef?.kind === "human")) {
        fail("MISSION_HUMAN_OWNER", "Mission requires an accountable human owner role", "$.roles");
      }
      break;
    case "agent-team-manifest.schema.json":
      if (record.status === "active" && !record.members?.every((m) => m.capabilityAttestationRef && m.delegationGrantRefs?.length)) {
        fail("AGENT_TEAM_UNATTESTED", "Every active agent requires a pinned attestation and delegation", "$.members");
      }
      if (record.status === "active") {
        for (const [index, member] of (record.members ?? []).entries()) {
          if (["execute_reversible", "execute_bounded"].includes(member.autonomyLevel)) {
            fail("AGENT_TEAM_EXECUTION_DEFERRED", "v0.1 active Academy agents are read/recommend/draft only", `$.members[${index}].autonomyLevel`);
          }
          for (const scope of member.toolScopes ?? []) {
            if (!READ_FIRST_TOOL_SCOPES.has(scope)) {
              fail("AGENT_TEAM_WRITE_SCOPE_DEFERRED", `Tool scope ${scope} is outside the v0.1 read-first surface`, `$.members[${index}].toolScopes`);
            }
          }
          const grants = member.delegationGrants ?? [];
          const grantRefs = new Set(member.delegationGrantRefs ?? []);
          if (!grants.length || grants.some((grant) => !grantRefs.has(grant.id)) || grantRefs.size !== new Set(grants.map((grant) => grant.id)).size) {
            fail("AGENT_TEAM_UNRESOLVED_DELEGATION", "Every delegation reference requires one signed admission-time grant snapshot", `$.members[${index}].delegationGrants`);
          }
          for (const [grantIndex, grant] of grants.entries()) {
            const grantPath = `$.members[${index}].delegationGrants[${grantIndex}]`;
            if (grant.status !== "active") fail("AGENT_DELEGATION_INACTIVE", "Active teams require active grants", `${grantPath}.status`);
            if (!sameRef(grant.delegateRef, member.serviceIdentityRef)) fail("AGENT_DELEGATION_WRONG_DELEGATE", "Grant delegate must match the member service identity", `${grantPath}.delegateRef`);
            if (![record.accountableHumanRef?.id, record.controllerOrganisationRef?.id].includes(grant.principalRef?.id)) {
              fail("AGENT_DELEGATION_WRONG_PRINCIPAL", "Grant principal must be the accountable human or controller organisation", `${grantPath}.principalRef`);
            }
            if ((member.toolScopes ?? []).some((scope) => !(grant.actions ?? []).includes(scope))) {
              fail("AGENT_DELEGATION_SCOPE_ESCALATION", "Member tool scopes must be a subset of delegated actions", `${grantPath}.actions`);
            }
            const admissionAt = parseTime(metadata?.updatedAt);
            if (parseTime(grant.validity?.startsAt) > admissionAt || !grant.validity?.endsAt || parseTime(grant.validity.endsAt) <= admissionAt) {
              fail("AGENT_DELEGATION_OUTSIDE_VALIDITY", "Grant must cover the active manifest admission time", `${grantPath}.validity`);
            }
            if (grant.maxDelegationDepth !== 0 || grant.parentGrantRef) {
              fail("AGENT_TRANSITIVE_DELEGATION_DEFERRED", "v0.1 active Academy agents cannot subdelegate", `${grantPath}.maxDelegationDepth`);
            }
            if (!sameRef(grant.proof?.signerRef, grant.principalRef) || grant.proof?.purpose !== "approval") {
              fail("AGENT_DELEGATION_PROOF_INVALID", "Delegation must carry an approval proof from its principal", `${grantPath}.proof`);
            }
          }
        }
      }
      break;
    case "artifact.schema.json":
      if (metadata?.visibility === "sealed" && !record.content?.encryptionKeyRef) {
        fail("SEALED_ARTIFACT_UNENCRYPTED", "Sealed artifact requires a separate encryption key reference", "$.content.encryptionKeyRef");
      }
      break;
    case "evidence-bundle.schema.json":
      if (["frozen", "submitted", "verifying", "verified"].includes(record.status) && !record.freeze?.manifestDigest) {
        fail("EVIDENCE_NOT_FROZEN", "Submitted evidence must be frozen and digest-addressed", "$.freeze");
      }
      if (record.status === "verified") {
        if (record.verification?.completeness !== "complete") fail("EVIDENCE_VERIFIED_INCOMPLETE", "Verified evidence must be complete", "$.verification.completeness");
        if (record.verification?.provenanceIntegrity !== "valid") fail("EVIDENCE_VERIFIED_PROVENANCE_INVALID", "Verified evidence requires valid provenance", "$.verification.provenanceIntegrity");
        if (record.verification?.policyConformance !== "conformant") fail("EVIDENCE_VERIFIED_POLICY_INVALID", "Verified evidence must conform to policy", "$.verification.policyConformance");
        if ((record.verification?.findings ?? []).some((finding) => ["error", "blocking"].includes(finding.severity))) {
          fail("EVIDENCE_VERIFIED_BLOCKING_FINDING", "Verified evidence cannot retain error or blocking findings", "$.verification.findings");
        }
        if (parseTime(record.verification?.verifiedAt) < parseTime(record.freeze?.frozenAt)) {
          fail("EVIDENCE_VERIFICATION_TIME_ORDER", "Evidence cannot be verified before it is frozen", "$.verification.verifiedAt");
        }
        if (!sameRef(record.freeze?.signature?.signerRef, record.freeze?.frozenByRef) || record.freeze?.signature?.purpose !== "approval") {
          fail("EVIDENCE_FREEZE_PROOF_INVALID", "Evidence freeze requires an approval proof from frozenByRef", "$.freeze.signature");
        }
      }
      break;
    case "human-credential.schema.json":
      if (record.subjectRef?.kind !== "human") fail("CREDENTIAL_NON_HUMAN_SUBJECT", "Human credential subject must be human", "$.subjectRef.kind");
      if (record.assessment?.decision?.decision !== "approved") fail("CREDENTIAL_WITHOUT_APPROVAL", "Credential issuance requires an approved human decision", "$.assessment.decision");
      if (parseTime(record.validUntil) <= parseTime(record.validFrom)) fail("CREDENTIAL_VALIDITY_ORDER", "validUntil must follow validFrom", "$.validUntil");
      if (sameRef(record.assessment?.decision?.decidedBy, record.subjectRef)) fail("CREDENTIAL_SELF_ASSESSMENT", "A credential subject cannot make their own assessment decision", "$.assessment.decision.decidedBy");
      if (!sameRef(record.assessment?.decision?.decisionSignature?.signerRef, record.assessment?.decision?.decidedBy) || record.assessment?.decision?.decisionSignature?.purpose !== "approval") {
        fail("CREDENTIAL_DECISION_PROOF_INVALID", "Assessment decision must carry an approval proof from decidedBy", "$.assessment.decision.decisionSignature");
      }
      if (!sameRef(record.verification?.proof?.signerRef, record.issuerRef) || record.verification?.proof?.purpose !== "issuance") {
        fail("CREDENTIAL_ISSUER_PROOF_INVALID", "Credential verification proof must be an issuance proof from issuerRef", "$.verification.proof");
      }
      break;
    case "agent-capability-attestation.schema.json": {
      const validFrom = parseTime(record.validFrom);
      const validUntil = parseTime(record.validUntil);
      const days = (validUntil - validFrom) / 86400000;
      if (!Number.isFinite(days) || validUntil <= validFrom) fail("AGENT_ATTESTATION_VALIDITY_ORDER", "validUntil must follow validFrom", "$.validUntil");
      if (days > 90) fail("AGENT_ATTESTATION_TOO_LONG", "Draft policy limits agent attestations to 90 days", "$.validUntil");
      if (record.status === "active" && (record.evaluations?.safetyClaims ?? []).some((claim) => claim.outcome !== "pass")) {
        fail("AGENT_ATTESTATION_UNSAFE_CLAIM", "Every safety claim must pass before an attestation can be active", "$.evaluations.safetyClaims");
      }
      if (record.status === "active" && record.verification?.proof?.purpose !== "attestation") {
        fail("AGENT_ATTESTATION_PROOF_INVALID", "An active attestation requires a proof with attestation purpose", "$.verification.proof");
      }
      break;
    }
    case "contribution-receipt.schema.json":
      if (record.economicBoundary?.authorisesPayout || record.economicBoundary?.confersOwnership) {
        fail("RECEIPT_ECONOMIC_OVERREACH", "A receipt cannot authorise payout or confer ownership", "$.economicBoundary");
      }
      break;
    case "entitlement-policy.schema.json":
      if (record.financialGuardrails?.debtCreationAllowed !== false) fail("ENTITLEMENT_DEBT", "Entitlement policies cannot create debt", "$.financialGuardrails.debtCreationAllowed");
      if (["public_open", "local", "commons"].includes(record.accessBasis) && record.offerRefs?.length) {
        fail("OPEN_ACCESS_OFFER_COUPLING", "Public, local, and Commons access cannot depend on a commercial offer", "$.offerRefs");
      }
      break;
    case "event-envelope.schema.json":
      if (record.eventexpiry && parseTime(record.eventexpiry) <= parseTime(record.time)) fail("EVENT_EXPIRY_ORDER", "eventexpiry must follow time", "$.eventexpiry");
      break;
  }
  return errors;
}

export function validateCrossRecords(records) {
  const errors = [];
  const byId = new Map(records.filter((r) => r.record?.metadata?.id).map((r) => [r.record.metadata.id, r]));
  const credentials = records.filter((r) => r.schemaName === "human-credential.schema.json").map((r) => r.record);
  for (const credential of credentials) {
    for (const ref of credential.evidenceBundleRefs ?? []) {
      const target = byId.get(ref.id);
      if (!target || target.schemaName !== "evidence-bundle.schema.json") {
        errors.push({ code: "CREDENTIAL_EVIDENCE_UNRESOLVED", message: `${credential.metadata.id} references missing or non-evidence record ${ref.id}` });
        continue;
      }
      if (!sameVersionedRef(ref, target.record)) {
        errors.push({ code: "CREDENTIAL_EVIDENCE_REF_MISMATCH", message: `${credential.metadata.id} does not pin the accepted evidence version and digest for ${ref.id}` });
      }
      if (target.record.status !== "verified") {
        errors.push({ code: "CREDENTIAL_EVIDENCE_NOT_VERIFIED", message: `${credential.metadata.id} references evidence ${ref.id} with status ${target.record.status}` });
      }
      if (target.record.subjectRef?.id !== credential.subjectRef?.id) {
        errors.push({ code: "CREDENTIAL_EVIDENCE_SUBJECT_MISMATCH", message: `${credential.metadata.id} references evidence for another subject` });
      }
      if (!sameVersionedRef(credential.missionContractRef, { metadata: { id: target.record.missionContractRef?.id, recordVersion: target.record.missionContractRef?.version, provenance: { contentDigest: target.record.missionContractRef?.digest } } })) {
        errors.push({ code: "CREDENTIAL_EVIDENCE_MISSION_MISMATCH", message: `${credential.metadata.id} and ${ref.id} do not pin the same Mission Contract` });
      }
      if (!(credential.assessment?.decision?.evidenceRefs ?? []).includes(ref.id)) {
        errors.push({ code: "CREDENTIAL_DECISION_EVIDENCE_MISSING", message: `${credential.metadata.id} decision does not bind evidence ${ref.id}` });
      }
      if (parseTime(credential.issuedAt) < parseTime(target.record.verification?.verifiedAt)) {
        errors.push({ code: "CREDENTIAL_ISSUED_BEFORE_VERIFICATION", message: `${credential.metadata.id} predates verification of ${ref.id}` });
      }
    }
  }

  const activeTeams = records.filter((r) => r.schemaName === "agent-team-manifest.schema.json" && r.record.status === "active").map((r) => r.record);
  for (const team of activeTeams) {
    for (const member of team.members ?? []) {
      const target = byId.get(member.capabilityAttestationRef?.id);
      if (!target || target.schemaName !== "agent-capability-attestation.schema.json") {
        errors.push({ code: "AGENT_ATTESTATION_UNRESOLVED", message: `${team.metadata.id} references missing or invalid attestation ${member.capabilityAttestationRef?.id}` });
        continue;
      }
      const attestation = target.record;
      if (!sameVersionedRef(member.capabilityAttestationRef, attestation)) errors.push({ code: "AGENT_ATTESTATION_REF_MISMATCH", message: `${team.metadata.id} does not pin the admitted attestation version and digest` });
      if (attestation.status !== "active") errors.push({ code: "AGENT_ATTESTATION_INACTIVE", message: `${team.metadata.id} references a non-active attestation` });
      if (!sameRef(member.agentBuildRef, attestation.agentBuildRef)) errors.push({ code: "AGENT_ATTESTATION_BUILD_MISMATCH", message: `${team.metadata.id} member build differs from its attestation` });
      if (!sameRef(member.serviceIdentityRef, attestation.serviceIdentityRef)) errors.push({ code: "AGENT_ATTESTATION_IDENTITY_MISMATCH", message: `${team.metadata.id} member service identity differs from its attestation` });
      if (!sameRef(team.controllerOrganisationRef, attestation.controllerRef)) errors.push({ code: "AGENT_ATTESTATION_CONTROLLER_MISMATCH", message: `${team.metadata.id} controller differs from its attestation` });
      if ((member.toolScopes ?? []).some((scope) => !(attestation.toolAndDataScopes?.actions ?? []).includes(scope))) errors.push({ code: "AGENT_ATTESTATION_SCOPE_ESCALATION", message: `${team.metadata.id} member requests tools outside its attested actions` });
      const admittedAt = parseTime(team.metadata?.updatedAt);
      if (parseTime(attestation.validFrom) > admittedAt || parseTime(attestation.validUntil) <= admittedAt) errors.push({ code: "AGENT_ATTESTATION_OUTSIDE_VALIDITY", message: `${team.metadata.id} admission time is outside the attestation validity window` });
    }
  }

  for (const { record } of records) {
    const tenantId = record?.metadata?.tenantRef?.id;
    for (const id of new Set(collectReferenceIds(record))) {
      const target = byId.get(id);
      if (target && target.record?.metadata?.scope !== "global" && target.record?.metadata?.tenantRef?.id !== tenantId) {
        errors.push({ code: "CROSS_TENANT_REFERENCE", message: `${record.metadata?.id} references ${id} across tenant boundary` });
      }
    }
  }
  return errors;
}
