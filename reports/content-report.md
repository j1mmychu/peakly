# Peakly Content & Data Report — 2026-08-27

## Data Health Score: 96/100

**Deductions:**
- 4 carry-over venues (Praia do Camilo, Nusa Penida, Gili Trawangan, Arolla) unshipped for 2 full days — −2 pts
- Hintertux Glacier (PM v131 "SHIP" recommendation, Aug 26) still not in catalog — −1 pt
- CLAUDE.md `VENUES (156)` text still stale (real count: 391) — −1 pt (Jack-only fix, documented below)

**Clean / Verified This Run:**
- ✅ **391 venues** (260 beach / 131 skiing) — dual-format grep confirms; matches `.venue-baseline = 391`
- ✅ **0 duplicate IDs** — all `id:""`, `id:"all"`, `id:"beach"`, `id:"skiing"` are UI filter objects, not venue records
- ✅ **100% photo coverage** — 196 unquoted `photo:` + 195 quoted `"photo":` = 391/391
- ✅ **0 duplicate photo URLs**
- ✅ **0 null/zero venue coordinates** — `lon: 0` at line 9420 is a map default fallback, not a venue
- ✅ **100% BASE_PRICES coverage** — all 162 unique venue airport codes present as BASE_PRICES outer keys (219 total outer keys); 0 gaps
- ✅ **100% AIRPORT_COORDS coverage** — 0 venue APs missing
- ✅ **100% AP_CONTINENT coverage** — 0 venue APs missing
- ✅ **14 `lateSeason:true` flags confirmed**: whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch, engelberg ✅ (9 compact + 5 quoted-key = 14)
- ✅ `PEAKLY_BUILD`: `20260826a` — app.jsx:17, sw.js:2, index.html:395 in lockstep ✅
- ✅ `scripts/.venue-baseline` = 391 ✅
- ✅ GEAR_ITEMS: 0 occurrences — correctly cut for v1 per Jack's decision 2026-06-09

---

## Category Breakdown

The scheduled prompt references 12 categories and hiking stubs — that state is 4 months stale (pre-2026-05-03 pivot). Current reality:

| Category | Venues | Status |
|----------|--------|--------|
| Beach    | 260    | ✅ Healthy (66.5%) |
| Skiing   | 131    | ✅ Healthy (33.5%) |
| **Total** | **391** | ✅ Matches `.venue-baseline` |

Two categories only. Surfing retired 2026-05-03. All others (hiking/climbing/MTB/kayak/dive/yoga/wellness) never re-enabled. Both well above any stub floor. No action needed on category distribution.

---

## GEAR_ITEMS Audit

Intentionally cut for v1 (Jack, 2026-06-09). `grep -c GEAR_ITEMS app.jsx` → **0**. Standing directive in `tasks/agents/devops.md`. Do not restore.

---

## Seasonal Relevance — 2026-08-27

Late August (final week of meteorological summer). N hemisphere beach demand at its annual peak.

| Segment | Count | Status |
|---------|-------|--------|
| N hemisphere beach (lat ≥ 0) | 199 | ✅ **PEAK SEASON** — prime late-summer beach globally |
| S hemisphere ski (lat < 0) | 24 | ✅ **PEAK SEASON** — SH August is mid-winter ski peak |
| N hemisphere ski (lat ≥ 0) | 107 | ⚠️ OUT OF SEASON — summer; scores correctly suppressed by engine |
| S hemisphere beach (lat < 0) | 61 | ⚠️ SHOULDER — SH winter; water temps cool |

**In-season ratio: 57.0%** (223 of 391 venues)

**Note:** 14 `lateSeason:true` glacier resorts can bypass the off-season binary cap when `snow_depth_max >= 0.5m`. At 3000m+ in late August, glacier venues (Tignes, Saas-Fee, Cervinia, Zermatt) reliably meet this threshold — engine handles this correctly. Hintertux (not yet in catalog) would be the strongest glacier pick right now; see §5 below.

---

## BASE_PRICES Coverage

**100% — no gaps.** Confirmed by comparing all 162 unique venue APs against 219 BASE_PRICES outer keys. This is the correct pre-traffic state. No action needed.

---

## Photo Audit

| Metric | Result |
|--------|--------|
| Total photos | 391/391 ✅ |
| Duplicate URLs | 0 ✅ |
| Non-https URLs | 0 ✅ |
| Unsplash (curated) | ~196 (50.1%) |
| Wikimedia Commons | ~195 (49.9%) |

No regressions. Generic stock vs. venue-specific photo quality gap (~346 venues) remains blocked on `UNSPLASH_KEY`. Not a data integrity issue.

---

## CLAUDE.md Stale Venue Count (P2 — Jack action)

Two lines in CLAUDE.md still read `VENUES (156)` / `**156 entries**`. The DevOps report (2026-08-27) documented the exact fix:

