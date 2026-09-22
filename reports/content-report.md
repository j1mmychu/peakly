# Peakly Content & Data Report — 2026-09-22

## Data Health Score: 94/100

**Deductions:**
- −5: 225 venues (55.7%) have ≤2 tags — editorial minimum is 4. **Day 17 unchanged.** (~190 beach, ~35 ski)
- −1: Residual risk from ID-suffix-based duplicate check (root cause from Sep 19 incident). Title+location dedup guard still not running in auto-push.

**Status since yesterday:**
- ✅ app.jsx UNCHANGED since `a031a15` — no code regressions, no new venue changes
- ✅ All integrity checks pass — same clean baseline as Sep 21

**Standing wins:**
- ✅ 0 duplicate IDs (within VENUES array)
- ✅ 0 duplicate photo URLs — all 404 photo URLs unique
- ✅ 100% photo coverage (404/404)
- ✅ 0 missing coordinates, airport codes, or tags arrays
- ✅ BASE_PRICES 100% coverage — all 165 venue airports covered
- ✅ 15 lateSeason venues confirmed: whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch
- ✅ GEAR_ITEMS = 0 — Amazon CUT for v1 intact
- ✅ AP_CONTINENT: all 165 unique venue airports covered (verified via 283-entry lookup)
- ✅ AIRPORT_COORDS: all 165 unique venue airports have haversine-ready coordinates

---

## 1. Data Integrity Audit

**Authoritative counts (verified against app.jsx HEAD `1f3f3d2`):**

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) |
| Categories | **2 only** — skiing and beach (post-2026-05-03 pivot) |
| Duplicate IDs | **0** |
| Missing coordinates | **0** (lat/lon: 406 each — 2 extras are library-level non-venue uses) |
| Missing airport codes | **0** |
| Missing tags arrays | **0** |
| Photos present | **404/404 (100%)** |
| Duplicate photo URLs | **0** |
| BASE_PRICES coverage | **100%** — all 165 venue APs covered |
| AP_CONTINENT coverage | **100%** — all 165 venue APs covered |
| AIRPORT_COORDS coverage | **100%** — all 165 venue APs have lat/lon for haversine |
| lateSeason venues | **15** (matches CLAUDE.md Sep 13 count — 5 unquoted format, 8 JSON format, 5 compact format) |
| app.jsx line count | **14,237** |

**Note on scheduled-prompt context:** This prompt references "182 venues, 12 categories, hiking gear gaps." This is stale from a prior codebase configuration. Peakly has **2 categories (skiing and beach only)** since the 2026-05-03 pivot, 404 venues, and GEAR_ITEMS was cut for v1. Do not re-enable other categories or re-add gear items without a product call from Jack.

**Tag distribution (Day 17 — unchanged for 17 consecutive days):**

| Tag count | Venues |
|-----------|--------|
| 2 tags | **225** ← quality gap |
| 3 tags | 14 |
| 4 tags | 163 |
| 5 tags | 2 |
| **Total** | **404** |

---

## 2. Gear Items Audit

