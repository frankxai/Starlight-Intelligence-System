"""Check merge review receipts using trusted base code, without running PR code."""
import hashlib
import json
import os
from pathlib import PurePosixPath
import re
import subprocess

MARKER = 'STARLIGHT-INDEPENDENT-REVIEW-V1\n'
CHECK_NAME = 'independent-review-policy'
# Every harness on the owner's machine shares the owner's gh login, so a comment
# authored by that login proves nothing (PR #377). A receipt counts only when the
# checker GitHub App posted it with its own installation token.
DEFAULT_CHECKER_APP_SLUG = 'starlight-checker'
# Seats or models that may author a change. The reviewer must be a different one.
MAKERS = {'codex', 'claude-code', 'antigravity', 'cto', 'jules', 'grok'}
# Valid separate reviewers. Jules is never a reviewer.
REVIEW_PROVIDERS = {'codex', 'claude-code', 'antigravity', 'cto', 'grok', 'gemini'}
COST_SOURCES = {'billed', 'estimated', 'unknown'}


def cost_valid(receipt):
    """Unknown cost is null, never 0; a known cost is a non-negative number."""
    usd, source = receipt['cost_usd'], receipt['cost_source']
    if source == 'unknown':
        return usd is None
    return (source in COST_SOURCES and isinstance(usd, (int, float))
            and not isinstance(usd, bool) and usd >= 0)
HUMAN_ASSOCIATIONS = {'OWNER', 'MEMBER', 'COLLABORATOR'}
# Paths that touch money, publish, secrets, auth, licensing or the gate itself.
# These never auto-merge and need a CTO PASS.
HIGH_RISK_PATTERNS = [
    r'(^|/)\.github/', r'(^|/)tools/merge-review/', r'(^|/)tools/jules-conductor/',
    r'(^|/)docs/merge-review\.md$', r'(^|/)(codeowners|license|licence|notice)(\.[a-z]+)?$',
    r'licens', r'(pay|billing|stripe|checkout|price|pricing|invoice|money|wallet|marketplace)',
    r'(publish|release|deploy|npm-|vercel)', r'(secret|credential|token|\.env|\.pem$|\.key$)',
    r'(auth|login|session|oauth|permission|rbac|security)',
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
                  'pnpm-workspace.yaml', 'yarn.lock', 'bun.lockb', 'bun.lock', '.npmrc'}
INDEPENDENT_OF_CTO = {'codex', 'claude-code', 'antigravity'}


def high_risk(path):
    lowered = str(path).lower()
    name = PurePosixPath(lowered).name
    return (name in INSTRUCTION_NAMES or name in MANIFEST_NAMES
            or any(re.search(pattern, lowered) for pattern in HIGH_RISK_PATTERNS))


def reviewer_allowed(maker, provider, risky):
    if provider not in REVIEW_PROVIDERS or provider == maker:
        return False  # A self-review never counts.
    if not risky:
        return True
    # High risk needs CTO; a CTO-authored change needs another admitted seat instead.
    return provider in INDEPENDENT_OF_CTO if maker == 'cto' else provider == 'cto'


def checker_posted(comment, checker_slug, excluded_logins):
    """True only for a comment the checker App wrote with its installation token."""
    app = comment.get('performed_via_github_app') or {}
    login = (comment.get('user') or {}).get('login', '')
    # A user-to-server token of the same App still carries the human login, so the
    # author must be the App's own bot account as well.
    return (bool(checker_slug) and app.get('slug') == checker_slug
            and login == f'{checker_slug}[bot]'
            and login.lower() not in excluded_logins)


def edited(comment):
    # GitHub keeps the original App attribution when a comment is edited. REST
    # timestamps have one-second resolution, so main() also asks GraphQL for
    # lastEditedAt and the edit count. Only a checked, never-edited receipt counts.
    created, updated = comment.get('created_at'), comment.get('updated_at')
    return (not created or not updated or created != updated
            or comment.get('edit_history_checked') is not True
            or comment.get('last_edited_at') is not None
            or comment.get('content_edit_count') != 0)


EDIT_QUERY = ('query($id: ID!) { node(id: $id) { ... on IssueComment { '
              'lastEditedAt userContentEdits(first: 1) { totalCount } } } }')
MAX_EDIT_LOOKUPS = 5


