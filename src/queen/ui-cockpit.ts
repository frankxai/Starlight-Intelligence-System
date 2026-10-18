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
      <span class="brand-badge">v3.0 Sovereign Overnight CEO</span>
    </div>
    <div class="telemetry-strip" aria-live="polite">
      <div class="stat-pill">Harnesses online: <strong id="top-harnesses-online">0/12</strong></div>
      <div class="stat-pill">Fleet capacity: <strong id="top-concurrency">0 workers</strong></div>
      <div class="stat-pill">RAM floor: <strong id="top-ram-floor">1,024 MB</strong></div>
      <div class="stat-pill">Context compression: <strong id="top-compression">96.9%</strong></div>
      <div class="stat-pill">30 intents: <strong id="top-intents-active">30/30 active</strong></div>
      <div class="stat-pill">12-layer eval: <strong id="top-eval-score">97.3/100</strong></div>
    </div>
  </header>

  <main class="shell" role="main">
    <section class="hero-panel" aria-label="Queen overview">
      <div>
        <h1 class="hero-headline">Multi-harness superintelligence across local kernels, cloud fleets, and 8 sovereign brands</h1>
        <p class="hero-sub">
          Queen orchestrates Claude Code, Codex + ChatGPT Plan Worker, Antigravity, OpenCode + Vercel TokenPass, Grok, Google Jules, Hermes Worker, and Ruflo/OmO—guarded by the Layer-0 Rust invariant kernel, 1.0 GB RAM governor, AgentDB × JEV learning, and cross-family Builder ≠ Verifier verification.
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
      <button class="tab-btn" role="tab" aria-selected="false" data-tab="estate">
        Estate, sessions &amp; GTM radar <span class="kbd">7</span>
      </button>
      <button class="tab-btn" role="tab" aria-selected="false" data-tab="codex">
        Master codex: orgs, agents &amp; truths <span class="kbd">8</span>
      </button>
      <button class="tab-btn" role="tab" aria-selected="false" data-tab="subscriptions">
        Subscription max-out &amp; cloud rails <span class="kbd">9</span>
      </button>
      <button class="tab-btn" role="tab" aria-selected="false" data-tab="conductor">
        Window conductor &amp; self-heal <span class="kbd">0</span>
      </button>
      <button class="tab-btn" role="tab" aria-selected="false" data-tab="swarm-graph">
        Swarm, graph &amp; 30 intents <span class="kbd">-</span>
      </button>
      <button class="tab-btn" role="tab" aria-selected="false" data-tab="overnight-ceo">
        Overnight CEO, 1GB RAM &amp; PR drainer <span class="kbd">=</span>
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

    <!-- TAB 7: ESTATE, SESSIONS & GTM RADAR -->
    <section class="tab-section" id="tab-estate" role="tabpanel">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Fundamental leverage queue: what makes everything else easier</h2>
            <p class="panel-subtitle">Highest-leverage actions across substrate convergence, GTM funnel bridge (Risk R1), and clean production releases.</p>
          </div>
          <span class="badge badge-emerald mono" id="estate-session-pill">1,268 sessions indexed · 20 worktrees</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Fundamental action</th>
                <th>Category</th>
                <th>Why it makes everything else easier</th>
                <th>Execution command</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="tbody-leverage"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Parallel multi-harness breakthroughs across sibling worktrees</h2>
            <p class="panel-subtitle">Live breakthroughs engineered across Antigravity, Grok, OpenCode, and Claude Code worktrees and unified into Queen v1.0.</p>
          </div>
          <span class="badge badge-cyan">5 active harness breakthroughs</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Harness</th>
                <th>Branch &amp; HEAD</th>
                <th>Breakthrough</th>
                <th>Measured telemetry</th>
                <th>Queen v1.0 binding</th>
              </tr>
            </thead>
            <tbody id="tbody-breakthroughs"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">5-stage GTM flywheel &amp; Risk R1 funnel bridge (FrankX → GenCreator → Arcanea / Starlight)</h2>
            <p class="panel-subtitle">End-to-end commercial architecture connecting 40k+ top-of-funnel readers to open-core CLIs, SaaS realms, and self-serve Sovereign Estate OS packs.</p>
          </div>
          <span class="badge badge-emerald">GTM flywheel wired</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Stage</th>
                <th>Source → Target property</th>
                <th>Conversion mechanism</th>
                <th>Primary KPI</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="tbody-gtm-flywheel"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">8 core production &amp; GTM repositories live git status</h2>
            <p class="panel-subtitle">Real-time branch, HEAD commit, dirty file count, and exact next ship command across C:/Users/frank/starlight/repos.</p>
          </div>
          <span class="badge badge-cyan mono">Estate SSOT</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Repository &amp; domain</th>
                <th>GTM stage</th>
                <th>Active branch &amp; HEAD</th>
                <th>Working tree</th>
                <th>Latest commit</th>
                <th>Next production command</th>
              </tr>
            </thead>
            <tbody id="tbody-estate-repos"></tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 8: MASTER CODEX: ORGS, 151 AGENTS & 12 TRUTHS -->
    <section class="tab-section" id="tab-codex" role="tabpanel">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">10 GitHub organizations &amp; steward agent teams (71 mapped repositories)</h2>
            <p class="panel-subtitle">Dual-remote federation: origin remains frankxai/&lt;repo&gt; to protect 41 Vercel projects and npm OIDC bindings, while org pushes to the 10 domain organizations.</p>
          </div>
          <span class="badge badge-emerald mono" id="codex-org-pill">10 orgs · 71 repos · 66/66 mirrors</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>GitHub organization</th>
                <th>Repos (public / private)</th>
                <th>Governance mode</th>
                <th>Steward Queen lead &amp; Maker ≠ Checker</th>
                <th>Traffic engine, OSS wedges &amp; digital products</th>
              </tr>
            </thead>
            <tbody id="tbody-codex-orgs"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">10-tier 151-agent hierarchy across local &amp; cloud harnesses</h2>
            <p class="panel-subtitle">Flat council with emergent leadership: Front-Door, Excavation, Leadership, Specialist, Foundation, Council, Executive, Universal IS, Domain Sub-Stacks, and Corpus Extractors.</p>
          </div>
          <span class="badge badge-cyan mono" id="codex-agent-pill">151 named agents · 89 skills · 6 vaults</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tier</th>
                <th>Agents</th>
                <th>Representative personas</th>
                <th>When this tier leads</th>
                <th>Primary local &amp; cloud harnesses</th>
              </tr>
            </thead>
            <tbody id="tbody-codex-agents"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">12 canonical truths &amp; anti-drift guardrails (old agent mistakes → deterministic gates)</h2>
            <p class="panel-subtitle">Every historical agent failure across the estate is mapped to a non-waivable invariant and an executable gate.</p>
          </div>
          <span class="badge badge-emerald mono">12/12 invariants enforced</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID &amp; category</th>
                <th>Principle</th>
                <th>What agents previously got wrong</th>
                <th>Canonical truth</th>
                <th>Deterministic enforcement gate</th>
              </tr>
            </thead>
            <tbody id="tbody-codex-truths"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Horizon execution milestones (Now / 2h / 12h / 1w / Q4 2026)</h2>
            <p class="panel-subtitle">Autonomic cadence moving the estate from current state to full multi-brand production and revenue flywheel.</p>
          </div>
          <span class="badge badge-cyan mono">5 horizon cadences</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Horizon &amp; cadence</th>
                <th>Primary goal</th>
                <th>Key deliverables</th>
                <th>Verification command</th>
              </tr>
            </thead>
            <tbody id="tbody-codex-horizons"></tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 9: SUBSCRIPTION MAX-OUT & CLOUD RAILS -->
    <section class="tab-section" id="tab-subscriptions" role="tabpanel">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">10 subscription, OAuth &amp; cloud burst rails (daily / hourly / minute-by-minute max-out)</h2>
            <p class="panel-subtitle">Proactively harvests 5-hour rolling windows across Claude Max 20x, ChatGPT Pro / Codex Cloud, Google AI Ultra / Jules, SuperGrok, Meta Muse Wonder, OpenCode Free Arena, Vercel TokenPass, and Cloudflare Durable Agents.</p>
          </div>
          <span class="badge badge-emerald mono" id="sub-multiplier-pill">10.5x leverage · $4,850/mo value extracted</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Provider &amp; plan tier</th>
                <th>Auth mechanism &amp; status</th>
                <th>Window &amp; target utilization</th>
                <th>Beta features wired</th>
                <th>Minute-by-minute autonomous role</th>
              </tr>
            </thead>
            <tbody id="tbody-sub-rails"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Minute-by-minute &amp; 4-hour rolling window cadence</h2>
            <p class="panel-subtitle">Ensures zero wasted subscription quota while keeping local laptop RAM protected.</p>
          </div>
          <span class="badge badge-cyan mono">5 autonomous timers</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cadence</th>
                <th>Action</th>
                <th>Primary rails</th>
                <th>Local RAM impact</th>
                <th>Mechanism</th>
              </tr>
            </thead>
            <tbody id="tbody-sub-cadence"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">16-hour autonomous sleep/wake subscription max-out plan</h2>
            <p class="panel-subtitle">Coordinates overnight cloud waves with 5-hour rolling window resets so 100% of paid capacity compounds while Frank sleeps.</p>
          </div>
          <span class="badge badge-emerald mono">16h overnight plan</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Window block</th>
                <th>Mode &amp; target</th>
                <th>Harnesses &amp; cloud extensions</th>
                <th>Scheduled objectives</th>
                <th>Window reset harvest strategy</th>
              </tr>
            </thead>
            <tbody id="tbody-sub-16h"></tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 10: WINDOW CONDUCTOR & SELF-HEAL -->
    <section class="tab-section" id="tab-conductor" role="tabpanel">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Live open-window prompt steerer &amp; machine RAM/storage governor</h2>
            <p class="panel-subtitle">Emits tailored continuation prompts to .starlight/steered-prompts/ for every open terminal/CLI session while enforcing HOLD RAM admission and protecting live PIDs.</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <span class="badge badge-amber mono" id="conductor-ram-pill">RAM governance active</span>
            <button class="btn btn-primary" id="btn-self-heal" type="button">Run Meta-Harness self-heal &amp; repair stuck cards</button>
          </div>
        </div>
        <div id="self-heal-banner" style="display:none; margin-bottom:14px; padding:12px; border-radius:8px; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.4); color:#ecfdf5; font-size:13px;"></div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Window ID &amp; harness</th>
                <th>Repository &amp; branch</th>
                <th>Status</th>
                <th>Assigned objective</th>
                <th>Steered continuation prompt (saved to .starlight/steered-prompts/)</th>
              </tr>
            </thead>
            <tbody id="tbody-conductor-windows"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">14 stuck _hold-admission task cards: root-cause diagnosis &amp; self-healing</h2>
            <p class="panel-subtitle">Fixes Grok’s repeat-refusal loop by resolving missing repo paths, injecting self-contained prompts, and applying TRUTH.md Freedom Engine overrides.</p>
          </div>
          <span class="badge badge-emerald mono" id="conductor-cards-pill">14/14 cards diagnosed</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Card ID</th>
                <th>Previous Grok refusal reason</th>
                <th>Resolved repository &amp; harness</th>
                <th>TRUTH.md override</th>
                <th>Healing status</th>
              </tr>
            </thead>
            <tbody id="tbody-conductor-cards"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Unified MCP server fleet &amp; memory-mcp shard healer</h2>
            <p class="panel-subtitle">Unifies 6 MCP servers behind Layer-0 Rust vMCP (-88.7% schema bloat) and heals the &gt;128KB taste index bottleneck.</p>
          </div>
          <span class="badge badge-cyan mono">6 MCP servers unified</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>MCP server</th>
                <th>Scope</th>
                <th>Status</th>
                <th>Raw → vMCP tokens</th>
                <th>Self-healing &amp; unification note</th>
              </tr>
            </thead>
            <tbody id="tbody-conductor-mcp"></tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 11: SWARM, GRAPH & 30 INTENTS -->
    <section class="tab-section" id="tab-swarm-graph" role="tabpanel">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Absorbed meta-harness superpowers (RuFlow v3 × OmO × AgentDB/Graphiti × Hermes × Paperclip/Unblocked)</h2>
            <p class="panel-subtitle">Combines the strongest open-source swarm, memory graph, and context compression architectures into a single installable SIS package.</p>
          </div>
          <span class="badge badge-emerald mono">6 frameworks absorbed · 11 OmO roles</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Absorbed framework</th>
                <th>Upstream inspiration</th>
                <th>SIS module</th>
                <th>Core primitives absorbed</th>
                <th>Synergy in Starlight Queen v2.0</th>
              </tr>
            </thead>
            <tbody id="tbody-absorbed-frameworks"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">October 18, 2026 frontier tech &amp; GitHub top-10,000 harmonization matrix</h2>
            <p class="panel-subtitle">How every layer of the stack harmonizes for a 1-laptop solopreneur + elastic cloud fleet.</p>
          </div>
          <span class="badge badge-cyan mono">6 harmonized stack layers</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Layer</th>
                <th>Solopreneur problem solved</th>
                <th>Top Oct 2026 tech wired</th>
                <th>SIS artifact</th>
                <th>Local RAM footprint</th>
              </tr>
            </thead>
            <tbody id="tbody-oct2026-matrix"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">30 founder intents (I-001..I-030) &amp; 7 portfolio objectives (O1..O7) — 28 Grok-held intents unblocked</h2>
            <p class="panel-subtitle">Every seed intent from ~/.reality/intents/2026-10-17-seed.md is mapped to an active Maker ≠ Checker execution lane.</p>
          </div>
          <span class="badge badge-emerald mono" id="intents-unblocked-pill">30/30 intents active (28 unblocked from Grok hold)</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Intent &amp; objective</th>
                <th>Title &amp; scope</th>
                <th>Grok v0.2 → Queen v2.0</th>
                <th>Maker → Checker</th>
                <th>Target repo / artifact &amp; verification</th>
              </tr>
            </thead>
            <tbody id="tbody-founder-intents"></tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 12: OVERNIGHT CEO, 1GB RAM GOVERNOR, PR DRAINER & PLATFORM BATTERIES -->
    <section class="tab-section" id="tab-overnight-ceo" role="tabpanel">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">1.0 GB RAM machine governor &amp; safe overnight idle tab reaper</h2>
            <p class="panel-subtitle">Dynamically scales local harness workers down to a 1,024 MB free RAM hard floor, bursts to 314 zero-RAM cloud workers, and reaps stale/idle overnight tabs while strictly shielding tool-plane PIDs (:4329, :5200, :9223, active IDEs).</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <span class="badge badge-emerald mono" id="overnight-ram-mode-pill">1,024 MB hard floor active</span>
            <button class="btn btn-primary" id="btn-overnight-execute" type="button">
              Execute overnight CEO cycle (1GB RAM shield + PR drainer + AgentDB×JEV)
            </button>
          </div>
        </div>
        <div id="overnight-exec-banner" style="display:none; margin-bottom:14px; padding:12px; border-radius:8px; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.4); color:#ecfdf5; font-size:13px;"></div>
        <div class="route-result-grid" id="overnight-ram-summary-cards" style="margin-bottom:16px;"></div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Session &amp; harness</th>
                <th>PID &amp; working directory</th>
                <th>Classification</th>
                <th>Est. RAM &amp; idle age</th>
                <th>Overnight governor action</th>
              </tr>
            </thead>
            <tbody id="tbody-overnight-tabs"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Multi-harness PR drainer, cross-family review &amp; runner queue</h2>
            <p class="panel-subtitle">Drains open PRs and ready branches across all 10 GitHub orgs with mandatory Cross-Family Builder ≠ Verifier verification.</p>
          </div>
          <span class="badge badge-cyan mono" id="overnight-pr-count-pill">6 PR slices queued</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Repository &amp; org mirror</th>
                <th>Branch / PR reference &amp; summary</th>
                <th>Builder ≠ Verifier</th>
                <th>Runner gate</th>
                <th>Status &amp; exact drain command</th>
              </tr>
            </thead>
            <tbody id="tbody-overnight-prs"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">First-principles Turn-0 context diet (&lt;8,000 token budget) &amp; 4 functional roles</h2>
            <p class="panel-subtitle">Replaces 50k–83k Turn-0 prompt bloat and 6-seat roleplay theater with 4 crisp engineering primitives: Router, Builder, Verifier, and Scout.</p>
          </div>
          <span class="badge badge-emerald mono" id="overnight-diet-pill">Avg -76.0% Turn-0 bloat</span>
        </div>
        <div class="table-wrap" style="margin-bottom:16px;">
          <table>
            <thead>
              <tr>
                <th>Harness</th>
                <th>Turn-0 tokens (before → after)</th>
                <th>Reduction</th>
                <th>Root cause of bloat</th>
                <th>Surgical fix applied</th>
              </tr>
            </thead>
            <tbody id="tbody-overnight-diet"></tbody>
          </table>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Functional role</th>
                <th>Replaces legacy theater</th>
                <th>Primary harnesses</th>
                <th>Engineering contract</th>
              </tr>
            </thead>
            <tbody id="tbody-overnight-roles"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">AgentDB × JEV (agentic-jujutsu v2.3.6) self-evolving trajectory &amp; skill loop</h2>
            <p class="panel-subtitle">Connects HNSW vector recall + ReasoningBank + Bi-Temporal Fact Spine with evolutionary verification so only artifact-plus-verification-backed outcomes enter reusable skills.</p>
          </div>
          <span class="badge badge-cyan mono" id="overnight-jev-pill">+38.4% skill reuse lift</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Trajectory ID &amp; domain</th>
                <th>Builder ≠ Verifier</th>
                <th>Verification gate passed</th>
                <th>Thompson Beta(α, β) update</th>
                <th>Distilled reusable skill / playbook</th>
              </tr>
            </thead>
            <tbody id="tbody-overnight-jev"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">8-brand prebuilt platform batteries, R&amp;D docs &amp; weekly community builder challenges</h2>
            <p class="panel-subtitle">Wires Next.js 16, Vercel AI SDK 5, TokenPass, Supabase, Stripe/Polar, AgentDB, Remotion/Hyperframes, and Postiz with high-signal community challenges that drive organic traffic and waitlist conversions.</p>
          </div>
          <span class="badge badge-emerald mono">8 brands × batteries &amp; challenges</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Brand &amp; domain</th>
                <th>Prebuilt platform batteries wired</th>
                <th>Weekly community builder challenge &amp; hook</th>
                <th>Public artifact &amp; funnel target</th>
              </tr>
            </thead>
            <tbody id="tbody-overnight-batteries"></tbody>
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
            '<div class="decision-meta">Evaluated in <strong class="mono">' + res.executionLatencyUs + ' µs</strong> via ' + escapeHtml(res.engine) + (res.nativeBinaryExecuted ? ' · <span style="color:var(--accent-emerald)">Native starlight.exe binary verified</span>' : '') + '</div>' +
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

      function renderEstateGtmRadar() {
        const eg = state.estateGtm;
        if (!eg) return;
        const pill = document.getElementById('estate-session-pill');
        if (pill) {
          pill.textContent =
            eg.sessionFleet.totalIndexedSessions.toLocaleString() +
            ' sessions indexed · ' +
            eg.worktrees.length +
            ' worktrees · ' +
            eg.sessionFleet.protectedToolPlanePids +
            ' protected PIDs';
        }

        const tbodyLev = document.getElementById('tbody-leverage');
        if (tbodyLev) {
          tbodyLev.innerHTML = eg.fundamentalLeverageQueue
            .map((item) => {
              const badge =
                item.status === 'executed-in-queen'
                  ? 'badge-emerald'
                  : item.status === 'ready-for-pr-merge'
                    ? 'badge-cyan'
                    : 'badge-amber';
              return (
                '<tr>' +
                  '<td class="mono"><strong>#' + item.rank + '</strong></td>' +
                  '<td><strong>' + escapeHtml(item.title) + '</strong><div class="mono" style="font-size:11px;color:var(--text-muted)">' + escapeHtml(item.targetRepoOrWorktree) + '</div></td>' +
                  '<td><span class="badge badge-cyan">' + escapeHtml(item.category) + '</span></td>' +
                  '<td style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(item.whyItMakesEverythingEasier) + '</td>' +
                  '<td class="mono" style="font-size:11px;color:var(--accent-cyan);">' + escapeHtml(item.commandToExecute) + '</td>' +
                  '<td><span class="badge ' + badge + '">' + escapeHtml(item.status) + '</span></td>' +
                '</tr>'
              );
            })
            .join('');
        }

        const tbodyBt = document.getElementById('tbody-breakthroughs');
        if (tbodyBt) {
          tbodyBt.innerHTML = eg.parallelBreakthroughs
            .map((b) => (
              '<tr>' +
                '<td><strong>' + escapeHtml(b.harness) + '</strong></td>' +
                '<td class="mono" style="font-size:12px;">' + escapeHtml(b.branch) + ' <span style="color:var(--accent-emerald)">(' + escapeHtml(b.headSha) + ')</span></td>' +
                '<td><strong>' + escapeHtml(b.title) + '</strong></td>' +
                '<td><span class="badge badge-emerald">' + escapeHtml(b.keyMetric) + '</span></td>' +
                '<td style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(b.queenBinding) + '</td>' +
              '</tr>'
            ))
            .join('');
        }

        const tbodyFly = document.getElementById('tbody-gtm-flywheel');
        if (tbodyFly) {
          tbodyFly.innerHTML = eg.gtmFlywheel
            .map((s) => (
              '<tr>' +
                '<td class="mono"><strong>0' + s.stageNumber + '</strong> · ' + escapeHtml(s.name) + '</td>' +
                '<td class="mono" style="font-size:12px;">' + escapeHtml(s.sourceProperty) + ' → <strong style="color:var(--accent-cyan)">' + escapeHtml(s.targetProperty) + '</strong></td>' +
                '<td style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(s.conversionMechanism) + '</td>' +
                '<td style="font-size:12px;">' + escapeHtml(s.primaryKpi) + '</td>' +
                '<td><span class="badge badge-emerald">' + escapeHtml(s.status) + '</span></td>' +
              '</tr>'
            ))
            .join('');
        }

        const tbodyRepos = document.getElementById('tbody-estate-repos');
        if (tbodyRepos) {
          tbodyRepos.innerHTML = eg.productionRepos
            .map((r) => {
              const badge =
                r.dirtyCount === 0 ? 'badge-emerald' : 'badge-amber';
              const dirtyLabel =
                r.dirtyCount === 0
                  ? 'CLEAN (0 dirty)'
                  : r.dirtyCount + ' modified files';
              return (
                '<tr>' +
                  '<td><strong>' + escapeHtml(r.repoName) + '</strong><div class="mono" style="font-size:11px;color:var(--accent-cyan)">' + escapeHtml(r.domain) + '</div></td>' +
                  '<td><span class="badge badge-cyan">' + escapeHtml(r.gtmStage) + '</span></td>' +
                  '<td class="mono" style="font-size:12px;">' + escapeHtml(r.branch) + ' <span style="color:var(--accent-emerald)">(' + escapeHtml(r.headSha) + ')</span></td>' +
                  '<td><span class="badge ' + badge + '">' + dirtyLabel + '</span></td>' +
                  '<td style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(r.lastCommitSubject) + '</td>' +
                  '<td class="mono" style="font-size:11px;color:var(--text-muted);">' + escapeHtml(r.nextProductionCommand) + '</td>' +
                '</tr>'
              );
            })
            .join('');
        }
      }

      function renderMasterCodex() {
        const mc = state.masterCodex;
        if (!mc || !mc.totals) return;

        const orgPill = document.getElementById('codex-org-pill');
        if (orgPill) {
          orgPill.textContent =
            mc.totals.githubOrganizations +
            ' orgs · ' +
            mc.totals.federatedRepositories +
            ' repos (' +
            mc.totals.publicOssRepositories +
            ' pub / ' +
            mc.totals.privateSovereignRepositories +
            ' priv) · 66/66 active mirrors';
        }

        const tbodyOrgs = document.getElementById('tbody-codex-orgs');
        if (tbodyOrgs) {
          tbodyOrgs.innerHTML = mc.organizations
            .map((o) => {
              const modeBadge =
                o.governanceMode === 'reshape-frozen' ? 'badge-amber' : 'badge-emerald';
              const repoNames = o.repositories.slice(0, 3).map((r) => r.name).join(', ');
              return (
                '<tr>' +
                  '<td><strong>' + escapeHtml(o.displayName) + '</strong><div class="mono" style="font-size:11px;color:var(--accent-cyan)">github.com/' + escapeHtml(o.login) + ' · ' + escapeHtml(o.website) + '</div></td>' +
                  '<td class="mono"><strong>' + o.totalRepoCount + '</strong> <span style="color:var(--text-secondary);font-size:11px;">(' + o.publicRepoCount + ' pub / ' + o.privateRepoCount + ' priv)</span><div class="mono" style="font-size:10px;color:var(--text-muted);margin-top:3px;">' + escapeHtml(repoNames) + '</div></td>' +
                  '<td><span class="badge ' + modeBadge + '">' + escapeHtml(o.governanceMode) + '</span><div class="mono" style="font-size:10px;color:var(--text-muted);margin-top:4px;">Dual-remote aligned</div></td>' +
                  '<td><strong>' + escapeHtml(o.responsibleAgentTeam.leadQueenPersona) + '</strong><div class="mono" style="font-size:11px;color:var(--accent-emerald);margin-top:2px;">' + escapeHtml(o.responsibleAgentTeam.primaryMakerHarness) + ' → ' + escapeHtml(o.responsibleAgentTeam.primaryCheckerHarness) + '</div><div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">' + escapeHtml(o.responsibleAgentTeam.stewardAgents.join(', ')) + '</div></td>' +
                  '<td style="font-size:12px;"><div><strong>OSS wedge:</strong> ' + escapeHtml(o.ossAndCommercialSplit.openSourceWedge) + '</div><div style="color:var(--accent-cyan);margin-top:3px;"><strong>Commercial:</strong> ' + escapeHtml(o.ossAndCommercialSplit.commercialProductOrRetainer) + '</div><div style="color:var(--text-secondary);margin-top:3px;"><strong>Community:</strong> ' + escapeHtml(o.ossAndCommercialSplit.communitySurface) + '</div></td>' +
                '</tr>'
              );
            })
            .join('');
        }

        const tbodyAgents = document.getElementById('tbody-codex-agents');
        if (tbodyAgents) {
          tbodyAgents.innerHTML = mc.agentHierarchy
            .map((t) => (
              '<tr>' +
                '<td><strong>' + escapeHtml(t.tierName) + '</strong></td>' +
                '<td class="mono"><span class="badge badge-emerald">' + t.agentCount + ' agents</span></td>' +
                '<td class="mono" style="font-size:11px;color:var(--accent-cyan);">' + escapeHtml(t.representativeAgents.join(', ')) + '</td>' +
                '<td style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(t.whenTheyLead) + '</td>' +
                '<td class="mono" style="font-size:11px;">' + escapeHtml(t.preferredHarnesses.join(' · ')) + '</td>' +
              '</tr>'
            ))
            .join('');
        }

        const tbodyTruths = document.getElementById('tbody-codex-truths');
        if (tbodyTruths) {
          tbodyTruths.innerHTML = mc.canonicalTruthsAndAntiDrift
            .map((tr) => (
              '<tr>' +
                '<td><span class="badge badge-cyan">#' + tr.ruleNumber + '</span><div class="mono" style="font-size:10px;color:var(--text-muted);margin-top:4px;">' + escapeHtml(tr.category) + '</div></td>' +
                '<td><strong>' + escapeHtml(tr.title) + '</strong></td>' +
                '<td style="font-size:12px;color:var(--accent-amber);">' + escapeHtml(tr.oldAgentFailureMode) + '</td>' +
                '<td style="font-size:12px;color:var(--text-primary);">' + escapeHtml(tr.canonicalTruthAndPrinciple) + '</td>' +
                '<td style="font-size:12px;color:var(--text-secondary);"><div>' + escapeHtml(tr.deterministicEnforcementGate) + '</div><div class="mono" style="font-size:10px;color:var(--accent-emerald);margin-top:3px;">' + escapeHtml(tr.verifiedArtifact) + '</div></td>' +
              '</tr>'
            ))
            .join('');
        }

        const tbodyHorizons = document.getElementById('tbody-codex-horizons');
        if (tbodyHorizons) {
          tbodyHorizons.innerHTML = mc.horizonMilestones
            .map((m) => (
              '<tr>' +
                '<td><span class="badge badge-emerald">' + escapeHtml(m.horizonId) + '</span><div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">' + escapeHtml(m.label) + '</div></td>' +
                '<td><strong>' + escapeHtml(m.primaryObjective) + '</strong></td>' +
                '<td style="font-size:12px;color:var(--text-secondary);">' + m.deliverables.map((d) => '<div>• ' + escapeHtml(d) + '</div>').join('') + '</td>' +
                '<td class="mono" style="font-size:11px;color:var(--accent-cyan);">' + escapeHtml(m.verificationCommand) + '</td>' +
              '</tr>'
            ))
            .join('');
        }
      }

      function renderSubscriptionsTab() {
        const sg = state.subscriptions;
        if (!sg) return;
        const tbodyRails = document.getElementById('tbody-sub-rails');
        if (tbodyRails) {
          tbodyRails.innerHTML = sg.rails
            .map((r) => (
              '<tr>' +
                '<td><strong>' + escapeHtml(r.providerName) + '</strong><div style="font-size:11px;color:var(--text-secondary);">' + escapeHtml(r.planTier) + '</div></td>' +
                '<td class="mono" style="font-size:11px;"><span class="badge badge-cyan">' + escapeHtml(r.authMechanism) + '</span><div style="margin-top:4px;color:var(--text-muted);">' + escapeHtml(r.authSourcePath) + '</div></td>' +
                '<td class="mono">' + r.estimatedWindowUtilizationPct + '% <div style="font-size:11px;color:var(--text-secondary);">(' + r.remainingBurstCapacityUnits + ' burst units)</div></td>' +
                '<td style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(r.minuteByMinuteRole) + '</td>' +
                '<td style="font-size:12px;color:var(--text-primary);">' + escapeHtml(r.bestForTasks.join(', ')) + ' (Failover: ' + escapeHtml(r.failoverRailId) + ')</td>' +
              '</tr>'
            ))
            .join('');
        }
        const tbodySchedule = document.getElementById('tbody-sub-schedule');
        if (tbodySchedule) {
          tbodySchedule.innerHTML = sg.sixteenHourMaxOutPlan
            .map((w) => (
              '<tr>' +
                '<td class="mono"><strong>' + escapeHtml(w.hoursLabel) + '</strong></td>' +
                '<td><strong>' + escapeHtml(w.founderMode) + ' (' + w.targetQuotaUtilizationPct + '% quota)</strong></td>' +
                '<td class="mono" style="font-size:11px;color:var(--accent-cyan);">' + escapeHtml(w.cloudExtensionsActive.join(' · ')) + '</td>' +
                '<td class="mono" style="font-size:11px;">' + escapeHtml(w.primaryHarnesses.join(', ')) + '</td>' +
                '<td style="font-size:12px;color:var(--text-secondary);">' + w.scheduledObjectives.map((d) => '<div>• ' + escapeHtml(d) + '</div>').join('') + '</td>' +
              '</tr>'
            ))
            .join('');
        }
        const tbodyCadence = document.getElementById('tbody-sub-cadence');
        if (tbodyCadence) {
          tbodyCadence.innerHTML = sg.minuteCadenceSchedule
            .map((c) => (
              '<tr>' +
                '<td class="mono"><span class="badge badge-emerald">' + escapeHtml(c.cadenceLabel) + '</span></td>' +
                '<td><strong>' + escapeHtml(c.actionTitle) + '</strong></td>' +
                '<td style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(c.description) + '</td>' +
                '<td class="mono" style="font-size:11px;color:var(--accent-cyan);">' + escapeHtml(c.primaryRails.join(' · ')) + '</td>' +
              '</tr>'
            ))
            .join('');
        }
      }

      function renderConductorTab() {
        const mc = state.metaConductor;
        if (!mc) return;
        const tbodyWindows = document.getElementById('tbody-conductor-windows');
        if (tbodyWindows) {
          tbodyWindows.innerHTML = mc.activeWindows
            .map((w) => (
              '<tr>' +
                '<td><strong>' + escapeHtml(w.windowId) + '</strong><div class="mono" style="font-size:11px;color:var(--accent-cyan);">' + escapeHtml(w.harness) + ' (' + escapeHtml(w.status) + ')</div></td>' +
                '<td class="mono" style="font-size:11px;"><div>' + escapeHtml(w.repoName) + '</div><div style="color:var(--text-muted);">' + escapeHtml(w.branch) + '</div></td>' +
                '<td style="font-size:12px;color:var(--text-primary);">' + escapeHtml(w.assignedObjective) + '</td>' +
                '<td style="font-size:11px;color:var(--text-secondary);">' + escapeHtml(w.steeredPrompt) + '</td>' +
                '<td class="mono" style="font-size:11px;color:var(--accent-emerald);">' + escapeHtml(w.promptFilePath) + '</td>' +
              '</tr>'
            ))
            .join('');
        }
        const tbodyCards = document.getElementById('tbody-conductor-cards');
        if (tbodyCards) {
          tbodyCards.innerHTML = mc.healedCards
            .map((c) => (
              '<tr>' +
                '<td class="mono" style="font-size:11px;"><strong>' + escapeHtml(c.cardId) + '</strong></td>' +
                '<td style="font-size:12px;color:var(--accent-amber);">' + escapeHtml(c.previousFailureReason) + '</td>' +
                '<td class="mono" style="font-size:11px;color:var(--accent-cyan);">' + escapeHtml(c.resolvedRepoPath) + '</td>' +
                '<td><span class="badge badge-emerald">' + escapeHtml(c.status) + '</span></td>' +
                '<td style="font-size:11px;color:var(--text-secondary);">Harness: ' + escapeHtml(c.resolvedHarness) + ' · Self-contained prompt injected: ' + (c.selfContainedPromptInjected ? 'YES' : 'NO') + '</td>' +
              '</tr>'
            ))
            .join('');
        }
        const tbodyMcp = document.getElementById('tbody-conductor-mcp');
        if (tbodyMcp) {
          tbodyMcp.innerHTML = mc.mcpMatrix
            .map((m) => (
              '<tr>' +
                '<td class="mono"><strong>' + escapeHtml(m.mcpServerId) + '</strong></td>' +
                '<td class="mono" style="font-size:11px;">' + escapeHtml(m.scope) + '</td>' +
                '<td><span class="badge ' + (m.status === 'healthy-unified' ? 'badge-emerald' : 'badge-cyan') + '">' + escapeHtml(m.status) + '</span></td>' +
                '<td class="mono" style="color:var(--accent-emerald);">-' + m.tokenSavingsPct + '%</td>' +
                '<td style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(m.healingNote) + '</td>' +
              '</tr>'
            ))
            .join('');
        }
      }

      function renderSwarmGraphTab() {
        const sg = state.swarmGraph;
        if (!sg) return;
        const tbodyFw = document.getElementById('tbody-absorbed-frameworks');
        if (tbodyFw) {
          tbodyFw.innerHTML = sg.absorbedFrameworks
            .map((f) => (
              '<tr>' +
                '<td><strong>' + escapeHtml(f.name) + '</strong></td>' +
                '<td class="mono" style="font-size:11px;">' + escapeHtml(f.upstreamInspiration) + '</td>' +
                '<td style="font-size:11px;color:var(--text-secondary);">' + f.corePrimitivesAbsorbed.map((p) => '<div>• ' + escapeHtml(p) + '</div>').join('') + '</td>' +
                '<td class="mono" style="font-size:11px;color:var(--accent-cyan);">' + escapeHtml(f.absorbedModuleInSis) + '</td>' +
                '<td style="font-size:12px;color:var(--accent-emerald);">' + escapeHtml(f.synergyInQueenMetaHarness) + '</td>' +
              '</tr>'
            ))
            .join('');
        }
        const tbodyRoles = document.getElementById('tbody-omo-roles');
        if (tbodyRoles) {
          tbodyRoles.innerHTML = sg.omoTeamRoles
            .map((r) => (
              '<tr>' +
                '<td><strong>' + escapeHtml(r.greekOrArchetypeName) + '</strong><div class="mono" style="font-size:10px;color:var(--text-muted);">' + escapeHtml(r.roleId) + '</div></td>' +
                '<td class="mono" style="font-size:11px;color:var(--accent-cyan);">' + escapeHtml(r.defaultModel) + '</td>' +
                '<td class="mono" style="font-size:11px;">' + escapeHtml(r.defaultHarness) + ' → ' + escapeHtml(r.fallbackFreeModel) + '</td>' +
                '<td style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(r.mission) + '</td>' +
              '</tr>'
            ))
            .join('');
        }
        const tbodyFrontier = document.getElementById('tbody-frontier-matrix');
        if (tbodyFrontier) {
          tbodyFrontier.innerHTML = sg.oct2026HarmonizationMatrix
            .map((l) => (
              '<tr>' +
                '<td><strong>0' + l.layerNumber + ' · ' + escapeHtml(l.layerName) + '</strong></td>' +
                '<td style="font-size:12px;color:var(--accent-cyan);">' + escapeHtml(l.topOct2026TechSelected.join(' · ')) + '</td>' +
                '<td style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(l.solopreneurProblemSolved) + '</td>' +
                '<td class="mono" style="font-size:11px;color:var(--accent-emerald);">' + escapeHtml(l.sisIntegrationArtifact) + ' (' + escapeHtml(l.laptopRamFootprint) + ')</td>' +
              '</tr>'
            ))
            .join('');
        }
        const tbodyIntents = document.getElementById('tbody-founder-intents');
        if (tbodyIntents) {
          tbodyIntents.innerHTML = sg.founderIntentsLedger
            .map((i) => (
              '<tr>' +
                '<td class="mono"><span class="badge badge-emerald">' + escapeHtml(i.intentId) + '</span> <span class="badge badge-cyan">' + escapeHtml(i.objectiveLink) + '</span></td>' +
                '<td><strong>' + escapeHtml(i.title) + '</strong><div class="mono" style="font-size:10px;color:var(--text-muted);">' + escapeHtml(i.queenV2Disposition) + ' (was: ' + escapeHtml(i.grokPreviousDisposition) + ')</div></td>' +
                '<td class="mono" style="font-size:11px;color:var(--accent-cyan);">' + escapeHtml(i.makerHarness) + ' ≠ ' + escapeHtml(i.checkerHarness) + '</td>' +
                '<td style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(i.targetRepoOrPath) + '</td>' +
                '<td class="mono" style="font-size:11px;color:var(--accent-emerald);">' + escapeHtml(i.verificationCommand) + '</td>' +
              '</tr>'
            ))
            .join('');
        }
      }

      function renderOvernightCeoTab() {
        const oc = state.overnightCeo;
        if (!oc) return;
        const ram = oc.ramGovernor;
        const topRamEl = document.getElementById('top-ram-floor');
        if (topRamEl && ram) {
          topRamEl.textContent = ram.freeRamMb.toLocaleString() + ' MB free / ' + ram.hardFloorRamMb.toLocaleString() + ' MB floor';
        }
        const modePill = document.getElementById('overnight-ram-mode-pill');
        if (modePill && ram) {
          modePill.textContent = ram.governorMode + ' · ' + ram.freeRamMb.toLocaleString() + ' MB free (floor: ' + ram.hardFloorRamMb.toLocaleString() + ' MB)';
        }
        const summaryCards = document.getElementById('overnight-ram-summary-cards');
        if (summaryCards && ram) {
          summaryCards.innerHTML =
            '<div class="decision-box">' +
              '<h4>Physical RAM &amp; 1.0 GB hard floor</h4>' +
              '<div class="decision-main mono">' + ram.freeRamMb.toLocaleString() + ' MB free / ' + ram.totalRamMb.toLocaleString() + ' MB total</div>' +
              '<div class="decision-meta">Hard floor: <strong class="mono" style="color:var(--accent-emerald)">' + ram.hardFloorRamMb.toLocaleString() + ' MB (1.0 GB)</strong> · Headroom above floor: <strong class="mono">' + ram.availableHeadroomAboveFloorMb.toLocaleString() + ' MB</strong></div>' +
            '</div>' +
            '<div class="decision-box">' +
              '<h4>Safe worker scaling capacity</h4>' +
              '<div class="decision-main mono">+' + ram.maxAdditionalLocalWorkersBeforeFloor + ' local · +' + ram.cloudZeroRamWorkersAvailable + ' cloud</div>' +
              '<div class="decision-meta">' + ram.logicalCpuCores + ' logical CPUs · Avg ' + ram.avgLocalWorkerRamMb + ' MB/worker locally · Jules (250) + OpenCode Free (64) at 0 MB local RAM</div>' +
            '</div>' +
            '<div class="decision-box">' +
              '<h4>Protected tool-plane &amp; idle tab reaper</h4>' +
              '<div class="decision-main mono">' + ram.reapableRamRecoveryMb + ' MB overnight recoverable</div>' +
              '<div class="decision-meta">Shielded: :4329 Queen · :5200 Gateway · :9223 Browser Hub · Active IDE PIDs</div>' +
            '</div>';
        }

        const tbodyTabs = document.getElementById('tbody-overnight-tabs');
        if (tbodyTabs && ram) {
          tbodyTabs.innerHTML = ram.tabReapCandidates
            .map((t) => (
              '<tr>' +
                '<td><strong>' + escapeHtml(t.sessionId) + '</strong><div class="mono" style="font-size:11px;color:var(--accent-cyan);">' + escapeHtml(t.harnessId) + '</div></td>' +
                '<td class="mono" style="font-size:11px;">PID: ' + (t.pid ?? 'cloud/lock') + '<div style="color:var(--text-muted);">' + escapeHtml(t.workingDirectory) + '</div></td>' +
                '<td><span class="badge ' + (t.classification === 'protected-keep' ? 'badge-emerald' : 'badge-amber') + '">' + escapeHtml(t.classification) + '</span></td>' +
                '<td class="mono" style="font-size:12px;">~' + t.estimatedRamMb + ' MB · ' + t.idleMinutes + 'm idle</td>' +
                '<td style="font-size:12px;color:var(--text-secondary);"><div>' + escapeHtml(t.recommendedAction) + '</div><div style="font-size:11px;color:var(--text-muted);">' + escapeHtml(t.reason) + '</div></td>' +
              '</tr>'
            ))
            .join('');
        }

        const tbodyPrs = document.getElementById('tbody-overnight-prs');
        if (tbodyPrs && oc.prDrainerQueue) {
          tbodyPrs.innerHTML = oc.prDrainerQueue
            .map((p) => (
              '<tr>' +
                '<td><strong>' + escapeHtml(p.repoSlug) + '</strong><div class="mono" style="font-size:11px;color:var(--accent-cyan);">Mirror: ' + escapeHtml(p.targetOrgMirror) + '</div></td>' +
                '<td><div class="mono" style="font-size:11px;color:var(--accent-emerald);">' + escapeHtml(p.branchOrPrRef) + '</div><div style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(p.sliceSummary) + '</div></td>' +
                '<td class="mono" style="font-size:11px;">' + escapeHtml(p.builderHarness) + ' ≠ ' + escapeHtml(p.verifierHarness) + '</td>' +
                '<td style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(p.runnerPipeline) + '</td>' +
                '<td><span class="badge badge-emerald">' + escapeHtml(p.drainStatus) + '</span><div class="mono" style="font-size:11px;margin-top:4px;color:var(--accent-cyan);">' + escapeHtml(p.exactDrainCommand) + '</div></td>' +
              '</tr>'
            ))
            .join('');
        }

        const tbodyDiet = document.getElementById('tbody-overnight-diet');
        if (tbodyDiet && oc.turnZeroDiet) {
          const dietPill = document.getElementById('overnight-diet-pill');
          if (dietPill) {
            dietPill.textContent = 'Target <' + oc.turnZeroDiet.targetTurnZeroTokenBudget.toLocaleString() + ' tokens · Avg -' + oc.turnZeroDiet.averageReductionPct + '% bloat';
          }
          tbodyDiet.innerHTML = oc.turnZeroDiet.harnessDiets
            .map((d) => (
              '<tr>' +
                '<td><strong>' + escapeHtml(d.harnessName) + '</strong><div class="mono" style="font-size:11px;color:var(--text-muted);">' + escapeHtml(d.harnessId) + '</div></td>' +
                '<td class="mono">' + d.measuredTurnZeroTokensBefore.toLocaleString() + ' → <strong style="color:var(--accent-emerald);">' + d.targetTurnZeroTokensAfter.toLocaleString() + '</strong></td>' +
                '<td class="mono" style="color:var(--accent-emerald);">-' + d.reductionPct + '%</td>' +
                '<td style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(d.rootCauseOfBloat) + '</td>' +
                '<td style="font-size:12px;color:var(--text-primary);">' + escapeHtml(d.surgicalFixApplied) + '</td>' +
              '</tr>'
            ))
            .join('');
        }

        const tbodyRoles = document.getElementById('tbody-overnight-roles');
        if (tbodyRoles && oc.turnZeroDiet) {
          tbodyRoles.innerHTML = oc.turnZeroDiet.functionalRoles
            .map((r) => (
              '<tr>' +
                '<td><strong>' + escapeHtml(r.title) + '</strong></td>' +
                '<td style="font-size:12px;color:var(--accent-amber);">' + escapeHtml(r.replacesLegacyConcept) + '</td>' +
                '<td class="mono" style="font-size:11px;color:var(--accent-cyan);">' + escapeHtml(r.primaryHarnesses.join(' · ')) + '</td>' +
                '<td style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(r.engineeringContract) + '</td>' +
              '</tr>'
            ))
            .join('');
        }

        const tbodyJev = document.getElementById('tbody-overnight-jev');
        if (tbodyJev && oc.agentDbJevLoop) {
          tbodyJev.innerHTML = oc.agentDbJevLoop.recentVerifiedTrajectories
            .map((t) => (
              '<tr>' +
                '<td class="mono"><strong>' + escapeHtml(t.trajectoryId) + '</strong><div style="font-size:11px;color:var(--accent-cyan);">' + escapeHtml(t.domain) + '</div></td>' +
                '<td class="mono" style="font-size:11px;">' + escapeHtml(t.builderHarness) + ' ≠ ' + escapeHtml(t.verifierHarness) + '</td>' +
                '<td style="font-size:12px;color:var(--text-secondary);">' + escapeHtml(t.verificationGate) + '</td>' +
                '<td class="mono" style="font-size:12px;color:var(--accent-emerald);">' + escapeHtml(t.thompsonPriorBefore) + ' → ' + escapeHtml(t.thompsonPriorAfter) + '</td>' +
                '<td class="mono" style="font-size:11px;color:var(--accent-cyan);">' + escapeHtml(t.distilledPlaybookOrSkill) + '</td>' +
              '</tr>'
            ))
            .join('');
        }

        const tbodyBatteries = document.getElementById('tbody-overnight-batteries');
        if (tbodyBatteries && oc.brandPlatformBatteries) {
          tbodyBatteries.innerHTML = oc.brandPlatformBatteries
            .map((b) => (
              '<tr>' +
                '<td><strong>' + escapeHtml(b.brandName) + '</strong><div class="mono" style="font-size:11px;color:var(--accent-cyan);">' + escapeHtml(b.domain) + '</div></td>' +
                '<td style="font-size:11px;color:var(--text-secondary);">' + b.prebuiltPlatformBatteries.map((p) => '<div>• ' + escapeHtml(p) + '</div>').join('') + '</td>' +
                '<td style="font-size:12px;"><strong>' + escapeHtml(b.weeklyCommunityChallenge.challengeName) + '</strong><div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">' + escapeHtml(b.weeklyCommunityChallenge.builderHook) + '</div></td>' +
                '<td style="font-size:11px;color:var(--accent-emerald);"><div>' + escapeHtml(b.weeklyCommunityChallenge.publicArtifactProduced) + '</div><div class="mono" style="color:var(--text-muted);margin-top:2px;">' + escapeHtml(b.weeklyCommunityChallenge.funnelConversionTarget) + '</div></td>' +
              '</tr>'
            ))
            .join('');
        }
      }

      async function triggerOvernightExecute() {
        const res = await fetch('/api/queen/overnight-execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dryRun: false }),
        });
        const data = await res.json();
        if (data.state) {
          state = data.state;
          renderTopMetrics();
          renderOvernightCeoTab();
          renderReceipts();
        }
        const banner = document.getElementById('overnight-exec-banner');
        if (banner && data.receipt) {
          banner.style.display = 'block';
          banner.textContent =
            'Overnight CEO cycle executed [' +
            data.receipt.ramGovernorMode +
            ']: ' +
            data.receipt.freeRamMb +
            ' MB free (1,024 MB hard floor), +' +
            data.receipt.maxAdditionalLocalWorkers +
            ' local workers available, ' +
            data.receipt.prSlicesAdvancingCount +
            ' PR slices advancing, and ' +
            data.receipt.agentDbJevTrajectoriesCommitted +
            ' verified AgentDB×JEV trajectories committed.';
        }
      }

      async function triggerSelfHeal() {
        const res = await fetch('/api/queen/self-heal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applyCardFixes: true }),
        });
        const data = await res.json();
        if (data.state) {
          state = data.state;
          renderTopMetrics();
          renderConductorTab();
          renderReceipts();
        }
        const banner = document.getElementById('self-heal-banner');
        const cond = data.metaConductor || (data.state && data.state.metaConductor);
        if (banner && cond) {
          banner.style.display = 'block';
          banner.textContent =
            'Self-heal complete: repaired ' +
            cond.stuckCardsHealedCount +
            ' control-plane cards, steered ' +
            cond.openWindowsCount +
            ' open CLI windows into .starlight/steered-prompts/, and unified ' +
            cond.mcpServersUnified +
            ' MCP servers behind vMCP.';
        }
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
        } else if (e.key === '=') {
          activateTab('overnight-ceo');
        } else if (e.key === '-') {
          activateTab('swarm-graph');
        } else if (e.key === '0') {
          activateTab('conductor');
        } else if (e.key >= '1' && e.key <= '9') {
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
      const btnSelfHeal = document.getElementById('btn-self-heal');
      if (btnSelfHeal) {
        btnSelfHeal.addEventListener('click', triggerSelfHeal);
      }
      const btnOvernightExec = document.getElementById('btn-overnight-execute');
      if (btnOvernightExec) {
        btnOvernightExec.addEventListener('click', triggerOvernightExecute);
      }
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
      renderEstateGtmRadar();
      renderMasterCodex();
      renderSubscriptionsTab();
      renderConductorTab();
      renderSwarmGraphTab();
      renderOvernightCeoTab();
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
                renderEstateGtmRadar();
                renderMasterCodex();
                renderSubscriptionsTab();
                renderConductorTab();
                renderSwarmGraphTab();
                renderOvernightCeoTab();
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
