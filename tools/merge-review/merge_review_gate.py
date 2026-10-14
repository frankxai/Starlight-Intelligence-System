"""Check merge review evidence using trusted base code, without running PR code."""
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import urllib.parse

sys.path.insert(0, str(Path(__file__).resolve().parent))
import review_policy as policy  # noqa: E402  (trusted sibling module, loaded by path)

MARKER = policy.MARKER
CHECK_NAME = 'independent-review-policy'
# Seats or models that may author a change. The reviewer must be a different one.
MAKERS = {'codex', 'claude-code', 'antigravity', 'cto', 'jules', 'grok', 'gemini'}
# Valid separate reviewers. Jules is never a reviewer.
REVIEW_PROVIDERS = {'codex', 'claude-code', 'antigravity', 'cto', 'grok', 'gemini'}
COST_SOURCES = {'billed', 'estimated', 'unknown'}
HUMAN_ASSOCIATIONS = {'OWNER', 'MEMBER', 'COLLABORATOR'}
MAX_SWEEP_PRS = 25
# Paths that touch money, publish, secrets, auth, licensing or the gate itself.
# These never auto-merge and need a CTO PASS.
HIGH_RISK_PATTERNS = [
    r'(^|/)\.github/', r'(^|/)tools/merge-review/', r'(^|/)tools/jules-conductor/',
    r'(^|/)docs/merge-review(-runner)?\.md$', r'(^|/)(codeowners|license|licence|notice)(\.[a-z]+)?$',
    r'licens', r'(pay|billing|stripe|checkout|price|pricing|invoice|money|wallet|marketplace)',
    r'(publish|release|deploy|npm-|vercel)', r'(secret|credential|token|\.env|\.pem$|\.key$)',
    r'(auth|login|session|oauth|permission|rbac|security)',
]
INSTRUCTION_NAMES = {'agents.md', 'agents.override.md', 'skill.md', 'skills.md',
                     'soul.md', 'rules.md', 'claude.md', 'gemini.md', 'grok.md'}
# Dependency manifests and lockfiles can carry major bumps, scripts or publishConfig.
# The gate cannot verify a patch-only bump, so they are always high risk.
MANIFEST_NAMES = {'package.json', 'package-lock.json', 'npm-shrinkwrap.json', 'pnpm-lock.yaml',
                  'pnpm-workspace.yaml', 'yarn.lock', 'bun.lockb', 'bun.lock', '.npmrc'}
INDEPENDENT_OF_CTO = {'codex', 'claude-code', 'antigravity'}


def cost_valid(receipt):
    """Unknown cost is null, never 0; a known cost is a non-negative number."""
    usd, source = receipt['cost_usd'], receipt['cost_source']
    if source == 'unknown':
        return usd is None
    return (source in COST_SOURCES and isinstance(usd, (int, float))
            and not isinstance(usd, bool) and usd >= 0)


def item_paths(item):
    """A rename is judged on both names, so moving src/auth.py keeps its high-risk rules."""
    return [p for p in (item.get('filename', ''), item.get('previous_filename')) if p]


def routine_file(item):
    path = item.get('filename', '')
    parts = path.split('/')
    if (not path or '\\' in path or any(p in {'', '.', '..'} for p in parts)
            or item.get('status') not in {'added', 'modified', 'removed'}
            or item.get('previous_filename') or item.get('mode') != '100644'):
        return False
    parsed = PurePosixPath(path)
    return (path.startswith(('docs/notes/', 'docs/handovers/'))
            and parsed.suffix in {'.md', '.txt'}
            and parsed.name.lower() not in INSTRUCTION_NAMES)


def high_risk(path):
    lowered = str(path).lower()
    name = PurePosixPath(lowered).name
    return (name in INSTRUCTION_NAMES or name in MANIFEST_NAMES
            or any(re.search(pattern, lowered) for pattern in HIGH_RISK_PATTERNS))


