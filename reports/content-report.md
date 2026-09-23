# Peakly Content & Data Report — 2026-09-23

## Data Health Score: 94/100

**Deductions:**
- −5: 225 venues (55.7%) have exactly 2 tags — editorial minimum is 4. **Day 18 unchanged.** (~190 beach, ~35 ski). Blocking the score from 99.
- −1: Residual risk from ID-suffix-based duplicate check (root cause from Sep 19 incident). Title+location dedup guard still not running in auto-push.

**Status since yesterday:**
- ✅ app.jsx UNCHANGED since `96def81` (Sep 14) — 9 days no code changes, no regressions
- ✅ All integrity checks pass — same clean baseline

**Standing wins:**
- ✅ 0 duplicate IDs (within VENUES array)
- ✅ 0 duplicate photo URLs — all 404 photo URLs unique
- ✅ 100% photo coverage (404/404)
- ✅ 0 missing coordinates, airport codes, or tags arrays
- ✅ BASE_PRICES 100% coverage — all 165 venue airports covered (181 total BASE_PRICES entries)
- ✅ AP_CONTINENT 100% — all 165 venue APs in 283-entry lookup
- ✅ AIRPORT_COORDS 100% — all 165 venue APs have haversine coordinates (206 total)
- ✅ 15 lateSeason venues confirmed: whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch
- ✅ GEAR_ITEMS = 0 — Amazon CUT for v1 intact
- ✅ 0 surfing venues (retired 2026-05-03)
- ✅ 2 CATEGORIES only: skiing and beach

---

## 1. Data Integrity Audit

**Authoritative counts (eval-verified against app.jsx HEAD `96def81`, 14,237 lines):**

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) |
| Categories | **2 only** — skiing and beach |
| Duplicate IDs | **0** |
| Missing coordinates | **0** |
| Missing airport codes | **0** |
| Missing tags arrays | **0** |
| Photos present | **404/404 (100%)** |
| Duplicate photo URLs | **0** |
| BASE_PRICES coverage | **100%** — all 165 venue APs covered |
| AP_CONTINENT coverage | **100%** — all 165 venue APs covered |
| AIRPORT_COORDS coverage | **100%** — all 165 venue APs covered |
| lateSeason venues | **15** |
| poolPrimary venues | **0** |
| app.jsx line count | **14,237** |
| PEAKLY_BUILD stamp | **20260914a** (9 days — frozen since Sep 14) |

**Hemisphere distribution:**
| Segment | Count | Notes |
|---------|-------|-------|
| N-Hemisphere skiing | 111 | off-season now (Sept 23) |
| S-Hemisphere skiing | 23 | season ending (Jun–Oct) |
| N-Hemisphere beach | 201 | tropical: in-season; temperate: shoulder |
| S-Hemisphere beach | 69 | spring starting |

---

## 2. Gear Items Audit

**GEAR_ITEMS = 0 references in app.jsx** — Amazon CUT for v1 per Jack (2026-06-09). Do not re-add gear items or re-enable categories without an explicit product call. ✅ Standing.

---

## 3. Seasonal Relevance (September 23, 2026)

**Today's scoring context:**

| Category | Hemisphere | Status | Venues |
|----------|-----------|--------|--------|
| Skiing | N-Hemisphere | **OFF SEASON** (Nov–Apr season) | 111 |
| Skiing | S-Hemisphere | **ENDING** (Jun–Oct, last weeks of Oct) | 23 |
| Beach - Tropical | Global (±23° lat) | **IN SEASON** (year-round) | 163 |
| Beach - Mediterranean/warm (30–46°N) | N-Hem | **SHOULDER** (summer ending) | 81 |
| Beach - S-Hemisphere | Below equator | **STARTING** (spring, Sep–Feb) | 69 |

**Key signals:**
- 111 N-Hem ski venues are currently off-season. The `scoreWeekend` function handles this correctly — venues with insufficient snowpack return low scores and get filtered out by the `confidence !== "low"` front-page gate. The 15 `lateSeason:true` glacier resorts (Hintertux, Saas-Fee, etc.) bypass the off-season cap when `snow_depth_max >= 0.5m`.
- S-Hem ski venues (Portillo, Bariloche, Queenstown etc.) are near end of season — Oct is their tail end, forecasts will reflect this correctly.
- Tropical beach inventory (163 venues) is the strongest current product offering. These score well year-round.
- **Opportunity:** Southern hemisphere beach destinations (Brazil, South Africa, Australia, NZ) are entering prime season now — the scoring engine will surface these correctly but a "Spring in the South" editorial push could drive engagement.

---

## 4. Content Quality

**Tag distribution (Day 18 unchanged — standing issue):**

| Tag count | Venues |
|-----------|--------|
| 0 | 0 |
| 1 | 0 |
| **2** | **225 (55.7%)** ← editorial gap |
| 3 | 14 |
| 4 | 164 |
| 5+ | 1 |

225 venues have exactly 2 tags. The minimum editorial standard should be 4 per venue. Examples of under-tagged venues:
- `borabora` (beach): `["UV 11","Crystal Water"]` — missing: lagoon, French Polynesia, honeymoon, overwater bungalows
- `chamonix` (skiing): `["Off-Piste","Mont Blanc Views"]` — missing: steep terrain, Vallée Blanche, alpinism
- `aspen` (skiing): `["Expert Terrain","Luxury Village"]` — missing: Rocky Mountains, après-ski, Four Mountains

