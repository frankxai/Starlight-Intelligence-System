import copy
import importlib.util
import json
import os
import subprocess
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).parents[1]
spec = importlib.util.spec_from_file_location('gate', ROOT / 'merge_review_gate.py')
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)
policy = gate.policy

REPO = 'frankxai/Starlight-Intelligence-System'
HEAD = 'a' * 40
OWNER = {'login': 'frankxai', 'id': 132689939, 'type': 'User'}
APP_ID, BOT_ID = 4242, 9001
HUMAN = {'login': 'second-human', 'id': 501}
TRUST = copy.deepcopy(policy.load_trust())
TRUST['checkerApp'].update(appId=APP_ID, botUserId=BOT_ID)
TRUST['independentReviewers']['users'] = [dict(HUMAN)]
CLAUDE_COMMIT = {'author': dict(OWNER), 'committer': dict(OWNER),
                 'commit': {'message': 'fix\n\nCo-Authored-By: Claude <noreply@anthropic.com>',
                            'author': {'name': 'frankxai', 'email': 'f@users.noreply.github.com'},
                            'committer': {'name': 'frankxai', 'email': 'f@users.noreply.github.com'}}}
REPORT = 'PASS: Independently inspected the supplied exact content; no blocking defect was found here.'


def case(*paths, previous=None, status='modified'):
    """Changed files plus the manifest the gate recomputes from the compare API."""
    files = [{'filename': p, 'status': status, 'sha': f'{i:040x}', 'patch': f'@@ -1 +1 @@\n+{p}\n'}
             for i, p in enumerate(paths)]
    if previous:
        files[0]['previous_filename'] = previous
    compare = {'files': files, 'merge_base_commit': {'sha': 'c' * 40}}
    manifest = policy.build_manifest(compare, HEAD)
    return files, policy.sha256(policy.canonical(manifest)), policy.manifest_paths(manifest)


FILES, MANIFEST_SHA, PATHS = case('core/lib/format.js', 'docs/guide.md')


def body(**changes):
    value = {'repository': REPO, 'pr': 110, 'headSha': HEAD, 'maker': 'claude-code',
             'makerVendors': ['anthropic'], 'provider': 'grok', 'verdict': 'PASS',
             'blockingFindings': [], 'reviewedFiles': PATHS, 'manifestSha256': MANIFEST_SHA,
             'review': REPORT, 'reviewSha256': policy.sha256(REPORT), 'packetSha256': 'b' * 64,
             'resolution': 'No blocking findings; static review only.',
             'cost_usd': None, 'cost_source': 'unknown'}
    value.update(changes)
    return value


def ledger_entry(receipt, run_id=1, **changes):
    text = policy.canonical(receipt)
    run = {'id': run_id, 'name': policy.RECEIPT_CHECK, 'head_sha': HEAD, 'app': {'id': APP_ID},
           'status': 'completed', 'conclusion': 'success' if receipt.get('verdict') == 'PASS' else 'failure',
           'output': {'summary': f'receiptSha256: {policy.sha256(text)}', 'text': text}}
    run.update(changes)
    return run


def app_comment(receipt, comment_id=100):
    return {'id': comment_id, 'user': {'login': 'starlight-checker[bot]', 'id': BOT_ID, 'type': 'Bot'},
            'performed_via_github_app': {'id': APP_ID, 'slug': 'starlight-checker'},
            'created_at': '2026-10-13T07:00:00Z', 'updated_at': '2026-10-13T07:00:00Z',
            'edit_history_checked': True, 'last_edited_at': None, 'content_edit_count': 0,
            'body': gate.MARKER + policy.canonical(receipt)}


def owner_comment(receipt):
    """The PR #377 shape: a canned receipt posted with the owner's shared gh login."""
    comment = app_comment(receipt)
    comment['user'] = dict(OWNER)
    comment['author_association'] = 'OWNER'
    comment['performed_via_github_app'] = None
    return comment


def recorded(*receipts):
    """App ledger entries plus mirror comments, as the runner records them."""
    ledger = [ledger_entry(r, i + 1) for i, r in enumerate(receipts)]
    comments = [app_comment(r, 100 + i) for i, r in enumerate(receipts)]
    return ledger, comments


def review(user=HUMAN, state='APPROVED', commit=HEAD, association='COLLABORATOR', user_type='User'):
    return {'user': dict(user, type=user_type), 'state': state, 'commit_id': commit,
            'author_association': association}


def evaluate(files=FILES, ledger=(), comments=(), reviews=(), auto_merge=None, author=OWNER,
             identities=({'id': OWNER['id']},), complete=True, manifest_sha=MANIFEST_SHA, paths=PATHS,
             vendors=('anthropic',), trust=TRUST, head=HEAD):
    return gate.evaluate({'repository': REPO, 'number': 110, 'head': head, 'files': files,
                          'comments': list(comments), 'ledger': list(ledger), 'reviews': list(reviews),
                          'auto_merge': auto_merge, 'pr_author': author, 'trust': trust,
                          'identities': list(identities), 'identities_complete': complete,
                          'manifest_sha': manifest_sha, 'manifest_paths': list(paths),
                          'maker_vendors': list(vendors)})[0]


