import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const openapi = YAML.parse(await readFile(join(root, "interfaces", "openapi.yaml"), "utf8"));
const mcp = YAML.parse(await readFile(join(root, "interfaces", "mcp-surface.yaml"), "utf8"));
const events = YAML.parse(await readFile(join(root, "events", "catalog.yaml"), "utf8"));
if (openapi.openapi !== "3.1.0" || !openapi.paths || !openapi.components?.securitySchemes) throw new Error("Invalid minimal OpenAPI contract");
if (mcp.version !== "0.1.0" || !Array.isArray(mcp.resources) || !Array.isArray(mcp.tools)) throw new Error("Invalid MCP surface contract");
const eventNames = events.events.map((event) => event.type);
if (new Set(eventNames).size !== eventNames.length) throw new Error("Duplicate event type");
if (mcp.tools.some((tool) => tool.sideEffect !== "none")) throw new Error("v0.1 MCP must remain read-only/deterministic");
console.log(`Validated OpenAPI, ${mcp.resources.length} MCP resources, ${mcp.tools.length} MCP tools, and ${events.events.length} event types.`);

