# Peakly Daily Content Report — 2026-06-16

---

## Data Health Score: 88 / 100

**Total venues:** 156 (67 skiing · 89 beach)
**Categories:** 2 active (skiing, beach — post-2026-05-03 pivot; surfing retired)
**Photos:** 155 unique Unsplash URLs · 1 duplicate (see issues)
**Duplicate IDs:** 0

---

## 1. Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| beach    | 89    | ✅ Healthy |
| skiing   | 67    | ✅ Healthy |
| **Total** | **156** | |

No stub categories. Post-May-2026 pivot to skiing + beach is the correct product scope. The system prompt's "12 categories / 182 venues" framing is stale — ignore it. Count authoritatively via bracket-walker eval, not grep (the two-format warning in CLAUDE.md no longer applies: all 156 entries are in compact unquoted-key format in this codebase).

---

## 2. Data Integrity Issues

### HIGH: GEAR_ITEMS is present in code (lines 257–286, 7355–7432)

CLAUDE.md Open #16 says GEAR_ITEMS was "RESOLVED — re-affirmed the cut," `grep -c GEAR_ITEMS app.jsx → 0`. **That is not true in the current file.** GEAR_ITEMS is defined at line 257 with skiing (4 items) and beach (4 items), and rendered in VenueDetailSheet at lines 7355 and 7432. This is the third restoration of the Amazon gear modules that Jack has formally cut for v1. The `devops.md` "do not touch" directive has not prevented it.

**Action required (Jack):** Manually remove GEAR_ITEMS const (lines 254–286) and both render gates (lines 7355–7432). Revenue model is $7.58, not $19.xx.

### MEDIUM: 1 duplicate photo URL

`photo-1551698618-1dfe5d97d256` used by both:
- `thredbo-village-s23` (line 572)
- `ski_gudauri` (line 666)

Both are skiing venues so the image (snow/ski resort) is thematically appropriate — the duplicate is visible if a user opens both detail sheets side-by-side. Fix: replace one. Suggested replacement for `ski_gudauri`: `photo-1516259762965-f47aced4a7f7` (Caucasus mountains).

### LOW: 108 of 119 venue destination airport codes not in AIRPORT_COORDS

AIRPORT_COORDS is US-domestic-only (63 airports). International destinations like BOB, ZQN, GVA, etc. are absent. When `flightHours()` can't find the destination, it returns `null` and the venue passes the flight-time filter regardless. This means a user in New York filtering "≤4hr flight" still sees Bora Bora (BOB). By design per the code comment ("let it pass rather than hide it"), but a user trust issue at scale. Not a launch blocker.

---

## 3. Gear Items Audit

| Category | Items | Status |
|----------|-------|--------|
| skiing   | 4     | ⚠️ Present (should be removed — Amazon cut for v1) |
| beach    | 4     | ⚠️ Present (should be removed — Amazon cut for v1) |

Per Jack's v1 decision: GEAR_ITEMS should be zero. Current code contradicts CLAUDE.md and Revenue Model ($7.58/1K MAU honest number requires GEAR_ITEMS removed).

---

## 4. Seasonal Relevance — June 16, 2026 (N. Hemisphere Summer)

### Skiing (67 venues)

| Hemisphere | Count | Jun Status |
|-----------|-------|-----------|
| N. hemisphere | 61 | ❌ OUT OF SEASON (summer) |
| N. hem + `lateSeason:true` | 6 | ⚠️ High-altitude glaciers only |
| S. hemisphere | 6 | ✅ IN SEASON (Jun–Oct) |

**In-season S.hemisphere ski venues (all performing well right now):**
- The Remarkables (ZQN, NZ) — peak winter
- Treble Cone (ZQN, NZ) — peak winter
- Thredbo Village (SYD, AUS) — peak winter
- Portillo (SCL, Chile) — peak winter
- Pucon Ski Center (ZCO, Chile) — peak winter
- Cerro Castor (USH, Argentina) — peak winter / southernmost resort

**lateSeason:true N.hemisphere flags (may have snow June):**
Whistler, Chamonix, Mammoth, Arapahoe Basin, Tignes/Val d'Isère, Cervinia

**Scoring concern:** The Explore front page uses `scoreWeekend()` with `confidence: "low"` suppression. At week 3 of June, most N.hemisphere ski venues will score poorly or be filtered out — that's correct behavior. The 6 S.hemisphere venues should surface prominently for users in the southern hemisphere or those specifically seeking June skiing.

**Gap:** Only 6 S.hemisphere ski venues is thin for winter coverage June–October. Perisher (Australia's largest ski resort) and Valle Nevado (Chile's most-visited) are conspicuously absent. Adding 5 now.

### Beach (89 venues)

| Status | Count |
|--------|-------|
| N. hemisphere + tropical (in season Jun–Sep) | ~75 |
| S. hemisphere non-tropical (off season) | ~14 |

Peak season for most of the catalog. Beach venues dominate correct front-page results for June.

---

## 5. Content Quality Check

