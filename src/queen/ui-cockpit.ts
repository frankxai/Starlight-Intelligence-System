import { QueenSovereignStateSnapshot } from './sovereign-engine';

export function renderQueenCockpitHtml(initialState: QueenSovereignStateSnapshot): string {
  const serializedState = JSON.stringify(initialState).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Starlight Queen — Sovereign Superintelligence Cockpit</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-void: #0a0a0b;
      --bg-elevated: #111114;
      --bg-interactive: #18181c;
      --bg-glass: rgba(17, 17, 20, 0.84);
      --text-primary: #f4f4f6;
      --text-secondary: #a1a1aa;
      --text-muted: #71717a;
      --accent-emerald: #10b981;
      --accent-cyan: #06b6d4;
      --accent-amber: #f59e0b;
      --accent-danger: #ef4444;
      --border-hairline: rgba(255, 255, 255, 0.08);
      --border-active: rgba(16, 185, 129, 0.45);
      --font-display: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-void);
      color: var(--text-primary);
      font-family: var(--font-sans);
      font-size: 14px;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    :focus-visible {
      outline: 2px solid var(--accent-cyan);
      outline-offset: 2px;
    }

    .mono {
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
    }

    /* Top Telemetry Bar */
    .topbar {
      position: sticky;
      top: 0;
      z-index: 40;
      background: var(--bg-glass);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-hairline);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .brand-cluster {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .pulse-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: var(--accent-emerald);
      box-shadow: 0 0 12px var(--accent-emerald);
    }

    .brand-title {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 17px;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }

    .brand-badge {
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: var(--accent-emerald);
    }

    .telemetry-strip {
      display: flex;
      align-items: center;
      gap: 18px;
      flex-wrap: wrap;
    }

    .stat-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .stat-pill strong {
      font-family: var(--font-mono);
      color: var(--text-primary);
      font-weight: 600;
    }

    /* Main Workspace Layout */
    .shell {
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
      padding: 24px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Hero Banner */
    .hero-panel {
      background: var(--bg-elevated);
      border: 1px solid var(--border-hairline);
      border-radius: 10px;
      padding: 24px;
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 24px;
      align-items: center;
    }

    .hero-headline {
      font-family: var(--font-display);
      font-size: clamp(22px, 2.5vw, 30px);
      font-weight: 700;
      letter-spacing: -0.025em;
      line-height: 1.2;
      margin-bottom: 10px;
    }

    .hero-sub {
      color: var(--text-secondary);
      font-size: 14px;
      max-width: 68ch;
      margin-bottom: 16px;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 9px 16px;
      min-height: 38px;
      border-radius: 6px;
      font-family: var(--font-sans);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid var(--border-hairline);
      background: var(--bg-interactive);
      color: var(--text-primary);
      transition: border-color 140ms ease, background-color 140ms ease;
    }

    .btn:hover {
      border-color: rgba(255, 255, 255, 0.24);
      background: #202026;
    }

    .btn-primary {
      background: rgba(16, 185, 129, 0.16);
      border-color: rgba(16, 185, 129, 0.5);
      color: #ecfdf5;
    }

    .btn-primary:hover {
      background: rgba(16, 185, 129, 0.26);
      border-color: var(--accent-emerald);
    }

    .btn-cyan {
      background: rgba(6, 182, 212, 0.14);
      border-color: rgba(6, 182, 212, 0.45);
      color: #ecfeff;
    }

    .btn-cyan:hover {
      background: rgba(6, 182, 212, 0.24);
      border-color: var(--accent-cyan);
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .kpi-card {
      background: var(--bg-void);
      border: 1px solid var(--border-hairline);
      border-radius: 8px;
      padding: 14px;
    }

    .kpi-label {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }

    .kpi-value {
      font-family: var(--font-mono);
      font-size: 22px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .kpi-delta {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--accent-emerald);
      margin-top: 2px;
    }

    /* Navigation Tabs */
    .nav-tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--border-hairline);
      padding-bottom: 12px;
      overflow-x: auto;
    }

    .tab-btn {
      padding: 8px 14px;
      min-height: 38px;
      border-radius: 6px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .tab-btn:hover {
      color: var(--text-primary);
      background: var(--bg-elevated);
    }

    .tab-btn.active {
      color: var(--text-primary);
      background: var(--bg-interactive);
      border-color: var(--border-active);
    }

    .kbd {
      font-family: var(--font-mono);
      font-size: 10px;
      padding: 1px 5px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-muted);
    }

    .tab-section {
      display: none;
      flex-direction: column;
      gap: 20px;
    }

    .tab-section.active {
      display: flex;
    }

    /* Cards & Tables */
    .panel {
      background: var(--bg-elevated);
      border: 1px solid var(--border-hairline);
      border-radius: 10px;
      padding: 20px;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .panel-title {
      font-family: var(--font-display);
      font-size: 17px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .panel-subtitle {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr auto;
      gap: 12px;
      align-items: end;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field label {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .input, .select {
      background: var(--bg-void);
      border: 1px solid var(--border-hairline);
      border-radius: 6px;
      padding: 9px 12px;
      min-height: 38px;
      color: var(--text-primary);
      font-family: var(--font-sans);
      font-size: 13px;
      width: 100%;
    }

    .input:focus, .select:focus {
      border-color: var(--accent-cyan);
      outline: none;
    }

    .route-result-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-top: 16px;
    }

    .decision-box {
      background: var(--bg-void);
      border: 1px solid var(--border-hairline);
      border-radius: 8px;
      padding: 14px;
    }

    .decision-box h4 {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
      margin-bottom: 8px;
    }

    .decision-main {
      font-family: var(--font-mono);
      font-size: 14px;
      font-weight: 600;
      color: var(--accent-emerald);
      margin-bottom: 4px;
    }

    .decision-meta {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .table-wrap {
      overflow-x: auto;
      border: 1px solid var(--border-hairline);
      border-radius: 8px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;
    }

    th {
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-secondary);
      font-weight: 500;
      padding: 10px 14px;
      border-bottom: 1px solid var(--border-hairline);
      white-space: nowrap;
    }

    td {
      padding: 10px 14px;
      border-bottom: 1px solid var(--border-hairline);
      vertical-align: top;
    }

    tr:last-child td {
      border-bottom: none;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 500;
    }

    .badge-emerald {
      background: rgba(16, 185, 129, 0.14);
      color: var(--accent-emerald);
      border: 1px solid rgba(16, 185, 129, 0.35);
    }

    .badge-cyan {
      background: rgba(6, 182, 212, 0.14);
      color: var(--accent-cyan);
      border: 1px solid rgba(6, 182, 212, 0.35);
    }

    .badge-amber {
      background: rgba(245, 158, 11, 0.14);
      color: var(--accent-amber);
      border: 1px solid rgba(245, 158, 11, 0.35);
    }

    .badge-danger {
      background: rgba(239, 68, 68, 0.14);
      color: var(--accent-danger);
      border: 1px solid rgba(239, 68, 68, 0.35);
    }

    /* Brand Switchboard Cards */
    .brand-selector-bar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .brand-chip {
      padding: 7px 13px;
      border-radius: 6px;
      border: 1px solid var(--border-hairline);
      background: var(--bg-void);
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
    }

    .brand-chip.active {
      border-color: var(--accent-cyan);
      color: var(--text-primary);
      background: rgba(6, 182, 212, 0.12);
    }

    .moat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 14px;
    }

    .moat-cell {
      background: var(--bg-void);
      border: 1px solid var(--border-hairline);
      border-radius: 8px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 8px;
    }

    .progress-track {
      width: 100%;
      height: 5px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 99px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--accent-emerald);
    }

    /* Footer */
    .footer {
      border-top: 1px solid var(--border-hairline);
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--text-muted);
      flex-wrap: wrap;
      gap: 12px;
    }

    @media (max-width: 960px) {
      .hero-panel {
        grid-template-columns: 1fr;
      }
      .form-grid {
        grid-template-columns: 1fr;
      }
      .route-result-grid {
        grid-template-columns: 1fr;
      }
      .moat-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 560px) {
      .shell {
        padding: 14px;
      }
      .kpi-grid {
        grid-template-columns: 1fr;
      }
      .moat-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    }
  </style>
