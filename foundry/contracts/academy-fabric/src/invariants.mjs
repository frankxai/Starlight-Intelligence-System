const parseTime = (value) => value ? Date.parse(value) : Number.NaN;

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
      break;
    case "learning-contract.schema.json":
      if (["accepted", "active", "paused", "completed"].includes(record.status) &&
          (!record.acceptance?.learnerAccepted || !record.acceptance?.academyAccepted)) {
        fail("CONTRACT_NOT_MUTUALLY_ACCEPTED", "An active learning contract requires learner and academy acceptance", "$.acceptance");
      }
      break;
    case "learning-passport.schema.json":
      if (record.projectionType === "public_portfolio" && metadata?.visibility !== "public") {
        fail("PASSPORT_PUBLIC_VISIBILITY", "A public portfolio projection must be explicitly public", "$.metadata.visibility");
      }
      if (Object.hasOwn(record, "rawTelemetry")) {
        fail("PASSPORT_RAW_TELEMETRY", "Learning passports must not contain raw telemetry");
      }
      break;
    case "mission-contract.schema.json":
      if (!record.roles?.some((role) => role.role === "accountable_owner" && role.principalRef?.kind === "human")) {
        fail("MISSION_HUMAN_OWNER", "Mission requires an accountable human owner role", "$.roles");
      }
      break;
    case "agent-team-manifest.schema.json":
      if (record.status === "active" && !record.members?.every((m) => m.capabilityAttestationRef && m.delegationGrantRefs?.length)) {
        fail("AGENT_TEAM_UNATTESTED", "Every active agent requires a pinned attestation and delegation", "$.members");
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
      break;
    case "human-credential.schema.json":
      if (record.subjectRef?.kind !== "human") fail("CREDENTIAL_NON_HUMAN_SUBJECT", "Human credential subject must be human", "$.subjectRef.kind");
      if (record.assessment?.decision?.decision !== "approved") fail("CREDENTIAL_WITHOUT_APPROVAL", "Credential issuance requires an approved human decision", "$.assessment.decision");
      if (parseTime(record.validUntil) <= parseTime(record.validFrom)) fail("CREDENTIAL_VALIDITY_ORDER", "validUntil must follow validFrom", "$.validUntil");
      break;
    case "agent-capability-attestation.schema.json": {
      const days = (parseTime(record.validUntil) - parseTime(record.validFrom)) / 86400000;
      if (days > 90) fail("AGENT_ATTESTATION_TOO_LONG", "Draft policy limits agent attestations to 90 days", "$.validUntil");
      break;
    }
    case "contribution-receipt.schema.json":
      if (record.economicBoundary?.authorisesPayout || record.economicBoundary?.confersOwnership) {
        fail("RECEIPT_ECONOMIC_OVERREACH", "A receipt cannot authorise payout or confer ownership", "$.economicBoundary");
      }
      break;
    case "entitlement-policy.schema.json":
      if (record.financialGuardrails?.debtCreationAllowed !== false) fail("ENTITLEMENT_DEBT", "Entitlement policies cannot create debt", "$.financialGuardrails.debtCreationAllowed");
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
  const credential = records.find((r) => r.schemaName === "human-credential.schema.json")?.record;
  if (credential) {
    for (const ref of credential.evidenceBundleRefs ?? []) {
      const target = byId.get(ref.id);
      if (target && target.record.subjectRef?.id !== credential.subjectRef?.id) {
        errors.push({ code: "CREDENTIAL_EVIDENCE_SUBJECT_MISMATCH", message: `${credential.metadata.id} references evidence for another subject` });
      }
    }
  }
  for (const { record } of records) {
    const tenantId = record?.metadata?.tenantRef?.id;
    const refs = JSON.stringify(record).match(/urn:starlight:[a-z-]+:[A-Za-z0-9._:-]+/g) ?? [];
    for (const id of refs) {
      const target = byId.get(id);
      if (target && target.record?.metadata?.scope !== "global" && target.record?.metadata?.tenantRef?.id !== tenantId) {
        errors.push({ code: "CROSS_TENANT_REFERENCE", message: `${record.metadata?.id} references ${id} across tenant boundary` });
      }
    }
  }
  return errors;
}

