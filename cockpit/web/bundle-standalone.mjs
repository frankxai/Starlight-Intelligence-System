import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const assetsDir = path.join(distDir, 'assets');

if (!fs.existsSync(distDir)) {
  console.error('dist directory not found. Run npm run build first.');
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const jsFile = files.find((f) => f.endsWith('.js'));
const cssFile = files.find((f) => f.endsWith('.css'));

if (!jsFile || !cssFile) {
  console.error('JS or CSS asset not found in dist/assets');
  process.exit(1);
}

const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf-8');
const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');
let htmlContent = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

// Replace external script and link with inline content
htmlContent = htmlContent.replace(
  /<link rel="stylesheet"[^>]*>/i,
  `<style>\n${cssContent}\n</style>`
);

htmlContent = htmlContent.replace(
  /<script type="module"[^>]*><\/script>/i,
  `<script type="module">\n${jsContent}\n</script>`
);

const outPath = path.join(__dirname, '..', 'starlight-cockpit.html');
fs.writeFileSync(outPath, htmlContent, 'utf-8');
console.log(`Successfully generated standalone single-file instrument: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
