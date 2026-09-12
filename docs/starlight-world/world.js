(() => {
  const svg = document.getElementById("world-svg");
  const inspector = document.getElementById("inspector");
  const placeLine = document.getElementById("place-line");
  const help = document.getElementById("help");
  const NS = "http://www.w3.org/2000/svg";
  const buttons = {
    palace: document.getElementById("layer-palace"),
    vaults: document.getElementById("layer-vaults"),
    city: document.getElementById("layer-city"),
    brain: document.getElementById("layer-brain"),
    graph: document.getElementById("layer-graph"),
  };
  const FILL = {
    palace: "#b9a0ff",
    vaults: "#7eb6ff",
    city: "#7ee0c6",
    brain: "#e8c572",
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

  function txt(attrs, value, parent) {
    const node = el("text", attrs, parent);
    node.textContent = value;
    return node;
  }

  function wrap(text, width) {
    const words = String(text || "").split(/\s+/);
    const lines = [];
    let line = "";
    words.forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (next.length > width) {
        if (line) lines.push(line);
        line = word;
      } else line = next;
    });
    if (line) lines.push(line);
    return lines.slice(0, 6);
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

  function h(tag, attrs, ...kids) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (value == null || value === false) return;
      if (key === "class") node.className = value;
      else node.setAttribute(key, String(value));
    });
    kids.flat().forEach((child) => {
      if (child == null || child === false) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  function inspect(item) {
    const linkedVault = item.vault ? find(item.vault) : null;
    const linkedDistrict = item.district ? find(item.district) : null;
    const buildings = item.buildings || [];
    const owns = item.owns || [];
    const nodes = [
      h("div", { class: "kicker" }, `${item.kind}${mode === "inside" ? " · inside" : ""}`),
      h("h2", {}, item.title),
      h("p", { class: "lead" }, (mode === "inside" ? item.enter : item.lead) || item.drive || item.role || ""),
      item.airGapped ? h("span", { class: "chip" }, "air-gapped") : null,
      item.steward ? h("span", { class: "chip" }, "registered") : null,
      item.system ? h("span", { class: "chip" }, item.system) : null,
      item.mount ? h("span", { class: "chip" }, item.mount) : null,
      h("p", { class: "meta" }, item.role || item.repo || item.path || ""),
      h(
        "div",
        { class: "doors" },
        mode === "map" ? h("button", { type: "button", "data-enter": "1" }, "Enter room") : null,
        linkedVault ? h("button", { type: "button", "data-jump": `${linkedVault.layer}:${linkedVault.id}` }, `Vault · ${linkedVault.title}`) : null,
        linkedDistrict ? h("button", { type: "button", "data-jump": `${linkedDistrict.layer}:${linkedDistrict.id}` }, `City · ${linkedDistrict.title}`) : null
      ),
      ...buildings.map((building) => h("span", { class: "chip" }, building.title)),
      ...owns.map((name) => h("span", { class: "chip" }, name)),
      h("p", { class: "hint" }, mode === "map" ? "Enter opens the room. Esc returns. 1–5 switch layers. ? help." : "Esc returns to the map."),
    ].filter(Boolean);
    inspector.replaceChildren(...nodes);
    inspector.querySelector("[data-enter]")?.addEventListener("click", () => enter());
    inspector.querySelectorAll("[data-jump]").forEach((button) => {
      button.addEventListener("click", () => {
        const [nextLayer, nextId] = button.getAttribute("data-jump").split(":");
        mode = "map";
        setLayer(nextLayer, nextId);
      });
    });
    if (placeLine) placeLine.textContent = `${item.kind} · ${item.title}${mode === "inside" ? " · inside" : ""}`;
  }

  function hit(g, id) {
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    const item = find(id);
    if (item) g.setAttribute("aria-label", item.title);
    const activate = (inside) => {
      mode = inside ? "inside" : "map";
      select(id);
    };
    g.addEventListener("click", () => activate(activeId === id && mode === "map"));
    g.addEventListener("dblclick", () => activate(true));
    g.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate(true);
      }
    });
  }

  function defs() {
    const d = el("defs", {});
    const glow = el("filter", { id: "glow", x: "-40%", y: "-40%", width: "180%", height: "180%" }, d);
    el("feGaussianBlur", { stdDeviation: "6", result: "b" }, glow);
    const merge = el("feMerge", {}, glow);
    el("feMergeNode", { in: "b" }, merge);
    el("feMergeNode", { in: "SourceGraphic" }, merge);
  }

  function stars() {
    for (let i = 0; i < 48; i += 1) {
      const x = (i * 137 + 40) % 980 + 10;
      const y = (i * 89 + 18) % 700 + 8;
      el("circle", { cx: x, cy: y, r: i % 7 === 0 ? 1.4 : 0.7, fill: "#f4efe6", opacity: i % 5 === 0 ? "0.45" : "0.18" });
    }
  }

  function drawPalace() {
    el("ellipse", { cx: 500, cy: 360, rx: 108, ry: 78, fill: "#12101a", stroke: "#e8c572", "stroke-width": "1.4" });
    txt({ x: 500, y: 354, "text-anchor": "middle", fill: "#e8c572", "font-size": "13", "letter-spacing": "0.18em" }, "THE PROOF");
    txt({ x: 500, y: 374, "text-anchor": "middle", fill: "#9a9386", "font-size": "11" }, "life is the system");
    const pts = world.palace.map((_, i) => polar(500, 350, 198, i, world.palace.length));
    pts.forEach((p, i) => {
      const next = pts[(i + 1) % pts.length];
      el("line", {
        x1: p.x,
        y1: p.y,
        x2: next.x,
        y2: next.y,
        stroke: "#2a2433",
        "stroke-width": "16",
        "stroke-linecap": "round",
      });
    });
    world.palace.forEach((room, i) => {
      const { x, y } = pts[i];
      const active = room.id === activeId;
      const g = el("g", { class: "node", "data-id": room.id, "data-active": String(active) });
      el("polygon", {
        points: `${x - 70},${y - 8} ${x},${y - 36} ${x + 70},${y - 8}`,
        fill: active ? "#e8c572" : "#1c1826",
      }, g);
      el("rect", {
        class: "hit",
        x: x - 64,
        y: y - 8,
        width: 128,
        height: 44,
        fill: active ? "#2a2110" : "#15121c",
        stroke: active ? "#e8c572" : "#2a2433",
      }, g);
      el("rect", { x: x - 7, y: y + 10, width: 14, height: 26, fill: active ? "#e8c572" : "#0b0910" }, g);
      txt({ x, y: y + 12, "text-anchor": "middle", "font-size": "13", fill: "#f4efe6" }, room.title, g);
      txt({ x, y: y + 54, "text-anchor": "middle", "font-size": "11", fill: "#9a9386" }, room.role, g);
      hit(g, room.id);
    });
  }

  function drawVaults() {
    el("circle", { cx: 500, cy: 360, r: 70, fill: "#12101a", stroke: "#7eb6ff", "stroke-width": "1.6" });
    txt({ x: 500, y: 356, "text-anchor": "middle", fill: "#7eb6ff", "font-size": "16" }, "SIS");
    txt({ x: 500, y: 376, "text-anchor": "middle", fill: "#9a9386", "font-size": "11" }, "six vaults");
    world.vaults.forEach((vault, i) => {
      const p = polar(500, 360, 220, i, world.vaults.length);
      const n = polar(500, 360, 220, (i + 1) % world.vaults.length, world.vaults.length);
      el("line", { x1: p.x, y1: p.y, x2: n.x, y2: n.y, stroke: "#2a2433" });
      el("line", { x1: 500, y1: 360, x2: p.x, y2: p.y, stroke: "#1c1826" });
      const g = el("g", { class: "node", "data-id": vault.id, "data-active": String(vault.id === activeId) });
      el("circle", { class: "hit", cx: p.x, cy: p.y, r: 42, fill: vault.id === activeId ? "#e8c572" : "#1a2740", stroke: "#7eb6ff", filter: vault.id === activeId ? "url(#glow)" : "" }, g);
      txt({ x: p.x, y: p.y - 2, "text-anchor": "middle", fill: vault.id === activeId ? "#140f08" : "#f4efe6", "font-size": "18" }, vault.mark || "◆", g);
      txt({ x: p.x, y: p.y + 62, "text-anchor": "middle", fill: "#f4efe6", "font-size": "13" }, vault.title, g);
      hit(g, vault.id);
    });
  }

  function drawCity() {
    el("rect", { x: 40, y: 36, width: 920, height: 648, rx: 22, fill: "#0c0a12", stroke: "#2a2433" });
    el("circle", { cx: 500, cy: 360, r: 54, fill: "#12101a", stroke: "#e8c572" });
    txt({ x: 500, y: 365, "text-anchor": "middle", fill: "#e8c572", "font-size": "12" }, "CITADEL");
    world.city.forEach((district, i) => {
      const p = polar(500, 360, 248, i, world.city.length);
      const active = district.id === activeId;
      const g = el("g", { class: "node", "data-id": district.id, "data-active": String(active) });
      el("rect", {
        class: "hit",
        x: p.x - 92,
        y: p.y - 48,
        width: 184,
        height: 96,
        rx: 14,
        fill: active ? "#1d2a26" : "#14111c",
        stroke: active ? "#e8c572" : "#7ee0c6",
      }, g);
      txt({ x: p.x, y: p.y - 18, "text-anchor": "middle", fill: "#f4efe6", "font-size": "16" }, district.title, g);
      txt({ x: p.x, y: p.y + 2, "text-anchor": "middle", fill: "#9a9386", "font-size": "11" }, district.role, g);
      (district.buildings || []).forEach((building, bi) => {
        const bx = p.x - 78 + bi * 54;
        el("rect", { x: bx, y: p.y + 14, width: 48, height: 22, rx: 4, fill: "#0b0910" }, g);
        txt({ x: bx + 24, y: p.y + 29, "text-anchor": "middle", fill: "#7ee0c6", "font-size": "8" }, building.title.slice(0, 10), g);
      });
      hit(g, district.id);
    });
  }

  function drawBrain() {
    el("rect", { x: 70, y: 150, width: 390, height: 360, rx: 18, fill: "#101826", stroke: "#7eb6ff" });
    el("rect", { x: 540, y: 150, width: 390, height: 360, rx: 18, fill: "#1a140c", stroke: "#e8c572", "stroke-dasharray": "8 7" });
    txt({ x: 265, y: 132, "text-anchor": "middle", fill: "#7eb6ff" }, "BRAIN / MCP");
    txt({ x: 735, y: 132, "text-anchor": "middle", fill: "#e8c572" }, "PRIVATE / SEALED");
    el("line", { x1: 460, y1: 330, x2: 540, y2: 330, stroke: "#ff8a7a", "stroke-width": "2", "stroke-dasharray": "7 6" });
    txt({ x: 500, y: 318, "text-anchor": "middle", fill: "#ff8a7a", "font-size": "11" }, "air-gap");
    const slots = {
      "brain-vault": [265, 230],
      "people-map": [265, 320],
      "pattern-detector": [265, 410],
      "private-vault": [735, 330],
      chronicle: [500, 580],
    };
    world.brain.forEach((node) => {
      const [x, y] = slots[node.id];
      const g = el("g", { class: "node", "data-id": node.id, "data-active": String(node.id === activeId) });
      const w = node.id === "chronicle" ? 240 : 210;
      el("rect", {
        class: "hit",
        x: x - w / 2,
        y: y - 24,
        width: w,
        height: 48,
        rx: 10,
        fill: node.airGapped ? "#2a2110" : node.id === "chronicle" ? "#14111c" : "#152033",
        stroke: node.airGapped ? "#e8c572" : "#7eb6ff",
      }, g);
      txt({
        x,
        y: y + 5,
        "text-anchor": "middle",
        fill: "#f4efe6",
        "font-size": "14",
      }, node.title, g);
      hit(g, node.id);
    });
  }

  function positions() {
    const out = {};
    world.palace.forEach((room, i) => {
      out[room.id] = { ...polar(500, 300, 120, i, world.palace.length), fill: FILL.palace };
    });
    world.vaults.forEach((vault, i) => {
      out[vault.id] = { ...polar(500, 300, 210, i, world.vaults.length, -Math.PI / 3), fill: FILL.vaults };
    });
    world.city.forEach((district, i) => {
      out[district.id] = { ...polar(500, 300, 300, i, world.city.length, Math.PI / 10), fill: FILL.city };
    });
    world.brain.forEach((node, i) => {
      out[node.id] = { x: 100 + i * 200, y: 640, fill: node.airGapped ? "#e8c572" : "#9a9386" };
    });
    return out;
  }

  function drawGraph() {
    const pos = positions();
    const kindColor = {
      remembers: "#7eb6ff",
      leads: "#7ee0c6",
      indexes: "#b9a0ff",
      writes: "#9a9386",
      witnesses: "#e8c572",
      owns: "#7ee0c6",
      projects: "#ff8a7a",
    };
    (world.edges || []).forEach((edge) => {
      const a = pos[edge.from];
      const b = pos[edge.to];
      if (!a || !b) return;
      const hot = edge.from === activeId || edge.to === activeId;
      el("line", {
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        stroke: kindColor[edge.kind] || "#2a2433",
        "stroke-width": hot ? "2.2" : "1",
        opacity: hot ? "0.95" : "0.35",
      });
    });
    catalog().forEach((item) => {
      const p = pos[item.id];
      if (!p) return;
      const g = el("g", { class: "node", "data-id": item.id, "data-active": String(item.id === activeId) });
      el("circle", { class: "hit", cx: p.x, cy: p.y, r: item.id === activeId ? 14 : 8, fill: p.fill }, g);
      const neighbor = (world.edges || []).some((edge) => (edge.from === activeId && edge.to === item.id) || (edge.to === activeId && edge.from === item.id));
      if (item.id === activeId || neighbor) {
        txt({ x: p.x, y: p.y - 18, "text-anchor": "middle", "font-size": "11", fill: "#f4efe6" }, item.title, g);
      }
      hit(g, item.id);
    });
  }

  function drawInside() {
    const item = find(activeId);
    el("rect", { x: 70, y: 48, width: 860, height: 620, rx: 28, fill: "#100e16", stroke: "#e8c572" });
    el("rect", { x: 110, y: 90, width: 780, height: 220, rx: 18, fill: "#0b0910", stroke: "#2a2433" });
    txt({ x: 500, y: 150, "text-anchor": "middle", "font-size": "34", fill: "#f4efe6" }, item.title);
    txt({ x: 500, y: 180, "text-anchor": "middle", "font-size": "15", fill: "#e8c572" }, item.role || item.kind);
    wrap(item.lead || item.drive || "", 56).forEach((line, i) => {
      txt({ x: 500, y: 220 + i * 22, "text-anchor": "middle", "font-size": "16", fill: "#f4efe6" }, line);
    });
    wrap(item.enter || "", 52).forEach((line, i) => {
      txt({ x: 500, y: 360 + i * 22, "text-anchor": "middle", "font-size": "18", fill: "#e8c572" }, line);
    });
    const doors = [];
    if (item.vault) doors.push({ id: item.vault, label: `Vault · ${find(item.vault)?.title || item.vault}` });
    if (item.district) doors.push({ id: item.district, label: `City · ${find(item.district)?.title || item.district}` });
    doors.forEach((door, i) => {
      const x = doors.length === 1 ? 500 : 330 + i * 340;
      const g = el("g", { class: "node" });
      el("rect", { class: "hit", x: x - 110, y: 520, width: 220, height: 64, rx: 12, fill: "#1a140c", stroke: "#e8c572" }, g);
      txt({ x, y: 558, "text-anchor": "middle", fill: "#e8c572" }, door.label, g);
      g.addEventListener("click", () => {
        const next = find(door.id);
        if (!next) return;
        mode = "map";
        setLayer(next.layer, next.id);
      });
    });
    txt({ x: 500, y: 630, "text-anchor": "middle", fill: "#9a9386", "font-size": "12" }, "Esc · back to map");
  }

  function select(id) {
    activeId = id;
    writeHash();
    draw();
  }

  function enter() {
    mode = mode === "inside" ? "map" : "inside";
    writeHash();
    draw();
  }

  function draw() {
    svg.innerHTML = "";
    defs();
    el("rect", { x: 0, y: 0, width: 1000, height: 720, fill: "#07060c" });
    stars();
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
    else activeId = itemsForLayer()[0].id;
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
    if (event.target && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;
    const map = { Digit1: "palace", Digit2: "vaults", Digit3: "city", Digit4: "brain", Digit5: "graph" };
    if (map[event.code]) {
      event.preventDefault();
      setLayer(map[event.code]);
      return;
    }
    if (event.key === "?" || (event.shiftKey && event.key === "/")) {
      event.preventDefault();
      if (help?.open) help.close();
      else help?.showModal();
      return;
    }
    if (event.key === "Escape") {
      if (help?.open) return;
      event.preventDefault();
      mode = "map";
      writeHash();
      draw();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      if (event.target !== document.body && event.target !== svg && event.target?.tagName !== "svg") return;
      event.preventDefault();
      enter();
      return;
    }
    const items = itemsForLayer();
    const index = items.findIndex((item) => item.id === activeId);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      select(items[(index + 1) % items.length].id);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      select(items[(index - 1 + items.length) % items.length].id);
    }
  });

  async function boot() {
    if (!world) {
      try {
        world = await (await fetch("./world.v1.json")).json();
      } catch (error) {
        inspector.replaceChildren(h("h2", {}, "Serve locally"), h("p", { class: "lead" }, "python scripts/serve-starlight-world.py"));
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