def reviewer_allowed(maker, provider, risky, maker_vendors, trust):
    """Different seat, a verifiable vendor outside every maker vendor, and CTO on high risk."""
    vendor = policy.vendor_of(provider, trust)
    if (provider not in REVIEW_PROVIDERS or provider == maker or vendor is None
            or vendor in maker_vendors or policy.vendor_of(maker, trust) not in maker_vendors):
        return False
    if not risky:
        return True
    # High risk needs CTO; a CTO-authored change needs another admitted seat instead.
    return provider in INDEPENDENT_OF_CTO if maker == 'cto' else provider == 'cto'


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


def receipt_text(comment):
    """The receipt JSON text after the marker, or None if this is not a receipt comment."""
    body = comment.get('body', '')
    # Accept the Windows delimiter without rewriting the hashed report.
    marker = MARKER if body.startswith(MARKER) else MARKER.replace('\n', '\r\n')
    if not body.startswith(marker) or len(body) > 60000:
        return None
    return body[len(marker):]


def receipt_head(text):
    try:
        value = policy.loads_strict(text)
    except ValueError:
        return None
    return value.get('headSha') if isinstance(value, dict) else None


def app_receipt_comments(comments, head, trust):
    """App-authored receipt comments for this head, oldest first."""
    found = []
    for comment in comments:
        text = receipt_text(comment) if policy.app_authored(comment, trust) else None
        if text is not None and receipt_head(text) in {head, None}:
            found.append((comment, text))
    return found


def annotate_edit_history(comments, head, trust, lookup=None):
    """Record GraphQL edit provenance for the newest App receipts at this head.

    Unchecked candidates stay unannotated and fail closed in edited().
    """
    lookup = lookup or graphql_edit_history
    candidates = [c for c, _ in app_receipt_comments(comments, head, trust) if c.get('node_id')]
    for comment in list(reversed(candidates))[:MAX_EDIT_LOOKUPS]:
        node = lookup(comment['node_id'])
        edits = node.get('userContentEdits') or {}
        if 'lastEditedAt' not in node or not isinstance(edits.get('totalCount'), int):
            return
        comment['last_edited_at'] = node['lastEditedAt']
        comment['content_edit_count'] = edits['totalCount']
        comment['edit_history_checked'] = True


def graphql_edit_history(node_id):
    run = subprocess.run(['gh', 'api', 'graphql', '-f', f'query={EDIT_QUERY}', '-f', f'id={node_id}'],
                         capture_output=True, text=True, timeout=90, check=True)
    return (json.loads(run.stdout).get('data') or {}).get('node') or {}


def receipt_intact(receipt, ctx):
    """Integrity: the receipt describes exactly this PR, head, manifest and maker set."""
    report = receipt['review']
    return (
        receipt['repository'] == ctx['repository']
        and type(receipt['pr']) is int and receipt['pr'] == ctx['number']
        and receipt['headSha'] == ctx['head']
        and receipt['maker'] in MAKERS
        and receipt['verdict'] in {'PASS', 'REVISE', 'FAIL'}
        and (receipt['verdict'] == 'PASS') == (receipt['blockingFindings'] == [])
        and bool(ctx['manifest_sha']) and receipt['manifestSha256'] == ctx['manifest_sha']
        and receipt['reviewedFiles'] == ctx['manifest_paths']
        and set(ctx['manifest_paths']) == ctx['expected_paths']
        and receipt['makerVendors'] == ctx['maker_vendors']
        and isinstance(report, str) and len(report) >= 80
        and receipt['reviewSha256'] == policy.sha256(report)
        and bool(re.fullmatch(r'[0-9a-f]{64}', receipt['packetSha256']))
        and isinstance(receipt['resolution'], str) and bool(receipt['resolution'].strip())
        and cost_valid(receipt)
    )


