"""Check merge review receipts using trusted base code, without running PR code."""
import hashlib
import json
import os
from pathlib import PurePosixPath
import re
import subprocess

MARKER = 'STARLIGHT-INDEPENDENT-REVIEW-V1\n'
CHECK_NAME = 'independent-review-policy'
# Only the repository owner may post a receipt. frankx-eth and jules are not trusted.
TRUSTED_ATTESTORS = {'frankxai'}
# A receipt counts only if GitHub records it as posted through an allowlisted App.
# A null performed_via_github_app means a raw token (PAT or gh CLI) and is rejected.
TRUSTED_APPS = {'cursor', 'chatgpt-codex-connector'}
# Seats, models or bots that may author a change. The reviewer must be a different one.
# dependabot and github-actions are bot makers: they are never reviewers, so their
# high-risk changes (manifests, lockfiles, workflows) still need a CTO PASS.
# grok covers Grok Bot seats other than CTO (e.g. WebDev, Surfaces). It is a maker
# only, never a reviewer.
MAKERS = {'codex', 'claude-code', 'antigravity', 'cto', 'jules', 'grok', 'dependabot', 'github-actions'}
# Valid separate reviewers. Jules is never a reviewer.
REVIEW_PROVIDERS = {'codex', 'claude-code', 'antigravity', 'cto'}
# Paths that touch money, publish, secrets, auth, licensing or the gate itself.
# These never auto-merge and need a CTO PASS.
HIGH_RISK_PATTERNS = [
    r'(^|/)\.github/', r'(^|/)tools/merge-review/', r'(^|/)tools/jules-conductor/',
    r'(^|/)docs/merge-review\.md$', r'(^|/)(codeowners|license|licence|notice)(\.[a-z]+)?$',
    r'licens', r'(pay|billing|stripe|checkout|price|pricing|invoice|money|wallet|marketplace)',
    r'(publish|release|deploy|npm-|vercel)', r'(secret|credential|token|\.env|\.pem$|\.key$)',
    r'(auth|login|session|oauth|permission|rbac|security)',
    # Money surfaces that do not use a payment word, e.g. src/finance/pnl.ts.
    r'(^|/)src/finance/', r'(finance|revenue|payout|ledger|pnl)',
]
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


# Dependency manifests and lockfiles can carry major bumps, scripts or publishConfig.
# The gate cannot verify a patch-only bump, so they are always high risk.
MANIFEST_NAMES = {'package.json', 'package-lock.json', 'npm-shrinkwrap.json', 'pnpm-lock.yaml',
                  'pnpm-workspace.yaml', 'yarn.lock', 'bun.lockb', 'bun.lock', '.npmrc',
                  # Rust, Python, Go and Ruby manifests carry the same risk.
                  'cargo.toml', 'cargo.lock', 'pyproject.toml', 'poetry.lock', 'uv.lock',
                  'pipfile', 'pipfile.lock', 'setup.py', 'setup.cfg', 'go.mod', 'go.sum',
                  'gemfile', 'gemfile.lock'}
MANIFEST_PATTERNS = [r'^requirements([-_.][a-z0-9_.-]*)?\.(txt|in)$', r'^constraints([-_.][a-z0-9_.-]*)?\.txt$']
INDEPENDENT_OF_CTO = {'codex', 'claude-code', 'antigravity'}


def high_risk(path):
    lowered = str(path).lower()
    name = PurePosixPath(lowered).name
    return (name in INSTRUCTION_NAMES or name in MANIFEST_NAMES
            or any(re.search(pattern, name) for pattern in MANIFEST_PATTERNS)
            or any(re.search(pattern, lowered) for pattern in HIGH_RISK_PATTERNS))


def item_paths(item):
    """Every path a changed-file entry touches. A rename or copy also names its source."""
    paths = [item.get('filename', '')]
    if item.get('previous_filename'):
        paths.append(item['previous_filename'])
    return paths


def item_high_risk(item):
    # Renaming a money or gate file to a neutral path must not drop its protection.
    return any(high_risk(path) for path in item_paths(item))


def reviewer_allowed(maker, provider, risky):
    if provider not in REVIEW_PROVIDERS or provider == maker:
        return False  # A self-review never counts.
    if not risky:
        return True
    # High risk needs CTO; a CTO-authored change needs another admitted seat instead.
    return provider in INDEPENDENT_OF_CTO if maker == 'cto' else provider == 'cto'


def posting_app(comment):
    app = comment.get('performed_via_github_app')
    return app.get('slug') if isinstance(app, dict) else None


