import hashlib
import importlib.util
from pathlib import Path
import json
import unittest

spec = importlib.util.spec_from_file_location('gate', Path(__file__).parents[1] / 'merge_review_gate.py')
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)
HEAD = 'a' * 40
FILES = [{'filename': 'core/lib/format.js', 'status': 'modified'}]
APP = {'id': 4242, 'slug': 'starlight-checker'}
AUTHOR = 'frankxai'


def receipt(**changes):
    report = 'PASS: Independently inspected supplied security source; no blocking defect found.'
    body = {'repository': 'frankxai/starlight-agent-config', 'pr': 110,
            'headSha': HEAD, 'maker': 'codex', 'provider': 'antigravity', 'verdict': 'PASS',
            'blockingFindings': [], 'reviewedFiles': ['core/lib/format.js'],
            'review': report, 'reviewSha256': hashlib.sha256(report.encode()).hexdigest(),
            'packetSha256': 'b' * 64, 'resolution': 'No blocking findings; static review only.',
            'cost_usd': None, 'cost_source': 'unknown'}
    body.update(changes)
    return {'id': 123, 'user': {'login': 'starlight-checker[bot]', 'type': 'Bot'},
            'author_association': 'NONE', 'performed_via_github_app': dict(APP),
            'created_at': '2026-10-13T07:00:00Z', 'updated_at': '2026-10-13T07:00:00Z',
            'edit_history_checked': True, 'last_edited_at': None, 'content_edit_count': 0,
            'body': gate.MARKER + json.dumps(body)}


def owner_comment(**changes):
    """The PR #377 shape: a canned receipt posted with the owner's shared gh login."""
    comment = receipt(**changes)
    comment['user'] = {'login': 'frankxai', 'type': 'User'}
    comment['author_association'] = 'OWNER'
    comment['performed_via_github_app'] = None
    return comment


def review(login='second-human', state='APPROVED', commit=HEAD, association='COLLABORATOR',
           user_type='User', review_id=900):
    return {'id': review_id, 'user': {'login': login, 'type': user_type}, 'state': state,
            'commit_id': commit, 'author_association': association}


