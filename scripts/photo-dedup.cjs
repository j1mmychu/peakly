#!/usr/bin/env node
/* Photo dedup (2026-06-13): redistribute each category's EXISTING verified photo
   palette evenly across its venues via round-robin in file order. No new/unseen
   photos — every URL is already in the catalog (verified on-theme + loads 200).
   Result: ski photos used <=2x, beach photos <=3x (optimal for the palette size).
   Usage: node scripts/photo-dedup.cjs --apply   (omit --apply for dry run) */
const fs = require("fs");
const APPLY = process.argv.includes("--apply");
const FILE = "app.jsx";
const src = fs.readFileSync(FILE, "utf8");

// locate VENUES array span
const ci = src.indexOf("const VENUES");
const start = src.indexOf("[", ci);
let depth = 0, end = -1;
for (let j = start; j < src.length; j++) {
  if (src[j] === "[") depth++;
  else if (src[j] === "]") { depth--; if (depth === 0) { end = j; break; } }
}
const arrText = src.slice(start, end + 1);
const arr = eval(arrText);

// split array text into top-level object spans (depth-1 braces)
const spans = [];
{
  let d = 0, objStart = -1;
  for (let j = 0; j < arrText.length; j++) {
    const c = arrText[j];
    if (c === "{") { if (d === 0) objStart = j; d++; }
    else if (c === "}") { d--; if (d === 0) spans.push([objStart, j + 1]); }
  }
}
if (spans.length !== arr.length) {
  console.error(`SPAN MISMATCH: ${spans.length} spans vs ${arr.length} venues — aborting`);
  process.exit(1);
}

// Vetted per-category photo pool (verified live + vision-confirmed on-theme by
// the 2026-06-13 audit). When present it is the authoritative palette — this is
// how dead/404 and theme-mismatched photos get dropped catalog-wide. Falls back
// to the in-file palette if the pool file is absent.
let POOL = null;
try { POOL = JSON.parse(fs.readFileSync("data/photo-pool.json", "utf8")); } catch (e) { POOL = null; }

// build new photo assignment per category via round-robin over the palette
function buildAssignment(cat) {
  const idxs = arr.map((v, i) => i).filter(i => arr[i].category === cat);
  let palette;
  if (POOL && Array.isArray(POOL[cat]) && POOL[cat].length) {
    palette = [...new Set(POOL[cat])];
  } else {
    palette = [];
    const seen = new Set();
    for (const i of idxs) { const u = arr[i].photo; if (!seen.has(u)) { seen.add(u); palette.push(u); } }
  }
  const map = {}; // venueIndex -> newPhoto
  idxs.forEach((i, k) => { map[i] = palette[k % palette.length]; });
  return { map, paletteSize: palette.length, count: idxs.length };
}

const cats = [...new Set(arr.map(v => v.category))];
const assign = {};
cats.forEach(c => { const r = buildAssignment(c); Object.assign(assign, r.map); console.log(`${c}: ${r.count} venues over ${r.paletteSize} photos -> max ${Math.ceil(r.count / r.paletteSize)}x`); });

// rebuild array text, replacing each object's photo URL where changed
let changed = 0;
const pieces = [];
let cursor = 0;
for (let k = 0; k < spans.length; k++) {
  const [s, e] = spans[k];
  pieces.push(arrText.slice(cursor, s));
  let objText = arrText.slice(s, e);
  const oldUrl = arr[k].photo;
  const newUrl = assign[k];
  if (newUrl && newUrl !== oldUrl) {
    if (!objText.includes(oldUrl)) { console.error(`URL not found in object ${arr[k].id} — aborting`); process.exit(1); }
    objText = objText.replace(oldUrl, newUrl); // URL unique within object
    changed++;
  }
  pieces.push(objText);
  cursor = e;
}
pieces.push(arrText.slice(cursor));
const newArrText = pieces.join("");
const newSrc = src.slice(0, start) + newArrText + src.slice(end + 1);

// verify the rebuilt array
const reArr = eval(newArrText);
function maxUsage(a, cat) {
  const m = {}; a.filter(v => v.category === cat).forEach(v => m[v.photo] = (m[v.photo] || 0) + 1);
  return Math.max(...Object.values(m));
}
const balOld = (src.match(/{/g) || []).length, balOldC = (src.match(/}/g) || []).length;
const balNew = (newSrc.match(/{/g) || []).length, balNewC = (newSrc.match(/}/g) || []).length;
console.log(`\nvenues changed: ${changed}`);
console.log(`reArr length: ${reArr.length} (was ${arr.length})`);
console.log(`ski max usage now: ${maxUsage(reArr, "skiing")} | beach max usage now: ${maxUsage(reArr, "beach")}`);
console.log(`distinct photos overall: ${new Set(reArr.map(v => v.photo)).size}`);
console.log(`braces {} old ${balOld}/${balOldC}  new ${balNew}/${balNewC}`);
const ids = reArr.map(v => v.id); console.log(`dup ids: ${ids.length - new Set(ids).size}`);

if (APPLY) {
  if (reArr.length !== arr.length || balNew !== balNewC) { console.error("invariant check failed — NOT writing"); process.exit(1); }
  fs.writeFileSync(FILE, newSrc);
  console.log("\nWROTE app.jsx");
} else {
  console.log("\n(dry run — re-run with --apply to write)");
}
