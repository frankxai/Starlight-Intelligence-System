---
name: Feature request
about: Suggest something that would make cockpit better
labels: enhancement
---

**Problem:**

[What workflow is awkward today? Be specific about what you're trying to do.]

**Proposed solution:**

[What would the ideal API/command/behavior look like? Pseudo-shell or pseudo-code is fine.]

**Alternatives considered:**

[Why not just <existing-mechanism>? Why does this need to live in cockpit specifically?]

**Scope:**

- [ ] Pure read-only (no schema changes, no settings.json modification)
- [ ] Adds optional field to existing v1 schema (backward compatible)
- [ ] Bumps a schema to v2 (requires migration)
- [ ] Modifies install / hooks / settings.json (high blast radius)
- [ ] Adds new external dependency

**Non-goals:**

[What this PR/feature explicitly should NOT try to solve. Keeps scope honest.]