class MergeReviewTests(unittest.TestCase):
    def evaluate(self, comments, files=FILES, auto_merge=None, reviews=(), pushers=('frankxai',),
                 author=AUTHOR, slug='starlight-checker'):
        return gate.evaluate('frankxai/starlight-agent-config', 110, HEAD, files, comments, auto_merge,
                             reviews=reviews, pr_author=author, pushers=pushers, checker_slug=slug)[0]

    def test_sensitive_requires_real_receipt(self):
        self.assertFalse(self.evaluate([]))
        self.assertTrue(self.evaluate([receipt()]))
        self.assertTrue(self.evaluate([receipt(maker='jules', provider='codex')]))

    def test_pr377_owner_login_canned_receipt_fails(self):
        # Every harness on the owner's machine shares this login; it attests nothing.
        self.assertFalse(self.evaluate([owner_comment()]))
        path = 'tools/merge-review/merge_review_gate.py'
        files = [{'filename': path, 'status': 'modified'}]
        self.assertFalse(self.evaluate([owner_comment(reviewedFiles=[path], provider='cto')], files))
        for association in ['MEMBER', 'COLLABORATOR']:
            comment = owner_comment()
            comment['author_association'] = association
            self.assertFalse(self.evaluate([comment]))

    def test_owner_login_cannot_borrow_app_attribution(self):
        # A user-to-server token of the checker App carries the human login: still denied.
        comment = owner_comment()
        comment['performed_via_github_app'] = dict(APP)
        self.assertFalse(self.evaluate([comment]))

    def test_other_apps_and_bots_deny(self):
        for app, login in [({'id': 15368, 'slug': 'github-actions'}, 'github-actions[bot]'),
                           ({'id': 1, 'slug': 'google-labs-jules'}, 'google-labs-jules[bot]'),
                           ({'id': 2, 'slug': 'starlight-checker-evil'}, 'starlight-checker-evil[bot]'),
                           (dict(APP), 'starlight-checker-evil[bot]'),
                           ({'id': 4242, 'slug': 'Starlight-Checker'}, 'starlight-checker[bot]'),
                           (None, 'starlight-checker[bot]')]:
            with self.subTest(app=app, login=login):
                comment = receipt()
                comment['performed_via_github_app'] = app
                comment['user']['login'] = login
                self.assertFalse(self.evaluate([comment]))

    def test_checker_bot_cannot_be_author_or_pusher(self):
        self.assertFalse(self.evaluate([receipt()], author='starlight-checker[bot]'))
        self.assertFalse(self.evaluate([receipt()], pushers=('starlight-checker[bot]',)))

    def test_configured_slug_is_respected(self):
        comment = receipt()
        comment['performed_via_github_app'] = {'id': 77, 'slug': 'sis-checker'}
        comment['user']['login'] = 'sis-checker[bot]'
        self.assertTrue(self.evaluate([comment], slug='sis-checker'))
        self.assertFalse(self.evaluate([comment]))
        self.assertFalse(self.evaluate([receipt()], slug=''))

    def test_cost_fields(self):
        for good in [{'cost_usd': None, 'cost_source': 'unknown'},
                     {'cost_usd': 0.0123, 'cost_source': 'estimated'},
                     {'cost_usd': 0, 'cost_source': 'billed'}]:
            with self.subTest(good=good):
                self.assertTrue(self.evaluate([receipt(**good)]))
        for bad in [{'cost_usd': 0, 'cost_source': 'unknown'},
                    {'cost_usd': None, 'cost_source': 'estimated'},
                    {'cost_usd': -1, 'cost_source': 'billed'},
                    {'cost_usd': True, 'cost_source': 'billed'},
                    {'cost_usd': 1, 'cost_source': 'guessed'},
                    {'cost_usd': '0.01', 'cost_source': 'estimated'}]:
            with self.subTest(bad=bad):
                self.assertFalse(self.evaluate([receipt(**bad)]))
        comment = receipt()
        body = json.loads(comment['body'][len(gate.MARKER):])
        del body['cost_source']
        comment['body'] = gate.MARKER + json.dumps(body)
        self.assertFalse(self.evaluate([comment]))

    def test_missing_pr_author_fails_closed(self):
        self.assertFalse(self.evaluate([receipt()], author=''))

    def test_self_review_never_counts(self):
        for seat in ['codex', 'claude-code', 'antigravity', 'cto']:
            with self.subTest(seat=seat):
                self.assertFalse(self.evaluate([receipt(maker=seat, provider=seat)]))

    def test_only_separate_seats_review(self):
        for provider in ['codex', 'claude-code', 'cto', 'grok']:
            self.assertTrue(self.evaluate([receipt(maker='antigravity', provider=provider)]))
        self.assertTrue(self.evaluate([receipt(maker='grok', provider='codex')]))
        self.assertTrue(self.evaluate([receipt(maker='codex', provider='gemini')]))
        for provider in ['jules', 'claude', 'frankx-eth']:
            with self.subTest(provider=provider):
                self.assertFalse(self.evaluate([receipt(provider=provider)]))

    def test_high_risk_paths_need_cto_pass(self):
        for path in ['src/payments/checkout.ts', 'scripts/publish.mjs', 'lib/auth/session.ts',
                     'LICENSE', '.env.example', 'tools/merge-review/merge_review_gate.py',
                     'tools/jules-conductor/config.json', '.github/workflows/ci.yml',
                     'src/marketplace/catalog.ts']:
            with self.subTest(path=path):
                files = [{'filename': path, 'status': 'modified'}]
                self.assertFalse(self.evaluate([receipt(reviewedFiles=[path])], files))
                self.assertTrue(self.evaluate([receipt(reviewedFiles=[path], provider='cto')], files))

    def test_cto_authored_high_risk_needs_another_admitted_seat(self):
        path = 'tools/merge-review/merge_review_gate.py'
        files = [{'filename': path, 'status': 'modified'}]
        for provider in ['codex', 'claude-code', 'antigravity']:
            with self.subTest(provider=provider):
                self.assertTrue(self.evaluate([receipt(reviewedFiles=[path], maker='cto', provider=provider)], files))
        self.assertFalse(self.evaluate([receipt(reviewedFiles=[path], maker='cto', provider='cto')], files))

    def test_armed_auto_merge_fails_high_risk(self):
        path = 'src/payments/checkout.ts'
        files = [{'filename': path, 'status': 'modified'}]
        good = [receipt(reviewedFiles=[path], provider='cto')]
        self.assertTrue(self.evaluate(good, files))
        self.assertFalse(self.evaluate(good, files, auto_merge={'merge_method': 'squash'}))
        # Low-risk with auto-merge armed is still allowed after a separate PASS.
        self.assertTrue(self.evaluate([receipt()], auto_merge={'merge_method': 'squash'}))

    def test_instruction_files_are_high_risk(self):
        for path in ['AGENTS.md', 'CLAUDE.md', 'skills/foo/SKILL.md', 'docs/notes/AGENTS.md']:
            with self.subTest(path=path):
                files = [{'filename': path, 'status': 'modified', 'mode': '100644'}]
                self.assertFalse(self.evaluate([receipt(reviewedFiles=[path])], files))
                self.assertTrue(self.evaluate([receipt(reviewedFiles=[path], provider='cto')], files))

    def test_high_risk_notes_lose_routine_exemption(self):
        for path in ['docs/notes/auth.md', 'docs/handovers/release.txt', 'docs/notes/payment.md']:
            with self.subTest(path=path):
                files = [{'filename': path, 'status': 'modified', 'mode': '100644'}]
                self.assertFalse(self.evaluate([], files))
                self.assertFalse(self.evaluate([receipt(reviewedFiles=[path])], files))
                self.assertTrue(self.evaluate([receipt(reviewedFiles=[path], provider='cto')], files))

    def test_dependency_manifests_are_high_risk(self):
        for path in ['package.json', 'packages/x/package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock']:
            with self.subTest(path=path):
                files = [{'filename': path, 'status': 'modified'}]
                self.assertFalse(self.evaluate([receipt(reviewedFiles=[path])], files))
                self.assertTrue(self.evaluate([receipt(reviewedFiles=[path], provider='cto')], files))

    def test_warn_is_not_a_pass(self):
        self.assertFalse(self.evaluate([receipt(verdict='WARN')]))

    def test_windows_marker_preserves_report_digest(self):
        report = ('PASS: Independently inspected the complete supplied security source.\r\n'
                  'Windows report line endings remain part of the verified report digest.')
        comment = receipt(review=report, reviewSha256=hashlib.sha256(report.encode()).hexdigest())
        comment['body'] = comment['body'].replace(gate.MARKER, gate.MARKER.replace('\n', '\r\n'), 1)
        self.assertTrue(self.evaluate([comment]))

    def test_invalid_marker_separators_deny(self):
        for separator in ['\r', ' \n', '\r\r\n', '\\n']:
            with self.subTest(separator=separator):
                comment = receipt()
                comment['body'] = comment['body'].replace(gate.MARKER, gate.MARKER.rstrip('\n') + separator, 1)
                self.assertFalse(self.evaluate([comment]))

    def test_routine_plain_text_passes_without_review(self):
        self.assertTrue(self.evaluate([], [{'filename': 'docs/notes/update.md',
                                           'status': 'modified', 'mode': '100644'}]))

    def test_routine_does_not_include_instruction_or_executable_paths(self):
        for filename, status, mode in [('docs/notes/AGENTS.md', 'modified', '100644'),
                                       ('docs/notes/SKILL.md', 'modified', '100644'),
                                       ('docs/notes/a.md', 'renamed', '100644'),
                                       ('docs/notes/a.md', 'modified', '120000'),
                                       ('docs/notes/a.md', 'modified', '100755'),
                                       ('docs/notes/../a.md', 'modified', '100644'),
                                       ('docs/notes/a.py', 'modified', '100644')]:
            with self.subTest(filename=filename, status=status, mode=mode):
                self.assertFalse(self.evaluate([], [{'filename': filename, 'status': status, 'mode': mode}]))

    def test_stale_incomplete_tampered_or_blocked_receipts_deny(self):
        for change in [{'headSha': 'c' * 40}, {'reviewedFiles': []},
                       {'blockingFindings': ['unfixed']}, {'reviewSha256': 'd' * 64},
                       {'provider': 'codex'}, {'maker': 'untrusted_maker'}, {'verdict': 'FAIL'}, {'pr': 111}, {'pr': '110'},
                       {'repository': 'attacker/repo'}, {'packetSha256': 'invalid'},
                       {'resolution': ''}, {'review': ''}]:
            with self.subTest(change=change):
                self.assertFalse(self.evaluate([receipt(**change)]))

    def test_human_approval_by_distinct_account_passes(self):
        self.assertTrue(self.evaluate([], reviews=[review()]))
        path = 'tools/merge-review/merge_review_gate.py'
        files = [{'filename': path, 'status': 'modified'}]
        self.assertTrue(self.evaluate([], files, reviews=[review()]))

    def test_human_approval_paths_that_deny(self):
        for bad in [review(login='frankxai'), review(login='FrankXAI'),
                    review(commit='c' * 40), review(state='COMMENTED'),
                    review(state='PENDING'), review(association='NONE'),
                    review(association='CONTRIBUTOR'), review(user_type='Bot'),
                    review(login='last-pusher')]:
            with self.subTest(review=bad):
                self.assertFalse(self.evaluate([], reviews=[bad], pushers=('frankxai', 'last-pusher')))

    def test_human_dismissed_or_changes_requested_revokes(self):
        self.assertFalse(self.evaluate([], reviews=[review(), review(state='DISMISSED', review_id=901)]))
        self.assertFalse(self.evaluate([receipt()], reviews=[review(state='CHANGES_REQUESTED')]))
        self.assertFalse(self.evaluate([], reviews=[review(), review(login='other-human',
                                                                     state='CHANGES_REQUESTED')]))
        # A later approval by the same reviewer clears that reviewer's request.
        self.assertTrue(self.evaluate([], reviews=[review(state='CHANGES_REQUESTED'),
                                                   review(review_id=902)]))

    def test_checker_fail_is_not_overridden_by_human_approval(self):
        self.assertFalse(self.evaluate([receipt(verdict='FAIL')], reviews=[review()]))

    def test_owner_comments_are_ignored_not_revoking(self):
        # Owner-login noise neither passes nor revokes a genuine App receipt.
        self.assertTrue(self.evaluate([receipt(), owner_comment(verdict='FAIL')]))

    def test_jules_maker_with_frankx_eth_attestor_denies(self):
        comment = owner_comment(maker='jules', pr='110')
        comment['user']['login'] = 'frankx-eth'
        self.assertFalse(self.evaluate([comment]))

    def test_malformed_comment_and_empty_listing_deny(self):
        comment = receipt()
        comment['body'] = gate.MARKER + '{bad json'
        self.assertFalse(self.evaluate([comment]))
        self.assertFalse(self.evaluate([receipt()], []))

    def test_newer_failure_revokes_previous_passing_receipt(self):
        self.assertFalse(self.evaluate([receipt(), receipt(verdict='FAIL')]))
        self.assertFalse(self.evaluate([receipt(), receipt(blockingFindings=['unfixed'])]))


