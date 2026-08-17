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

// ─── geo verification ─────────────────────────────────────────────────────
// Unsplash photos sometimes carry photographer-tagged location.position
// {latitude, longitude}. When present, this is a real, checkable signal —
// unlike a caption/tag match, GPS coordinates can't be miscaptioned into
// looking right. Distance in km via haversine; a candidate whose own GPS
// puts it >120km from the venue's known lat/lon is provably the wrong
// place regardless of what the search query matched on.
const GEO_REJECT_KM = 120;
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
// geoStatus: "verified" (has GPS, within range), "mismatch" (has GPS, too
// far — should be auto-rejected as a candidate), "unknown" (no GPS on the
// photo — needs a human/AI look against a real reference before trusting it).
function geoCheck(photo, venue) {
  const pos = photo?.location?.position;
  if (!pos || typeof pos.latitude !== "number" || typeof pos.longitude !== "number") {
    return { geoStatus: "unknown", geoDistanceKm: null };
  }
  const km = haversineKm(venue.lat, venue.lon, pos.latitude, pos.longitude);
  return { geoStatus: km <= GEO_REJECT_KM ? "verified" : "mismatch", geoDistanceKm: Math.round(km) };
}

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

// ─── Wikimedia Commons GeoSearch — no key, no meaningful rate limit ───────────
// Unsplash's own embedded location data turned out to cover ~0% of results in
// practice (checked 34 candidates, zero had usable GPS) — the geoCheck() above
// is correct but starved for input. Commons GeoSearch flips that: every result
// is returned BECAUSE it's tagged within a real radius of the coordinates we
// pass in, so verification isn't a lucky metadata hit, it's structural. Free,
// no application/approval needed (unlike Unsplash production access), and
// commons.wikimedia.org has no comparable per-hour ceiling for this volume.
// Tradeoff: Commons' index includes a lot of non-photo content (aerial survey
// tiles, scanned documents, maps) mixed in with real photography, so results
// need filtering — real image extensions only, reasonable size, skip diagrams.
const COMMONS_SKIP_EXT = /\.(svg|pdf|tif|tiff|ogv|webm|djvu|xcf)$/i;
const COMMONS_SKIP_TITLE = /\b(map|diagram|chart|graph|logo|flag|coat of arms|plan|survey|orthophoto|lidar|elevation)\b/i;

async function commonsGeoSearch(venue, radiusKm) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=geosearch`
    + `&gscoord=${venue.lat}|${venue.lon}&gsradius=${Math.min(radiusKm * 1000, 10000)}`
    + `&gslimit=30&gsnamespace=6&format=json`;
  const res = await fetch(url, { headers: { "User-Agent": "PeaklyPhotoSourcing/1.0 (travel app, non-commercial venue photo research)" } });
  if (!res.ok) return [];
  const json = await res.json();
  const hits = (json.query?.geosearch || [])
    .filter(h => !COMMONS_SKIP_EXT.test(h.title) && !COMMONS_SKIP_TITLE.test(h.title));
  if (!hits.length) return [];

  // Batch imageinfo lookup (url, dimensions, license) for up to 30 titles at once.
  const titles = hits.map(h => h.title).join("|");
  const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}`
    + `&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1200&format=json`;
  const infoRes = await fetch(infoUrl, { headers: { "User-Agent": "PeaklyPhotoSourcing/1.0 (travel app, non-commercial venue photo research)" } });
  if (!infoRes.ok) return [];
  const infoJson = await infoRes.json();
  const pages = Object.values(infoJson.query?.pages || {});

  return hits
    .map(h => {
      const page = pages.find(p => p.title === h.title);
      const info = page?.imageinfo?.[0];
      if (!info || !info.thumburl) return null;
      // Skip tiny images (icons/thumbnails masquerading as photos) and
      // extreme aspect ratios (panorama strips, scan artifacts).
      if ((info.width || 0) < 800 || (info.height || 0) < 500) return null;
      const ratio = info.width / info.height;
      if (ratio > 2.4 || ratio < 0.5) return null;
      return {
        source: "commons",
        title: h.title,
        url: info.thumburl,
        thumb: info.thumburl.replace("1200px", "400px"),
        description: info.extmetadata?.ImageDescription?.value?.replace(/<[^>]+>/g, "").slice(0, 200) || "",
        photographer: info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, "") || "",
        photographerUrl: info.descriptionurl || "",
        link: info.descriptionurl || "",
        geoDistanceKm: Math.round(h.dist / 1000 * 10) / 10,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.geoDistanceKm - b.geoDistanceKm);
}