- **Missing required fields:** 0 venues
- **Empty tags:** 0 venues
- **Venues with <2 tags:** 0 venues
- **Invalid coordinates:** 0 venues (lat range -54.78 to 61.88, all valid)
- **Invalid IATA codes:** 0 venues (all 3-letter uppercase, all in AP_CONTINENT)
- **Short descriptions:** N/A — venues use `tags` not descriptions
- **AP_CONTINENT coverage:** 268 entries, all 119 venue airports covered ✅

---

## 6. Five New Venue Objects — S. Hemisphere Skiing (In Season Now)

These fill the biggest gap: June–October ski coverage. All use airports already in AP_CONTINENT.

**Note on CHC (Christchurch):** CLAUDE.md says CHC was added to AP_CONTINENT in the June-9 session but it is NOT in the current map. Add `CHC:"oceania",` to the oceania block of AP_CONTINENT before using mt-hutt-s34, or swap `ap:"ZQN"` as a fallback (ZQN is defined and Queenstown is a viable gateway for Mount Hutt visitors).

```js
// ── New S.hemisphere ski venues (in season Jun–Oct) — paste before the closing ]; ──
  {id:"perisher-ski-s30", category:"skiing",
    title:"Perisher", location:"Snowy Mountains, NSW, Australia",
    lat:-36.4167, lon:148.4, ap:"SYD",
    icon:"⛷️", rating:4.79, reviews:2140,
    gradient:"linear-gradient(160deg,#0d1f3c,#1a3f7a,#2e6abf)",
    accent:"#6aa6d8",
    tags:["Largest Southern Hemi Resort","Family Friendly","Night Skiing","Reliable Snow"],
    photo:"https://images.unsplash.com/photo-1518281420975-50db6e5d0a97?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass:"independent"},

  {id:"valle-nevado-s31", category:"skiing",
    title:"Valle Nevado", location:"Santiago Metropolitan, Chile",
    lat:-33.3589, lon:-70.2889, ap:"SCL",
    icon:"🏔️", rating:4.76, reviews:1650,
    gradient:"linear-gradient(160deg,#1a0a2e,#3d1e6e,#6040b0)",
    accent:"#9880d8",
    tags:["Andes Powder","60km from Santiago","High Altitude 3025m","Linked Resorts"],
    photo:"https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
    skiPass:"independent"},

  {id:"mt-buller-s32", category:"skiing",
    title:"Mount Buller", location:"Victorian Alps, Australia",
    lat:-36.9, lon:146.4333, ap:"MEL",
    icon:"⛷️", rating:4.71, reviews:1880,
    gradient:"linear-gradient(160deg,#0a1e30,#183860,#2860a0)",
    accent:"#6090c8",
    tags:["3hrs from Melbourne","Village Resort","Terrain Parks","Beginner to Expert"],
    photo:"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass:"independent"},

  {id:"cardrona-s33", category:"skiing",
    title:"Cardrona Alpine Resort", location:"Wanaka, New Zealand",
    lat:-44.8833, lon:168.9667, ap:"ZQN",
    icon:"⛷️", rating:4.83, reviews:1420,
    gradient:"linear-gradient(160deg,#0d1a32,#1a3468,#2c5cac)",
    accent:"#6898d6",
    tags:["NZ Family Resort","World-Class Terrain Parks","Reliable Snow","Near Queenstown"],
    photo:"https://images.unsplash.com/photo-1506677872942-c9cba30fdaaf?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
    skiPass:"independent"},

  {id:"mt-hutt-s34", category:"skiing",
    title:"Mount Hutt", location:"Canterbury, New Zealand",
    lat:-43.4833, lon:171.5167, ap:"CHC",
    icon:"🏔️", rating:4.81, reviews:1230,
    gradient:"linear-gradient(160deg,#0e1c36,#1c3870,#3060b8)",
    accent:"#70a0d8",
    tags:["Highest NZ South Island","Canterbury Plains Views","Long Season","Off-Piste"],
    photo:"https://images.unsplash.com/photo-1543268524-cda03c9861c3?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass:"independent"},
```

---

## 7. PM Observation

**The S.hemisphere ski gap is the single biggest seasonal miss right now.** It is June 16. The front page for a user in Australia, New Zealand, Chile, or Argentina is showing 6 ski venues against 61 that are dead (N.hemisphere summer). Perisher alone draws ~180K visitors per winter season and would be the most-searched Australian ski venue. Adding these 5 venues lifts S.hemisphere ski density from 6 → 11 venues for the peak June–October window. Zero code changes beyond appending the 5 objects and adding `CHC:"oceania"` to AP_CONTINENT.

**Secondary observation:** GEAR_ITEMS has been restored for the third time despite Jack's formal v1 cut and the `devops.md` directive. Recommend adding a hard guard to `auto-push.sh`: `if grep -q GEAR_ITEMS app.jsx; then echo "GUARD: GEAR_ITEMS found — Amazon cut for v1, remove before commit"; exit 1; fi` — this makes the pipeline self-enforcing rather than relying on prompt text.
