# Peakly Content & Data Report — 2026-09-27

## Data Health Score: 93/100

**Deductions:**
- −5: 225 venues (55.7%) have exactly 2 tags — editorial minimum is 4. **Day 22 unchanged.** (~190 beach, ~35 ski). Blocking the score from 98.
- −1: 1 duplicate title (`beach_gilit` + `gili-trawangan` both titled "Gili Trawangan" — different airports LOP vs DPS, marginally distinct). Technically valid but confusing to users browsing search results.
- −1: Yesterday's report proposed `serre-chevalier-fr` with airport `GNB` (Grenoble-Alpes-Isère) — **GNB is present in AP_CONTINENT (`europe`) but MISSING from AIRPORT_COORDS**, which would cause a haversine crash in `flightHours()`. Pre-paste blocker caught today; not yet in VENUES so no live bug. Use `GVA` (Geneva, 2h45 drive) as the gateway airport for any Serre Chevalier or Briançon-area ski venues.

**Status since yesterday:**
- ✅ app.jsx UNCHANGED since `96def81` (Sep 14) — **13 days no code changes**, no regressions
- ✅ All integrity checks pass — same clean baseline
- ✅ VPS redeploy still pending (Day 49) — no content blockers added
- ✅ BASE_PRICES 100% coverage — all 165 venue airports covered
- ✅ AP_CONTINENT 100% — all 165 venue APs in 283-entry lookup
- ✅ AIRPORT_COORDS 100% — all 165 venue APs have haversine coordinates
- ✅ GEAR_ITEMS = 0 — Amazon CUT for v1 intact

---

## 1. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** ✅ |
| Duplicate titles | **1** ⚠️ (`beach_gilit` / `gili-trawangan`) |
| Missing coordinates | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| Venues with <2 tags | **0** ✅ |
| Venues with >8 tags | **0** ✅ |
| Weird ratings (<3 or >5.0) | **0** ✅ |
| Zero lat/lon (0,0) | **0** ✅ |
| APs missing from AP_CONTINENT | **0** ✅ |
| APs missing from AIRPORT_COORDS | **0** ✅ |
| APs missing from BASE_PRICES | **0** ✅ |
| GEAR_ITEMS in source | **0** (Amazon cut for v1) ✅ |

**Duplicate title detail:**
- `beach_gilit` — "Gili Trawangan", Lombok, Indonesia, lat -8.352 lon 116.05, ap `LOP`
- `gili-trawangan` — "Gili Trawangan", West Lombok, Indonesia, lat -8.35 lon 116.0353, ap `DPS`

Both reference the same island group but use different access airports (Lombok vs Bali). From a user perspective these appear identical in search/cards. Recommendation: differentiate titles — rename `beach_gilit` to "Gili Trawangan (via Lombok)" or delete the lower-rated duplicate. `gili-trawangan` via DPS is the higher-traffic entry point.

**GNB / AIRPORT_COORDS gap (new finding):**
`GNB` (Grenoble-Alpes-Isère) appears in `AP_CONTINENT` as `europe` but has **no entry in `AIRPORT_COORDS`**. Any venue using `ap:"GNB"` would throw in `flightHours()`. No current venue uses GNB — but yesterday's report proposed one. Any future Serre Chevalier / Briançon add should use `GVA` (Geneva) or `CMF` (Chambéry-Savoie) instead.

---

## 2. Gear Items Audit

**GEAR_ITEMS is not present in app.jsx** — Amazon Associates cut for v1 per Jack's decision (2026-06-09). This is correct and intentional. No action required. Revisit post-launch if a revenue gap emerges.

---

## 3. Seasonal Relevance (Sep 27, 2026)

| Segment | Hemisphere | Status | Count |
|---------|-----------|--------|-------|
| Skiing | N-Hemisphere | **OFF SEASON** — opens Nov–Dec | 111 |
| Skiing | S-Hemisphere | **CLOSED** — season ended Sep 21–25 | 23 |
| Skiing | lateSeason glaciers | **ACTIVE** (snow depth ≥ 0.5m check) | 15 |
| Beach - Tropical (±23°N) | Global | **IN SEASON** (year-round) | ~163 |
| Beach - Mediterranean/warm | N-Hemisphere | **SHOULDER PRIME** — warm water, low crowds, deal fares | ~81 |
| Beach - S-Hemisphere | S-Hemisphere | **SPRING PRIME** (peak scoring Sep–Feb) | 69 |

