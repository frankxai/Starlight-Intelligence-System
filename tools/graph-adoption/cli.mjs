#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { checkRepository, inspectPortfolio, inspectRepository, renderMermaid, repositoryRoot, sourceFile } from './core.mjs';

const [command, target, graphPath, ...extra] = process.argv.slice(2);
try {
  if (!target || extra.length || !['check', 'inspect', 'portfolio', 'mermaid'].includes(command) || (command !== 'mermaid' && graphPath)) {
    console.error('Usage: node tools/graph-adoption/cli.mjs <check|inspect|portfolio> <exact-root>\n       node tools/graph-adoption/cli.mjs mermaid <exact-repo-root> <relative-graph.json>\nRead-only; never runs agents, installs dependencies, changes instructions, commits or publishes.');
    process.exitCode = 2;
  } else if (command === 'mermaid') {
    const root = repositoryRoot(target);
    console.log(renderMermaid(JSON.parse(readFileSync(sourceFile(root, graphPath), 'utf8'))));
  } else {
    const result = command === 'portfolio' ? inspectPortfolio(target) : command === 'inspect' ? inspectRepository(target) : checkRepository(target);
    console.log(JSON.stringify(result, null, 2));
    if (result.ok === false) process.exitCode = 1;
  }
} catch (error) {
  const detail = error instanceof SyntaxError ? 'Invalid JSON in the manifest or graph.' :
    error?.code ? `Filesystem or process error ${error.code}; check that the selected root and files exist and are readable.` :
    error instanceof Error ? error.message : 'Invalid input.';
  // Native filesystem messages may contain private absolute paths; emit their code only.
  console.error(`Graph adoption failed: ${detail} No commands from the manifest were executed.`);
  process.exitCode = 2;
}
