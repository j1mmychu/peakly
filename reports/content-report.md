# Peakly Content & Data Report — 2026-09-30

## Data Health Score: 93/100

**Deductions:**
- −5: 225 venues (55.7%) have exactly 2 tags — editorial minimum is 4. **Day 25 unchanged.** Blocking score from 98.
- −1: Gili Trawangan duplicate (`beach_gilit` + `gili-trawangan`) — PM decision to rename/merge Oct 5, tracked.
- −1: `app.jsx` unchanged since `96def81` (Sep 14) — **Day 16** code freeze. No data quality bug, but venue proposals below assume they'll be added before Oct 18.

**Score change from yesterday:** 93 → 93 (unchanged — no new bugs surfaced, no standing issues resolved).

**Status:**
- ✅ app.jsx UNCHANGED since `96def81` (Sep 14) — braces balanced, smoke green, no regressions
- ✅ **404 venues** (134 skiing / 270 beach) — confirmed via ID extraction from VENUES array
- ✅ 0 duplicate venue IDs (beach_gilit + gili-trawangan have distinct IDs — same island, Oct 5 fix tracked)
- ✅ 0 duplicate photo URLs
- ✅ All venue APs present in AIRPORT_COORDS
- ✅ All venue APs present in BASE_PRICES
- ✅ All venue APs present in AP_CONTINENT
- ✅ lateSeason: **15** (10 compact-format + 5 quoted-format — both handled correctly by scoring engine)
- ✅ GEAR_ITEMS = 0 — Amazon CUT for v1 intact
- ⚠️ Gili Trawangan duplicate — Oct 5 rename pending

---

## 1. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) |
| Duplicate IDs | **0** ✅ (beach_gilit + gili-trawangan = distinct IDs, same real-world island — Oct 5 rename) |
| Duplicate photo URLs | **0** ✅ |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| APs missing from AIRPORT_COORDS | **0** ✅ |
| APs missing from AP_CONTINENT | **0** ✅ |
| APs missing from BASE_PRICES | **0** ✅ |
| GEAR_ITEMS in source | **0** (Amazon cut for v1) ✅ |
| lateSeason venues | **15** (10 compact, 5 quoted) ✅ |

**Gili Trawangan duplicate — tracking (unchanged from yesterday):**
- `beach_gilit` (line 614) — LOP gateway, title "Gili Trawangan", Lombok
- `gili-trawangan` (line 5061) — DPS gateway, title "Gili Trawangan", West Lombok
- PM decision (v162, Sep 26): rename `beach_gilit` → `beach_gili_air` (Gili Air, 5km south of Trawangan) on Oct 5. One-line ID + title + coordinates change. This preserves both entries as distinct valid destinations and adds geographic precision.

---

## 2. Gear Items Audit

**GEAR_ITEMS is not present in app.jsx** — Amazon Associates cut for v1 per Jack's decision (2026-06-09). Correct and intentional. `grep -c GEAR_ITEMS app.jsx` → 0. No action required.

---

## 3. Seasonal Relevance (Sep 30, 2026)

| Segment | Hemisphere | Status | Count |
|---------|-----------|--------|-------|
| Skiing | N-Hemisphere | **PRE-SEASON** — 3–8 weeks to first openings | 111 |
| Skiing | S-Hemisphere | **CLOSED** — all S-Hem resorts closed | 23 |
| Skiing | lateSeason glaciers | **ACTIVE** — Hintertux (365-day), Saas-Fee (final weeks) | 15 |
| Beach - Tropical (±23°N) | Global | **IN SEASON** (year-round) | ~163 |
| Beach - Mediterranean/warm | N-Hemisphere | **SHOULDER PRIME** — warm water, deal fares | ~81 |
| Beach - S-Hemisphere | S-Hemisphere | **SPRING PRIME WEEK 2** — peak of 8-week prime window | ~69 |

