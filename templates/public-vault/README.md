# Public vault template

Copy this folder to `public-vault/` in **your** fork or repo, replace the
placeholders, then open a PR that adds one row to `vault-registry.json`.

The site at https://starlightintelligence.org/vaults reads the registry, then
fetches `{repo}/{path}/profile.json` and `{path}/{category}.jsonl`.

Slugs are people (`/vaults/ada`), not vault names. `/vaults/horizon` will 404.

## Checklist

1. Edit `profile.json` — your name, bio, avatar.
2. Add entries to the six JSONL files. Horizon is the letters-to-the-future file.
3. Keep local `~/.starlight/` out of this folder.
4. Register:

```json
{
  "slug": "your-slug",
  "name": "Your Name",
  "repo": "you/your-repo",
  "path": "public-vault",
  "avatar": "https://github.com/you.png",
  "bio": "One line"
}
```

5. PR title: `vault: add {slug}`
6. Validate: `node scripts/validate-public-vault.mjs`

Mark signed future-facing Horizon entries `"benediction": true` if they should
also appear on https://starlightintelligence.org/benediction.

Empty category files are fine. One honest Horizon line is better than six
thin files.
