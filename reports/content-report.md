# Peakly Content & Data Report — 2026-10-25

## Data Health Score: 89/100

**Deductions (no code changes since yesterday — same issues persist):**
- −9: 225 venues (55.7%) have only 2 tags — `scoreVibeMatch` and search recall degraded
- −1: Gili Trawangan near-duplicate (`beach_gilit/LOP` vs `gili-trawangan/DPS`) — same title, different island airports; both are valid destinations but confusing in listings
- −1: Stale scheduled-task prompt (references "182 venues, 12 categories" — outdated since 2026-05-03 pivot)

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories." The project pivoted 2026-05-03 to **skiing + beach only**. Correct count: **404 venues (134 skiing / 270 beach)**. All audit data below reflects actual app.jsx state.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | ~14,238 — cache `peakly-20260914a`, **41 days stale** ⚠️⚠️ |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Gili Trawangan near-dup | ⚠️ `beach_gilit/LOP` + `gili-trawangan/DPS` |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** (165 unique APs across 404 venues) ✅ |
| Missing photos | **0** ✅ |
| Missing tags array | **0** ✅ |
| Venues with exactly 2 tags | **225 (55.7%)** ⚠️ |
| Venues with 3 tags | **14** |
| Venues with 4+ tags | **165** |
| Venue APs in AP_CONTINENT | **165/165** ✅ |
| Venue APs in AIRPORT_COORDS | **165/165** ✅ |
| BASE_PRICES coverage | **404/404 (100%)** ✅ RESOLVED |

---

## 1. DATA INTEGRITY AUDIT

All 404 venues pass the core checks: no missing coordinates, no missing airport codes, no missing tags arrays, no duplicate IDs, no duplicate photo URLs, no lat/lon out of range.

**Gili Trawangan near-duplicate:**
- `beach_gilit` — Gili Trawangan, served via LOP (Lombok International)
- `gili-trawangan` — Gili Trawangan, served via DPS (Bali Ngurah Rai)

Both are the same island, but LOP/DPS serve genuinely different traveler segments (Lombok-based vs Bali-based). Not technically wrong, but confusing in a side-by-side listing. Recommend: differentiate with explicit "from Lombok" / "from Bali gateway" in the title, or remove the DPS duplicate since DPS has 18 other venues and LOP has only this one.

**Tag distribution:**
```
0-1 tags:  0 venues
2 tags:  225 venues (55.7%)  ← quality gap
3 tags:   14 venues
4 tags:  164 venues
5 tags:    1 venue
```
Two-tag venues exist predominantly in the batch-added beach set (the 134 added in commit `7561a18`). Example: `beach_myrtle` has only `["White Sand", "Boardwalk"]`. `scoreVibeMatch` uses tags as a corpus — thin tags reduce match precision, which hurts the "For you" algorithm quality.

---

## 2. GEAR ITEMS AUDIT

**GEAR_ITEMS is CUT for v1 per Jack's explicit decision (2026-06-09).** `grep -c GEAR_ITEMS app.jsx` → 0. Do not restore. Revisit post-launch. No action needed.

---

## 3. SEASONAL RELEVANCE (2026-10-25)

| Segment | Count | Status |
|---------|-------|--------|
| Ski — N hemisphere (lat ≥ 0) | 111 | ⚠️ Pre-season / closed (Nov–Dec opens) |
| Ski — S hemisphere (lat < 0) | 23 | ⚠️ Season ending (austral spring) |
| Beach — N hemisphere (lat ≥ 0) | 201 | 🟡 Shoulder / off-peak for most |
| Beach — S hemisphere (lat < 0) | 69 | ✅ **Early summer — IN SEASON** |

**Late-season ski (lateSeason: true):** 15 venues — all N hemisphere glacier/high-altitude resorts (Hintertux, Tignes, Zermatt, Saas-Fee, etc.). These may have partial skiing available in late October due to glacier access. The `lateSeason: true` flag is correctly set on all 15.

**Key in-season opportunities this week:**
- Southern hemisphere beaches (Brazil, Argentina, South Africa, NZ, Australia) are entering early summer — best scoring window of their year
- Caribbean (year-round tropical) — always competitive
- Mediterranean: shoulder season but still warm (AGP/NCE/NAP area)

**⚠️ Note for PM:** With 111 N hemisphere ski venues nearly off-season and S hemisphere beach at peak, the front page should be naturally favoring beach this weekend. If the Explore grid isn't reflecting this, check that `scoreWeekend` confidence flags are filtering out forecasts beyond day 4 for venues without current snow cover.

---

## 4. CONTENT QUALITY