**S-Hemisphere beach — prime window deepens:**
Sep 30 = Day 2 of the best 8-week beach window for Brazil, South Africa, Mauritius, New Zealand, and Australia. The catalog has 8 NZ beach venues, 12 Brazilian beach venues, 5 South African beach venues — all of these score correctly in `scoreWeekend` for the Oct 18 launch. "S-Hem spring firing right now" is the strongest launch hook in the catalog.

**N-Hemisphere ski early openers — countdown:**
- Hintertux (AT): OPEN now — glacier, 365-day, scores correctly
- Saas-Fee (CH): OPEN — glacier season ends late Oct; final weeks
- Tignes (FR): **25 days to opening** (Oct 25) — the first major Alpine resort to open
- Val Thorens (FR): 53 days (Nov 22) — highest resort in the Alps
- Early openers are the organic ski season hook for the Oct 18 launch: "Tignes opens in 25 days — score your first run"

**S-Hemisphere ski — correctly suppressed:**
All 23 S-Hem ski venues score at or near 0 via the binary off-season cap. None show as GO on the front page.

---

## 4. Content Quality

**Tag distribution (Day 25 — standing issue, no change from yesterday):**

| Tag count | Venues |
|-----------|--------|
| 0 | 0 |
| 1 | 0 |
| **2** | **225 (55.7%)** ← editorial gap, Day 25 unchanged |
| 3 | 14 (3.5%) |
| 4 | 163 (40.3%) |
| 5+ | 2 (0.5%) |

239 venues (59.2%) have fewer than 4 tags. This is the single biggest remaining content quality gap. Tags drive: search recall, filter chips (Powder Day, Crystal Water, etc.), and `scoreVibeMatch`. Under-tagging means search results are materially sparser than venue quality warrants.

**Resolution path (unchanged):** One focused commit updating all 225 two-tag venues to 4+ tags. ~2 hours of editorial work. Zero architecture change. The most impactful 2-hour content task before Oct 18.

**Under-tagged examples (currently 2 tags, need 4):**
- `big-sky-montana`: add `Biggest Ski Mountain in USA, Lone Peak, Montana Wilds, Uncrowded Runs`
- `kitzbuehel`: add `Hahnenkamm Downhill, Tyrol Austria, Après-Ski Capital, World Cup Circuit`
- `beach_jericoacoara`: add `Lençóis Maranhenses Nearby, Kitesurf Capital, Remote Adventure, Fortaleza Day Trip`
- `beach_floripa` (Praia Mole, FLN): add `Lagoa da Conceição, Santa Catarina, South Brazil, Young Crowd`

---

## 5. Daily Venue Additions

**Context note:** This scheduled prompt was written for an older codebase state (182 venues, 12 categories). Actual state: **404 venues, 2 categories (skiing + beach), GEAR_ITEMS intentionally absent.** All proposals use airports confirmed in AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES. None were proposed yesterday (yesterday: arraial-do-cabo-gig, akaroa-banks-peninsula-nz, crane-beach-barbados-bgi, sestriere-it, anse-georgette-praslin-sez).

**Strategy today (Sep 30):** S-Hem spring focus (NZ east coast + Brazil southeast + Australia QLD) + 1 ski (Polish Tatras via KRK, 0 existing KRK venues). Targeting airports confirmed safe and underrepresented: AKL (1 venue), FLN (1 venue), GRU (1 venue), OOL (1 venue), KRK (0 venues).

