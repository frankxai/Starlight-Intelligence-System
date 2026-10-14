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


def receipt(**changes):
    report = 'PASS: Independently inspected supplied security source; no blocking defect found.'
    body = {'repository': 'frankxai/starlight-agent-config', 'pr': 110,
            'headSha': HEAD, 'maker': 'codex', 'provider': 'antigravity', 'verdict': 'PASS',
            'blockingFindings': [], 'reviewedFiles': ['core/lib/format.js'],
            'review': report, 'reviewSha256': hashlib.sha256(report.encode()).hexdigest(),
            'packetSha256': 'b' * 64, 'resolution': 'No blocking findings; static review only.'}
    body.update(changes)
    return {'id': 123, 'user': {'login': 'frankxai'}, 'author_association': 'OWNER',
            'performed_via_github_app': {'slug': 'cursor'},
            'created_at': '2026-10-13T07:00:00Z', 'updated_at': '2026-10-13T07:00:00Z',
            'edit_history_checked': True, 'last_edited_at': None, 'content_edit_count': 0,
            'body': gate.MARKER + json.dumps(body)}


class MergeReviewTests(unittest.TestCase):
    def evaluate(self, comments, files=FILES, auto_merge=None):
        return gate.evaluate('frankxai/starlight-agent-config', 110, HEAD, files, comments, auto_merge)[0]

    def test_sensitive_requires_real_receipt(self):
        self.assertFalse(self.evaluate([]))
        self.assertTrue(self.evaluate([receipt()]))
        self.assertTrue(self.evaluate([receipt(maker='jules', provider='codex')]))

    def test_only_frankxai_attests(self):
        for user_login in ['frankx-eth', 'jules', 'google-labs-jules[bot]']:
            comment = receipt()
            comment['user']['login'] = user_login
            self.assertFalse(self.evaluate([comment]))

    def test_self_review_never_counts(self):
        for seat in ['codex', 'claude-code', 'antigravity', 'cto']:
            with self.subTest(seat=seat):
                self.assertFalse(self.evaluate([receipt(maker=seat, provider=seat)]))

    def test_only_separate_seats_review(self):
        for provider in ['codex', 'claude-code', 'cto']:
            self.assertTrue(self.evaluate([receipt(maker='antigravity', provider=provider)]))
        for provider in ['jules', 'grok', 'gemini', 'claude', 'frankx-eth']:
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

    def test_bot_makers_are_attributable_but_never_review(self):
        path = 'site/pnpm-lock.yaml'
        files = [{'filename': path, 'status': 'modified'}]
        for bot in ['dependabot', 'github-actions']:
            with self.subTest(bot=bot):
                self.assertTrue(self.evaluate([receipt(reviewedFiles=[path], maker=bot, provider='cto')], files))
                self.assertFalse(self.evaluate([receipt(reviewedFiles=[path], maker=bot, provider='codex')], files))
                self.assertFalse(self.evaluate([receipt(maker=bot, provider=bot)]))
                self.assertFalse(self.evaluate([receipt(provider=bot)]))
        self.assertFalse(self.evaluate([receipt(maker='dependabot[bot]', provider='cto')]))

    def test_grok_seats_are_makers_but_never_review(self):
        self.assertTrue(self.evaluate([receipt(maker='grok', provider='codex')]))
        self.assertFalse(self.evaluate([receipt(maker='grok', provider='grok')]))
        self.assertFalse(self.evaluate([receipt(provider='grok')]))
        path = 'tools/merge-review/merge_review_gate.py'
        files = [{'filename': path, 'status': 'modified'}]
        self.assertTrue(self.evaluate([receipt(reviewedFiles=[path], maker='grok', provider='cto')], files))
        self.assertFalse(self.evaluate([receipt(reviewedFiles=[path], maker='grok', provider='codex')], files))

    def test_cto_authored_high_risk_needs_another_admitted_seat(self):
        path = 'tools/merge-review/merge_review_gate.py'
        files = [{'filename': path, 'status': 'modified'}]
        for provider in ['codex', 'claude-code', 'antigravity']:
            with self.subTest(provider=provider):
                self.assertTrue(self.evaluate([receipt(reviewedFiles=[path], maker='cto', provider=provider)], files))
        self.assertFalse(self.evaluate([receipt(reviewedFiles=[path], maker='cto', provider='cto')], files))

    def test_finance_paths_need_cto_pass(self):
        for path in ['src/finance/pnl.ts', 'src/finance/entity-registry.ts',
                     'src/finance/revenue-sources/_shared.ts', 'lib/revenue/report.ts']:
            with self.subTest(path=path):
                files = [{'filename': path, 'status': 'modified'}]
                self.assertFalse(self.evaluate([receipt(reviewedFiles=[path])], files))
                self.assertTrue(self.evaluate([receipt(reviewedFiles=[path], provider='cto')], files))

    def test_non_node_manifests_need_cto_pass(self):
        for path in ['crates/starlight-invariants/Cargo.toml', 'crates/starlight-invariants/Cargo.lock',
                     'templates/local-voice-companion-starter/pyproject.toml', 'uv.lock', 'poetry.lock',
                     'requirements.txt', 'requirements-dev.txt', 'go.mod', 'Gemfile.lock']:
            with self.subTest(path=path):
                self.assertTrue(gate.high_risk(path))
                files = [{'filename': path, 'status': 'modified'}]
                self.assertFalse(self.evaluate([receipt(reviewedFiles=[path])], files))
                self.assertTrue(self.evaluate([receipt(reviewedFiles=[path], provider='cto')], files))

    def test_requirements_directory_needs_cto_pass(self):
        for path in ['requirements/base.txt', 'requirements/dev.in', 'services/api/requirements/prod.txt']:
            with self.subTest(path=path):
                self.assertTrue(gate.high_risk(path))
                files = [{'filename': path, 'status': 'modified'}]
                self.assertFalse(self.evaluate([receipt(reviewedFiles=[path])], files))
                self.assertTrue(self.evaluate([receipt(reviewedFiles=[path], provider='cto')], files))
        self.assertFalse(gate.high_risk('docs/requirements/overview.md'))

    def test_cost_control_paths_need_cto_pass(self):
        for path in ['src/infra/cost-snapshot.ts', 'src/infra/cost-sources/openai.ts',
                     'src/infra/cost-sources/_shared.ts', 'cost-plane-config.template.json']:
            with self.subTest(path=path):
                self.assertTrue(gate.high_risk(path))
                files = [{'filename': path, 'status': 'modified'}]
                self.assertFalse(self.evaluate([receipt(reviewedFiles=[path])], files))
                self.assertTrue(self.evaluate([receipt(reviewedFiles=[path], provider='cto')], files))

    def test_ledger_is_high_risk_only_on_financial_paths(self):
        for path in ['data/credit-ledger.jsonl', 'src/infra/cost-ledger.ts', 'finance/ledger.csv',
                     'src/budget/ledger.ts', 'tools/spend-ledger.json']:
            with self.subTest(path=path):
                self.assertTrue(gate.high_risk(path))
        for path in ['tools/queen/ledger.jsonl', 'docs/research/music-intelligence/source-ledger-2026-09.md',
                     'src/ledgers.ts', 'test/v01-ledgers.test.ts',
                     'docs/graph-engineering/loops/si-admit-verify-ship/ledger.md']:
            with self.subTest(path=path):
                self.assertFalse(gate.high_risk(path))

    def test_rename_out_of_high_risk_path_keeps_protection(self):
        path = 'src/neutral/thing.ts'
        files = [{'filename': path, 'previous_filename': 'src/payments/checkout.ts', 'status': 'renamed'}]
        self.assertFalse(self.evaluate([receipt(reviewedFiles=[path])], files))
        self.assertTrue(self.evaluate([receipt(reviewedFiles=[path], provider='cto')], files))
        self.assertFalse(self.evaluate([receipt(reviewedFiles=[path], provider='cto')], files,
                                       auto_merge={'merge_method': 'merge'}))
        copied = [{'filename': 'docs/notes/x.md', 'previous_filename': 'src/finance/pnl.ts', 'status': 'copied'}]
        self.assertFalse(self.evaluate([], copied))

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

    def test_untrusted_author_or_association_deny(self):
        for actor, association in [('attacker', 'OWNER'), ('frankxai', 'NONE')]:
            comment = receipt()
            comment['user']['login'] = actor
            comment['author_association'] = association
            self.assertFalse(self.evaluate([comment]))

    def test_jules_maker_with_frankx_eth_attestor_denies(self):
        comment = receipt(maker='jules', pr='110')
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