def passes(receipt=None, **kwargs):
    ledger, comments = recorded(receipt or body())
    return evaluate(ledger=ledger, comments=comments, **kwargs)


class AttestationIdentityTests(unittest.TestCase):
    def test_sensitive_requires_app_ledger_pass(self):
        self.assertFalse(evaluate())
        self.assertTrue(passes())

    def test_pr377_owner_login_canned_receipt_fails(self):
        self.assertFalse(evaluate(comments=[owner_comment(body())]))
        for association in ['MEMBER', 'COLLABORATOR']:
            comment = owner_comment(body())
            comment['author_association'] = association
            self.assertFalse(evaluate(comments=[comment]))

    def test_owner_login_cannot_borrow_app_attribution(self):
        comment = owner_comment(body())
        comment['performed_via_github_app'] = {'id': APP_ID, 'slug': 'starlight-checker'}
        ledger = [ledger_entry(body())]
        self.assertFalse(evaluate(ledger=ledger, comments=[comment]))  # ledger has no mirror

    def test_app_id_mismatch_is_ignored(self):
        receipt = body()
        for app_id, login, user_id in [(15368, 'github-actions[bot]', 41898282),
                                       (APP_ID, 'starlight-checker[bot]', 41898282),
                                       (7, 'starlight-checker[bot]', BOT_ID)]:
            with self.subTest(app_id=app_id, user_id=user_id):
                ledger = [ledger_entry(receipt, app={'id': app_id})]
                comment = app_comment(receipt)
                comment['performed_via_github_app'] = {'id': app_id, 'slug': 'starlight-checker'}
                comment['user'].update(login=login, id=user_id)
                self.assertFalse(evaluate(ledger=ledger, comments=[comment]))

    def test_trust_file_rejects_denied_apps_and_dependent_reviewers(self):
        for change in [{'appId': 15368, 'botUserId': 1}, {'appId': 5, 'botUserId': None},
                       {'appId': 5, 'botUserId': 6, 'slug': 'github-actions'}]:
            trust = copy.deepcopy(TRUST)
            trust['checkerApp'].update(change)
            with self.subTest(change=change), tempfile.TemporaryDirectory() as temp:
                path = Path(temp) / 'trust.json'
                path.write_text(json.dumps(trust), encoding='utf8')
                with self.assertRaises(policy.PolicyError):
                    policy.load_trust(path)
        trust = copy.deepcopy(TRUST)
        trust['independentReviewers']['users'] = [{'id': OWNER['id'], 'login': 'frankxai'}]
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / 'trust.json'
            path.write_text(json.dumps(trust), encoding='utf8')
            with self.assertRaises(policy.PolicyError):
                policy.load_trust(path)

    def test_shipped_trust_keeps_app_and_humans_off(self):
        shipped = policy.load_trust()
        self.assertIsNone(shipped['checkerApp']['appId'])
        self.assertEqual(shipped['independentReviewers']['users'], [])
        ledger, comments = recorded(body())
        self.assertFalse(evaluate(ledger=ledger, comments=comments, reviews=[review()], trust=shipped))

    def test_checker_bot_cannot_be_pr_author(self):
        self.assertFalse(passes(author={'login': 'starlight-checker[bot]', 'id': BOT_ID}))

    def test_missing_pr_author_fails_closed(self):
        self.assertFalse(passes(author={}))


