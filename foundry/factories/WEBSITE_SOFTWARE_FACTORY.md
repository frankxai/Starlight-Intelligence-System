# Website software factory

Observed 2026-10-16. The machine contract is `website-surfaces.json`. This page is the operating plan. A green check is not a production deploy.

```bash
node tools/foundry/website-factory.mjs check
node tools/foundry/website-factory.mjs list
node tools/foundry/website-factory.mjs prompt org-explorer local
```

## The job

Each Starlight website gets one fleet and one SDLC. The fleet starts from a customer workflow, names the product it has to beat, and stops before payment, a merge, or a second claim on a host.

The factory has to beat three current alternatives:

- A person plus GitHub and Vercel, with the rules kept in chat history.
- Port's agentic SDLC portal, which is a registry and a tool scope wrapped as a product.
- Harness Cosmos and Warp, which turn a ticket into a pull request in a remote sandbox.

What we take from them, checked on 2026-10-16: one versioned registry, tools scoped to the role, one task in one branch, a human merge, and a spend cap. Ramp's Inspect write-up from the same week is the argument for a sandbox that dies with the task. This PC had about 70 GiB free, so that sandbox is not local.

What we do not take: a purchased control plane, a piped installer, or a maker who merges their own production pull request.

## Surfaces

| Id | Host | Repo observed | Who may claim the host |
|---|---|---|---|
| org-explorer | starlightintelligence.org | This repo, `site/`, branch `agent/grok/website-software-factory` | This repo. Vercel project `starlight-explorer`, no required env vars. |
| ai-platform | starlightintelligence.ai | `starlight-intelligence-web`, Codex branch, upstream was gone | This repo only. |
| ai-front-door | starlightintelligence.ai | `starlightintelligence.ai`, Hermes branch | Nobody, until a preview review and a human domain cutover. |
| academy-lab | starlightintelligence.academy | `starlight-intelligence-academy`, Codex branch | That repo. Waitlist. |
| domains-audit | starlight.domains | `starlight-domains`, checked out on main | That repo, from a new branch. |
| you-charter | starlight.you | `starlight-you`, Claude branch | That repo. No account. |
| technology-sheets | starlight.technology | `starlight-technology`, Hermes branch | That repo. Sources or the row fails. |

Human Roster is a second offer on `starlightintelligence.ai`. It stays on the ai-platform record. It is UNGATED, waitlist only, and person-level scraping stays out of scope. It does not get a second website.

Visual Creation Loop on `.org` failed its gate on 2026-08-05. The public Explorer can still be reviewed and merged. The pack cannot be sold.

Knowledge Tree has a G1 pass from 2026-09-09. The waitlist stays. G1 is not permission to take payment.

## Fleet

Every surface has six seats. Customer, sentinel, and reviewer do not write. The reviewer harness is never the maker harness.

- Customer holds the workflow and the incumbent. They catch a page that sounds finished and does not do the job.
- Design holds type, width, motion, and the brand that already exists.
- Platform holds the real stack: Next, Vercel, Clerk, Supabase, Blob, or a browser-only export.
- Sentinel holds secrets, private memory, force-push, and payment.
- Maker holds one slice on `agent/<harness>/<scope>`.
- Reviewer holds the no.

Genius here means the seat is good at one judgment. It does not mean a larger prompt.

## SDLC

1. Customer-job. Write the workflow and two incumbents before editing.
2. Specify. Name the contract, the fail-closed switch, and the proof.
3. Make. One branch, the repo's own check, no install fanout while disk is TIGHT.
4. Independent review. A different harness. A fail is a fail.
5. Ship-hold. Draft pull request. `deployNow` is false in the registry until a person who did not write the patch merges it.

Checkout on a priced surface is `waitlist-only`. The charter site and the unassigned front door use `none`.

## Launch

Local, now, on this branch:

```bash
node tools/foundry/website-factory.mjs prompt org-explorer local
```

That prompt may edit `site/` only when a contract test is the work. The other six prompts are read-only until their checkouts are free.

Cloud, later, one surface at a time, under the printed spend cap. The cloud prompt still includes the hold line. A cloud agent that opens a pull request does not merge it and does not turn on a payment provider.

Do not start seven cloud agents in one go. The held checkouts are the constraint, not the idea.

## Production this pass

Shipped here: the registry, the checker, and the tests. Not shipped: a production deploy of any of the seven sites. Five repos are on another harness's branch, `starlight-domains` is on main, and every priced offer is still waitlist or an unpaid public Explorer.

Next production slice, in order:

1. Keep this factory green and merge it through review.
2. When Codex releases `starlight-intelligence-web`, run the Memory Studio recovery prompt and open a draft PR.
3. When Hermes releases the front-door repo, close the open visual QA. Leave DNS alone.
4. Encode the same host-collision rule in `starlight-domains` on a new branch, so the public audit matches this file.
5. Academy, you, and technology each get one failing test of their customer job. None of them get a checkout button.

Antigravity's branch `agent/antigravity/model-arena-r6-argon-20261014` was left on origin. This checkout moved to `agent/grok/website-software-factory` from `origin/main` because disk was too tight for a second worktree.