// ─── main ────────────────────────────────────────────────────────────────────
const venues = readVenues();
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const saved = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const usedIds = new Set(Object.values(saved).map(c => c?.pick?.unsplashId).filter(Boolean));

// ─── --backfill-geo: retrofit geo verification onto picks from before the
// geo-check existed (e.g. the July pilot batch) — one lightweight detail
// lookup per already-picked photo, no search query burned.
if (ARGS.includes("--backfill-geo")) {
  const venueById = Object.fromEntries(venues.map(v => [v.id, v]));
  const targets = Object.values(saved).filter(c => c.pick && c.pick.geoStatus === undefined);
  console.log(`Backfilling geo data for ${targets.length} already-picked photo(s)…\n`);
  for (const c of targets) {
    const v = venueById[c.id];
    try {
      const res = await fetch(`https://api.unsplash.com/photos/${c.pick.unsplashId}`,
        { headers: { Authorization: `Client-ID ${KEY}`, "Accept-Version": "v1" } });
      const remaining = parseInt(res.headers.get("x-ratelimit-remaining") || "1", 10);
      if (res.status === 403 || remaining <= 0) {
        if (!WAIT) { console.log("Rate limit hit — rerun --backfill-geo later."); break; }
        console.log("⏸  Rate limit — sleeping 1 hour…");
        await sleep(61 * 60 * 1000);
      }
      if (!res.ok) { console.warn(`⚠ ${c.id}: HTTP ${res.status}`); continue; }
      const photo = await res.json();
      const geo = v ? geoCheck(photo, v) : { geoStatus: "unknown", geoDistanceKm: null };
      c.pick.geoStatus = geo.geoStatus;
      c.pick.geoDistanceKm = geo.geoDistanceKm;
      c.pick.locationRaw = photo.location?.name || photo.location?.city || photo.location?.country || null;
      fs.writeFileSync(OUT, JSON.stringify(saved, null, 2));
      console.log(`${geo.geoStatus === "verified" ? "✓📍" : geo.geoStatus === "mismatch" ? "✗ MISMATCH" : "?  unknown"}  ${c.title} — ${geo.geoDistanceKm != null ? geo.geoDistanceKm + "km" : "no GPS on photo"}${photo.location?.name ? ` (tagged: ${photo.location.name})` : ""}`);
      await sleep(120);
    } catch (e) { console.warn(`⚠ ${c.id}: ${e.message}`); }
  }
  console.log("\nDone backfilling.");
  process.exit(0);
}

// Also exclude photos ALREADY in the catalog. Without this, a search can hand
// back an image that's already stock on other venues — that's how Park City
// ended up sharing a photo with Alta, Thredbo and Fernie on the first run.
// Unsplash URLs embed the id as ".../photo-<id>?..." — extract and block those.
for (const v of venues) {
  const m = /\/photo-([A-Za-z0-9_-]+)/.exec(v.photo || "");
  if (m) usedIds.add(m[1]);
}

// --priority-file <path>: a JSON array of {id,...} (e.g. Jack's exported
// flagged list from photo-review.html) that jumps to the FRONT of the queue,
// ahead of even the marquee heuristic — human-confirmed-wrong beats a guess
// at what's recognizable.
const PRIORITY_FILE = (() => { const i = ARGS.indexOf("--priority-file"); return i >= 0 ? ARGS[i + 1] : null; })();
const PRIORITY_IDS = PRIORITY_FILE
  ? new Set(JSON.parse(fs.readFileSync(PRIORITY_FILE, "utf8")).map(v => v.id))
  : new Set();

// Marquee next: venues users actually recognize get the best shot at a
// correct photo before any rate limit bites.
const MARQUEE = /whistler|chamonix|zermatt|aspen|vail|jackson|niseko|verbier|st-anton|courchevel|val-d|banff|lake-louise|park-city|mammoth|tignes|maldives|bora|santorini|mykonos|amalfi|phuket|bali|maui|waikiki|tulum|cancun|ibiza|nice|malib/i;
const rank = v => (PRIORITY_IDS.has(v.id) ? 2 : MARQUEE.test(v.id) ? 1 : 0);
const queue = venues
  .filter(v => !(ONLY_MISSING && saved[v.id]?.pick))
  .sort((a, b) => rank(b) - rank(a))
  .slice(0, LIMIT);
if (PRIORITY_IDS.size) {
  console.log(`Priority file loaded: ${PRIORITY_IDS.size} human-flagged venues will fetch first.`);
}

console.log(`${venues.length} venues · ${Object.keys(saved).length} already fetched · ${queue.length} to do\n`);

