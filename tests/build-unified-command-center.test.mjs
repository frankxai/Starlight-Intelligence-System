import test from 'node:test';
import assert from 'node:assert/strict';
import {
  collectCommandCenterData,
  renderCommandCenterHtml
} from '../scripts/build-unified-command-center.mjs';

test('collectCommandCenterData returns all 10 organizations, 7 local harnesses, 9 cloud platforms, ecoTelemetry, canonicalAtlas, and 5 next prompts', () => {
  const data = collectCommandCenterData();
  assert.equal(data.organizations.length, 10);
  assert.equal(data.localHarnesses.length, 7);
  assert.equal(data.cloudPlatforms.length, 9);
  assert.equal(data.experiments.length, 6);
  assert.equal(data.operatorPlaybook.length, 8);
  assert.equal(data.nextPrompts.length, 5);
  assert.ok(data.ecoTelemetry);
  assert.ok(data.ecoTelemetry.cfoVendors);
  assert.ok(data.ecoTelemetry.valueTelemetry);
  assert.ok(data.canonicalAtlas);
  assert.equal(data.canonicalAtlas.agentTiers.length, 5);
  assert.equal(data.canonicalAtlas.productLadder.length, 7);
  assert.equal(data.canonicalAtlas.milestoneLadder.length, 7);
  assert.equal(data.canonicalAtlas.failurePrevention.length, 6);
});

test('renderCommandCenterHtml embeds accessible tabs, live Eval-50 metrics, CFO telemetry, Canonical Atlas (Tab 6), and SIP attestation', () => {
  const data = collectCommandCenterData();
  const html = renderCommandCenterHtml(data);
  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes('Unified Local + Cloud Agentic Command Center'));
  assert.ok(html.includes('Built on SIP'));
  assert.ok(html.includes('role="tablist"'));
  assert.ok(html.includes('Starlight-Intelligence-Systems'));
  assert.ok(html.includes('Arcanea-Labs'));
  assert.ok(html.includes('CFO Vendor Spend'));
  assert.ok(html.includes('30-Day Agent Velocity'));
  assert.ok(html.includes('Headroom Cache &amp; Edge Bridge Bus'));
  assert.ok(html.includes('6. Canonical Atlas: Agents, Products, Milestones &amp; Fixes'));
  assert.ok(html.includes('Self-Serve Digital Product Ladder'));
  assert.ok(html.includes('Old-vs-New Agent Failure Prevention Matrix'));
  assert.ok(html.includes('PROMPT-01'));
});
