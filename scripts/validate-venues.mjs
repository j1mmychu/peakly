// Validate candidate venues before they get pasted into app.jsx VENUES.
// Reads data/venue-candidates.json, runs 11 rules, writes:
//   - data/venue-accepted.json — paste-ready array, drop into VENUES
//   - data/venue-rejected.md   — human-readable list with reasons
//
// Usage:
//   node scripts/validate-venues.mjs                    # default paths
//   node scripts/validate-venues.mjs candidates.json    # custom input file
//   node scripts/validate-venues.mjs --watch [file]     # re-run on file change
//
// Rules:
//   R1  Required fields present
//   R2  ID kebab-case, not already in VENUES
//   R3  lat/lon in valid range
//   R4  IATA shape + present in AIRPORT_COORDS
//   R5  Distance(venue, airport) < 300 mi  (catches mismatched pairs)
//   R6  Category in {skiing, beach}; skiPass only on skiing
//   R7  Photo URL returns HTTP 200 on HEAD
//   R8  Tags array; new tags flagged for review (not rejected)
//   R9  lateSeason:true requires |lat|>=35 AND category==='skiing'
//   R10 poolPrimary:true requires category==='beach'
//   R11 photo is in the vetted, activity-appropriate pool (data/photo-pool.json)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "data");
const APP_JSX = path.join(ROOT, "app.jsx");

// Parse args: --watch flag + optional candidate file
const args = process.argv.slice(2);
const watchMode = args.includes("--watch");
const fileArg = args.find(a => !a.startsWith("--"));
const candidatesPath = path.resolve(fileArg || path.join(DATA_DIR, "venue-candidates.json"));
const acceptedPath   = path.join(DATA_DIR, "venue-accepted.json");
const rejectedPath   = path.join(DATA_DIR, "venue-rejected.md");

// ─── Extract existing data from app.jsx so we never need to keep two
// hand-edited copies of VENUES, AIRPORT_COORDS, or the tag vocabulary in sync.
function extractBlock(src, name, close) {
  const open = close === "}" ? "{" : "[";
  const startRe = new RegExp("const\\s+" + name + "\\s*=\\s*\\" + open);
  const m = src.match(startRe);
  if (!m) throw new Error("not found in app.jsx: " + name);
  let i = m.index + m[0].length - 1;
  let depth = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) { i++; break; } }
    else if (c === '"' || c === "'" || c === "`") {
      const q = c; i++;
      while (i < src.length && src[i] !== q) { if (src[i] === "\\") i++; i++; }
    }
    i++;
  }
  const body = src.slice(m.index + m[0].length - 1, i);
  // eslint-disable-next-line no-eval
  return eval("(" + body + ")");
}

function loadCatalogState() {
  const appSrc = fs.readFileSync(APP_JSX, "utf8");
  const AIRPORT_COORDS = extractBlock(appSrc, "AIRPORT_COORDS", "}");
  const VENUES         = extractBlock(appSrc, "VENUES", "]");
  return {
    AIRPORT_COORDS,
    VENUES,
    EXISTING_IDS: new Set(VENUES.map(v => v.id)),
    APPROVED_TAGS: new Set(VENUES.flatMap(v => v.tags || [])),
    APCOORDS_SET: new Set(Object.keys(AIRPORT_COORDS)),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function haversineMiles(a, b) {
  const R = 3958.8;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const sa = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(sa));
}

async function photoOk(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(url, { method: "HEAD", signal: ctrl.signal });
    clearTimeout(t);
    return r.ok;
  } catch { return false; }
}

// Vetted per-category photo pool (data/photo-pool.json) — every entry is verified
// live + vision-confirmed on-theme by the 2026-06-13 audit. R11 requires venues to
// use a pool photo so a ski venue never ships a beach/food/other image or a dead link.
let PHOTO_POOL = null;
try {
  const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "photo-pool.json"), "utf8"));
  PHOTO_POOL = { skiing: new Set(raw.skiing || []), beach: new Set(raw.beach || []) };
} catch { PHOTO_POOL = null; }