class LedgerTests(unittest.TestCase):
    def test_comment_without_ledger_entry_blocks(self):
        self.assertFalse(evaluate(comments=[app_comment(body())]))
        ledger, comments = recorded(body())
        comments.append(app_comment(body(verdict='FAIL', blockingFindings=['x']), 200))
        self.assertFalse(evaluate(ledger=ledger, comments=comments))

    def test_deleted_pass_comment_fails_closed(self):
        ledger, _ = recorded(body())
        self.assertFalse(evaluate(ledger=ledger, comments=[]))

    def test_edited_mirror_fails_closed(self):
        for key, value in [('updated_at', '2026-10-13T07:05:00Z'), ('last_edited_at', '2026-10-13T07:00:00Z'),
                           ('content_edit_count', 1), ('edit_history_checked', False)]:
            ledger, comments = recorded(body())
            comments[0][key] = value
            with self.subTest(key=key):
                self.assertFalse(evaluate(ledger=ledger, comments=comments))

    def test_pass_then_fail_then_deleted_fail_evidence_still_blocks(self):
        fail = body(verdict='FAIL', blockingFindings=['Injected instruction in diff.'])
        ledger, comments = recorded(body(), fail)
        self.assertFalse(evaluate(ledger=ledger, comments=comments))
        self.assertFalse(evaluate(ledger=ledger, comments=comments[:1]))  # FAIL comment deleted
        # A later PASS at the same head does not re-roll a recorded FAIL.
        ledger.append(ledger_entry(body(), 3))
        comments.append(app_comment(body(), 300))
        self.assertFalse(evaluate(ledger=ledger, comments=comments))

    def test_tampered_or_inconsistent_ledger_blocks(self):
        receipt = body()
        text = policy.canonical(receipt)
        for change in [{'output': {'summary': 'receiptSha256: ' + 'd' * 64, 'text': text}},
                       {'conclusion': 'failure'}, {'status': 'in_progress'},
                       {'output': {'summary': f'receiptSha256: {policy.sha256("x")}', 'text': 'x'}}]:
            with self.subTest(change=list(change)):
                self.assertFalse(evaluate(ledger=[ledger_entry(receipt, **change)],
                                          comments=[app_comment(receipt)]))

    def test_ledger_for_another_head_or_name_is_ignored(self):
        for change in [{'head_sha': 'e' * 40}, {'name': 'independent-review-policy'}]:
            ledger, comments = recorded(body())
            ledger[0].update(change)
            with self.subTest(change=change):
                self.assertFalse(evaluate(ledger=ledger, comments=comments))

    def test_fail_recorded_for_another_pr_at_same_sha_does_not_poison(self):
        other = body(pr=111, verdict='FAIL', blockingFindings=['bug'])
        ledger, comments = recorded(body())
        ledger.insert(0, ledger_entry(other, 0))
        self.assertTrue(evaluate(ledger=ledger, comments=comments))
        ledger[0] = ledger_entry(body(repository='attacker/repo', verdict='FAIL', blockingFindings=['x']), 0)
        self.assertTrue(evaluate(ledger=ledger, comments=comments))
        # A FAIL for this PR still blocks.
        ledger[0] = ledger_entry(body(verdict='FAIL', blockingFindings=['bug']), 0)
        self.assertFalse(evaluate(ledger=ledger, comments=comments))

    def test_duplicate_keys_in_ledger_text_block(self):
        receipt = body()
        text = policy.canonical(receipt)[:-1] + ',"verdict":"PASS"}'
        run = ledger_entry(receipt)
        run['output'] = {'summary': f'receiptSha256: {policy.sha256(text)}', 'text': text}
        comment = app_comment(receipt)
        comment['body'] = gate.MARKER + text
        self.assertFalse(evaluate(ledger=[run], comments=[comment]))

    def test_newest_pass_decides_after_crashed_older_pass(self):
        ledger, comments = recorded(body(), body(packetSha256='f' * 64))
        self.assertTrue(evaluate(ledger=ledger, comments=comments[1:]))
        self.assertFalse(evaluate(ledger=ledger, comments=comments[:1]))

    def test_windows_marker_keeps_ledger_match(self):
        ledger, comments = recorded(body())
        comments[0]['body'] = comments[0]['body'].replace(gate.MARKER, gate.MARKER.replace('\n', '\r\n'), 1)
        self.assertTrue(evaluate(ledger=ledger, comments=comments))

    def test_invalid_marker_separators_block(self):
        for separator in ['\r', ' \n', '\r\r\n', '\\n']:
            ledger, comments = recorded(body())
            comments[0]['body'] = comments[0]['body'].replace(gate.MARKER, gate.MARKER.rstrip('\n') + separator, 1)
            with self.subTest(separator=separator):
                self.assertFalse(evaluate(ledger=ledger, comments=comments))


class ReceiptIntegrityTests(unittest.TestCase):
    def test_tampered_or_mismatched_receipts_block(self):
        for change in [{'headSha': 'c' * 40}, {'reviewedFiles': PATHS[:1]}, {'reviewedFiles': PATHS[::-1]},
                       {'blockingFindings': ['unfixed']}, {'reviewSha256': 'd' * 64}, {'maker': 'untrusted'},
                       {'pr': 111}, {'pr': '110'}, {'repository': 'attacker/repo'}, {'packetSha256': 'bad'},
                       {'resolution': ''}, {'review': 'short'}, {'manifestSha256': 'e' * 64},
                       {'makerVendors': ['anthropic', 'xai']}, {'verdict': 'WARN'}]:
            with self.subTest(change=change):
                self.assertFalse(passes(body(**change)))

    def test_toctou_receipt_for_benign_content_fails_at_real_head(self):
        # Reviewed content S was recorded under head H; the gate recomputes H's manifest.
        _, benign_sha, _ = case('core/lib/format.js', 'docs/guide.md', status='added')
        self.assertFalse(passes(body(manifestSha256=benign_sha)))
        self.assertFalse(passes(manifest_sha=''))  # manifest could not be computed

    def test_reviewed_files_must_equal_manifest(self):
        files, sha, paths = case('core/lib/format.js')
        receipt = body(reviewedFiles=PATHS, manifestSha256=sha)
        self.assertFalse(passes(receipt, files=files, manifest_sha=sha, paths=paths))
        self.assertTrue(passes(body(reviewedFiles=paths, manifestSha256=sha), files=files,
                               manifest_sha=sha, paths=paths))

    def test_cost_fields(self):
        for good in [{'cost_usd': None, 'cost_source': 'unknown'},
                     {'cost_usd': 0.0123, 'cost_source': 'estimated'},
                     {'cost_usd': 0, 'cost_source': 'billed'}]:
            with self.subTest(good=good):
                self.assertTrue(passes(body(**good)))
        for bad in [{'cost_usd': 0, 'cost_source': 'unknown'}, {'cost_usd': None, 'cost_source': 'estimated'},
                    {'cost_usd': -1, 'cost_source': 'billed'}, {'cost_usd': True, 'cost_source': 'billed'},
                    {'cost_usd': 1, 'cost_source': 'guessed'}, {'cost_usd': '0.01', 'cost_source': 'estimated'}]:
            with self.subTest(bad=bad):
                self.assertFalse(passes(body(**bad)))
        receipt = body()
        del receipt['cost_source']
        self.assertFalse(passes(receipt))


