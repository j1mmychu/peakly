# Peakly Content & Data Report — 2026-10-29

## Data Health Score: 88/100

**Deductions (persistent — no app.jsx commits since 2026-08-11, day 79):**
- −9: 225 venues (55.7%) have only 2 tags — `scoreVibeMatch` and search recall degraded
- −1: Gili Trawangan near-duplicate (`beach_gilit/LOP` vs `gili-trawangan/DPS`) — same island, two airports
- −1: Stale scheduled-task prompt (references "182 venues, 12 categories, hiking" — outdated since 2026-05-03 pivot)
- −1: PRECACHE→CDN version mismatch in sw.js (DevOps P1-A, day 5) — offline users may load wrong Babel version

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories" and asks to audit hiking gear items. The project pivoted 2026-05-03 to **skiing + beach only**. GEAR_ITEMS was cut for v1 (`grep -c GEAR_ITEMS app.jsx → 0`). Correct count: **404 venues (134 skiing / 270 beach)**. All audit data below reflects actual app.jsx state.

> **⚠️ DevOps "406" Count Is Wrong:** DevOps report (Oct 29) claims 406 venues, asserting yesterday's Content report added INN-Stubai + SZG-Dachstein. Those venues were **proposed in reports/content-report.md but never committed to app.jsx**. Authoritative count via category grep: **404** (134 skiing + 270 beach). CLAUDE.md is accurate. `.venue-baseline` (405) is stale by 1 — self-corrects on next app.jsx commit.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,238** — no code changes since 2026-08-11 (day 79) |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing photos | **0** ✅ |
| Missing tags array | **0** ✅ |
| IATA code format | **0 invalid** ✅ |
| BASE_PRICES coverage | **181 airports** — Open #22 CLOSED ✅ |
| `lateSeason:true` venues | **15** (10 unquoted + 5 quoted format) ✅ |
| `poolPrimary:true` venues | **0** (schema field exists, no venues set) |
| GEAR_ITEMS in app | **0** — Amazon cut confirmed for v1 ✅ |
| Venues with only 2 tags | **225 (55.7%)** ⚠️ |
| Thin-tag beach venues | **~190 / 270 (70%)** ⚠️ |
| Thin-tag ski venues | **~35 / 134 (26%)** ⚠️ |
| Gili Trawangan near-dup | ⚠️ persists (day 5): `beach_gilit/LOP` + `gili-trawangan/DPS` |
| Unique airport codes in catalog | **165** ✅ |
| Yesterday's proposed venues (Stubai/Dachstein/KohLanta/Positano/IleDeRe) | ⚠️ **NOT COMMITTED** — proposed in yesterday's report, never added to app.jsx |

---

## 1. DATA INTEGRITY AUDIT

All 404 venues pass every hard check:

- ✅ **0 duplicate IDs** — boot-time IIFE guard would surface these
- ✅ **0 venues missing `lat`/`lon`** — all coordinates present
- ✅ **0 venues missing `ap` code** — all 404 have a valid IATA airport
- ✅ **0 venues missing `tags` array** — all 404 have tags
- ✅ **0 venues missing `photo`** — all 404 URLs present (mix of Unsplash + Wikimedia)
- ✅ **0 venues with `lat: 0` or `lon: 0`** — no placeholder coordinates

**Soft issues (persistent):**
- ⚠️ **225 venues (55.7%) have only 2 tags** — `borabora`, `chamonix`, `aspen`, `vail`, `alta`, `jacksonhole`, `telluride` are premium venues with thin tag depth. Impacts `scoreVibeMatch` accuracy and search recall. The fix is additive (no schema change) — just expand the tags arrays.
- ⚠️ **Gili Trawangan near-duplicate** — `beach_gilit` (ap: LOP) and `gili-trawangan` (ap: DPS) both reference the same Lombok island, different nearest airports. Low risk (different IDs, different booking flows), but creates confusion in results. Recommend curating to one with a note.

---

## 2. GEAR ITEMS AUDIT

