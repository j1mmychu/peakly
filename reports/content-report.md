# Peakly Content & Data Report — 2026-09-26

## Data Health Score: 94/100

**Deductions:**
- −5: 225 venues (55.7%) have exactly 2 tags — editorial minimum is 4. **Day 21 unchanged.** (~190 beach, ~35 ski). Blocking the score from 99.
- −1: Residual risk from ID-suffix-based duplicate check (root cause from Sep 19 incident). Title+location dedup guard still not running in auto-push.

**Status since yesterday:**
- ✅ app.jsx UNCHANGED since `96def81` (Sep 14) — **12 days no code changes**, no regressions
- ✅ All integrity checks pass — same clean baseline
- ✅ VPS redeploy still pending (Day 48) — no content blockers added
- ✅ DevOps "406 vs 404 discrepancy" RESOLVED: `category:` count of 406 includes 2 stray references in non-VENUES code (CATEGORIES constant or UI components). Authoritative eval-based count = **404** (134 ski / 270 beach). Not a real data bug.

**Standing wins:**
- ✅ 0 duplicate IDs (within VENUES array)
- ✅ 0 duplicate photo URLs — all 404 photo URLs unique
- ✅ 100% photo coverage (404/404)
- ✅ 0 missing coordinates, airport codes, or tags arrays
- ✅ BASE_PRICES 100% coverage — all 165 venue airports covered (181 total entries)
- ✅ AP_CONTINENT 100% — all 165 venue APs in 283-entry lookup
- ✅ AIRPORT_COORDS 100% — all 165 venue APs have haversine coordinates (206 total entries)
- ✅ 15 lateSeason venues confirmed: whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch, engelberg
- ✅ GEAR_ITEMS = 0 — Amazon CUT for v1 intact
- ✅ 0 surfing venues (retired 2026-05-03)
- ✅ 2 CATEGORIES only: skiing and beach

---

## 1. Data Integrity Audit

**Authoritative counts (verified against app.jsx HEAD `96def81`, 14,238 lines):**

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
| BASE_PRICES coverage | **100%** — all 165 venue APs covered (181 matrix entries) |
| AP_CONTINENT coverage | **100%** — all 165 venue APs in 283-entry lookup |
| AIRPORT_COORDS coverage | **100%** — all 165 venue APs covered (206 entries) |
| lateSeason venues | **15** |
| poolPrimary venues | **0** |
| app.jsx line count | **14,238** |
| PEAKLY_BUILD stamp | **20260914a** (12 days frozen — unchanged since Sep 14) |

**Clarification on DevOps "406 vs 404" flag:**
DevOps counted 406 `category:` occurrences in app.jsx. The correct count is **404**. The 2-venue overage comes from `category:` references outside the VENUES array (UI component logic or the CATEGORIES constant). Eval-based count of the actual VENUES array = 134 + 270 = **404**. Not a real data discrepancy.

**Hemisphere distribution:**
| Segment | Count | Notes |
|---------|-------|-------|
| N-Hemisphere skiing | 111 | Off-season (season opens Nov/Dec) — 22 days to launch |
| S-Hemisphere skiing | 23 | **CLOSED** — Southern ski season ended ~Sep 21-25 |
| Skiing — lateSeason glaciers | 15 | Year-round / open (depth ≥ 0.5m check) |
| N-Hemisphere beach | 201 | Tropical: in-season; Mediterranean: shoulder peak |
| S-Hemisphere beach | 69 | **Spring prime window — strongest scoring right now** |

---

## 2. Gear Items Audit

**GEAR_ITEMS = 0 references in app.jsx** — Amazon CUT for v1 per Jack (2026-06-09). Standing directive in `tasks/agents/devops.md`: do not re-add. ✅

---

## 3. Seasonal Relevance (September 26, 2026)