**Active ski inventory today (15 lateSeason venues):** Hintertux Glacier, Saas-Fee, Tignes, Les Deux Alpes, Val Thorens, Zermatt, Verbier, Whistler (glacier), Mammoth (Mammoth Mountain), Chamonix (Mer de Glace), Cervinia, A-Basin, St. Moritz, Engelberg, Snowbird.

**S-Hemisphere ski season:** All 23 venues now closed (Portillo season ends ~Sep 21, Bariloche/Queenstown ~Sep 22–25, Mt. Buller/Hotham Sep 28). Snowpack scores at or below threshold for all 23. Expected — scoring system handles correctly via off-season cap.

**Front page right now:** Beach-dominant. S-Hem spring prime leads (Cape Town, Sydney, Florianópolis, Fernando de Noronha, Bay of Islands NZ), tropical year-round second, Mediterranean shoulder third. This is a strong and honest front page for a Oct 18 launch. 

**Sölden, Austria** (not yet in VENUES, proposed below) — the Rettenbach Glacier at Sölden opens for World Cup ski racing **October 22–23**. Adding it now means it can score as one of the first live ski venues when the season opens, just days after launch.

---

## 4. Content Quality

**Tag distribution (Day 22 — standing issue):**

| Tag count | Venues |
|-----------|--------|
| 0 | 0 |
| 1 | 0 |
| **2** | **225 (55.7%)** ← editorial gap, Day 22 |
| 3 | 14 |
| 4 | 164 |
| 5 | 1 |

239 venues have fewer than 4 tags. Tags drive search corpus recall AND filter pills (Powder Day, Crystal Water, etc.). 56% of venues under-tagged means search returns sparser results than the catalog warrants.

**Under-tagged sample (quick-wins for a future commit):**
- `borabora` (beach, 2 tags): `["UV 11","Crystal Water"]` → add: French Polynesia, Overwater Bungalows, Snorkeling, Lagoon
- `aspen` (skiing, 2 tags): `["Expert Terrain","Luxury Village"]` → add: Rocky Mountains, Four Mountains, Après-Ski, Ikon Pass
- `kitzbuehel` (skiing, 2 tags): `["Hahnenkamm Races","Historic Town"]` → add: Red Bull Racing, Tyrol Austria, Après-Ski Capital
- `beach_barbados` (beach, 2 tags): `["Atlantic Wonder","Coral Cliffs"]` → add: Bottom Bay, Pink Sand, Rum Culture, Caribbean
- `beach_kohsamui` (beach, 2 tags): `["Island Life","Full Moon Party Nearby"]` → add: Gulf of Thailand, Chaweng Beach, Coconut Paradise

**Batching estimate:** ~450 tag additions across 225 venues. Single-commit mass-edit. No architecture change needed — surgical `tags:[...]` expansions only. This is the only remaining content quality gap before launch.

---

## 5. Daily Venue Additions

**Context note:** This scheduled prompt references "182 venues, 12 categories." That is stale state from a prior project configuration. Peakly has **2 categories only (skiing and beach)** since the 2026-05-03 pivot, **404 venues**, and GEAR_ITEMS is cut for v1. New venue proposals focus on quality coverage gaps.

**Strategy today:** 2 beach (S-Hem spring prime + underserved Asia) + 2 ski (early-season openers timing Oct launch) + 1 beach (high-traffic mid-season Mediterranean gap).

All airports verified present in both `AP_CONTINENT` and `AIRPORT_COORDS` before inclusion.