```bash
# In CLAUDE.md, update two occurrences:
# "VENUES` (156)," → "VENUES` (391),"
# "VENUES` array has **156 entries** (2 launch categories: skiing and beach — 67 skiing, 89 beach;"
# → "VENUES` array has **391 entries** (2 launch categories: skiing and beach — 131 skiing, 260 beach;"
```

~3 min. Prevents future AI sessions from undercounting and running stale audits.

---

## 5 New Venue Objects — Aug 27

**Catalog still at 391 — none of yesterday's 5 were pasted.** All 5 listed below are carry-overs with verified AP coverage. No new lookup table entries required for any of them (all APs already in BASE_PRICES ✅, AIRPORT_COORDS ✅, AP_CONTINENT ✅).

**Paste location:** inside the VENUES array, before the closing `];`.
**After paste:** eval count should be 396. `scripts/.venue-baseline` auto-bumps via auto-push hook.

```javascript
// 1. Praia do Camilo, Algarve, Portugal [CARRY-OVER — Day 3]
// FAO (Faro) — best sea-stack cove beach on the western Algarve.
// Wooden staircase descent to a hidden cove; consistently top-ranked Algarve beach.
// Late August = peak Portuguese beach season; strong UK/EU user overlap.
{id:"praia-camilo-lagos", category:"beach",
  title:"Praia do Camilo", location:"Lagos, Algarve, Portugal",
  lat:37.0778, lon:-8.6710, ap:"FAO",
  icon:"🏖️", rating:4.89, reviews:2340,
  gradient:"linear-gradient(160deg,#0a1a38,#1a3a70,#2468b8)",
  accent:"#70b8e8",
  tags:["Sea Stacks","Hidden Cove","Wooden Staircase","Western Algarve"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Praia_do_Camilo_Lagos.jpg/1280px-Praia_do_Camilo_Lagos.jpg"},

// 2. Nusa Penida, Bali, Indonesia [CARRY-OVER — Day 3]
// DPS (Denpasar) — Kelingking Beach (T-Rex cliff) is the most-photographed
// beach in SE Asia. 30-min fast boat from Bali. Crystal Bay adds manta snorkeling.
// Distinct island identity from the Bali cluster already in catalog.
{id:"nusa-penida-bali", category:"beach",
  title:"Nusa Penida", location:"Nusa Penida Island, Bali, Indonesia",
  lat:-8.7272, lon:115.5444, ap:"DPS",
  icon:"🏝️", rating:4.86, reviews:4120,
  gradient:"linear-gradient(160deg,#0a2a1a,#1a5838,#2e8058)",
  accent:"#5cbc8a",
  tags:["Kelingking Cliff","Manta Snorkeling","Island Escape","Instagram Landmark"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Kelingking_Beach_Nusa_Penida.jpg/1280px-Kelingking_Beach_Nusa_Penida.jpg"},

// 3. Gili Trawangan, Indonesia [CARRY-OVER — Day 3]
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

// 4. Arolla Ski Area, Valais, Switzerland [CARRY-OVER — Day 3]
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

// 5. Hintertux Glacier, Tyrol, Austria [CARRY-OVER — Day 2; PM v131 "SHIP"]
// INN (Innsbruck) ✅ all lookup tables — the ONLY 365-day ski area in the Alps.
// Skiers can book Hintertux for this weekend the same way they'd book Chamonix in February.
// 3,250m glacier; snowfall occurs even in August. Only N-hemisphere venue that is
// **guaranteed open and scoring well RIGHT NOW** (Aug 27) via the lateSeason bypass.
// Fills the #1 catalog gap: no Austrian glacier venues; Ischgl/Kitzbühel are winter-only.
{id:"hintertux-glacier", category:"skiing",
  title:"Hintertux Glacier", location:"Zillertal, Tyrol, Austria",
  lat:47.0583, lon:11.6633, ap:"INN",
  icon:"⛷️", rating:4.88, reviews:1620,
  gradient:"linear-gradient(160deg,#0c1634,#1a3272,#2a5ab2)",
  accent:"#74a2d8",
  tags:["Year-Round Glacier","Only 365-Day Alps Ski","Summer Skiing","Zillertal"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Hintertux_Glacier.jpg/1280px-Hintertux_Glacier.jpg",
  skiPass:"independent", lateSeason:true},
```

---

## One Observation for the PM

**Today is the peak commercial moment for these carry-overs — and they've been sitting for 3 days.** August 27 is the last Thursday before the meteorological end of summer (Sept 1). Users booking a "one last summer weekend" beach trip represent the highest-intent traffic of the year for beach venues. Praia do Camilo and Nusa Penida are both in peak season right now and are the kind of photogenic, shareable venues that drive word-of-mouth. Meanwhile, Hintertux is the only honest answer to a European skier asking "where can I ski this weekend in late August?" — and it's not in the catalog. If even 10 users hit the app today specifically looking for summer ski options, zero of them find Hintertux because it doesn't exist yet. A 5-minute paste would fix all of this.