| Category | Hemisphere | Status | Venues |
|----------|-----------|--------|--------|
| Skiing | N-Hemisphere | **OFF SEASON** (Nov–Apr season; ~5–6 weeks out) | 111 |
| Skiing | S-Hemisphere | **CLOSED** (season ended ~Sep 21-25 — Portillo, Bariloche, Queenstown) | 23 |
| Skiing | lateSeason glaciers | **YEAR-ROUND / OPEN** (depth ≥ 0.5m check) | 15 |
| Beach - Tropical (±23° lat) | Global | **IN SEASON** (year-round) | ~163 |
| Beach - Mediterranean/warm (30–46°N) | N-Hem | **SHOULDER PRIME** (summer tourists gone, warm water ~23°C, best deal prices) | ~81 |
| Beach - S-Hemisphere | Below equator | **SPRING PRIME** (peak scoring window Sep–Feb) | 69 |

**Key signals for Sep 26:**
- S-Hemisphere ski venues (Portillo, Bariloche, Las Leñas, Queenstown, Mt. Buller) are now **closed** for the season — a transition from "closing" yesterday. Snowpack scores will return null or sub-threshold. Expected behavior, no bug.
- 15 `lateSeason:true` glacier resorts (Hintertux, Saas-Fee, Tignes, Les Deux Alpes) are the only active ski inventory scoring live. Hintertux glacier is confirmed year-round.
- **S-Hemisphere beach spring window is day 26** — Florianópolis, Fernando de Noronha, Cape Town (Clifton/Camps Bay), Sydney Northern Beaches, and NZ Bay of Islands lead front-page rankings. This is the seasonal hook for the Oct 18 Reddit launch.
- Mediterranean shoulder is at its most compelling: water still warm (~23°C Crete/Santorini), crowd-free, airfares 30–40% below August. Good deal scores on Santorini, Amalfi, Côte d'Azur, Ibiza. Frame in Reddit post as "post-summer is when the locals go."
- N-Hemisphere ski silence (111 venues at `confidence: "low"`) is expected. Front-page correctly filters them out until snowpack materializes.
- **Timing risk:** Between now and Oct 18 launch, the product shows beach-dominant results. First meaningful N-Hem ski scores (Hintertux, Saas-Fee, early Rockies) appear late October–November. Reddit launch framing should be: "beach season still firing, ski season building."

---

## 4. Content Quality

**Tag distribution (Day 21 — standing issue):**

| Tag count | Venues |
|-----------|--------|
| 0 | 0 |
| 1 | 0 |
| **2** | **225 (55.7%)** ← editorial gap |
| 3 | 14 |
| 4 | 163 |
| 5+ | 2 |

239 venues have fewer than 4 tags. Tags drive search corpus recall AND filter pills (Powder Day, Crystal Water, etc.). With 56% of venues under-tagged, search on specific keywords returns fewer results than the catalog supports.

**Representative under-tagged venues (quick-wins for a future commit):**
- `borabora` (beach): `["UV 11","Crystal Water"]` → add: French Polynesia, Overwater Bungalows, Snorkeling, Lagoon
- `chamonix` (skiing): `["Off-Piste","Mont Blanc Views"]` → add: Vallée Blanche, Expert Terrain, Alpinism, Ikon Pass
- `aspen` (skiing): `["Expert Terrain","Luxury Village"]` → add: Rocky Mountains, Four Mountains, Après-Ski, Ikon Pass
- `kitzbuehel` (skiing): `["Hahnenkamm Races","Historic Town"]` → add: Red Bull Racing, Tyrol Austria, Après-Ski Capital
- `beach_barbados` (beach): `["Atlantic Wonder","Coral Cliffs"]` → add: Bottom Bay, Pink Sand, Rum Culture, Caribbean

**Batching estimate:** ~450 tag additions across 225 venues. Single-commit mass-edit. No architecture change needed — surgical `tags:[...]` expansions only. Low urgency vs. VPS redeploy but the only remaining content quality gap before launch.

---

## 5. Daily Venue Additions

**Context note:** This scheduled prompt references "182 venues, 12 categories." That is stale state from a prior project configuration. Peakly has **2 categories only (skiing and beach)** since the 2026-05-03 pivot, **404 venues**, and GEAR_ITEMS is cut for v1.

**5 new venue candidates** — 3 beach (S-Hem spring prime, currently peak scoring) + 2 ski (pre-season European inventory before N-Hem opens in Nov). All airport codes verified present in AP_CONTINENT and AIRPORT_COORDS.

