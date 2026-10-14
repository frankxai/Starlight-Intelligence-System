import copy
import importlib.util
import json
import os
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
        vendors = policy.maker_vendors('agent/claude/x', [{
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
        commit = {'author': {'login': 'google-labs-jules[bot]'}, 'commit': {'message': 'x', 'author': {}, 'committer': {}}}
        self.assertEqual(policy.maker_vendors('agent/codex/x', [commit], TRUST), ['google', 'openai'])


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


class MainWiringTests(unittest.TestCase):
    def transport(self, comments, ledger, reviews=(), commits=(CLAUDE_COMMIT,)):
        pr = {'number': 110, 'state': 'open', 'head': {'sha': HEAD, 'ref': 'agent/claude/x'},
              'base': {'sha': 'c' * 40}, 'changed_files': len(FILES), 'user': dict(OWNER), 'auto_merge': None}

        def api(endpoint, payload=None, paginate=False):
            if endpoint.endswith('/check-runs'):
                return {'id': 456}
            if '/files?' in endpoint:
                return [dict(item) for item in FILES]
            if '/comments?' in endpoint:
                return copy.deepcopy(comments)
            if '/reviews?' in endpoint:
                return list(reviews)
            if '/compare/' in endpoint:
                return {'files': [dict(f) for f in FILES], 'merge_base_commit': {'sha': 'c' * 40},
                        'commits': list(commits), 'total_commits': len(commits)}
            if '/check-runs?' in endpoint:
                return {'total_count': len(ledger), 'check_runs': copy.deepcopy(ledger)}
            if '/activity?' in endpoint:
                return [{'actor': dict(OWNER)}]
            if '/pulls?' in endpoint:
                return [{'number': 110}]
            return copy.deepcopy(pr)
        return api

    def run_main(self, comments=(), ledger=(), reviews=(), event=None, trust=TRUST, **kw):
        event = event or {'pull_request': {'number': 110}}
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / 'event.json'
            path.write_text(json.dumps(event), encoding='utf-8')
            env = {'GITHUB_REPOSITORY': REPO, 'GITHUB_EVENT_PATH': str(path)}
            with patch.dict(os.environ, env, clear=True), \
                    patch.object(gate, 'api', side_effect=self.transport(comments, ledger, reviews, **kw)), \
                    patch.object(policy, 'load_trust', return_value=copy.deepcopy(trust)), \
                    patch.object(gate, 'graphql_edit_history',
                                 return_value={'lastEditedAt': None, 'userContentEdits': {'totalCount': 0}}), \
                    patch.object(gate.subprocess, 'run') as publish, patch('builtins.print'):
                gate.main()
        return [json.loads(call.kwargs['input'])['conclusion'] for call in publish.call_args_list]

    def unchecked(self, receipt):
        comment = app_comment(receipt)
        comment['node_id'] = 'n1'
        for key in ['edit_history_checked', 'last_edited_at', 'content_edit_count']:
            comment.pop(key)
        return comment

    def test_main_accepts_app_ledger_and_ignores_owner_receipt(self):
        self.assertEqual(self.run_main([owner_comment(body())]), ['failure'])
        self.assertEqual(self.run_main([self.unchecked(body())], [ledger_entry(body())]), ['success'])
        self.assertEqual(self.run_main(reviews=[review()]), ['success'])

    def test_main_recomputes_manifest_and_vendors(self):
        grok_commit = copy.deepcopy(CLAUDE_COMMIT)
        grok_commit['commit']['message'] += '\nCo-authored-by: Grok <grok@x.ai>'
        receipt = body()
        self.assertEqual(self.run_main([self.unchecked(receipt)], [ledger_entry(receipt)],
                                       commits=(grok_commit,)), ['failure'])

    def test_sweep_and_relay_events_evaluate_open_prs(self):
        for event in [{'schedule': '*/30 * * * *'}, {'workflow_run': {'pull_requests': [{'number': 110}]}},
                      {'workflow_run': {'pull_requests': []}}]:
            with self.subTest(event=list(event)):
                self.assertEqual(self.run_main(reviews=[review()], event=event), ['success'])
        self.assertEqual(self.run_main(event={'issue': {'number': 3}}), [])


if __name__ == '__main__':
    unittest.main()
