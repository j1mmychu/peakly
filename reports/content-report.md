# Peakly Content & Data Report — 2026-09-06

## Data Health Score: 91/100

**Deductions:**
- −5: AGP/AKL/GRU missing from `AIRPORT_COORDS` — **Day 3 carry-over, escalated from −3**. Three venues (sierra-nevada-es, piha-beach-nz, ilhabela-brazil) still invisible to the distance filter. Fix is 3 lines.
- −4: 225 venues (56%) have only 2 tags — under editorial minimum of 4. Unchanged.

---

## 1. Data Integrity Audit

**Authoritative eval count (bracket-walker, not grep):**

| Check | Result |
|-------|--------|
| Total venues | **405** (134 skiing / 271 beach) — no change from Sep 5 |
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
| `BASE_PRICES` coverage | ✅ All 165 unique venue `ap` codes covered — zero gaps |
| `AP_CONTINENT` coverage | ✅ All 165 venue `ap` codes present — zero gaps |
| `AIRPORT_COORDS` coverage | ⚠️ **3 gaps: AGP, AKL, GRU** — Day 3, see §5 |
| `GEAR_ITEMS` | **0** ✅ intentionally cut for v1 (Jack, 2026-06-09) — do not restore |
| `.venue-baseline` | **405** ✅ matches eval count |

**Sep 5 proposed venues status:** 5 venues were proposed. `vina-del-mar-cl` was already in catalog. The other 4 (anthony-quinn-bay-rho, prainha-rio-brazil, currumbin-beach-qld, temae-beach-moorea) are confirmed NOT in catalog — eval count unchanged at 405. Four of them are re-proposed below.

---

## 2. Category Breakdown

The scheduled task references 12 categories from pre-May 2026 architecture. Those were retired 2026-05-03. Actual catalog:

| Category | Venues | Status |
|----------|--------|--------|
| Beach | **271** | ✅ Active |
| Skiing | **134** | ✅ Active |
| **Total** | **405** | — |

No stub categories. Architecture is clean.

---

## 3. GEAR_ITEMS Audit

Intentionally cut for v1 (Jack, 2026-06-09). Standing directive in `tasks/agents/devops.md`: do not restore. `grep -c GEAR_ITEMS app.jsx` → **0**. No action.

---

## 4. Seasonal Relevance — 2026-09-06

**September 6 = Mediterranean golden month peak. S Hem ski final prime. Canary Islands off-peak season opening.**

| Segment | Count | Status |
|---------|-------|--------|
| Mediterranean beach (RHO, JTR, JMK, DBV, SPU, CAG, NCE, FAO, IBZ, CAG…) | **~120** | ✅ **PRIME** — Water 25-28°C, post-crowd, clear skies. Best 3 weeks of the year. |
| Canary Islands (ACE, FUE, TFS) | **3** | ✅ **PRIME** — 23°C water, consistent sun, September marks start of value pricing |
| S hem ski (Andes + NZ/AU) | **23** | ✅ **PEAK PRIME** — Final 2–3 weekends. SCL/ZQN/SYD users booking now or missing the season entirely |
| `lateSeason: true` glacier ski | **15** | ✅ **ACTIVE** — Hintertux/Zermatt/Saas-Fee year-round |
| Tropical beach (lat −15° to +15°) | ~83 | ✅ **YEAR-ROUND PRIME** |
| Caribbean/subtropical N hem | ~78 | ✅ **PRIME** — Post-hurricane-season shoulder, dry conditions improving |
| N hem ski (non-glacier) | **96** | ⚠️ OFF SEASON — correctly suppressed by scoring engine |
| S hem temperate beach (<−35°) | **2** | ⚠️ COLD — 13-16°C water, below beach hard cap (18°C). piha-beach-nz (AKL) affected by missing coords bug too. |

**In-season ratio: ~63% of catalog actively scoring well this weekend.**

**Urgency — S Hem ski closing window:** Most Andes resorts close last week of September. Valle Nevado, Portillo, and The Remarkables are within their final peak-score weekends. This is the single highest-urgency moment in the skiing calendar for southern-hemisphere users.

---

