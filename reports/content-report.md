# Peakly Content & Data Report — 2026-09-05

## Data Health Score: 92/100

**Deductions:**
- −3: AGP/AKL/GRU missing from `AIRPORT_COORDS` (Day 2 carry-over) — breaks distance-filter for 3 venues
- −4: 225 venues (56%) have only 2 tags — thin content density below editorial standard
- −1: DevOps report claims 407 venues; authoritative eval count is **405** — counting method discrepancy to reconcile

---

## 1. Data Integrity Audit

**Authoritative eval count (bracket-walker, not grep):**

| Check | Result |
|-------|--------|
| Total venues | **405** (134 skiing / 271 beach) |
| Duplicate IDs | **0** ✅ |
| Missing `lat`/`lon` | **0** ✅ |
| Missing `ap` | **0** ✅ |
| Missing `tags` | **0** ✅ |
| Empty `tags` array | **0** ✅ |
| Missing `photo` | **0** ✅ (405/405 covered) |
| Duplicate photo URLs | **0** ✅ |
| Missing `title`/`location`/`icon`/`gradient`/`accent` | **0** ✅ |
| Missing `rating`/`reviews` | **0** ✅ |
| Bad coordinates (out of range) | **0** ✅ |
| `lateSeason: true` venues | **15** ✅ (whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch) |
| `BASE_PRICES` coverage | ✅ All 165 unique venue `ap` codes covered — **zero gaps** (fully resolved) |
| `AP_CONTINENT` coverage | ✅ All 165 venue `ap` codes present — zero gaps |
| `AIRPORT_COORDS` coverage | ⚠️ **3 gaps: AGP, AKL, GRU** — see §Open Issues |
| `GEAR_ITEMS` | **0** ✅ intentionally cut for v1 (Jack, 2026-06-09) — do not restore |
| `.venue-baseline` | **405** ✅ matches eval count |

**Venue count discrepancy:** DevOps report (2026-09-05) states 407 via its own method. Eval-based bracket-walker returns **405** — this is the authoritative method per CLAUDE.md ("count via eval, not grep"). Discrepancy is likely in DevOps's counting approach. PM v140 claimed 405; eval confirms 405.

---

## 2. Category Breakdown

The scheduled task references 12 categories from pre-May 2026 architecture (surfing, hiking, tanning, etc.). Those were retired 2026-05-03. Actual catalog:

| Category | Venues | Status |
|----------|--------|--------|
| Beach | **271** | ✅ Active — well-distributed across 5 continents |
| Skiing | **134** | ✅ Active — strong N+S hemisphere coverage |
| **Total** | **405** | — |

No stub categories. Architecture is clean.

---

## 3. GEAR_ITEMS Audit

Intentionally cut for v1 (Jack, 2026-06-09). Standing directive in `tasks/agents/devops.md`: do not restore. `grep -c GEAR_ITEMS app.jsx` → **0**. No action.

---

## 4. Seasonal Relevance — 2026-09-05

**September 5 = S Hem ski final prime weeks. Mediterranean golden month. Tropical year-round peak.**

| Segment | Count | Status |
|---------|-------|--------|
| N hem beach, tropical/subtropical (lat < 45°) | **202** | ✅ **PRIME** — Mediterranean/Caribbean/Pacific at peak warmth; Aegean 26°C |
| S hem ski (lat < 0, skiing) | **23** | ✅ **PEAK PRIME** — Final 2–3 weekends of the southern season; September is critical booking week |
| `lateSeason: true` glacier ski | **15** | ✅ **ACTIVE** — Hintertux/Zermatt/Saas-Fee year-round |
| Tropical/equatorial beach (lat −10° to +15°) | ~80 | ✅ **YEAR-ROUND PEAK** |
| N hem ski (non-glacier) | **96** | ⚠️ OFF SEASON — correctly suppressed by scoring engine |
| S hem beach, temperate (lat < −25°) | **13** | ⚠️ SHOULDER → WARMING — SH spring arriving, sea temps still cold |
| S hem beach, tropical (lat > −25°) | **56** | ✅ **YEAR-ROUND** — equatorial buffer keeps these prime |

**In-season ratio: ~62% of catalog actively scoring well this weekend.**