class VendorTests(unittest.TestCase):
    def test_self_review_and_same_vendor_never_qualify(self):
        self.assertFalse(passes(body(maker='grok', provider='grok', makerVendors=['xai']), vendors=['xai']))
        self.assertFalse(passes(body(maker='antigravity', provider='gemini', makerVendors=['google']),
                                vendors=['google']))

    def test_grok_commit_on_claude_branch_cannot_get_grok_review(self):
        vendors = policy.maker_vendors('agent/claude/x', [CLAUDE_COMMIT, {
            'commit': {'message': 'feat\n\nCo-authored-by: Grok <grok@x.ai>', 'author': {}, 'committer': {}}}], TRUST)
        self.assertEqual(vendors, ['anthropic', 'xai'])
        self.assertFalse(passes(body(makerVendors=vendors), vendors=vendors))
        self.assertTrue(passes(body(makerVendors=vendors, provider='codex'), vendors=vendors))

    def test_unknown_or_unverifiable_vendors_fail_closed(self):
        with self.assertRaises(policy.PolicyError):
            policy.maker_vendors('agent/claude/x', [{'commit': {'message': 'x\n\nCo-authored-by: Cursor Agent <a@b>',
                                                                'author': {}, 'committer': {}}}], TRUST)
        with self.assertRaises(policy.PolicyError):
            policy.maker_vendors('feature/x', [], TRUST)
        # cto has no verifiable vendor, so it never qualifies as a reviewer or maker.
        self.assertFalse(passes(body(provider='cto')))

    def test_commit_authors_add_vendors(self):
        commit = {'author': {'login': 'google-labs-jules[bot]'},
                  'commit': {'message': 'x\n\nCo-authored-by: Codex <codex@openai.com>', 'author': {}, 'committer': {}}}
        self.assertEqual(policy.maker_vendors('agent/codex/x', [commit], TRUST), ['google', 'openai'])

    def test_self_declared_branch_without_corroboration_is_unknown_maker(self):
        # A Grok-made change pushed to agent/claude/x with no trailer: the branch is only a claim.
        bare = {'sha': 'f' * 40, 'author': dict(OWNER), 'committer': dict(OWNER),
                'commit': {'message': 'feat: change', 'author': {'name': 'frankxai'}, 'committer': {'name': 'frankxai'}}}
        for commits in [[bare], [CLAUDE_COMMIT, bare], []]:
            with self.subTest(n=len(commits)), self.assertRaises(policy.PolicyError):
                policy.maker_vendors('agent/claude/x', commits, TRUST)
        grok_only = {'commit': {'message': 'x\n\nCo-authored-by: Grok <grok@x.ai>', 'author': {}, 'committer': {}}}
        with self.assertRaises(policy.PolicyError):  # vendor shown, but not the branch's
            policy.maker_vendors('agent/claude/x', [grok_only], TRUST)
        # With the maker unknown the gate has no vendors, so no checker PASS qualifies.
        self.assertFalse(passes(vendors=[]))