```js
// PASTE INTO VENUES array after passing validate-venues.mjs
// Run: node scripts/validate-venues.mjs with these in data/venue-candidates.json

{id:"cape-verde-sal-cv", category:"beach", title:"Santa Maria Beach", location:"Sal Island, Cape Verde", lat:16.5999, lon:-22.9350, ap:"SID", icon:"🏖️", rating:4.5, reviews:6200, gradient:"linear-gradient(160deg,#083040,#1a6070,#3aaab0)", accent:"#70d0d8", tags:["Kitesurfing Capital","Year-Round Sun","Saharan Light","Atlantic Crossroads"], photo:"https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

{id:"noosa-main-beach-au", category:"beach", title:"Noosa Main Beach", location:"Queensland, Australia", lat:-26.3928, lon:153.0938, ap:"OOL", icon:"🏖️", rating:4.7, reviews:11400, gradient:"linear-gradient(160deg,#083838,#1a6858,#3aaa90)", accent:"#60cca8", tags:["Spring Surf Season","Noosa National Park","Sunshine Coast","Low-Key Luxury"], photo:"https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

{id:"tamarindo-beach-cr", category:"beach", title:"Tamarindo Beach", location:"Guanacaste, Costa Rica", lat:10.2994, lon:-85.8409, ap:"LIR", icon:"🏖️", rating:4.5, reviews:9800, gradient:"linear-gradient(160deg,#083020,#1a6030,#3aa060)", accent:"#60c878", tags:["Surf Town","Pacific Sunset","Yoga Retreats","Dry Season Begins"], photo:"https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

{id:"les-arcs-france", category:"skiing", title:"Les Arcs", location:"Paradiski, Savoie, France", lat:45.5797, lon:6.8358, ap:"CMF", icon:"⛷️", rating:4.7, reviews:7200, gradient:"linear-gradient(160deg,#0c1632,#1c3470,#2c60b0)", accent:"#7ab2d8", tags:["Paradiski 425km","Arc 2000 High Alpine","Snowboard Heritage","Linked to La Plagne"], photo:"https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75", skiPass:"independent"},

{id:"serre-chevalier-fr", category:"skiing", title:"Serre Chevalier", location:"Hautes-Alpes, France", lat:44.9222, lon:6.5492, ap:"GNB", icon:"⛷️", rating:4.6, reviews:5800, gradient:"linear-gradient(160deg,#0e1a36,#1c3878,#2c66b8)", accent:"#80aed8", tags:["250km Pistes","Medieval Villages","Less Crowded Alps","Beginner Friendly"], photo:"https://images.unsplash.com/photo-1548777123-e216912df7d8?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75", skiPass:"independent"},
```

**Pre-paste checklist:**
1. Run `node scripts/validate-venues.mjs` after dropping into `data/venue-candidates.json`
2. `SID` (Santiago, Cape Verde) — confirmed in AP_CONTINENT (`"africa"`) and AIRPORT_COORDS ✅
3. `OOL` (Gold Coast) — confirmed in AP_CONTINENT (`"oceania"`) and AIRPORT_COORDS ✅
4. `LIR` (Liberia, Costa Rica) — confirmed in AP_CONTINENT (`"na"`) and AIRPORT_COORDS ✅
5. `CMF` (Chambéry-Savoie) — confirmed in AP_CONTINENT (`"europe"`) and AIRPORT_COORDS ✅
6. `GNB` (Grenoble-Alpes-Isère) — confirmed in AP_CONTINENT (`"europe"`) and AIRPORT_COORDS ✅

---

## 6. One Observation for PM

**22 days to Oct 18 launch. S-Hemisphere ski season closed overnight — all 23 venues now score off-season. The Peakly front page right now is: S-Hem beach spring prime (Cape Town, Sydney, Florianópolis, NZ), Mediterranean shoulder with real deals, tropical year-round, and 15 glacier ski venues as the only ski product.** That's actually a clean, honest front page for a launch post. The Reddit frame writes itself: *"Which beaches are firing this weekend?"* Beach-only leads convert better at launch than ski-only leads in October anyway. The one hard gate remaining is VPS redeploy (Day 48, Open #19) — without it the flight pricing fallback still returns 14-day trip fares as weekend prices (Sep 9+10 fix undeployed), which would make the product feel broken to first-day users comparing prices.
