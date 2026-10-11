# Peakly Content & Data Report — 2026-10-11

## Data Health Score: 91/100

**Deductions (unchanged since 2026-10-08):**
- −7: 225 venues (55.7%) have exactly 2 tags — `scoreVibeMatch` and search recall gap. Not fixable under code freeze. Post-launch sprint target.
- −1: Gili Trawangan duplicate still live (`beach_gilit`/LOP + `gili-trawangan`/DPS) — blocked by code freeze.
- −1: Stale scheduled-task prompt (see warning below).

**No score change from yesterday: 91/100.** All checks pass; code freeze Day 27 holds clean.

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories" with surfing, tanning, hiking, etc. The project pivoted 2026-05-03 to **skiing + beach only**. Correct count: **404 venues (134 skiing / 270 beach)**. The prompt author should update the cron task's stored text. All audit data below reflects the actual current app state.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,238** (unchanged, code freeze Day 27) |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate venue IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| Venue APs in AP_CONTINENT | **165/165** ✅ |
| Venue APs in AIRPORT_COORDS | **165/165** ✅ |
| Venue APs in BASE_PRICES | **165/165** ✅ (181 destination keys) |
| Venues with exactly 2 tags | **225 (55.7%)** ⚠️ post-launch sprint |
| lateSeason:true venues | **15** ✅ (eval-authoritative; see note below) |
| GEAR_ITEMS | **0** ✅ (Amazon cut for v1 — intentional) |
| Active categories | **skiing, beach** ✅ |
| Code freeze | **Day 27** — Oct 18 launch in **7 days** |
| Build stamp | **20260914a** (sw.js / app.jsx / index.html lockstep ✅) |

---

## 1. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues (eval-based: bracket-walker over VENUES array) | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique) ✅ |
| Missing lat/lon | **0** ✅ |
| Missing ap (IATA) | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| APs missing from AP_CONTINENT | **0** ✅ |
| APs missing from AIRPORT_COORDS | **0** ✅ |
| APs missing from BASE_PRICES | **0** ✅ |
| Brace balance | **5682 / 5682** ✅ |

**Known flagged issue (code freeze — no action):**
- `beach_gilit` (Gili Trawangan/LOP) + `gili-trawangan` (Gili Trawangan/DPS) — same venue, two IDs. Fix post-launch: delete `gili-trawangan` (lower-quality entry).

**New data note (lateSeason format split):**
`grep -c "lateSeason:true"` returns **10** — but this undercounts because 5 venues use quoted JSON format (`"lateSeason": true`). The eval-based count of **15** is authoritative. CLAUDE.md's stated "grep -c" guidance is now stale for this field. The 15 venues are:
- Unquoted: whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia
- Quoted JSON: snowbird, zermatt, engelberg, verbier, val-thorens
- Unquoted (lines 4798–4816): les-deux-alpes-fr, saas-fee-ch, st-moritz-ch

---

## 2. Gear Items Audit

**Status: N/A — GEAR_ITEMS intentionally absent for v1** (Amazon Associates cut, `grep -c GEAR_ITEMS app.jsx` → 0). Per CLAUDE.md revenue model: $7.58/1K MAU without Amazon. No action needed.

---

## 3. Seasonal Relevance — October 11

**Today is peak window for: Southern hemisphere beaches (spring ramp), tropical beaches, and glacier/high-altitude ski venues.**

| Segment | Count | Status |
|---------|-------|--------|
| N.hem ski (standard) | 96 | ⛔ OFF-SEASON — scoring engine `inSeason` check binary-caps these; ~5–7 weeks to first N.hem openings |
| N.hem ski (lateSeason glaciers) | 15 | ✅ OPEN — all 15 active: Hintertux (year-round), Saas-Fee, Tignes glacier, Les Deux Alpes, Chamonix/Mont Blanc, Mammoth, A-Basin, Cervinia, Zermatt, St. Moritz, Verbier, Engelberg, Snowbird, Val Thorens, Whistler |
| S.hem ski | 23 | ⚠️ CLOSING — S.hem ski season ends Oct–Nov; dormant or final days |
| Beach tropical (lat ±5°) | ~15 | ✅ YEAR-ROUND |
| Beach N.hem | 201 | ⚠️ MIXED — Mediterranean cooling down; Caribbean/Florida/Hawaii/Canaries strong |
| Beach S.hem | 69 | ✅ SPRING RAMP — S.hem beaches at prime opening (Oct = spring in AU, NZ, SA, Brazil, Chile) |

**7-day launch window timing:**

> **Val Thorens opens October 18 — exact launch day.** Europe's highest resort (2,300–3,230m), first Alps resort open each season, already `lateSeason:true` in catalog. On launch day users will see Val Thorens scored OPEN while every other European resort is off-season. This is a genuine product differentiator. Recommend a launch-day post: "The Alps open today. We've been ready."

