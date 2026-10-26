# Second Brain for Builders: community strategy, goals and roadmap

Status: proposal for Frank's decision. Written 2026-10-26. Sources are listed at the end; claims from vendor pages are marked as such.

## 1. The bet in one paragraph

Frank's stated mission is to help people build their own systems. The most useful thing a community can get from Starlight is a second brain that is theirs: plain Markdown plus git on their own machine, with a pipeline that refuses to write unsupported claims. Starlight already has the part nobody else in the survey has: a hard VERIFY gate (citation, contradiction, lens framing, privacy) and signed review receipts. The plan is to package that as an installable kit, prove it on Frank's own vault in public, and add a paid hosted tier only after people use the free one.

Assumption to confirm: "my community" here means builders and creators who follow Frank (FrankX, Arcanea, Starlight) and want their own agent memory. If it means a different group, sections 3 and 5 change.

## 2. What the field does (evidence)

| Who | Approach | Lesson for us |
| --- | --- | --- |
| Obsidian | Free core. Revenue comes from optional services that have free alternatives: Sync (reported $4 to $8 a month) and Publish. Community plugins carry extensibility. No outside funding, per public accounts. | Charge for convenience, never for access to your own notes. Plugin authors are the moat. |
| Mem0 | Open source (Apache-2.0) plus hosted tiers metered per memory add and per retrieval. Reported tiers: free 10,000 adds a month, $19, $249. | Metering by operation is understandable and cheap to start. |
| Mem0, Zep, Letta (benchmarks) | One review states every headline score is vendor-run and cites an independent figure of 49.0 against a self-reported 94.4 for one system on LongMemEval. | Do not publish a benchmark number. Publish a method people can run on their own data. |
| Letta | Agent runtime with tiered memory. Reported $10M seed. | Asking users to adopt a runtime is a heavy ask. A kit that works inside the agent they already use is lighter. |
| claude-obsidian (15.8k stars), obsidian-second-brain (4.9k), obsidian-mind (5.4k) | Two-command install through the Claude plugin marketplace, role presets, short demos, multi-agent support (Claude, Codex, Cursor, others), "works without Obsidian". The newest of these credits outside contributors in its changelog. | Install in two commands, ship presets, support more than one agent, and credit contributors in public. |
| OpenViking, Hindsight, hippo-memory | Layered summaries, retain/recall/reflect, recall-strengthened memories that decay when wrong. | Technique source for the roadmap, not competitors to copy wholesale. |

## 3. Where Starlight wins and where it does not

Wins:
- Verified synthesis. Every written insight carries citations and a SIP attestation, and verdict-shaped language is rejected. No surveyed repo documents an equivalent gate.
- Local-first and private by default. `private/` is never indexed or pushed. Embeddings stay local.
- Receipts. Independent review on the exact commit is already enforced on our own repos.

Does not win today:
- Install friction. The pipeline lives across several skills and a 150-agent repo. A newcomer cannot install it in two commands.
- Visible proof. The reflection engine was silent for 3.5 months and nobody could see it.
- Reach. The surveyed repos are found by stars and demos. We have neither for this.

## 4. Product shape

Open core, three layers.