class RiskTests(unittest.TestCase):
    def high_risk_case(self, path, **kwargs):
        files, sha, paths = case(path, **kwargs)
        return files, body(reviewedFiles=paths, manifestSha256=sha), dict(files=files, manifest_sha=sha, paths=paths)

    def test_high_risk_paths_reject_vendor_pass_and_take_independent_human(self):
        for path in ['src/payments/checkout.ts', 'scripts/publish.mjs', 'lib/auth/session.ts', 'LICENSE',
                     '.env.example', 'tools/merge-review/checker-trust.json', 'tools/jules-conductor/config.json',
                     '.github/workflows/ci.yml', 'src/marketplace/catalog.ts', 'AGENTS.md', 'skills/foo/SKILL.md',
                     'package.json', 'pnpm-lock.yaml', 'docs/notes/auth.md', 'docs/merge-review-runner.md']:
            files, receipt, kw = self.high_risk_case(path)
            with self.subTest(path=path):
                self.assertFalse(passes(receipt, **kw))
                # F12: a non-qualifying PASS is ignored, not a veto on an independent human.
                ledger, comments = recorded(receipt)
                self.assertTrue(evaluate(ledger=ledger, comments=comments, reviews=[review()], **kw))
                ledger, comments = recorded(dict(receipt, verdict='FAIL', blockingFindings=['bug']))
                self.assertFalse(evaluate(ledger=ledger, comments=comments, reviews=[review()], **kw))

    def test_rename_of_high_risk_path_keeps_rules(self):
        files, receipt, kw = self.high_risk_case('src/helper.py', previous='src/auth.py', status='renamed')
        self.assertFalse(passes(receipt, **kw))
        self.assertTrue(evaluate(reviews=[review()], **kw))
        low_files, low_receipt, low_kw = self.high_risk_case('src/helper.py', previous='src/util.py', status='renamed')
        self.assertTrue(passes(low_receipt, **low_kw))

    def test_armed_auto_merge_fails_high_risk(self):
        files, receipt, kw = self.high_risk_case('src/payments/checkout.ts')
        self.assertTrue(evaluate(reviews=[review()], **kw))
        self.assertFalse(evaluate(reviews=[review()], auto_merge={'merge_method': 'squash'}, **kw))
        self.assertTrue(passes(auto_merge={'merge_method': 'squash'}))  # low risk after a PASS

    def test_routine_plain_text_passes_without_review(self):
        self.assertTrue(evaluate(files=[{'filename': 'docs/notes/update.md', 'status': 'modified', 'mode': '100644'}]))

    def test_routine_excludes_instruction_executable_and_renamed_paths(self):
        for item in [{'filename': 'docs/notes/AGENTS.md', 'status': 'modified', 'mode': '100644'},
                     {'filename': 'docs/notes/a.md', 'status': 'renamed', 'mode': '100644'},
                     {'filename': 'docs/notes/a.md', 'status': 'modified', 'mode': '100644',
                      'previous_filename': 'src/auth.py'},
                     {'filename': 'docs/notes/a.md', 'status': 'modified', 'mode': '120000'},
                     {'filename': 'docs/notes/a.md', 'status': 'modified', 'mode': '100755'},
                     {'filename': 'docs/notes/../a.md', 'status': 'modified', 'mode': '100644'},
                     {'filename': 'docs/notes/a.py', 'status': 'modified', 'mode': '100644'}]:
            with self.subTest(item=item):
                self.assertFalse(evaluate(files=[item]))


class HumanReviewTests(unittest.TestCase):
    def test_listed_independent_human_passes(self):
        self.assertTrue(evaluate(reviews=[review()]))

    def test_human_paths_that_deny(self):
        stranger = {'login': 'stranger', 'id': 777}
        for bad, identities in [(review(user=OWNER), [{'id': OWNER['id']}]),
                                (review(user=stranger), [{'id': OWNER['id']}]),
                                (review(commit='c' * 40), [{'id': OWNER['id']}]),
                                (review(state='COMMENTED'), [{'id': OWNER['id']}]),
                                (review(association='NONE'), [{'id': OWNER['id']}]),
                                (review(user_type='Bot'), [{'id': OWNER['id']}]),
                                (review(), [{'id': HUMAN['id']}])]:  # approver also pushed
            with self.subTest(review=bad['user'], identities=identities):
                self.assertFalse(evaluate(reviews=[bad], identities=identities))
        self.assertFalse(evaluate(reviews=[review()], complete=False))  # pushers not authenticated

    def test_dismissed_or_changes_requested_revokes(self):
        self.assertFalse(evaluate(reviews=[review(), review(state='DISMISSED')]))
        self.assertFalse(passes(reviews=[review(user={'login': 'x', 'id': 3}, state='CHANGES_REQUESTED')]))
        self.assertTrue(evaluate(reviews=[review(state='CHANGES_REQUESTED'), review()]))

    def test_checker_fail_is_not_overridden_by_human_approval(self):
        ledger, comments = recorded(body(verdict='FAIL', blockingFindings=['bug']))
        self.assertFalse(evaluate(ledger=ledger, comments=comments, reviews=[review()]))

    def test_owner_comments_are_ignored_not_revoking(self):
        ledger, comments = recorded(body())
        comments.append(owner_comment(body(verdict='FAIL')))
        self.assertTrue(evaluate(ledger=ledger, comments=comments))


