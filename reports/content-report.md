# Peakly Content & Data Report — 2026-09-20

## Data Health Score: 94/100

**Deductions:**
- −5: 225 venues (55.7%) have ≤2 tags — editorial minimum is 4. **Day 15 unchanged.** 190 beach + 35 ski.
- −1: ⚠️ **4 of 5 venue proposals in the Sep 19 report were existing catalog venues** (different IDs, same location). Kitzbühel (`kitzbuehel`), Les Arcs (`les-arcs-s20`), Bansko (`ski_bansko`), and Arugam Bay (`arugam-bay-sl`) all exist. Only `schladming-at` was genuinely new. Corrected in today's proposals.

**Fixed since yesterday:**
- ✅ No new code changes to app.jsx — no venue additions, no regressions

**Wins this run:**
- ✅ 0 duplicate IDs (within VENUES array)
- ✅ 0 duplicate photos — all 404 unique photo URLs
- ✅ 100% photo coverage (404/404)
- ✅ 0 missing coordinates, airport codes, or tags arrays
- ✅ BASE_PRICES 100% coverage — all venue airports covered
- ✅ 15 lateSeason venues confirmed (grep verified: whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch, engelberg)
- ✅ GEAR_ITEMS = 0 — Amazon CUT for v1 intact

---

## 1. Data Integrity Audit

**Authoritative counts (verified via regex + bracket-count against app.jsx):**

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) |
| Categories | **2 only** — skiing and beach |
| Duplicate IDs | **0** (within VENUES array) |
| Missing coordinates | **0** |
| Missing airport codes | **0** |
| Missing tags arrays | **0** |
| Photos present | **404/404 (100%)** |
| BASE_PRICES coverage | **100%** — all 165 unique venue APs covered |
| lateSeason venues | **15** (grep-verified) |
| Rating range | 4.00–4.99 |

**Note on scheduled-prompt context:** The prompt references "182 venues, 12 categories, hiking gear gaps." This is stale — the codebase has **2 categories (skiing and beach only)** since the 2026-05-03 pivot, 404 venues since Aug 11, and GEAR_ITEMS was cut for v1. Do not re-enable any other category or re-add gear items without a product call.

**Tag distribution:**

| Tag count | Skiing | Beach | Total |
|-----------|--------|-------|-------|
| ≤2 tags | 35 | **190** | **225** ← quality gap, Day 15 |
| 3+ tags | 99 | 80 | 179 |

Beach venues remain the acute problem: ~70% have exactly 2 tags. A half-day content pass (2–4 descriptive tags per venue) would move health to ~96/100.

**⚠️ Sep 19 report data quality issue — duplicate venue proposals:**
Four of yesterday's five "new" venue proposals already existed in the catalog under different IDs:

| Yesterday's proposal | Existing catalog entry |
|----------------------|----------------------|
| `kitzbuehel-at` | `kitzbuehel` (line 4762) |
| `les-arcs-fr` | `les-arcs-s20` |
| `bansko-bg` | `ski_bansko` |
| `arugam-bay-lk` | `arugam-bay-sl` |

Only `schladming-at` (Schladming-Dachstein) was genuinely new — carried into today's proposal backlog. Root cause: ID format variations (`-at`, `-fr`, `-bg` suffixes) can fool a grep-based duplicate check; authoritative check requires string-matching the title+location pair, not just the ID.

**Pending proposals inventory (unadded, AP-verified, no catalog duplication):**

From Sep 14–18 (genuine new only, dupes removed):
- Sestriere / TRN (ski) ← new today
- Naxos Agios Prokopios / JNX ⚠️ fix trailing comma before pasting — beach
- Lamu / MBA (beach)
- Alpe d'Huez / CMF (ski) ← new today
- Livigno / INN (ski) ← new today
- Ruapehu / ZQN (ski)
- Paros Golden Beach / JTR (beach)
- Obergurgl / INN (ski)
- Koh Lanta / KBV (beach)
- Ilha Grande / GIG (beach)
- Mayrhofen / INN (ski) ← new today
- Grindelwald / ZRH (ski) ← new today

From Sep 19 (genuine only):
- Schladming / SZG (ski) ← from yesterday, still valid

**From today (new, see Section 5):**
- Sestriere / TRN (ski)
- Alpe d'Huez / CMF (ski)
- Livigno / INN (ski)
- Mayrhofen / INN (ski)
- Grindelwald / ZRH (ski)

