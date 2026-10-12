---
"@starlight-intelligence/core": patch
---

Redact Supabase secret keys before recall queries reach a provider and before memory enters returned context. Mask named Supabase server-key fields in nested contexts while preserving publishable keys and explicit host sanitization options.
