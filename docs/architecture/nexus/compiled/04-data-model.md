# Data and authority

Logical mapping only. Extend the owning repository's migrations and schemas.

```mermaid
erDiagram
  Organization ||--o{ Brand : owns
  Brand ||--o{ Project : scopes
  Project ||--o{ Decision : records
  Project ||--o{ ArtifactVersion : produces
  ArtifactVersion }o--o{ SourceRevision : cites
  Project ||--o{ LogicalOperation : admits
  LogicalOperation ||--o{ Attempt : retries
  LogicalOperation ||--o{ Settlement : reconciles
```

Keep legal entity, organization, brand, tenant, product, environment and provider account distinct. Composite foreign keys and server authorization must enforce scope. Retain original artifact revisions and source authority. Usage/settlement is append-only under existing platform contracts. A graph or chat summary is a projection. Specify retention, export, deletion and restore in the owning application before hosted admission.
