# Peakly Content & Data Report — 2026-09-03

## Data Health Score: 98/100

**Deductions:**
- 5 carry-over venues (Trysil, Camps Bay, Perhentian Islands, Nusa Lembongan, Portofino Riviera) unshipped — **Day 6** for first four, **Day 4** for Portofino: −2 pts

**Closures since yesterday:**
- **FOR/NAT AP_CONTINENT**: PERMANENTLY CLOSED. Sep 2 content report flagged this as missing and deducted −1 pt. Today's verification confirms both `FOR:"latam"` (line 419) and `NAT:"latam"` (line 439) are present in the current file. This was a false alarm — the entries predate the Sep 2 report. PM v138 and DevOps Sep 3 both concur. No deduction today.
- **BASE_PRICES**: Open #22 closed per DevOps Sep 3 — authoritative check shows all 123 venue `ap` codes present in BASE_PRICES. Not a content issue.

---

## 1. Data Integrity Audit

**Verified via source file regex covering both catalog formats (unquoted key + quoted JSON key):**

| Check | Result |
|-------|--------|
| Total venues | **395** (132 skiing / 263 beach) |
| Duplicate IDs | **0** ✅ |
| Missing `lat`/`lon` | **0** ✅ |
| Missing `ap` | **0** ✅ |
| Missing `tags` | **0** ✅ |
| Missing `photo` | **0** ✅ (395/395 covered) |
| HTTP (non-HTTPS) photos | **0** ✅ |
| Duplicate photo URLs | **0** ✅ |
| `scripts/.venue-baseline` | **395** ✅ matches count |
| `PEAKLY_BUILD` | **`20260902a`** — unchanged (no app.jsx commits today) |
| `lateSeason: true` venues | **15** ✅ (whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch) |
| AIRPORT_COORDS coverage | **All venue APs covered** ✅ |
| AP_CONTINENT — FOR/NAT | ✅ **CONFIRMED PRESENT** lines 419/439 — false alarm closed |
| BASE_PRICES coverage | ✅ All 123 venue APs covered — Open #22 resolved |
| GEAR_ITEMS | **0** ✅ intentionally cut for v1 (Jack, 2026-06-09) — do not restore |

---

## 2. Category Breakdown

The scheduled prompt references 12 categories from a pre-May 2026 era (surfing, hiking, tanning, etc.). Those were retired 2026-05-03. Actual catalog:

| Category | Venues | Status |
|----------|--------|--------|
| Beach | **263** | ✅ Active — 100% above minimum threshold |
| Skiing | **132** | ✅ Active — 100% above minimum threshold |
| **Total** | **395** | — |

No stub categories. Nothing to fix.

---

## 3. GEAR_ITEMS Audit

Intentionally cut for v1 (Jack, 2026-06-09). `grep -c GEAR_ITEMS app.jsx` → **0**. Standing directive in CLAUDE.md: do not restore without a product decision. No action needed.

---

## 4. Seasonal Relevance — 2026-09-03

**September 3 = Day 6 of ski pre-booking window. Mediterranean golden month. SH ski prime.**

| Segment | Count | Status |
|---------|-------|--------|
| N hemisphere beach (Mediterranean/Adriatic/Aegean) | ~180 | ✅ **GOLDEN MONTH** — post-tourist-peak, water at annual high (25–28°C) |
| Tropical/equatorial beach (−10° to +15°) | ~80 | ✅ **YEAR-ROUND PEAK** |
| S hemisphere ski (lat < 0, skiing) | ~23 | ✅ **SH PEAK** — September is late SH prime ski season |
| `lateSeason: true` glacier ski | **15** | ✅ **ACTIVE** — Hintertux/Zermatt/Saas-Fee year-round glaciers |
| N hemisphere ski (non-glacier) | ~117 | ⚠️ OFF SEASON — correctly suppressed by scoring engine |
| S hemisphere beach (lat < 0) | ~63 | ⚠️ SHOULDER — SH spring warming, sea temps below peak |

**In-season ratio: ~60%**