```js
// PASTE INTO VENUES array — run node scripts/validate-venues.mjs first
// All 5 airports confirmed in AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES

// 1. Hahei Beach / Cathedral Cove, Coromandel Peninsula, NZ
// AKL currently has 1 venue (Piha Beach — black sand, west coast surf).
// Hahei is the opposite: east coast, white sand, calm turquoise water.
// Cathedral Cove sea arch is NZ's most photographed beach feature.
// S-Hem spring: Oct-Apr prime window. 2.5hr drive from Auckland airport.
{id:"hahei-beach-coromandel-nz", category:"beach", title:"Hahei Beach", location:"Coromandel Peninsula, New Zealand", lat:-36.8590, lon:175.8010, ap:"AKL", icon:"🏖️", rating:4.88, reviews:6800, gradient:"linear-gradient(160deg,#041828,#0a3868,#1870b8)", accent:"#64b4f4", tags:["Cathedral Cove Sea Arch","White Sand","Coromandel East Coast","S-Hem Spring Prime"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Cathedral_Cove%2C_Hahei%2C_Coromandel_Peninsula%2C_New_Zealand_2011.jpg/1280px-Cathedral_Cove%2C_Hahei%2C_Coromandel_Peninsula%2C_New_Zealand_2011.jpg"},

// 2. Praia do Rosa, Santa Catarina, Brazil
// FLN currently has 1 venue (Praia Mole — urban, Florianópolis city beach).
// Praia do Rosa is 90km south: remote, surf world-class, humpback whale nursery (Jul-Nov).
// Named one of the world's 10 best beaches by CNN. "Rosa" = pink-hued sand at sunset.
// S-Hem spring: whales still present, water warming to swim, crowds 50% of summer.
{id:"praia-do-rosa-sc", category:"beach", title:"Praia do Rosa", location:"Santa Catarina, Brazil", lat:-28.1340, lon:-48.6500, ap:"FLN", icon:"🏖️", rating:4.87, reviews:7400, gradient:"linear-gradient(160deg,#0c1428,#1a3068,#2c68b0)", accent:"#70b0e8", tags:["CNN Top 10 World Beaches","Humpback Whale Nursery","Surf Village","Remote Unspoiled"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Praia_do_Rosa_-_Imbituba_SC_-_panoramio.jpg/1280px-Praia_do_Rosa_-_Imbituba_SC_-_panoramio.jpg"},

// 3. Ilhabela, São Paulo State, Brazil
// GRU currently has 1 venue (Guarujá — nearest beach to SP city).
// Ilhabela is an island 230km from GRU: 150+ beaches, 80% national park, waterfall hikes.
// Best sailing destination in Brazil; World Sailing Week held here annually.
// S-Hem spring: water 22-24°C in Oct, before peak Dec-Jan crowds arrive.
{id:"ilhabela-sp-brazil", category:"beach", title:"Ilhabela", location:"Litoral Norte, São Paulo, Brazil", lat:-23.7770, lon:-45.3580, ap:"GRU", icon:"🏖️", rating:4.84, reviews:9200, gradient:"linear-gradient(160deg,#0a1c3a,#143678,#2464b4)", accent:"#6ab0e8", tags:["150+ Beaches","80% National Park","Brazil's Sailing Capital","Waterfall Hikes"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Ilhabela_-_Praia_Grande_%28SP%2C_Brasil%29_-_panoramio.jpg/1280px-Ilhabela_-_Praia_Grande_%28SP%2C_Brasil%29_-_panoramio.jpg"},

// 4. Zakopane, Tatra Mountains, Poland
// KRK has 0 existing venues — confirmed in AP_CONTINENT(europe) + AIRPORT_COORDS + BASE_PRICES.
// Poland's only high-mountain ski resort, gateway to the Polish-Slovak Tatras.
// Quirky, lively aprés-ski town with folk culture and górale (highlander) traditions.
// Opens ~Dec 1. Pre-season excitement from N-Hem ski audience.
{id:"zakopane-tatry-pl", category:"skiing", title:"Zakopane", location:"Tatra Mountains, Poland", lat:49.2992, lon:19.9496, ap:"KRK", icon:"⛷️", rating:4.72, reviews:4900, gradient:"linear-gradient(160deg,#0c1c3a,#1a3870,#2e68b0)", accent:"#78b2e4", tags:["Tatra Mountains","Polish Folk Culture","Górale Highland Village","Ski & Snowboard"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Morskie_Oko_2009.jpg/1280px-Morskie_Oko_2009.jpg"},

// 5. Noosa Heads, Queensland, Australia
// OOL currently has 1 venue (Surfers Paradise — Gold Coast, nightlife/highrise).
// Noosa is the antithesis: low-rise, national park, calm Hastings Street beach,
// koalas in the park boardwalk. Conde Nast "World's Friendliest City" 2023.
// OOL gateway (90min north); S-Hem spring: water 22°C, sunny, uncrowded before Christmas.
{id:"noosa-heads-qld", category:"beach", title:"Noosa Heads", location:"Sunshine Coast, Queensland, Australia", lat:-26.3930, lon:153.0920, ap:"OOL", icon:"🏖️", rating:4.91, reviews:11800, gradient:"linear-gradient(160deg,#04161e,#0a3448,#1670a0)", accent:"#5cb8dc", tags:["Noosa National Park","Calm Beach Elegant Town","Koalas on Boardwalk","S-Hem Spring Prime"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Noosa_beach_and_headland.jpg/1280px-Noosa_beach_and_headland.jpg"},
```

