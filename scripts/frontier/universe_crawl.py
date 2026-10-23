#!/usr/bin/env python3
"""GitHub universe crawl (metadata only, no cloning).

Sweep 1: global top-by-stars, descending windows of `stars:<=S` (10 pages x 100 each).
Sweep 2: AI-relevant topics, recently pushed, stars>=MIN.
Sweep 3: OSS Insight trending (velocity signal).
Writes compact JSONL to repos.jsonl (deduped by full_name, union of discovery sources).
Unauthenticated GitHub search: 10 req/min -> sleep between requests; honors rate-limit reset.
"""
import json, os, sys, time, urllib.request, urllib.parse, urllib.error

OUT = os.path.join(os.path.dirname(__file__), "repos.jsonl")
LOG = os.path.join(os.path.dirname(__file__), "crawl.log")
TARGET_GLOBAL = int(os.environ.get("TARGET_GLOBAL", "15000"))
TOPIC_MIN_STARS = int(os.environ.get("TOPIC_MIN_STARS", "300"))
PUSHED_SINCE = os.environ.get("PUSHED_SINCE", "2026-04-01")
SLEEP = float(os.environ.get("SLEEP", "6.5"))
TOPICS = ["llm", "ai-agents", "agents", "agent", "agentic-ai", "multi-agent", "mcp", "model-context-protocol",
          "mcp-server", "rag", "retrieval-augmented-generation", "generative-ai", "langchain", "llmops", "evals",
          "llm-evaluation", "inference", "llm-inference", "local-llm", "vector-database", "knowledge-graph",
          "memory", "browser-automation", "coding-agent", "claude-code", "codex", "ai-sdk", "generative-ui",
          "workflow-engine", "durable-execution", "sandbox", "observability", "llm-observability", "fine-tuning",
          "diffusion", "text-to-video", "speech", "voice-assistant", "computer-use", "prompt-injection"]

repos = {}

def log(msg):
    with open(LOG, "a") as f:
        f.write(time.strftime("%H:%M:%S ") + msg + "\n")

def get(url, attempts=6, timeout=40):
    for attempt in range(attempts):
        req = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json",
                                                   "User-Agent": "starlight-frontier-ledger/0.1"})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            if e.code in (403, 429):
                reset = e.headers.get("X-RateLimit-Reset")
                wait = max(10, int(reset) - int(time.time()) + 2) if reset else 60
                log(f"rate limited {e.code}; sleeping {wait}s")
                time.sleep(min(wait, 120))
                continue
            if e.code == 422:
                log(f"422 for {url}")
                return None
            log(f"HTTP {e.code} for {url}; retry")
            time.sleep(10)
        except Exception as e:  # network hiccup
            log(f"error {e!r}; retry")
            time.sleep(10)
    return None

def compact(it, source):
    lic = (it.get("license") or {}).get("spdx_id")
    return {"full_name": it["full_name"], "description": (it.get("description") or "")[:300],
            "stars": it.get("stargazers_count", 0), "forks": it.get("forks_count", 0),
            "language": it.get("language"), "topics": it.get("topics", [])[:20], "license": lic,
            "created_at": it.get("created_at"), "pushed_at": it.get("pushed_at"),
            "archived": it.get("archived", False), "open_issues": it.get("open_issues_count", 0),
            "homepage": (it.get("homepage") or "")[:200], "sources": [source]}

def add(it, source):
    r = repos.get(it["full_name"])
    if r is None:
        repos[it["full_name"]] = compact(it, source)
    elif source not in r["sources"]:
        r["sources"].append(source)

def flush():
    tmp = OUT + ".tmp"
    with open(tmp, "w") as f:
        for r in repos.values():
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    os.replace(tmp, OUT)

def search(q, pages=10, source="global"):
    n_items, last_min = 0, None
    for page in range(1, pages + 1):
        url = "https://api.github.com/search/repositories?" + urllib.parse.urlencode(
            {"q": q, "sort": "stars", "order": "desc", "per_page": 100, "page": page})
        data = get(url)
        time.sleep(SLEEP)
        if not data or not data.get("items"):
            break
        for it in data["items"]:
            add(it, source)
            n_items += 1
            last_min = it.get("stargazers_count", last_min)
        if len(data["items"]) < 100:
            break
    return n_items, last_min

def sweep_global():
    upper = None
    while True:
        global_count = sum(1 for r in repos.values() if "global" in r["sources"])
        if global_count >= TARGET_GLOBAL:
            break
        q = "stars:>=1000" if upper is None else f"stars:1000..{upper}"
        n, last_min = search(q, source="global")
        log(f"global q={q} items={n} last_min={last_min} total_global={global_count}")
        flush()
        if not n or last_min is None or last_min <= 1000:
            break
        upper = last_min  # ties at boundary are deduped

def sweep_topics():
    for t in TOPICS:
        q = f"topic:{t} stars:>={TOPIC_MIN_STARS} pushed:>={PUSHED_SINCE}"
        n, _ = search(q, source=f"topic:{t}")
        log(f"topic {t} items={n} total={len(repos)}")
        flush()

def sweep_trending():
    for period in ("past_week", "past_month", "past_3_months"):
        data = get(f"https://api.ossinsight.io/v1/trends/repos/?period={period}&language=All", attempts=2, timeout=20)
        rows = (((data or {}).get("data") or {}).get("rows")) or []
        for row in rows:
            name = row.get("repo_name")
            if not name:
                continue
            r = repos.get(name)
            tag = f"trending:{period}"
            if r is None:
                repos[name] = {"full_name": name, "description": (row.get("description") or "")[:300],
                               "stars": int(row.get("stars") or 0), "forks": int(row.get("forks") or 0),
                               "language": row.get("primary_language"), "topics": [], "license": None,
                               "created_at": None, "pushed_at": None, "archived": False, "open_issues": 0,
                               "homepage": "", "sources": [tag], "trend_score": row.get("total_score")}
            else:
                if tag not in r["sources"]:
                    r["sources"].append(tag)
                r["trend_score"] = row.get("total_score")
        log(f"trending {period} rows={len(rows)}")
        flush()

if __name__ == "__main__":
    log("start")
    sweep_topics()
    sweep_global()
    sweep_trending()
    flush()
    log(f"done total={len(repos)}")
