// Venue photo sourcing — step 1 of 3.
//
// Searches Unsplash for a real photo OF each venue (by name + location +
// category keywords), never reusing an image across venues. Writes candidates
// to data/photo-candidates.json. Nothing touches app.jsx until you approve
// picks in the review page (scripts/photos-review.mjs → photos-apply.mjs).
//
// Setup (one time, ~5 min):
//   1. https://unsplash.com/oauth/applications → "New Application" (accept terms)
//   2. Copy the "Access Key"
//   3. export UNSPLASH_KEY=your_access_key
//
// Run:  cd ~/peakly && UNSPLASH_KEY=xxx node scripts/photos-fetch.mjs
// Resumable — rerun after a rate-limit pause and it picks up where it stopped.
//
// Demo apps are capped at 50 requests/hour, so a full 358-venue run takes
// ~8 hours of wall clock in 50-venue chunks. Options: (a) let it run with
// --wait, it sleeps until the window resets; (b) apply for production access
// (instant approval usually, 5000/hr); (c) --limit N to do the marquee venues
// first. Progress is saved after every venue.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "photo-candidates.json");
const KEY = process.env.UNSPLASH_KEY;
const ARGS = process.argv.slice(2);
const LIMIT = (() => { const i = ARGS.indexOf("--limit"); return i >= 0 ? parseInt(ARGS[i + 1], 10) : Infinity; })();
const WAIT = ARGS.includes("--wait");
const ONLY_MISSING = !ARGS.includes("--all");

if (!KEY) {
  console.error(`
Missing UNSPLASH_KEY.

  1. Go to https://unsplash.com/oauth/applications
  2. "New Application", accept the terms, name it "Peakly"
  3. Copy the Access Key (not the Secret)
  4. Rerun:  UNSPLASH_KEY=paste_it_here node scripts/photos-fetch.mjs
`);
  process.exit(1);
}

// ─── read VENUES straight out of app.jsx (bracket-walker, never grep) ────────
function readVenues() {
  const src = fs.readFileSync(path.join(ROOT, "app.jsx"), "utf8");
  const start = src.indexOf("const VENUES = [");
  if (start < 0) throw new Error("VENUES array not found in app.jsx");
  const slice = src.slice(start + "const VENUES = ".length);
  let depth = 0, end = 0;
  for (let i = 0; i < slice.length; i++) {
    if (slice[i] === "[") depth++;
    else if (slice[i] === "]") { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  return new Function("return " + slice.slice(0, end))();
}

// ─── search query per venue ──────────────────────────────────────────────────
// Unsplash matches on photo tags/descriptions, so lead with the proper noun and
// add just enough context to disambiguate ("Aspen" alone returns aspen trees).
// Unsplash's index is ASCII-ish — "Malé" returns nothing while "Male Maldives"
// works. Strip diacritics and filler words that only ever hurt the match.
const ascii = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "");
const clean = s => ascii(s)
  .replace(/\s*\(.*?\)\s*/g, " ")
  .replace(/\b(united|resort|mountain|beach|ski area|the)\b/gi, " ")
  .replace(/[\/,]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

function queriesFor(v) {
  const title = clean(v.title);
  const rawTitle = ascii(v.title || "").replace(/\s*\(.*?\)\s*/g, " ").trim();
  const loc = ascii(v.location || "").split(",").map(s => s.trim());
  const region = clean(loc[0] || "");
  const country = clean(loc[loc.length - 1] || "");
  const kind = v.category === "skiing" ? "ski resort" : "beach";
  return [...new Set([
    `${rawTitle} ${kind}`,
    `${title} ${country}`,
    `${title} ${kind}`,
    `${title} ${region}`,
    title,
    // last resorts: regional scenery — still far better than random global stock
    `${region} ${country} ${kind}`,
    `${country} ${kind}`,
  ])].filter(q => q.replace(/\s+/g, " ").trim().length > 3);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function search(query, page = 1) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}`
    + `&per_page=10&orientation=landscape&content_filter=high&page=${page}`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${KEY}`, "Accept-Version": "v1" } });
  const remaining = parseInt(res.headers.get("x-ratelimit-remaining") || "1", 10);
  if (res.status === 403 || remaining <= 0) {
    if (!WAIT) {
      throw Object.assign(new Error("RATE_LIMIT"), { rateLimited: true });
    }
    console.log("\n⏸  Rate limit hit — sleeping 1 hour (progress is saved; Ctrl-C is safe).");
    await sleep(61 * 60 * 1000);
    return search(query, page);
  }
  if (!res.ok) throw new Error(`Unsplash ${res.status} for "${query}"`);
  const json = await res.json();
  return { results: json.results || [], remaining };
}

