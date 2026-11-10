# Claude Code in a sandbox, after Cloudflare's coding-agent runner guide (2026-10-22).
# Everything the agent needs is in the image; at run time it reaches only AI Gateway, GitHub and,
# when ALLOW_REGISTRIES is on, package registries for downloads.
FROM node:24-trixie-slim
RUN apt-get update \
	&& apt-get install -y --no-install-recommends bash ca-certificates git ripgrep \
	&& rm -rf /var/lib/apt/lists/*
# Pinned: Claude Code's flags and event format change between releases.
RUN npm install --global @anthropic-ai/claude-code@2.1.308 && corepack enable
COPY --from=docker.io/cloudflare/sandbox:1.0.1 /usr/local/bin/sandbox-shim /usr/local/bin/sandbox-shim
WORKDIR /workspace
CMD ["sleep", "infinity"]
