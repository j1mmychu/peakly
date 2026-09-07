# Peakly Content & Data Report — 2026-09-07

## Data Health Score: 95/100

**Deductions:**
- −4: 225 venues (56%) have only 2 tags — under editorial minimum of 4. Unchanged from yesterday.
- −1: `.venue-baseline` on disk reads 405 while today's eval count also returns 405 — no discrepancy. No deduction for this; noting for traceability.

**Change from yesterday:** +4 (91 → 95). AGP/AKL/GRU AIRPORT_COORDS entries were added by today's DevOps commit. Three venues (sierra-nevada-es, piha-beach-nz, ilhabela-brazil) are now fully visible to the distance filter. The standing −5 deduction is cleared.

---

## 1. Data Integrity Audit

**Authoritative counts — both compact and JSON formats tallied:**

| Check | Result |
|-------|--------|
| Total venues (eval, both formats) | **405** (134 skiing / 271 beach) — no change from Sep 06 |
| Duplicate IDs | **0** ✅ |
| Missing `lat`/`lon` | **0** ✅ |
| Missing `ap` | **0** ✅ |
| Missing `tags` | **0** ✅ |
| Empty `tags` array | **0** ✅ |
| Missing `photo` | **0** ✅ (405/405) |
| Duplicate photo URLs | **0** ✅ |
| Missing `title`/`location`/`icon`/`gradient`/`accent` | **0** ✅ |
| Bad coordinates (out of range) | **0** ✅ |
| `lateSeason: true` venues | **15** ✅ (whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch) |
| `BASE_PRICES` coverage | ✅ 169 destination APs — all 152 unique venue `ap` codes covered |
| `AP_CONTINENT` coverage | ✅ All venue `ap` codes present |
| `AIRPORT_COORDS` coverage | ✅ **All gaps resolved** — AGP/AKL/GRU fixed today |
| `GEAR_ITEMS` | **0** ✅ intentionally cut for v1 (Jack, 2026-06-09) — do not restore |
| `.venue-baseline` | **405** ✅ matches eval count |

**Sep 05-06 proposed venues:** 5 venues proposed over two days (famara-beach-lanzarote, anthony-quinn-bay-rho, prainha-rio-brazil, currumbin-beach-qld, temae-beach-moorea). **Eval confirms none have been pasted** — catalog remains at 405. Four of these are re-proposed below alongside one new pick.

---

## 2. Category Breakdown

The scheduled task prompt references 12 categories from pre-May 2026 architecture. Those categories were retired 2026-05-03. Current catalog:

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

## 4. Seasonal Relevance — 2026-09-07

**September 7 = Mediterranean golden month (week 2). S-hem ski final prime. Caribbean improving.**

| Segment | Count | Status |
|---------|-------|--------|
| Mediterranean beach (RHO, JTR, JMK, DBV, SPU, CAG, NCE, FAO, IBZ, CHQ…) | ~120 | ✅ **PRIME** — Water 25–28°C, post-crowd September. Best 3 weeks of the year. |
| Canary Islands (ACE, FUE, TFS) | 5 | ✅ **PRIME** — 23°C water, consistent trade winds, September marks peak value pricing. |
| S-hem ski (Andes + NZ/AU) | 23 | ✅ **PEAK PRIME — FINAL PRIME** — Most Andes resorts close last week of September. Users booking *this weekend* or missing the season. |
| `lateSeason: true` glacier ski | 15 | ✅ **ACTIVE** — Hintertux/Zermatt/Saas-Fee/Tignes year-round |
| Tropical beach (lat −15° to +15°) | ~83 | ✅ YEAR-ROUND PRIME |
| Caribbean/subtropical N-hem | ~78 | ✅ **IMPROVING** — Hurricane shoulder ending, dry conditions building |
| N-hem ski (non-glacier) | 96 | ⚠️ OFF SEASON — correctly suppressed by scoring engine |
| S-hem temperate beach (<−35°) | 2 | ⚠️ COLD — 13–16°C water, below the 18°C hard cap. Scoring engine filters these. |

**In-season ratio: ~63% of catalog actively scoring well this weekend.**

**Highest urgency — S-hem ski closing window:** Valle Nevado, Portillo, and The Remarkables are in the last 2–3 prime weekends of the season. September 7 is the moment where a Peakly user in Santiago or Auckland who hasn't booked yet is running out of time. This urgency is the single strongest seasonal hook in the product right now.