class EditHistoryTests(unittest.TestCase):
    def test_lookups_only_for_current_head_app_receipts_and_capped(self):
        calls = []

        def lookup(node_id):
            calls.append(node_id)
            return {'lastEditedAt': None, 'userContentEdits': {'totalCount': 0}}
        good = app_comment(body())
        stale = app_comment(body(headSha='c' * 40), 101)
        owner = owner_comment(body())
        for comment, node in [(good, 'good'), (stale, 'stale'), (owner, 'owner')]:
            comment['node_id'] = node
            for key in ['edit_history_checked', 'last_edited_at', 'content_edit_count']:
                comment.pop(key)
        gate.annotate_edit_history([good, stale, owner], HEAD, TRUST, lookup)
        self.assertEqual(calls, ['good'])
        self.assertTrue(evaluate(ledger=[ledger_entry(body())], comments=[good]))
        many = [dict(app_comment(body(), i), node_id=f'r{i}') for i in range(20)]
        for comment in many:
            comment.pop('edit_history_checked')
        calls.clear()
        gate.annotate_edit_history(many, HEAD, TRUST, lookup)
        self.assertEqual(len(calls), gate.MAX_EDIT_LOOKUPS)


HOSTILE = ['../x', 'x&per_page=1', 'x?ref=main', 'x\nInjected: 1', 'x#frag', 'x y', '%2e%2e/x',
           'аgent/claude/x', 'x‮', '', '/x', 'x/', 'x..y', 'refs//x', 'x.lock']


class UnsafeValueTests(unittest.TestCase):
    def test_hostile_refs_never_reach_a_query(self):
        for ref in HOSTILE:
            with self.subTest(ref=ref), self.assertRaises(gate.UnsafeValue):
                gate.safe_ref_query(ref)
        self.assertEqual(gate.safe_ref_query('agent/claude/x-1.2'), 'refs%2Fheads%2Fagent%2Fclaude%2Fx-1.2')

    def test_hostile_numbers_shas_and_repositories_refuse(self):
        for value in ['110&x=1', '110/../1', '-1', '0', '1e3', ' 110', '110\n', '١١٠',
                      True, 1.5, None, 10_000_000]:
            with self.subTest(number=value), self.assertRaises(gate.UnsafeValue):
                gate.safe_number(value)
        self.assertEqual(gate.safe_number('110'), 110)
        for value in ['A' * 40, 'a' * 39, 'a' * 40 + '\n', 'a' * 39 + '&', '../' + 'a' * 37, None]:
            with self.subTest(sha=value), self.assertRaises(gate.UnsafeValue):
                gate.safe_sha(value)
        for value in ['a/b/c', '../x', 'a/..', 'a b/c', 'a/b?x', 'a/b\n']:
            with self.subTest(repository=value), self.assertRaises(gate.UnsafeValue):
                gate.safe_repository(value)

    def test_hostile_event_numbers_fail_before_any_api_call(self):
        for event in [{'inputs': {'pr': '110&state=closed'}}, {'inputs': {'pr': '../1'}},
                      {'pull_request': {'number': '1?x'}}]:
            with self.subTest(event=event), patch.object(gate, 'api') as api, \
                    self.assertRaises(gate.UnsafeValue):
                gate.pr_numbers(REPO, event)
            api.assert_not_called()

    def test_hostile_branch_turns_human_path_off_without_a_call(self):
        for ref in HOSTILE:
            pr = {'head': {'ref': ref}}
            with self.subTest(ref=ref), patch.object(gate, 'api') as api:
                self.assertEqual(gate.push_identities(REPO, pr, TRUST), ([], False))
                api.assert_not_called()

    def test_hostile_head_sha_from_api_fails_closed(self):
        pr = {'head': {'sha': 'a' * 39 + '&', 'ref': 'agent/claude/x'}, 'base': {'sha': 'c' * 40},
              'changed_files': 1}
        with patch.object(gate, 'api', return_value=[]), self.assertRaises(gate.UnsafeValue):
            gate.collect_context(REPO, 110, pr, TRUST)