1. Starlight Second Brain Kit (free, MIT): a Claude Code plugin with capture, distill, connect, reflect, verify, lint and surface, vault templates, three role presets, and the index builder (SIS PR #505). Works on a plain folder; Obsidian optional.
2. Atlas (Frank only at first): private web view of the vault on Cloudflare. Vite React app plus a Hono Worker, D1 with full-text search, Access in front. Frank, his two machines and his agents get one read surface with no localhost. Details in the Second Brain Atlas page.
3. Hosted member tier (decision gate, not a commitment): a paid per-member Atlas. It needs real member sign-in, because Cloudflare Access fits staff and machines, not paying members. D1 allows 50,000 databases per paid account, so one database per member is possible. Price by operation or by vault, like Mem0 and Obsidian, never by access to notes.

Technology stance: Markdown and git are the source of truth; everything hosted is a rebuildable index. This keeps exit free for members, which is the same promise Obsidian's model rests on.

## 5. Community model

- Home: GitHub Discussions on the Kit repo first. Move to a platform such as Circle only if Discussions stops being enough. Frank has a Circle connection available; whether a Circle space already exists was not checked.
- Contribution surface: presets, playbooks (a skill with named gates, an owner and a receipt path) and eval packs. Each ships with its own eval before it enters the default install, which matches the estate rule for new skills.
- Public proof: one monthly teardown of Frank's own reflection run, including what the VERIFY gate rejected and why. Failures are the content.
- Credit: contributors named in the changelog every release.

Guardrails: no income promises anywhere (FTC action on "AI income" claims is already noted in the estate memory); no auto-posting; the dpi site stays free of community and funnel mechanics per its charter; nothing from `private/` or `oracle-work/` ever appears in examples.

## 6. Goals and measures

Measures are things we can count. Thresholds marked "proposed" are Frank's to set.

| Goal | Measure | Target |
| --- | --- | --- |
| Foundations trustworthy | Nightly reflect runs logged with exit 0 on consecutive nights | 14 nights (proposed) |
| Kit installable | A person who has never seen the repo completes install, save and find without help | 5 of 5 dogfood testers (proposed) |
| Honest evaluation | Eval method published, run on Frank's own vault, result file committed | 1 method, 1 result |
| Real use | Unprompted installs outside Frank's machines | Count reported monthly, no target until baseline exists |
| Community health | Merged outside contributions (preset, playbook or eval) | First one by end of phase 3 |

## 7. Roadmap

Phase 0, foundations (now, 1 to 2 weeks)
- Merge SIS #500, #501, #505 after review receipts. Confirm two nights of reflect logs.
- Add `factClass` to SIS entries and a `lint` stage to starlight-sb.
- Fix open Codex CHANGES PRs and failing-CI PRs listed in the 2026-10-26 handoff.
- Gate: Frank merges.

Phase 1, Kit v0.1 (weeks 2 to 6)
- Package the plugin: two-command install, `/sb setup`, three role presets (builder, creator, researcher).
- Per-folder L0/L1 summaries so agents scan before they read.
- Demo recording on a synthetic vault. Never the real one.
- Gate: five dogfood testers pass the install-save-find run.

Phase 2, Atlas (weeks 4 to 8, parallel)
- Scaffold the private repo, Worker, D1 load from `atlas.sql`, Access policy, four views: graph, today, reflections, stale queue.
- Gate: Frank creates D1, route and Access policy; visual QA at phone, tablet and desktop widths before it is shown.

Phase 3, community opens (weeks 8 to 12)
- Public Kit repo, Discussions, contribution guide, first monthly teardown.
- Gate: Frank decides public or private for the repo and approves the first post.

Phase 4, hosted tier decision (after week 12)
- Choose member auth, tenancy model and pricing unit. Run a legal and privacy check for storing other people's notes.
- Kill criterion (proposed): if installs and contributions stay at baseline after two teardowns, stay free and local, and do not build the hosted tier.

## 8. Risks

- Hosting other people's notes creates privacy and compliance duties that a local kit does not.
- Verified output is slower than unverified output; the pitch must show why that is worth it.
- Competing with funded memory vendors on benchmarks is a losing game; avoid it.
- A bus-factor of one: the kit must run without Frank's machines and without Frank's private skills.

## 9. Decisions needed from Frank

1. Confirm who "the community" is.
2. Public MIT kit repo: yes or no.
3. Discussions first, or an existing Circle space.
4. Pricing stance for a future hosted tier: operation-metered or flat.
5. Whether to create a GitHub Project board from section 7.

## 10. Absorb, build, or skip

| Capability | Decision | Why |
| --- | --- | --- |
| Index and full-text search | Built (starlight-atlas) | FTS5 is enough for a vault of this size; the BM25-first idea from hippo-memory fits our no-cloud-embeddings rule. |
| MCP interface | Adopt the standard | Built on the official SDK, five read-only tools, stdio and HTTP. |
| Memory extraction with add, update, delete, no-op decisions (Mem0 style) | Absorb the technique into distill and connect | It must run behind the VERIFY gate, so we cannot take their pipeline whole. |
| Temporal graph database (Zep, Graphiti) | Skip the database, absorb validity windows | A graph server is heavy for one person. SIS already has `validUntil`. |
| Layered summaries L0, L1, L2 (OpenViking) | Absorb | Cheap, and it cuts what agents read. |
| Retain, recall, reflect vocabulary (Hindsight) | Align names | Our REFLECT already does the third. Shared words help newcomers. |
| Two-command plugin install, presets, demos | Copy the pattern | This is what drove stars for the Obsidian-plus-Claude repos. |
| Rich editor or note app | Skip | Obsidian is the editor. Stay compatible with a plain folder. |
| Hosted vector search | Skip for now | Vault rule: embeddings stay local. |

## 11. Moat, stated honestly

Not moats: search, MCP, a graph view, a dashboard. Others ship these free.

Moats, in order of strength:
1. Verified synthesis with receipts. A claim is written only with citations, lens framing and an independent review on the exact commit. That is trust, and trust is slow to copy.
2. A living public proof. Frank's own vault, reflection runs and rejected candidates, shown monthly. A competitor cannot fake years of real use.
3. Exit-free by design. Markdown and git are the source; every hosted piece is a rebuildable index. This lowers the cost of trying us and raises the cost of leaving a competitor that locks data in.
4. Estate integration. The same notes feed agents, playbooks and SIS vaults across two machines.
5. Contributed presets, playbooks and eval packs, once a community exists.

## 12. What we productize

| Offer | For | Price idea (proposed, not decided) |
| --- | --- | --- |
| Second Brain Kit | Any builder | Free, MIT if the licence decision is yes |
| Atlas Personal | One person who wants a hosted private view and MCP endpoint | Flat monthly, one vault |
| Atlas for Teams | A small team sharing a vault with roles and review receipts | Per seat, billed through Polar as merchant of record |
| Verified Reflections | People who want the weekly reflection with attestation without running it | Subscription |
| Estate engagement | Custom builds | Existing offer, now with the Kit as the starting point |

## 13. This week (Mon 2026-10-26 to Sun 2026-11-01)

State at the start of this section: the Atlas package exists and passes 19 tests (search, links, five read-only MCP tools over stdio and HTTP, Access JWT check). It has not been deployed and the Worker config has not been validated with wrangler.

| Day | Outcome | Needs Frank |
| --- | --- | --- |
| Mon | Project board created. Atlas core, MCP and API built and tested. Reflect task enabled; first run 01:30 Tuesday. | Decide where the Atlas repo lives. Review receipts on #500, #501, #505, #506. |
| Tue | Atlas repo live. Kit plugin skeleton passes `claude plugin validate`. `/sb setup` creates a vault folder. Reflect log checked. | Approve repo. |
| Wed | Atlas web app v0 (graph, search, today, stale queue), visual QA at three widths. Worker deployed to a preview URL. | Create the D1 database, Access application and service token (about ten minutes). |
| Thu | Fact class, lint stage and L0/L1 summaries merged. MCP over HTTP verified from the second machine with a service token. | Merge after receipts. |
| Fri | Two dogfood runs of install, save, find, recorded. Eval method written and run on Frank's vault. | Pick the testers. |
| Sat to Sun | First teardown drafted. Hosted-tier questions listed for the Phase 4 decision. | Approve any post. |

Rule for the week: nothing counts as done until a test, a run or a screenshot shows it. GitHub Actions minutes are exhausted, so checks run locally and the output is pasted into the PR.

## Sources

- GitHub topic searches and READMEs, 2026-10-26: claude-obsidian, obsidian-mind, obsidian-second-brain, llm-wiki-agent, OpenViking, Hindsight, Honcho, hippo-memory, okf-agent-memory, OpenKnowledge, Quartz, Mem0.
- Obsidian pricing and model: Robin Landy's pricing analysis; public posts by Obsidian's CEO. Third-party, not Obsidian financials.
- Mem0, Letta, Zep comparison and pricing: Digital Applied review (2026-08-04) and vectorize.io comparison. Vendor and reviewer claims, not independently verified here.
- Cloudflare: D1 limits page and Access JWT validation page, read 2026-10-26; vinext README for Next.js on Workers.
