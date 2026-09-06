(() => {
  const svg = document.getElementById("world-svg");
  const inspector = document.getElementById("inspector");
  const NS = "http://www.w3.org/2000/svg";
  const buttons = {
    palace: document.getElementById("layer-palace"),
    vaults: document.getElementById("layer-vaults"),
    city: document.getElementById("layer-city"),
    brain: document.getElementById("layer-brain"),
    graph: document.getElementById("layer-graph"),
  };

  let world = window.STARLIGHT_WORLD;
  let layer = "palace";
  let activeId = null;
  let mode = "map";

  function el(name, attrs, parent) {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    (parent || svg).appendChild(node);
    return node;
  }

  function catalog() {
    return [
      ...world.palace.map((item) => ({ ...item, kind: "Palace", layer: "palace" })),
      ...world.vaults.map((item) => ({ ...item, kind: "Vault", layer: "vaults" })),
      ...world.city.map((item) => ({ ...item, kind: "City", layer: "city" })),
      ...world.brain.map((item) => ({ ...item, kind: "Second Brain", layer: "brain" })),
    ];
  }

  function itemsForLayer() {
    if (layer === "graph") return catalog();
    return catalog().filter((item) => item.layer === layer);
  }

  function find(id) {
    return catalog().find((item) => item.id === id);
  }

  function polar(cx, cy, r, i, n, offset = -Math.PI / 2) {
    const a = offset + (Math.PI * 2 * i) / n;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  }

  function writeHash() {
    const hash = mode === "inside" ? `#${layer}/${activeId}/inside` : `#${layer}/${activeId}`;
    if (location.hash !== hash) history.replaceState(null, "", hash);
    localStorage.setItem("starlight-world-place", hash);
  }

  function inspect(item) {
    const linkedVault = item.vault ? find(item.vault) : null;
    const linkedDistrict = item.district ? find(item.district) : null;
    const buildings = item.buildings || [];
    inspector.innerHTML = `
      <div class="kicker">${item.kind}${mode === "inside" ? " · inside" : ""}</div>
      <h2>${item.title}</h2>
      <p class="lead">${item.enter || item.lead || item.drive || item.role}</p>
      ${item.airGapped ? '<span class="chip">air-gapped</span>' : ""}
      ${item.steward ? '<span class="chip">registered</span>' : ""}
      ${item.system ? `<span class="chip">${item.system}</span>` : ""}
      <p class="meta">${item.repo || item.path || item.role}</p>
      ${linkedVault ? `<button type="button" data-jump="${linkedVault.layer}:${linkedVault.id}">Vault · ${linkedVault.title}</button>` : ""}
      ${linkedDistrict ? `<button type="button" data-jump="${linkedDistrict.layer}:${linkedDistrict.id}">City · ${linkedDistrict.title}</button>` : ""}
      ${buildings.map((building) => `<span class="chip">${building.title}</span>`).join("")}
      ${mode === "map" ? '<p class="hint">Enter opens the room. Esc returns. 1–5 switch layers.</p>' : '<p class="hint">Esc returns to the map.</p>'}
    `;
    inspector.querySelectorAll("[data-jump]").forEach((button) => {
      button.addEventListener("click", () => {
        const [nextLayer, nextId] = button.getAttribute("data-jump").split(":");
        mode = "map";
        setLayer(nextLayer, nextId);
      });
    });
  }

  function hit(g, id) {
    g.addEventListener("click", () => {
      if (activeId === id && mode === "map") {
        mode = "inside";
        select(id);
        return;
      }
      mode = "map";
      select(id);
    });
    g.addEventListener("dblclick", () => {
      mode = "inside";
      select(id);
    });
  }

  function drawPalace() {
    el("rect", { x: 0, y: 540, width: 1000, height: 180, fill: "#07141c" });
    el("ellipse", { cx: 760, cy: 580, rx: 280, ry: 78, fill: "#0b2430", opacity: "0.95" });
    el("circle", { cx: 500, cy: 348, r: 52, fill: "#111522", stroke: "#f5c36a", "stroke-width": "1.6" });
    el("text", { x: 500, y: 353, "text-anchor": "middle", fill: "#f5c36a", "font-size": "12" }, svg).textContent = "DRIVE";
    world.palace.forEach((room, i) => {
      const next = world.palace[(i + 1) % world.palace.length];
      el("line", {
        x1: room.x * 10,
        y1: room.y * 7.2,
        x2: next.x * 10,
        y2: next.y * 7.2,
        stroke: "#243044",
        "stroke-width": "12",
        "stroke-linecap": "round",
      });
    });
    world.palace.forEach((room) => {
      const x = room.x * 10;
      const y = room.y * 7.2;
      const g = el("g", { class: "node", "data-id": room.id, "data-active": String(room.id === activeId) });
      el("rect", {
        class: "hit",
        x: x - 58,
        y: y - 30,
        width: 116,
        height: 60,
        rx: 12,
        fill: room.id === activeId ? "#a78bfa" : "#151b2b",
        stroke: "#1a1f2e",
      }, g);
      el("text", { x, y: y + 4, "text-anchor": "middle", "font-size": "13" }, g).textContent = room.title;
      hit(g, room.id);
    });
  }

  function drawVaults() {
    el("circle", { cx: 500, cy: 360, r: 74, fill: "#111522", stroke: "#6ea8fe" });
    el("text", { x: 500, y: 365, "text-anchor": "middle" }, svg).textContent = "SIS";
    world.vaults.forEach((vault, i) => {
      const p = polar(500, 360, 214, i, world.vaults.length);
      const n = polar(500, 360, 214, (i + 1) % world.vaults.length, world.vaults.length);
      el("line", { x1: p.x, y1: p.y, x2: n.x, y2: n.y, stroke: "#243044" });
      el("line", { x1: 500, y1: 360, x2: p.x, y2: p.y, stroke: "#1a1f2e" });
      const g = el("g", { class: "node", "data-id": vault.id, "data-active": String(vault.id === activeId) });
      el("circle", { class: "hit", cx: p.x, cy: p.y, r: 40, fill: vault.id === activeId ? "#f5c36a" : "#6ea8fe" }, g);
      el("text", { x: p.x, y: p.y + 4, "text-anchor": "middle", fill: "#05060a", "font-size": "12" }, g).textContent = vault.title;
      hit(g, vault.id);
    });
  }

  function drawCity() {
    el("rect", { x: 36, y: 36, width: 928, height: 648, rx: 18, fill: "#0a1018", stroke: "#1a1f2e" });
    el("line", { x1: 80, y1: 360, x2: 920, y2: 360, stroke: "#1a1f2e" });
    el("line", { x1: 500, y1: 70, x2: 500, y2: 650, stroke: "#1a1f2e" });
    el("text", { x: 500, y: 368, "text-anchor": "middle", fill: "#8a90a8" }, svg).textContent = "CITADEL";
    world.city.forEach((district, i) => {
      const p = polar(500, 360, 236, i, world.city.length);
      const g = el("g", { class: "node", "data-id": district.id, "data-active": String(district.id === activeId) });
      el("rect", {
        class: "hit",
        x: p.x - 78,
        y: p.y - 36,
        width: 156,
        height: 72,
        rx: 12,
        fill: district.id === activeId ? "#f5c36a" : "#79e6c5",
      }, g);
      el("text", { x: p.x, y: p.y + 4, "text-anchor": "middle", fill: "#05060a", "font-size": "15" }, g).textContent = district.title;
      hit(g, district.id);
      (district.buildings || []).forEach((building, bi) => {
        el("rect", {
          x: p.x - 70 + bi * 48,
          y: p.y + 42,
          width: 40,
          height: 18,
          rx: 3,
          fill: "#151b2b",
        });
      });
    });
  }

  function drawBrain() {
    el("rect", { x: 80, y: 170, width: 370, height: 330, rx: 16, fill: "#111522", stroke: "#6ea8fe" });
    el("rect", { x: 550, y: 170, width: 370, height: 330, rx: 16, fill: "#16110a", stroke: "#f5c36a" });
    el("text", { x: 265, y: 154, "text-anchor": "middle", fill: "#6ea8fe" }, svg).textContent = "BRAIN / MCP";
    el("text", { x: 735, y: 154, "text-anchor": "middle", fill: "#f5c36a" }, svg).textContent = "PRIVATE / SEALED";
    el("line", { x1: 450, y1: 335, x2: 550, y2: 335, stroke: "#f97066", "stroke-dasharray": "7 6" });
    const slots = {
      "brain-vault": [265, 250],
      "people-map": [265, 330],
      "pattern-detector": [265, 410],
      "private-vault": [735, 335],
      chronicle: [500, 560],
    };
    world.brain.forEach((node) => {
      const [x, y] = slots[node.id];
      const g = el("g", { class: "node", "data-id": node.id, "data-active": String(node.id === activeId) });
      const w = node.id === "chronicle" ? 230 : 188;
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
      hit(g, node.id);
    });
  }

  function drawGraph() {
    const positions = {};
    catalog().forEach((item) => {
      if (item.layer === "palace") positions[item.id] = { x: item.x * 10, y: item.y * 6.4 + 20, fill: "#a78bfa" };
    });
    world.vaults.forEach((vault, i) => {
      positions[vault.id] = { ...polar(500, 360, 150, i, world.vaults.length), fill: "#6ea8fe" };
    });
    world.city.forEach((district, i) => {
      positions[district.id] = { ...polar(500, 360, 280, i, world.city.length), fill: "#79e6c5" };
    });
    world.brain.forEach((node, i) => {
      positions[node.id] = { x: 120 + i * 180, y: 640, fill: node.airGapped ? "#f5c36a" : "#8a90a8" };
    });
    (world.edges || []).forEach((edge) => {
      const a = positions[edge.from];
      const b = positions[edge.to];
      if (!a || !b) return;
      el("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: "#243044", "stroke-width": "1.2" });
    });
    catalog().forEach((item) => {
      const p = positions[item.id];
      if (!p) return;
      const g = el("g", { class: "node", "data-id": item.id, "data-active": String(item.id === activeId) });
      el("circle", { class: "hit", cx: p.x, cy: p.y, r: item.id === activeId ? 16 : 9, fill: p.fill }, g);
      if (item.id === activeId) {
        el("text", { x: p.x, y: p.y - 22, "text-anchor": "middle", "font-size": "12" }, g).textContent = item.title;
      }
      hit(g, item.id);
    });
  }

  function drawInside() {
    const item = find(activeId);
    el("rect", { x: 80, y: 70, width: 840, height: 560, rx: 22, fill: "#0a0c14", stroke: "#f5c36a" });
    el("text", { x: 500, y: 140, "text-anchor": "middle", "font-size": "28", fill: "#f1f3f9" }, svg).textContent = item.title;
    el("text", { x: 500, y: 180, "text-anchor": "middle", "font-size": "16", fill: "#8a90a8" }, svg).textContent = item.role;
    const line = item.enter || item.lead || item.drive || "";
    el("text", { x: 500, y: 280, "text-anchor": "middle", "font-size": "18", fill: "#f5c36a" }, svg).textContent = line.slice(0, 72);
    el("text", { x: 500, y: 580, "text-anchor": "middle", fill: "#8a90a8" }, svg).textContent = "Esc · back to map";
  }

  function select(id) {
    activeId = id;
    writeHash();
    draw();
  }

  function draw() {
    svg.innerHTML = "";
    el("rect", { x: 0, y: 0, width: 1000, height: 720, fill: "#05060a" });
    const items = itemsForLayer();
    if (!items.some((item) => item.id === activeId)) activeId = items[0].id;
    if (mode === "inside") drawInside();
    else if (layer === "palace") drawPalace();
    else if (layer === "vaults") drawVaults();
    else if (layer === "city") drawCity();
    else if (layer === "brain") drawBrain();
    else drawGraph();
    const current = find(activeId);
    if (current) inspect(current);
  }

  function setLayer(name, id) {
    layer = name;
    mode = "map";
    Object.entries(buttons).forEach(([key, button]) => {
      if (button) button.setAttribute("aria-pressed", String(key === name));
    });
    if (id) activeId = id;
    else {
      const items = itemsForLayer();
      activeId = items[0].id;
    }
    writeHash();
    draw();
  }

  function readHash() {
    const raw = (location.hash || localStorage.getItem("starlight-world-place") || "").replace(/^#/, "");
    const [nextLayer, nextId, nextMode] = raw.split("/");
    if (buttons[nextLayer]) {
      layer = nextLayer;
      mode = nextMode === "inside" ? "inside" : "map";
      if (nextId) activeId = nextId;
    }
  }

  Object.entries(buttons).forEach(([name, button]) => {
    if (button) button.addEventListener("click", () => setLayer(name));
  });

  window.addEventListener("keydown", (event) => {
    const map = { Digit1: "palace", Digit2: "vaults", Digit3: "city", Digit4: "brain", Digit5: "graph" };
    if (map[event.code]) setLayer(map[event.code]);
    if (event.key === "Escape") {
      mode = "map";
      writeHash();
      draw();
    }
    if (event.key === "Enter") {
      mode = mode === "inside" ? "map" : "inside";
      writeHash();
      draw();
    }
    const items = itemsForLayer();
    const index = items.findIndex((item) => item.id === activeId);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") select(items[(index + 1) % items.length].id);
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") select(items[(index - 1 + items.length) % items.length].id);
  });

  async function boot() {
    if (!world) {
      try {
        world = await (await fetch("./world.v1.json")).json();
      } catch (error) {
        inspector.innerHTML = "<h2>Serve locally</h2><p class=\"lead\">python scripts/serve-starlight-world.py</p>";
        return;
      }
    }
    activeId = world.now?.id || world.palace[0].id;
    readHash();
    Object.entries(buttons).forEach(([key, button]) => {
      if (button) button.setAttribute("aria-pressed", String(key === layer));
    });
    writeHash();
    draw();
  }

  boot();
})();