def receipt_candidate(comment, head, checker_slug, excluded_logins):
    """REST-only pre-check: could this comment be the receipt evaluate() decides on?"""
    if (not checker_posted(comment, checker_slug, excluded_logins)
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


def annotate_edit_history(comments, head, checker_slug, excluded_logins, lookup=None):
    """Record GraphQL edit provenance, newest candidate first, for at most a few receipts.

    Unchecked candidates stay unannotated and fail closed in edited().
    """
    lookup = lookup or graphql_edit_history
    lookups = 0
    for comment in reversed(comments):
        if not receipt_candidate(comment, head, checker_slug, excluded_logins) or not comment.get('node_id'):
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


def receipt_valid(receipt, repository, number, head, expected_paths, risky):
    report = receipt['review']
    return (
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
        and bool(re.fullmatch(r'[0-9a-f]{64}', receipt['packetSha256']))
        and isinstance(receipt['resolution'], str) and bool(receipt['resolution'].strip())
        and cost_valid(receipt)
    )


def latest_checker_receipt(comments, head, checker_slug, excluded_logins):
    """Return (comment, receipt-or-None) for the newest parsed current-head checker receipt."""
    for comment in reversed(comments):
        if not checker_posted(comment, checker_slug, excluded_logins) or edited(comment):
            continue
        body = comment.get('body', '')
        # Accept the Windows delimiter without rewriting the hashed report.
        marker = MARKER if body.startswith(MARKER) else MARKER.replace('\n', '\r\n')
        if not body.startswith(marker) or len(body) > 60000:
            continue
        try:
            receipt = json.loads(body[len(marker):])
        except ValueError:
            return comment, None
        if not isinstance(receipt, dict):
            return comment, None
        if receipt.get('headSha') != head:
            continue
        return comment, receipt
    return None, None


def human_review_state(reviews, head, excluded_logins):
    """Latest APPROVED/CHANGES_REQUESTED per distinct human reviewer at the exact head."""
    latest = {}
    for review in reviews:
        user = review.get('user') or {}
        login = user.get('login', '')
        if (review.get('commit_id') != head or user.get('type') != 'User'
                or not login or login.lower() in excluded_logins
                or review.get('author_association') not in HUMAN_ASSOCIATIONS):
            continue
        state = review.get('state')
        if state in {'APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'}:
            latest[login] = (state, review.get('id'))
    return latest


def evaluate(repository, number, head, files, comments, auto_merge=None, *, reviews=(),
             pr_author='', pushers=(), checker_slug=DEFAULT_CHECKER_APP_SLUG):
    if not re.fullmatch(r'[0-9a-f]{40}', head) or not files:
        return False, 'Missing or invalid source identity or changed files.'
    if not pr_author:
        return False, 'Missing PR author identity.'
    risky = any(high_risk(item.get('filename', '')) for item in files)
    if risky and auto_merge:
        return False, 'High-risk change has auto-merge armed; disable it. High-risk PRs never auto-merge.'
    if not risky and all(routine_file(item) for item in files):
        return True, 'Routine plain-text notes only; required CI still applies.'
    excluded = {login.lower() for login in (pr_author, *pushers) if login}
    expected_paths = {item['filename'] for item in files}
    humans = human_review_state(reviews, head, excluded)
    blockers = sorted(login for login, (state, _) in humans.items() if state == 'CHANGES_REQUESTED')
    if blockers:
        return False, f'Changes requested at this head by {", ".join(blockers)}.'
    comment, receipt = latest_checker_receipt(comments, head, checker_slug, excluded)
    if comment is not None:
        try:
            valid = receipt is not None and receipt_valid(receipt, repository, number, head,
                                                          expected_paths, risky)
        except (KeyError, TypeError, ValueError):
            valid = False
        if valid:
            return True, (f'Exact-head PASS by {receipt["provider"]} (maker {receipt["maker"]}) '
                          f'posted by App {checker_slug} at {head} in comment {comment["id"]}.')
        # A newer checker FAIL/REVISE or malformed receipt revokes; a human approval
        # does not override it. Push a fix and re-run the checker.
        return False, 'Latest checker App receipt is invalid or reports blocking findings.'
    approvers = sorted(login for login, (state, _) in humans.items() if state == 'APPROVED')
    if approvers:
        return True, (f'Exact-head GitHub review APPROVED by {", ".join(approvers)}, '
                      f'distinct from the PR author and pushers.')
    return False, (f'Sensitive or unknown paths require an exact-head receipt posted by the '
                   f'{checker_slug} App, or an exact-head APPROVED review by a distinct human.')


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
    with open(os.environ['GITHUB_EVENT_PATH'], encoding='utf8') as event_file:
        event = json.load(event_file)
    value = (event.get('pull_request', {}).get('number')
             or (event.get('issue', {}).get('number') if event.get('issue', {}).get('pull_request') else None)
             or event.get('inputs', {}).get('pr'))
    if value is None:
        return  # Ordinary issue comments are not PR review events.
    number = int(value)
    if number < 1:
        raise ValueError('Invalid PR number')
    checker_slug = os.environ.get('MERGE_REVIEW_CHECKER_APP_SLUG') or DEFAULT_CHECKER_APP_SLUG
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,33}', checker_slug):
        raise ValueError('Invalid checker App slug')
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
        reviews = api(endpoint + '/reviews?per_page=100', paginate=True)
        commit = api(f'repos/{repository}/commits/{head}')
        # The head commit's author and committer stand in for the last pusher.
        pushers = [(commit.get(role) or {}).get('login', '') for role in ('author', 'committer')]
        excluded = {login.lower() for login in (pr['user']['login'], *pushers) if login}
        annotate_edit_history(comments, head, checker_slug, excluded)
        ok, summary = evaluate(repository, number, head, files, comments, pr.get('auto_merge'),
                               reviews=reviews, pr_author=pr['user']['login'], pushers=pushers,
                               checker_slug=checker_slug)
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