def ledger_receipt(run):
    """Parse an App check run: the receipt text and its recorded hash must agree."""
    output = run.get('output') or {}
    text = output.get('text') or ''
    if (run.get('status') != 'completed' or output.get('summary') != f'receiptSha256: {policy.sha256(text)}'):
        return None, text
    try:
        receipt = policy.loads_strict(text)
    except ValueError:
        return None, text
    if not isinstance(receipt, dict):
        return None, text
    expected = 'success' if receipt.get('verdict') == 'PASS' else 'failure'
    return (receipt if run.get('conclusion') == expected else None), text


def evaluate_ledger(ctx):
    """Return ('pass'|'block'|'none', reason) from App check runs and their mirror comments.

    Check runs cannot be deleted and only the App that created one can change it, so they
    are the verdict ledger. Any non-PASS entry at this head blocks for good: push a fix.
    The newest entry must be a PASS whose mirror comment exists, matches and is unedited.
    """
    trust = ctx['trust']
    runs = sorted((r for r in ctx['ledger'] if policy.check_run_by_app(r, trust)
                   and r.get('name') == policy.RECEIPT_CHECK and r.get('head_sha') == ctx['head']),
                  key=lambda r: r['id'])
    comments = app_receipt_comments(ctx['comments'], ctx['head'], trust)
    texts = set()
    newest = None
    for run in runs:
        receipt, text = ledger_receipt(run)
        # A check run is keyed by SHA, and two PRs can share a head. A verdict recorded for
        # another PR or repository neither passes nor poisons this one.
        if receipt is not None and (receipt.get('repository') != ctx['repository']
                                    or receipt.get('pr') != ctx['number'] or type(receipt.get('pr')) is not int):
            continue
        texts.add(text)
        if receipt is None or receipt.get('verdict') != 'PASS':
            return 'block', f'Checker ledger records a non-PASS or unreadable entry at this head (check run {run["id"]}).'
        newest = (run, receipt, text)
    for comment, text in comments:
        if text not in texts:
            return 'block', f'Checker comment {comment.get("id")} has no matching ledger entry; evidence fails closed.'
    if newest is None:
        return 'none', 'No checker ledger entry at this head.'
    run, receipt, text = newest
    mirrors = [c for c, t in comments if t == text]
    try:
        intact = receipt_intact(receipt, ctx)
    except (KeyError, TypeError, ValueError):
        intact = False
    if not intact or not mirrors or any(edited(c) for c in mirrors):
        return 'block', 'Newest checker receipt is missing, edited or does not match this head and manifest.'
    if not reviewer_allowed(receipt['maker'], receipt['provider'], ctx['risky'], ctx['maker_vendors'], trust):
        return 'none', (f'Checker PASS by {receipt["provider"]} does not qualify for this change '
                        '(high risk needs CTO, and the vendor must differ from every maker vendor).')
    return 'pass', (f'Exact-head PASS by {receipt["provider"]} (maker {receipt["maker"]}) in App check run '
                    f'{run["id"]} at {ctx["head"]}.')


def human_review_state(reviews, head):
    """Latest APPROVED/CHANGES_REQUESTED/DISMISSED per human reviewer id at the exact head."""
    latest = {}
    for review in reviews:
        user = review.get('user') or {}
        if (review.get('commit_id') != head or user.get('type') != 'User'
                or type(user.get('id')) is not int
                or review.get('author_association') not in HUMAN_ASSOCIATIONS):
            continue
        state = review.get('state')
        if state in {'APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'}:
            latest[user['id']] = (state, user.get('login', ''))
    return latest


def independent_approvers(humans, ctx):
    """Approvers listed in the trust file, distinct from the author and every pusher."""
    trust = ctx['trust']
    allowed = {user['id'] for user in trust['independentReviewers']['users']}
    blocked = set(trust['nonIndependent']['userIds'])
    blocked_logins = {login.lower() for login in trust['nonIndependent']['logins']}
    involved = {ident.get('id') for ident in ctx['identities']}
    if not ctx['identities_complete']:
        return []
    return sorted(login for uid, (state, login) in humans.items()
                  if state == 'APPROVED' and uid in allowed and uid not in blocked
                  and login.lower() not in blocked_logins
                  and uid != ctx['pr_author'].get('id') and uid not in involved)