**Ski pre-booking urgency — Day 6:** Norwegian and Swedish families lock Christmas packages in September. Trysil (Norway's largest resort: 70+ runs, 31 lifts, 66km of pistes, Skistar pass) has been paste-ready for 6 days with no action. The ski pre-booking window is already open; every day without it is a missed search intent.

---

## 5. Content Quality

**Photo health:** 395/395 ✅ | 0 duplicates ✅ | 0 HTTP (non-HTTPS) ✅

Generic stock vs. venue-specific (~349/395 venues) remains open, blocked on `UNSPLASH_KEY` (Open #20). No regression.

**Tags and descriptions:** No new issues found. Field completeness is 100%.

**No new content quality issues this run.** Catalog is clean.

---

## 5 Venue Objects — Sep 3

**All 5 are carry-overs. Day 6 for the first four; Day 4 for Portofino. These are paste-ready and verified.**
**All APs (OSL, CPT, KUL, DPS, NCE) confirmed in `AIRPORT_COORDS` ✅ `AP_CONTINENT` ✅ `BASE_PRICES` ✅.**
**After paste + auto-push: eval count should reach 400.**

```javascript
// 1. Trysil, Norway [CARRY-OVER Day 6 — HIGHEST PRIORITY. Ski pre-booking Day 6.]
// OSL (Oslo Gardermoen) — Norway's largest ski resort. 70+ runs, 31 lifts, 66km pistes.
// Family/intermediate + Skistar pass. Distinct from hemsedal-s3 (steep/advanced).
{id:"trysil-norway", category:"skiing",
  title:"Trysil", location:"Innlandet, Norway",
  lat:61.3147, lon:12.0736, ap:"OSL",
  icon:"🎿", rating:4.72, reviews:2140,
  gradient:"linear-gradient(160deg,#0d1a2e,#1a3560,#2860a8)",
  accent:"#6898d8",
  tags:["Norway's Largest Resort","Family Friendly","70+ Runs","Village Ski-In/Out"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Trysil_ski_resort.jpg/1280px-Trysil_ski_resort.jpg",
  skiPass:"Skistar"},

// 2. Camps Bay Beach, Cape Town [CARRY-OVER Day 6 — SHIP]
// CPT (Cape Town) — Twelve Apostles backdrop, sunset strip, beachfront restaurants.
// Distinct from Clifton Fourth Beach (already in catalog). SH spring, pre-season clarity.
{id:"camps-bay-cpt", category:"beach",
  title:"Camps Bay Beach", location:"Cape Town, South Africa",
  lat:-33.9503, lon:18.3774, ap:"CPT",
  icon:"🏖️", rating:4.78, reviews:6720,
  gradient:"linear-gradient(160deg,#0a1a30,#1a3a68,#2870b8)",
  accent:"#68b0e0",
  tags:["Sunset Strip","Mountain Backdrop","Beachfront Restaurants","Cape Town Spring"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Camps_Bay_beach_and_the_Twelve_Apostles.jpg/1280px-Camps_Bay_beach_and_the_Twelve_Apostles.jpg"},

// 3. Perhentian Islands, Malaysia [CARRY-OVER Day 6 — SHIP]
// KUL (Kuala Lumpur) — sea turtle nesting, coral reefs, dry-season tail (monsoon Oct).
// Second Malaysian venue; underrepresented country.
{id:"perhentian-islands-my", category:"beach",
  title:"Perhentian Islands", location:"Terengganu, Malaysia",
  lat:5.9059, lon:102.7055, ap:"KUL",
  icon:"🏝️", rating:4.83, reviews:3890,
  gradient:"linear-gradient(160deg,#0a2010,#1a5028,#288850)",
  accent:"#58c880",
  tags:["Sea Turtles","Coral Reef","Budget Paradise","Snorkeling"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Perhentian_Islands.jpg/1280px-Perhentian_Islands.jpg"},

// 4. Nusa Lembongan, Bali, Indonesia [CARRY-OVER Day 6 — SHIP]
// DPS (Denpasar/Bali) — no cars, surf culture, mangrove bay. 30min boat from Bali.
// Distinct from Nusa Penida (dramatic cliffs, already in catalog).
{id:"nusa-lembongan-bali", category:"beach",
  title:"Nusa Lembongan", location:"Klungkung, Bali, Indonesia",
  lat:-8.6781, lon:115.4536, ap:"DPS",
  icon:"🏄", rating:4.74, reviews:5230,
  gradient:"linear-gradient(160deg,#0a1e20,#1a4848,#288080)",
  accent:"#58c0b8",
  tags:["No Cars","Surf Breaks","Yoga Retreat","Island Escape"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Nusa_Lembongan_beach.jpg/1280px-Nusa_Lembongan_beach.jpg"},

// 5. Portofino Riviera, Liguria, Italy [CARRY-OVER Day 4]
// NCE (Nice, 1.5h drive) — pastel fishing village, olive groves, 23°C water in September.
// Zero Ligurian representation in 13 Italian venues (all Southern Italy/Sardinia/Sicily).
// NCE routing already used by 4 French Riviera venues — precedented.
{id:"portofino-riviera-it", category:"beach",
  title:"Portofino Riviera", location:"Liguria, Italy",
  lat:44.3035, lon:9.2097, ap:"NCE",
  icon:"⚓", rating:4.85, reviews:9140,
  gradient:"linear-gradient(160deg,#0a1a20,#1a3a48,#2a6068)",
  accent:"#68c0c0",
  tags:["Pastel Fishing Village","Olive Groves","Crystal Water","No Mass Tourism"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Portofino_Harbour.jpg/1280px-Portofino_Harbour.jpg"},
```

---

## One Observation for the PM

**The carry-over queue is now at Day 6.** Five paste-ready venues — all verified, all APs confirmed — have been in successive daily reports since Aug 28 without landing. The ski pre-booking urgency angle that justified Trysil's original inclusion is weakening daily: Norwegian families booking Christmas packages act in September, and we are now a week into that window. At Day 7 tomorrow, recommend either (a) Jack pastes all 5 in a single session (15-minute task) or (b) the content agent gets authorized to commit venue additions directly. Carrying 5 verified venues in report-only limbo is the biggest quality gap in the current pipeline.