// ─── main ────────────────────────────────────────────────────────────────────
const venues = readVenues();
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const saved = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const usedIds = new Set(Object.values(saved).map(c => c?.pick?.unsplashId).filter(Boolean));

// Also exclude photos ALREADY in the catalog. Without this, a search can hand
// back an image that's already stock on other venues — that's how Park City
// ended up sharing a photo with Alta, Thredbo and Fernie on the first run.
// Unsplash URLs embed the id as ".../photo-<id>?..." — extract and block those.
for (const v of venues) {
  const m = /\/photo-([A-Za-z0-9_-]+)/.exec(v.photo || "");
  if (m) usedIds.add(m[1]);
}

// Marquee first: venues users actually recognize get the best shot at a
// correct photo before any rate limit bites.
const MARQUEE = /whistler|chamonix|zermatt|aspen|vail|jackson|niseko|verbier|st-anton|courchevel|val-d|banff|lake-louise|park-city|mammoth|tignes|maldives|bora|santorini|mykonos|amalfi|phuket|bali|maui|waikiki|tulum|cancun|ibiza|nice|malib/i;
const queue = venues
  .filter(v => !(ONLY_MISSING && saved[v.id]?.pick))
  .sort((a, b) => (MARQUEE.test(b.id) ? 1 : 0) - (MARQUEE.test(a.id) ? 1 : 0))
  .slice(0, LIMIT);

console.log(`${venues.length} venues · ${Object.keys(saved).length} already fetched · ${queue.length} to do\n`);

let done = 0;
for (const v of queue) {
  const tried = [];
  let pick = null, alternates = [];
  try {
    for (const q of queriesFor(v)) {
      const { results, remaining } = await search(q);
      tried.push({ q, hits: results.length });
      const fresh = results.filter(r => !usedIds.has(r.id));
      if (fresh.length) {
        const best = fresh[0];
        pick = {
          unsplashId: best.id,
          url: `${best.urls.raw}&w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75`,
          thumb: best.urls.small,
          description: best.description || best.alt_description || "",
          photographer: best.user?.name || "",
          photographerUrl: best.user?.links?.html || "",
          link: best.links?.html || "",
          matchedQuery: q,
        };
        alternates = fresh.slice(1, 6).map(r => ({
          unsplashId: r.id,
          url: `${r.urls.raw}&w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75`,
          thumb: r.urls.small,
          description: r.description || r.alt_description || "",
          photographer: r.user?.name || "",
          link: r.links?.html || "",
          matchedQuery: q,
        }));
        usedIds.add(best.id);
        break;
      }
      await sleep(120);
      if (remaining <= 1 && !WAIT) throw Object.assign(new Error("RATE_LIMIT"), { rateLimited: true });
    }
  } catch (e) {
    if (e.rateLimited) {
      fs.writeFileSync(OUT, JSON.stringify(saved, null, 2));
      console.log(`\n⏸  Unsplash hourly limit reached after ${done} venues. Progress saved.`);
      console.log(`   Rerun in an hour (same command), or add --wait to auto-resume,`);
      console.log(`   or apply for production access (5000/hr) at your app's dashboard.`);
      process.exit(0);
    }
    console.warn(`⚠ ${v.id}: ${e.message}`);
  }

  saved[v.id] = {
    id: v.id, title: v.title, location: v.location, category: v.category,
    current: v.photo, pick, alternates, tried,
  };
  fs.writeFileSync(OUT, JSON.stringify(saved, null, 2));
  done++;
  const mark = pick ? "✓" : "·";
  console.log(`${mark} ${String(done).padStart(3)}/${queue.length}  ${v.title} — ${pick ? `"${pick.matchedQuery}"` : "no match"}`);
}

console.log(`\nDone. ${Object.values(saved).filter(c => c.pick).length}/${venues.length} venues have candidates.`);
console.log(`Next:  node scripts/photos-review.mjs   (opens a review page in your browser)`);