def evaluate(ctx):
    head, files = ctx['head'], ctx['files']
    if not re.fullmatch(r'[0-9a-f]{40}', head or '') or not files:
        return False, 'Missing or invalid source identity or changed files.'
    if type((ctx.get('pr_author') or {}).get('id')) is not int:
        return False, 'Missing PR author identity.'
    risky = any(high_risk(path) for item in files for path in item_paths(item))
    if risky and ctx.get('auto_merge'):
        return False, 'High-risk change has auto-merge armed; disable it. High-risk PRs never auto-merge.'
    if not risky and all(routine_file(item) for item in files):
        return True, 'Routine plain-text notes only; required CI still applies.'
    if ctx['pr_author']['id'] == ctx['trust']['checkerApp']['botUserId']:
        return False, 'The checker App cannot be the PR author.'
    ctx = dict(ctx, risky=risky, expected_paths={item['filename'] for item in files})
    humans = human_review_state(ctx['reviews'], head)
    blockers = sorted(login for state, login in humans.values() if state == 'CHANGES_REQUESTED')
    if blockers:
        return False, f'Changes requested at this head by {", ".join(blockers)}.'
    outcome, reason = evaluate_ledger(ctx)
    if outcome == 'pass':
        return True, reason
    if outcome == 'block':
        # A blocking or broken checker record is not overridden by a human approval.
        return False, reason
    approvers = independent_approvers(humans, ctx)
    if approvers:
        return True, (f'Exact-head GitHub review APPROVED by {", ".join(approvers)}, listed as an '
                      'independent reviewer and distinct from the author and every pusher.')
    return False, (f'{reason} Sensitive or unknown paths require an exact-head PASS in the checker '
                   'App ledger, or an exact-head approval by a reviewer listed in checker-trust.json.')


