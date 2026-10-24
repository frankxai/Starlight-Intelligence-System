git reset --hard e036722345a5ca1347dc12d12c5067295403348c
cat << 'ENVE' > .env.example
ANTHROPIC_API_KEY=
GITHUB_TOKEN=
OPENROUTER_API_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=
NEO4J_URI=
NEO4J_USER=
NEO4J_PASSWORD=
MEM0_EMBEDDING_PROVIDER=
MEM0_LLM_PROVIDER=
MEM0_VECTOR_STORE=
MEM0_PGVECTOR_URL=
QDRANT_HOST=
QDRANT_PORT=
HUGGINGFACE_TOKEN=
STARLIGHT_CLOUD_URL=
STARLIGHT_API_KEY=
STARLIGHT_RESTIC_REPO=
STARLIGHT_RESTIC_PASSWORD_FILE=
STARLIGHT_VAULT_DIR=
STARLIGHT_SESSIONS_DIR=
STARLIGHT_AUDIT_DIR=
STARLIGHT_SECONDBRAIN_DIRS=
STARLIGHT_GIT_AUTO_COMMIT=
STARLIGHT_IDENTITY_REPO_ROOT=
ENVE
sed -i 's/\.env\.local/\.env\.local\n!\.env\.example/g' .gitignore
sed -i 's/export-specialist\.mjs <id> --print/export-specialist\.mjs <stable-id|profile-name> --print/g' AGENTS.md
sed -i 's/export-specialist\.mjs <id> --print/export-specialist\.mjs <stable-id|profile-name> --print/g' CLAUDE.md
sed -i 's/starlight init --vaults/node dist\/cli.js init --vaults/g' README.md
npm run build
npm run mesh:generate
git add -f .env.example
git add .gitignore README.md AGENTS.md CLAUDE.md context/empire/portfolio-mesh.json context/empire/portfolio-mesh.yaml
git commit -m "docs: fix documented commands in README and AGENTS and add .env.example"
