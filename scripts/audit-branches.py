"""Read-only branch inventory. Requires full history; never merges or deletes refs."""
import json
import subprocess


def git(*args):
    return subprocess.check_output(['git', *args], text=True, encoding='utf-8').strip()


if __name__ == '__main__':
    if git('rev-parse', '--is-shallow-repository') == 'true':
        raise SystemExit('Fetch full history before classifying branches.')
    base = git('rev-parse', 'origin/main')
    rows = []
    for line in git('for-each-ref', '--format=%(refname) %(objectname)',
                    'refs/heads', 'refs/remotes/origin').splitlines():
        ref, head = line.split()
        if ref.endswith('/HEAD'):
            continue
        ancestor = subprocess.run(['git', 'merge-base', '--is-ancestor', head, base],
                                  capture_output=True).returncode
        if ancestor not in (0, 1):
            raise SystemExit(f'Cannot classify {ref}')
        commits = git('log', '--format=%h %s', f'{base}..{head}').splitlines()
        files = git('diff', '--name-only', f'{base}...{head}').splitlines() if commits else []
        rows.append({'ref': ref, 'head': head, 'contained': ancestor == 0,
                     'commits': commits, 'files': files})
    print(json.dumps({'base': base, 'branches': rows}, indent=2))
