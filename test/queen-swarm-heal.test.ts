import assert from 'node:assert/strict';
import { it } from 'node:test';
import { createReviewReceipt, REVIEW_RECEIPT_MARKER, selectComputePlane, validateReviewReceiptBody, validateReviewReceiptComment, runImmuneSweep } from '../src/queen/index.js';
const task = { id: 'test', repo: 'frankxai/Starlight-Intelligence-System', title: 'Routing test', description: 'Fixture', scopeFiles: ['src/example.ts'] };
const expected = { repository: task.repo, pr: 436, headSha: 'a'.repeat(40), changedFiles: [{ filename: 'src/example.ts' }] };
const body = () => createReviewReceipt({ repository: task.repo, pr: 436, headSha: expected.headSha, maker: 'jules', provider: 'codex', reviewedFiles: ['src/example.ts'], review: 'Fixture report for regression tests only. This fixture does not attest that any real source review occurred.', resolution: 'Fixture only.' }).body;
const comment = () => ({ body: body(), user: { login: 'frankxai' }, author_association: 'OWNER', performed_via_github_app: { slug: 'chatgpt-codex-connector' }, created_at: '2026-10-16T10:00:00Z', updated_at: '2026-10-16T10:00:00Z', edit_history_checked: true, last_edited_at: null, content_edit_count: 0 });
it('refuses unknown host capacity', () => {
  assert.throws(() => selectComputePlane(task));
  assert.throws(() => selectComputePlane(task, { freeRamGb: NaN, activeLocalAgents: 0 }));
  assert.throws(() => selectComputePlane(task, { freeRamGb: 8, activeLocalAgents: NaN }));
});
it('refuses weakened machine limits', () => {
  assert.throws(() => selectComputePlane(task, { freeRamGb: 1, activeLocalAgents: 0, minFreeRamGb: 0 }));
  assert.throws(() => selectComputePlane(task, { freeRamGb: 8, activeLocalAgents: 2, maxLocalAgents: 99 }));
});
it('counts requested agents against remaining slots', () => {
  const result = selectComputePlane({ ...task, parallelCount: 2 }, { freeRamGb: 8, activeLocalAgents: 1 });
  assert.equal(result.computePlane, 'cloud-run-worker');
  assert.equal(result.spilledOverToCloud, true);
});
it('rejects malformed receipts without throwing', () => {
  for (const json of ['null', '[]', '{"reviewedFiles":"src/example.ts"}']) assert.equal(validateReviewReceiptBody(REVIEW_RECEIPT_MARKER + json, expected).valid, false);
});
it('preserves finance rename risk', () => {
  const renamed = { ...expected, changedFiles: [{ filename: 'src/example.ts', previous_filename: 'src/finance/payout.ts' }] };
  assert.equal(validateReviewReceiptBody(body(), renamed).valid, false);
  assert.equal(validateReviewReceiptBody(body(), { ...renamed, autoMergeArmed: true }).valid, false);
});
it('does not authenticate a reviewer from the payload alone', () => assert.equal(validateReviewReceiptBody(body(), expected).provenanceChecked, false));
it('requires trusted immutable GitHub provenance', () => {
  assert.equal(validateReviewReceiptComment(comment(), expected).valid, true);
  assert.equal(validateReviewReceiptComment({ ...comment(), user: { login: 'untrusted' } }, expected).valid, false);
  assert.equal(validateReviewReceiptComment({ ...comment(), performed_via_github_app: null }, expected).valid, false);
});
it('rejects same-second edits and unknown edit history', () => {
  assert.equal(validateReviewReceiptComment({ ...comment(), content_edit_count: 1 }, expected).valid, false);
  assert.equal(validateReviewReceiptComment({ ...comment(), edit_history_checked: false }, expected).valid, false);
});
it('refuses an empty library sweep', () => assert.equal(runImmuneSweep({}).healthy, false));
