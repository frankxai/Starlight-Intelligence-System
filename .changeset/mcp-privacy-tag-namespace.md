---
'@starlight-intelligence/mcp': patch
---

Reject malformed privacy namespace separators in gateway results before projection,
including whitespace before the colon. Invalid privacy tags override public or
shareable tags.