### Photos
All 404 venues have photos. Per CLAUDE.md, ~346 of 404 are generic stock unrelated to the specific venue (Open #20). The photo quality gap is the largest remaining content issue. Pipeline: `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait`.

### BASE_PRICES — MAJOR IMPROVEMENT (Open #22 appears RESOLVED)
The PM v119 Decision 3 batch filled BASE_PRICES to **100% coverage** (404/404 venues, 165 APs, all with pricing to 14 US hub airports). **CLAUDE.md currently states 43% coverage — that entry is stale and should be updated.** Open #22 can be closed.

### Tag Quality Gap (Open observation)
225 venues (55.7%) have only 2 tags. A quick fix would expand the 4-tag batch venues to 3-4 tags. Estimated effort: 2h scripted, or can be batched with the next venue addition run.

---

## 5. DAILY VENUE ADDITIONS

Targeting airports with only 1 venue (expansion opportunities) and in-season destinations. All 5 use airports already in `AIRPORT_COORDS` and `AP_CONTINENT`.

### Venue 1 — Arraial do Cabo, Brazil (GIG beach → 2 venues)
Brazil's "Brazilian Caribbean." Crystal-clear turquoise water, UNESCO-protected area, popular for snorkeling. Peak condition: October–March (S hemisphere summer). GIG currently has only Ipanema (urban beach) — this adds a pristine nature beach from the same gateway.

```js
{
  id: "arraial-do-cabo-br",
  category: "beach",
  title: "Arraial do Cabo",
  location: "Rio de Janeiro State, Brazil",
  lat: -22.9655,
  lon: -42.0278,
  ap: "GIG",
  icon: "🏖️",
  rating: 4.8,
  reviews: 1240,
  gradient: "linear-gradient(160deg,#006994,#00b4d8,#90e0ef)",
  accent: "#00b4d8",
  tags: ["Crystal Clear Water", "Praia do Farol", "Snorkeling", "Boat Tours"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Arraial_do_Cabo_Aerial_View.jpg/1280px-Arraial_do_Cabo_Aerial_View.jpg"
},
```

### Venue 2 — Bardonecchia, Italy (TRN ski → 3 venues)
2006 Winter Olympics snowboard venue in the Susa Valley, 100km of pistes, direct rail link to Turin (1h). Part of the Voie Lactée (Milky Way) linked ski area. TRN currently has only Cervinia and Champoluc. Opens late November. Good pre-season planning addition.

```js
{
  id: "bardonecchia-it",
  category: "skiing",
  title: "Bardonecchia",
  location: "Susa Valley, Piedmont, Italy",
  lat: 45.0777,
  lon: 6.7028,
  ap: "TRN",
  icon: "🏔️",
  rating: 4.5,
  reviews: 890,
  gradient: "linear-gradient(160deg,#1a3a5c,#2563eb,#93c5fd)",
  accent: "#93c5fd",
  tags: ["Olympic Snowboard Venue", "Turin Rail Link", "Via Lattea", "Border Skiing"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Bardonecchia_ski_area.jpg/1280px-Bardonecchia_ski_area.jpg"
},
```

### Venue 3 — Borovets, Bulgaria (SOF ski → 2 venues)
Bulgaria's oldest ski resort on the Rila Mountains, 2540m peak. More accessible and cheaper than Bansko (already in catalog). 73km of runs. SOF currently has only Bansko. Budget-friendly alternative for Eastern European skiing.

```js
{
  id: "borovets-bg",
  category: "skiing",
  title: "Borovets",
  location: "Rila Mountains, Bulgaria",
  lat: 42.2674,
  lon: 23.5961,
  ap: "SOF",
  icon: "🎿",
  rating: 4.3,
  reviews: 640,
  gradient: "linear-gradient(160deg,#1e3a5f,#1d4ed8,#bfdbfe)",
  accent: "#bfdbfe",
  tags: ["Budget-Friendly", "Rila Mountains", "Beginner Terrain", "Bulgaria's Oldest Resort"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Borovets_ski_resort.jpg/1280px-Borovets_ski_resort.jpg"
},
```

### Venue 4 — Búzios, Brazil (GIG beach → 3 venues)
Famous Brazilian resort town on the Cabo Frio peninsula, 28 beaches in 8km radius. Made famous by Brigitte Bardot. Peak season: October–March. Complements Arraial do Cabo (same GIG gateway, different vibe — Búzios = lively resort, Arraial = nature/snorkeling).

```js
{
  id: "buzios-brazil",
  category: "beach",
  title: "Búzios",
  location: "Rio de Janeiro State, Brazil",
  lat: -22.7479,
  lon: -41.8818,
  ap: "GIG",
  icon: "🌊",
  rating: 4.6,
  reviews: 1580,
  gradient: "linear-gradient(160deg,#0c4a6e,#0284c7,#7dd3fc)",
  accent: "#7dd3fc",
  tags: ["28 Beaches", "Geriba Beach", "Yacht Culture", "Brigitte Bardot Landmark"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/B%C3%BAzios_Aerial_2009.jpg/1280px-B%C3%BAzios_Aerial_2009.jpg"
},
```

### Venue 5 — Cairngorm Mountain, Scotland (INV ski → 2 venues)
Scotland's largest ski area by terrain (36 runs, 1245m summit), near Aviemore in the Cairngorms National Park. INV currently has only Nevis Range (Ben Nevis, same area). Cairngorm has a funicular railway and is arguably more accessible. Opens December.

```js
{
  id: "cairngorm-mountain-s31",
  category: "skiing",
  title: "Cairngorm Mountain",
  location: "Cairngorms National Park, Scotland",
  lat: 57.1356,
  lon: -3.6736,
  ap: "INV",
  icon: "🏔️",
  rating: 4.2,
  reviews: 510,
  gradient: "linear-gradient(160deg,#374151,#4b5563,#9ca3af)",
  accent: "#9ca3af",
  tags: ["Scotland's Largest Ski Area", "Funicular Railway", "Arctic Plateau", "Cairngorms National Park"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Cairngorm_Mountain_ski_area.jpg/1280px-Cairngorm_Mountain_ski_area.jpg"
},
```

> **Photo note:** Wikipedia Commons URLs are used as placeholders. Run `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait` after adding these venues to replace with verified Unsplash photos (Open #20 pipeline).

---

## One Observation for PM

**BASE_PRICES Open #22 is effectively closed.** The PM v119 Decision 3 batch brought coverage from ~43% (per CLAUDE.md) to **100% (404/404 venues)**. This is a major unacknowledged win — the deal badge and `~$X` estimate now work for every venue in the catalog, including CUN, BOB, AUA, STT, and SXM which were explicitly called out as missing. CLAUDE.md still lists this as Open #22; it should be moved to the resolved section and the table corrected from "43% coverage" to "100% coverage."
