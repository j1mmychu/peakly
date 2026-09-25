# Peakly Content & Data Report — 2026-09-25

## Data Health Score: 94/100

**Deductions:**
- −5: 225 venues (55.7%) have exactly 2 tags — editorial minimum is 4. **Day 20 unchanged.** (~190 beach, ~35 ski). Blocking the score from 99.
- −1: Residual risk from ID-suffix-based duplicate check (root cause from Sep 19 incident). Title+location dedup guard still not running in auto-push.

**Status since yesterday:**
- ✅ app.jsx UNCHANGED since `96def81` (Sep 14) — 11 days no code changes, no regressions
- ✅ All integrity checks pass — same clean baseline
- ✅ VPS redeploy still pending (Day 47) — no content blockers added

**Standing wins:**
- ✅ 0 duplicate IDs (within VENUES array — `cancun-beach` appears again at line 10779 in a separate UI constant, not a VENUES dup)
- ✅ 0 duplicate photo URLs — all 404 photo URLs unique
- ✅ 100% photo coverage (404/404)
- ✅ 0 missing coordinates, airport codes, or tags arrays
- ✅ BASE_PRICES 100% coverage — all 165 venue airports covered
- ✅ AP_CONTINENT 100% — all 165 venue APs in 283-entry lookup
- ✅ AIRPORT_COORDS 100% — all 165 venue APs have haversine coordinates
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
| PEAKLY_BUILD stamp | **20260914a** (11 days frozen — unchanged since Sep 14) |

**Note on `cancun-beach` ID:** appears twice in the file (line 4765: in VENUES array; line 10779: in a separate UI marketing constant for card backgrounds). Not a VENUES duplicate — the IIFE dup-id validator at app.jsx:528 does not flag it.

**Hemisphere distribution:**
| Segment | Count | Notes |
|---------|-------|-------|
| N-Hemisphere skiing | 111 | off-season (season opens Nov/Dec) — 22 days to launch |
| S-Hemisphere skiing | 23 | season closing this week (final ~7 days of Southern ski window) |
| N-Hemisphere beach | 201 | tropical: in-season; Mediterranean: shoulder end |
| S-Hemisphere beach | 69 | **spring prime window — strongest scoring right now** |

---

## 2. Gear Items Audit

**GEAR_ITEMS = 0 references in app.jsx** — Amazon CUT for v1 per Jack (2026-06-09). Standing directive in `tasks/agents/devops.md`: do not re-add. ✅

---

## 3. Seasonal Relevance (September 25, 2026)

**Today's scoring context:**

| Category | Hemisphere | Status | Venues |
|----------|-----------|--------|--------|
| Skiing | N-Hemisphere | **OFF SEASON** (Nov–Apr season; ~6 weeks out) | 111 |
| Skiing | S-Hemisphere | **CLOSING** (final week — Jun–Oct season ending) | 23 |
| Skiing | lateSeason glaciers | **YEAR-ROUND / OPEN** (depth ≥ 0.5m check) | 15 |
| Beach - Tropical (±23° lat) | Global | **IN SEASON** (year-round) | ~163 |
| Beach - Mediterranean/warm (30–46°N) | N-Hem | **LATE SHOULDER** (summer tourists gone, conditions fine) | ~81 |
| Beach - S-Hemisphere | Below equator | **SPRING PRIME** (peak scoring window Sep–Feb) | 69 |

