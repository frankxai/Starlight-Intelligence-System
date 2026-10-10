"""Read-only fleet evidence adapter. Python 3.11+, no services or model calls.

Outputs are private operator evidence, never an authorization to launch work.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import shlex
import subprocess
import tempfile
import tomllib

HOSTS = {
    'codex': ('.codex/config.toml', '.codex/skills', 'Codex'),
    'claude': ('.claude/settings.json', '.claude/skills', 'Claude'),
    'grok': ('.grok/config.toml', '.grok/skills', 'Grok'),
    'gemini': ('.gemini/settings.json', '.gemini/skills', None),
    'agy': ('.gemini/antigravity-cli/settings.json', None, None),
    'opencode': ('.config/opencode/opencode.json', '.config/opencode/skills', None),
    'kilo': ('.config/kilo/kilo.jsonc', '.kilo/skills', None),
    'hermes': (None, None, None),
    'cursor': ('.cursor/mcp.json', '.cursor/skills', None),
}
SAFE_NAME = re.compile(r'^[\w./:@ +()-]{1,120}$')


def utcnow():
    return datetime.now(timezone.utc)


def freshness(timestamp, now, ttl=900):
    try:
        parsed = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        if parsed.tzinfo is None:
            return 'unknown'
        seconds = (now - parsed).total_seconds()
        return 'fresh' if 0 <= seconds <= ttl else 'stale' if seconds > ttl else 'future-invalid'
    except (ValueError, TypeError, AttributeError):
        return 'unknown'


def names(values):
    return sorted({v for v in values if isinstance(v, str) and SAFE_NAME.fullmatch(v)})


def read_json(path):
    if path.stat().st_size > 4 * 1024 * 1024:
        raise ValueError('input exceeds 4 MiB')
    return json.loads(path.read_text(encoding='utf-8-sig'))


def config_summary(path):
    """Whitelist metadata. Never return commands, environment, URLs or credentials."""
    if path is None or not path.is_file():
        return {'state': 'not-inspected', 'models': [], 'mcp': []}
    try:
        raw = path.read_bytes()
        if len(raw) > 4 * 1024 * 1024:
            raise ValueError('oversize')
        data = tomllib.loads(raw.decode('utf-8-sig')) if path.suffix == '.toml' else json.loads(raw)
        models = names(data.get(k) for k in ('model', 'small_model', 'model_reasoning_effort'))
        servers = data.get('mcp_servers', data.get('mcpServers', data.get('mcp', {})))
        if not isinstance(servers, dict):
            raise ValueError('invalid MCP map')
        mcp = [{'name': key, 'state': 'disabled' if value.get('enabled') is False
                or value.get('disabled') is True else 'configured-unverified'}
               for key, value in servers.items() if names([key]) and isinstance(value, dict)]
        return {'state': 'inspected', 'sha256': hashlib.sha256(raw).hexdigest(),
                'models': models, 'mcp': mcp}
    except (ValueError, OSError, TypeError, AttributeError):
        # JSONC/YAML need host-native inspection; never guess after a parse failure.
        return {'state': 'parse-unverified', 'models': [], 'mcp': []}


def skill_summary(root):
    if root is None or not root.is_dir():
        return {'state': 'not-inspected', 'packages': []}
    try:
        return {'state': 'top-level-only', 'packages': names(
            p.name for p in root.iterdir() if p.is_dir() and (p / 'SKILL.md').is_file())}
    except OSError:
        return {'state': 'unreadable', 'packages': []}


def pool_summary(document, provider, now):
    result = {'provider': provider, 'state': 'unknown', 'remaining_percent': None}
    if not provider:
        return result
    result['state'] = freshness(document.get('ts'), now)
    result['observed_at'] = document.get('ts')
    if result['state'] != 'fresh':
        return result
    live = document.get('live_quota', {})
    if not isinstance(live, dict) or not isinstance(live.get('providers'), list):
        result['state'] = 'unknown'
        return result
    entries = [p for p in live['providers'] if isinstance(p, dict) and p.get('provider') == provider]
    if live.get('ok') is not True or len(entries) != 1:
        result['state'] = 'unknown'
        return result
    metrics = entries[0].get('metrics', [])
    if not isinstance(metrics, list) or any(not isinstance(m, dict) for m in metrics):
        result['state'] = 'unknown'
        return result
    values = [m.get('remaining_percent') for m in metrics]
    if not values or any(isinstance(v, bool) or not isinstance(v, (int, float))
                         or not math.isfinite(v) or not 0 <= v <= 100 for v in values):
        result['state'] = 'unknown'
        return result
    # Broad weekly/session gates still bind narrower model-family allowances.
    result['remaining_percent'] = min(values)
    result['state'] = 'exhausted' if min(values) == 0 else 'measured'
    return result


def process_owner(row):
    name = str(row.get('name', '')).lower().removesuffix('.exe')
    if name in HOSTS:
        return name
    if name in ('node', 'python', 'python3'):
        # Match entry-point packages only. Shell commands mentioning a harness do not qualify.
        command = str(row.get('command', '')).replace('\\', '/').lower()
        if name.startswith('python') and re.search(r'(?:^|\s)-m\s+hermes_cli\.main(?:\s|$)', command):
            return 'hermes'
        try:
            arguments = shlex.split(command, posix=False)
        except ValueError:
            return None
        entrypoint = arguments[1].strip('"') if len(arguments) > 1 else ''
        for host, markers in {
            'claude': ('/@anthropic-ai/claude-code/',),
            'gemini': ('/@google/gemini-cli/',),
            'hermes': ('/hermes_cli/', '/hermes-agent/hermes_cli'),
            'grok': ('/@vibe-kit/grok-cli/',),
        }.items():
            if any(marker in entrypoint for marker in markers):
                return host
    return None


def footprints(rows):
    """Assign each child to its nearest harness ancestor; reject reused parent PIDs."""
    indexed = {r['pid']: r for r in rows}
    totals = {h: {'roots': 0, 'processes': 0, 'working_set_bytes': 0,
                  'private_bytes': 0} for h in HOSTS}
    for row in rows:
        cursor, seen = row, set()
        direct = process_owner(row)
        owner = direct
        while owner is None and cursor['pid'] not in seen:
            seen.add(cursor['pid'])
            parent = indexed.get(cursor.get('parent_pid'))
            if parent is None or not parent.get('created') or not cursor.get('created'):
                break
            if parent['created'] > cursor['created']:
                break
            cursor = parent
            owner = process_owner(cursor)
        if owner:
            total = totals[owner]
            total['roots'] += int(direct is not None)
            total['processes'] += 1
            for key in ('working_set_bytes', 'private_bytes'):
                total[key] += max(0, int(row.get(key) or 0))
    return totals


def windows_observation():
    if os.name != 'nt':
        return {'state': 'unsupported'}, []
    script = r'''
    $osInfo = Get-CimInstance Win32_OperatingSystem
    $cpuInfo = Get-CimInstance Win32_Processor
    $rows = @(Get-CimInstance Win32_Process | ForEach-Object {
      $p = Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue
      if ($p) { @{pid=$_.ProcessId;parent_pid=$_.ParentProcessId;name=$_.Name;
        command=$_.CommandLine;created=$_.CreationDate.ToUniversalTime().ToString('o');
        working_set_bytes=$p.WorkingSet64;private_bytes=$p.PrivateMemorySize64} }
    })
    @{machine=@{state='measured';free_ram_bytes=([long]$osInfo.FreePhysicalMemory*1024);
      total_ram_bytes=([long]$osInfo.TotalVisibleMemorySize*1024);
      cpu_percent=($cpuInfo | Measure-Object LoadPercentage -Average).Average};
      processes=$rows} | ConvertTo-Json -Depth 5 -Compress
    '''
    try:
        result = subprocess.run(['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', script],
                                capture_output=True, text=True, timeout=45, check=True)
        data = json.loads(result.stdout)
        return data['machine'], data['processes']
    except (OSError, ValueError, subprocess.SubprocessError):
        return {'state': 'unavailable'}, []


def collect(home, now=None):
    now = now or utcnow()
    usage_path = home / '.starlight/cli-capacity/usage-snapshot-latest.json'
    try:
        usage = read_json(usage_path)
        if not isinstance(usage, dict):
            usage = {}
    except (OSError, ValueError):
        usage = {}
    machine, processes = windows_observation()
    machine['observed_at'] = now.isoformat()
    machine['free_disk_bytes'] = shutil.disk_usage(home).free
    memory = footprints(processes)
    hosts = []
    for host, (config, skills, provider) in HOSTS.items():
        command = shutil.which(host)
        hosts.append({'id': host, 'command_available': command is not None,
                      'config': config_summary(home / config if config else None),
                      'skills': skill_summary(home / skills if skills else None),
                      'footprint': memory[host], 'pool': pool_summary(usage, provider, now),
                      'authentication': 'unverified', 'capability_proof': 'unverified',
                      'update': 'version-and-release-check-required'})
    return {'schema': 'starlight.harness-fleet-observation.v1', 'observed_at': now.isoformat(),
            'machine': machine, 'hosts': hosts,
            'limits': ['Process memory is a sample, not a minimum requirement or peak.',
                       'Local commands can use remote models; privacy is not established.',
                       'Configured MCP and installed skills do not prove successful execution.',
                       'Quota is shared by provider account, not multiplied by harness count.',
                       'No dispatch authorization, updater, scheduler or memory import.']}


def render(snapshot):
    lines = ['# Harness fleet observation', '', 'Observed: ' + snapshot['observed_at'], '',
             '| Harness | Command | Processes | RAM GiB | Private GiB | Quota | MCP configured |',
             '|---|---|---:|---:|---:|---|---:|']
    for host in snapshot['hosts']:
        foot, pool = host['footprint'], host['pool']
        pct = pool['remaining_percent']
        lines.append(f"| {host['id']} | {'found' if host['command_available'] else 'not found'} "
                     f"| {foot['processes']} | {foot['working_set_bytes']/2**30:.3f} "
                     f"| {foot['private_bytes']/2**30:.3f} | {pool['state']}"
                     f"{'' if pct is None else ' '+str(pct)+'%'} | {len(host['config']['mcp'])} |")
    lines.extend(['', *('- ' + limitation for limitation in snapshot['limits'])])
    return '\n'.join(lines) + '\n'


def atomic_write(path, contents):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=path.parent,
                                         delete=False) as handle:
            temporary = Path(handle.name)
            handle.write(contents)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--home', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True,
                        help='Private JSON report path; companion Markdown is also written.')
    args = parser.parse_args()
    # Raw fleet evidence belongs outside the public checkout and source config leaves.
    private_root = (args.home / '.starlight/reports/harness-fleet').resolve()
    output = args.output.resolve()
    if private_root not in output.parents:
        parser.error('output must be below --home/.starlight/reports/harness-fleet')
    if output.suffix != '.json':
        parser.error('use a .json report')
    snapshot = collect(args.home)
    atomic_write(output, json.dumps(snapshot, indent=2, allow_nan=False) + '\n')
    atomic_write(output.with_suffix('.md'), render(snapshot))
    print(json.dumps({'output': str(output), 'hosts': len(snapshot['hosts']),
                      'machine': snapshot['machine']}))


if __name__ == '__main__':
    main()
