import { mkdir, readFile, writeFile } from "node:fs/promises";

const componentPath = new URL("../web/dist/component.js", import.meta.url);
const htmlPath = new URL("../web/dist/component.html", import.meta.url);
const component = (await readFile(componentPath, "utf8")).replace(/<\/script/gi, "<\\/script");
const html = `<div id="root"></div><script type="module">${component}</script>`;

await mkdir(new URL("../web/dist/", import.meta.url), { recursive: true });
await writeFile(htmlPath, html, "utf8");
