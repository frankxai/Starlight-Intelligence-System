import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

// Resolve from Next itself, so a second unrelated Sharp installation cannot mask its version.
const require = createRequire(import.meta.url);
const fromNext = createRequire(require.resolve('next/package.json'));
const sharp = fromNext('sharp');

function atLeast(actual, minimum) {
  assert.match(actual, /^\d+\.\d+\.\d+$/, 'Expected a stable native library version');
  const parts = actual.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (parts[i] !== minimum[i]) return parts[i] > minimum[i];
  }
  return true;
}

const pixels = Buffer.alloc(16 * 16 * 4, Buffer.from([255, 0, 0, 255]));
const raw = { width: 16, height: 16, channels: 4 };

test('Next loads Sharp and librsvg versions patched for GHSA-wq5f-xc86-pv6w', () => {
  assert.ok(atLeast(sharp.versions.sharp, [0, 35, 5]), 'Sharp must be at least 0.35.5');
  assert.ok(atLeast(sharp.versions.rsvg, [2, 63, 2]), 'librsvg must be at least 2.63.2');
  console.log(JSON.stringify({ imageDependency: {
    sharp: sharp.versions.sharp, rsvg: sharp.versions.rsvg,
    platform: process.platform, arch: process.arch,
  } }));
});

test('the selected native library encodes and resizes a raster image', async () => {
  const { data, info } = await sharp(pixels, { raw }).resize(8, 8).png().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, 8);
  assert.equal(info.height, 8);
  assert.equal(info.format, 'png');
  const metadata = await sharp(data).metadata();
  assert.equal(metadata.width, 8);
  assert.equal(metadata.height, 8);
});

test('the patched SVG decoder produces a correctly sized raster', async () => {
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="12" height="6"><rect width="12" height="6" fill="green"/></svg>');
  const { info } = await sharp(svg, { limitInputPixels: 256 }).png().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, 12);
  assert.equal(info.height, 6);
  assert.equal(info.format, 'png');
});

test('invalid input is rejected and a subsequent valid conversion succeeds', async () => {
  await assert.rejects(() => sharp(Buffer.from('not-an-image')).png().toBuffer());
  const { info } = await sharp(pixels, { raw }).png().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, 16);
  assert.equal(info.height, 16);
});

test('the SVG decoder enforces its input pixel limit', async () => {
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64"/></svg>');
  await assert.rejects(() => sharp(svg, { limitInputPixels: 64 }).png().toBuffer(), /pixel limit/i);
});