</head>
<body>
  <header class="topbar" role="banner">
    <div class="brand-cluster">
      <span class="pulse-dot" aria-hidden="true"></span>
      <span class="brand-title">Starlight Queen</span>
      <span class="brand-badge">v1.0 Sovereign Superintelligence</span>
    </div>
    <div class="telemetry-strip" aria-live="polite">
      <div class="stat-pill">Harnesses online: <strong id="top-harnesses-online">0/12</strong></div>
      <div class="stat-pill">Fleet capacity: <strong id="top-concurrency">0 workers</strong></div>
      <div class="stat-pill">Context compression: <strong id="top-compression">96.9%</strong></div>
      <div class="stat-pill">12-layer eval: <strong id="top-eval-score">97.3/100</strong></div>
    </div>
  </header>

  <main class="shell" role="main">
    <section class="hero-panel" aria-label="Queen overview">
      <div>
        <h1 class="hero-headline">Multi-harness superintelligence across local kernels, cloud fleets, and 8 sovereign brands</h1>
        <p class="hero-sub">
          Queen orchestrates Claude Code, Codex + ChatGPT Plan Worker, Antigravity, OpenCode + Vercel TokenPass, Grok, Google Jules, Hermes CoE, and Ruflo/OmO—guarded by the Layer-0 Rust invariant kernel, RTK + Headroom token compression, and cross-family Maker ≠ Checker verification.
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary" id="btn-hero-upgrade" type="button">
            Upgrade all 12 harnesses with Starlight envelopes
          </button>
          <button class="btn btn-cyan" id="btn-hero-eval" type="button">
            Run 12-layer frontier benchmark vs Grok &amp; YC Oct 2026
          </button>
        </div>
      </div>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Antigravity Queen v1.0 score</div>
          <div class="kpi-value" id="kpi-ag-score">97.3</div>
          <div class="kpi-delta" id="kpi-ag-delta">+24.5 pts vs Grok v0.2 · +14.3 vs YC</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Context bloat reduction</div>
          <div class="kpi-value" id="kpi-context-savings">96.9%</div>
          <div class="kpi-delta">vMCP JIT + Headroom v0.20 + RTK v0.50</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Harness readiness score</div>
          <div class="kpi-value" id="kpi-readiness">100%</div>
          <div class="kpi-delta" id="kpi-readiness-sub">12 federated local &amp; cloud rails</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">8-brand × 8-moat readiness</div>
          <div class="kpi-value" id="kpi-brand-moat">93.6%</div>
          <div class="kpi-delta">64 engineering moat cells active</div>
        </div>
      </div>
    </section>

    <nav class="nav-tabs" role="tablist" aria-label="Queen cockpit views">
      <button class="tab-btn active" role="tab" aria-selected="true" data-tab="router">
        Pareto &amp; Thompson router <span class="kbd">1</span>
      </button>
      <button class="tab-btn" role="tab" aria-selected="false" data-tab="harnesses">
        12-harness mesh &amp; upgrader <span class="kbd">2</span>
      </button>
      <button class="tab-btn" role="tab" aria-selected="false" data-tab="brands">
        8-brand × 8-moat switchboard <span class="kbd">3</span>
      </button>
      <button class="tab-btn" role="tab" aria-selected="false" data-tab="rust">
        Rust Layer-0 kernel &amp; RTK/Headroom <span class="kbd">4</span>
      </button>
      <button class="tab-btn" role="tab" aria-selected="false" data-tab="evals">
        12-layer frontier evals &amp; Grok arena <span class="kbd">5</span>
      </button>
      <button class="tab-btn" role="tab" aria-selected="false" data-tab="ledger">
        SIP receipt ledger <span class="kbd">6</span>
      </button>
    </nav>

    <!-- TAB 1: PARETO & THOMPSON ROUTER -->
    <section class="tab-section active" id="tab-router" role="tabpanel">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Multi-objective Pareto &amp; Thompson-sampling task router</h2>
            <p class="panel-subtitle">Routes across quality priors, latency, subscription/TokenPass cost, and enforces cross-family Maker ≠ Checker verification.</p>
          </div>
          <span class="badge badge-emerald">Maker ≠ Checker enforced</span>
        </div>

        <!-- Vector SVG Sovereign Architecture Topology -->
        <div style="margin-bottom:18px; background:var(--bg-void); border:1px solid var(--border-hairline); border-radius:8px; padding:12px; overflow-x:auto;">
          <svg viewBox="0 0 1120 110" width="100%" height="110" role="img" aria-label="Starlight Queen Sovereign 4-Stage Execution Topology">
            <defs>
              <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#10b981" stop-opacity="0.8" />
                <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.8" />
              </linearGradient>
            </defs>
            <!-- Stage 1 -->
            <rect x="10" y="15" width="245" height="80" rx="8" fill="#111114" stroke="rgba(16,185,129,0.45)" stroke-width="1.2"/>
            <text x="24" y="38" fill="#10b981" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600">01 · SIS VAULTS + COMPRESSION</text>
            <text x="24" y="58" fill="#f4f4f6" font-family="Inter, sans-serif" font-size="12" font-weight="600">6-Vault RRF + Headroom + RTK</text>
            <text x="24" y="76" fill="#a1a1aa" font-family="JetBrains Mono, monospace" font-size="11">-96.9% prompt &amp; stdout token bloat</text>
            <line x1="255" y1="55" x2="290" y2="55" stroke="url(#edgeGrad)" stroke-width="2" />

            <!-- Stage 2 -->
            <rect x="290" y="15" width="250" height="80" rx="8" fill="#111114" stroke="rgba(6,182,212,0.45)" stroke-width="1.2"/>
            <text x="304" y="38" fill="#06b6d4" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600">02 · LAYER-0 RUST KERNEL</text>
            <text x="304" y="58" fill="#f4f4f6" font-family="Inter, sans-serif" font-size="12" font-weight="600">AST Safety + Tarjan WFG + vMCP</text>
            <text x="304" y="76" fill="#a1a1aa" font-family="JetBrains Mono, monospace" font-size="11">Sub-50µs deadlock &amp; mutation gate</text>
            <line x1="540" y1="55" x2="575" y2="55" stroke="url(#edgeGrad)" stroke-width="2" />

            <!-- Stage 3 -->
            <rect x="575" y="15" width="255" height="80" rx="8" fill="#111114" stroke="rgba(16,185,129,0.45)" stroke-width="1.2"/>
            <text x="589" y="38" fill="#10b981" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600">03 · PARETO MAKER + CLOUD BURST</text>
            <text x="589" y="58" fill="#f4f4f6" font-family="Inter, sans-serif" font-size="12" font-weight="600">12 Harnesses + Jules / Ruflo-OmO</text>
            <text x="589" y="76" fill="#a1a1aa" font-family="JetBrains Mono, monospace" font-size="11">OAuth · TokenPass · OpenRouter · Free</text>
            <line x1="830" y1="55" x2="865" y2="55" stroke="url(#edgeGrad)" stroke-width="2" />

            <!-- Stage 4 -->
            <rect x="865" y="15" width="245" height="80" rx="8" fill="#111114" stroke="rgba(6,182,212,0.45)" stroke-width="1.2"/>
            <text x="879" y="38" fill="#06b6d4" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600">04 · CROSS-FAMILY CHECKER</text>
            <text x="879" y="58" fill="#f4f4f6" font-family="Inter, sans-serif" font-size="12" font-weight="600">Maker ≠ Checker + SIP Receipt</text>
            <text x="879" y="76" fill="#a1a1aa" font-family="JetBrains Mono, monospace" font-size="11">FNV-1a hash chain · 8 brands</text>
          </svg>
        </div>

        <form id="form-route" class="form-grid">
          <div class="field">
            <label for="input-prompt">Task intent or mission prompt (press / to focus)</label>
            <input
              id="input-prompt"
              class="input"
              type="text"
              value="Architect a multi-agent Rust + Next.js 16 telemetry surface for Starlight and verify accessibility"
              required
            />
          </div>
          <div class="field">
            <label for="select-brand">Brand context</label>
            <select id="select-brand" class="select">
              <option value="">Auto-detect from prompt</option>
              <option value="starlight">Starlight Intelligence</option>
              <option value="arcanea">Arcanea</option>
              <option value="agentic-income">Agentic Income (IIS)</option>
              <option value="frankx">FrankX.AI</option>
              <option value="gencreator">GenCreator OS</option>
              <option value="reality-architect">Reality Architect</option>
              <option value="ai-architect-studio">AI Architect Studio</option>
              <option value="ai-architect-academy">AI Architect Academy</option>
            </select>
          </div>
          <div class="field">
            <label for="input-workers">Cloud burst workers</label>
            <input id="input-workers" class="input mono" type="number" min="1" max="500" value="24" />
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-primary" type="submit">Route task</button>
            <button class="btn btn-cyan" id="btn-execute-mission" type="button">Execute 4-stage mission</button>
          </div>
        </form>

        <div id="route-decision-container" class="route-result-grid" aria-live="polite"></div>
        <div id="mission-stages-container" style="display:none; margin-top:16px;" aria-live="polite"></div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">Live Pareto frontier ranking across harnesses</h3>
            <p class="panel-subtitle">Beta(α,β) Thompson expected win rate + latency + cost efficiency across OAuth subscriptions, Vercel TokenPass, OpenRouter, and OpenCode Free.</p>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Harness</th>
                <th>Family &amp; primary model</th>
                <th>Auth / compute rail</th>
                <th>Thompson win rate</th>
                <th>Quality</th>
                <th>Latency</th>
                <th>Cost eff.</th>
                <th>Composite score</th>
                <th>Pareto status</th>
              </tr>
            </thead>
            <tbody id="tbody-pareto"></tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 2: 12-HARNESS MESH & UPGRADER -->
    <section class="tab-section" id="tab-harnesses" role="tabpanel">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">12-harness federation &amp; proactive Starlight upgrader</h2>
            <p class="panel-subtitle">Queen inspects every local binary and cloud rail, then injects Starlight context envelopes (Rust vMCP filter, RTK + Headroom compression, Maker≠Checker, and SIP attestation).</p>
          </div>
          <button class="btn btn-primary" id="btn-upgrade-harnesses" type="button">
            Inject Starlight upgrade envelopes now
          </button>
        </div>
        <div id="upgrade-banner" style="display:none; margin-bottom:14px; padding:12px; border-radius:8px; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.4); color:#ecfdf5; font-size:13px;"></div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Harness</th>
                <th>Category</th>
                <th>Detected binary / version</th>
                <th>Default frontier models</th>
                <th>Auth &amp; billing rails</th>
                <th>Max workers</th>
                <th>Starlight readiness</th>
              </tr>
            </thead>
            <tbody id="tbody-harnesses"></tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 3: 8-BRAND x 8-MOAT SWITCHBOARD -->
    <section class="tab-section" id="tab-brands" role="tabpanel">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">8-brand sovereign switchboard × 8 engineering moat layers</h2>
            <p class="panel-subtitle">Select any brand to inspect its CLI, SDKs, APIs, Platforms, Apps, AI, Agents, and Subscriptions stack plus Grok Website Software Factory sync.</p>
          </div>
        </div>
        <div class="brand-selector-bar" id="brand-selector-bar"></div>
        <div id="brand-detail-box"></div>
      </div>
    </section>

    <!-- TAB 4: RUST LAYER-0 KERNEL & RTK/HEADROOM -->
    <section class="tab-section" id="tab-rust" role="tabpanel">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Layer-0 Rust invariant kernel (AST gate + Tarjan WFG deadlock detector + vMCP + RTK/Headroom)</h2>
            <p class="panel-subtitle">Test deterministic fail-closed shell AST checks, cyclic Wait-For Graph deadlock detection, and Just-In-Time MCP schema filtering.</p>
          </div>
          <span class="badge badge-cyan mono">crates/starlight-invariants v0.2.0</span>
        </div>

        <form id="form-rust-gate" class="form-grid">
          <div class="field">
            <label for="input-rust-cmd">Command to verify against Layer-0 AST gate</label>
            <input id="input-rust-cmd" class="input mono" type="text" value="starlight queen route --verify-invariants" />
          </div>
          <div class="field">
            <label for="input-rust-kw">Intent keywords for vMCP filter</label>
            <input id="input-rust-kw" class="input" type="text" value="vault, queen, verify" />
          </div>
          <div class="field">
            <label for="select-wfg-mode">Wait-For Graph topology test</label>
            <select id="select-wfg-mode" class="select">
              <option value="acyclic">Acyclic pipeline (Maker → Checker → Vault)</option>
              <option value="cyclic">Simulated 3-agent deadlock cycle (A → B → C → A)</option>
            </select>
          </div>
          <button class="btn btn-cyan" type="submit">Evaluate Rust gate</button>
        </form>

        <div id="rust-gate-output" class="route-result-grid" style="margin-top:16px;"></div>
      </div>
    </section>

    <!-- TAB 5: 12-LAYER FRONTIER EVALS & GROK ARENA -->
    <section class="tab-section" id="tab-evals" role="tabpanel">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Head-to-head arena: Antigravity Sovereign Queen v1.0 vs. Grok Queen v0.2 vs. YC Oct 2026</h2>
            <p class="panel-subtitle" id="eval-verdict-text"></p>
          </div>
        </div>
        <div class="table-wrap" style="margin-bottom:20px;">
          <table>
            <thead>
              <tr>
                <th>Empirical trial scenario</th>
                <th>Grok Queen v0.2 (tools/queen/driver.mjs)</th>
                <th>Antigravity Sovereign Queen v1.0</th>
                <th>Measured delta</th>
              </tr>
            </thead>
            <tbody id="tbody-trials"></tbody>
          </table>
        </div>

        <h3 class="panel-title" style="margin-bottom:12px;">12-layer frontier stack benchmark scorecard</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Stack layer</th>
                <th>Antigravity v1.0</th>
                <th>Grok v0.2</th>
                <th>YC Oct 2026 top-quartile</th>
                <th>Active architecture &amp; mechanism</th>
                <th>Verified artifact</th>
              </tr>
            </thead>
            <tbody id="tbody-evals"></tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 6: SIP RECEIPT LEDGER -->
    <section class="tab-section" id="tab-ledger" role="tabpanel">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">FNV-1a hash-chained sovereign execution receipts</h2>
            <p class="panel-subtitle">Every routing decision, harness upgrade, Rust kernel gate check, and benchmark run is recorded to .starlight/queen-sovereign-ledger.jsonl.</p>
          </div>
          <span class="badge badge-emerald mono">Built on SIP</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Timestamp</th>
                <th>Event type</th>
                <th>Brand</th>
                <th>Maker → Checker</th>
                <th>Summary</th>
                <th>FNV-1a chain hash</th>
              </tr>
            </thead>
            <tbody id="tbody-receipts"></tbody>
          </table>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer" role="contentinfo">
    <div>Starlight Intelligence Systems · Branch: <span class="mono">agent/antigravity/queen-sovereign-superintelligence-20261017</span></div>
    <div class="mono">Built on SIP · Fail-Closed Invariants Active</div>
  </footer>

  <script>
    window.__QUEEN_STATE__ = ${serializedState};

    (function () {
      let state = window.__QUEEN_STATE__;
      let selectedBrandId = 'starlight';

      function escapeHtml(str) {
        return String(str ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      }

      function renderTopMetrics() {
        document.getElementById('top-harnesses-online').textContent =
          state.harnesses.onlineCount + '/' + state.harnesses.total;
        document.getElementById('top-concurrency').textContent =
          state.harnesses.totalConcurrencyCapacity.toLocaleString() + ' workers';
        document.getElementById('top-compression').textContent =
          state.rustKernelSample.combinedContextSavingsPct + '%';
        document.getElementById('top-eval-score').textContent =
          state.benchmarkSummary.overallScores.antigravityQueenV1 + '/100';

        document.getElementById('kpi-ag-score').textContent =
          state.benchmarkSummary.overallScores.antigravityQueenV1 + '/100';
        const diffGrok = (
          state.benchmarkSummary.overallScores.antigravityQueenV1 -
          state.benchmarkSummary.overallScores.grokQueenV02
        ).toFixed(1);
        const diffYc = (
          state.benchmarkSummary.overallScores.antigravityQueenV1 -
          state.benchmarkSummary.overallScores.ycOct2026IncumbentAvg
        ).toFixed(1);
        document.getElementById('kpi-ag-delta').textContent =
          '+' + diffGrok + ' pts vs Grok v0.2 · +' + diffYc + ' vs YC';
        document.getElementById('kpi-context-savings').textContent =
          state.rustKernelSample.combinedContextSavingsPct + '%';
        document.getElementById('kpi-readiness').textContent =
          state.harnesses.avgReadinessScore + '%';
        document.getElementById('kpi-brand-moat').textContent =
          state.brands.averageReadinessPct + '%';
      }

      function renderHarnessesTable() {
        const tbody = document.getElementById('tbody-harnesses');
        tbody.innerHTML = state.harnesses.items
          .map((h) => {
            const score = h.starlightIntegration.readinessScore;
            const badgeClass = score >= 95 ? 'badge-emerald' : score >= 75 ? 'badge-cyan' : 'badge-amber';
            return '<tr>' +
              '<td><strong>' + escapeHtml(h.name) + '</strong><div class="mono" style="font-size:11px;color:var(--text-muted)">' + escapeHtml(h.id) + '</div></td>' +
              '<td><span class="badge badge-cyan">' + escapeHtml(h.category) + '</span></td>' +
              '<td class="mono" style="font-size:12px;">' + escapeHtml(h.detectedVersion || 'standby') + '<div style="font-size:11px;color:var(--text-muted)">' + escapeHtml(h.detectedBinaryPath || 'cloud / remote rail') + '</div></td>' +
              '<td class="mono" style="font-size:12px;">' + escapeHtml(h.defaultModels.join(', ')) + '</td>' +
              '<td style="font-size:12px;">' + escapeHtml(h.authRails.join(' · ')) + '</td>' +
              '<td class="mono">' + h.maxConcurrency + '</td>' +
              '<td><span class="badge ' + badgeClass + '">' + score + '% ready</span></td>' +
            '</tr>';
          })
          .join('');
      }

      function renderBrandsSwitchboard() {
        const bar = document.getElementById('brand-selector-bar');
        bar.innerHTML = state.brands.items
          .map((b) => {
            const active = b.id === selectedBrandId ? 'active' : '';
            return '<button type="button" class="brand-chip ' + active + '" data-brand-id="' + escapeHtml(b.id) + '">' +
              escapeHtml(b.name) +
            '</button>';
          })
          .join('');

        bar.querySelectorAll('[data-brand-id]').forEach((btn) => {
          btn.addEventListener('click', () => {
            selectedBrandId = btn.getAttribute('data-brand-id');
            renderBrandsSwitchboard();
          });
        });

        const brand =
          state.brands.items.find((b) => b.id === selectedBrandId) ||
          state.brands.items[0];

        const box = document.getElementById('brand-detail-box');
        box.innerHTML =
          '<div class="decision-box" style="margin-bottom:14px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
              '<div>' +
                '<div style="font-family:var(--font-display);font-size:18px;font-weight:700;">' + escapeHtml(brand.name) + ' <span class="mono" style="font-size:12px;color:var(--accent-cyan);">(' + escapeHtml(brand.domain) + ')</span></div>' +
                '<div style="color:var(--text-secondary);font-size:13px;margin-top:2px;">' + escapeHtml(brand.tagline) + '</div>' +
              '</div>' +
              '<div class="mono" style="font-size:12px;">Repo: <strong>' + escapeHtml(brand.githubOrgAndRepo) + '</strong></div>' +
            '</div>' +
            '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:12px;font-size:12px;color:var(--text-secondary);">' +
              '<div>Lead Queen persona: <strong style="color:var(--text-primary)">' + escapeHtml(brand.leadQueenPersona) + '</strong></div>' +
              '<div>Maker ≠ Checker default: <strong class="mono" style="color:var(--accent-emerald)">' + escapeHtml(brand.preferredMakerHarness) + ' → ' + escapeHtml(brand.preferredCheckerHarness) + '</strong></div>' +
              '<div>Palette: <strong style="color:var(--text-primary)">' + escapeHtml(brand.aestheticSystem.paletteName) + '</strong></div>' +
            '</div>' +
            '<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border-hairline);font-size:12px;color:var(--text-secondary);">' +
              '<span class="badge badge-cyan" style="margin-right:8px;">Grok factory bridge</span> ' +
              escapeHtml(brand.grokSurfaceSync.antigravityCompetitiveUpgrade) +
            '</div>' +
          '</div>' +
          '<div class="moat-grid">' +
            brand.moatLayers
              .map((m) => (
                '<div class="moat-cell">' +
                  '<div>' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
                      '<strong style="font-size:13px;">' + escapeHtml(m.label) + '</strong>' +
                      '<span class="mono" style="font-size:12px;color:var(--accent-emerald);">' + m.readinessPct + '%</span>' +
                    '</div>' +
                    '<div style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(m.artifact) + '</div>' +
                  '</div>' +
                  '<div>' +
                    '<div class="progress-track"><div class="progress-fill" style="width:' + m.readinessPct + '%"></div></div>' +
                    '<div class="mono" style="font-size:10px;color:var(--text-muted);margin-top:6px;">' + escapeHtml(m.openCorevsProprietary) + '</div>' +
                  '</div>' +
                '</div>'
              ))
              .join('') +
          '</div>';
      }

      function renderRustGateBox(res) {
        const container = document.getElementById('rust-gate-output');
        const astBadge = res.astAllowed
          ? '<span class="badge badge-emerald">AST ALLOWED</span>'
          : '<span class="badge badge-danger">AST FAIL-CLOSED BLOCKED</span>';
        const wfgBadge = res.wfgDeadlockDetected
          ? '<span class="badge badge-danger">CYCLE DETECTED (' + escapeHtml(res.wfgCycleNodes.join(' → ')) + ')</span>'
          : '<span class="badge badge-emerald">DAG ACYCLIC (NO DEADLOCK)</span>';

        container.innerHTML =
          '<div class="decision-box">' +
            '<h4>1. Rust Layer-0 AST command safety gate</h4>' +
            '<div style="margin-bottom:6px;">' + astBadge + '</div>' +
            '<div class="decision-meta">' + escapeHtml(res.astReason) + '</div>' +
          '</div>' +
          '<div class="decision-box">' +
            '<h4>2. Tarjan SCC Wait-For Graph deadlock detector</h4>' +
            '<div style="margin-bottom:6px;">' + wfgBadge + '</div>' +
            '<div class="decision-meta">Evaluated in <strong class="mono">' + res.executionLatencyUs + ' µs</strong> via ' + escapeHtml(res.engine) + '</div>' +
          '</div>' +
          '<div class="decision-box">' +
            '<h4>3. vMCP JIT + Headroom + RTK token savings</h4>' +
            '<div class="decision-main">' + res.combinedContextSavingsPct + '% combined bloat reduction</div>' +
            '<div class="decision-meta">vMCP tools: ' + res.vmcpFilteredTools + '/' + res.vmcpOriginalTools + ' (-' + res.vmcpTokenReductionPct + '%) · Headroom: -' + res.headroomCompressionPct + '% · RTK: -' + res.rtkCliSavingsPct + '%</div>' +
          '</div>';
      }

      function renderEvalsAndArena() {
        const b = state.benchmarkSummary;
        document.getElementById('eval-verdict-text').textContent = b.summaryVerdict;

        document.getElementById('tbody-trials').innerHTML = b.taskTrials
          .map((t) => (
            '<tr>' +
              '<td><strong>' + escapeHtml(t.scenario) + '</strong></td>' +
              '<td style="color:var(--text-secondary);">' + escapeHtml(t.grokV02Behavior) + '</td>' +
              '<td>' + escapeHtml(t.antigravityV1Behavior) + '</td>' +
              '<td><span class="badge badge-emerald">' + escapeHtml(t.measuredImprovement) + '</span></td>' +
            '</tr>'
          ))
          .join('');

        document.getElementById('tbody-evals').innerHTML = b.layers
          .map((l) => (
            '<tr>' +
              '<td><strong>' + escapeHtml(l.title) + '</strong></td>' +
              '<td class="mono"><span class="badge badge-emerald">' + l.antigravityScore + '</span></td>' +
              '<td class="mono" style="color:var(--text-secondary);">' + l.grokV02Score + ' <span style="color:var(--accent-emerald);font-size:11px;">(+' + l.deltaVsGrok + ')</span></td>' +
              '<td class="mono" style="color:var(--text-secondary);">' + l.ycOct2026TopQuartileScore + ' <span style="color:var(--accent-cyan);font-size:11px;">(+' + l.deltaVsYc + ')</span></td>' +
              '<td><div><strong>' + escapeHtml(l.activeArchitecture) + '</strong></div><div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">' + escapeHtml(l.empiricalMechanism) + '</div></td>' +
              '<td class="mono" style="font-size:11px;color:var(--text-muted);">' + escapeHtml(l.verifiedArtifact) + '</td>' +
            '</tr>'
          ))
          .join('');
      }

      function renderReceipts() {
        const tbody = document.getElementById('tbody-receipts');
        tbody.innerHTML = (state.recentReceipts || [])
          .map((r) => (
            '<tr>' +
              '<td class="mono" style="font-size:12px;">' + escapeHtml(r.receiptId) + '</td>' +
              '<td class="mono" style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(r.timestamp) + '</td>' +
              '<td><span class="badge badge-cyan">' + escapeHtml(r.eventType) + '</span></td>' +
              '<td class="mono">' + escapeHtml(r.brandId) + '</td>' +
              '<td class="mono" style="font-size:12px;">' + escapeHtml(r.makerHarness) + ' → ' + escapeHtml(r.checkerHarness) + '</td>' +
              '<td style="font-size:12px;">' + escapeHtml(r.summary) + '</td>' +
              '<td class="mono" style="font-size:11px;color:var(--accent-emerald);">' + escapeHtml(r.fnv1aHash) + '</td>' +
            '</tr>'
          ))
          .join('');
      }

      function renderRouteDecision(decision) {
        const container = document.getElementById('route-decision-container');
        container.innerHTML =
          '<div class="decision-box">' +
            '<h4>Primary Maker &amp; Cross-Family Checker</h4>' +
            '<div class="decision-main">' + escapeHtml(decision.maker.harnessId) + ' (' + escapeHtml(decision.maker.model) + ')</div>' +
            '<div class="decision-meta">Checker: <strong class="mono" style="color:var(--accent-cyan)">' + escapeHtml(decision.checker.harnessId) + ' (' + escapeHtml(decision.checker.model) + ')</strong> · Cross-family: ' + (decision.checker.crossFamilyVerified ? 'YES' : 'FALLBACK') + '</div>' +
          '</div>' +
          '<div class="decision-box">' +
            '<h4>Brand Switchboard &amp; Cloud Burst</h4>' +
            '<div class="decision-main">' + escapeHtml(decision.detectedBrand.name) + ' · ' + escapeHtml(decision.detectedDomain) + '</div>' +
            '<div class="decision-meta">Burst: <strong class="mono">' + decision.cloudSwarmBurst.parallelWorkersAssigned + ' workers</strong> via ' + escapeHtml(decision.cloudSwarmBurst.asyncWorkerHarnessId) + ' (' + decision.cloudSwarmBurst.estimatedSpeedupFactor + 'x speedup)</div>' +
          '</div>' +
          '<div class="decision-box">' +
            '<h4>Advantage vs. Grok v0.2 router</h4>' +
            '<div class="decision-main">-' + decision.contextOptimization.combinedContextSavingsPct + '% context bloat</div>' +
            '<div class="decision-meta">Grok v0.2 static regex: <span class="mono">' + escapeHtml(decision.grokV02Comparison.grokWouldSelect) + '</span></div>' +
          '</div>';

        const tbody = document.getElementById('tbody-pareto');
        tbody.innerHTML = decision.paretoFrontier
          .map((c) => (
            '<tr>' +
              '<td><strong>' + escapeHtml(c.harnessName) + '</strong></td>' +
              '<td class="mono" style="font-size:12px;">' + escapeHtml(c.family) + ' · ' + escapeHtml(c.primaryModel) + '</td>' +
              '<td class="mono" style="font-size:12px;">' + escapeHtml(c.authRail) + '</td>' +
              '<td class="mono">' + (c.thompsonExpectedWinRate * 100).toFixed(1) + '%</td>' +
              '<td class="mono">' + c.qualityScore + '</td>' +
              '<td class="mono">' + c.latencyScore + '</td>' +
              '<td class="mono">' + c.costEfficiencyScore + '</td>' +
              '<td class="mono"><strong>' + c.compositeParetoScore + '</strong></td>' +
              '<td>' + (c.paretoOptimal ? '<span class="badge badge-emerald">PARETO OPTIMAL</span>' : '<span class="badge badge-amber">DOMINATED</span>') + '</td>' +
            '</tr>'
          ))
          .join('');
      }

      async function triggerRoute(e) {
        if (e) e.preventDefault();
        const prompt = document.getElementById('input-prompt').value;
        const preferredBrand = document.getElementById('select-brand').value;
        const parallelWorkers = Number(document.getElementById('input-workers').value || 24);

        const res = await fetch('/api/queen/route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, preferredBrand, parallelWorkers }),
        });
        const data = await res.json();
        if (data.decision) {
          renderRouteDecision(data.decision);
        }
        if (data.state) {
          state = data.state;
          renderTopMetrics();
          renderReceipts();
        }
      }

      async function triggerUpgradeHarnesses() {
        const res = await fetch('/api/queen/upgrade-harnesses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (data.state) {
          state = data.state;
          renderTopMetrics();
          renderHarnessesTable();
          renderReceipts();
        }
        const banner = document.getElementById('upgrade-banner');
        banner.style.display = 'block';
        banner.textContent =
          'Upgraded ' +
          (data.actions ? data.actions.length : 12) +
          ' harnesses with Starlight Layer-0 Rust AST/WFG/vMCP, RTK+Headroom compression, and Cross-Family Maker≠Checker envelopes in .starlight/queen-upgrades/.';
      }

      async function triggerRustGate(e) {
        if (e) e.preventDefault();
        const commandToVerify = document.getElementById('input-rust-cmd').value;
        const intentKeywords = document
          .getElementById('input-rust-kw')
          .value.split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const mode = document.getElementById('select-wfg-mode').value;
        const waitForEdges =
          mode === 'cyclic'
            ? [
                { from: 'agent-alpha', to: 'agent-beta' },
                { from: 'agent-beta', to: 'agent-gamma' },
                { from: 'agent-gamma', to: 'agent-alpha' },
              ]
            : [
                { from: 'maker-antigravity', to: 'checker-claude' },
                { from: 'checker-claude', to: 'sis-vault' },
              ];

        const res = await fetch('/api/queen/rust-gate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commandToVerify, intentKeywords, waitForEdges }),
        });
        const data = await res.json();
        if (data.result) {
          renderRustGateBox(data.result);
        }
        if (data.state) {
          state = data.state;
          renderTopMetrics();
          renderReceipts();
        }
      }

      // Tab Switching & Keyboard Navigation
      const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
      function activateTab(tabName) {
        tabButtons.forEach((btn) => {
          const isMatch = btn.getAttribute('data-tab') === tabName;
          btn.classList.toggle('active', isMatch);
          btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
        });
        document.querySelectorAll('.tab-section').forEach((sec) => {
          sec.classList.toggle('active', sec.id === 'tab-' + tabName);
        });
      }

      tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => activateTab(btn.getAttribute('data-tab')));
      });

      window.addEventListener('keydown', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) {
          return;
        }
        if (e.key === '/') {
          e.preventDefault();
          activateTab('router');
          document.getElementById('input-prompt').focus();
        } else if (e.key >= '1' && e.key <= '6') {
          const idx = Number(e.key) - 1;
          if (tabButtons[idx]) {
            activateTab(tabButtons[idx].getAttribute('data-tab'));
          }
        }
      });

      async function triggerExecuteMission() {
        const prompt = document.getElementById('input-prompt').value;
        const preferredBrand = document.getElementById('select-brand').value;
        const parallelWorkers = Number(document.getElementById('input-workers').value || 24);

        const res = await fetch('/api/queen/execute-mission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, preferredBrand, parallelWorkers }),
        });
        const data = await res.json();
        if (data.mission) {
          renderRouteDecision(data.mission.route);
          const stagesBox = document.getElementById('mission-stages-container');
          stagesBox.style.display = 'block';
          stagesBox.innerHTML =
            '<div class="decision-box">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">' +
                '<strong style="font-size:13px;color:var(--accent-emerald);">Closed-loop mission executed (' + escapeHtml(data.mission.missionId) + ') · Receipt: <span class="mono">' + escapeHtml(data.mission.receipt.fnv1aHash) + '</span></strong>' +
                '<span class="badge badge-cyan mono">Thompson Beta(α=' + data.mission.thompsonUpdatedPrior.alpha + ', β=' + data.mission.thompsonUpdatedPrior.beta + ')</span>' +
              '</div>' +
              '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;">' +
                data.mission.stages
                  .map((s) => (
                    '<div style="background:var(--bg-elevated);border:1px solid var(--border-hairline);border-radius:6px;padding:10px;">' +
                      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
                        '<span class="mono" style="font-size:11px;color:var(--accent-cyan);">STAGE 0' + s.stage + ' · ' + s.durationMs + 'ms</span>' +
                        '<span class="badge badge-emerald">' + escapeHtml(s.status) + '</span>' +
                      '</div>' +
                      '<div style="font-weight:600;font-size:12px;margin-bottom:4px;">' + escapeHtml(s.name) + '</div>' +
                      '<div style="font-size:11px;color:var(--text-secondary);">' + escapeHtml(s.detail) + '</div>' +
                    '</div>'
                  ))
                  .join('') +
              '</div>' +
            '</div>';
        }
        if (data.state) {
          state = data.state;
          renderTopMetrics();
          renderReceipts();
        }
      }

      document.getElementById('form-route').addEventListener('submit', triggerRoute);
      document.getElementById('btn-execute-mission').addEventListener('click', triggerExecuteMission);
      document.getElementById('btn-upgrade-harnesses').addEventListener('click', triggerUpgradeHarnesses);
      document.getElementById('btn-hero-upgrade').addEventListener('click', () => {
        activateTab('harnesses');
        triggerUpgradeHarnesses();
      });
      document.getElementById('btn-hero-eval').addEventListener('click', async () => {
        activateTab('evals');
        const res = await fetch('/api/queen/eval', { method: 'POST' });
        const data = await res.json();
        if (data.state) {
          state = data.state;
          renderTopMetrics();
          renderEvalsAndArena();
          renderReceipts();
        }
      });
      document.getElementById('form-rust-gate').addEventListener('submit', triggerRustGate);

      // Initial render
      renderTopMetrics();
      renderHarnessesTable();
      renderBrandsSwitchboard();
      renderRustGateBox(state.rustKernelSample);
      renderEvalsAndArena();
      renderReceipts();
      triggerRoute();

      // Live Server-Sent Events (SSE) subscription for real-time CLI & swarm updates
      if (typeof window.EventSource !== 'undefined') {
        try {
          const sse = new EventSource('/api/queen/stream');
          sse.onmessage = (evt) => {
            try {
              const payload = JSON.parse(evt.data);
              if (payload && payload.state) {
                state = payload.state;
                renderTopMetrics();
                renderHarnessesTable();
                renderReceipts();
              }
            } catch {
              // ignore malformed frame
            }
          };
        } catch {
          // non-fatal if SSE unavailable
        }
      }
    })();
  </script>
</body>
</html>`;
}
