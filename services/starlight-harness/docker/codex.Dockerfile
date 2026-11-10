# Codex CLI in a sandbox, after Cloudflare's Codex guide for the Sandbox SDK (2026-10-22).
FROM node:24-trixie-slim
RUN apt-get update \
	&& apt-get install -y --no-install-recommends bash ca-certificates git ripgrep \
	&& rm -rf /var/lib/apt/lists/*
# Pinned: the CLI's flags and JSON events change between releases.
RUN npm install --global --ignore-scripts @openai/codex@0.156.1 && corepack enable
COPY --from=docker.io/cloudflare/sandbox:1.0.1 /usr/local/bin/sandbox-shim /usr/local/bin/sandbox-shim
WORKDIR /workspace
CMD ["sleep", "infinity"]
