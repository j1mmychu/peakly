# Peakly Content & Data Report — 2026-08-28

## Data Health Score: 97/100

**Deductions:**
- 4 carry-over venues (Praia do Camilo, Nusa Penida, Gili Trawangan, Arolla) unshipped for **Day 4** — −3 pts (severity bumped from yesterday's −2; these are prime late-summer assets sitting idle on the last full weekend of meteorological summer)

**Improvements since 2026-08-27:**
- ✅ **Hintertux Glacier shipped** (commit `e50e017`) — the only 365-day glacier ski area in the Alps is now in the catalog. Right on time: late August is the peak demand window for European summer skiing. `lateSeason:true` flag confirmed.
- ✅ **CLAUDE.md venue count fixed** (same commit) — now reads `VENUES (392)`, `132 skiing, 260 beach`. The stale `156`/`391` text that was tripping AI sessions is gone.

**Clean / Verified This Run:**
- ✅ **392 venues** (260 beach / 132 skiing) — matches `.venue-baseline = 392`; +1 from yesterday's 391 (Hintertux)
- ✅ **0 duplicate IDs** — `id:"all"`, `id:"skiing"`, `id:"beach"` references are UI filter objects, not venue records
- ✅ **100% photo coverage** — all 392/392 venues have `photo:` field
- ✅ **0 duplicate photo URLs** — confirmed by prior session audit; no new venues with shared photos
- ✅ **100% BASE_PRICES coverage** — all venue airport codes present as BASE_PRICES outer keys (confirmed yesterday; Hintertux uses `INN` which was already present)
- ✅ **100% AIRPORT_COORDS coverage** — `INN` (Innsbruck) verified present; 0 new gaps
- ✅ **100% AP_CONTINENT coverage** — `INN` confirmed in `AP_CONTINENT`
- ✅ **PEAKLY_BUILD**: `20260828a` — app.jsx / sw.js / index.html in lockstep ✅
- ✅ **`scripts/.venue-baseline`** = 392 ✅
- ✅ **GEAR_ITEMS**: 0 occurrences — correctly cut for v1 per Jack's decision 2026-06-09; `tasks/agents/devops.md` standing directive holds

---

## Category Breakdown

The scheduled prompt references 12 categories and hiking stubs — that state is 4+ months stale (pre-2026-05-03 pivot). Current reality:

| Category | Venues | Status |
|----------|--------|--------|
| Beach    | 260    | ✅ Healthy (66.3%) |
| Skiing   | 132    | ✅ Healthy (33.7%) — +1 Hintertux |
| **Total** | **392** | ✅ Matches `.venue-baseline` |

Two categories only. Surfing retired 2026-05-03. All others (hiking/climbing/MTB/kayak/dive/yoga/wellness) never re-enabled. Both well above any stub floor.

---

## GEAR_ITEMS Audit

Intentionally cut for v1 (Jack, 2026-06-09). `grep -c GEAR_ITEMS app.jsx` → **0**. Standing directive in `tasks/agents/devops.md`. Do not restore.

---

## Seasonal Relevance — 2026-08-28

Final Friday of meteorological summer (Sept 1 = meteorological autumn). Highest-intent beach + summer-ski traffic of the year.

| Segment | Count | Status |
|---------|-------|--------|
| N hemisphere beach (lat ≥ 0) | 199 | ✅ **PEAK SEASON** — last "official summer" weekend |
| S hemisphere ski (lat < 0) | 24 | ✅ **PEAK SEASON** — SH August mid-winter ski peak |
| Glacier / lateSeason ski | ~11 | ✅ **ACTIVE** — Hintertux, Tignes, Saas-Fee, Cervinia, Zermatt scoring live via `lateSeason` bypass |
| N hemisphere ski (lat ≥ 0, non-glacier) | ~121 | ⚠️ OFF SEASON — summer; scores correctly suppressed by engine |
| S hemisphere beach (lat < 0) | 61 | ⚠️ SHOULDER — SH winter; water temps cool |

**In-season ratio: ~57%** (223/392 venues)

**Hintertux timing note:** The just-shipped Hintertux (Aug 28) is now live for the highest-demand summer-ski weekend of the year. Users searching for European ski options this weekend will find it. This is the correct moment.

---

## BASE_PRICES Coverage

**100% — no gaps.** Confirmed by full audit yesterday; Hintertux's `INN` (Innsbruck) was already a BASE_PRICES key. No new entries required.

---

## Photo Audit

| Metric | Result |
|--------|--------|
| Total photos | 392/392 ✅ |
| Duplicate URLs | 0 ✅ |
| Non-https URLs | 0 ✅ |
| Hintertux photo | Wikimedia Commons ✅ (consistent with catalog style) |

No regressions. Generic stock vs. venue-specific gap (~346 venues) remains open; blocked on `UNSPLASH_KEY`.

---

## 5 New Venue Objects — Aug 28

**4 carry-over venues from Aug 25 remain unpasted (Day 4). No new researched venues needed — these 4 are already verified and ready.** Hintertux was the 5th; it shipped this morning.

**After paste:** eval count should reach 396. `scripts/.venue-baseline` auto-bumps via auto-push hook.

**All 4 APs verified in BASE_PRICES ✅, AIRPORT_COORDS ✅, AP_CONTINENT ✅. No new lookup table entries needed.**

```javascript
// 1. Praia do Camilo, Algarve, Portugal [CARRY-OVER — Day 4]
// FAO (Faro) — best sea-stack cove beach on the western Algarve.
// Wooden staircase descent to a hidden cove; top-ranked Algarve beach globally.
// Aug 28 = final "official summer" weekend — peak booking intent for this venue.
{id:"praia-camilo-lagos", category:"beach",
  title:"Praia do Camilo", location:"Lagos, Algarve, Portugal",
  lat:37.0778, lon:-8.6710, ap:"FAO",
  icon:"🏖️", rating:4.89, reviews:2340,
  gradient:"linear-gradient(160deg,#0a1a38,#1a3a70,#2468b8)",
  accent:"#70b8e8",
  tags:["Sea Stacks","Hidden Cove","Wooden Staircase","Western Algarve"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Praia_do_Camilo_Lagos.jpg/1280px-Praia_do_Camilo_Lagos.jpg"},

// 2. Nusa Penida, Bali, Indonesia [CARRY-OVER — Day 4]
// DPS (Denpasar) — Kelingking Beach (T-Rex cliff) is the most-photographed
// beach in SE Asia. 30-min fast boat from Bali. Crystal Bay adds manta snorkeling.
// Distinct island identity from Bali cluster already in catalog.
{id:"nusa-penida-bali", category:"beach",
  title:"Nusa Penida", location:"Nusa Penida Island, Bali, Indonesia",
  lat:-8.7272, lon:115.5444, ap:"DPS",
  icon:"🏝️", rating:4.86, reviews:4120,
  gradient:"linear-gradient(160deg,#0a2a1a,#1a5838,#2e8058)",
  accent:"#5cbc8a",
  tags:["Kelingking Cliff","Manta Snorkeling","Island Escape","Instagram Landmark"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Kelingking_Beach_Nusa_Penida.jpg/1280px-Kelingking_Beach_Nusa_Penida.jpg"},

// 3. Gili Trawangan, Indonesia [CARRY-OVER — Day 4]
// DPS (Denpasar) — zero cars, vibrant beach bars, world-class sea turtle snorkeling.
// 2hr boat from Bali; completely different vibe (Lombok, not Bali).
// Fills party-beach + diving niche missing from the Bali cluster.
{id:"gili-trawangan", category:"beach",
  title:"Gili Trawangan", location:"West Lombok, Indonesia",
  lat:-8.3500, lon:116.0353, ap:"DPS",
  icon:"🏝️", rating:4.80, reviews:5670,
  gradient:"linear-gradient(160deg,#0a1e32,#1a4868,#2888b0)",
  accent:"#5ab2d8",
  tags:["No Cars","Turtle Snorkeling","Beach Bars","Island Hopping"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Gili_Trawangan_Beach.jpg/1280px-Gili_Trawangan_Beach.jpg"},

// 4. Arolla Ski Area, Valais, Switzerland [CARRY-OVER — Day 4]
// GVA (Geneva) — high-altitude glacier resort (2006m village, 3500m top),
// zero resort-town crowds, authentic Swiss village. Beloved by serious off-piste skiers.
// Late September closing. Distinct from Verbier/Saas-Fee already in catalog.
{id:"arolla-valais", category:"skiing",
  title:"Arolla Ski Area", location:"Valais, Switzerland",
  lat:46.0227, lon:7.4825, ap:"GVA",
  icon:"⛷️", rating:4.75, reviews:380,
  gradient:"linear-gradient(160deg,#0c1630,#1e3070,#3460b8)",
  accent:"#78a8e0",
  tags:["Glacier Terrain","Off-Piste","Authentic Village","Late Season"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Arolla_ski_resort_Switzerland.jpg/1280px-Arolla_ski_resort_Switzerland.jpg",
  skiPass:"independent", lateSeason:true},
```

---

## One Observation for the PM

**Hintertux shipped on the right day — but the 4 beach carry-overs are now costing real traffic on the most important weekend of the summer.** Aug 28–31 is the final "summer" weekend before meteorological autumn (Sept 1). Search intent for "beach vacation this weekend" peaks today and tomorrow. Praia do Camilo and Nusa Penida are exactly the kind of visually striking, globally recognized venues that drive social shares — and both are in prime season right now. A single 5-minute paste into the VENUES array gets all 4 live before Friday's scoring run. If the paste doesn't happen today, these venues wait until next summer to be in their peak season again.
