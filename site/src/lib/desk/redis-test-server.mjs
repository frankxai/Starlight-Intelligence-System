// Test helper: a real Redis behind the Upstash REST protocol, so the token
// meter's Lua scripts run under Redis's own EVAL rather than a JavaScript double.
//
// Uses DESK_TEST_REDIS_URL (redis://host:port) when set, as CI does with a
// Redis service container. Otherwise starts `redis-server` on a Unix socket in
// a temporary directory. When neither is available, `startRedisRest` returns
// null and the caller skips, saying why.
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { connect } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** Encode one command as RESP. */
function encode(command) {
  const parts = [`*${command.length}\r\n`];
  for (const value of command) {
    const text = String(value);
    parts.push(`$${Buffer.byteLength(text)}\r\n${text}\r\n`);
  }
  return parts.join("");
}

/** Parse one RESP reply from the start of a buffer: { value, error, rest } or null when incomplete. */
function parse(buffer) {
  const end = buffer.indexOf("\r\n");
  if (end < 0) return null;
  const type = buffer[0];
  const line = buffer.subarray(1, end).toString();
  const rest = buffer.subarray(end + 2);
  if (type === 0x2b) return { value: line, rest }; // +
  if (type === 0x2d) return { error: line, rest }; // -
  if (type === 0x3a) return { value: Number(line), rest }; // :
  if (type === 0x24) {
    // $
    const length = Number(line);
    if (length < 0) return { value: null, rest };
    if (rest.length < length + 2) return null;
    return { value: rest.subarray(0, length).toString(), rest: rest.subarray(length + 2) };
  }
  if (type === 0x2a) {
    // *
    const count = Number(line);
    if (count < 0) return { value: null, rest };
    const items = [];
    let remaining = rest;
    for (let index = 0; index < count; index += 1) {
      const item = parse(remaining);
      if (!item) return null;
      items.push(item.error ? { error: item.error } : item.value);
      remaining = item.rest;
    }
    return { value: items, rest: remaining };
  }
  throw new Error(`unexpected RESP type ${String.fromCharCode(type)}`);
}

/** Send one command on a fresh connection and resolve its reply. */
function call(target, command) {
  return new Promise((resolve, reject) => {
    const socket = connect(target);
    let buffer = Buffer.alloc(0);
    socket.on("connect", () => socket.write(encode(command)));
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      const reply = parse(buffer);
      if (!reply) return;
      socket.end();
      resolve(reply);
    });
    socket.on("error", reject);
  });
}

async function waitForRedis(target, attempts = 50) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const reply = await call(target, ["PING"]);
      if (reply.value === "PONG") return;
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("redis did not answer PING");
}

/**
 * Start Redis (or use DESK_TEST_REDIS_URL) and an HTTP server that speaks the
 * Upstash REST protocol in front of it. Resolves to
 * { url, token, redis(command), close() } or null when no Redis is available.
 */
export async function startRedisRest() {
  let target;
  let child = null;
  let dir = null;
  const external = process.env.DESK_TEST_REDIS_URL;
  if (external) {
    const parsed = new URL(external);
    target = { host: parsed.hostname, port: Number(parsed.port || 6379) };
  } else {
    if (spawnSync("redis-server", ["--version"]).status !== 0) return null;
    dir = mkdtempSync(join(tmpdir(), "desk-redis-"));
    const socketPath = join(dir, "redis.sock");
    child = spawn("redis-server", ["--port", "0", "--unixsocket", socketPath, "--save", "", "--appendonly", "no", "--dir", dir], {
      stdio: "ignore",
    });
    target = { path: socketPath };
  }
  await waitForRedis(target);

  const token = "test-token";
  const server = createServer((request, response) => {
    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", async () => {
      if (request.headers.authorization !== `Bearer ${token}`) {
        response.writeHead(401).end(JSON.stringify({ error: "unauthorized" }));
        return;
      }
      const command = JSON.parse(body);
      const reply = await call(target, command);
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(reply.error ? { error: reply.error } : { result: reply.value }));
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  return {
    url: `http://127.0.0.1:${port}`,
    token,
    /** Run a command directly against Redis, for arranging and inspecting state. */
    redis: async (command) => {
      const reply = await call(target, command);
      if (reply.error) throw new Error(reply.error);
      return reply.value;
    },
    close: async () => {
      await new Promise((resolve) => server.close(resolve));
      if (child) {
        child.kill();
        await new Promise((resolve) => child.once("exit", resolve));
      }
      if (dir) rmSync(dir, { recursive: true, force: true });
    },
  };
}