// ─── Validation ──────────────────────────────────────────────────────────
async function validate(v, state) {
  const errors = []; // [{rule, msg, suggestion?}]
  const warnings = [];
  const push = (rule, msg, suggestion) => errors.push({ rule, msg, suggestion });
  const warn = (rule, msg) => warnings.push({ rule, msg });

  // R1 required fields
  const required = ["id","title","location","category","ap","lat","lon","gradient","icon","tags"];
  for (const k of required) {
    if (v[k] === undefined || v[k] === null || v[k] === "") push("R1", `missing ${k}`);
  }
  if (errors.length) return { errors, warnings };

  // R2 id format + uniqueness
  if (!/^[a-z][a-z0-9-]+$/.test(v.id)) push("R2", `id "${v.id}" not kebab-case`);
  if (state.EXISTING_IDS.has(v.id)) push("R2", `id "${v.id}" already in VENUES`);

  // R3 lat/lon range
  if (!(typeof v.lat === "number" && v.lat >= -90 && v.lat <= 90)) push("R3", `lat ${v.lat} out of range`);
  if (!(typeof v.lon === "number" && v.lon >= -180 && v.lon <= 180)) push("R3", `lon ${v.lon} out of range`);

  // R4 IATA shape + AIRPORT_COORDS membership
  if (!/^[A-Z]{3}$/.test(v.ap || "")) {
    push("R4", `ap "${v.ap}" not 3-letter IATA`);
  } else if (!state.APCOORDS_SET.has(v.ap)) {
    push("R4",
      `ap "${v.ap}" missing from AIRPORT_COORDS`,
      `add \`${v.ap}: { lat: <N>, lon: <N> }\` to the AIRPORT_COORDS block in app.jsx, then re-run`);
  }

  // R5 venue/airport proximity (only run if R3+R4 passed)
  if (errors.length === 0) {
    const apc = state.AIRPORT_COORDS[v.ap];
    const d = Math.round(haversineMiles({lat:v.lat, lon:v.lon}, apc));
    if (d > 300) push("R5", `venue is ${d} mi from ${v.ap} (>300mi limit — wrong airport?)`);
  }

  // R6 category constraints
  if (!["skiing","beach"].includes(v.category)) push("R6", `category "${v.category}" not in {skiing, beach}`);
  if (v.skiPass !== undefined && v.category !== "skiing") push("R6", `skiPass only valid on skiing category`);

  // R7 photo URL HEAD check
  if (v.photo && !(await photoOk(v.photo))) push("R7", `photo URL not reachable: ${v.photo.slice(0, 80)}`);

  // R11 photo must be from the vetted, activity-appropriate pool (data/photo-pool.json)
  if (PHOTO_POOL && v.photo && PHOTO_POOL[v.category] && !PHOTO_POOL[v.category].has(v.photo)) {
    push("R11",
      `photo not in the approved ${v.category} pool`,
      `reuse a photo already in data/photo-pool.json["${v.category}"], or vision-review the new one (must show ${v.category === "skiing" ? "snow/mountain/skiing" : "beach/ocean/coast"}) and add it to the pool first`);
  }

  // R8 tag vocabulary
  if (!Array.isArray(v.tags)) {
    push("R8", `tags must be an array`);
  } else {
    for (const t of v.tags) {
      if (typeof t !== "string" || t.length > 20) push("R8", `tag "${t}" invalid (string, ≤20 chars)`);
      else if (!state.APPROVED_TAGS.has(t)) warn("R8", `new tag "${t}" (review + approve to extend vocab)`);
    }
  }

  // R9 lateSeason constraints
  if (v.lateSeason === true) {
    if (Math.abs(v.lat) < 35) push("R9", `lateSeason needs |lat|>=35 (got ${v.lat})`);
    if (v.category !== "skiing") push("R9", `lateSeason only valid on skiing category`);
  }

  // R10 poolPrimary constraints
  if (v.poolPrimary === true && v.category !== "beach") {
    push("R10", `poolPrimary only valid on beach category`);
  }

  return { errors, warnings };
}

// ─── Reporting ────────────────────────────────────────────────────────────
function groupByRule(rejected) {
  // Aggregate every error by its rule so Jack can fix all R4s in one pass.
  const map = new Map();
  for (const r of rejected) {
    for (const e of r.errors) {
      if (!map.has(e.rule)) map.set(e.rule, []);
      map.get(e.rule).push({ id: r.id, title: r.title, msg: e.msg, suggestion: e.suggestion });
    }
  }
  return [...map.entries()].sort(([a],[b]) => a.localeCompare(b));
}

