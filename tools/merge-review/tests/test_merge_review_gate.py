import hashlib
import importlib.util
from pathlib import Path
import json
import unittest
from contextlib import redirect_stdout
from io import StringIO
from unittest.mock import mock_open, patch

spec = importlib.util.spec_from_file_location('gate', Path(__file__).parents[1] / 'merge_review_gate.py')
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)
HEAD = 'a' * 40
FILES = [{'filename': 'core/hooks/security.js', 'status': 'modified'}]


def receipt(**changes):
    report = 'PASS: Independently inspected supplied security source; no blocking defect found.'
    body = {'repository': 'frankxai/starlight-agent-config', 'pr': 110,
            'headSha': HEAD, 'maker': 'codex', 'provider': 'antigravity', 'verdict': 'PASS',
            'blockingFindings': [], 'reviewedFiles': ['core/hooks/security.js'],
            'review': report, 'reviewSha256': hashlib.sha256(report.encode()).hexdigest(),
            'packetSha256': 'b' * 64, 'resolution': 'No blocking findings; static review only.'}
    body.update(changes)
    return {'id': 123, 'user': {'login': 'frankxai'}, 'author_association': 'OWNER',
            'body': gate.MARKER + json.dumps(body)}


class MergeReviewTests(unittest.TestCase):
    def evaluate(self, comments, files=FILES):
        return gate.evaluate('frankxai/starlight-agent-config', 110, HEAD, files, comments)[0]

    def test_sensitive_requires_real_receipt(self):
        self.assertFalse(self.evaluate([]))
        self.assertTrue(self.evaluate([receipt()]))

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
                       {'provider': 'codex'}, {'verdict': 'FAIL'}, {'pr': 111},
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

    def test_malformed_comment_and_empty_listing_deny(self):
        comment = receipt()
        comment['body'] = gate.MARKER + '{bad json'
        self.assertFalse(self.evaluate([comment]))
        self.assertFalse(self.evaluate([receipt()], []))

    def test_newer_failure_revokes_previous_passing_receipt(self):
        self.assertFalse(self.evaluate([receipt(), receipt(verdict='FAIL')]))
        self.assertFalse(self.evaluate([receipt(), receipt(blockingFindings=['unfixed'])]))


class NativeCheckTests(unittest.TestCase):
    repository = 'frankxai/Starlight-Intelligence-System'

    def candidate(self, **changes):
        value = {'id': 41, 'head_sha': HEAD, 'name': gate.CHECK_NAME,
                 'app': {'id': 15368},
                 'details_url': f'https://github.com/{self.repository}/actions/runs/31/job/41'}
        value.update(changes)
        return value

    def lookup(self, checks, job_changes=None, run_changes=None, total=None):
        job = {'id': 41, 'head_sha': HEAD, 'run_id': 31, 'name': gate.CHECK_NAME}
        run = {'id': 31, 'head_sha': HEAD, 'event': 'pull_request',
               'path': '.github/workflows/merge-review-pr.yml'}
        job.update(job_changes or {})
        run.update(run_changes or {})
        def api(path):
            if '/check-runs?' in path:
                return {'total_count': len(checks) if total is None else total, 'check_runs': checks}
            if path.endswith('/actions/jobs/41'): return job
            if path.endswith('/actions/runs/31'): return run
            self.fail('Unexpected API path: ' + path)
        with patch.object(gate, 'api', side_effect=api):
            return gate.native_review_check(self.repository, HEAD)

    def test_selects_actual_eligible_actions_job(self):
        self.assertEqual(self.lookup([self.candidate()])['id'], 41)

    def test_api_created_lookalike_cannot_replace_native_job(self):
        self.assertIsNone(self.lookup([self.candidate(id=99)]))
        self.assertIsNone(self.lookup([self.candidate(details_url='https://github.com/other/repo/actions/runs/31/job/41')]))
        self.assertIsNone(self.lookup([self.candidate(details_url='https://github.com/owner/repo/runs/99')]))

    def test_wrong_app_or_source_is_rejected(self):
        self.assertIsNone(self.lookup([self.candidate(app={'id': 999})]))
        self.assertIsNone(self.lookup([self.candidate(head_sha='c' * 40)]))
        self.assertIsNone(self.lookup([self.candidate()], job_changes={'head_sha': 'c' * 40}))
        self.assertIsNone(self.lookup([self.candidate()], run_changes={'head_sha': 'c' * 40}))

    def test_wrong_event_workflow_or_job_is_rejected(self):
        self.assertIsNone(self.lookup([self.candidate()], run_changes={'event': 'issue_comment'}))
        self.assertIsNone(self.lookup([self.candidate()], run_changes={'path': '.github/workflows/other.yml'}))
        self.assertIsNone(self.lookup([self.candidate()], job_changes={'name': 'harness'}))
        self.assertIsNone(self.lookup([self.candidate()], job_changes={'run_id': 32}))

    def test_incomplete_native_listing_fails_closed(self):
        with self.assertRaises(ValueError): self.lookup([self.candidate()], total=101)

    def test_native_refresh_preserves_check_identity_and_denies_failures(self):
        for scenario in ['accepted', 'revoked', 'fetch-error', 'head-changed']:
            with self.subTest(scenario=scenario):
                calls = []
                pr_reads = 0
                def api(endpoint, payload=None, paginate=False):
                    nonlocal pr_reads
                    self.assertIsNone(payload, 'Must not create a competing check')
                    if endpoint.endswith('/pulls/110'):
                        pr_reads += 1
                        head = 'c' * 40 if scenario == 'head-changed' and pr_reads > 1 else HEAD
                        return {'state': 'open', 'head': {'sha': head}, 'base': {'sha': 'b' * 40}, 'changed_files': 1}
                    if '/files?' in endpoint:
                        if scenario == 'fetch-error': raise RuntimeError('Synthetic API failure')
                        return FILES
                    if '/comments?' in endpoint:
                        value = receipt(repository=self.repository)
                        return [value, receipt(repository=self.repository, verdict='FAIL')] if scenario == 'revoked' else [value]
                    self.fail('Unexpected API: ' + endpoint)
                def run(args, **kwargs):
                    self.assertIn(f'repos/{self.repository}/check-runs/41', args)
                    self.assertEqual(args[args.index('--method') + 1], 'PATCH')
                    calls.append(json.loads(kwargs['input']))
                output = StringIO()
                with patch.dict(gate.os.environ, {'GITHUB_REPOSITORY': self.repository, 'GITHUB_EVENT_PATH': 'event.json'}, clear=True), \
                     patch('builtins.open', mock_open(read_data=json.dumps({'issue': {'number': 110, 'pull_request': {'url': 'https://api.github.com/repos/frankxai/Starlight-Intelligence-System/pulls/110'}}}))), \
                     patch.object(gate, 'native_review_check', return_value={'id': 41}), \
                     patch.object(gate, 'api', side_effect=api), \
                     patch.object(gate.subprocess, 'run', side_effect=run), redirect_stdout(output):
                    gate.main()
                result = json.loads(output.getvalue())
                accepted = scenario == 'accepted'
                self.assertEqual(result['passed'], accepted)
                self.assertTrue(result['nativeCheck'])
                self.assertEqual(calls[0], {'status': 'in_progress'})
                self.assertEqual(calls[-1]['conclusion'], 'success' if accepted else 'failure')


if __name__ == '__main__':
    unittest.main()
