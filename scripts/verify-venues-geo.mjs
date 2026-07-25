// Venue accuracy verifier — checks every venue's coordinates against
// OpenStreetMap (Nominatim). No API key. Read-only: writes a report, never
// touches app.jsx.
//
// Run:  cd ~/peakly && node scripts/verify-venues-geo.mjs
// Out:  data/venue-geo-report.md  +  data/venue-geo-raw.json (resumable cache)
//
// Nominatim's usage policy caps us at 1 request/second and requires a real
// User-Agent, so a full 357-venue pass takes ~7 minutes. Results are cached —
// rerunning only queries venues it hasn't seen.
//
// What it flags:
//   MISMATCH  — OSM's coords for this name are >25km from ours (likely wrong place)
//   FAR       — 10–25km off (could be resort base vs. town centre; eyeball it)
//   NOTFOUND  — OSM can't resolve the name at all (may be fine for small beaches)
//   OK        — within 10km
//
// Distances are deliberately generous: a ski resort's coords legitimately differ
// from its namesake town by a few km. Only MISMATCH implies a real data error.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, "data", "venue-geo-raw.json");
const REPORT = path.join(ROOT, "data", "venue-geo-report.md");
const UA = "Peakly-venue-verifier/1.0 (https://j1mmychu.github.io/peakly; jjciluzzi@gmail.com)";

function readVenues() {
  const src = fs.readFileSync(path.join(ROOT, "app.jsx"), "utf8");
  const start = src.indexOf("const VENUES = [");
  const slice = src.slice(start + "const VENUES = ".length);
  let depth = 0, end = 0;
  for (let i = 0; i < slice.length; i++) {
    if (slice[i] === "[") depth++;
    else if (slice[i] === "]") { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  return new Function("return " + slice.slice(0, end))();
}

const R = 6371;
const rad = x => x * Math.PI / 180;
function km(a, b) {
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ascii = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "");

async function geocode(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en" } });
  if (res.status === 429) { console.log("  (rate limited — pausing 10s)"); await sleep(10000); return geocode(q); }
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  return res.json();
}

const venues = readVenues();
fs.mkdirSync(path.dirname(CACHE), { recursive: true });
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};

console.log(`Verifying ${venues.length} venues against OpenStreetMap (~1/sec, cached)…\n`);

let n = 0;
for (const v of venues) {
  n++;
  if (cache[v.id]) continue;
  const country = ascii(v.location || "").split(",").pop().trim();
  // Try the specific name first, then name+country — a bare "Kata Beach" can be
  // ambiguous, and a resort name may only resolve with its country attached.
  const queries = [`${ascii(v.title)}, ${country}`, ascii(v.title), `${ascii(v.location)}`];
  let best = null;
  for (const q of queries) {
    try {
      const hits = await geocode(q);
      await sleep(1100);            // Nominatim policy: max 1 req/sec
      if (hits?.length) {
        // pick the hit closest to our stored coords — we're testing "is our
        // point plausible for this name", not "which of several same-named places"
        const scored = hits.map(h => ({
          lat: parseFloat(h.lat), lon: parseFloat(h.lon),
          name: h.display_name, type: h.type,
          dist: km({ lat: v.lat, lon: v.lon }, { lat: parseFloat(h.lat), lon: parseFloat(h.lon) }),
        })).sort((a, b) => a.dist - b.dist);
        best = { query: q, ...scored[0] };
        break;
      }
    } catch (e) { console.warn(`  ⚠ ${v.id}: ${e.message}`); await sleep(2000); }
  }
  cache[v.id] = {
    id: v.id, title: v.title, location: v.location, category: v.category,
    lat: v.lat, lon: v.lon, osm: best,
    status: !best ? "NOTFOUND" : best.dist > 25 ? "MISMATCH" : best.dist > 10 ? "FAR" : "OK",
  };
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  const r = cache[v.id];
  const mark = { OK: "✓", FAR: "~", MISMATCH: "✗", NOTFOUND: "?" }[r.status];
  console.log(`${mark} ${String(n).padStart(3)}/${venues.length}  ${v.title} ${best ? `— ${best.dist.toFixed(1)}km` : "— not found"}`);
}

// ─── report ──────────────────────────────────────────────────────────────────
const rows = Object.values(cache);
const by = s => rows.filter(r => r.status === s);
const fmt = r => `| \`${r.id}\` | ${r.title} | ${r.location} | ${r.osm ? r.osm.dist.toFixed(1) + " km" : "—"} | ${r.osm ? r.osm.name.split(",").slice(0, 3).join(",") : "no OSM match"} |`;

const md = `# Venue coordinate verification — ${new Date().toISOString().slice(0, 10)}

${rows.length} venues checked against OpenStreetMap.

| Status | Count | Meaning |
|---|---|---|
| ✗ MISMATCH | ${by("MISMATCH").length} | >25 km from OSM's location for this name — **likely wrong coords** |
| ~ FAR | ${by("FAR").length} | 10–25 km — plausible (resort base vs. town) but worth an eyeball |
| ? NOTFOUND | ${by("NOTFOUND").length} | OSM can't resolve the name — common for small/unofficial beaches |
| ✓ OK | ${by("OK").length} | within 10 km |

## ✗ MISMATCH — fix these

| id | title | location | distance | OSM says |
|---|---|---|---|---|
${by("MISMATCH").sort((a, b) => b.osm.dist - a.osm.dist).map(fmt).join("\n") || "| — | none | | | |"}

## ~ FAR — review

| id | title | location | distance | OSM says |
|---|---|---|---|---|
${by("FAR").sort((a, b) => b.osm.dist - a.osm.dist).map(fmt).join("\n") || "| — | none | | | |"}

## ? NOTFOUND — name may be unofficial or misspelled

${by("NOTFOUND").map(r => `- \`${r.id}\` — ${r.title} (${r.location})`).join("\n") || "none"}
`;

fs.writeFileSync(REPORT, md);
console.log(`\nReport → ${REPORT}`);
console.log(`MISMATCH ${by("MISMATCH").length} · FAR ${by("FAR").length} · NOTFOUND ${by("NOTFOUND").length} · OK ${by("OK").length}`);
