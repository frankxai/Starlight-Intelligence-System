#!/usr/bin/env node
// Structural checks only. No network, catalog mutations or publication authority.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const nonempty = v => typeof v === 'string' && v.trim().length > 0;
const hash = v => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
const https = v => { try { return new URL(v).protocol === 'https:'; } catch { return false; } };
const kinds = new Set(['Human artist','Virtual act','Collective','World project','Series','Label','Historical candidate']);
const decisionStates = new Set(['Founder chosen','Recommended','Incubate','Hold','Historical']);
const artistKinds = new Set(['Human artist','Virtual act','Collective']);
const load = name => JSON.parse(fs.readFileSync(path.join(here, name), 'utf8'));

export function validateRegistry(registry, research) {
  const errors = [];
  const identities = Array.isArray(registry?.identities) ? registry.identities : [];
  const ids = new Set();
  if (registry?.schema_version !== 1) errors.push('Unsupported registry version');
  for (const i of identities) {
    if (!nonempty(i.id) || ids.has(i.id)) errors.push('Missing or duplicate identity ID');
    ids.add(i.id);
    if (!nonempty(i.name) || !kinds.has(i.kind) || !decisionStates.has(i.decision)) errors.push('Invalid identity contract: ' + i.id);
    if (!https(i.notion_url)) errors.push('Missing Notion identity binding: ' + i.id);
  }
  const label = identities.find(i => i.id === registry?.label_id);
  if (label?.name !== 'Arcanea Records' || label?.kind !== 'Label' || label?.decision !== 'Founder chosen') errors.push('Founder label direction missing');
  const flagship = identities.find(i => i.id === 'ar:artist:frank-x');
  if (flagship?.name !== 'Frank X' || flagship?.kind !== 'Human artist' || flagship?.decision !== 'Founder chosen') errors.push('Founder stage direction missing');
  if (registry?.founder_direction?.clears_names !== false) errors.push('Founder choice must not imply name clearance');
  if (!Array.isArray(research?.records) || research.schema_version !== 1) errors.push('Unsupported name-evidence version');
  const researchIds = new Set();
  for (const n of research?.records ?? []) {
    if (!nonempty(n.id) || researchIds.has(n.id)) errors.push('Missing or duplicate research ID');
    researchIds.add(n.id);
    if (!ids.has(n.identity_id)) errors.push('Orphan name record: ' + n.id);
    if (!https(n.notion_url)) errors.push('Missing Notion research binding: ' + n.id);
    if (n.legal_clearance !== 'Open') errors.push('This preliminary snapshot cannot declare legal clearance: ' + n.id);
  }
  return errors;
}

export function checkPacket(p, registry) {
  const blockers = [];
  const need = (ok, message) => { if (!ok) blockers.push(message); };
  const actor = registry?.identities?.find(i => i.id === p?.artist_id);
  need(p?.schema_version === 1, 'Unsupported packet version');
  for (const k of ['release_id','work_id','recording_id']) need(nonempty(p?.[k]), 'Missing ' + k);
  need(p?.label_id === registry?.label_id, 'Wrong label ID');
  need(actor && artistKinds.has(actor.kind) && actor.decision !== 'Historical', 'Primary artist must be a current performer identity');
  need(p?.metadata?.artist_display_name === actor?.name && nonempty(actor?.name), 'Artist display name must match selected identity');
  need(nonempty(p?.metadata?.title) && nonempty(p?.metadata?.ai_disclosure), 'Missing title or truthful AI disclosure declaration');
  need(Number.isInteger(p?.packet_revision) && p.packet_revision > 0, 'Missing positive packet revision');
  need(hash(p?.packet_sha256), 'Missing packet hash');
  need(hash(p?.master?.sha256) && nonempty(p?.master?.evidence_ref), 'Missing exact master/hash evidence');
  need(hash(p?.artwork?.sha256) && nonempty(p?.artwork?.evidence_ref), 'Missing exact artwork/hash evidence');
  need(p?.artist_admission?.decision === 'approved' && nonempty(p.artist_admission.evidence_ref), 'Missing recorded artist admission');
  need(p?.name_review?.status === 'reviewed_for_scope' && nonempty(p.name_review.evidence_ref)
    && Array.isArray(p.name_review.territories) && p.name_review.territories.length > 0
    && p.name_review.territories.every(nonempty), 'Missing scoped name review');
  need(p?.rights?.status === 'reviewed_for_scope' && Array.isArray(p.rights.component_evidence_refs)
    && p.rights.component_evidence_refs.length > 0 && p.rights.component_evidence_refs.every(nonempty), 'Missing component rights evidence');
  need(['not_applicable','approved_scope'].includes(p?.canon?.status), 'World canon scope unresolved');
  if (p?.canon?.status === 'approved_scope') need(nonempty(p.canon.evidence_ref), 'Missing canon source/approval');
  const a = p?.human_approval;
  need(nonempty(a?.approved_by) && nonempty(a?.evidence_ref), 'Missing named human review');
  need(a?.packet_sha256 === p?.packet_sha256 && hash(p?.packet_sha256)
    && a?.packet_revision === p?.packet_revision && Number.isInteger(p?.packet_revision), 'Approval does not bind current packet revision/hash');
  need(a?.master_sha256 === p?.master?.sha256 && hash(p?.master?.sha256), 'Approval does not bind current master');
  need(a?.artwork_sha256 === p?.artwork?.sha256 && hash(p?.artwork?.sha256), 'Approval does not bind current artwork');
  need(Array.isArray(a?.scope) && a.scope.includes('prepare_distribution'), 'Missing preparation review scope');
  const delivery = p?.delivery;
  need(['not_submitted','packet_ready','submitted','live_verified','uncertain'].includes(delivery?.status), 'Invalid delivery state');
  if (['submitted','live_verified'].includes(delivery?.status)) {
    need(nonempty(delivery.receipt_ref) && nonempty(delivery.provider_release_id), 'Delivery declaration needs actual receipt/provider ID');
  }
  if (delivery?.status === 'live_verified') {
    need(Array.isArray(delivery.live_checks) && delivery.live_checks.length > 0
      && delivery.live_checks.every(x => https(x.url) && x.artist_id === p.artist_id && nonempty(x.verified_by) && nonempty(x.checked_at)),
      'Live declaration needs correct-profile URL checks');
  }
  if (delivery?.status === 'uncertain') blockers.push('Provider effect uncertain; reconcile before retry');
  return {structurally_complete: blockers.length === 0, publication_authorized: false,
    evidence_authenticated: false, blockers};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const registry = load('registry.json');
    const command = process.argv[2];
    if (command === 'validate-registry') {
      const errors = validateRegistry(registry, load('name-research.json'));
      process.stdout.write(JSON.stringify({valid: errors.length === 0, errors}, null, 2) + '\n');
      if (errors.length) process.exitCode = 1;
    } else if (command === 'check-release' && process.argv[3]) {
      const result = checkPacket(JSON.parse(fs.readFileSync(process.argv[3], 'utf8')), registry);
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
      if (!result.structurally_complete) process.exitCode = 1;
    } else {
      process.stderr.write('Usage: records-control.mjs validate-registry | check-release <private-packet.json>\n');
      process.exitCode = 2;
    }
  } catch (error) {
    process.stderr.write('Control check failed: ' + error.message + '\n');
    process.exitCode = 2;
  }
}
