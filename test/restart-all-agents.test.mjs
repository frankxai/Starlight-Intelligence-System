import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const sessionsConfigPath = path.join(repoRoot, 'memory', 'agent-sessions.json');
const agyToolsPath = path.join(repoRoot, 'scripts', 'agy-tools.ps1');
const restartScriptPath = path.join(repoRoot, 'scripts', 'restart-all-agents.ps1');
const watchLauncherPath = path.join(repoRoot, 'scripts', 'watch-launcher.ps1');
const installWatcherPath = path.join(repoRoot, 'scripts', 'install-launcher-watcher.ps1');
const launchVisiblePath = path.join(repoRoot, 'scripts', 'launch-visible-agents.ps1');

function extractDefinedPowerShellCommands(psContent) {
  const names = new Set();
  for (const match of psContent.matchAll(/^\s*function\s+([A-Za-z0-9_-]+)\b/gm)) {
    names.add(match[1].toLowerCase());
  }
  for (const match of psContent.matchAll(/Set-Alias\s+-Name\s+['"]?([A-Za-z0-9_-]+)['"]?/gi)) {
    names.add(match[1].toLowerCase());
  }
  return names;
}

test('agent-sessions.json defines valid profiles and portable launcher commands', () => {
  const raw = fs.readFileSync(sessionsConfigPath, 'utf8');
  const config = JSON.parse(raw);

  assert.equal(typeof config.version, 'number');
  assert.ok(config.machines['DESKTOP-1B4ICID'], 'missing DESKTOP-1B4ICID profile');
  assert.ok(config.machines['Starlight'], 'missing Starlight (Yoga Book 9i) profile');
  assert.ok(config.machines['DEFAULT_SECONDARY'], 'missing DEFAULT_SECONDARY profile');

  const agyToolsContent = fs.readFileSync(agyToolsPath, 'utf8');
  const definedCommands = extractDefinedPowerShellCommands(agyToolsContent);

  for (const [host, machine] of Object.entries(config.machines)) {
    assert.ok(Array.isArray(machine.auto_start_repos) && machine.auto_start_repos.length > 0, `${host} must define auto_start_repos`);
    for (const repo of machine.auto_start_repos) {
      assert.ok(repo.name, `${host} repo entry missing name`);
      assert.ok(repo.path, `${host}/${repo.name} missing path`);
      assert.ok(repo.agent, `${host}/${repo.name} missing agent`);
      assert.ok(repo.command, `${host}/${repo.name} missing command`);
      assert.notEqual(
        repo.command,
        'acos',
        `${host}/${repo.name} must not use broken npm 'acos' CLI for codex launcher; use 'cdacos'`
      );
      assert.ok(
        definedCommands.has(repo.command.toLowerCase()),
        `command '${repo.command}' (${host}/${repo.name}) must be defined in scripts/agy-tools.ps1 for cross-laptop portability`
      );
    }
  }
});

test('agy-tools.ps1 exposes restart-all and agent lifecycle aliases', () => {
  const agyToolsContent = fs.readFileSync(agyToolsPath, 'utf8');
  const definedCommands = extractDefinedPowerShellCommands(agyToolsContent);

  for (const required of [
    'start-agents',
    'restart-agents',
    'kill-agents',
    'stop-agents',
    'agent-status',
    'restart-all',
    'restart-all-agents',
    'start-all',
    'observatory',
    'agyfxp',
    'cdacos'
  ]) {
    assert.ok(definedCommands.has(required), `scripts/agy-tools.ps1 missing '${required}' command/alias`);
  }
});

test('watch-launcher.ps1 derives paths dynamically without hardcoded acos tab list', () => {
  const content = fs.readFileSync(watchLauncherPath, 'utf8');
  assert.ok(
    !content.includes('-Command acos'),
    'watch-launcher.ps1 must not hardcode broken -Command acos'
  );
  assert.ok(
    content.includes('$PSScriptRoot'),
    'watch-launcher.ps1 must resolve repository paths relative to $PSScriptRoot'
  );
});

test(
  'all session lifecycle PowerShell scripts parse cleanly with zero AST errors',
  { skip: process.platform !== 'win32' },
  () => {
    const scripts = [
      restartScriptPath,
      agyToolsPath,
      watchLauncherPath,
      installWatcherPath,
      launchVisiblePath
    ];
    const scriptsJson = JSON.stringify(scripts).replace(/'/g, "''");
    const checkCmd = `
      $files = '${scriptsJson}' | ConvertFrom-Json
      $errorsFound = @()
      foreach ($f in $files) {
        $tokens = $null
        $parseErrors = $null
        [void][System.Management.Automation.Language.Parser]::ParseFile($f, [ref]$tokens, [ref]$parseErrors)
        if ($parseErrors -and $parseErrors.Count -gt 0) {
          foreach ($e in $parseErrors) {
            $errorsFound += "$($f): $($e.Message)"
          }
        }
      }
      if ($errorsFound.Count -gt 0) {
        Write-Error ($errorsFound -join "; ")
        exit 1
      }
    `;
    execFileSync('pwsh.exe', ['-NoProfile', '-Command', checkCmd], {
      encoding: 'utf8',
      stdio: 'pipe'
    });
  }
);

test(
  'restart-all-agents.ps1 resolves fallback repo paths, guards missing directories, filters by -Target, and manages isolated dummy sessions safely',
  { skip: process.platform !== 'win32' },
  async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sis-restart-test-'));
    let dummyChild = null;
    try {
      const hostname = os.hostname();
      const repoFolderName = path.basename(repoRoot);
      const fakePrimaryPath = path.join(tmpDir, 'nonexistent-root', repoFolderName);
      const missingRepoPath = path.join(tmpDir, 'nonexistent-root', '__missing_sis_test_repo__');
      const tempConfigPath = path.join(tmpDir, 'agent-sessions.test.json');
      const tempStatusJsPath = path.join(tmpDir, 'cockpit', 'agent-status-data.js');
      const dummyCmdName = `Start-Sleep`;

      // Spawn a harmless isolated headless pwsh child matching `-Command ". '...agy-tools.ps1' __sis_dummy_agent_test__"`
      // Note: Start-Sleep is not used as command name to avoid matching unrelated processes; we pass a unique no-op script command.
      const uniqueToken = `__sis_dummy_cmd_${process.pid}_${Date.now()}__`;
      const dummyScriptPath = path.join(tmpDir, 'dummy-agy-tools.ps1');
      fs.writeFileSync(
        dummyScriptPath,
        `param([string]$AutoRunCommand = '')\nStart-Sleep -Seconds 30\n`,
        'utf8'
      );

      dummyChild = spawn(
        'pwsh.exe',
        [
          '-NoProfile',
          '-Command',
          `. '${dummyScriptPath.replace(/'/g, "''")}' ${uniqueToken}`
        ],
        { stdio: 'ignore', windowsHide: true }
      );

      // Wait briefly for Win32_Process registration
      await new Promise((r) => setTimeout(r, 600));

      const testConfig = {
        version: 1,
        updated: '2026-11-11',
        machines: {
          [hostname]: {
            role: 'Test Host',
            description: 'Automated test profile',
            auto_start_repos: [
              {
                name: repoFolderName,
                path: fakePrimaryPath,
                agent: 'claude',
                command: uniqueToken,
                role: 'Fallback path + live dummy session test'
              },
              {
                name: '__missing_sis_test_repo__',
                path: missingRepoPath,
                agent: 'antigravity',
                command: '__sis_noop_test_cmd_2__',
                role: 'Missing directory guard test'
              }
            ]
          }
        }
      };

      fs.writeFileSync(tempConfigPath, JSON.stringify(testConfig, null, 2), 'utf8');

      // 1. Run Status and verify dynamic fallback path + live dummy process detection
      execFileSync(
        'pwsh.exe',
        [
          '-NoProfile',
          '-ExecutionPolicy',
          'Bypass',
          '-File',
          restartScriptPath,
          '-Action',
          'Status',
          '-ConfigPath',
          tempConfigPath,
          '-StatusJsPath',
          tempStatusJsPath
        ],
        { encoding: 'utf8', stdio: 'pipe' }
      );

      assert.ok(fs.existsSync(tempStatusJsPath), 'agent-status-data.js should be written');
      const jsRaw = fs.readFileSync(tempStatusJsPath, 'utf8').trim();
      assert.ok(jsRaw.startsWith('window.STARLIGHT_AGENT_STATUS = '), 'status JS must assign window.STARLIGHT_AGENT_STATUS');
      const jsonPayload = JSON.parse(
        jsRaw.replace(/^window\.STARLIGHT_AGENT_STATUS\s*=\s*/, '').replace(/;\s*$/, '')
      );

      assert.equal(jsonPayload.hostname.toLowerCase(), hostname.toLowerCase());
      assert.equal(jsonPayload.agents.length, 2);
      assert.notEqual(
        jsonPayload.agents[0].path,
        fakePrimaryPath,
        'resolved fallback path must replace non-existent configured path'
      );
      assert.equal(jsonPayload.agents[0].path_exists, true);
      assert.equal(jsonPayload.agents[0].running, true, 'dummy session should be detected as running');
      assert.equal(jsonPayload.agents[0].pid, dummyChild.pid);
      assert.equal(jsonPayload.agents[1].path_exists, false);

      // 2. Run Kill with -Target pointing ONLY at the missing repo: dummyChild must remain alive!
      const outScoped = JSON.parse(
        execFileSync(
          'pwsh.exe',
          [
            '-NoProfile',
            '-ExecutionPolicy',
            'Bypass',
            '-File',
            restartScriptPath,
            '-Action',
            'Kill',
            '-Target',
            '__missing_sis_test_repo__',
            '-Json',
            '-ConfigPath',
            tempConfigPath,
            '-StatusJsPath',
            tempStatusJsPath
          ],
          { encoding: 'utf8', stdio: 'pipe' }
        ).trim()
      );
      assert.equal(outScoped.agents[0].running, true, 'out-of-scope running session must not be killed by -Target');

      // 3. Run Restart -DryRun and ensure missing repo does not crash and dummyChild still stays alive
      const parsedDry = JSON.parse(
        execFileSync(
          'pwsh.exe',
          [
            '-NoProfile',
            '-ExecutionPolicy',
            'Bypass',
            '-File',
            restartScriptPath,
            '-Action',
            'Restart',
            '-DryRun',
            '-Json',
            '-ConfigPath',
            tempConfigPath,
            '-StatusJsPath',
            tempStatusJsPath
          ],
          { encoding: 'utf8', stdio: 'pipe' }
        ).trim()
      );
      assert.equal(parsedDry.dry_run, true);
      assert.match(parsedDry.agents[0].details, /dry-run/i);
      assert.match(parsedDry.agents[1].details, /not found|missing|skipped/i);

      // 4. Run real Kill targeted at uniqueToken: dummyChild must be terminated cleanly
      const parsedKill = JSON.parse(
        execFileSync(
          'pwsh.exe',
          [
            '-NoProfile',
            '-ExecutionPolicy',
            'Bypass',
            '-File',
            restartScriptPath,
            '-Action',
            'Kill',
            '-Target',
            uniqueToken,
            '-Json',
            '-ConfigPath',
            tempConfigPath,
            '-StatusJsPath',
            tempStatusJsPath
          ],
          { encoding: 'utf8', stdio: 'pipe' }
        ).trim()
      );
      assert.equal(parsedKill.agents[0].running, false, 'targeted dummy session should be stopped cleanly');
    } finally {
      if (dummyChild && dummyChild.exitCode === null) {
        try {
          dummyChild.kill();
        } catch {}
      }
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
);
