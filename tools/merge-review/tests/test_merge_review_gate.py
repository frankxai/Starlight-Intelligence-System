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



class TrustedStatusTests(unittest.TestCase):
    repository = 'frankxai/Starlight-Intelligence-System'

    def exercise(self, scenario, event_name='issue_comment'):
        statuses, diagnostics, pr_reads = [], [], 0
        def api(endpoint, payload=None, paginate=False):
            nonlocal pr_reads
            if '/statuses/' in endpoint:
                self.assertEqual(endpoint, f'repos/{self.repository}/statuses/{HEAD}')
                self.assertEqual(payload['context'], gate.CHECK_NAME)
                statuses.append(payload['state'])
                return {'state': payload['state']}
            if endpoint.endswith('/check-runs'):
                self.assertEqual(payload['head_sha'], HEAD)
                return {'id': 41}
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
            diagnostics.append(json.loads(kwargs['input']))
        output = StringIO()
        with patch.dict(gate.os.environ, {'GITHUB_REPOSITORY': self.repository,
                         'GITHUB_EVENT_PATH': 'event.json', 'GITHUB_EVENT_NAME': event_name}, clear=True), \
             patch('builtins.open', mock_open(read_data=json.dumps({'issue': {'number': 110,
                   'pull_request': {'url': 'https://api.github.com/pulls/110'}}}))), \
             patch.object(gate, 'api', side_effect=api), \
             patch.object(gate.subprocess, 'run', side_effect=run), redirect_stdout(output):
            gate.main()
        result = json.loads(output.getvalue())
        accepted = scenario == 'accepted'
        self.assertEqual(result['passed'], accepted)
        self.assertEqual(diagnostics[-1]['conclusion'], 'success' if accepted else 'failure')
        return statuses, result

    def test_trusted_controller_denies_failures_with_separate_status(self):
        for event_name in ['pull_request_target', 'issue_comment', 'workflow_dispatch']:
            for scenario in ['accepted', 'revoked', 'fetch-error', 'head-changed']:
                with self.subTest(event_name=event_name, scenario=scenario):
                    statuses, result = self.exercise(scenario, event_name)
                    self.assertTrue(result['trustedStatus'])
                    self.assertEqual(statuses, ['pending', 'success' if scenario == 'accepted' else 'failure'])

    def test_pr_job_does_not_publish_authoritative_status(self):
        for scenario in ['accepted', 'revoked']:
            with self.subTest(scenario=scenario):
                statuses, result = self.exercise(scenario, 'pull_request')
                self.assertFalse(result['trustedStatus'])
                self.assertEqual(statuses, [])

if __name__ == '__main__':
    unittest.main()
