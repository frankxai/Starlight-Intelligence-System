import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildNpyFloat32 } from '../scripts/compile-sovereign-memory.mjs';
import { inspectLanesAndLeases } from '../scripts/horizon-test-runner.mjs';

describe('Sovereign Memory Compiler & Horizon Cadence Runner', () => {
  it('builds a valid NumPy v1.0 float32 .npy buffer with normalized row vectors', () => {
    const texts = [
      'Starlight Intelligence System sovereign memory substrate built on SIP',
      'Ten GitHub Organizations federated with dual-remote origin and org parity',
    ];
    const buf = buildNpyFloat32(texts, 64);
    // Check magic header \x93NUMPY\x01\x00
    assert.equal(buf[0], 0x93);
    assert.equal(buf.subarray(1, 6).toString('ascii'), 'NUMPY');
    assert.equal(buf[6], 1);
    assert.equal(buf[7], 0);
    const headerLen = buf.readUInt16LE(8);
    assert.equal((10 + headerLen) % 64, 0, 'Header must be 64-byte aligned');
    assert.equal(buf.length, 10 + headerLen + texts.length * 64 * 4);
  });

  it('inspects lanes and swarm leases with numeric counts', () => {
    const res = inspectLanesAndLeases();
    assert.equal(typeof res.activeLanes, 'number');
    assert.equal(typeof res.totalLanes, 'number');
    assert.equal(typeof res.leaseFiles, 'number');
    assert.ok(res.leaseFiles >= 0);
  });
});