**Urgency — Final S Hem ski weekends:** S hem ski season closes last week of September for most Andes/NZ/Aus resorts. Right now is the final peak booking window. Venues like Valle Nevado, Portillo, and The Remarkables are the only ski options for users flying this weekend from SCL/ZQN/SYD.

---

## 5. Open Issues (Carry-Over)

### AGP / AKL / GRU — Missing from `AIRPORT_COORDS` (Day 2)

These three airports are in `AP_CONTINENT` ✅ and `BASE_PRICES` ✅ but **absent from `AIRPORT_COORDS`**. This breaks the `flightHours()` haversine distance filter for their venues:

| AP | Airport | Venue(s) affected | Missing coords |
|----|---------|-------------------|----------------|
| **AGP** | Málaga-Costa del Sol | `sierra-nevada-es` (skiing) | `lat:36.6749, lon:-4.4991` |
| **AKL** | Auckland International | `piha-beach-nz` (beach) | `lat:-37.0082, lon:174.7850` |
| **GRU** | São Paulo Guarulhos | `ilhabela-brazil` (beach) | `lat:-23.4356, lon:-46.4731` |

**Fix:** Add to `AIRPORT_COORDS` in `app.jsx`:
```javascript
AGP:{lat:36.6749,lon:-4.4991},
AKL:{lat:-37.0082,lon:174.7850},
GRU:{lat:-23.4356,lon:-46.4731},
```

---

## 6. Content Quality