class PostingAppTests(unittest.TestCase):
    def evaluate(self, comments):
        return gate.evaluate('frankxai/starlight-agent-config', 110, HEAD, FILES, comments)[0]

    def test_allowlisted_apps_attest(self):
        for slug in ['cursor', 'chatgpt-codex-connector']:
            comment = receipt()
            comment['performed_via_github_app'] = {'slug': slug}
            with self.subTest(slug=slug):
                self.assertTrue(self.evaluate([comment]))

    def test_raw_token_receipt_is_rejected(self):
        for app in [None, {}, {'slug': None}, 'cursor']:
            comment = receipt()
            comment['performed_via_github_app'] = app
            with self.subTest(app=app):
                self.assertFalse(self.evaluate([comment]))
        comment = receipt()
        del comment['performed_via_github_app']
        self.assertFalse(self.evaluate([comment]))

    def test_other_apps_are_rejected(self):
        for slug in ['claude', 'google-labs-jules', 'github-actions', 'dependabot', 'cursor-evil']:
            comment = receipt()
            comment['performed_via_github_app'] = {'slug': slug}
            with self.subTest(slug=slug):
                self.assertFalse(self.evaluate([comment]))

    def test_raw_token_receipt_cannot_revoke_or_shadow(self):
        forged = receipt(verdict='FAIL')
        forged['id'] = 124
        forged['performed_via_github_app'] = None
        self.assertTrue(self.evaluate([receipt(), forged]))

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
        comment = receipt()
        comment['last_edited_at'] = '2026-10-13T07:00:00Z'
        self.assertFalse(self.evaluate([comment]))
        comment = receipt()
        comment['content_edit_count'] = 1
        self.assertFalse(self.evaluate([comment]))

    def test_unchecked_edit_history_fails_closed(self):
        for key in ['edit_history_checked', 'content_edit_count']:
            comment = receipt()
            del comment[key]
            with self.subTest(missing=key):
                self.assertFalse(self.evaluate([comment]))

    def test_edit_history_lookups_only_for_current_head_candidates(self):
        calls = []
        def lookup(node_id):
            calls.append(node_id)
            return {'lastEditedAt': None, 'userContentEdits': {'totalCount': 0}}
        noise = []
        for i in range(50):
            c = receipt()
            c['node_id'] = f'noise{i}'
            c['user'] = {'login': 'someone-else'}
            noise.append(c)
        stale = receipt(headSha='c' * 40)
        stale['node_id'] = 'stale'
        rawtoken = receipt()
        rawtoken['node_id'] = 'raw'
        rawtoken['performed_via_github_app'] = None
        good = receipt()
        good['node_id'] = 'good'
        for key in ['edit_history_checked', 'last_edited_at', 'content_edit_count']:
            good.pop(key)
        comments = [good, stale, rawtoken] + noise
        gate.annotate_edit_history(comments, HEAD, lookup)
        self.assertEqual(calls, ['good'])
        self.assertTrue(self.evaluate(comments))

    def test_edit_history_lookups_are_capped(self):
        calls = []
        def lookup(node_id):
            calls.append(node_id)
            return {'lastEditedAt': '2026-10-13T07:00:00Z', 'userContentEdits': {'totalCount': 2}}
        comments = []
        for i in range(20):
            c = receipt()
            c['node_id'] = f'r{i}'
            for key in ['edit_history_checked', 'last_edited_at', 'content_edit_count']:
                c.pop(key)
            comments.append(c)
        gate.annotate_edit_history(comments, HEAD, lookup)
        self.assertEqual(len(calls), gate.MAX_EDIT_LOOKUPS)
        self.assertFalse(self.evaluate(comments))

if __name__ == '__main__':
    unittest.main()
