#!/usr/bin/env python3
"""Validate Starlight World and render the private drive surface."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORLD_PATH = ROOT / "docs" / "starlight-world" / "world.v1.json"
HTML_PATH = ROOT / "docs" / "starlight-world" / "index.html"

REQUIRED_PALACE = {
    "lighthouse",
    "ocean-house",
    "studio",
    "forge",
    "commons",
    "living-lab",
    "treasury",
    "observatory",
}
REQUIRED_VAULTS = {"strategic", "technical", "creative", "operational", "wisdom", "horizon"}
REQUIRED_CITY = {"starlight", "frankx", "arcanea", "gencreator", "command"}


def validate(world: dict) -> list[str]:
    errors: list[str] = []
    if world.get("schema") != "starlight.world.v1":
        errors.append("schema must be starlight.world.v1")
    if world.get("name") != "Starlight World":
        errors.append("name must be Starlight World")
    if "Q-Town" in json.dumps(world.get("palace", [])) or world.get("name") == "Q-Town":
        errors.append("do not name this world Q-Town")
    if world.get("privacy", {}).get("containsPrivateVaultNotes"):
        errors.append("world must not contain private vault notes")
    if world.get("privacy", {}).get("containsSecrets"):
        errors.append("world must not contain secrets")
    palace_ids = {item["id"] for item in world.get("palace", [])}
    if palace_ids != REQUIRED_PALACE:
        errors.append(f"palace rooms drifted: {sorted(palace_ids)}")
    vault_ids = {item["id"] for item in world.get("vaults", [])}
    if vault_ids != REQUIRED_VAULTS:
        errors.append(f"vaults drifted: {sorted(vault_ids)}")
    city_ids = {item["id"] for item in world.get("city", [])}
    if city_ids != REQUIRED_CITY:
        errors.append(f"city districts drifted: {sorted(city_ids)}")
    if any(item.get("live") for item in world.get("stewards", [])):
        errors.append("stewards must stay registered, not live")
    return errors


def render(world: dict) -> str:
    payload = json.dumps(world, ensure_ascii=False)
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Starlight World — drive surface</title>
  <style>
    :root {{
      color-scheme: dark;
      --bg: #05060A;
      --ink: #F1F3F9;
      --muted: #8A90A8;
      --line: #1A1F2E;
      --panel: #111522;
      --accent: #6EA8FE;
      --gold: #F5C36A;
      --mint: #79E6C5;
      --violet: #A78BFA;
    }}
    * {{ box-sizing: border-box; }}
    html, body {{ margin: 0; min-height: 100%; background: var(--bg); color: var(--ink); font: 15px/1.45 "IBM Plex Sans", "Segoe UI", sans-serif; }}
    body {{ display: grid; grid-template-rows: auto 1fr auto; min-height: 100vh; }}
    header, footer {{ padding: 20px 24px; border-bottom: 1px solid var(--line); }}
    footer {{ border-bottom: 0; border-top: 1px solid var(--line); color: var(--muted); font-size: 13px; }}
    h1 {{ margin: 0 0 6px; font-size: 28px; letter-spacing: -0.04em; }}
    .sub {{ color: var(--muted); max-width: 62ch; }}
    .layers {{ display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }}
    button {{
      appearance: none; border: 1px solid var(--line); background: #0A0C14; color: var(--ink);
      padding: 8px 12px; border-radius: 999px; cursor: pointer;
    }}
    button[aria-pressed="true"] {{ border-color: var(--accent); color: var(--accent); }}
    main {{ display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.8fr); min-height: 0; }}
    .map {{ position: relative; min-height: 68vh; overflow: hidden; background:
      radial-gradient(circle at 30% 20%, rgba(167,139,250,.08), transparent 28%),
      radial-gradient(circle at 80% 70%, rgba(110,168,254,.08), transparent 24%); }}
    svg {{ width: 100%; height: 100%; min-height: 68vh; }}
    .node {{ cursor: pointer; }}
    .node circle, .node rect {{ stroke: var(--line); stroke-width: 1.2; }}
    .node text {{ fill: var(--ink); font-size: 12px; pointer-events: none; }}
    .node[data-active="true"] circle, .node[data-active="true"] rect {{ stroke: var(--gold); stroke-width: 2; }}
    aside {{ border-left: 1px solid var(--line); padding: 20px 22px; background: #0A0C14; }}
    aside h2 {{ margin: 0 0 8px; font-size: 22px; letter-spacing: -0.03em; }}
    .kicker {{ color: var(--gold); text-transform: uppercase; letter-spacing: .12em; font-size: 11px; }}
    .lead {{ margin: 12px 0; }}
    .meta {{ color: var(--muted); font-size: 13px; }}
    @media (max-width: 860px) {{
      main {{ grid-template-columns: 1fr; }}
      aside {{ border-left: 0; border-top: 1px solid var(--line); }}
    }}
    @media (prefers-reduced-motion: reduce) {{ * {{ transition: none !important; }} }}
  </style>
</head>
<body>
  <header>
    <h1>Starlight World</h1>
    <p class="sub">You drive. Three layers: Mind Palace, six vaults, city districts. Stewards are registered, not launched. Private notes stay in the vault.</p>
    <div class="layers" role="tablist">
      <button type="button" id="layer-palace" aria-pressed="true">Palace</button>
      <button type="button" id="layer-vaults" aria-pressed="false">Vaults</button>
      <button type="button" id="layer-city" aria-pressed="false">City</button>
    </div>
  </header>
  <main>
    <section class="map" aria-label="Starlight World map">
      <svg id="world-svg" viewBox="0 0 1000 720" role="img"></svg>
    </section>
    <aside id="inspector">
      <div class="kicker">Lead</div>
      <h2>Choose a room</h2>
      <p class="lead">Palace is life. Vaults are memory. City is the estate you actually operate.</p>
      <p class="meta">Click a node. Arrow keys move. This is not Q-Town and not Agent Canvas.</p>
    </aside>
  </main>
  <footer>Local private surface · SIS Reality Architecture projection · no public publish</footer>
  <script id="world-data" type="application/json">{payload}</script>
  <script>
    const world = JSON.parse(document.getElementById("world-data").textContent);
    const svg = document.getElementById("world-svg");
    const inspector = document.getElementById("inspector");
    const buttons = {{
      palace: document.getElementById("layer-palace"),
      vaults: document.getElementById("layer-vaults"),
      city: document.getElementById("layer-city"),
    }};
    let layer = "palace";
    let activeId = world.palace[0].id;

    function setInspector(kind, item) {{
      const extras = [];
      if (item.path) extras.push("Path: " + item.path);
      if (item.repo) extras.push("Repo: " + item.repo);
      if (item.owns) extras.push("Owns: " + item.owns.join(", "));
      if (item.steward) extras.push("Steward: " + item.steward + " (not live)");
      inspector.innerHTML = `
        <div class="kicker">${{kind}}</div>
        <h2>${{item.title}}</h2>
        <p class="lead">${{item.lead || item.drive || item.role}}</p>
        <p class="meta">${{extras.join(" · ") || item.role}}</p>
      `;
    }}

    function draw() {{
      svg.innerHTML = "";
      const ns = "http://www.w3.org/2000/svg";
      const add = (name, attrs) => {{
        const el = document.createElementNS(ns, name);
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        svg.appendChild(el);
        return el;
      }};
      add("rect", {{ x: 0, y: 0, width: 1000, height: 720, fill: "#05060A" }});
      let items = [];
      if (layer === "palace") {{
        items = world.palace.map((room) => ({{
          ...room,
          kind: "Palace",
          cx: room.x * 10,
          cy: room.y * 7.2,
          r: 28,
          fill: "#A78BFA",
        }}));
      }} else if (layer === "vaults") {{
        items = world.vaults.map((vault, i) => {{
          const a = -Math.PI / 2 + (i * Math.PI * 2) / world.vaults.length;
          return {{
            ...vault,
            kind: "Vault",
            cx: 500 + Math.cos(a) * 220,
            cy: 360 + Math.sin(a) * 180,
            r: 34,
            fill: "#6EA8FE",
          }};
        }});
      }} else {{
        items = world.city.map((district, i) => {{
          const a = -Math.PI / 2 + (i * Math.PI * 2) / world.city.length;
          return {{
            ...district,
            kind: "City",
            cx: 500 + Math.cos(a) * 250,
            cy: 360 + Math.sin(a) * 190,
            r: 36,
            fill: "#79E6C5",
          }};
        }});
      }}
      if (!items.some((item) => item.id === activeId)) activeId = items[0].id;
      items.forEach((item) => {{
        const g = add("g", {{ class: "node", "data-id": item.id, "data-active": String(item.id === activeId) }});
        const c = document.createElementNS(ns, "circle");
        c.setAttribute("cx", item.cx);
        c.setAttribute("cy", item.cy);
        c.setAttribute("r", item.r);
        c.setAttribute("fill", item.fill);
        c.setAttribute("fill-opacity", "0.88");
        g.appendChild(c);
        const t = document.createElementNS(ns, "text");
        t.setAttribute("x", item.cx);
        t.setAttribute("y", item.cy + item.r + 18);
        t.setAttribute("text-anchor", "middle");
        t.textContent = item.title;
        g.appendChild(t);
        g.addEventListener("click", () => {{
          activeId = item.id;
          setInspector(item.kind, item);
          draw();
        }});
      }});
      const current = items.find((item) => item.id === activeId);
      if (current) setInspector(current.kind, current);
    }}

    Object.entries(buttons).forEach(([name, button]) => {{
      button.addEventListener("click", () => {{
        layer = name;
        Object.entries(buttons).forEach(([key, el]) => el.setAttribute("aria-pressed", String(key === name)));
        draw();
      }});
    }});

    window.addEventListener("keydown", (event) => {{
      const items = layer === "palace" ? world.palace : layer === "vaults" ? world.vaults : world.city;
      const index = items.findIndex((item) => item.id === activeId);
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {{
        activeId = items[(index + 1) % items.length].id;
        draw();
      }}
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {{
        activeId = items[(index - 1 + items.length) % items.length].id;
        draw();
      }}
    }});

    draw();
  </script>
</body>
</html>
"""


def main() -> int:
    world = json.loads(WORLD_PATH.read_text(encoding="utf-8"))
    errors = validate(world)
    if errors:
        print("INVALID")
        for error in errors:
            print("-", error)
        return 1
    HTML_PATH.write_text(render(world), encoding="utf-8")
    print(
        json.dumps(
            {
                "ok": True,
                "name": world["name"],
                "palace": len(world["palace"]),
                "vaults": len(world["vaults"]),
                "city": len(world["city"]),
                "html": str(HTML_PATH),
            }
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