**Key signals for Sep 25:**
- S-Hemisphere ski venues (Portillo, Bariloche, Queenstown, etc.) are in their **final days** of the 2026 ski season. Snowpack scores will bottom out this weekend — expected behavior, no bug.
- 15 `lateSeason:true` glacier resorts (Hintertux, Saas-Fee, Tignes, Les Deux Alpes) are the only European ski product scoring live. Hintertux glacier is typically open year-round.
- **S-Hemisphere beach entering peak scoring window** (day 25 of spring). Florianópolis, Fernando de Noronha, Cape Town (Clifton/Camps Bay), Sydney beaches, and NZ Bay of Islands will dominate front-page results for users flying from SYD/AKL/GRU/CPT. This is the one seasonal alignment the Oct 18 launch date catches well.
- Mediterranean beach shoulder (Santorini, Amalfi, Côte d'Azur) produces moderate scores — water still warm (~23°C), crowds gone. Genuine deals surface here in October.
- N-Hemisphere ski silence: 111 venues returning `confidence: "low"` is expected. Front-page correctly filters them out.

**Timing note:** with 22 days to the Oct 18 Reddit launch, the app will be showing its ski-off/beach-spring shoulder product. First big N-Hem ski scores won't appear until late November. Frame the Reddit post accordingly — "beach still firing, ski season starting" rather than "ski conditions right now."

---

## 4. Content Quality

**Tag distribution (Day 20 unchanged — standing issue):**

| Tag count | Venues |
|-----------|--------|
| 0 | 0 |
| 1 | 0 |
| **2** | **225 (55.7%)** ← editorial gap |
| 3 | 14 |
| 4 | 164 |
| 5+ | 1 |

225 venues have exactly 2 tags. The tags array drives both the search corpus and the Powder Day / condition filters. Thin tags degrade search recall and make the filter pills useless for half the catalog.

**Examples of under-tagged venues:**
- `borabora` (beach): `["UV 11","Crystal Water"]` → needs: French Polynesia, Lagoon, Overwater Bungalows, Snorkeling
- `chamonix` (skiing): `["Off-Piste","Mont Blanc Views"]` → needs: Vallée Blanche, Expert Terrain, Alpinism, Ikon Pass
- `aspen` (skiing): `["Expert Terrain","Luxury Village"]` → needs: Rocky Mountains, Four Mountains, Après-Ski, Ikon Pass
- `ko-samui` (beach): 2-tag pattern → needs: Gulf of Thailand, Full Moon Party, Thai Islands, Diving
- `tulum` (beach): 2-tag pattern → needs: Cenotes, Mayan Ruins, Boutique Hotels, Eco-Resort

**Batching estimate:** ~450 tag additions across 225 venues. This is a surgical mass-edit to app.jsx that can be done in a single commit. Low urgency vs. VPS redeploy but is the only remaining content quality gap.

---

## 5. Daily Venue Additions

**Context note:** This scheduled prompt references "182 venues, 12 categories, stub categories, hiking." That is stale state from a prior project configuration. Peakly has **2 categories only (skiing and beach)** since the 2026-05-03 pivot, **404 venues**, and GEAR_ITEMS is cut for v1.

**5 new venue candidates** — 3 ski (pre-season inventory before N-Hem opens in Nov) + 2 S-Hem spring beach (peak timing right now). Photo URLs use Unsplash format matching existing venue pattern.

```js
// PASTE INTO VENUES array after passing validate-venues.mjs
// Run: node scripts/validate-venues.mjs with these in data/venue-candidates.json
// Verify PPP (Proserpine/Whitsunday Coast) in AIRPORT_COORDS before pasting

{id:"meribel-france", category:"skiing", title:"Méribel", location:"Trois Vallées, France", lat:45.3975, lon:6.5547, ap:"GVA", icon:"⛷️", rating:4.7, reviews:8300, gradient:"linear-gradient(160deg,#0c1832,#1a3870,#2e60b0)", accent:"#7eb0d8", tags:["Trois Vallées Heart","600km Ski Area","British Favourite","Chalet Village"], photo:"https://images.unsplash.com/photo-1520208422220-d12a3c588e6c?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75", skiPass:"independent"},

{id:"ischgl-austria", category:"skiing", title:"Ischgl", location:"Tyrol, Austria", lat:47.0139, lon:10.2928, ap:"INN", icon:"⛷️", rating:4.7, reviews:6200, gradient:"linear-gradient(160deg,#101c3a,#1e3876,#3264b8)", accent:"#6e9fd4", tags:["Après-Ski Capital","Silvretta Arena","260km Pistes","Duty-Free Border"], photo:"https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75", skiPass:"independent"},

{id:"crans-montana-ch", category:"skiing", title:"Crans-Montana", location:"Valais, Switzerland", lat:46.3116, lon:7.4811, ap:"GVA", icon:"⛷️", rating:4.5, reviews:4100, gradient:"linear-gradient(160deg,#0e1c38,#1c3870,#3062b0)", accent:"#8ab4d8", tags:["Sunny High Plateau","Long Runs","Golf & Ski","Valais Alps"], photo:"https://images.unsplash.com/photo-1517825738774-7de9363ef735?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75", skiPass:"independent"},

{id:"white-haven-beach-au", category:"beach", title:"Whitehaven Beach", location:"Whitsundays, Australia", lat:-20.2869, lon:149.0375, ap:"PPP", icon:"🏖️", rating:4.9, reviews:9400, gradient:"linear-gradient(160deg,#0a3030,#1a6060,#3eaaa0)", accent:"#a8e6d4", tags:["Silica Sand","Great Barrier Reef","Sailing Hub","Untouched Wilderness"], photo:"https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

{id:"cape-town-clifton-za", category:"beach", title:"Clifton & Camps Bay", location:"Cape Town, South Africa", lat:-33.9400, lon:18.3758, ap:"CPT", icon:"🏖️", rating:4.6, reviews:7800, gradient:"linear-gradient(160deg,#0a2040,#1a4080,#3e80c0)", accent:"#5ea8d4", tags:["Table Mountain Views","Spring–Summer Prime","Atlantic Seaboard","Penguin Colony"], photo:"https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},
```

**Pre-paste checklist:**
1. Run `node scripts/validate-venues.mjs` after dropping into `data/venue-candidates.json`
2. `PPP` (Proserpine/Whitsunday Coast) — check `AIRPORT_COORDS` in app.jsx; may be absent. If absent, add `PPP:[-20.495,148.552]` to `AIRPORT_COORDS` and `"PPP":"oceania"` to `AP_CONTINENT`
3. `CPT` (Cape Town) — almost certainly already present; verify
4. `GVA` and `INN` — confirmed present per 100% coverage audit

---

## 6. One Observation for PM

**22 days to Oct 18 launch, code frozen 11 days, 225 venues (56%) still thin on tags — but the only hard gate is VPS redeploy (Open #19, Day 47).** The September 25 product is beach-dominant: S-Hemisphere spring is now fully in prime window (Cape Town, Sydney, Brazil, NZ), tropical inventory is peak, and Mediterranean shoulder is quietly solid. N-Hemisphere ski silence is expected and correct. The Reddit launch post in `reports/reddit-launch-post.md` should lean into "beach is firing right now, ski season around the corner" rather than leading with ski — that framing is actually true for the day it goes live.
