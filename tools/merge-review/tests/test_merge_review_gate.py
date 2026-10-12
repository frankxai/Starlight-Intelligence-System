import hashlib
import importlib.util
from pathlib import Path
import json
import unittest

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

    def test_jules_maker_and_frankx_eth_attestor_pass(self):
        comment = receipt(maker='jules', pr='110')
        comment['user']['login'] = 'frankx-eth'
        self.assertTrue(self.evaluate([comment]))

    def test_malformed_comment_and_empty_listing_deny(self):
        comment = receipt()
        comment['body'] = gate.MARKER + '{bad json'
        self.assertFalse(self.evaluate([comment]))
        self.assertFalse(self.evaluate([receipt()], []))

    def test_newer_failure_revokes_previous_passing_receipt(self):
        self.assertFalse(self.evaluate([receipt(), receipt(verdict='FAIL')]))
        self.assertFalse(self.evaluate([receipt(), receipt(blockingFindings=['unfixed'])]))


if __name__ == '__main__':
    unittest.main()
