#!/usr/bin/env bash
# Starlight Intelligence System (SIS) — One-Line Installer for Unix/macOS
# Usage: curl -fsSL https://starlightintelligence.org/install.sh | bash

set -e

echo "✨ Initializing Starlight Intelligence System (SIS)..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js (v18+) is required. Please install Node.js first."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✓ Found Node.js ${NODE_VERSION}"

# Check Git
if ! command -v git &> /dev/null; then
    echo "❌ Git is required. Please install Git first."
    exit 1
fi

INSTALL_DIR="${HOME}/.starlight/system"

if [ -d "$INSTALL_DIR" ]; then
    echo "🔄 Updating existing Starlight installation at ${INSTALL_DIR}..."
    cd "$INSTALL_DIR"
    git pull --quiet
else
    echo "📦 Cloning Starlight Intelligence System..."
    mkdir -p "${HOME}/.starlight"
    git clone --quiet https://github.com/frankxai/Starlight-Intelligence-System.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

echo "⚙️ Building Starlight Core & Memory Substrate..."
npm install --quiet
npm run build --quiet || true

echo "🚀 Starlight Intelligence System initialized successfully!"
echo ""
echo "Quick Start Commands:"
echo "  npx starlight init         # Initialize .starlight in current project"
echo "  npx starlight status       # Inspect memory vaults and daemon posture"
echo "  npx starlight guidance     # Generate agent session context guidance"
echo ""
echo "Built on SIP v1.1.1 — Starlight Sovereign Substrate."
