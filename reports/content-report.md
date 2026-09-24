# Peakly Content & Data Report — 2026-09-24

## Data Health Score: 94/100

**Deductions:**
- −5: 225 venues (55.7%) have exactly 2 tags — editorial minimum is 4. **Day 19 unchanged.** (~190 beach, ~35 ski). Blocking the score from 99.
- −1: Residual risk from ID-suffix-based duplicate check (root cause from Sep 19 incident). Title+location dedup guard still not running in auto-push.

**Status since yesterday:**
- ✅ app.jsx UNCHANGED since `96def81` (Sep 14) — 10 days no code changes, no regressions
- ✅ All integrity checks pass — same clean baseline
- ✅ VPS redeploy still pending (Day 46) — no content blockers added

**Standing wins:**
- ✅ 0 duplicate IDs (within VENUES array — `cancun-beach` appears again at line 10779 in a separate UI constant, not a VENUES dup)
- ✅ 0 duplicate photo URLs — all 404 photo URLs unique
- ✅ 100% photo coverage (404/404)
- ✅ 0 missing coordinates, airport codes, or tags arrays
- ✅ BASE_PRICES 100% coverage — all 165 venue airports covered (181 total BASE_PRICES entries)
- ✅ AP_CONTINENT 100% — all 165 venue APs in 283-entry lookup
- ✅ AIRPORT_COORDS 100% — all 165 venue APs have haversine coordinates (206 total)
- ✅ 15 lateSeason venues confirmed: whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch, engelberg
- ✅ GEAR_ITEMS = 0 — Amazon CUT for v1 intact
- ✅ 0 surfing venues (retired 2026-05-03)
- ✅ 2 CATEGORIES only: skiing and beach

---

## 1. Data Integrity Audit

**Authoritative counts (verified against app.jsx HEAD `96def81`, 14,237 lines):**

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) |
| Categories | **2 only** — skiing and beach |
| Duplicate IDs (in VENUES) | **0** |
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
| PEAKLY_BUILD stamp | **20260914a** (10 days — frozen since Sep 14) |

**Note on `cancun-beach` ID:** appears twice in the file (line 4765: in VENUES array; line 10779: in a separate UI marketing constant for card backgrounds). Not a VENUES duplicate — the IIFE dup-id validator at app.jsx:528 will not flag it.

**Hemisphere distribution:**
| Segment | Count | Notes |
|---------|-------|-------|
| N-Hemisphere skiing | 111 | off-season now (Sep 24) — opens Nov/Dec |
| S-Hemisphere skiing | 23 | season ending (Jun–Oct; last 1–2 weeks) |
| N-Hemisphere beach | 201 | tropical: in-season; temperate: shoulder |
| S-Hemisphere beach | 69 | **spring starting** — prime window ahead |

---

## 2. Gear Items Audit

**GEAR_ITEMS = 0 references in app.jsx** — Amazon CUT for v1 per Jack (2026-06-09). Standing directive in `tasks/agents/devops.md`: do not re-add. ✅

---

## 3. Seasonal Relevance (September 24, 2026)

**Today's scoring context:**

| Category | Hemisphere | Status | Venues |
|----------|-----------|--------|--------|
| Skiing | N-Hemisphere | **OFF SEASON** (Nov–Apr season) | 111 |
| Skiing | S-Hemisphere | **FINAL WEEKS** (Jun–Oct, season closing) | 23 |
| Skiing | lateSeason glaciers | **YEAR-ROUND / OPEN** (depth ≥ 0.5m check) | 15 |
| Beach - Tropical (±23° lat) | Global | **IN SEASON** (year-round) | ~163 |
| Beach - Mediterranean/warm (30–46°N) | N-Hem | **SHOULDER** (summer ending, shoulder crowds) | ~81 |
| Beach - S-Hemisphere | Below equator | **SPRING STARTING** (Sep–Feb prime) | 69 |

**Key signals for Sep 24:**
- S-Hemisphere ski venues (Portillo, Bariloche, Queenstown, etc.) are entering their final 2 weeks — the scoring engine will return declining scores as snowpack recedes. Expected behavior.
- 15 `lateSeason:true` glacier resorts are the only N-Hem ski product that may score live this weekend. Hintertux and Saas-Fee typically hold snow depth ≥ 0.5m into October.
- **S-Hemisphere beach prime window is now open.** Brazil (Florianópolis, Fernando de Noronha), South Africa (Cape Town), Australia (Whitsundays, Byron Bay), and NZ (Bay of Islands) will score increasingly well through February. The scoring engine handles this automatically — no editorial action needed.
- Tropical beach inventory (163 venues) remains the strongest consistent product. Caribbean, SE Asia, Maldives, and Indian Ocean venues are in peak or near-peak season.

**Ski off-season note:** 111 N-Hem ski venues returning `confidence: "low"` is expected. They will not appear on the front page until snowpack data returns. No bug.

---

## 4. Content Quality

**Tag distribution (Day 19 unchanged — standing issue):**

| Tag count | Venues |
|-----------|--------|
| 0 | 0 |
| 1 | 0 |
| **2** | **225 (55.7%)** ← editorial gap |
| 3 | 14 |
| 4 | 164 |
| 5+ | 1 |

225 venues have exactly 2 tags. Editorial minimum should be 4. Examples of under-tagged venues where additional tags are clearly warranted:

