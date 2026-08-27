(() => {
  const svg = document.getElementById("world-svg");
  const inspector = document.getElementById("inspector");
  const NS = "http://www.w3.org/2000/svg";
  const buttons = {
    palace: document.getElementById("layer-palace"),
    vaults: document.getElementById("layer-vaults"),
    city: document.getElementById("layer-city"),
    brain: document.getElementById("layer-brain"),
  };

  let world = window.STARLIGHT_WORLD;
  let layer = "palace";
  let activeId = null;

  function el(name, attrs, parent) {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    (parent || svg).appendChild(node);
    return node;
  }

  function inspect(kind, item) {
    const bits = [];
    if (item.system) bits.push(`IS: ${item.system}`);
    if (item.path) bits.push(item.path);
    if (item.repo) bits.push(item.repo);
    if (item.mount) bits.push(`mount: ${item.mount}`);
    if (item.steward) bits.push("steward registered, not live");
    if (item.owns) bits.push(item.owns.join(" · "));
    inspector.innerHTML = `
      <div class="kicker">${kind}</div>
      <h2>${item.title}</h2>
      <p class="lead">${item.lead || item.drive || item.role}</p>
      ${item.airGapped ? '<span class="chip">air-gapped</span>' : ""}
      ${item.steward ? '<span class="chip">registered</span>' : ""}
      <p class="meta">${bits.join(" · ") || item.role}</p>
      <p class="hint">1 Palace · 2 Vaults · 3 City · 4 Second Brain · arrows move</p>
    `;
  }

  function itemsForLayer() {
    if (layer === "palace") return world.palace.map((room) => ({ ...room, kind: "Palace" }));
    if (layer === "vaults") return world.vaults.map((vault) => ({ ...vault, kind: "Vault" }));
    if (layer === "city") return world.city.map((district) => ({ ...district, kind: "City" }));
    return world.brain.map((node) => ({ ...node, kind: "Second Brain" }));
  }

  function polar(cx, cy, r, i, n, offset = -Math.PI / 2) {
    const a = offset + (Math.PI * 2 * i) / n;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  }

  function drawPalace() {
    el("rect", { x: 0, y: 520, width: 1000, height: 200, fill: "#07141c" });
    el("ellipse", { cx: 780, cy: 560, rx: 260, ry: 70, fill: "#0b2430", opacity: 0.9 });
    el("text", { x: 500, y: 372, "text-anchor": "middle", fill: "#8a90a8", "font-size": 13 }, svg).textContent = "YOU DRIVE";
    el("circle", { cx: 500, cy: 348, r: 46, fill: "#111522", stroke: "#f5c36a", "stroke-width": 1.4 });
    const rooms = world.palace;
    rooms.forEach((room, i) => {
      const next = rooms[(i + 1) % rooms.length];
      el("line", {
        x1: room.x * 10,
        y1: room.y * 7.2,
        x2: next.x * 10,
        y2: next.y * 7.2,
        stroke: "#243044",
        "stroke-width": 10,
        "stroke-linecap": "round",
      });
    });
    rooms.forEach((room) => {
      const x = room.x * 10;
      const y = room.y * 7.2;
      const g = el("g", { class: "node", "data-id": room.id, "data-active": String(room.id === activeId) });
      el("rect", {
        class: "hit",
        x: x - 54,
        y: y - 28,
        width: 108,
        height: 56,
        rx: 10,
        fill: room.id === "lighthouse" ? "#a78bfa" : "#151b2b",
        stroke: "#1a1f2e",
      }, g);
      el("text", { x, y: y + 4, "text-anchor": "middle", "font-size": 13 }, g).textContent = room.title;
      g.addEventListener("click", () => select(room.id));
    });
  }

  function drawVaults() {
    el("circle", { cx: 500, cy: 360, r: 70, fill: "#111522", stroke: "#6ea8fe" });
    el("text", { x: 500, y: 365, "text-anchor": "middle", fill: "#f1f3f9" }, svg).textContent = "SIS";
    world.vaults.forEach((vault, i) => {
      const p = polar(500, 360, 210, i, world.vaults.length);
      const next = polar(500, 360, 210, (i + 1) % world.vaults.length, world.vaults.length);
      el("line", { x1: p.x, y1: p.y, x2: next.x, y2: next.y, stroke: "#243044" });
      el("line", { x1: 500, y1: 360, x2: p.x, y2: p.y, stroke: "#1a1f2e" });
      const g = el("g", { class: "node", "data-id": vault.id, "data-active": String(vault.id === activeId) });
      el("circle", { class: "hit", cx: p.x, cy: p.y, r: 38, fill: "#6ea8fe" }, g);
      el("text", { x: p.x, y: p.y + 4, "text-anchor": "middle", "font-size": 12, fill: "#05060a" }, g).textContent = vault.title;
      g.addEventListener("click", () => select(vault.id));
    });
  }

  function drawCity() {
    el("rect", { x: 40, y: 40, width: 920, height: 640, rx: 18, fill: "#0a1018", stroke: "#1a1f2e" });
    el("text", { x: 500, y: 368, "text-anchor": "middle", fill: "#8a90a8" }, svg).textContent = "CITADEL";
    world.city.forEach((district, i) => {
      const p = polar(500, 360, 230, i, world.city.length);
      const g = el("g", { class: "node", "data-id": district.id, "data-active": String(district.id === activeId) });
      el("rect", {
        class: "hit",
        x: p.x - 70,
        y: p.y - 34,
        width: 140,
        height: 68,
        rx: 12,
        fill: "#79e6c5",
      }, g);
      el("text", { x: p.x, y: p.y + 4, "text-anchor": "middle", fill: "#05060a", "font-size": 14 }, g).textContent = district.title;
      g.addEventListener("click", () => select(district.id));
    });
  }

  function drawBrain() {
    el("rect", { x: 90, y: 180, width: 360, height: 320, rx: 16, fill: "#111522", stroke: "#6ea8fe" });
    el("rect", { x: 550, y: 180, width: 360, height: 320, rx: 16, fill: "#16110a", stroke: "#f5c36a" });
    el("text", { x: 270, y: 160, "text-anchor": "middle", fill: "#6ea8fe" }, svg).textContent = "BRAIN / MCP";
    el("text", { x: 730, y: 160, "text-anchor": "middle", fill: "#f5c36a" }, svg).textContent = "PRIVATE / SEALED";
    el("line", { x1: 450, y1: 340, x2: 550, y2: 340, stroke: "#f97066", "stroke-dasharray": "6 6" });
    const slots = {
      "brain-vault": [270, 260],
      "people-map": [270, 340],
      "pattern-detector": [270, 420],
      "private-vault": [730, 340],
      chronicle: [500, 568],
    };
    world.brain.forEach((node) => {
      const [x, y] = slots[node.id];
      const g = el("g", { class: "node", "data-id": node.id, "data-active": String(node.id === activeId) });
      const w = node.id === "chronicle" ? 220 : 180;
      el("rect", {
        class: "hit",
        x: x - w / 2,
        y: y - 22,
        width: w,
        height: 44,
        rx: 8,
        fill: node.airGapped ? "#f5c36a" : node.id === "chronicle" ? "#151b2b" : "#6ea8fe",
      }, g);
      el("text", {
        x,
        y: y + 5,
        "text-anchor": "middle",
        fill: node.id === "chronicle" ? "#f1f3f9" : "#05060a",
      }, g).textContent = node.title;
      g.addEventListener("click", () => select(node.id));
    });
  }

  function select(id) {
    activeId = id;
    const item = itemsForLayer().find((entry) => entry.id === id);
    if (item) inspect(item.kind, item);
    draw();
  }

  function draw() {
    svg.innerHTML = "";
    el("rect", { x: 0, y: 0, width: 1000, height: 720, fill: "#05060a" });
    const items = itemsForLayer();
    if (!items.some((item) => item.id === activeId)) activeId = items[0].id;
    if (layer === "palace") drawPalace();
    if (layer === "vaults") drawVaults();
    if (layer === "city") drawCity();
    if (layer === "brain") drawBrain();
    const current = items.find((item) => item.id === activeId);
    if (current) inspect(current.kind, current);
  }

  function setLayer(name) {
    layer = name;
    Object.entries(buttons).forEach(([key, button]) => {
      button.setAttribute("aria-pressed", String(key === name));
    });
    draw();
  }

  Object.entries(buttons).forEach(([name, button]) => {
    button.addEventListener("click", () => setLayer(name));
  });

  window.addEventListener("keydown", (event) => {
    const map = { Digit1: "palace", Digit2: "vaults", Digit3: "city", Digit4: "brain" };
    if (map[event.code]) setLayer(map[event.code]);
    const items = itemsForLayer();
    const index = items.findIndex((item) => item.id === activeId);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      select(items[(index + 1) % items.length].id);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      select(items[(index - 1 + items.length) % items.length].id);
    }
  });

  async function boot() {
    if (!world) {
      try {
        const response = await fetch("./world.v1.json");
        world = await response.json();
      } catch (error) {
        inspector.innerHTML = "<h2>Serve locally</h2><p class=\"lead\">python scripts/serve-starlight-world.py</p>";
        return;
      }
    }
    activeId = world.palace[0].id;
    draw();
  }

  boot();
})();