let done = 0;
for (const v of queue) {
  const tried = [];
  let pick = null, alternates = [];

  // Try Commons first — structurally geo-verified, no rate-limit wall.
  // Widen the radius progressively rather than one big search so a tight
  // hit (500m away) is always preferred over a loose one (10km away).
  try {
    for (const radiusKm of [1, 3, 10]) {
      const hits = (await commonsGeoSearch(v, radiusKm)).filter(h => !usedIds.has(h.url));
      tried.push({ q: `commons r=${radiusKm}km`, hits: hits.length });
      if (hits.length) {
        const best = hits[0];
        pick = {
          unsplashId: best.url, // reused field name; holds the Commons URL as the dedupe key
          url: best.url, thumb: best.thumb, description: best.description,
          photographer: best.photographer, photographerUrl: best.photographerUrl, link: best.link,
          matchedQuery: `Commons GeoSearch (${radiusKm}km)`,
          geoStatus: "verified", geoDistanceKm: best.geoDistanceKm,
          source: "commons",
        };
        alternates = hits.slice(1, 6).map(h => ({
          unsplashId: h.url, url: h.url, thumb: h.thumb, description: h.description,
          photographer: h.photographer, link: h.link, matchedQuery: `Commons GeoSearch (${radiusKm}km)`,
          geoStatus: "verified", geoDistanceKm: h.geoDistanceKm, source: "commons",
        }));
        usedIds.add(best.url);
        break;
      }
      await sleep(150); // polite pacing on Commons, not required but courteous
    }
  } catch (e) { console.warn(`⚠ ${v.id} (commons): ${e.message}`); }

  if (pick) {
    saved[v.id] = { id: v.id, title: v.title, location: v.location, category: v.category, current: v.photo, pick, alternates, tried };
    fs.writeFileSync(OUT, JSON.stringify(saved, null, 2));
    done++;
    console.log(`✓📍 ${String(done).padStart(3)}/${queue.length}  ${v.title} — Commons [${pick.geoDistanceKm}km]`);
    continue;
  }

  // Nothing on Commons within 10km — fall back to Unsplash text search
  // (rate-limited, "unknown" geo confidence, needs a human/AI check).
  try {
    for (const q of queriesFor(v)) {
      const { results, remaining } = await search(q);
      tried.push({ q, hits: results.length });
      // Auto-reject anything whose own embedded GPS proves it's the wrong
      // place (>120km away) — a caption/tag match can't override real
      // coordinates. Among what's left, geo-verified hits go first so a
      // provably-correct photo wins over a merely plausibly-titled one.
      const candidates = results
        .filter(r => !usedIds.has(r.id))
        .map(r => ({ r, geo: geoCheck(r, v) }))
        .filter(({ geo }) => geo.geoStatus !== "mismatch");
      candidates.sort((a, b) => (a.geo.geoStatus === "verified" ? -1 : 0) - (b.geo.geoStatus === "verified" ? -1 : 0));
      const fresh = candidates.map(c => c.r);
      if (fresh.length) {
        const best = candidates[0];
        pick = {
          unsplashId: best.r.id,
          url: `${best.r.urls.raw}&w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75`,
          thumb: best.r.urls.small,
          description: best.r.description || best.r.alt_description || "",
          photographer: best.r.user?.name || "",
          photographerUrl: best.r.user?.links?.html || "",
          link: best.r.links?.html || "",
          matchedQuery: q,
          geoStatus: best.geo.geoStatus,
          geoDistanceKm: best.geo.geoDistanceKm,
        };
        alternates = candidates.slice(1, 6).map(({ r, geo }) => ({
          unsplashId: r.id,
          url: `${r.urls.raw}&w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75`,
          thumb: r.urls.small,
          description: r.description || r.alt_description || "",
          photographer: r.user?.name || "",
          link: r.links?.html || "",
          matchedQuery: q,
          geoStatus: geo.geoStatus,
          geoDistanceKm: geo.geoDistanceKm,
        }));
        usedIds.add(best.r.id);
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
  const mark = pick ? (pick.geoStatus === "verified" ? "✓📍" : "✓  ") : "·  ";
  console.log(`${mark} ${String(done).padStart(3)}/${queue.length}  ${v.title} — ${pick ? `"${pick.matchedQuery}"${pick.geoStatus === "verified" ? ` [GPS ${pick.geoDistanceKm}km]` : " [needs manual check]"}` : "no match"}`);
}

console.log(`\nDone. ${Object.values(saved).filter(c => c.pick).length}/${venues.length} venues have candidates.`);
console.log(`Next:  node scripts/photos-review.mjs   (opens a review page in your browser)`);
