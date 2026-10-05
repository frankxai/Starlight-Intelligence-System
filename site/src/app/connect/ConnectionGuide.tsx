'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './connect.module.css';

type AgentInterface = {
  id: string; name: string; surface: string; transport: string; interface: string;
  sdk: string; purpose: string; boundary: string; docs: string;
};
type Catalog = { verified_at: string; review_after: string; interfaces: AgentInterface[] };
const routes = ['claude-github', 'claude-cloud', 'claude-local'] as const;

export function ConnectionGuide({ catalog }: { catalog: Catalog }) {
  const [selected, select] = useState(catalog.interfaces[0].id);
  const [route, setRoute] = useState<typeof routes[number]>('claude-github');
  const [copyState, setCopyState] = useState('');
  const agent = catalog.interfaces.find(item => item.id === selected) ?? catalog.interfaces[0];
  const example = {
    repository: 'your-org/your-repo', pull_request: 42,
    base_sha: 'a'.repeat(40), head_sha: 'b'.repeat(40), reviewer: route,
    max_minutes: 15, focus: ['Permission boundaries', 'Revision and evidence checks'],
  };
  async function copyExample() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(example, null, 2));
      setCopyState('Example copied. Replace the sample repository and revisions before use.');
    } catch {
      setCopyState('Copy is unavailable. Select the example text to copy it.');
    }
  }
  return (
    <main className={styles.main}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Agent interfaces · reference guide</p>
        <h1>One visible record of work.<br />Native agents, clear owners.</h1>
        <p className={styles.lead}>Starlight Queen coordinates bounded assignments and evidence. Starlight delivers the reviewed change. Connect each worker through its native interface and keep decisions with the owner that can verify them.</p>
        <div className={styles.status}><span className={styles.dot} /> Interface references · verified {catalog.verified_at} · review due {catalog.review_after}</div>
        <p className={styles.note}>This page is a public guide. Your agent sessions, inbox and private records are not connected here.</p>
      </header>
      <section aria-labelledby="interfaces-title" className={styles.section}>
        <div className={styles.sectionHead}><h2 id="interfaces-title">Choose an interface</h2><span>Runtime binding: not evaluated</span></div>
        <div className={styles.workspace}>
          <div className={styles.selector} role="group" aria-label="Agent interfaces">
            {catalog.interfaces.map(item => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => select(item.id)} className={selected === item.id ? styles.selected : ''}><strong>{item.name}</strong><span>{item.surface}</span></button>)}
          </div>
          <article className={styles.inspector}>
            <p className={styles.eyebrow}>{agent.surface}</p><h3 aria-live="polite">{agent.name}</h3><p>{agent.purpose}</p>
            <dl><dt>Transport</dt><dd>{agent.transport}</dd><dt>Native interface</dt><dd className={styles.mono}>{agent.interface}</dd><dt>SDK choice</dt><dd>{agent.sdk}</dd></dl>
            <div className={styles.boundary}><h4>Before connecting</h4><p>{agent.boundary}</p></div>
            <a href={agent.docs} target="_blank" rel="noreferrer">Read the primary documentation ↗</a>
          </article>
        </div>
      </section>
      <section aria-labelledby="handoff-title" className={styles.section}>
        <div className={styles.sectionHead}><h2 id="handoff-title">Prepare a Claude review</h2><span>Illustrative input · no dispatch</span></div>
        <p>Use <code>prepare_review_handoff</code> in the existing Starlight MCP plugin. Supply the actual repository, PR and revisions. The result expires after 15 minutes and leaves authorization and source verification to the executor.</p>
        <div className={styles.routes} role="group" aria-label="Claude review route">{routes.map(item => <button type="button" key={item} aria-pressed={route === item} onClick={() => { setRoute(item); setCopyState(''); }}>{item.replace('claude-', '')}</button>)}</div>
        <button className={styles.copy} type="button" onClick={copyExample}>Copy example input</button>
        <p className={styles.note} role="status">{copyState}</p>
        <pre aria-label="Example review input">{JSON.stringify(example, null, 2)}</pre>
        <p className={styles.note}>{route === 'claude-github' ? 'GitHub: use the repository’s existing authorized Claude workflow. A comment is a request; inspect the resulting run and review.' : route === 'claude-cloud' ? 'Cloud: an authenticated Claude CLI can prepare a new cloud session from the repository. The cloud executor still needs read-only permissions and pinned-source access.' : 'Local: an authenticated worker must run on the machine holding the checkout. Re-check its path and enforce the review budget there.'}</p>
      </section>
      <section aria-labelledby="ownership-title" className={styles.section}>
        <h2 id="ownership-title">Keep the operating boundaries visible</h2>
        <div className={styles.tableWrap}><table><thead><tr><th>Owner</th><th>Responsibility</th><th>Evidence needed</th></tr></thead><tbody>
          <tr><td>Agentic Ops</td><td>Registry, routing and admission policy</td><td>Reviewed owner and dispatch authority</td></tr>
          <tr><td>Starlight Suite</td><td>Private operator inbox and run projections</td><td>Authenticated source events and reconciliation</td></tr>
          <tr><td>Starlight cloud plugin</td><td>Scoped workspace tools and preparation</td><td>Installed connection and tenant authorization</td></tr>
          <tr><td>Native worker</td><td>Execution, approvals and progress</td><td>Bound session, result revision and performed checks</td></tr>
        </tbody></table></div>
        <p className={styles.note}>MCP carries tools and app resources. ACP drives supported local coding agents. A2A delegates remote work. These interfaces have different responsibilities; a provider run ID does not establish permission or completion.</p>
        <nav className={styles.links} aria-label="Related guides"><Link href="/download">Install Starlight →</Link><Link href="/architecture">Read the architecture →</Link><a href="https://github.com/frankxai/Starlight-Intelligence-System/tree/main/plugins/starlight-intelligence">Inspect the plugin source ↗</a></nav>
      </section>
    </main>
  );
}
