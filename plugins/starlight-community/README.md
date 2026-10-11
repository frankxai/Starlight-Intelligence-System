# Starlight community

A workflow skill for three to five builders to choose a weekly quest, make an artifact,
help each other, and close the week with a reflection.

Ask: “Help our creation cell choose one useful artifact for this week, with a realistic
commitment and a Friday reflection.” The skill returns a quest card, commitments to
confirm, evidence review, and next-week queue using the bundled template.

The package contains one skill and its reference template. It has no MCP server,
credentials, background jobs, or platform connection. It drafts actions for review.
Source validation does not establish connected-host testing or marketplace publication.

For contributors implementing a platform adapter, see the repository's
[community kernel](../../docs/community/README.md). Its TypeScript runtime is a
separate repository library; this skills-only package does not bundle it.

Built on SIP — Starlight Intelligence Protocol v1.1.1. Canon: none.
