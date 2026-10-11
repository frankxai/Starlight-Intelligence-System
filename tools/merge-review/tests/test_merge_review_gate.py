import hashlib
import importlib.util
from pathlib import Path
import json
import unittest
from unittest.mock import patch
import contextlib
import io
import os
import subprocess
import tempfile

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


class WriterBoundaryTests(unittest.TestCase):
    def run_gate(self, *, writer='98765', returned_writer=98765, comments=None,
                 changed_head=False, changed_count=1, read_error=False, patch_error=False):
        with tempfile.TemporaryDirectory() as temp:
            event = Path(temp) / 'event.json'
            event.write_text(json.dumps({'pull_request': {'number': 110}}), encoding='utf-8')
            environment = {'GITHUB_REPOSITORY': 'frankxai/starlight-agent-config',
                           'GITHUB_EVENT_PATH': str(event), 'MERGE_REVIEW_APP_ID': writer}
            pr = {'state': 'open', 'head': {'sha': HEAD}, 'changed_files': changed_count,
                  'base': {'sha': 'c' * 40}}
            def transport(endpoint, payload=None, paginate=False):
                if endpoint.endswith('/check-runs'):
                    return {'id': 456, 'app': {'id': returned_writer}}
                if '/files?' in endpoint:
                    if read_error:
                        raise RuntimeError('simulated read failure')
                    return [dict(x) for x in FILES]
                if '/comments?' in endpoint:
                    return [receipt()] if comments is None else comments
                result = json.loads(json.dumps(pr))
                if changed_head and request.call_count > 1:
                    result['head']['sha'] = 'd' * 40
                return result
            side_effect = subprocess.CalledProcessError(1, ['gh', 'api']) if patch_error else None
            with patch.dict(os.environ, environment, clear=True), \
                    patch.object(gate, 'api', side_effect=transport) as request, \
                    patch.object(gate.subprocess, 'run', side_effect=side_effect) as publish, \
                    contextlib.redirect_stdout(io.StringIO()):
                try:
                    result = gate.main()
                except (ValueError, subprocess.CalledProcessError) as error:
                    return error, request.call_args_list, publish.call_args_list
                return result, request.call_args_list, publish.call_args_list

    def test_missing_invalid_or_shared_writer_never_calls_api(self):
        for writer in ['', '15368', '0', '-1', '1.0', 'not-an-id', '9' * 13]:
            with self.subTest(writer=writer):
                result, requests, writes = self.run_gate(writer=writer)
                self.assertIsInstance(result, ValueError)
                self.assertEqual(requests, [])
                self.assertEqual(writes, [])

    def test_matching_writer_and_valid_receipt_logic_pass(self):
        result, requests, writes = self.run_gate()
        self.assertEqual(result, 0)
        self.assertEqual(len(writes), 1)
        self.assertEqual(json.loads(writes[0].kwargs['input'])['conclusion'], 'success')
        self.assertEqual(requests[1].args[1]['head_sha'], HEAD)

    def test_wrong_writer_has_only_failing_finalization(self):
        result, requests, writes = self.run_gate(returned_writer=15368)
        self.assertEqual(result, 1)
        self.assertEqual(len(requests), 2)
        final = json.loads(writes[0].kwargs['input'])
        self.assertEqual(final['conclusion'], 'failure')
        self.assertIn('failed closed', final['output']['summary'])

    def test_missing_or_revoked_receipt_fails_workflow(self):
        for comments in [[], [receipt(), receipt(verdict='FAIL')]]:
            with self.subTest(comments=comments):
                result, _, writes = self.run_gate(comments=comments)
                self.assertEqual(result, 1)
                self.assertEqual(json.loads(writes[0].kwargs['input'])['conclusion'], 'failure')

    def test_head_race_partial_listing_or_read_failure_never_pass(self):
        for options in [{'changed_head': True}, {'changed_count': 2}, {'read_error': True}]:
            with self.subTest(options=options):
                result, _, writes = self.run_gate(**options)
                self.assertEqual(result, 1)
                self.assertEqual(json.loads(writes[0].kwargs['input'])['conclusion'], 'failure')

    def test_api_write_failure_never_reports_success(self):
        result, _, writes = self.run_gate(patch_error=True)
        self.assertIsInstance(result, subprocess.CalledProcessError)
        self.assertEqual(len(writes), 1)


if __name__ == '__main__':
    unittest.main()
