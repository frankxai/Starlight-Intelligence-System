"""Shared trust, vendor and manifest rules for checker_runner.py and merge_review_gate.py.

Both tools load this from the trusted default-branch checkout, so a PR cannot change the
rules it is judged by. Every function here is pure and fails closed by raising PolicyError.
"""
import hashlib
import json
from pathlib import Path
import re

TRUST_PATH = Path(__file__).resolve().parent / 'checker-trust.json'
MARKER = 'STARLIGHT-INDEPENDENT-REVIEW-V1\n'
RECEIPT_CHECK = 'independent-review-receipt'
MAX_FILES = 300
MAX_COMMITS = 250
MAX_PATCH_BYTES = 300_000
TRAILER = re.compile(r'^(co-authored-by|signed-off-by|generated-by|assisted-by|made-with)\s*:\s*(.+)$',
                     re.I | re.M)


class PolicyError(Exception):
    """The evidence cannot be judged safely; callers fail closed."""


def load_trust(path=TRUST_PATH):
    with open(path, encoding='utf8') as handle:
        trust = json.load(handle)
    app = trust['checkerApp']
    denied = trust['deniedApps']
    if app['appId'] is not None:
        if (type(app['appId']) is not int or type(app['botUserId']) is not int
                or app['appId'] in denied['ids'] or app['slug'] in denied['slugs']
                or not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,33}', app['slug'])):
            raise PolicyError('checker-trust.json names an invalid or denied checker App.')
    for user in trust['independentReviewers']['users']:
        if type(user.get('id')) is not int or user['id'] in trust['nonIndependent']['userIds']:
            raise PolicyError('checker-trust.json lists a non-independent reviewer.')
    return trust


def app_configured(trust):
    return trust['checkerApp']['appId'] is not None


def app_authored(item, trust):
    """True only for a comment the checker App wrote with its own installation token.

    A user-to-server token of the same App keeps the human author, so the author must be
    the App's bot account, matched by numeric id, not by a slug or login an admin can mint.
    """
    app = trust['checkerApp']
    via = item.get('performed_via_github_app') or {}
    user = item.get('user') or {}
    return (app_configured(trust) and via.get('id') == app['appId']
            and user.get('id') == app['botUserId'] and user.get('type') == 'Bot'
            and user.get('login') == f"{app['slug']}[bot]")


def check_run_by_app(run, trust):
    app = trust['checkerApp']
    return app_configured(trust) and (run.get('app') or {}).get('id') == app['appId']


def vendor_of(seat, trust):
    return trust['seatVendors'].get(seat)


def maker_from_branch(ref, trust):
    match = re.fullmatch(r'agent/([a-z0-9-]+)/[A-Za-z0-9._/-]+', ref or '')
    return trust['branchHarnesses'].get(match.group(1)) if match else None


def identity_text(user, git_person):
    user = user or {}
    git_person = git_person or {}
    return ' '.join(str(v) for v in (user.get('login'), git_person.get('name'), git_person.get('email')) if v)


def maker_vendors(ref, commits, trust):
    """Every vendor the change claims or shows: branch seat plus commit trailers and authors.

    The branch name is only a claim, so a Grok-made commit on agent/claude/x yields
    {anthropic, xai}. An agent marker with no known vendor makes independence unprovable.
    """
    seat = maker_from_branch(ref, trust)
    if seat is None or vendor_of(seat, trust) is None:
        raise PolicyError('Head branch is not agent/<harness>/<scope> for a harness with a known vendor.')
    vendors = {vendor_of(seat, trust)}
    patterns = {vendor: re.compile(rx, re.I) for vendor, rx in trust['vendorPatterns'].items()}
    unknown = re.compile(trust['unknownAgentPattern'], re.I)
    for item in commits:
        commit = item.get('commit') or {}
        texts = [value for _, value in TRAILER.findall(commit.get('message') or '')]
        texts.append(identity_text(item.get('author'), commit.get('author')))
        texts.append(identity_text(item.get('committer'), commit.get('committer')))
        for text in texts:
            hits = {vendor for vendor, rx in patterns.items() if rx.search(text)}
            if not hits and unknown.search(text):
                raise PolicyError('A commit names an agent whose model vendor is unknown; use a human review.')
            vendors |= hits
    return sorted(vendors)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))


def sha256(text):
    return hashlib.sha256(text.encode()).hexdigest()


def comparison_complete(compare, changed_files):
    files, commits = compare.get('files') or [], compare.get('commits') or []
    if len(files) != changed_files or changed_files > MAX_FILES:
        raise PolicyError('Compare API file list is incomplete or over the 300-file cap.')
    if compare.get('total_commits') != len(commits) or len(commits) > MAX_COMMITS:
        raise PolicyError('Compare API commit list is incomplete or over the 250-commit cap.')
    return files, commits


def build_manifest(compare, head):
    """Bind a review to exact content: head, merge base, and each file's blob and patch hash.

    Built from the compare API at explicit SHAs, so a force-push to another commit while
    collecting cannot swap the content behind a recorded head SHA.
    """
    entries = []
    for item in compare.get('files') or []:
        if not isinstance(item.get('patch'), str):
            raise PolicyError(f"{item.get('filename')!r} has no textual patch (binary or too large); "
                              'use a human review.')
        entries.append({'path': item['filename'], 'previousPath': item.get('previous_filename'),
                        'status': item.get('status'), 'blobSha': item.get('sha'),
                        'patchSha256': sha256(item['patch'])})
    entries.sort(key=lambda entry: entry['path'])
    merge_base = (compare.get('merge_base_commit') or {}).get('sha')
    if not entries or not merge_base:
        raise PolicyError('Comparison has no files or no merge base.')
    return {'headSha': head, 'mergeBaseSha': merge_base, 'files': entries}


def manifest_paths(manifest):
    return [entry['path'] for entry in manifest['files']]