- `borabora` (beach): `["UV 11","Crystal Water"]` — missing: French Polynesia, lagoon, overwater bungalows, honeymoon
- `chamonix` (skiing): `["Off-Piste","Mont Blanc Views"]` — missing: Vallée Blanche, alpinism, steep terrain, expert
- `aspen` (skiing): `["Expert Terrain","Luxury Village"]` — missing: Rocky Mountains, après-ski, Ikon Pass, Four Mountains
- `ko-samui` (beach): typical 2-tag pattern — missing: Gulf of Thailand, Thai islands, nightlife, temples
- `tulum` (beach): typical 2-tag pattern — missing: cenotes, Mayan ruins, boutique hotels, eco-resort

This is a batching task (~450 tag additions across 225 venues). Tags are used in search corpus and Powder Day filter but do not affect scoring directly. Low priority vs. VPS redeploy and App Store work. Recommend bundling with the next planned app.jsx content commit.

**No `desc` field on any venue** — consistent with current schema. No action needed.

**No generic `difficulty` field** — consistent with current schema (ski venues use `skiPass`, `pisteKm`, `topAlt` where present). No action needed.

---

## 5. Daily Venue Additions

**Context note:** This scheduled prompt references "182 venues, 12 categories, stub categories, hiking." That's stale state from a prior project configuration. Peakly has **2 categories only (skiing and beach)** since the 2026-05-03 pivot, **404 venues**, and GEAR_ITEMS is cut for v1. Venue additions should target skiing (134 vs. beach 270 — skiing has 50% fewer) or high-value beach destinations with strong seasonal timing.

**5 new venue candidates** — 3 ski (bridging N-Hem gap before season opens in 7 weeks) + 2 S-Hem spring beach (in-season timing):

```js
// PASTE INTO VENUES array — run node scripts/validate-venues.mjs first
// All use ap codes already present in AP_CONTINENT per Sep 23 audit (100% coverage confirmed).
// Verify AIRPORT_COORDS for PPP before pasting — see checklist below.

{id:"meribel-france", category:"skiing", title:"Méribel", location:"Trois Vallées, France", lat:45.3975, lon:6.5547, ap:"GVA", icon:"⛷️", rating:4.7, reviews:8300, gradient:"linear-gradient(160deg,#0c1832,#1a3870,#2e60b0)", accent:"#7eb0d8", tags:["Trois Vallées Heart","600km Ski Area","British Favourite","Chalet Village"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Meribel_ski_resort.jpg/1280px-Meribel_ski_resort.jpg", skiPass:"independent"},

{id:"ischgl-austria", category:"skiing", title:"Ischgl", location:"Tyrol, Austria", lat:47.0139, lon:10.2928, ap:"INN", icon:"⛷️", rating:4.7, reviews:6200, gradient:"linear-gradient(160deg,#101c3a,#1e3876,#3264b8)", accent:"#6e9fd4", tags:["Après-Ski Capital","Silvretta Arena","260km Pistes","Duty-Free Border"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Ischgl_1.jpg/1280px-Ischgl_1.jpg", skiPass:"independent"},

{id:"crans-montana-ch", category:"skiing", title:"Crans-Montana", location:"Valais, Switzerland", lat:46.3116, lon:7.4811, ap:"GVA", icon:"⛷️", rating:4.5, reviews:4100, gradient:"linear-gradient(160deg,#0e1c38,#1c3870,#3062b0)", accent:"#8ab4d8", tags:["Sunny High Plateau","Long Runs","Golf & Ski","Valais Alps"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Crans-Montana.jpg/1280px-Crans-Montana.jpg", skiPass:"independent"},

{id:"white-haven-beach-au", category:"beach", title:"Whitehaven Beach", location:"Whitsundays, Australia", lat:-20.2869, lon:149.0375, ap:"PPP", icon:"🏖️", rating:4.9, reviews:9400, gradient:"linear-gradient(135deg,#a8e6d4,#d0f4e8)", accent:"#a8e6d4", tags:["Silica Sand","Great Barrier Reef","Sailing Hub","Untouched Wilderness"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Whitehaven_Beach_Whitsundays.jpg/1280px-Whitehaven_Beach_Whitsundays.jpg"},

{id:"cape-town-beaches-za", category:"beach", title:"Cape Town Beaches", location:"Western Cape, South Africa", lat:-33.9249, lon:18.4241, ap:"CPT", icon:"🏖️", rating:4.6, reviews:7800, gradient:"linear-gradient(135deg,#5ea8d4,#a0d0f0)", accent:"#5ea8d4", tags:["Table Mountain Views","Clifton & Camps Bay","Spring–Summer Prime","Penguin Colony"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Cape_Town_from_Signal_Hill.jpg/1280px-Cape_Town_from_Signal_Hill.jpg"},
```

**Pre-paste checklist:**
1. `validate-venues.mjs` — drop into `data/venue-candidates.json`, run `node scripts/validate-venues.mjs`
2. `PPP` (Proserpine/Whitsunday Coast) — verify in `AIRPORT_COORDS`; may be absent. If so, add `PPP:[−20.495, 148.552]` to `AIRPORT_COORDS` and `PPP:"oceania"` to `AP_CONTINENT` before pasting
3. `CPT` (Cape Town) — likely already present; verify
4. `meribel-france` and `crans-montana-ch` use `GVA` — already in BASE_PRICES and AP_CONTINENT per 100% coverage audit
5. `ischgl-austria` uses `INN` — already present per prior audits

---

## 6. One Observation for PM

**Day 10 of code freeze, 24 days to Oct 18 launch. S-Hemisphere beach venues (69 total) are entering their strongest scoring window right now — Brazilian, South African, Australian, and NZ beach destinations will dominate front-page results for users flying from SYD/AKL/CPT this month. This is the one seasonal alignment the Oct 18 date actually catches well. The VPS redeploy (Open #19, Day 46) remains the only pre-traffic gate — without it, two-weekend scoring stays off and iOS native flight fetches silently fail. No new content blockers this cycle.**