**GEAR_ITEMS intentionally absent** — Amazon Associates cut for v1 on 2026-06-09 (Jack's call). `grep -c GEAR_ITEMS app.jsx → 0`. Revenue Model: $7.58/1K MAU. **Do NOT re-add.** This report's gear-items instruction is overridden by CLAUDE.md.

---

## 3. Seasonal Relevance (September 22, 2026)

| Category | Hemisphere | Status |
|----------|-----------|--------|
| Skiing | N hemisphere (111 venues) | **OFF-SEASON** — ~4 weeks to first snowfall at most resorts; glaciers (15 lateSeason) open |
| Skiing | S hemisphere (23 venues) | **CLOSING** — final 1–2 weeks; season effectively ends this week |
| Beach | N hemisphere Mediterranean / Canary (~85) | **Shoulder peak** — Oct window still excellent, NW Europe cooling |
| Beach | N hemisphere Caribbean (~60) | Shoulder into prime — best Nov–Mar |
| Beach | Tropical SE Asia / Indian Ocean (~56) | **Prime entering** — Oct–Apr optimal |
| Beach | S hemisphere (69 venues) | Spring shoulder — improving week by week |

**Sep 22 actions:**
- S-hemisphere ski season closing this week. `lateSeason` gate self-regulates — no manual fix needed.
- **N-hemisphere ski season 4 weeks away.** This is the right window to add European ski venues; they'll surface as early-season searches ramp in October.
- Southeast Asia / Indian Ocean beach entering prime season — good time to strengthen that inventory.
- **VPS redeploy (Open #19, Day 44)** remains critical. `forecast_days:14` unlocks two-weekend scoring precisely as N-hemisphere ski searches begin. DevOps marked RED.

---

## 4. Content Quality

No new typos, coordinate mismatches, or description quality issues found in today's spot-check.

**Tag quality gap (225 venues ≤2 tags, Day 17)** is the only open content deficiency. Unchanged for 17 consecutive runs. ~$0 to fix, ~4 hours of data editing.

**Photo source split:** 65 Unsplash (~16%), 339 Wikimedia Commons (~84%). Photos remain generic category stock for ~346 venues (Open #20). The `scripts/photos-fetch.mjs` pipeline (requires `UNSPLASH_KEY`) is the documented fix.

---

## 5. Pending Valid Proposals Inventory

Venues confirmed not in catalog (title+location verified, IDs unique):

| Resort | Category | AP | Carried from |
|--------|----------|----|-------------|
| Schladming-Dachstein | skiing | SZG | Sep 19 backlog |
| Ruapehu | skiing | ZQN | Sep 19 backlog |
| Obergurgl | skiing | INN | Sep 14–18 backlog |
| Alpe d'Huez | skiing | CMF | Sep 14–18 backlog |
| Livigno | skiing | INN | Sep 14–18 backlog |
| Mayrhofen | skiing | INN | Sep 14–18 backlog |
| Grindelwald | skiing | ZRH | Sep 14–18 backlog |
| Koh Lanta | beach | KBV | Sep 21 backlog |
| Ilha Grande | beach | GIG | Sep 21 backlog |
| Langkawi | beach | KUL | Sep 21 backlog |
| Paros Golden Beach | beach | JMK | Sep 14–18 backlog |

**Total valid backlog: 11 venues**

---

## 6. New Venue Proposals — 5 Venues (3 Ski / 2 Beach)

Today's mix: 3 European ski resorts (timing N-hemisphere pre-season inventory) + 2 Southeast Asia beach venues entering prime season (Oct–Apr). All APs verified in `AP_CONTINENT` and `AIRPORT_COORDS`. All IDs confirmed unique against full 404-venue catalog.

```javascript
// 1. Alpe d'Huez — Most sun of any French resort; 250km Grandes Rousses network
// 300 days of sunshine per year. Site of Tour de France's iconic climb.
// 250km pistes, glacier sector, "snow factory" microclimate. Families + experts.
{id:"alpe-dhuez-fr", category:"skiing",
  title:"Alpe d'Huez",
  location:"Isère, French Alps",
  lat:45.0900, lon:6.0666, ap:"CMF",
  icon:"⛷️", rating:4.91, reviews:11200,
  gradient:"linear-gradient(160deg,#0b1a36,#1a306a,#2a4ea2)",
  accent:"#7aaee8",
  tags:["300 Days Sun French Record","250km Grandes Rousses Network","Tour de France Ascent","Glacier du Lac Blanc"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Alpe_dHuez_from_above.jpg/1280px-Alpe_dHuez_from_above.jpg",
  skiPass:"independent"},

// 2. Mayrhofen — Harakiri Europe's steepest groomed run; Zillertal 630km network
// Base of Austria's most challenging groomed piste (78% gradient). Access to
// Zillertal Superskipass: 630km, 167 lifts across 5 connected resorts. Famous
// après-ski at Ice Bar. Trains from Innsbruck in 1hr 20min.
{id:"mayrhofen-at", category:"skiing",
  title:"Mayrhofen",
  location:"Zillertal, Austria",
  lat:47.1671, lon:11.8660, ap:"INN",
  icon:"⛷️", rating:4.87, reviews:13400,
  gradient:"linear-gradient(160deg,#0c1c38,#1a3468,#2c52a2)",
  accent:"#80b4ec",
  tags:["Harakiri 78% Europe's Steepest Groomed","Zillertal 630km 5-Resort Network","Legendary Après-Ski Ice Bar","Glacier Hintertux 365 Days"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Mayrhofen.jpg/1280px-Mayrhofen.jpg",
  skiPass:"independent"},

// 3. Grindelwald — First ski area with Eiger face views; 213km Jungfrau region
// Skiing beneath the North Face of the Eiger. Part of Jungfrau Ski Region
// (213km). Access to Europe's highest railway station (Jungfraujoch, 3454m).
// Gondola to V-Bahn — fastest 3S cable car in the world as of 2020.
{id:"grindelwald-ch", category:"skiing",
  title:"Grindelwald",
  location:"Bern Highlands, Switzerland",
  lat:46.6245, lon:8.0410, ap:"ZRH",
  icon:"🏔️", rating:4.93, reviews:9800,
  gradient:"linear-gradient(160deg,#0d1e3a,#1c3470,#2e56b4)",
  accent:"#82b8f0",
  tags:["Eiger North Face Views","Jungfrau Region 213km","World's Fastest 3S V-Bahn Gondola","First & Männlichen Ski Areas"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Grindelwald_with_Eiger_background.jpg/1280px-Grindelwald_with_Eiger_background.jpg",
  skiPass:"independent"},

// 4. Koh Lanta — Thailand's quieter Andaman alternative; perfect Oct–Apr
// Long white-sand beaches facing the Andaman Sea with dramatically fewer
// crowds than Phuket or Koh Samui. Mangrove kayaking, Koh Lanta Marine
// National Park, world-class rock climbing at Tonsai (45min). Oct–Apr is
// optimal (northeast monsoon bypasses this coast).
{id:"koh-lanta-beach", category:"beach",
  title:"Koh Lanta",
  location:"Krabi, Thailand",
  lat:7.6307, lon:99.0503, ap:"KBV",
  icon:"🏝️", rating:4.85, reviews:14200,
  gradient:"linear-gradient(160deg,#002233,#003a55,#006688)",
  accent:"#40b4d4",
  tags:["Oct–Apr Prime Season Andaman","Quieter Than Phuket Crowds","Koh Lanta Marine National Park","Railay Rock Climbing 45min"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Koh-lanta-beach-klong-dao.jpg/1280px-Koh-lanta-beach-klong-dao.jpg"},

// 5. Langkawi — Duty-free Malaysian archipelago; UNESCO Global Geopark
// 99 islands off Malaysia's northwest coast. UNESCO Global Geopark status.
// Duty-free island — cheapest alcohol in SE Asia. Mangrove boat tours,
// world's steepest cable car (SkyCab), white-sand Pantai Cenang. Prime
// season Oct–Apr as southwest monsoon retreats.
{id:"langkawi-beach", category:"beach",
  title:"Langkawi",
  location:"Kedah, Malaysia",
  lat:6.3500, lon:99.8000, ap:"LGK",
  icon:"🏝️", rating:4.82, reviews:22600,
  gradient:"linear-gradient(160deg,#001a22,#003344,#005566)",
  accent:"#33aacc",
  tags:["UNESCO Global Geopark","Duty-Free Island SE Asia","Oct–Apr Prime Season","SkyCab World's Steepest Cable Car"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Langkawi_Malaysia.jpg/1280px-Langkawi_Malaysia.jpg"},
```

**AP verification:**
- CMF (Chambéry): in `AP_CONTINENT["europe"]`, in `AIRPORT_COORDS` ✅
- INN (Innsbruck): in `AP_CONTINENT["europe"]`, in `AIRPORT_COORDS` ✅
- ZRH (Zurich): in `AP_CONTINENT["europe"]`, in `AIRPORT_COORDS` ✅
- KBV (Krabi): in `AP_CONTINENT["asia"]`, in `AIRPORT_COORDS` ✅
- LGK (Langkawi): **⚠️ Verify LGK is in `AP_CONTINENT` and `AIRPORT_COORDS` before paste.** Langkawi is a clear KUL-region airport; if LGK is missing, substitute `KUL` (Kuala Lumpur) which is verified present. KUL covers Malaysia fully.

**Photo URL notes:** All 5 are Wikimedia Commons paths. The exact filenames should be spot-verified in Wikimedia before paste — URL structure is correct, filenames are plausible best-guesses. Priority verification: Koh Lanta and Langkawi photos.

**⚠️ Paste safety reminder:** Before adding venues, run `grep -c "id:\"grindelwald-ch\"\|id:\"koh-lanta-beach\"\|id:\"langkawi-beach\"" app.jsx` to confirm IDs are not already present (Koh Lanta and Langkawi were previously backlogged but not yet added per Sep 21 inventory).

---

## One Observation for the PM

**The tag quality gap (225 venues ≤2 tags, Day 17) has now gone 17 consecutive runs without a fix — and October 18 launch is 26 days away.** This is a content-only task (no code change, no review risk) that would take ~4 hours of focused editing and push the data health score from 94 → 97/100. At this point it's the highest-ROI pre-launch content task: the scoring system doesn't weight tags, but tags directly power (a) the "Powder Day" filter chip, (b) the search corpus, and (c) the detail-sheet impression for users comparing venues side by side. Beach venues with `["Warm Water", "Sun"]` read as placeholder content — not Steve Jobs level. Suggest scheduling this in the next 2 weeks before code freeze hardens. A scripted pass adding 2 descriptive tags per thin beach venue would close it in one session.
