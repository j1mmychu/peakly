// Venue accuracy — pass 2: REVERSE geocode.
//
// Pass 1 (verify-venues-geo.mjs) asked "where does OSM think this name is?"
// which produces false alarms whenever a name exists twice on earth (Brighton
// Utah vs Brighton Colorado, Coogee Sydney vs Coogee Perth).
//
// This pass asks the opposite, decisive question: "what is actually AT our
// coordinates?" If our point for Brighton reverse-geocodes to Utah, our data
// is right and pass 1 was noise. If it lands in a different country from the
// venue's stated location, it's a genuine error.
//
// Only re-checks venues pass 1 flagged (MISMATCH + FAR), so it's ~1 minute.
//
// Run:  cd ~/peakly && node scripts/verify-venues-reverse.mjs
// Out:  data/venue-geo-verdicts.md

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PASS1 = path.join(ROOT, "data", "venue-geo-raw.json");
const CACHE = path.join(ROOT, "data", "venue-reverse-raw.json");
const OUT = path.join(ROOT, "data", "venue-geo-verdicts.md");
const UA = "Peakly-venue-verifier/1.0 (https://j1mmychu.github.io/peakly; jjciluzzi@gmail.com)";

if (!fs.existsSync(PASS1)) {
  console.error("Run scripts/verify-venues-geo.mjs first.");
  process.exit(1);
}
const pass1 = JSON.parse(fs.readFileSync(PASS1, "utf8"));
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function reverse(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=12`;
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en" } });
  if (res.status === 429) { await sleep(10000); return reverse(lat, lon); }
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  return res.json();
}

// Normalizing country names so "USA" == "United States" == "United States of America"
const COUNTRY_ALIAS = {
  usa: "united states", us: "united states", "u.s.a.": "united states",
  uk: "united kingdom", "great britain": "united kingdom", england: "united kingdom",
  scotland: "united kingdom", uae: "united arab emirates",
  "st. lucia": "saint lucia", "st lucia": "saint lucia",
  "st. martin": "sint maarten", "sint maarten": "sint maarten", "st martin": "sint maarten",
  "turks & caicos": "turks and caicos islands", "turks and caicos": "turks and caicos islands",
  bvi: "british virgin islands", usvi: "u.s. virgin islands",
  "cape verde": "cabo verde", "ivory coast": "côte d'ivoire",
  "cook islands": "cook islands", czechia: "czech republic",
};
const norm = s => {
  const t = (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  return COUNTRY_ALIAS[t] || t;
};

const flagged = Object.values(pass1).filter(r => r.status === "MISMATCH" || r.status === "FAR");
console.log(`Reverse-geocoding ${flagged.length} flagged venues (~1/sec)…\n`);

let n = 0;
for (const v of flagged) {
  n++;
  if (cache[v.id]) continue;
  try {
    const r = await reverse(v.lat, v.lon);
    await sleep(1100);
    const a = r?.address || {};
    cache[v.id] = {
      ...v,
      at: {
        display: r?.display_name || "(ocean / unmapped)",
        country: a.country || "",
        state: a.state || a.region || "",
        locality: a.city || a.town || a.village || a.municipality || a.county || "",
        isWater: !r?.address || !!a.body_of_water || /ocean|sea$/i.test(r?.name || ""),
      },
    };
  } catch (e) {
    console.warn(`  ⚠ ${v.id}: ${e.message}`);
    cache[v.id] = { ...v, at: null };
    await sleep(2000);
  }
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  const c = cache[v.id];
  console.log(`${String(n).padStart(3)}/${flagged.length}  ${v.title}  →  ${c.at ? (c.at.locality || c.at.state || c.at.display.split(",")[0]) + (c.at.country ? ", " + c.at.country : "") : "?"}`);
}

// ─── verdicts ────────────────────────────────────────────────────────────────
const rows = Object.values(cache);
for (const r of rows) {
  const stated = norm((r.location || "").split(",").pop());
  const actual = norm(r.at?.country);
  if (!r.at) { r.verdict = "UNKNOWN"; continue; }
  if (!actual) {
    // Ocean/unmapped is normal and often CORRECT for island + reef venues.
    r.verdict = "WATER";
  } else if (actual === stated) {
    r.verdict = "CONFIRMED";       // right country → pass 1 matched a same-named place elsewhere
  } else {
    r.verdict = "WRONG_COUNTRY";   // genuinely misplaced
  }
}
const by = v => rows.filter(r => r.verdict === v);
const line = r => `| \`${r.id}\` | ${r.title} | stated: **${(r.location || "").split(",").pop().trim()}** | actual: **${r.at?.country || "—"}**${r.at?.locality ? " (" + r.at.locality + ")" : ""} | pass1 said ${r.osm ? r.osm.dist.toFixed(0) + "km" : "?"} |`;

const md = `# Venue coordinate verdicts — ${new Date().toISOString().slice(0, 10)}

Pass 1 forward-geocoded names (noisy — same names exist worldwide).
Pass 2 reverse-geocodes our actual coordinates. **Pass 2 is the authoritative one.**

${flagged.length} flagged venues re-checked.

| Verdict | Count | Meaning |
|---|---|---|
| ✅ CONFIRMED | ${by("CONFIRMED").length} | our coords land in the correct country — pass 1 was a false alarm, **no action** |
| 🌊 WATER | ${by("WATER").length} | coords are over water/unmapped — normal for island & reef venues, but verify the obvious ones |
| ❌ WRONG_COUNTRY | ${by("WRONG_COUNTRY").length} | coords land in a different country than stated — **real errors, fix these** |

## ❌ WRONG_COUNTRY — real errors

| id | title | stated | actual | pass1 |
|---|---|---|---|---|
${by("WRONG_COUNTRY").map(line).join("\n") || "| — | none | | | |"}

## 🌊 WATER — check the non-island ones

| id | title | stated country | pass1 distance |
|---|---|---|---|
${by("WATER").map(r => `| \`${r.id}\` | ${r.title} | ${(r.location || "").split(",").pop().trim()} | ${r.osm ? r.osm.dist.toFixed(0) + "km" : "?"} |`).join("\n") || "| — | none | | |"}

## ✅ CONFIRMED — false alarms from pass 1, no action needed

${by("CONFIRMED").map(r => `- \`${r.id}\` **${r.title}** — coords are in ${r.at.country}${r.at.locality ? ` (${r.at.locality})` : ""} as stated; pass 1's ${r.osm ? r.osm.dist.toFixed(0) + "km" : "?"} was a same-named place elsewhere`).join("\n") || "none"}
`;

fs.writeFileSync(OUT, md);
console.log(`\nVerdicts → ${OUT}`);
console.log(`✅ CONFIRMED ${by("CONFIRMED").length} · 🌊 WATER ${by("WATER").length} · ❌ WRONG_COUNTRY ${by("WRONG_COUNTRY").length}`);
