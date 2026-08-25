/**
 * Starlight Intelligence System — Unified Background Process Daemon
 *
 * Manages and monitors background services across the Starlight estate:
 * - Starlight Memory Gateway (:5200)
 * - Starlight Command Observatory (:4321)
 * - Starlight Voice Operator Sidecar (:8765)
 * - Starlight Static HTML Dashboard Server (:8080)
 */

import http from "node:http";

export interface ServiceDescriptor {
  id: string;
  name: string;
  port: number;
  healthUrl: string;
  cwd: string;
  command: string;
  args: string[];
}

export const STARLIGHT_SERVICES: ServiceDescriptor[] = [
  {
    id: "memory-gateway",
    name: "Starlight Memory Gateway & RRF Indexer",
    port: 5200,
    healthUrl: "http://127.0.0.1:5200/health",
    cwd: "C:/Users/frank/starlight/repos/Starlight-Intelligence-System",
    command: "npx",
    args: ["tsx", "src/mcp-server.ts"]
  },
  {
    id: "command-observatory",
    name: "Starlight Observatory Dashboard",
    port: 4321,
    healthUrl: "http://127.0.0.1:4321/api/ops",
    cwd: "C:/Users/frank/starlight/repos/starlight-command-center/apps/observatory",
    command: "pnpm",
    args: ["dev"]
  },
  {
    id: "voice-sidecar",
    name: "Starlight Voice Operator Sidecar",
    port: 8765,
    healthUrl: "http://127.0.0.1:8765/status",
    cwd: "C:/Users/frank/starlight/repos/starlight-voice",
    command: "python",
    args: ["dashboard/server.py"]
  },
  {
    id: "static-dashboards",
    name: "Starlight Static HTML Visual Dashboards",
    port: 8080,
    healthUrl: "http://127.0.0.1:8080/queen-vision.html",
    cwd: "C:/Users/frank/starlight/repos/Starlight-Intelligence-System/site",
    command: "python",
    args: ["-m", "http.server", "8080"]
  }
];

export async function checkPortHealth(url: string, timeoutMs: number = 1500): Promise<boolean> {
  return new Promise((res) => {
    const req = http.get(url, { timeout: timeoutMs }, (response) => {
      res(response.statusCode !== undefined && response.statusCode < 500);
    });
    req.on("error", () => res(false));
    req.on("timeout", () => {
      req.destroy();
      res(false);
    });
  });
}

export async function getDaemonStatus() {
  const results = [];
  for (const svc of STARLIGHT_SERVICES) {
    const isAlive = await checkPortHealth(svc.healthUrl);
    results.push({
      id: svc.id,
      name: svc.name,
      port: svc.port,
      status: isAlive ? "ONLINE" : "STANDBY",
      healthUrl: svc.healthUrl
    });
  }
  return results;
}