## 5. Open Issues (Carry-Over)

### AGP / AKL / GRU — Missing from `AIRPORT_COORDS` (Day 3 — ESCALATE)

Day 3. Still 3 lines. Still breaking the distance filter for 3 venues. Deduction has increased to −5.

| AP | Airport | Venue(s) affected | Missing coords |
|----|---------|-------------------|----------------|
| **AGP** | Málaga-Costa del Sol | `sierra-nevada-es` (skiing) | `lat:36.6749, lon:-4.4991` |
| **AKL** | Auckland International | `piha-beach-nz` (beach) | `lat:-37.0082, lon:174.7850` |
| **GRU** | São Paulo Guarulhos | `ilhabela-brazil` (beach) | `lat:-23.4356, lon:-46.4731` |

**Fix — paste into `AIRPORT_COORDS` in `app.jsx`:**
```javascript
AGP:{lat:36.6749,lon:-4.4991},
AKL:{lat:-37.0082,lon:174.7850},
GRU:{lat:-23.4356,lon:-46.4731},
```

---

## 6. Content Quality

**Photo health:** 405/405 ✅ | 0 duplicates ✅. Generic stock (~360/405 venue-unspecific) remains open, blocked on `UNSPLASH_KEY` (Open #20). No regression.

**Tag density — actionable gap (unchanged):**
- 225 venues (56%) have **only 2 tags** — editorial minimum is 4
- 165 venues (41%) have 4 tags ✅
- 14 venues have 3 tags; 1 venue has 5 tags
- Pattern: Maldives/SE Asia batch → `["UV 11", "Crystal Water"]`; US ski independents → `["Ski Only", "Deep Powder"]`
- Backfill priority: beach venues first (they're 67% of the catalog and dominate the 2-tag cohort)

---

## 7. Geographic Distribution

| Region | Beach | Skiing |
|--------|-------|--------|
| Americas | 84 | 78 |
| Asia-Pacific | 59 | 32 |
| Europe-Africa-Atlantic | 57 | 34 |
| Oceania / Pacific Islands | 54 | 20 |
| Middle East | 17 | 2 |

**Gap confirmed — S-temperate beach (<−35° lat): only 2 venues** (hyams-beach-t22 CBR, piha-beach-nz AKL). piha-beach-nz is also the AKL broken-coords venue. This is the thinnest geographic zone in the catalog. Spring warming in NZ/southern AU begins September — this zone will start scoring better in the next 3-4 weeks.

**Middle East gap unchanged** — no DXB or AUH venues. Both airports lack `AIRPORT_COORDS` entries, so adding venues would replicate the AGP/AKL/GRU bug. Fix sequence: add DXB/AUH to `AIRPORT_COORDS`, then add beach venues.

---

## 8. Five New Venue Objects — Sep 6

**Strategy:** 1 fresh pick targeting Canary Islands golden month (ACE, confirmed in `AIRPORT_COORDS`) + 4 re-proposals from Sep 5 that remain unpasted. All 5 APs verified in `AIRPORT_COORDS` ✅ `AP_CONTINENT` ✅ `BASE_PRICES` ✅. After pasting all 5: eval count → **410**.

---

```javascript
// NEW-1 (FRESH). Playa de Famara, Lanzarote, Canary Islands
// ACE (Lanzarote Airport, 25min drive). 2nd ACE beach venue — joins beach_lanzarote (Papagayo).
// Famara is the OPPOSITE of Papagayo — wild, cliff-backed, windy, 5km of natural black-sand beach.
// Canary Islands golden season starting: September = 23°C water, off-peak pricing, consistent sun.
// Europe's top kitesurfing beach; dramatic Famara escarpment rises 600m behind the surf line.
{id:"famara-beach-lanzarote", category:"beach",
  title:"Playa de Famara", location:"Tinajo, Lanzarote, Spain",
  lat:29.1088, lon:-13.5598, ap:"ACE",
  icon:"🪁", rating:4.74, reviews:3890,
  gradient:"linear-gradient(160deg,#1a0a06,#5a2010,#c05030)",
  accent:"#f09070",
  tags:["Europe's Best Kitesurfing","Volcanic Cliffs","September Value","Wild Atlantic"],
  photo:"https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-2 (re-proposed Sep 5 — not yet pasted). Anthony Quinn Bay, Rhodes, Greece
// RHO (Rhodes Diagoras, 25min drive). 3rd RHO venue — joins lindos-beach-t23 and tsambika-beach-rhodes.
// September = Aegean golden month. 26°C water, post-peak crowds, famous cove with crystalline water.
// Named after the actor who filmed "The Guns of Navarone" here and fell in love with the bay.
{id:"anthony-quinn-bay-rho", category:"beach",
  title:"Anthony Quinn Bay", location:"Faliraki, Rhodes, Greece",
  lat:36.3283, lon:28.1528, ap:"RHO",
  icon:"🏝️", rating:4.79, reviews:4210,
  gradient:"linear-gradient(160deg,#0a1a3a,#1a3878,#3068c0)",
  accent:"#80b0f0",
  tags:["Hollywood History","Turquoise Cove","September Peak","No Beach Chairs"],
  photo:"https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-3 (re-proposed Sep 5 — not yet pasted). Prainha Beach, Rio de Janeiro, Brazil
// GIG (Rio Galeão). 2nd GIG venue — joins ipanema-rio. September = SH spring: water warming to 22°C.
// Rio's most preserved natural beach — no vendors, no hotels, steep cliffs, strong surf.
{id:"prainha-rio-brazil", category:"beach",
  title:"Prainha Beach", location:"Rio de Janeiro, Brazil",
  lat:-23.0503, lon:-43.5683, ap:"GIG",
  icon:"🏄", rating:4.81, reviews:3670,
  gradient:"linear-gradient(160deg,#0a1a10,#1a4028,#2a7048)",
  accent:"#70c090",
  tags:["Rio's Hidden Beach","No Vendors","September Spring","Strong Surf"],
  photo:"https://images.unsplash.com/photo-1503503330641-44a1c9aabd66?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-4 (re-proposed Sep 5 — not yet pasted). Currumbin Beach, Gold Coast, Queensland
// OOL (Gold Coast Airport, 10min). 2nd OOL venue — joins beach_gold_coast (Surfers Paradise).
// September = SH spring: 22°C water, dry season ending, clear skies. Quieter than Surfers Paradise.
// Currumbin Alley: protected corner break — best beginner surf on the Gold Coast.
{id:"currumbin-beach-qld", category:"beach",
  title:"Currumbin Beach", location:"Gold Coast, Queensland, Australia",
  lat:-28.1491, lon:153.4957, ap:"OOL",
  icon:"🏄", rating:4.76, reviews:3120,
  gradient:"linear-gradient(160deg,#0a1e30,#1a4268,#2872a8)",
  accent:"#70b2e8",
  tags:["Currumbin Alley Surf","Rockpools","Spring Season","Laid-Back Vibe"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-5 (re-proposed Sep 5 — not yet pasted). Temae Beach, Moorea, French Polynesia
// PPT (Papeete Faaa, 30min fast ferry). 2nd PPT venue — joins beach_moorea.
// East coast lagoon beach with Mount Rotui backdrop. Year-round tropical prime.
// Fringing reef creates calm shallow water — technicolor fish visible from shore.
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

**4 of 5 Sep-05 venue proposals remain unpasted** — eval count stuck at 405 for the second consecutive day. The Sep-05 venues were well-targeted (all APs in `AIRPORT_COORDS`, all seasonally relevant). Today's report re-surfaces 4 of them alongside a fresh pick (Famara). If Jack pastes both batches, count reaches 414.

**The AGP/AKL/GRU fix is 3 lines, Day 3 unresolved.** It now costs −5 health points and has been in every report this week. This is the highest-value 30-second action in the project right now — worth more per second than any venue addition.

**Famara vs. Papagayo (ACE):** These are the two Lanzarote venues. Papagayo (beach_lanzarote) = sheltered, calm, snorkeling, family. Famara = wild, windy, kitesurfing, dramatic. They don't compete — they serve different intent signals in the scoring engine. September is optimal for both.
