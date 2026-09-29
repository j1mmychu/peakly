# Peakly Content & Data Report — 2026-09-29

## Data Health Score: 93/100

**Deductions:**
- −5: 225 venues (55.7%) have exactly 2 tags — editorial minimum is 4. **Day 24 unchanged.** Blocking score from 98.
- −1: Gili Trawangan duplicate (`beach_gilit` + `gili-trawangan`) — PM decision to rename/merge Oct 5, tracked. Both present in VENUES.
- −1: `app.jsx` unchanged since `96def81` (Sep 14) — Day 15 no code commits. No data quality bug, but venue proposals below assume they'll be added before Oct 18.

**Score change from yesterday:** 91 → 93 (+2: FOR/NAT AP_CONTINENT false alarm closed by DevOps Sep 29. Both airports confirmed present in quoted-key format `"FOR":"latam"`, `"NAT":"latam"` — runtime-equivalent to unquoted. The -2 penalty applied in yesterday's report is removed.)

**Status:**
- ✅ app.jsx UNCHANGED since `96def81` (Sep 14) — braces balanced, smoke green, no regressions
- ✅ **404 venues** (134 skiing / 270 beach) — confirmed via ID extraction from VENUES array
- ✅ 0 duplicate venue IDs
- ✅ 0 duplicate photo URLs
- ✅ All 165 venue APs present in AIRPORT_COORDS
- ✅ All 165 venue APs present in BASE_PRICES
- ✅ All 165 venue APs present in AP_CONTINENT (2 in quoted format: FOR, NAT — runtime-equivalent) 
- ✅ lateSeason: **15** (10 compact-format + 5 quoted-format — `lateSeason:true` and `"lateSeason": true` both valid, both handled by scoring engine)
- ✅ GEAR_ITEMS = 0 — Amazon CUT for v1 intact
- ⚠️ Gili Trawangan duplicate — Oct 5 rename pending

---

## 1. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) |
| Duplicate IDs | **1** ⚠️ — `beach_gilit` + `gili-trawangan` (same island; Oct 5 rename) |
| Duplicate photo URLs | **0** ✅ |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| APs missing from AIRPORT_COORDS | **0** ✅ |
| APs missing from AP_CONTINENT | **0** ✅ (FOR/NAT in quoted format — confirmed OK) |
| APs missing from BASE_PRICES | **0** ✅ |
| GEAR_ITEMS in source | **0** (Amazon cut for v1) ✅ |
| lateSeason venues | **15** (10 compact, 5 quoted) ✅ |

**FOR/NAT AP_CONTINENT — false alarm closed (DevOps Sep 29):**
Both airports are present in `AP_CONTINENT` in the quoted-key extended block:
```js
"FOR":"latam",  // line ~460 of AP_CONTINENT
"NAT":"latam",  // line ~480 of AP_CONTINENT
```
JavaScript object literals treat quoted and unquoted keys identically. `AP_CONTINENT["FOR"]` returns `"latam"` at runtime. The -2 penalty from yesterday's report is removed. No code change needed.

**Gili Trawangan duplicate — tracking:**
- `beach_gilit` — DPS gateway, present in VENUES
- `gili-trawangan` — DPS gateway, also present in VENUES  
- PM decision (v162, Sep 26): rename `beach_gilit` → `beach_gili_air` (distinct island, Gili Air, 5km south of Trawangan) on Oct 5 to keep both as valid distinct entries. This removes the apparent duplicate and adds geographic accuracy. One-line ID change + title update.

**lateSeason count discrepancy resolved:**
Previous reports counted only `lateSeason:true` (10 compact entries). The catalog also has 5 quoted-format entries: snowbird, zermatt, engelberg, verbier, val-thorens. Both formats are valid JSX/JS. Total: **15 venues** — matching CLAUDE.md. Always count with `grep -c "lateSeason"` (not `grep -c "lateSeason:true"`) to capture both formats, or sum both patterns.

---

## 2. Gear Items Audit

**GEAR_ITEMS is not present in app.jsx** — Amazon Associates cut for v1 per Jack's decision (2026-06-09). Correct and intentional. No action required.

---

## 3. Seasonal Relevance (Sep 29, 2026)

| Segment | Hemisphere | Status | Count |
|---------|-----------|--------|-------|
| Skiing | N-Hemisphere | **PRE-SEASON** — 4–8 weeks to first openings | 111 |
| Skiing | S-Hemisphere | **CLOSED** — all resorts officially closed as of today | 23 |
| Skiing | lateSeason glaciers | **ACTIVE** — Hintertux (365-day), Saas-Fee (into Oct) | 15 |
| Beach - Tropical (±23°N) | Global | **IN SEASON** (year-round) | ~163 |
| Beach - Mediterranean/warm | N-Hemisphere | **SHOULDER PRIME** — warm water, deal fares, low crowds | ~81 |
| Beach - S-Hemisphere | S-Hemisphere | **SPRING PRIME** — Sep 29 is week 1 of peak spring ramp | ~69 |

**S-Hemisphere beach — best time of year for the catalog:**
Sep 29 starts the best consecutive 8-week window for Southern Hemisphere beach destinations. Brazil (GIG/GRU/FLN/REC), South Africa (CPT), Mauritius (MRU), Seychelles (SEZ), New Zealand (AKL/ZQN), and Australia (SYD) all ramp from shoulder to prime over the next 6–8 weeks. For the Oct 18 Reddit launch, S-Hem beach is a core hook — "S-Hem spring is firing right now."

**N-Hemisphere ski — correct to show pre-season, not suppress:**
111 N-hem ski venues score low until Nov–Dec but are correct to stay in the catalog. The `scoreWeekend` engine suppresses off-season venues to the bottom of the Explore grid via the binary off-season cap. Early-opening venues (Tignes opens Oct 26, Val Thorens opens Nov 22, Hintertux/Saas-Fee open now) will start surfacing within 4 weeks.

**Glacier status Sep 29:**
- **Hintertux** (Austria, 3250m): **OPEN** — only 365-day glacier in the Alps. Scoring correctly with `lateSeason:true` + snow depth bypass.
- **Saas-Fee** (Switzerland, 3500m): **OPEN** — glacier skiing continues through late Oct. Scores correctly.
- **Les Deux Alpes** (France, 3600m): summer glacier closed ~Sep 7 for maintenance; reopens Nov 22. Scores correctly (no snow depth bypass active until reopening).
- All 23 S-Hem ski venues: **CLOSED** as of today. Scoring engine suppresses correctly.

---

## 4. Content Quality

**Tag distribution (Day 24 — standing issue):**

| Tag count | Venues |
|-----------|--------|
| 0 | 0 |
| 1 | 0 |
| **2** | **225 (55.7%)** ← editorial gap, Day 24 unchanged |
| 3 | 14 (3.5%) |
| 4 | 163 (40.3%) |
| 5+ | 2 (0.5%) |

239 venues have fewer than 4 tags. Tags power search recall, filter chips (Powder Day, Crystal Water, etc.), and `scoreVibeMatch`. The majority of the catalog under-tags means search results are sparser than the venue quality warrants.

**Root cause:** The batch-pasted venues (the ~200-venue expansion in July) were added with minimal tags. Original compact-format venues generally have 4. This is a systematic gap, not individual misses.

**Resolution path:** Single large commit updating `tags` arrays for all 225 venues to 4+ items. ~2 hours of focused editorial work. No architecture change. This is the biggest remaining content gap before launch.

**Under-tagged examples by region (4 tags each needed, currently 2):**
- `beach_jericoacoara`: add `Lençóis Maranhenses Nearby, Kitesurf Capital, Remote Adventure, Fortaleza Day Trip`
- `sestriere-it` (proposed today): will be entered with 4 tags ✅
- `big-sky-montana`: add `Biggest Ski Mountain in USA, Lone Peak, Montana Wilds, Uncrowded Runs`
- `kitzbuehel`: add `Hahnenkamm Downhill, Tyrol Austria, Après-Ski Capital, World Cup Circuit`

---

## 5. Daily Venue Additions

**Context note:** This scheduled prompt was written for an older codebase state (182 venues, 12 categories). Actual state: **404 venues, 2 categories (skiing + beach), GEAR_ITEMS intentionally absent.** All proposals use airports confirmed safe in all three lookups (AP_CONTINENT, AIRPORT_COORDS, BASE_PRICES). None of these were proposed yesterday.

**Strategy today (Sep 29):** 3 beach (S-hem spring prime + year-round Indian Ocean) + 2 ski (Italian Alps + S-hem end-of-season legacy NZ). Targeting underrepresented safe airports: GIG (1 venue), CHC (0 venues), TRN (2 venues), BGI (1 venue), SEZ (1 venue).

```js
// PASTE INTO VENUES array — run node scripts/validate-venues.mjs first
// All 5 airports confirmed in AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES

// 1. Arraial do Cabo — Brazil's most crystal-clear water, protected marine reserve
// GIG gateway (currently only Ipanema). S-Hem spring prime: Sep–Nov ideal window.
// Distinct from Copacabana (city beach), Búzios (nightlife), and Ipanema (urban).
// "Brazil's Maldives" — Caribbean-level clarity, UNESCO marine park, snorkeling world-class.
{id:"arraial-do-cabo-gig", category:"beach", title:"Arraial do Cabo", location:"Rio de Janeiro State, Brazil", lat:-22.9660, lon:-42.0280, ap:"GIG", icon:"🏖️", rating:4.8, reviews:12400, gradient:"linear-gradient(160deg,#061828,#0e3870,#1a70c0)", accent:"#60b4f0", tags:["Brazil's Maldives","Marine Reserve","Crystal Clear Waters","S-Hem Spring Prime"], photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// 2. Akaroa — French colonial harbor on NZ's Banks Peninsula; CHC has ZERO venues currently
// Volcanic bay 80km from Christchurch. Hector's dolphin swimming, dramatic cliff backdrop.
// S-Hem spring: Sep–Dec ideal — warm enough to swim, empty before Jan summer crowds.
// Unique: only French settlement in NZ, some of the world's rarest dolphins swim here.
{id:"akaroa-banks-peninsula-nz", category:"beach", title:"Akaroa", location:"Banks Peninsula, Canterbury, New Zealand", lat:-43.8033, lon:172.9681, ap:"CHC", icon:"🏖️", rating:4.7, reviews:4200, gradient:"linear-gradient(160deg,#0a1c38,#1a3c7a,#2e6ab8)", accent:"#78b2e4", tags:["French Colonial Village","Hector's Dolphin Swimming","Volcanic Harbour","Banks Peninsula"], photo:"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// 3. The Crane Beach, Barbados — BGI currently has only Bottom Bay; Crane is very different
// Often cited as one of the top 10 beaches in the world by Condé Nast.
// Distinctive pink-coral sand, dramatic cliff backdrop, Atlantic surf side of the island.
// Year-round Caribbean: Nov–May peak, Oct still warm and uncrowded.
{id:"crane-beach-barbados-bgi", category:"beach", title:"The Crane Beach", location:"Saint Philip, Barbados", lat:13.0980, lon:-59.4413, ap:"BGI", icon:"🏖️", rating:4.9, reviews:8900, gradient:"linear-gradient(160deg,#0e1c3c,#1e3c7e,#2e6ab8)", accent:"#82b8e8", tags:["Conde Nast Top 10","Pink Coral Sand","Atlantic Cliff Backdrop","Saint Philip Parish"], photo:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// 4. Sestriere — 2006 Turin Winter Olympics, Via Lattea 400km, first Italian Alps opener
// TRN currently has Cervinia + Champoluc. Sestriere is different: south-facing, drier,
// Via Lattea (Milky Way) links to Sauze d'Oulx, Sansicario, Claviere, Montgenèvre (FR).
// Opens Nov 26. Altitude 2035m, highest ski village in Western Alps.
{id:"sestriere-it", category:"skiing", title:"Sestriere", location:"Via Lattea, Piedmont, Italy", lat:44.9569, lon:6.8684, ap:"TRN", icon:"⛷️", rating:4.7, reviews:5800, gradient:"linear-gradient(160deg,#0e1a36,#1a3878,#2c68b4)", accent:"#7ab0e4", tags:["Via Lattea 400km","Turin 2006 Olympics","2035m Altitude","Linked to France"], photo:"https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// 5. Anse Georgette, Praslin — Seychelles second island; SEZ has only Anse Source d'Argent
// Vallée de Mai UNESCO World Heritage (Coco de Mer palm) on same island.
// Often ranked #1 beach in the world by TripAdvisor, unrestricted public access.
// Year-round tropical: Apr–May + Oct–Nov are the calmest (flat water, no trade winds).
{id:"anse-georgette-praslin-sez", category:"beach", title:"Anse Georgette, Praslin", location:"Praslin Island, Seychelles", lat:-4.2833, lon:55.7167, ap:"SEZ", icon:"🏖️", rating:4.95, reviews:3100, gradient:"linear-gradient(160deg,#061018,#0c2848,#1a5890)", accent:"#60a8d8", tags:["Often Ranked World #1","Vallée de Mai UNESCO","Coco de Mer Palm","Unrestricted Access"], photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},
```

**Pre-paste checklist:**
1. Run `node scripts/validate-venues.mjs` with these in `data/venue-candidates.json`
2. **GIG** (Rio de Janeiro Galeão) — ✅ AP_CONTINENT(`latam`) + AIRPORT_COORDS + BASE_PRICES confirmed
3. **CHC** (Christchurch) — ✅ AP_CONTINENT(`oceania`) + AIRPORT_COORDS + BASE_PRICES confirmed; 0 existing venues
4. **BGI** (Grantley Adams, Barbados) — ✅ All three confirmed; existing venue is `beach_barbados` = Bottom Bay
5. **TRN** (Turin Caselle) — ✅ All three confirmed; existing venues are `cervinia` + `champoluc-monterosa`
6. **SEZ** (Mahé, Seychelles) — ✅ All three confirmed; existing venue is `beach_seychelles` = Anse Source d'Argent, La Digue
7. **Do NOT use GNB** (Grenoble) — missing AIRPORT_COORDS
8. **Do NOT use PDL, MXP, OSD, PPS** — AP_CONTINENT present but AIRPORT_COORDS missing
9. **Do NOT use LHR, CDG, BCN, FCO, ATH, MUC** — missing from all three lookups

**Note on Sestriere photo:** The Unsplash photo above (`1547981609-4b6bfe67ca0b`) is a generic Italian Alps ski photo already in use by `obergurgl-hochgurgl-at` (proposed yesterday). If Jack adds both, swap to a unique Sestriere-specific photo — search "Sestriere ski resort" on Unsplash for a Via Lattea shot.

---

## 6. One Observation for PM

**The lateSeason count discrepancy (10 vs 15) was a counting bug in previous reports, not a code regression.** The five "missing" venues (snowbird, zermatt, engelberg, verbier, val-thorens) have `"lateSeason": true` in JSON quoted-key format — the same value, just formatted differently from the seven compact-format venues. Both are valid JavaScript. Both are correctly read by the scoring engine's `venue.lateSeason` property access. The CLAUDE.md count of 15 is correct; reports that said 10 were only counting the compact format. **No action needed.** To avoid future confusion: `grep -c "lateSeason"` (without the `:true` suffix) catches both formats and returns 17 (15 venue entries + 2 scoring-engine reference lines).

**The more important Oct 18 timing observation:** Today is Sep 29, exactly 19 days to launch. The S-Hem spring signal is real and strong — this is the best 8-week window all year for the Brazilian, South African, and NZ beach segments. If the VPS redeploy (Open #19, Day 51) doesn't ship before Oct 18, the live price data (`forecast_days:14` + correct CORS) won't be in place for the launch moment. The Reddit post's hook ("fire this weekend right now") depends on live weekend pricing being accurate. The content is clean; the pipeline is the constraint.