SAFE_REPOSITORY = re.compile(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+')
SAFE_SHA = re.compile(r'[0-9a-f]{40}')
# Git allows more in a branch name; anything outside this set fails closed for the
# push-actor lookup rather than being spliced into a query string.
SAFE_REF = re.compile(r'[A-Za-z0-9][A-Za-z0-9._/-]{0,199}')


class UnsafeValue(ValueError):
    """A value from GitHub or the event cannot be placed in an API path or query."""


def safe_sha(value):
    if not isinstance(value, str) or not SAFE_SHA.fullmatch(value):
        raise UnsafeValue('Expected a 40-hex commit SHA.')
    return value


def safe_number(value):
    """A PR number from an event or API payload: a plain positive integer, nothing else."""
    if isinstance(value, bool):
        raise UnsafeValue('Expected a positive PR number.')
    if isinstance(value, int):
        number = value
    elif isinstance(value, str) and re.fullmatch(r'[1-9][0-9]{0,6}', value):
        number = int(value)
    else:
        raise UnsafeValue('Expected a positive PR number.')
    if not 1 <= number <= 9_999_999:
        raise UnsafeValue('Expected a positive PR number.')
    return number


def safe_ref_query(ref):
    """The URL-encoded value for ?ref=refs/heads/<branch>, or UnsafeValue."""
    if (not isinstance(ref, str) or not SAFE_REF.fullmatch(ref) or '..' in ref
            or ref.endswith(('/', '.lock')) or '//' in ref):
        raise UnsafeValue('Head branch name is outside the safe set.')
    return urllib.parse.quote(f'refs/heads/{ref}', safe='')


def safe_repository(value):
    if not isinstance(value, str) or not SAFE_REPOSITORY.fullmatch(value) or '..' in value:
        raise UnsafeValue('Invalid repository.')
    return value


MAX_LIST_ITEMS = 3000
MAX_LEDGER_RUNS = 1000
WORKFLOW_PATH = '.github/workflows/merge-review.yml'
DEFAULT_BRANCH_EVENTS = {'pull_request_target', 'issue_comment', 'schedule'}


def api(endpoint, payload=None, paginate=False):
    args = ['gh', 'api', endpoint]
    if paginate:
        args += ['--paginate', '--slurp']
    if payload is not None:
        args += ['--method', 'POST', '--input', '-']
    run = subprocess.run(args, input=None if payload is None else json.dumps(payload),
                         capture_output=True, text=True, timeout=90, check=True)
    return json.loads(run.stdout)


def api_list(endpoint, cap=MAX_LIST_ITEMS):
    """Every item of a paginated list endpoint, or a loud failure above the cap."""
    items = [item for page in api(endpoint, paginate=True) for item in page]
    if len(items) > cap:
        raise ValueError(f'More than {cap} items at {endpoint.split("?")[0]}; refusing to truncate.')
    return items


def api_check_runs(endpoint, cap=MAX_LEDGER_RUNS):
    """Every check run across pages of a check-runs listing; a short count fails closed."""
    pages = api(endpoint, paginate=True)
    runs = [run for page in pages for run in page.get('check_runs', [])]
    total = pages[0].get('total_count') if pages else 0
    if total != len(runs) or len(runs) > cap:
        raise ValueError('Incomplete or oversized check-run listing.')
    return runs


def routine_modes(repository, base, head, files):
    """Only the narrow routine class needs mode inspection. No source is executed."""
    if not all(item['filename'].startswith(('docs/notes/', 'docs/handovers/')) for item in files):
        return
    for revision in {head, base}:
        tree = api(f'repos/{repository}/git/trees/{revision}?recursive=1')
        if tree.get('truncated'):
            raise ValueError('Incomplete Git tree listing')
        modes = {entry['path']: entry['mode'] for entry in tree['tree']}
        for item in files:
            wanted = base if item['status'] == 'removed' else head
            if revision == wanted:
                item['mode'] = modes.get(item['filename'])


def push_identities(repository, pr, trust):
    """Authenticated push actors on the head branch, from the head repository's activity.

    Returns (identities, complete). Anything short of a non-empty, readable listing is
    incomplete, so no human approval counts.
    """
    if not trust['independentReviewers']['users']:
        return [], False  # Human path is off; skip the extra calls.
    try:
        ref = safe_ref_query(pr['head']['ref'])
        head_repo = safe_repository(((pr['head'].get('repo') or {}).get('full_name')))
        activity = api_list(f'repos/{head_repo}/activity?ref={ref}&per_page=100')
    except (UnsafeValue, ValueError, subprocess.SubprocessError, OSError):
        return [], False
    if not activity:
        return [], False
    return [{'id': (a.get('actor') or {}).get('id')} for a in activity], True


def collect_context(repository, number, pr, trust):
    """Classify and bind everything from the compare API at explicit base and head SHAs.

    /pulls/N/files follows the moving branch, so it is never used for classification.
    """
    head, base = safe_sha(pr['head']['sha']), safe_sha(pr['base']['sha'])
    compare = api(f'repos/{repository}/compare/{base}...{head}')
    files, commits = policy.comparison_complete(compare, pr['changed_files'])
    files = [dict(item) for item in files]
    routine_modes(repository, base, head, files)
    manifest = policy.build_manifest(compare, head)  # Raises for a binary or missing patch.
    comments = api_list(f'repos/{repository}/issues/{number}/comments?per_page=100')
    reviews = api_list(f'repos/{repository}/pulls/{number}/reviews?per_page=100')
    ctx = {'repository': repository, 'number': number, 'head': head, 'files': files,
           'comments': comments, 'reviews': reviews, 'auto_merge': pr.get('auto_merge'),
           'pr_author': pr['user'], 'trust': trust, 'ledger': [],
           'manifest_sha': policy.sha256(policy.canonical(manifest)),
           'manifest_paths': policy.manifest_paths(manifest), 'maker_vendors': [],
           'identities': [], 'identities_complete': False}
    if all(routine_file(item) for item in files):
        return ctx
    identities = [{'id': (c.get(role) or {}).get('id')} for c in commits for role in ('author', 'committer')]
    pushed, complete = push_identities(repository, pr, trust)
    ctx.update(identities=identities + pushed,
               identities_complete=complete and all(type(i['id']) is int for i in identities + pushed))
    if policy.app_configured(trust):
        app_id = safe_number(trust['checkerApp']['appId'])
        ctx['ledger'] = api_check_runs(f'repos/{repository}/commits/{head}/check-runs?check_name='
                                       f'{policy.RECEIPT_CHECK}&app_id={app_id}&filter=all&per_page=100')
        annotate_edit_history(comments, head, trust)
        try:
            ctx['maker_vendors'] = policy.maker_vendors(pr['head']['ref'], commits, trust)
        except policy.PolicyError:
            pass  # Unknown maker vendor: no checker PASS can qualify.
    return ctx


def own_run_id():
    value = os.environ.get('GITHUB_RUN_ID', '')
    return int(value) if re.fullmatch(r'[1-9][0-9]{0,19}', value) else None


def foreign_policy_checks(repository, head, own_check_id, default_branch):
    """Ids of other independent-review-policy check runs at this head not made by this workflow.

    Any workflow file in a same-repository PR runs as GitHub Actions (app 15368), the same
    app that writes this check, so a PR can add a job that posts its own success. Each run
    this gate writes names its workflow run in external_id; a run that does not resolve to
    the default-branch merge-review.yml is reported as foreign and fails this evaluation.
    It cannot stop a forged run written after this one; see docs/merge-review.md.
    """
    runs = api_check_runs(f'repos/{repository}/commits/{head}/check-runs?check_name={CHECK_NAME}'
                          '&filter=all&per_page=100')
    foreign, verified = [], {}
    for run in runs:
        if run.get('id') == own_check_id:
            continue
        match = re.fullmatch(r'merge-review:[0-9]+:[0-9a-f]{40}:([1-9][0-9]{0,19})', run.get('external_id') or '')
        if not match:
            foreign.append(run.get('id'))
            continue
        run_id = match.group(1)
        if run_id not in verified:
            workflow_run = api(f'repos/{repository}/actions/runs/{run_id}')
            # These events always run the default-branch file; a dispatch runs the file on
            # the ref it names. pull_request and review events run the PR's copy.
            event = workflow_run.get('event')
            trusted_event = (event in DEFAULT_BRANCH_EVENTS
                             or (event == 'workflow_dispatch' and workflow_run.get('head_branch') == default_branch))
            verified[run_id] = (workflow_run.get('path') == WORKFLOW_PATH and trusted_event
                                and (workflow_run.get('repository') or {}).get('full_name') == repository)
        if not verified[run_id]:
            foreign.append(run.get('id'))
    return foreign


def publish(repository, check_id, ok, summary):
    if type(check_id) is not int or check_id < 1:
        raise UnsafeValue('Unexpected check run id.')
    subprocess.run(['gh', 'api', f'repos/{repository}/check-runs/{check_id}', '--method', 'PATCH',
                    '--input', '-'], input=json.dumps({
                        'status': 'completed', 'conclusion': 'success' if ok else 'failure',
                        'output': {'title': CHECK_NAME, 'summary': summary}}),
                   capture_output=True, text=True, timeout=90, check=True)


def evaluate_pr(repository, number, trust_loader=None, event_head=None):
    """Evaluate one PR. Every failure after a head is known is published as a failing check.

    If the PR itself cannot be read, the head named by the triggering event (when there is
    one) still gets a failing check, so an earlier green result does not stand.
    """
    repository, number = safe_repository(repository), safe_number(number)
    trust_loader = trust_loader or policy.load_trust
    endpoint = f'repos/{repository}/pulls/{number}'
    try:
        pr = api(endpoint)
        if pr['state'] != 'open':
            return None
        head = safe_sha(pr['head']['sha'])
    except Exception as error:
        if not event_head:
            raise
        pr, head = None, safe_sha(event_head)
        reason = f'Could not read the PR ({type(error).__name__}); failing closed for this head.'
    run_id = own_run_id()
    check = api(f'repos/{repository}/check-runs', {
        'name': CHECK_NAME, 'head_sha': head, 'status': 'in_progress',
        'external_id': f'merge-review:{number}:{head}:{run_id or 0}'})
    ok, summary = False, 'Review evaluation failed closed.'
    try:
        if pr is None:
            summary = reason
        else:
            trust = trust_loader()
            ok, summary = evaluate(collect_context(repository, number, pr, trust))
            default_branch = (pr['base'].get('repo') or {}).get('default_branch') or 'main'
            foreign = foreign_policy_checks(repository, head, check.get('id'), default_branch)
            if foreign:
                ok, summary = False, (f'Foreign {CHECK_NAME} check runs at this head {foreign[:5]} were not '
                                      'written by the default-branch merge-review.yml; failing closed.')
            if safe_sha(api(endpoint)['head']['sha']) != head:
                ok, summary = False, 'PR head changed during evaluation; rerun for the new head.'
    except Exception as error:
        ok, summary = False, f'Review evaluation failed closed ({type(error).__name__}).'
    publish(repository, check.get('id'), ok, summary)
    return {'pr': number, 'head': head, 'passed': ok, 'summary': summary}


def last_evaluated(repository, item):
    """When the policy check last completed on this PR's head; '' if never."""
    head = safe_sha((item.get('head') or {}).get('sha'))
    listing = api(f'repos/{repository}/commits/{head}/check-runs?check_name={CHECK_NAME}&per_page=1')
    runs = listing.get('check_runs') or []
    return (runs[0].get('completed_at') or '') if runs else ''


def sweep_numbers(repository, budget=MAX_SWEEP_PRS):
    """All open PRs, least recently evaluated first. Recent activity cannot starve old PRs."""
    open_prs = api_list(f'repos/{repository}/pulls?state=open&per_page=100')
    ranked = sorted(open_prs, key=lambda item: (last_evaluated(repository, item), item.get('number', 0)))
    return [safe_number(item.get('number')) for item in ranked[:budget]]


def pr_numbers(repository, event):
    """PRs to evaluate for this event. Only default-branch triggers reach this code."""
    value = (event.get('pull_request', {}).get('number')
             or (event.get('issue', {}).get('number') if event.get('issue', {}).get('pull_request') else None)
             or event.get('inputs', {}).get('pr'))
    if value is not None:
        return [safe_number(value)]
    if 'schedule' in event:
        return sweep_numbers(repository)
    return []  # Ordinary issue comments are not PR review events.


def main():
    repository = safe_repository(os.environ['GITHUB_REPOSITORY'])
    with open(os.environ['GITHUB_EVENT_PATH'], encoding='utf8') as event_file:
        event = json.load(event_file)
    event_head = (event.get('pull_request') or {}).get('head', {}).get('sha')
    failures = 0
    for number in pr_numbers(repository, event):
        try:
            print(json.dumps(evaluate_pr(repository, number, policy.load_trust, event_head)))
        except Exception as error:  # One PR's failure must not stop the sweep.
            failures += 1
            print(json.dumps({'pr': number, 'error': type(error).__name__}))
    if failures:
        sys.exit(1)


if __name__ == '__main__':
    main()