class FakeGateApi:
    """A GitHub stand-in for main(): records every endpoint and can change heads or fail."""

    def __init__(self, comments=(), ledger=(), reviews=(), commits=(CLAUDE_COMMIT,), heads=(HEAD,),
                 errors=(), policy_runs=(), workflow_runs=None, activity=None, page=100, head_repo=REPO):
        self.comments, self.ledger, self.reviews = list(comments), list(ledger), list(reviews)
        self.commits, self.heads, self.errors = list(commits), list(heads), list(errors)
        self.policy_runs, self.workflow_runs = list(policy_runs), workflow_runs or {}
        self.activity = [{'actor': dict(OWNER)}] if activity is None else activity
        self.page, self.head_repo, self.calls, self.pr_reads = page, head_repo, [], 0

    def pages(self, items):
        return [items[i:i + self.page] for i in range(0, len(items), self.page)] or [[]]

    def check_pages(self, runs, total=None):
        return [{'total_count': len(runs) if total is None else total, 'check_runs': chunk}
                for chunk in self.pages(runs)]

    def __call__(self, endpoint, payload=None, paginate=False):
        self.calls.append(endpoint)
        for marker, error in self.errors:
            if marker in endpoint:
                raise error
        if payload is not None:
            return {'id': 456}
        if '/files' in endpoint:
            raise AssertionError('classification must never read the moving /files listing')
        if endpoint.endswith('/pulls/110'):
            head = self.heads[min(self.pr_reads, len(self.heads) - 1)]
            self.pr_reads += 1
            return {'number': 110, 'state': 'open', 'changed_files': len(FILES), 'user': dict(OWNER),
                    'auto_merge': None, 'base': {'sha': 'c' * 40, 'repo': {'default_branch': 'main'}},
                    'head': {'sha': head, 'ref': 'agent/claude/x', 'repo': {'full_name': self.head_repo}}}
        if '/compare/' in endpoint:
            return {'files': copy.deepcopy(FILES), 'merge_base_commit': {'sha': 'c' * 40},
                    'commits': copy.deepcopy(self.commits), 'total_commits': len(self.commits)}
        if '/comments?' in endpoint:
            return self.pages(copy.deepcopy(self.comments))
        if '/reviews?' in endpoint:
            return self.pages(list(self.reviews))
        if f'check_name={policy.RECEIPT_CHECK}' in endpoint:
            return self.check_pages(copy.deepcopy(self.ledger))
        if f'check_name={gate.CHECK_NAME}' in endpoint:
            return self.check_pages(copy.deepcopy(self.policy_runs))
        if '/actions/runs/' in endpoint:
            return self.workflow_runs[endpoint.rsplit('/', 1)[1]]
        if '/activity?' in endpoint:
            return [self.activity]
        raise AssertionError(f'unexpected endpoint {endpoint}')


def rate_limited():
    return subprocess.CalledProcessError(1, ['gh'], stderr='API rate limit exceeded')


