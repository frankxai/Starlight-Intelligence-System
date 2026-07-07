import test from 'node:test';
import assert from 'node:assert';
import { runUntrustedCode } from '../src/sandbox/wasm-runner.js';

test('Sandbox Execution - Basic Arithmetic', () => {
  const code = `
    const a = 10;
    const b = 20;
    a + b;
  `;
  const result = runUntrustedCode(code);
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.result, 30);
});

test('Sandbox Execution - Restricts process access', () => {
  const code = `
    process.env;
  `;
  const result = runUntrustedCode(code);
  assert.strictEqual(result.success, false);
  assert.match(result.error || '', /process is not defined/);
});

test('Sandbox Execution - Restricts require and filesystem access', () => {
  const code = `
    const fs = require('fs');
    fs.readFileSync('package.json', 'utf8');
  `;
  const result = runUntrustedCode(code);
  assert.strictEqual(result.success, false);
  assert.match(result.error || '', /require is not defined/);
});

test('Sandbox Execution - Restricts string evaluation (new Function)', () => {
  const code = `
    const fn = new Function('return 1 + 1');
    fn();
  `;
  const result = runUntrustedCode(code);
  assert.strictEqual(result.success, false);
  assert.match(result.error || '', /Code generation from strings disallowed for this context/);
});

test('Sandbox Execution - Times out on infinite loop', () => {
  const code = `
    while(true) {}
  `;
  const result = runUntrustedCode(code);
  assert.strictEqual(result.success, false);
  assert.match(result.error || '', /Script execution timed out/);
});
