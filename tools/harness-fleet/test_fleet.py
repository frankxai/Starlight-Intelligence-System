import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch, mock_open
import contextlib
import io
import sys

import fleet

NOW = datetime(2026, 10, 10, tzinfo=timezone.utc)


class FleetTests(unittest.TestCase):
    def quota(self, values, timestamp=None):
        return {'ts': timestamp or NOW.isoformat(), 'live_quota': {'ok': True, 'providers': [
            {'provider': 'Claude', 'metrics': [{'remaining_percent': v} for v in values]}]}}

    def test_weekly_gate_blocks_family_allowance(self):
        result = fleet.pool_summary(self.quota([100, 0, 67]), 'Claude', NOW)
        self.assertEqual(result['state'], 'exhausted')
        self.assertEqual(result['remaining_percent'], 0)

    def test_stale_snapshot_does_not_offer_old_allowance(self):
        result = fleet.pool_summary(self.quota([61], (NOW-timedelta(minutes=16)).isoformat()), 'Claude', NOW)
        self.assertEqual(result['state'], 'stale')
        self.assertIsNone(result['remaining_percent'])

    def test_future_and_naive_clock_invalid(self):
        self.assertEqual(fleet.freshness((NOW+timedelta(seconds=1)).isoformat(), NOW), 'future-invalid')
        self.assertEqual(fleet.freshness('2026-10-10T00:00:00', NOW), 'unknown')

    def test_invalid_quota_fails_closed(self):
        for value in (True, None, '90', -1, 101, float('nan'), float('inf')):
            with self.subTest(value=value):
                self.assertEqual(fleet.pool_summary(self.quota([value]), 'Claude', NOW)['state'], 'unknown')

    def test_malformed_and_duplicate_pool_fail_closed(self):
        for live in (None, [], {'providers': None}, {'ok': True, 'providers': [None]},
                     {'ok': True, 'providers': [{'provider': 'Claude', 'metrics': [None]}]}):
            self.assertEqual(fleet.pool_summary({'ts': NOW.isoformat(), 'live_quota': live}, 'Claude', NOW)['state'], 'unknown')
        doc = self.quota([100])
        doc['live_quota']['providers'] *= 2
        self.assertEqual(fleet.pool_summary(doc, 'Claude', NOW)['state'], 'unknown')

    def test_configuration_does_not_export_environment_or_url(self):
        with tempfile.TemporaryDirectory() as directory:
            config = Path(directory) / 'config.toml'
            config.write_text('model="gpt-test"\nmodel_reasoning_effort="medium"\n[mcp_servers.example]\nurl="https://secret.invalid"\n'
                              '[mcp_servers.example.env]\nAPI_KEY="secret-sentinel"\n')
            summary = fleet.config_summary(config)
            self.assertEqual(summary['mcp'], [{'name': 'example', 'state': 'configured-unverified'}])
            self.assertNotIn('secret', json.dumps(summary))
            self.assertEqual(summary['models'], ['gpt-test'])
            self.assertEqual(summary['reasoning_effort'], ['medium'])

    def test_disabled_mcp_remains_disabled(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)/'mcp.json'
            path.write_text('{"mcpServers":{"off":{"disabled":true},"broken":42}}')
            self.assertEqual(fleet.config_summary(path)['mcp'], [{'name': 'off', 'state': 'disabled'}])

    def test_jsonc_is_not_guessed(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)/'mcp.jsonc'
            path.write_text('{// comment\n"mcp": {}}')
            self.assertEqual(fleet.config_summary(path)['state'], 'parse-unverified')

    def test_child_attribution_and_parent_pid_reuse(self):
        rows = [
            {'pid': 1, 'name': 'codex.exe', 'created': '2026-01-01', 'working_set_bytes': 10},
            {'pid': 2, 'name': 'node.exe', 'parent_pid': 1, 'created': '2026-01-02', 'working_set_bytes': 20},
            {'pid': 3, 'name': 'grok.exe', 'parent_pid': 1, 'created': '2026-01-03', 'working_set_bytes': 30},
            {'pid': 4, 'name': 'node.exe', 'parent_pid': 1, 'created': '2025-01-01', 'working_set_bytes': 40},
        ]
        report = fleet.footprints(rows)
        self.assertEqual(report['codex']['working_set_bytes'], 30)
        self.assertEqual(report['grok']['working_set_bytes'], 30)
        self.assertEqual(sum(v['processes'] for v in report.values()), 3)

    def test_shell_mentions_do_not_become_harnesses(self):
        self.assertIsNone(fleet.process_owner({'name': 'powershell.exe', 'command': 'inspect codex.exe'}))
        self.assertIsNone(fleet.process_owner({'name': 'node.exe', 'command': 'query claude history'}))

    def test_hermes_module_entrypoint(self):
        self.assertEqual(fleet.process_owner({'name': 'python.exe', 'command': 'python -m hermes_cli.main gateway run'}), 'hermes')
        self.assertIsNone(fleet.process_owner({'name': 'powershell.exe', 'command': 'python -m hermes_cli.main gateway run'}))

    def test_package_mention_inside_node_code_is_not_entrypoint(self):
        self.assertIsNone(fleet.process_owner({'name': 'node.exe', 'command': 'node -e "read /@google/gemini-cli/config"'}))
        self.assertEqual(fleet.process_owner({'name': 'node.exe', 'command': '"node.exe" "C:/npm/@google/gemini-cli/dist/index.js"'}), 'gemini')

    def test_cycle_does_not_hang(self):
        rows = [{'pid': 1, 'name': 'node', 'parent_pid': 2, 'created': 'x'},
                {'pid': 2, 'name': 'node', 'parent_pid': 1, 'created': 'x'}]
        self.assertEqual(sum(v['processes'] for v in fleet.footprints(rows).values()), 0)

    def test_failed_replace_preserves_previous_snapshot(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)/'snapshot.json'
            path.write_text('previous')
            with patch('fleet.os.replace', side_effect=OSError('busy')):
                with self.assertRaises(OSError):
                    fleet.atomic_write(path, 'replacement')
            self.assertEqual(path.read_text(), 'previous')
            self.assertEqual(len(list(Path(directory).iterdir())), 1)

    def test_collect_without_quota_reports_unknown(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch('fleet.windows_observation', return_value=({'state': 'unavailable'}, [])):
                result = fleet.collect(Path(directory), NOW)
            self.assertEqual(len(result['hosts']), 9)
            self.assertTrue(all(h['pool']['state'] == 'unknown' for h in result['hosts']))
            self.assertTrue(all(h['authentication'] == 'unverified' for h in result['hosts']))

    def test_native_grok_pool_and_explicit_refresh_source(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)/'quota.json'
            doc = self.quota([83])
            doc['live_quota']['providers'][0]['provider'] = 'Grok Build'
            path.write_text(json.dumps(doc))
            with patch('fleet.windows_observation', return_value=({'state': 'unavailable'}, [])):
                result = fleet.collect(Path(directory), NOW, path)
            grok = next(h for h in result['hosts'] if h['id'] == 'grok')
            self.assertEqual(grok['pool']['remaining_percent'], 83)

    def test_bounded_read_requests_limit_before_allocating(self):
        opener = mock_open(read_data=b'{}')
        with patch.object(Path, 'open', opener):
            self.assertEqual(fleet.read_json(Path('input.json')), {})
        opener().read.assert_called_once_with(fleet.MAX_INPUT_BYTES + 1)

    def test_oversize_quota_and_config_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)/'input.json'
            path.write_bytes(b' ' * (fleet.MAX_INPUT_BYTES + 1))
            with self.assertRaises(ValueError):
                fleet.read_json(path)
            self.assertEqual(fleet.config_summary(path)['state'], 'parse-unverified')

    def test_quota_output_collision_preserves_source(self):
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            output = home/'.starlight/reports/harness-fleet/report.json'
            output.parent.mkdir(parents=True)
            for source in (output, output.with_suffix('.md')):
                source.write_text(json.dumps(self.quota([100])))
                original = source.read_bytes()
                with patch.object(sys, 'argv', ['fleet', '--home', str(home), '--quota', str(source),
                                               '--output', str(output)]), \
                        patch('fleet.windows_observation') as observe, \
                        contextlib.redirect_stderr(io.StringIO()):
                    with self.assertRaises(SystemExit) as raised:
                        fleet.main()
                self.assertEqual(raised.exception.code, 2)
                self.assertEqual(source.read_bytes(), original)
                observe.assert_not_called()

    def test_failed_process_measurement_is_unknown_not_zero(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch('fleet.windows_observation', return_value=({'state': 'unavailable'}, [])):
                snapshot = fleet.collect(Path(directory), NOW)
            self.assertTrue(all(h['footprint']['state'] == 'unknown' for h in snapshot['hosts']))
            self.assertIn('| unknown | -- | -- |', fleet.render(snapshot))


if __name__ == '__main__':
    unittest.main()