class MainWiringTests(unittest.TestCase):
    def run_main(self, fake=None, event=None, trust=TRUST, trust_error=None, **kw):
        fake = fake or FakeGateApi(**kw)
        event = event or {'pull_request': {'number': 110, 'head': {'sha': HEAD}}}
        loader = {'side_effect': trust_error} if trust_error else {'return_value': copy.deepcopy(trust)}
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / 'event.json'
            path.write_text(json.dumps(event), encoding='utf-8')
            env = {'GITHUB_REPOSITORY': REPO, 'GITHUB_EVENT_PATH': str(path), 'GITHUB_RUN_ID': '777'}
            with patch.dict(os.environ, env, clear=True), patch.object(gate, 'api', side_effect=fake), \
                    patch.object(policy, 'load_trust', **loader), \
                    patch.object(gate, 'graphql_edit_history',
                                 return_value={'lastEditedAt': None, 'userContentEdits': {'totalCount': 0}}), \
                    patch.object(gate.subprocess, 'run') as publish, patch('builtins.print'):
                try:
                    gate.main()
                except SystemExit:
                    pass
        self.fake = fake
        return [json.loads(call.kwargs['input'])['conclusion'] for call in publish.call_args_list]

    def unchecked(self, receipt, node='n1', comment_id=100):
        comment = app_comment(receipt, comment_id)
        comment['node_id'] = node
        for key in ['edit_history_checked', 'last_edited_at', 'content_edit_count']:
            comment.pop(key)
        return comment

    def test_main_accepts_app_ledger_and_ignores_owner_receipt(self):
        self.assertEqual(self.run_main(comments=[owner_comment(body())]), ['failure'])
        self.assertEqual(self.run_main(comments=[self.unchecked(body())], ledger=[ledger_entry(body())]), ['success'])
        self.assertEqual(self.run_main(reviews=[review()]), ['success'])
        self.assertFalse(any('/files' in call for call in self.fake.calls))

    def test_main_recomputes_manifest_and_vendors(self):
        grok_commit = copy.deepcopy(CLAUDE_COMMIT)
        grok_commit['commit']['message'] += '\nCo-authored-by: Grok <grok@x.ai>'
        self.assertEqual(self.run_main(comments=[self.unchecked(body())], ledger=[ledger_entry(body())],
                                       commits=(grok_commit,)), ['failure'])

    def test_force_push_h_s_h_fails_closed(self):
        benign = 'b' * 40
        # First read H, then the branch moved to S while evaluating: fail closed.
        self.assertEqual(self.run_main(reviews=[review()], heads=(HEAD, benign, HEAD)), ['failure'])
        self.assertTrue(all(HEAD in call for call in self.fake.calls if '/compare/' in call))

    def test_ledger_and_comments_paginate_without_truncation(self):
        receipts = [body(packetSha256=f'{i:064x}') for i in range(130)]
        ledger = [ledger_entry(r, i + 1) for i, r in enumerate(receipts)]
        comments = [self.unchecked(receipts[-1], 'n-last', 999)] + [owner_comment(body()) for _ in range(140)]
        self.assertEqual(self.run_main(comments=comments, ledger=ledger, page=50), ['success'])
        # A short listing (total_count above what the pages hold) fails closed.
        fake = FakeGateApi(comments=comments, ledger=ledger)
        fake.check_pages = lambda runs, total=None: [{'total_count': len(runs) + 1, 'check_runs': runs}]
        self.assertEqual(self.run_main(fake), ['failure'])

    def test_over_cap_listing_fails_loudly(self):
        with patch.object(gate, 'api', return_value=[[{}] * 10]):
            with self.assertRaises(ValueError):
                gate.api_list('repos/x/y/issues/1/comments?per_page=100', cap=5)

    def test_api_errors_and_rate_limits_publish_failure(self):
        for marker in ['/compare/', '/comments?', '/reviews?', 'check_name=independent-review-receipt', '/activity?']:
            with self.subTest(marker=marker):
                self.assertEqual(self.run_main(comments=[self.unchecked(body())], ledger=[ledger_entry(body())],
                                               reviews=[review()], errors=[(marker, rate_limited())]),
                                 ['failure'] if marker != '/activity?' else ['success'])
        # Activity failure only switches the human path off; the App PASS above still stands.
        self.assertEqual(self.run_main(reviews=[review()], errors=[('/activity?', rate_limited())]), ['failure'])

    def test_unreadable_pr_fails_the_event_head(self):
        fake = FakeGateApi(reviews=[review()], errors=[('/pulls/110', rate_limited())])
        self.assertEqual(self.run_main(fake), ['failure'])

    def test_trust_load_error_publishes_failure(self):
        self.assertEqual(self.run_main(reviews=[review()], trust_error=policy.PolicyError('bad trust')), ['failure'])

    def test_foreign_policy_check_at_head_fails(self):
        mine = {'id': 900, 'external_id': f'merge-review:110:{HEAD}:555'}
        good_run = {'path': gate.WORKFLOW_PATH, 'event': 'pull_request_target', 'head_branch': 'agent/claude/x',
                    'repository': {'full_name': REPO}}
        self.assertEqual(self.run_main(reviews=[review()], policy_runs=[mine],
                                       workflow_runs={'555': good_run}), ['success'])
        for run, workflow in [({'id': 901, 'external_id': 'forged'}, None),
                              (dict(mine, id=902), dict(good_run, event='pull_request')),
                              (dict(mine, id=903), dict(good_run, path='.github/workflows/evil.yml')),
                              (dict(mine, id=904), dict(good_run, event='workflow_dispatch'))]:
            with self.subTest(run=run['id']):
                self.assertEqual(self.run_main(reviews=[review()], policy_runs=[run],
                                               workflow_runs={'555': workflow} if workflow else {}), ['failure'])

    def test_comment_and_dispatch_events(self):
        self.assertEqual(self.run_main(reviews=[review()], event={'issue': {'number': 110, 'pull_request': {'url': 'u'}}}),
                         ['success'])
        self.assertEqual(self.run_main(event={'issue': {'number': 3}}), [])
        self.assertEqual(self.run_main(event={'workflow_run': {'pull_requests': [{'number': 110}]}}), [])


class SweepAndIdentityTests(unittest.TestCase):
    def test_sweep_covers_all_open_prs_least_recently_evaluated_first(self):
        open_prs = [{'number': n, 'head': {'sha': f'{n:040x}'}} for n in range(1, 131)]
        evaluated = {f'{n:040x}': f'2026-10-14T{n % 24:02d}:00:00Z' for n in range(2, 131)}

        def api(endpoint, payload=None, paginate=False):
            if '/pulls?' in endpoint:
                self.assertTrue(paginate)
                return [open_prs[:100], open_prs[100:]]
            sha = endpoint.split('/commits/')[1].split('/')[0]
            stamp = evaluated.get(sha)
            return {'check_runs': [{'completed_at': stamp}] if stamp else []}
        with patch.object(gate, 'api', side_effect=api):
            chosen = gate.sweep_numbers(REPO)
        self.assertEqual(len(chosen), gate.MAX_SWEEP_PRS)
        self.assertEqual(chosen[0], 1)  # never evaluated, and oldest number
        # PR 24 (evaluated at 00:00) beats 25 newer PRs to a slot.
        self.assertIn(24, chosen)

    def test_activity_uses_head_repository_and_empty_is_incomplete(self):
        calls = []

        def api(endpoint, payload=None, paginate=False):
            calls.append(endpoint)
            return [[]]
        pr = {'head': {'ref': 'agent/claude/x', 'repo': {'full_name': 'contrib/fork'}}}
        with patch.object(gate, 'api', side_effect=api):
            self.assertEqual(gate.push_identities(REPO, pr, TRUST), ([], False))
        self.assertTrue(calls[0].startswith('repos/contrib/fork/activity?'))


if __name__ == '__main__':
    unittest.main()
