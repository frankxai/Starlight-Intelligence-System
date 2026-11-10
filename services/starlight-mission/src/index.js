import { WorkflowEntrypoint } from "cloudflare:workers";

export class MissionWorkflow extends WorkflowEntrypoint {
  async run(event, step) {
    const payload = event.payload && typeof event.payload === "object" ? event.payload : {};
    const kind = typeof payload.kind === "string" && payload.kind.length > 0 && payload.kind.length <= 80
      ? payload.kind
      : "unspecified";
    const id = event.instanceId;

    await step.do("record mission", async () => {
      const createdAt = new Date().toISOString();
      await this.env.MISSIONS_DB.prepare(
        `INSERT INTO missions (id, kind, status, created_at, payload)
         VALUES (?1, ?2, 'recorded', ?3, ?4)
         ON CONFLICT(id) DO UPDATE SET
           kind = excluded.kind,
           payload = excluded.payload,
           status = 'recorded'`
      ).bind(id, kind, createdAt, JSON.stringify(payload)).run();
      return { id, createdAt };
    });

    await step.do("mark ready", async () => {
      const readyAt = new Date().toISOString();
      await this.env.MISSIONS_DB.prepare(
        "UPDATE missions SET status = 'ready' WHERE id = ?1"
      ).bind(id).run();
      return { status: "ready", readyAt };
    });

    const answer = await step.do("answer from research", async () => {
      const query = typeof payload.query === "string" ? payload.query.trim().slice(0, 300) : "";
      if (!query) return { status: "ready", searched: false };
      const results = await this.env.RESEARCH.search({
        messages: [{ role: "user", content: query }],
      });
      const chunks = (results && results.chunks) || (results && results.result && results.result.chunks) || [];
      const top = chunks[0] || null;
      const topKey = top && top.item && typeof top.item.key === "string" ? top.item.key : null;
      const topScore = top && typeof top.score === "number" ? top.score : null;
      await this.env.MISSIONS_DB.prepare(
        "UPDATE missions SET status = 'answered', top_key = ?2, top_score = ?3 WHERE id = ?1"
      ).bind(id, topKey, topScore).run();
      return { status: "answered", searched: true, topKey, topScore };
    });

    return { id, status: answer.status, kind };
  }
}

function instanceId(raw) {
  const cleaned = String(raw || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 90);
  return cleaned ? `job-${cleaned}` : `job-${crypto.randomUUID()}`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== "GET" || (url.pathname !== "/" && url.pathname !== "/health")) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    const row = await env.MISSIONS_DB.prepare(
      "SELECT COUNT(*) AS n, SUM(CASE WHEN top_key IS NOT NULL THEN 1 ELSE 0 END) AS answered FROM missions"
    ).first();
    return Response.json({
      service: "starlight-mission",
      status: "healthy",
      missions: row ? row.n : 0,
      answered: row ? row.answered : 0,
      workflow: "starlight-mission",
      queue: "starlight-agent-jobs",
    });
  },

  async queue(batch, env) {
    for (const message of batch.messages) {
      const body = message.body && typeof message.body === "object" ? message.body : { raw: message.body };
      const id = instanceId(message.id);
      try {
        await env.MISSION.create({ id, params: body });
      } catch (error) {
        const text = String(error && error.message ? error.message : error);
        if (!/already exists|already been created/i.test(text)) throw error;
      }
      message.ack();
    }
  },
};
