"""Check merge review receipts using trusted base code, without running PR code."""
import hashlib
import json
import os
from pathlib import PurePosixPath
import re
import subprocess

MARKER = 'STARLIGHT-INDEPENDENT-REVIEW-V1\n'
CHECK_NAME = 'independent-review-policy'
TRUSTED_ATTESTORS = {'frankxai', 'frankx-eth'}
TRUSTED_MAKERS = {'codex', 'jules'}
REVIEW_PROVIDERS = {'antigravity', 'grok', 'claude', 'gemini'}
INSTRUCTION_NAMES = {'agents.md', 'agents.override.md', 'skill.md', 'skills.md',
                     'soul.md', 'rules.md', 'claude.md', 'gemini.md', 'grok.md'}


def routine_file(item):
    path = item.get('filename', '')
    parts = path.split('/')
    if (not path or '\\' in path or any(p in {'', '.', '..'} for p in parts)
            or item.get('status') not in {'added', 'modified', 'removed'}
            or item.get('mode') != '100644'):
        return False
    parsed = PurePosixPath(path)
    return (path.startswith(('docs/notes/', 'docs/handovers/'))
            and parsed.suffix in {'.md', '.txt'}
            and parsed.name.lower() not in INSTRUCTION_NAMES)


def evaluate(repository, number, head, files, comments):
    if not re.fullmatch(r'[0-9a-f]{40}', head) or not files:
        return False, 'Missing or invalid source identity or changed files.'
    if all(routine_file(item) for item in files):
        return True, 'Routine plain-text notes only; required CI still applies.'
    expected_paths = {item['filename'] for item in files}
    for comment in reversed(comments):
        if (comment.get('user', {}).get('login') not in TRUSTED_ATTESTORS
                or comment.get('author_association') not in {'OWNER', 'MEMBER', 'COLLABORATOR'}):
            continue
        body = comment.get('body', '')
        # Accept the Windows delimiter without rewriting the hashed report.
        marker = MARKER if body.startswith(MARKER) else MARKER.replace('\n', '\r\n')
        if not body.startswith(marker) or len(body) > 60000:
            continue
        try:
            receipt = json.loads(body[len(marker):])
            if receipt.get('headSha') != head:
                continue
            report = receipt['review']
            valid = (
                receipt['repository'] == repository and int(receipt['pr']) == number
                and receipt['headSha'] == head
                and receipt['maker'] in TRUSTED_MAKERS
                and receipt['provider'] in REVIEW_PROVIDERS
                and receipt['verdict'] in {'PASS', 'WARN'}
                and receipt['blockingFindings'] == []
                and set(receipt['reviewedFiles']) == expected_paths
                and isinstance(report, str) and len(report) >= 80
                and receipt['reviewSha256'] == hashlib.sha256(report.encode()).hexdigest()
                and re.fullmatch(r'[0-9a-f]{64}', receipt['packetSha256'])
                and isinstance(receipt['resolution'], str) and receipt['resolution'].strip()
            )
        except (KeyError, TypeError, ValueError):
            valid = False
        if valid:
            return True, f'Exact-head independent review attested in comment {comment["id"]}.'
        return False, 'Latest trusted review receipt is invalid or reports blocking findings.'
    return False, 'Sensitive or unknown paths require a trusted exact-head independent review receipt.'


def api(endpoint, payload=None, paginate=False):
    args = ['gh', 'api', endpoint]
    if paginate:
        args += ['--paginate', '--slurp']
    if payload is not None:
        args += ['--method', 'POST', '--input', '-']
    run = subprocess.run(args, input=None if payload is None else json.dumps(payload),
                         capture_output=True, text=True, timeout=90, check=True)
    data = json.loads(run.stdout)
    return [item for page in data for item in page] if paginate else data


def main():
    repository = os.environ['GITHUB_REPOSITORY']
    if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', repository):
        raise ValueError('Invalid repository')
    event = json.loads(open(os.environ['GITHUB_EVENT_PATH'], encoding='utf8').read())
    value = (event.get('pull_request', {}).get('number')
             or (event.get('issue', {}).get('number') if event.get('issue', {}).get('pull_request') else None)
             or event.get('inputs', {}).get('pr'))
    if value is None:
        return  # Ordinary issue comments are not PR review events.
    number = int(value)
    if number < 1:
        raise ValueError('Invalid PR number')
    endpoint = f'repos/{repository}/pulls/{number}'
    pr = api(endpoint)
    if pr['state'] != 'open':
        return
    head = pr['head']['sha']
    check = api(f'repos/{repository}/check-runs', {
        'name': CHECK_NAME, 'head_sha': head, 'status': 'in_progress',
        'external_id': f'merge-review:{number}:{head}'})
    ok = False
    summary = 'Review evaluation failed closed.'
    try:
        files = api(endpoint + '/files?per_page=100', paginate=True)
        if len(files) != pr['changed_files']:
            raise ValueError('Incomplete changed-file listing')
        # Only the narrow routine class needs mode inspection. No source is executed.
        if all(item['filename'].startswith(('docs/notes/', 'docs/handovers/')) for item in files):
            for revision in {head, pr['base']['sha']}:
                tree = api(f'repos/{repository}/git/trees/{revision}?recursive=1')
                if tree.get('truncated'):
                    raise ValueError('Incomplete Git tree listing')
                modes = {entry['path']: entry['mode'] for entry in tree['tree']}
                for item in files:
                    wanted = pr['base']['sha'] if item['status'] == 'removed' else head
                    if revision == wanted:
                        item['mode'] = modes.get(item['filename'])
        comments = api(f'repos/{repository}/issues/{number}/comments?per_page=100', paginate=True)
        ok, summary = evaluate(repository, number, head, files, comments)
        if api(endpoint)['head']['sha'] != head:
            ok, summary = False, 'PR head changed during evaluation; rerun for the new head.'
    except Exception as error:
        summary = f'Review evaluation failed closed ({type(error).__name__}).'
    # PATCH this run, never create a competing successful run after a failed run.
    args = ['gh', 'api', f'repos/{repository}/check-runs/{check["id"]}',
            '--method', 'PATCH', '--input', '-']
    subprocess.run(args, input=json.dumps({
        'status': 'completed', 'conclusion': 'success' if ok else 'failure',
        'output': {'title': CHECK_NAME, 'summary': summary}}),
        capture_output=True, text=True, timeout=90, check=True)
    print(json.dumps({'head': head, 'passed': ok, 'summary': summary}))


if __name__ == '__main__':
    main()