def edited(comment):
    # GitHub keeps the original App attribution when a comment is edited, and the
    # edit may come from a raw token. REST timestamps have one-second resolution,
    # so main() also asks GraphQL for lastEditedAt and the edit count. Only a
    # receipt that was checked and never edited is trusted; anything else fails closed.
    created, updated = comment.get('created_at'), comment.get('updated_at')
    return (not created or not updated or created != updated
            or comment.get('edit_history_checked') is not True
            or comment.get('last_edited_at') is not None
            or comment.get('content_edit_count') != 0)


EDIT_QUERY = ('query($id: ID!) { node(id: $id) { ... on IssueComment { '
              'lastEditedAt userContentEdits(first: 1) { totalCount } } } }')


MAX_EDIT_LOOKUPS = 5


def receipt_candidate(comment, head):
    """REST-only pre-check: could this comment be the receipt evaluate() decides on?"""
    if (comment.get('user', {}).get('login') not in TRUSTED_ATTESTORS
            or comment.get('author_association') not in {'OWNER', 'MEMBER', 'COLLABORATOR'}
            or posting_app(comment) not in TRUSTED_APPS
            or not comment.get('created_at') or comment.get('created_at') != comment.get('updated_at')):
        return False
    body = comment.get('body', '')
    marker = MARKER if body.startswith(MARKER) else MARKER.replace('\n', '\r\n')
    if not body.startswith(marker) or len(body) > 60000:
        return False
    try:
        return json.loads(body[len(marker):]).get('headSha') == head
    except (ValueError, AttributeError):
        return False


def annotate_edit_history(comments, head, lookup=None):
    """Record GraphQL edit provenance, newest candidate first, for at most a few receipts.

    Only trusted, App-posted, REST-unedited, current-head receipts are looked up, and
    the scan stops at the first one with a clean history: that is the receipt
    evaluate() decides on. Unchecked candidates stay unannotated and fail closed.
    """
    lookup = lookup or graphql_edit_history
    lookups = 0
    for comment in reversed(comments):
        if not receipt_candidate(comment, head) or not comment.get('node_id'):
            continue
        if lookups >= MAX_EDIT_LOOKUPS:
            return
        lookups += 1
        node = lookup(comment['node_id'])
        edits = node.get('userContentEdits') or {}
        if 'lastEditedAt' not in node or not isinstance(edits.get('totalCount'), int):
            return
        comment['last_edited_at'] = node['lastEditedAt']
        comment['content_edit_count'] = edits['totalCount']
        comment['edit_history_checked'] = True
        if node['lastEditedAt'] is None and edits['totalCount'] == 0:
            return


def graphql_edit_history(node_id):
    run = subprocess.run(['gh', 'api', 'graphql', '-f', f'query={EDIT_QUERY}', '-f', f'id={node_id}'],
                         capture_output=True, text=True, timeout=90, check=True)
    return (json.loads(run.stdout).get('data') or {}).get('node') or {}


def evaluate(repository, number, head, files, comments, auto_merge=None):
    if not re.fullmatch(r'[0-9a-f]{40}', head) or not files:
        return False, 'Missing or invalid source identity or changed files.'
    risky = any(item_high_risk(item) for item in files)
    if risky and auto_merge:
        return False, 'High-risk change has auto-merge armed; disable it. High-risk PRs never auto-merge.'
    if not risky and all(routine_file(item) for item in files):
        return True, 'Routine plain-text notes only; required CI still applies.'
    expected_paths = {item['filename'] for item in files}
    for comment in reversed(comments):
        if (comment.get('user', {}).get('login') not in TRUSTED_ATTESTORS
                or comment.get('author_association') not in {'OWNER', 'MEMBER', 'COLLABORATOR'}
                or posting_app(comment) not in TRUSTED_APPS
                or edited(comment)):
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
                receipt['repository'] == repository
                and type(receipt['pr']) is int and receipt['pr'] == number
                and receipt['headSha'] == head
                and receipt['maker'] in MAKERS
                and reviewer_allowed(receipt['maker'], receipt['provider'], risky)
                and receipt['verdict'] == 'PASS'
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
            return True, (f'Exact-head PASS by {receipt["provider"]} (maker {receipt["maker"]}) '
                          f'at {head} in comment {comment["id"]}.')
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
        annotate_edit_history(comments, head)
        ok, summary = evaluate(repository, number, head, files, comments, pr.get('auto_merge'))
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