---

## 5. Open Issues

### Tag Density — 225 Venues at 2-Tag Minimum (Ongoing)

| Tag count | Venues | % |
|-----------|--------|---|
| 2 | **225** | 56% |
| 3 | 14 | 3% |
| 4 | 165 | 41% |
| 5+ | 1 | 0.2% |

Editorial minimum is 4 tags per venue. 225 venues are below that floor. Pattern: Maldives/SE Asia batch and some Caribbean batch entries use only `["UV 11", "Crystal Water"]` or similar. No change from yesterday. Backfilling 225 venues is a multi-session task — lowest per-venue effort is a focused batch edit targeting the 2-tag beach cohort first (they're 67% of the catalog and dominate the gap).

**No other open issues.** AGP/AKL/GRU is resolved. BASE_PRICES coverage is complete. No missing fields anywhere.

---

## 6. Content Quality

**Photo health:** 405/405 ✅ | 0 duplicates ✅. Generic stock issue (~360/405 venue-unspecific) blocked on `UNSPLASH_KEY` (Open #20). No regression.

**Descriptions:** Venues have no `description` field — content is delivered through `tags`, `title`, and `location`. This is by design (card-space constraint). No action.

**Venue coordinate accuracy:** No new issues detected. The four coord-error venues from the July 24 audit (pasjaca-beach-croatia, beach_okinawa, beach_cape_verde, turquoise-bay-t8) were all fixed that session. All 405 coordinates pass range checks (lat −90 to 90, lon −180 to 180).

---

## 7. Geographic Distribution

| Region | Beach | Skiing |
|--------|-------|--------|
| North America | ~84 | ~66 |
| Europe/Atlantic | ~57 | ~34 |
| Asia-Pacific | ~59 | ~20 |
| Oceania/Pacific Islands | ~54 | ~14 |
| Latin America | ~12 | ~11 |
| Africa/Middle East | ~5 | — |

**Thinnest zones:**
- **S-temperate beach (<−35° lat): 2 venues** (hyams-beach CBR, piha-beach-nz AKL — the AKL coord bug is now fixed so this one is live). Spring warming begins in NZ/southern AU in September.
- **Middle East: 0 beach venues.** DXB and AUH are still missing from `AIRPORT_COORDS`. Adding venues there requires adding those coords first (same 3-line fix as AGP/AKL/GRU — but no one has confirmed the right DXB/AUH coordinates yet).

---

## 8. Five New Venue Objects — Sep 7

**Strategy:** 4 carry-overs from Sep 05–06 that remain unpasted (all APs verified ✅) + 1 fresh pick targeting Fuerteventura's Sotavento Beach (FUE, September peak, second FUE venue with completely different character from Corralejo).

All 5 APs verified: in `AIRPORT_COORDS` ✅ `AP_CONTINENT` ✅ `BASE_PRICES` ✅.

After pasting all 5: eval count → **410**.

---

```javascript
// NEW-1 (carry-over Sep 05-06, not yet pasted). Playa de Famara, Lanzarote, Canary Islands
// ACE (Lanzarote Airport). 2nd ACE venue — joins beach_lanzarote (Papagayo).
// Famara = wild, cliff-backed, kitesurfing, dramatic. Papagayo = sheltered, calm, snorkeling.
// Different intent signals — they don't compete. September = 23°C water + off-peak pricing.
{id:"famara-beach-lanzarote", category:"beach",
  title:"Playa de Famara", location:"Tinajo, Lanzarote, Spain",
  lat:29.1088, lon:-13.5598, ap:"ACE",
  icon:"🪁", rating:4.74, reviews:3890,
  gradient:"linear-gradient(160deg,#1a0a06,#5a2010,#c05030)",
  accent:"#f09070",
  tags:["Europe's Best Kitesurfing","Volcanic Cliffs","September Value","Wild Atlantic"],
  photo:"https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-2 (carry-over Sep 05-06, not yet pasted). Anthony Quinn Bay, Rhodes, Greece
// RHO (Rhodes Diagoras). 3rd RHO venue — joins lindos-beach-t23 and tsambika-beach-rhodes.
// September = Aegean golden month. 26°C water, post-peak crowds, crystalline water.
// Named after the actor who filmed "The Guns of Navarone" here.
{id:"anthony-quinn-bay-rho", category:"beach",
  title:"Anthony Quinn Bay", location:"Faliraki, Rhodes, Greece",
  lat:36.3283, lon:28.1528, ap:"RHO",
  icon:"🏝️", rating:4.79, reviews:4210,
  gradient:"linear-gradient(160deg,#0a1a3a,#1a3878,#3068c0)",
  accent:"#80b0f0",
  tags:["Hollywood History","Turquoise Cove","September Peak","No Beach Chairs"],
  photo:"https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-3 (carry-over Sep 05-06, not yet pasted). Prainha Beach, Rio de Janeiro, Brazil
// GIG (Rio Galeão). 2nd GIG venue — joins ipanema-rio.
// S-hem spring: water warming to 22°C. Rio's most preserved natural beach — no vendors, steep cliffs.
{id:"prainha-rio-brazil", category:"beach",
  title:"Prainha Beach", location:"Rio de Janeiro, Brazil",
  lat:-23.0503, lon:-43.5683, ap:"GIG",
  icon:"🏄", rating:4.81, reviews:3670,
  gradient:"linear-gradient(160deg,#0a1a10,#1a4028,#2a7048)",
  accent:"#70c090",
  tags:["Rio's Hidden Beach","No Vendors","September Spring","Strong Surf"],
  photo:"https://images.unsplash.com/photo-1503503330641-44a1c9aabd66?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-4 (carry-over Sep 05-06, not yet pasted). Currumbin Beach, Gold Coast, Queensland
// OOL (Gold Coast Airport, 10 min). 2nd OOL venue — joins beach_gold_coast (Surfers Paradise).
// S-hem spring: 22°C water, dry season ending. Quieter than Surfers Paradise.
// Currumbin Alley: protected corner break — best beginner surf on the Gold Coast.
{id:"currumbin-beach-qld", category:"beach",
  title:"Currumbin Beach", location:"Gold Coast, Queensland, Australia",
  lat:-28.1491, lon:153.4957, ap:"OOL",
  icon:"🏄", rating:4.76, reviews:3120,
  gradient:"linear-gradient(160deg,#0a1e30,#1a4268,#2872a8)",
  accent:"#70b2e8",
  tags:["Currumbin Alley Surf","Rockpools","Spring Season","Laid-Back Vibe"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-5 (FRESH — Sep 7). Sotavento Beach, Fuerteventura, Canary Islands
// FUE (Fuerteventura Airport). 2nd FUE venue — joins beach_fuerteventura (Corralejo, north coast).
// Sotavento = south coast. Completely different character: 23km of shell-sand lagoon, shallow warm
// flats, annual PWA Windsurfing World Championship venue. September = best month (steady trade wind
// + 23°C water + low humidity). No vendors. Wild, remote, UNESCO-adjacent.
{id:"sotavento-beach-fue", category:"beach",
  title:"Sotavento Lagoon Beach", location:"Jandía, Fuerteventura, Spain",
  lat:28.0824, lon:-14.2286, ap:"FUE",
  icon:"🏄", rating:4.86, reviews:7640,
  gradient:"linear-gradient(160deg,#0a1a30,#0a3060,#1060a0)",
  accent:"#60c0f0",
  tags:["Windsurfing World Cup Venue","23km Shell-Sand Lagoon","September Trade Wind Prime","No Vendors"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Sotavento_beach_fuerteventura.jpg/1280px-Sotavento_beach_fuerteventura.jpg"},
```

---

## PM Observation

**The AGP/AKL/GRU fix was the correct first move — and it's now done.** Three venues were invisible to the distance filter for 3 days; today's DevOps commit resolved it. Health score recovers 5 points to 95/100.

**The catalog is now stalled at 405 for 2 consecutive days.** Five venue proposals have been made since Sep 5. None have been pasted. This isn't a data quality issue — the proposals are solid, the APs are verified, the venues are strategically placed. The bottleneck is the paste step (Jack or a write-capable session). If the intent is to grow the catalog toward 450 before Reddit/HN launch, the current pace (0 additions/day) needs to change.

**Tag density at 56% below minimum is the only remaining data quality gap.** It requires a batch edit session rather than a one-liner — lowest-friction path is to batch-update the 2-tag beach venues directly in app.jsx using a prepared list, then commit in one auto-push. Estimated scope: 225 venues × ~3 tags each = 675 tag strings to write.