async function runOnce() {
  if (!fs.existsSync(candidatesPath)) {
    console.error(`[validate-venues] candidate file not found: ${candidatesPath}`);
    console.error(`  expected JSON array of venue objects matching the VENUES schema.`);
    console.error(`  see scripts/README-venues.md for the workflow.`);
    return false;
  }
  const candidates = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));
  if (!Array.isArray(candidates)) {
    console.error(`[validate-venues] ${candidatesPath} must contain a JSON array`);
    return false;
  }

  const state = loadCatalogState();
  console.log(`[validate-venues] validating ${candidates.length} candidates against ${state.VENUES.length} existing venues...`);

  fs.mkdirSync(DATA_DIR, { recursive: true });

  const accepted = [];
  const rejected = [];
  const flagged  = [];

  for (const v of candidates) {
    const { errors, warnings } = await validate(v, state);
    if (errors.length === 0) {
      accepted.push(v);
      if (warnings.length) flagged.push({ id: v.id, warnings });
    } else {
      rejected.push({ id: v.id || "(no id)", title: v.title || "(no title)", errors, warnings });
    }
  }

  fs.writeFileSync(acceptedPath, JSON.stringify(accepted, null, 2) + "\n");

  const ts = new Date().toISOString();
  const lines = [
    `# Venue validation report — ${ts}`,
    ``,
    `- Input:    ${path.relative(ROOT, candidatesPath)}`,
    `- Accepted: ${accepted.length} → ${path.relative(ROOT, acceptedPath)}`,
    `- Rejected: ${rejected.length}`,
    `- Flagged:  ${flagged.length} (accepted, but new tags need vocab approval)`,
    ``,
  ];

  if (rejected.length) {
    const groups = groupByRule(rejected);
    lines.push(`## ❌ Rejected (${rejected.length}, grouped by rule)`, ``);
    for (const [rule, items] of groups) {
      lines.push(`### ${rule} — ${items.length} ${items.length === 1 ? "venue" : "venues"}`);
      for (const it of items) {
        lines.push(`- **${it.id}** (${it.title}) — ${it.msg}`);
        if (it.suggestion) lines.push(`  > 💡 ${it.suggestion}`);
      }
      lines.push(``);
    }
  }
  if (flagged.length) {
    lines.push(`## ⚠️ Accepted with new tags (${flagged.length})`, ``);
    for (const f of flagged) {
      lines.push(`### ${f.id}`);
      for (const w of f.warnings) lines.push(`- ${w.msg}`);
      lines.push(``);
    }
  }
  if (!rejected.length && !flagged.length) {
    lines.push(`## ✅ All ${accepted.length} candidates accepted with no warnings.`, ``);
  }

  fs.writeFileSync(rejectedPath, lines.join("\n"));

  // Inline summary keyed by rule so Jack sees the gist in the terminal.
  console.log(`[validate-venues] ✅ ${accepted.length} accepted → ${path.relative(ROOT, acceptedPath)}`);
  if (flagged.length) console.log(`[validate-venues] ⚠️ ${flagged.length} accepted with new-tag warnings → ${path.relative(ROOT, rejectedPath)}`);
  if (rejected.length) {
    console.log(`[validate-venues] ❌ ${rejected.length} rejected (by rule):`);
    for (const [rule, items] of groupByRule(rejected)) {
      console.log(`    ${rule}: ${items.length}`);
    }
    console.log(`[validate-venues]    full report → ${path.relative(ROOT, rejectedPath)}`);
  }
  console.log(`[validate-venues] paste the contents of ${path.relative(ROOT, acceptedPath)} into the VENUES array in app.jsx and commit.`);
  return true;
}

// ─── Main ────────────────────────────────────────────────────────────────
async function main() {
  await runOnce();

  if (watchMode) {
    console.log(`[validate-venues] --watch active. Edit ${path.relative(ROOT, candidatesPath)} (or app.jsx AIRPORT_COORDS) and the validator will re-run.`);
    let busy = false;
    let queued = false;
    const trigger = async () => {
      if (busy) { queued = true; return; }
      busy = true;
      try {
        console.log(`\n[validate-venues] change detected — re-running…\n`);
        await runOnce();
      } catch (err) {
        console.error(`[validate-venues] watch error:`, err.message);
      } finally {
        busy = false;
        if (queued) { queued = false; trigger(); }
      }
    };
    // Watch the candidates file + app.jsx (catalog state). Debounce via the
    // busy/queued flags so a flurry of saves coalesces into one re-run.
    fs.watch(candidatesPath, { persistent: true }, () => trigger());
    fs.watch(APP_JSX,        { persistent: true }, () => trigger());
    // Keep alive
    await new Promise(() => {});
  }
}

main().catch(err => { console.error(err); process.exit(1); });