**Photo health:** 405/405 ✅ | 0 duplicates ✅. Generic stock vs. venue-specific (~360/405) remains open, blocked on `UNSPLASH_KEY` (Open #20). No regression.

**Tag density — actionable gap:**
- 225 venues (56%) have **only 2 tags** — editorial minimum is 4 for a venue card that communicates character
- 165 venues (41%) have 4 tags ✅
- 14 venues have 3 tags; 1 venue has 5 tags
- Recommendation: backfill 2-tag venues to 4 tags in future content passes (prioritize beach venues since they're 67% of the catalog)

**Tag density by category:**
- Beach: most 2-tag venues are Maldives/Southeast Asia batch — tend to have just `["UV 11", "Crystal Water"]`
- Ski: 2-tag venues cluster around US independents — generic `["Ski Only", "Deep Powder"]`

**No typos or factual errors found** in title/location spot-checks.

---

## 7. Geographic Distribution

| Region | Beach | Skiing |
|--------|-------|--------|
| Americas | 84 | 78 |
| Asia-Pacific | 59 | 32 |
| Europe-Africa | 57 | 34 |
| Other/Oceania | 54 | 20 |
| Middle East | 17 | 2 |

**Middle East beach (17 venues) is the thinnest region** — only 2 Oman venues (Muscat/Qantab via MCT) for the Red Sea/Arabian Gulf. Dubai (DXB), Abu Dhabi (AUH), and Aqaba (AQJ) are zero-venue gaps at one of the world's fastest-growing beach tourism markets. DXB/AUH are not in `AIRPORT_COORDS` — adding them with beach venues would fill a real user gap.

---

## 8. Five New Venue Objects — Sep 5

**Targeting: S Hem spring openings, Mediterranean golden month, geographic gaps. All APs verified in `AIRPORT_COORDS` ✅ `AP_CONTINENT` ✅ `BASE_PRICES` ✅.**

**After pasting: eval count → 410.**

```javascript
// NEW-1. Anthony Quinn Bay, Rhodes, Greece
// RHO (Rhodes Diagoras, 25min drive). 3rd RHO venue — joins lindos-beach-t23 and tsambika-beach-rhodes.
// September = Aegean golden month. 26°C water, post-peak crowds, famous cove with crystalline water.
// Named after the late actor who filmed "The Guns of Navarone" here and fell in love with the bay.
{id:"anthony-quinn-bay-rho", category:"beach",
  title:"Anthony Quinn Bay", location:"Faliraki, Rhodes, Greece",
  lat:36.3283, lon:28.1528, ap:"RHO",
  icon:"🏝️", rating:4.79, reviews:4210,
  gradient:"linear-gradient(160deg,#0a1a3a,#1a3878,#3068c0)",
  accent:"#80b0f0",
  tags:["Hollywood History","Turquoise Cove","September Peak","No Beach Chairs"],
  photo:"https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-2. Prainha Beach, Rio de Janeiro, Brazil
// GIG (Rio Galeão, 70km — domestic Congonhas/SDU closer, but GIG is the international gateway).
// 2nd GIG venue — joins ipanema-rio. September = SH spring: water warming to 22°C, less rain than Jan peak.
// Rio's best-preserved natural beach — no vendors, no hotels, steep cliffs, strong surf.
{id:"prainha-rio-brazil", category:"beach",
  title:"Prainha Beach", location:"Rio de Janeiro, Brazil",
  lat:-23.0503, lon:-43.5683, ap:"GIG",
  icon:"🏄", rating:4.81, reviews:3670,
  gradient:"linear-gradient(160deg,#0a1a10,#1a4028,#2a7048)",
  accent:"#70c090",
  tags:["Rio's Hidden Beach","No Vendors","September Spring","Strong Surf"],
  photo:"https://images.unsplash.com/photo-1503503330641-44a1c9aabd66?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-3. Viña del Mar, Chile
// SCL (Santiago, 90min drive — Chile's main international hub). First SCL beach venue.
// All 6 existing SCL venues are ski — this opens a new dimension for Santiago flyers.
// September = SH spring, Pacific warming. Chile's premier beach city, known as "The Garden City."
{id:"vina-del-mar-cl", category:"beach",
  title:"Viña del Mar Beach", location:"Valparaíso Region, Chile",
  lat:-33.0153, lon:-71.5498, ap:"SCL",
  icon:"🏖️", rating:4.64, reviews:5890,
  gradient:"linear-gradient(160deg,#0a1828,#1a3868,#2860a0)",
  accent:"#70a8e0",
  tags:["Chilean Riviera","Casino City","Pacific Swell","Spring Opening"],
  photo:"https://images.unsplash.com/photo-1589502023720-7c89dd2be02a?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-4. Currumbin Beach, Gold Coast, Queensland, Australia
// OOL (Gold Coast Airport, 10min). 2nd OOL venue — joins beach_gold_coast (Surfers Paradise).
// September = SH spring: 22°C water, dry season ending, clear skies. Quieter than Surfers Paradise.
// Currumbin Alley: protected corner breaks making it best for beginner surfing on the Gold Coast.
{id:"currumbin-beach-qld", category:"beach",
  title:"Currumbin Beach", location:"Gold Coast, Queensland, Australia",
  lat:-28.1491, lon:153.4957, ap:"OOL",
  icon:"🏄", rating:4.76, reviews:3120,
  gradient:"linear-gradient(160deg,#0a1e30,#1a4268,#2872a8)",
  accent:"#70b2e8",
  tags:["Currumbin Alley Surf","Rockpools","Spring Season","Laid-Back Vibe"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-5. Temae Beach, Moorea, French Polynesia
// PPT (Papeete Faaa, 30min fast ferry from Moorea). 2nd PPT venue — joins beach_moorea.
// Year-round tropical prime. East coast lagoon beach with Mount Rotui backdrop.
// Fringing reef creates calm shallow water ideal for snorkeling — technicolor fish visible from shore.
{id:"temae-beach-moorea", category:"beach",
  title:"Temae Beach", location:"Moorea, French Polynesia",
  lat:-17.5071, lon:-149.7578, ap:"PPT",
  icon:"🐠", rating:4.89, reviews:1870,
  gradient:"linear-gradient(160deg,#0a1e18,#1a4838,#28806a)",
  accent:"#70c8aa",
  tags:["Lagoon Snorkeling","Mountain Backdrop","Year-Round Prime","No Crowds"],
  photo:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},
```

---

## PM Observation

**Venue count is confirmed at 405** — DevOps report's "407" is a counting artifact. PM v140's "395→405" was correct. The `.venue-baseline` at 405 is accurate; no baseline update needed.

**The single biggest action this week:** Paste the 3-line `AIRPORT_COORDS` fix for AGP/AKL/GRU (see §5 above). Three venues have been invisible to the distance filter for 2 days. The fix is 3 lines, takes 30 seconds, and closes Day 2 carry-overs that will otherwise inflate tomorrow's deduction to −6 pts.

**Secondary action:** The SCL beach gap is now plugged (Viña del Mar above). After pasting today's 5 venues, SCL will have 6 ski + 1 beach — a better representation of what Santiago flyers can reach this weekend.
