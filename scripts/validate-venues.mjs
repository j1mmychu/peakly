// Validate candidate venues before they get pasted into app.jsx VENUES.
// Reads data/venue-candidates.json, runs 10 rules, writes:
//   - data/venue-accepted.json — paste-ready array, drop into VENUES
//   - data/venue-rejected.md   — human-readable list with reasons
//
// Usage:
//   node scripts/validate-venues.mjs                 # default paths
//   node scripts/validate-venues.mjs candidates.json # custom input
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

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "data");
const APP_JSX = path.join(ROOT, "app.jsx");

const candidatesPath = path.resolve(process.argv[2] || path.join(DATA_DIR, "venue-candidates.json"));
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

const appSrc = fs.readFileSync(APP_JSX, "utf8");
const AIRPORT_COORDS = extractBlock(appSrc, "AIRPORT_COORDS", "}");
const VENUES         = extractBlock(appSrc, "VENUES", "]");

const EXISTING_IDS = new Set(VENUES.map(v => v.id));
const APPROVED_TAGS = new Set(VENUES.flatMap(v => v.tags || []));
const APCOORDS_SET = new Set(Object.keys(AIRPORT_COORDS));

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

// ─── Validation ──────────────────────────────────────────────────────────
async function validate(v) {
  const errors = [];
  const warnings = [];

  // R1 required fields
  const required = ["id","title","location","category","ap","lat","lon","gradient","icon","tags"];
  for (const k of required) {
    if (v[k] === undefined || v[k] === null || v[k] === "") errors.push(`R1: missing ${k}`);
  }
  if (errors.length) return { errors, warnings };

  // R2 id format + uniqueness
  if (!/^[a-z][a-z0-9-]+$/.test(v.id)) errors.push(`R2: id "${v.id}" not kebab-case`);
  if (EXISTING_IDS.has(v.id)) errors.push(`R2: id "${v.id}" already in VENUES`);

  // R3 lat/lon range
  if (!(typeof v.lat === "number" && v.lat >= -90 && v.lat <= 90)) errors.push(`R3: lat ${v.lat} out of range`);
  if (!(typeof v.lon === "number" && v.lon >= -180 && v.lon <= 180)) errors.push(`R3: lon ${v.lon} out of range`);

  // R4 IATA shape + AIRPORT_COORDS membership
  if (!/^[A-Z]{3}$/.test(v.ap || "")) errors.push(`R4: ap "${v.ap}" not 3-letter IATA`);
  else if (!APCOORDS_SET.has(v.ap)) errors.push(`R4: ap "${v.ap}" missing from AIRPORT_COORDS (add it first)`);

  // R5 venue/airport proximity (only run if R3+R4 passed)
  if (errors.length === 0) {
    const apc = AIRPORT_COORDS[v.ap];
    const d = Math.round(haversineMiles({lat:v.lat, lon:v.lon}, apc));
    if (d > 300) errors.push(`R5: venue is ${d} mi from ${v.ap} (>300mi limit — wrong airport?)`);
  }

  // R6 category constraints
  if (!["skiing","beach"].includes(v.category)) errors.push(`R6: category "${v.category}" not in {skiing, beach}`);
  if (v.skiPass !== undefined && v.category !== "skiing") errors.push(`R6: skiPass only valid on skiing category`);

  // R7 photo URL HEAD check
  if (v.photo && !(await photoOk(v.photo))) errors.push(`R7: photo URL not reachable: ${v.photo.slice(0, 80)}`);

  // R8 tag vocabulary
  if (!Array.isArray(v.tags)) errors.push(`R8: tags must be an array`);
  else {
    for (const t of v.tags) {
      if (typeof t !== "string" || t.length > 20) errors.push(`R8: tag "${t}" invalid (string, ≤20 chars)`);
      else if (!APPROVED_TAGS.has(t)) warnings.push(`R8: new tag "${t}" (review + approve to extend vocab)`);
    }
  }

  // R9 lateSeason constraints
  if (v.lateSeason === true) {
    if (Math.abs(v.lat) < 35) errors.push(`R9: lateSeason needs |lat|>=35 (got ${v.lat})`);
    if (v.category !== "skiing") errors.push(`R9: lateSeason only valid on skiing category`);
  }

  // R10 poolPrimary constraints
  if (v.poolPrimary === true && v.category !== "beach") {
    errors.push(`R10: poolPrimary only valid on beach category`);
  }

  return { errors, warnings };
}

// ─── Main ────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(candidatesPath)) {
    console.error(`[validate-venues] candidate file not found: ${candidatesPath}`);
    console.error(`  expected JSON array of venue objects matching the VENUES schema.`);
    console.error(`  see scripts/README-venues.md for the workflow.`);
    process.exit(1);
  }
  const candidates = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));
  if (!Array.isArray(candidates)) {
    console.error(`[validate-venues] ${candidatesPath} must contain a JSON array`);
    process.exit(1);
  }

  console.log(`[validate-venues] validating ${candidates.length} candidates against ${VENUES.length} existing venues...`);

  fs.mkdirSync(DATA_DIR, { recursive: true });

  const accepted = [];
  const rejected = []; // [{id?, title?, errors:[]}]
  const flagged  = []; // [{id, warnings:[]}] — accepted but with new tags

  for (const v of candidates) {
    const { errors, warnings } = await validate(v);
    if (errors.length === 0) {
      accepted.push(v);
      if (warnings.length) flagged.push({ id: v.id, warnings });
    } else {
      rejected.push({ id: v.id || "(no id)", title: v.title || "(no title)", errors, warnings });
    }
  }

  // Write accepted JSON
  fs.writeFileSync(acceptedPath, JSON.stringify(accepted, null, 2) + "\n");

  // Write human-readable rejected report
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
    lines.push(`## ❌ Rejected (${rejected.length})`, ``);
    for (const r of rejected) {
      lines.push(`### ${r.id} — ${r.title}`);
      for (const e of r.errors) lines.push(`- ${e}`);
      if (r.warnings.length) for (const w of r.warnings) lines.push(`- ⚠️ ${w}`);
      lines.push(``);
    }
  }
  if (flagged.length) {
    lines.push(`## ⚠️ Accepted with new tags (${flagged.length})`, ``);
    for (const f of flagged) {
      lines.push(`### ${f.id}`);
      for (const w of f.warnings) lines.push(`- ${w}`);
      lines.push(``);
    }
  }
  if (!rejected.length && !flagged.length) {
    lines.push(`## ✅ All ${accepted.length} candidates accepted with no warnings.`, ``);
  }

  fs.writeFileSync(rejectedPath, lines.join("\n"));

  console.log(`[validate-venues] ✅ ${accepted.length} accepted → ${path.relative(ROOT, acceptedPath)}`);
  if (flagged.length) console.log(`[validate-venues] ⚠️ ${flagged.length} accepted with new-tag warnings → ${path.relative(ROOT, rejectedPath)}`);
  if (rejected.length) console.log(`[validate-venues] ❌ ${rejected.length} rejected → ${path.relative(ROOT, rejectedPath)}`);
  console.log(`[validate-venues] paste the contents of ${path.relative(ROOT, acceptedPath)} into the VENUES array in app.jsx and commit.`);
}

main().catch(err => { console.error(err); process.exit(1); });