```js
// PASTE INTO VENUES array after passing validate-venues.mjs
// Run: node scripts/validate-venues.mjs with these in data/venue-candidates.json

// 1. Ko Lanta — underserved Thai beach, Krabi region, dry season starts Oct/Nov
{id:"ko-lanta-yai-th", category:"beach", title:"Ko Lanta Yai", location:"Krabi, Thailand", lat:7.6629, lon:99.0489, ap:"KBV", icon:"🏖️", rating:4.6, reviews:8900, gradient:"linear-gradient(160deg,#082832,#136058,#1ea080)", accent:"#50c8a0", tags:["Long Beach Sunrise","Laid-Back Vibe","Coral Reefs","Ko Rok Snorkeling"], photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// 2. Paternoster — S-Hem spring prime, West Coast SA, Cape Town airport (1.5hr drive)
{id:"paternoster-beach-za", category:"beach", title:"Paternoster West Coast", location:"Western Cape, South Africa", lat:-32.8191, lon:17.8862, ap:"CPT", icon:"🏖️", rating:4.5, reviews:4200, gradient:"linear-gradient(160deg,#0c1e32,#1c4870,#4888b8)", accent:"#78b8e0", tags:["Whitewashed Fishing Village","Whale Season","Cape Columbine","Spring Flowers"], photo:"https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// 3. Sölden — Ötztal glacier, Austrian World Cup opener Oct 22–23, INN (Innsbruck, 1hr)
{id:"solden-otztal-at", category:"skiing", title:"Sölden / Ötztal Glacier", location:"Ötztal, Tyrol, Austria", lat:46.9628, lon:10.9348, ap:"INN", icon:"⛷️", rating:4.8, reviews:9400, gradient:"linear-gradient(160deg,#0c1830,#1c3870,#2c6eb8)", accent:"#7ab4e8", tags:["World Cup Glacier","Rettenbach Snowfield","James Bond Spectre","High Alpine 3040m"], photo:"https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75", lateSeason:true},

// 4. Grindelwald — Jungfrau region Switzerland, not yet in venues, ZRH (2hr)
{id:"grindelwald-jungfrau-ch", category:"skiing", title:"Grindelwald / Jungfrau", location:"Bernese Oberland, Switzerland", lat:46.6243, lon:8.0415, ap:"ZRH", icon:"⛷️", rating:4.9, reviews:13200, gradient:"linear-gradient(160deg,#101c3a,#1c3a7a,#2c6aba)", accent:"#82b6e8", tags:["Eiger North Face","Jungfraujoch Top of Europe","Kleine Scheidegg","Swiss Classic"], photo:"https://images.unsplash.com/photo-1548777123-e216912df7d8?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// 5. Avoriaz — Portes du Soleil 650km linked, car-free resort, GVA (1.5hr)
{id:"avoriaz-portes-du-soleil-fr", category:"skiing", title:"Avoriaz 1800", location:"Portes du Soleil, Haute-Savoie, France", lat:46.1886, lon:6.7657, ap:"GVA", icon:"⛷️", rating:4.7, reviews:8600, gradient:"linear-gradient(160deg,#0e1a36,#1c3878,#2c68b0)", accent:"#7ab0e0", tags:["650km Portes du Soleil","Car-Free Village","Linked to Morzine","Snowboard Mecca"], photo:"https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},
```

**Pre-paste checklist:**
1. Run `node scripts/validate-venues.mjs` after dropping into `data/venue-candidates.json`
2. `KBV` (Krabi) — confirmed in AP_CONTINENT (`asia`) and AIRPORT_COORDS ✅
3. `CPT` (Cape Town) — confirmed in AP_CONTINENT (`africa`) and AIRPORT_COORDS ✅
4. `INN` (Innsbruck) — confirmed in AP_CONTINENT (`europe`) and AIRPORT_COORDS ✅
5. `ZRH` (Zurich) — confirmed in AP_CONTINENT (`europe`) and AIRPORT_COORDS ✅
6. `GVA` (Geneva) — confirmed in AP_CONTINENT (`europe`) and AIRPORT_COORDS ✅
7. **Do NOT use GNB (Grenoble)** — present in AP_CONTINENT but MISSING from AIRPORT_COORDS (see §1 above). Use GVA or CMF for any Serre Chevalier / Briançon-area proposals.

**Notes on Sölden timing:** Rettenbach Glacier Sölden opens **Oct 22–23** for World Cup (5 days after Oct 18 launch). Marking `lateSeason:true` ensures it bypasses the off-season binary cap when snow_depth_max ≥ 0.5m. This is the most timely addition in the batch.

---

## 6. One Observation for PM

**The Oct 18 launch window is tight on one specific product experience: ski inventory.** Today the front page shows 15 glacier resorts under `lateSeason:true`. By Oct 22 (4 days after launch), Sölden opens; by Nov 1–15, the major Rockies/Alps resorts open. But a user landing on Oct 18 and selecting "Skiing" sees only 15 venues scoring live — and 111 returning "low confidence." That's honest, but it may read as a sparse product to a ski-focused first visitor. **Recommendation to PM:** frame the Oct 18 Reddit post around beach and S-Hem spring (the product's genuine Oct strength), not skiing. The ski story is strongest in December — consider a r/skiing post for December instead (already deferred per PM v162). If ski content is needed at launch, a front-page editorial note like "Glacier season open now — full season starts late October" would set expectation without hiding the inventory gap.