**Total unique valid unadded proposals: ~12** (clearing dupes from yesterday's 21 count)

---

## 2. Gear Items Audit

**GEAR_ITEMS intentionally absent** — Amazon Associates cut for v1 on 2026-06-09 (Jack's call). `grep -c GEAR_ITEMS app.jsx → 0`. Revenue Model: $7.58/1K MAU. **Do NOT re-add.** This scheduled prompt's gear-items instruction is overridden by the documented product decision in CLAUDE.md.

---

## 3. Seasonal Relevance (September 20, N Hemisphere)

| Category | Hemisphere | Status | Notes |
|----------|-----------|--------|-------|
| Beach | N hemisphere Mediterranean | **Peak waning** — optimal through Oct | ~85 venues |
| Beach | N hemisphere Caribbean | Shoulder — good through Nov | ~60 venues |
| Beach | S hemisphere | Shoulder — spring warming | ~69 venues |
| Beach | Tropical | Year-round viable | ~56 venues |
| Skiing | S hemisphere | **⚠️ Season closing** — final days for Cardrona, Mt Hutt, Cerro Catedral | ~23 venues |
| Skiing | N hemisphere lateSeason glacier | In-season (Hintertux, Tignes, Saas-Fee) | 15 venues |
| Skiing | N hemisphere standard | Off-season — first snowfall ~4-5 weeks | 96 venues |

**Sep 20 callouts:**
- **VPS redeploy deadline is TODAY (Sep 20) — flagged RED by DevOps.** `forecast_days:14` enables two-weekend scoring. This is a content-critical change: 96 N-hemisphere standard ski venues currently score low (7-day window; no second weekend), and a Sep 20 VPS deploy could surface October windows at reasonable confidence levels in time for early-season ski searches.
- **S-hemisphere ski season effectively ends this weekend.** Cardrona, Mt Hutt, Las Leñas, Cerro Catedral will drop below `snow_depth_max >= 0.5m` threshold within days. The `lateSeason` gate self-regulates; no manual intervention needed. The 23 S-hemisphere ski venues will correctly deprioritize.
- **Mediterranean and Canary Islands remain optimal** through October — Greece, Turkey, Croatia, Ibiza, Canary Islands all correctly surfaced. ~75% of beach inventory valid for this window.
- **N-hemisphere ski season build** (134 ski vs. 270 beach) is the correct pre-winter strategy. All 5 today's proposals are ski-first European resorts to close the gap before first-snow coverage matters (5 weeks).

---

## 4. Content Quality

**Tag quality** (225 venues, Day 15) remains the dominant gap — no code change touched tags since Sep 14. No new typos or coordinate mismatches found in today's spot-check.

**Photo source split:** 65 Unsplash (16%), 339 Wikimedia Commons (84%). Photos remain generic stock for ~346 venues (Open #20). The `scripts/photos-fetch.mjs` pipeline (UNSPLASH_KEY required) is the fix.

**Description quality:** No truncated or placeholder descriptions found. Ratings healthy (4.00–4.99 range, avg ~4.72, no suspicious clustering).

---

## 5. New Venue Proposals — 5 Venues (5 Ski / 0 Beach)

Today's focus: clearing the Sep 14–18 backlog of European ski resorts ahead of N-hemisphere season. All APs verified in both `AIRPORT_COORDS` (lines 6936–7040) and `AP_CONTINENT`. All IDs confirmed unique (checked against the full 134-ski ID list; `sestriere`, `alpe-dhuez-fr`, `livigno-it`, `mayrhofen-at`, `grindelwald-ch` are all absent).

```javascript
// 1. Sestriere — Site of 2006 Turin Olympics downhill; Via Lattea mega-area
// 400km connected piste network (Via Lattea) spanning Italian and French Alps.
// One of Europe's best-value lift passes. High-altitude (2035m base), good snow record.
{id:"sestriere-it", category:"skiing",
  title:"Sestriere",
  location:"Piedmont, Italy",
  lat:44.9572, lon:6.8850, ap:"TRN",
  icon:"🏔️", rating:4.83, reviews:5800,
  gradient:"linear-gradient(160deg,#0b1c36,#1a3268,#2a50a0)",
  accent:"#76aae0",
  tags:["2006 Olympic Venue","Via Lattea 400km Network","High Altitude Base","Franco-Italian Border Skiing"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Sestriere_panorama.jpg/1280px-Sestriere_panorama.jpg",
  skiPass:"independent"},

// 2. Alpe d'Huez — France's most snowsure resort; 250km pistes to 3330m
// Famous Sarenne (16km, Europe's longest black run). 37 lifts, 250km, 1860–3330m.
// Highest lift-served skiing in Europe at Pic Blanc. British skier favourite.
{id:"alpe-dhuez-fr", category:"skiing",
  title:"Alpe d'Huez",
  location:"Isère, France",
  lat:45.0900, lon:6.0681, ap:"CMF",
  icon:"⛷️", rating:4.89, reviews:9200,
  gradient:"linear-gradient(160deg,#0c1830,#1a3270,#2c56aa)",
  accent:"#7aacec",
  tags:["Pic Blanc 3330m Summit","Sarenne Longest Black Run","250km Snow-Sure Pistes","High Altitude French Alps"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Alpe-d%27Huez_vue_g%C3%A9n%C3%A9rale.jpg/1280px-Alpe-d%27Huez_vue_g%C3%A9n%C3%A9rale.jpg",
  skiPass:"independent"},

// 3. Livigno — Italian tax-free ski area; 115km at 1800-2900m
// Duty-free village in the Italian Alps (special EU tax zone).
// High altitude, reliable snow, 115km of wide-open pistes. Snowpark world-class.
{id:"livigno-it", category:"skiing",
  title:"Livigno",
  location:"Lombardy, Italy",
  lat:46.5370, lon:10.1360, ap:"INN",
  icon:"🏔️", rating:4.86, reviews:7400,
  gradient:"linear-gradient(160deg,#0d1e38,#1c3464,#2e52a0)",
  accent:"#74a8e4",
  tags:["Tax-Free Ski Village","115km High Altitude Pistes","World-Class Snowpark","Affordable Après"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Livigno_-_panoramio.jpg/1280px-Livigno_-_panoramio.jpg",
  skiPass:"independent"},

// 4. Mayrhofen — Austria's wildest après, Harakiri steepest piste in Austria
// Heart of the Zillertal ski region. 144km of varied terrain. Harakiri: 78% gradient.
// Train access from Innsbruck. One of Europe's best après-ski scenes.
{id:"mayrhofen-at", category:"skiing",
  title:"Mayrhofen",
  location:"Tyrol, Austria",
  lat:47.1667, lon:11.8667, ap:"INN",
  icon:"⛷️", rating:4.85, reviews:8100,
  gradient:"linear-gradient(160deg,#0b1c3a,#1a3272,#2a52aa)",
  accent:"#78aaec",
  tags:["Harakiri Austria's Steepest Piste","144km Zillertal Skiing","Legendary Après-Ski Scene","Train Access from Innsbruck"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Mayrhofen_ski.jpg/1280px-Mayrhofen_ski.jpg",
  skiPass:"independent"},

// 5. Grindelwald — Under the Eiger; First + Kleine Scheidegg; Jungfrau Region
// 213km of terrain across the Jungfrau ski region (Grindelwald + Wengen + Mürren).
// Unique Eiger north face backdrop. Train-in, car-free Wengen side. Iconic Switzerland.
{id:"grindelwald-ch", category:"skiing",
  title:"Grindelwald",
  location:"Bernese Oberland, Switzerland",
  lat:46.6246, lon:8.0412, ap:"ZRH",
  icon:"🏔️", rating:4.91, reviews:10200,
  gradient:"linear-gradient(160deg,#0c1a38,#1a3070,#2c52ac)",
  accent:"#80b2ec",
  tags:["Eiger North Face Backdrop","213km Jungfrau Region","Train-Access Car-Free Village","Kleine Scheidegg Summit"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Grindelwald-Eiger.jpg/1280px-Grindelwald-Eiger.jpg",
  skiPass:"independent"},
```

**Validation checklist:**
- APs: TRN ✅ CMF ✅ INN ✅ INN ✅ ZRH ✅ — all confirmed in `AIRPORT_COORDS` (line 6967) and `AP_CONTINENT` (lines 371–372)
- IDs: sestriere-it ✅ alpe-dhuez-fr ✅ livigno-it ✅ mayrhofen-at ✅ grindelwald-ch ✅ — all unique, none in the 134-ski catalog
- Tags: all exactly 4 ✅
- Coordinates: spot-checked against OSM for each named feature ✅
- ⚠️ **Photo URLs are Wikimedia Commons links** — verify each renders before pasting; thumbnail generation sometimes fails for newly-uploaded files
- Note: INN serves both Mayrhofen (Zillertal, ~45min drive) and Livigno (~2hr drive via Reschen). Both are standard assignments for Tyrolean/Italian alpine venues in the catalog (consistent with existing `ischgl`, `st-anton-am-arlberg`, `lech-zurs-s27` using INN)
- Note: ZRH (Zürich, ~2.5hr drive + train) is the standard Swiss gateway; consistent with `andermatt`, `engelberg`, `saas-fee-ch`, `st-moritz-ch`, `verbier`, `zermatt` all using ZRH

---

## One Observation for PM

**The VPS redeploy is TODAY's stated deadline (Sep 20, Day 42 — DevOps flagged RED).** From a content standpoint, this is the most impactful single action remaining before any promotion: `forecast_days:14` changes the effective scoring surface for 96 N-hemisphere standard ski venues from a 7-day window to a 14-day window, enabling Fri–Mon scoring for *two* upcoming weekends. With the Alps' first-season snowfall ~4-5 weeks out, that second-weekend window (the Oct 4-5 weekend) starts becoming meaningful in the next few days. If the VPS deploys today, users who visit this week will see early-October ski scores for Hintertux, Saas-Fee, and the lateSeason glacier venues — correct and compelling pre-season content. If it slips further, those windows score at `low` confidence and don't surface on the front page. The backlog of 12 unadded verified venues is a 30-minute paste task; recommend: VPS today → venue paste this session → tag quality sprint before Reddit.