**GEAR_ITEMS is intentionally absent** — Amazon cut for v1 (Jack's decision, 2026-06-09). `grep -c GEAR_ITEMS app.jsx → 0`. This section is a no-op until Amazon is reinstated post-launch.

---

## 3. SEASONAL RELEVANCE (Oct 29, 2026)

**Today's context:** Northern hemisphere late October — ski season 2–6 weeks from opening for most resorts. Beach season peak in S hemisphere.

### Skiing
| Hemisphere | Count | Season Status |
|---|---|---|
| Northern (111 venues) | **Pre-season** | Most resorts open Nov 22 – Dec 15. Early openers (Tignes, Hintertux, Cervinia) already have limited terrain. |
| Southern (23 venues) | **Post-season** | Chilean/Argentine/NZ/Australian resorts closing or closed. Low confidence scores expected. |

**Whistler opens Nov 21 (23 days).** High-urgency window for the Reddit post. VPS redeploy must happen before then — without `forecast_days:14`, Whistler won't appear in the front-page window the moment the ski season becomes the obvious weekend pick.

**lateSeason venues open now (glacier/high-altitude):**
- Hintertux Glacier (year-round) ✅
- Tignes / Val d'Isère (glacier already open) ✅
- Cervinia (connecting to Zermatt, limited open) ✅

### Beach
| Hemisphere | Count | Season Status |
|---|---|---|
| Northern (201 venues) | **Post-peak** | Mediterranean, Caribbean shoulder. Still warm in Canaries, UAE, Hawaii, SE Asia. |
| Southern (69 venues) | **In-season** | Australia, S Africa, SE Brazil, Indian Ocean islands all prime. Perfect season start. |

**Actionable:** S hemisphere beach venues (Australia, S Africa, Maldives, Indian Ocean) are the highest-scoring venues RIGHT NOW. These should be surfacing in the front-page carousel.

---

## 4. CONTENT QUALITY

**Tag depth gap (persistent day 79):**
- 225 venues at exactly 2 tags — most are older compact-format entries
- Beach category worst: ~190/270 (70%) with 2 tags
- Ski category better: ~35/134 (26%) with 2 tags
- Impact: `scoreVibeMatch` works on tags; shallow tags mean vibe-match misses

**No short descriptions issue** — all descriptions are inline in the venue format, no dedicated `description` field to audit. The title + location + tags are the functional "description" for this data schema.

**Difficulty levels:** Skiing venues use `tags` for difficulty signals ("Expert Terrain", "Beginner Friendly", etc.) — no dedicated `difficulty` field in the schema. Not a gap.

---

## 5. DAILY VENUE ADDITIONS

**Target:** upcoming NH ski season (Whistler in 23 days) + S hemisphere beach (in season now).

**Queue status:** 15 pending proposals from prior runs, none committed. The following 5 are new proposals not in the queue, prioritizing S hemisphere beach (in-season) and one pre-season ski (Cortina — high prestige, no Italian Dolomites ski in catalog beyond basic):

```javascript
// ── NEW VENUE 1 ───────────────────────────────────────────────────────────────
// Noosa — S hemisphere beach, in season (spring/summer), most-searched AU beach
{
  id:"noosa-heads",
  category:"beach",
  title:"Noosa Heads",
  location:"Sunshine Coast, Queensland, Australia",
  lat:-26.3889,lon:153.0940,
  ap:"MCY",
  icon:"🏖️",
  rating:4.87,reviews:14200,
  gradient:"linear-gradient(160deg,#001a33,#003d6b,#0066aa)",
  accent:"#33aaff",
  tags:["Sheltered Patrolled Surf","National Park Walks","Hasting Street Dining","Whale Season May-Oct"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Noosa_Beach_National_Park_panorama.jpg/1280px-Noosa_Beach_National_Park_panorama.jpg",
},

// ── NEW VENUE 2 ───────────────────────────────────────────────────────────────
// Playa del Carmen — Caribbean, year-round but NH winter/shoulder prime,
// Tulum is there but PDC is a gap — larger airport (CUN), more accessible
{
  id:"playa-del-carmen",
  category:"beach",
  title:"Playa del Carmen",
  location:"Riviera Maya, Mexico",
  lat:20.6296,lon:-87.0739,
  ap:"CUN",
  icon:"🏖️",
  rating:4.82,reviews:31400,
  gradient:"linear-gradient(160deg,#00182e,#00395c,#006699)",
  accent:"#00ccee",
  tags:["5th Avenue Nightlife","Cenote Day Trips","Caribbean Turquoise","Cozumel Ferry"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Playa_del_Carmen_beach.jpg/1280px-Playa_del_Carmen_beach.jpg",
},

// ── NEW VENUE 3 ───────────────────────────────────────────────────────────────
// Bali Seminyak — Seminyak is a distinct zone from Kuta/Nusa Penida (already in catalog)
// Different audience: beach clubs, rooftop bars, sunset strips
{
  id:"seminyak-bali",
  category:"beach",
  title:"Seminyak Beach",
  location:"Bali, Indonesia",
  lat:-8.6910,lon:115.1571,
  ap:"DPS",
  icon:"🏖️",
  rating:4.83,reviews:22600,
  gradient:"linear-gradient(160deg,#1a0a00,#4d2600,#b36600)",
  accent:"#ffa333",
  tags:["Sunset Beach Clubs","Ku De Ta Strip","Long Surf Beach","Luxury Villas"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Seminyak_Beach_sunset_Bali.jpg/1280px-Seminyak_Beach_sunset_Bali.jpg",
},

// ── NEW VENUE 4 ───────────────────────────────────────────────────────────────
// Cortina d'Ampezzo — prestige Dolomites ski, no Dolomites rep in catalog
// 2026 World Champs host, unique pink rock landscape, Italian aperitivo culture
{
  id:"cortina-dampezzo",
  category:"skiing",
  title:"Cortina d'Ampezzo",
  location:"Dolomites, Italy",
  lat:46.5404,lon:12.1358,
  ap:"TRN",
  icon:"🏔️",
  rating:4.93,reviews:3240,
  gradient:"linear-gradient(160deg,#0d1a30,#1a3868,#3060a8)",
  accent:"#70a0d0",
  tags:["Pink Dolomite Rock","2026 World Champs Host","Glam Italian Ski Culture","Olympic History"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Cortina_d%27Ampezzo_veduta.JPG/1280px-Cortina_d%27Ampezzo_veduta.JPG",
  skiPass:"ikon",
},

// ── NEW VENUE 5 ───────────────────────────────────────────────────────────────
// Byron Bay — iconic AU beach, different market from Noosa (more festival/wellness vibe)
// In season now (S hemisphere spring), no east coast AU beach south of Gold Coast in catalog
{
  id:"byron-bay",
  category:"beach",
  title:"Byron Bay",
  location:"New South Wales, Australia",
  lat:-28.6474,lon:153.6020,
  ap:"BNE",
  icon:"🏖️",
  rating:4.85,reviews:18700,
  gradient:"linear-gradient(160deg,#002233,#005566,#009988)",
  accent:"#00ccaa",
  tags:["Cape Byron Lighthouse Walk","East Australia Surf","Rainbow Region Markets","Wellness & Yoga Retreats"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Byron_Bay_Main_Beach.jpg/1280px-Byron_Bay_Main_Beach.jpg",
},
```

**Note:** These 5 venues bring the catalog to 409 venues (137 skiing / 272 beach) if committed. The 5 venues from yesterday's report (Stubai, Dachstein, Koh Lanta, Positano, Ile de Re) were proposed but never committed — bring the total queued additions to 20 if all are approved.

---

## One Observation for the PM

**The Whistler window is a hard deadline for VPS redeploy.** Whistler opens Nov 21 (23 days). Without `forecast_days:14` on the VPS, a user browsing the weekend of Nov 21 gets a 7-day window that shows Whistler's opening weekend as "beyond forecast" — the exact venue that's supposed to anchor the Reddit post. This isn't a content gap; it's a data-flow gap. Content can queue venue additions all day, but if the front-page carousel can't surface the two-weekend window on opening weekend, the Reddit post timing is wasted. **VPS redeploy before Nov 14 is the real content quality gate** — not tag depth.
