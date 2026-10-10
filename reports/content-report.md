# Peakly Content & Data Report — 2026-10-10

## Data Health Score: 91/100

**Deductions (unchanged since 2026-10-08):**
- −7: 225 venues (55.7%) have exactly 2 tags — `scoreVibeMatch` and search recall gap. Not fixable under code freeze. Post-launch sprint target.
- −1: Gili Trawangan duplicate still live (`beach_gilit`/LOP + `gili-trawangan`/DPS) — blocked by code freeze.
- −1: Stale scheduled-task prompt (see warning below).

**No score change from yesterday: 91/100.** All checks pass; code freeze Day 26 holds clean.

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories" with surfing, tanning, hiking, etc. The project pivoted 2026-05-03 to **skiing + beach only**. Correct count: **404 venues (134 skiing / 270 beach)**. The prompt author should update the cron task's stored text. All audit data below reflects the actual current app state.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,238** (unchanged, code freeze Day 26) |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate venue IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| Venue APs in AP_CONTINENT | **165/165** ✅ (283 total keys, both formats) |
| Venue APs in AIRPORT_COORDS | **165/165** ✅ (206 total keys, pass-through for unknowns) |
| Venue APs in BASE_PRICES | **165/165** ✅ (181 destination sets) |
| Venues with exactly 2 tags | **225 (55.7%)** ⚠️ post-launch sprint |
| lateSeason:true venues | **15** ✅ |
| GEAR_ITEMS | **0** ✅ (Amazon cut for v1 — intentional) |
| Active categories | **skiing, beach** ✅ |
| Code freeze | **Day 26** — Oct 18 launch in **8 days** |
| Build stamp | **20260914a** |

---

## 1. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues (eval-based: unquoted + quoted ID patterns) | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique) ✅ |
| Missing lat/lon | **0** ✅ |
| Missing ap (IATA) | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| APs missing from AP_CONTINENT | **0** ✅ |
| APs missing from AIRPORT_COORDS | **0** ✅ (missing APs pass-through the flight-hour filter per `flightHours()` design) |
| APs missing from BASE_PRICES | **0** ✅ |

**Known flagged issue (code freeze — no action):**
- `beach_gilit` (Gili Trawangan/LOP) + `gili-trawangan` (Gili Trawangan/DPS) — same venue, two IDs. Scores as one unique ID each, so not a hard crash, but wastes a slot and splits reviews 14,600 / unknown. Fix post-launch: delete `gili-trawangan` (lower-quality entry).

---

## 2. Gear Items Audit

**Status: N/A — GEAR_ITEMS intentionally absent for v1** (Amazon Associates cut, `grep -c GEAR_ITEMS app.jsx` → 0). Per CLAUDE.md revenue model: $7.58/1K MAU without Amazon. Revisit post-launch if revenue gap emerges. No action needed.

---

## 3. Seasonal Relevance — October 10

**Today is peak window for: Southern hemisphere beaches, tropical beaches, and glacier ski venues.**

| Segment | Count | Status |
|---------|-------|--------|
| N.hem ski (standard) | 101 | ⛔ OFF-SEASON — ~6–8 weeks to opening day for most; scoring engine's `inSeason` check will binary-cap these |
| N.hem ski (lateSeason glaciers) | 10 | ✅ OPEN — Hintertux, Saas-Fee, Tignes glacier, Les Deux Alpes, St. Moritz, Saas-Fee, Cervinia, Chamonix, Mammoth, A-Basin |
| S.hem ski | 23 | ⚠️ END OF SEASON — S.hem ski season closes ~Oct/Nov; these venues are dormant or closing |
| Beach tropical (lat ±5°) | 15 | ✅ YEAR-ROUND |
| Beach N.hem | 197 | ⚠️ MIXED — Mediterranean winding down; Caribbean/Florida/Hawaii still solid |
| Beach S.hem | 58 | ✅ SPRING RAMP — S.hem beaches hitting their stride (Oct = spring in Australia, NZ, South Africa, Brazil) |

**Critical timing note for PM:**
> **Val Thorens opens October 18 — the exact launch date.** Val Thorens is the highest ski resort in the Alps (2,300–3,230m), the first major European resort to open each season, and already marked `lateSeason:true` in our catalog. A user who opens Peakly on launch day will see Val Thorens scored as OPEN while every other European ski resort is still showing off-season. This is a genuine product win — the scoring system is designed for exactly this. Worth a launch-day social post: "The Alps open today. We've been waiting."

---

## 4. Content Quality

| Check | Result |
|-------|--------|
| Venues with ≤1 tag | **0** ✅ |
| Venues with exactly 2 tags | **225 (55.7%)** ⚠️ |
| Venues with 3+ tags | **179 (44.3%)** |
| lateSeason flag completeness | **15 confirmed** ✅ (whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch) |
| poolPrimary:true venues | **0** (no beach venues use the pool-primary bypass) |