class MainWiringTests(unittest.TestCase):
    def run_main(self, comments, reviews=(), slug=None):
        import os
        import tempfile
        from unittest.mock import patch
        pr = {'state': 'open', 'head': {'sha': HEAD}, 'base': {'sha': 'c' * 40},
              'changed_files': 1, 'user': {'login': 'frankxai'}, 'auto_merge': None}

        def transport(endpoint, payload=None, paginate=False):
            if endpoint.endswith('/check-runs'):
                return {'id': 456}
            if '/files?' in endpoint:
                return [dict(item) for item in FILES]
            if '/comments?' in endpoint:
                return comments
            if '/reviews?' in endpoint:
                return list(reviews)
            if '/commits/' in endpoint:
                return {'author': {'login': 'frankxai'}, 'committer': {'login': 'web-flow'}}
            return json.loads(json.dumps(pr))

        with tempfile.TemporaryDirectory() as temp:
            event = Path(temp) / 'event.json'
            event.write_text(json.dumps({'pull_request': {'number': 110}}), encoding='utf-8')
            env = {'GITHUB_REPOSITORY': 'frankxai/starlight-agent-config', 'GITHUB_EVENT_PATH': str(event)}
            if slug is not None:
                env['MERGE_REVIEW_CHECKER_APP_SLUG'] = slug
            with patch.dict(os.environ, env, clear=True), \
                    patch.object(gate, 'api', side_effect=transport), \
                    patch.object(gate.subprocess, 'run') as publish, patch('builtins.print'):
                gate.main()
        return json.loads(publish.call_args.kwargs['input'])['conclusion']

    def test_main_ignores_owner_receipt_and_accepts_app_receipt(self):
        self.assertEqual(self.run_main([owner_comment()]), 'failure')
        self.assertEqual(self.run_main([receipt()]), 'success')
        self.assertEqual(self.run_main([], reviews=[review()]), 'success')

    def test_main_rejects_invalid_configured_slug(self):
        with self.assertRaises(ValueError):
            self.run_main([receipt()], slug='Bad Slug')