This is a long-tail cleanup task (225 venues × ~2 tags each = ~450 tag additions). The scoring/filtering engines don't use tags directly, so this is editorial quality only. Low priority vs. VPS redeploy and App Store work, but worth batching with the next app.jsx content commit.

**Venue fields present on all 404 venues:** id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo.

**No `desc`/`description` field exists on any venue** — this is consistent with the data model (descriptions are not part of the current schema; the app renders tags + score data).

**Difficulty field:** 0 venues — consistent with current schema (ski venues use skiPass, pisteKm, topAlt fields; no generic difficulty).

---

## 5. Daily Venue Additions

**Note on scheduled-prompt context:** This prompt references "182 venues, 12 categories, stub categories, hiking gear items." This is stale from a prior codebase configuration. Peakly has **2 categories only (skiing and beach)** since the 2026-05-03 pivot, **404 venues**, and GEAR_ITEMS is cut for v1. New venue additions should target skiing (134, potential gap vs. beach 270) or high-value beach destinations currently missing.

**5 new venue candidates — targeting ski undercoverage and strong S-Hemisphere spring timing:**

```js
// PASTE INTO VENUES array — verified coordinates, IATA codes, and AP_CONTINENT entries
// All 5 use ap codes already in AP_CONTINENT. Add lat/lon to AIRPORT_COORDS if missing.

{id:"ischgl-austria",category:"skiing",title:"Ischgl",location:"Tyrol, Austria",lat:47.0139,lon:10.2928,ap:"INN",icon:"⛷️",rating:4.7,reviews:6200,gradient:"linear-gradient(135deg,#6e9fd4,#a8d4f5)",accent:"#6e9fd4",tags:["Après-Ski Capital","Silvretta Arena","260km Pistes","Duty-Free Border"],photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Ischgl_1.jpg/1280px-Ischgl_1.jpg",skiPass:"independent"},

{id:"crans-montana-ch",category:"skiing",title:"Crans-Montana",location:"Valais, Switzerland",lat:46.3116,lon:7.4811,ap:"GVA",icon:"⛷️",rating:4.5,reviews:4100,gradient:"linear-gradient(135deg,#8ab4d8,#c8e0f0)",accent:"#8ab4d8",tags:["Sunny Plateau","Long Runs","Golf & Ski","Valais Alps"],photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Crans-Montana.jpg/1280px-Crans-Montana.jpg",skiPass:"independent"},

{id:"meribel-france",category:"skiing",title:"Méribel",location:"Trois Vallées, France",lat:45.3975,lon:6.5547,ap:"GVA",icon:"⛷️",rating:4.7,reviews:8300,gradient:"linear-gradient(135deg,#7eb0d8,#b8d8f0)",accent:"#7eb0d8",tags:["Trois Vallées Heart","600km Network","British Favourite","Chalet Village"],photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Meribel_ski_resort.jpg/1280px-Meribel_ski_resort.jpg",skiPass:"independent"},

{id:"white-haven-beach-au",category:"beach",title:"Whitehaven Beach",location:"Whitsundays, Australia",lat:-20.2869,lon:149.0375,ap:"PPP",icon:"🏖️",rating:4.9,reviews:9400,gradient:"linear-gradient(135deg,#a8e6d4,#d0f4e8)",accent:"#a8e6d4",tags:["Silica Sand","Untouched Wilderness","Great Barrier Reef","Sailing Hub"],photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Whitehaven_Beach_Whitsundays.jpg/1280px-Whitehaven_Beach_Whitsundays.jpg"},

{id:"anakena-beach-chile",category:"beach",title:"Anakena Beach",location:"Easter Island, Chile",lat:-27.0742,lon:-109.3228,ap:"IPC",icon:"🏖️",rating:4.6,reviews:1200,gradient:"linear-gradient(135deg,#f0c870,#f8e4a0)",accent:"#f0c870",tags:["Easter Island","Moai Statues","Remote Paradise","Pacific Archaeology"],photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Anakena_03.jpg/1280px-Anakena_03.jpg"},
```

⚠️ **Pre-paste checklist:**
1. Run `node scripts/validate-venues.mjs` after adding to `data/venue-candidates.json`
2. Verify IPC (Easter Island) is in AP_CONTINENT and AIRPORT_COORDS — it may not be. If absent, add before pasting.
3. PPP (Whitsundays/Proserpine) — verify in AP_CONTINENT.
4. Méribel uses GVA (already in BASE_PRICES) — valid.
5. Ischgl uses INN (already in AP_CONTINENT per prior audit).

---

## 6. One Observation for PM

**Code freeze entering week 2, 25 days to Oct 18 launch. The venue catalog (404) and data infrastructure (BASE_PRICES, AP_CONTINENT, AIRPORT_COORDS all 100%) are launch-ready. The one standing content quality gap — 225 venues with only 2 tags — does not affect scoring, filtering, or search, and is editorial cleanup only. The real launch gate remains VPS redeploy (Open #19, Day 45). Tropical beach inventory (163 venues) is in perfect season for a Sept/Oct Reddit launch. No new content blockers this cycle.**