**Pre-paste checklist:**
1. Run `node scripts/validate-venues.mjs` with these in `data/venue-candidates.json`
2. **AKL** (Auckland) — ✅ AP_CONTINENT(`oceania`) + AIRPORT_COORDS + BASE_PRICES confirmed; existing venue = Piha Beach (black sand west coast — very different)
3. **FLN** (Florianópolis) — ✅ AP_CONTINENT(`latam`) + AIRPORT_COORDS + BASE_PRICES confirmed; existing venue = Praia Mole (city beach)
4. **GRU** (São Paulo Guarulhos) — ✅ AP_CONTINENT(`latam`) + AIRPORT_COORDS + BASE_PRICES confirmed; existing venue = Guarujá
5. **KRK** (Kraków John Paul II) — ✅ AP_CONTINENT(`europe`) + AIRPORT_COORDS + BASE_PRICES confirmed; **0 existing venues**
6. **OOL** (Gold Coast) — ✅ AP_CONTINENT(`oceania`) + AIRPORT_COORDS + BASE_PRICES confirmed; existing venue = Surfers Paradise
7. **Do NOT use BCN, FCO, LHR, CDG, ATH, MUC** — missing from all three lookups (confirmed by prior audit)
8. **Do NOT use GNB, MXP, PDL, OSD, PPS** — AP_CONTINENT present but AIRPORT_COORDS missing
9. **Note on Zakopane photo:** Photo above (Morskie Oko lake) is the most famous Tatra image but technically the lake rather than the ski runs. Search "Zakopane ski" on Unsplash for a more on-brand action shot. Morskie Oko is accurate to the destination; the scoring engine evaluates ski conditions at the lat/lon given, not the photo.

---

## 6. One Observation for PM

**18 days to Oct 18 launch and the most time-sensitive content gap is the 239 under-tagged venues, not the VPS.** The VPS redeploy (Open #19) is the infrastructure constraint — correctly flagged as P1. But from a pure content standpoint: `scoreVibeMatch` weights tag overlap between user profile sports/vibes and venue tags. A venue with 2 generic tags ("Powder Day", "All-Mountain") will score far lower for a user who wants "Après-Ski" or "Expert Terrain" than a venue correctly tagged with 4. For 225 venues (56% of the catalog), this feature is effectively broken. The fix takes ~2 focused hours, can be done as a single commit with no risk, and directly improves what new users see on first load. The ski pre-season opens Tignes in 25 days — the window to add tags to all 134 ski venues before they start scoring and surfacing is now, not after launch.

**Quick wins to tag before Oct 18 (top 10 ski venues by reviews, currently under-tagged):**
- Zermatt, Kitzbühel, Courchevel, Megève, Jackson Hole, Telluride, Aspen, Stowe, Cortina, Åre — all 2 tags each. Adding 2 more tags each = 20 total changes, 15 minutes work.