class EditHistoryTests(unittest.TestCase):
    """Ported from #403: an edited receipt never counts, and unknown history fails closed."""

    def evaluate(self, comments):
        return gate.evaluate('frankxai/starlight-agent-config', 110, HEAD, FILES, comments,
                             pr_author=AUTHOR, pushers=('frankxai',))[0]

    def test_403_user_to_server_apps_no_longer_attest(self):
        # Cursor and the Codex connector post as the owner's login: the shared identity.
        for slug in ['cursor', 'chatgpt-codex-connector']:
            comment = owner_comment()
            comment['performed_via_github_app'] = {'slug': slug}
            with self.subTest(slug=slug):
                self.assertFalse(self.evaluate([comment]))

    def test_edited_receipt_is_rejected(self):
        comment = receipt()
        comment['updated_at'] = '2026-10-13T07:05:00Z'
        self.assertFalse(self.evaluate([comment]))
        for key in ['created_at', 'updated_at']:
            comment = receipt()
            del comment[key]
            with self.subTest(missing=key):
                self.assertFalse(self.evaluate([comment]))

    def test_same_second_edit_is_rejected_via_edit_history(self):
        for key, value in [('last_edited_at', '2026-10-13T07:00:00Z'), ('content_edit_count', 1)]:
            comment = receipt()
            comment[key] = value
            with self.subTest(key=key):
                self.assertFalse(self.evaluate([comment]))

    def test_unchecked_edit_history_fails_closed(self):
        for key in ['edit_history_checked', 'content_edit_count']:
            comment = receipt()
            del comment[key]
            with self.subTest(missing=key):
                self.assertFalse(self.evaluate([comment]))

    def unchecked(self, node_id, **changes):
        comment = receipt(**changes)
        comment['node_id'] = node_id
        for key in ['edit_history_checked', 'last_edited_at', 'content_edit_count']:
            comment.pop(key)
        return comment

    def test_edit_history_lookups_only_for_current_head_checker_receipts(self):
        calls = []

        def lookup(node_id):
            calls.append(node_id)
            return {'lastEditedAt': None, 'userContentEdits': {'totalCount': 0}}
        owner = owner_comment()
        owner['node_id'] = 'owner'
        comments = [self.unchecked('good'), self.unchecked('stale', headSha='c' * 40), owner]
        gate.annotate_edit_history(comments, HEAD, 'starlight-checker', {'frankxai'}, lookup)
        self.assertEqual(calls, ['good'])
        self.assertTrue(self.evaluate(comments))

    def test_edit_history_lookups_are_capped(self):
        calls = []

        def lookup(node_id):
            calls.append(node_id)
            return {'lastEditedAt': '2026-10-13T07:00:00Z', 'userContentEdits': {'totalCount': 2}}
        comments = [self.unchecked(f'r{i}') for i in range(20)]
        gate.annotate_edit_history(comments, HEAD, 'starlight-checker', {'frankxai'}, lookup)
        self.assertEqual(len(calls), gate.MAX_EDIT_LOOKUPS)
        self.assertFalse(self.evaluate(comments))


if __name__ == '__main__':
    unittest.main()