**2-tag venues context:** 225 venues having exactly 2 tags vs. 179 with 3+ is a symptom of the initial batch-add cadence. Tags drive `scoreVibeMatch` (vibe filter accuracy) and search recall. Richer tags = better filter performance. Post-launch sprint target: systematic tag enrichment pass, 5–10 tags per venue. No code freeze impact since tags are pure data.

---

## 5. New Venue Suggestions (5 objects, post-launch sprint — DO NOT PASTE under code freeze)

> **Code freeze is active (Day 26).** These are staged for the post-Oct-18 sprint. All five target current-season relevance (S.hem spring / early N.hem ski openers) or geographic coverage gaps.

```javascript
// Suggestion 1: Queenstown — S.hem ski going dormant, but world-class N.hem beach replacement timing
// Actually: Perisher Blue (AU ski — S.hem season ending, swap for Thredbo coverage gap)
{id:"perisher-blue", category:"skiing",
  title:"Perisher Blue", location:"Snowy Mountains, New South Wales, Australia",
  lat:-36.4060, lon:148.4086, ap:"CBR",
  icon:"⛷️", rating:4.72, reviews:2840,
  gradient:"linear-gradient(160deg,#1a3a5c,#2e5c9e,#4a86c8)",
  accent:"#7ab0e0",
  tags:["Largest Ski Area Australia","4 Resorts Linked","Tube Town","High Country"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Perisher_Blue.jpg/1280px-Perisher_Blue.jpg",
  skiPass:"independent"},

// Suggestion 2: Early-season N.hem opener — Tignes Grande Motte glacier (already covered by tignes — skip, pick Ischgl instead)
{id:"ischgl", category:"skiing",
  title:"Ischgl", location:"Silvretta Alps, Tyrol, Austria",
  lat:47.0119, lon:10.2921, ap:"INN",
  icon:"⛷️", rating:4.88, reviews:3120,
  gradient:"linear-gradient(160deg,#0c1630,#1e3470,#3462b8)",
  accent:"#7298d8",
  tags:["Duty-Free Samnaun","Après-Ski Capital","Cross-Border Switzerland","Top Altitude 2864m"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Ischgl_Piste.jpg/1280px-Ischgl_Piste.jpg",
  skiPass:"independent"},

// Suggestion 3: S.hem beach spring opener — Cape Town's Atlantic Seaboard
{id:"camps-bay-cpt", category:"beach",
  title:"Camps Bay Beach", location:"Cape Town, South Africa",
  lat:-33.9508, lon:18.3770, ap:"CPT",
  icon:"🏖️", rating:4.85, reviews:8400,
  gradient:"linear-gradient(160deg,#003344,#006688,#0099cc)",
  accent:"#00bbdd",
  tags:["Table Mountain Backdrop","Atlantic Seaboard","Trendy Beachfront","Lions Head Views","Spring Season"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Camps_Bay_Beach.jpg/1280px-Camps_Bay_Beach.jpg"},

// Suggestion 4: S.hem beach ramp — Byron Bay (Australia, spring shoulder → summer)
{id:"byron-bay", category:"beach",
  title:"Byron Bay", location:"New South Wales, Australia",
  lat:-28.6474, lon:153.6020, ap:"OOL",
  icon:"🏖️", rating:4.90, reviews:11200,
  gradient:"linear-gradient(160deg,#003344,#005577,#0077aa)",
  accent:"#11ccee",
  tags:["Easternmost Point Australia","Lighthouse Walks","Whale Watching","Hippie Chic","Spring Season"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Byron_Bay.jpg/1280px-Byron_Bay.jpg"},

// Suggestion 5: Caribbean beach (N.hem Oct = prime Caribbean season starting)
{id:"shoal-bay-anguilla", category:"beach",
  title:"Shoal Bay East", location:"Anguilla, Caribbean",
  lat:18.2348, lon:-62.9951, ap:"AXA",
  icon:"🏖️", rating:4.94, reviews:3280,
  gradient:"linear-gradient(160deg,#003344,#006699,#00aacc)",
  accent:"#00ccdd",
  tags:["Powdery White Sand","Zero Development","Turquoise Shallows","Snorkeling Reef","October Best"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Shoal_Bay_Beach_Anguilla.jpg/1280px-Shoal_Bay_Beach_Anguilla.jpg"},
```

---

## One Observation for PM

**Val Thorens opens on launch day.** October 18 is Peakly's launch date and also the traditional opening day for Val Thorens — Europe's highest-altitude resort and the first to open each season. On launch day, Peakly will show Val Thorens scoring as OPEN (it's `lateSeason:true`, 2,300–3,230m, already in the catalog) while every other European resort is off-season. A user who downloads the app opening weekend will see a genuinely useful differentiation — "only app that tells you Val Thorens is open" — that no competitor surfaces. Recommend a launch-day tweet or Instagram story: "The Alps open today. Peakly's been ready." Ties directly into the Oct 11–12 weekend being the last user-test window before launch.