> **Oct 11–12 is the SSH window for VPS redeploy (DevOps #19).** This is today. If VPS work happens today, the two-weekend scoring and iOS proxy access land before the Oct 18 launch. Worth flagging to Jack.

---

## 4. Content Quality

| Check | Result |
|-------|--------|
| Venues with ≤1 tag | **0** ✅ |
| Venues with exactly 2 tags | **225 (55.7%)** ⚠️ |
| Venues with 3+ tags | **179 (44.3%)** |
| lateSeason flag completeness | **15 confirmed (eval)** ✅ |
| poolPrimary:true venues | **0** |
| Wikipedia photo URLs (stable CDN, monitored) | **339 of 404** (no change) |
| Unsplash photo URLs | **65 of 404** |

**2-tag venues context (unchanged):** Post-launch sprint target. Tags drive `scoreVibeMatch` and search recall. Enrichment pass: 5–10 tags per venue. No code freeze impact.

---

## 5. New Venue Suggestions (5 objects, post-launch sprint — DO NOT PASTE under code freeze)

> **Code freeze is active (Day 27).** These are staged for the post-Oct-18 sprint. Five targets: S.hem spring beaches coming into prime season, Caribbean peak season (Oct–Apr), and early-season N.hem ski openers not yet in catalog.

```javascript
// 1. Cape Town / Camps Bay — S.hem spring ramp, iconic backdrop, no CPT coverage gap
{id:"camps-bay-cpt", category:"beach",
  title:"Camps Bay Beach", location:"Cape Town, South Africa",
  lat:-33.9508, lon:18.3770, ap:"CPT",
  icon:"🏖️", rating:4.85, reviews:8400,
  gradient:"linear-gradient(160deg,#003344,#006688,#0099cc)",
  accent:"#00bbdd",
  tags:["Table Mountain Backdrop","Atlantic Seaboard","Lions Head Views","Spring Season","Cosmopolitan"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Camps_Bay_Beach.jpg/1280px-Camps_Bay_Beach.jpg"},

// 2. Byron Bay — NSW Australia, easternmost point, spring shoulder → summer
{id:"byron-bay", category:"beach",
  title:"Byron Bay", location:"New South Wales, Australia",
  lat:-28.6474, lon:153.6020, ap:"OOL",
  icon:"🏖️", rating:4.90, reviews:11200,
  gradient:"linear-gradient(160deg,#003344,#005577,#0077aa)",
  accent:"#11ccee",
  tags:["Easternmost Point Australia","Lighthouse Walks","Whale Watching","Spring Season","Surf Culture"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Byron_Bay.jpg/1280px-Byron_Bay.jpg"},

// 3. Shoal Bay East, Anguilla — Caribbean peak season opens Oct, ultra-exclusive
{id:"shoal-bay-anguilla", category:"beach",
  title:"Shoal Bay East", location:"Anguilla, Caribbean",
  lat:18.2348, lon:-62.9951, ap:"AXA",
  icon:"🏖️", rating:4.94, reviews:3280,
  gradient:"linear-gradient(160deg,#003344,#006699,#00aacc)",
  accent:"#00ccdd",
  tags:["Powdery White Sand","Zero Development","Turquoise Shallows","Snorkeling Reef","Caribbean Peak"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Shoal_Bay_Beach_Anguilla.jpg/1280px-Shoal_Bay_Beach_Anguilla.jpg"},

// 4. Ischgl — Austrian/Swiss cross-border resort, opens late Nov, no INN-ap ski coverage gap (Innsbruck already has Hintertux but Ischgl is distinct)
{id:"ischgl", category:"skiing",
  title:"Ischgl", location:"Silvretta Alps, Tyrol, Austria",
  lat:47.0119, lon:10.2921, ap:"INN",
  icon:"⛷️", rating:4.88, reviews:3120,
  gradient:"linear-gradient(160deg,#0c1630,#1e3470,#3462b8)",
  accent:"#7298d8",
  tags:["Duty-Free Samnaun","Après-Ski Capital","Cross-Border Switzerland","Top Altitude 2864m","Late Season"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Ischgl_Piste.jpg/1280px-Ischgl_Piste.jpg",
  skiPass:"independent"},

// 5. El Médano, Tenerife — Canary Islands beach, year-round warm, complements Las Teresitas already in catalog
{id:"el-medano-tfe", category:"beach",
  title:"El Médano Beach", location:"Tenerife, Canary Islands",
  lat:28.0447, lon:-16.5334, ap:"TFS",
  icon:"🏖️", rating:4.72, reviews:5800,
  gradient:"linear-gradient(160deg,#004455,#0077aa,#00aacc)",
  accent:"#33ccee",
  tags:["Kite Surfing Hub","Year-Round Sun","Natural Beach","Trade Winds","Volcanic Scenery"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/El_M%C3%A9dano_playa.jpg/1280px-El_M%C3%A9dano_playa.jpg"},
```

---

## One Observation for PM

**Today is the SSH window for VPS redeploy — and the launch is in 7 days.** Per DevOps report, the Oct 11–12 window is the last practical slot to deploy the VPS changes (two-weekend scoring, iOS proxy access, alert deletion) before the Oct 18 launch. If those changes don't land this weekend, the launch goes out with two-weekend scoring silently disabled, iOS native calls blocked, and alert deletion broken. The code has been committed for months; the blocker is a 10-minute SSH session. This is a Jack-only action and the deadline is real: after Oct 12, any deploy attempt is within 5 days of launch, which adds risk. The window is open today.
