import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {verifyFileDigestClosure} from '../../tools/foundry/lib/io.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const lock=JSON.parse(readFileSync(new URL('../validators/toolchain.lock.v1.json',import.meta.url),'utf8'));
const closures=[lock.portable.validator.sourceClosure,lock.openai.rules.validator.sourceClosure];
test('the ecosystem test entry point remains bound in both existing package source closures',()=>{
 for(const closure of closures)assert.equal(verifyFileDigestClosure(root,{'package.json':closure['package.json']},['package.json'],'ecosystem package pin').length,1);
});
test('changed package bytes or a missing package pin still fail closed',()=>{
 assert.throws(()=>verifyFileDigestClosure(root,{'package.json':'0'.repeat(64)},['package.json'],'ecosystem package pin'),/source closure digest mismatch/);
 assert.throws(()=>verifyFileDigestClosure(root,{},['package.json'],'ecosystem package pin'),/source closure paths drifted/);
});
