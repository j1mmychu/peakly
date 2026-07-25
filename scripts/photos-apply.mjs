// Venue photo sourcing — step 3 of 3.
//
// Applies the photos you approved in the review page to app.jsx. Only touches
// the `photo:` value of the exact venue ids in data/photo-decisions.json —
// nothing else in the file changes. Verifies before writing: brace balance,
// venue count, no duplicate photo URLs, every id found.
//
// Run:  cd ~/peakly && node scripts/photos-apply.mjs         (dry run — shows diff)
//       cd ~/peakly && node scripts/photos-apply.mjs --write  (actually writes)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(ROOT, "app.jsx");
const DEC = path.join(ROOT, "data", "photo-decisions.json");
const WRITE = process.argv.includes("--write");

if (!fs.existsSync(DEC)) {
  console.error(`No data/photo-decisions.json.

Export it from the review page (scripts/photos-review.mjs), then move the
downloaded file into ~/peakly/data/.`);
  process.exit(1);
}

const decisions = JSON.parse(fs.readFileSync(DEC, "utf8"));
let src = fs.readFileSync(APP, "utf8");
const before = src;

function countBraces(s) {
  let o = 0, c = 0;
  for (const ch of s) { if (ch === "{") o++; else if (ch === "}") c++; }
  return [o, c];
}
function readVenues(s) {
  const start = s.indexOf("const VENUES = [");
  const slice = s.slice(start + "const VENUES = ".length);
  let d = 0, end = 0;
  for (let i = 0; i < slice.length; i++) {
    if (slice[i] === "[") d++;
    else if (slice[i] === "]") { d--; if (d === 0) { end = i + 1; break; } }
  }
  return new Function("return " + slice.slice(0, end))();
}

const venuesBefore = readVenues(src);
const [ob, cb] = countBraces(src);

// The catalog mixes compact entries (photo:"…") and pretty-printed JSON
// entries ("photo": "…"), so match both forms — scoped to the line that also
// carries the venue's id to avoid touching anything else.
let applied = 0;
const missed = [];
for (const [id, url] of Object.entries(decisions)) {
  const v = venuesBefore.find(x => x.id === id);
  if (!v) { missed.push(`${id} (not in VENUES)`); continue; }
  const oldUrl = v.photo;
  if (!oldUrl) { missed.push(`${id} (no current photo)`); continue; }
  if (oldUrl === url) { continue; }

  // Find this venue's object text, then replace only the photo value inside it.
  const idPat = new RegExp(`(["']?id["']?\\s*:\\s*["']${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'])`);
  const m = idPat.exec(src);
  if (!m) { missed.push(`${id} (id not located in source)`); continue; }
  // Venue objects are well under 3000 chars; search forward from the id for
  // this entry's photo field.
  const windowStart = m.index;
  const windowEnd = Math.min(src.length, windowStart + 3000);
  const chunk = src.slice(windowStart, windowEnd);
  const photoPat = /(["']?photo["']?\s*:\s*)(["'])([^"']*)\2/;
  const pm = photoPat.exec(chunk);
  if (!pm) { missed.push(`${id} (photo field not found near id)`); continue; }
  const abs = windowStart + pm.index;
  const replaced = `${pm[1]}${pm[2]}${url}${pm[2]}`;
  src = src.slice(0, abs) + replaced + src.slice(abs + pm[0].length);
  applied++;
}

// ─── verify ──────────────────────────────────────────────────────────────────
const venuesAfter = readVenues(src);
const [oa, ca] = countBraces(src);
const problems = [];
if (venuesAfter.length !== venuesBefore.length) problems.push(`venue count changed: ${venuesBefore.length} → ${venuesAfter.length}`);
if (oa !== ob || ca !== cb) problems.push(`brace balance changed: ${ob}/${cb} → ${oa}/${ca}`);
if (oa !== ca) problems.push(`braces unbalanced: ${oa}/${ca}`);
const missingFields = venuesAfter.filter(v => !v.photo || !/^https:\/\//.test(v.photo));
if (missingFields.length) problems.push(`${missingFields.length} venue(s) with bad photo url: ${missingFields.slice(0, 3).map(v => v.id).join(", ")}`);

const photoCounts = {};
venuesAfter.forEach(v => { const p = (v.photo || "").split("?")[0]; photoCounts[p] = (photoCounts[p] || 0) + 1; });
const repeats = Object.entries(photoCounts).sort((a, b) => b[1] - a[1]);

console.log(`\napplied:  ${applied} photo(s)`);
if (missed.length) console.log(`skipped:  ${missed.length} — ${missed.slice(0, 6).join("; ")}${missed.length > 6 ? "…" : ""}`);
console.log(`venues:   ${venuesAfter.length} (unchanged)`);
console.log(`braces:   ${oa}/${ca}`);
console.log(`distinct photos: ${repeats.length} (was ${new Set(venuesBefore.map(v => (v.photo || "").split("?")[0])).size})`);
console.log(`max repeat:      ${repeats[0]?.[1]}× (was ${(() => {
  const c = {}; venuesBefore.forEach(v => { const p = (v.photo || "").split("?")[0]; c[p] = (c[p] || 0) + 1; });
  return Math.max(...Object.values(c));
})()}×)`);

if (problems.length) {
  console.error(`\n❌ NOT WRITING — verification failed:`);
  problems.forEach(p => console.error(`   • ${p}`));
  process.exit(1);
}

if (!WRITE) {
  console.log(`\n✓ Verification passed. This was a DRY RUN — nothing written.`);
  console.log(`  Rerun with --write to apply:  node scripts/photos-apply.mjs --write`);
  process.exit(0);
}

fs.writeFileSync(APP + ".bak", before);
fs.writeFileSync(APP, src);
console.log(`\n✓ Written to app.jsx (backup at app.jsx.bak)`);
console.log(`  Next: reload the local site to eyeball, then:  push "photos: real venue images for N venues"`);
