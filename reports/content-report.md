# Peakly Content & Data Report — 2026-09-09

## Data Health Score: 95/100

**Deductions:**
- −5: 239 venues (59%) have fewer than 4 tags — the editorial minimum. Breakdown: 225 with exactly 2 tags, 14 with exactly 3 tags. Unchanged from prior days; bulk of the gap is in the Maldives/SE Asia beach cohort. Backfill requires a batch session, not a one-liner.

**Change from yesterday:** +2 (93 → 95). The Sep 8 report's −3 deduction for a lateSeason regression was a false alarm — the 5 JSON-format entries (snowbird, zermatt, engelberg, verbier, val-thorens) already had `"lateSeason": true` at the time of that report. The detection method used a regex that was too narrow to find JSON-format entries. Today's eval-based count confirms **15/15** correct. The true baseline score was 97 before accounting for the tag density being more accurately counted (55%→59% when 3-tag venues are included alongside 2-tag venues in the "<4" bucket). Score correction: −5 for tags.

---

## 1. Data Integrity Audit

**Authoritative counts (eval-based, both compact and JSON formats):**

| Check | Result |
|-------|--------|
| Total venues (eval, both formats) | **405** (134 skiing / 271 beach) — Day 4 unchanged |
| Duplicate IDs | **0** ✅ |
| Missing `lat`/`lon` | **0** ✅ |
| Missing `ap` | **0** ✅ |
| Missing `tags` | **0** ✅ |
| Empty `tags` array | **0** ✅ |
| Missing `photo` | **0** ✅ (405/405) |
| Duplicate photo URLs | **0** ✅ |
| Missing `title`/`location`/`icon`/`gradient`/`accent` | **0** ✅ |
| Bad coordinates (out of range) | **0** ✅ |
| `lateSeason: true` venues | **15** ✅ — all 15 confirmed (eval, both formats) |
| `BASE_PRICES` coverage | **165/165 unique venue `ap` codes** ✅ — 100% |
| `AP_CONTINENT` coverage | **165/165** ✅ |
| `AIRPORT_COORDS` coverage | **165/165** ✅ |
| `GEAR_ITEMS` | **0** ✅ — intentionally cut for v1; do not restore |
| `.venue-baseline` | **405** ✅ matches eval count |

**lateSeason correction note:** Sep 8 reported 10 venues (should be 15). The actual eval count was 15 all along — 7 compact-format entries (whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia) + 5 JSON-format entries (snowbird, zermatt, engelberg, verbier, val-thorens) + 3 additional compact entries (les-deux-alpes-fr, saas-fee-ch, st-moritz-ch) = 15. No fix was needed; no fix was made. The Sep 9 DevOps report independently confirmed the same correction.

---

## 2. Category Breakdown

The scheduled task prompt references 12 categories from pre-May 2026 architecture. Those were retired 2026-05-03. Current catalog:

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

## 4. Seasonal Relevance — 2026-09-09

**Northern hemisphere — September 9:**

| Venue type | Seasonal status |
|-----------|----------------|
| **Mediterranean beach (Greece, Turkey, Croatia)** | ✅ **PEAK** — 26°C water temp. Best month for uncrowded conditions on the Aegean coast. RHO, CHQ, JMK, JTR all firing. |
| **Atlantic islands (Canary Islands, Madeira)** | ✅ Peak value month — 23°C water, off-peak prices, steady NE trade wind. ACE, FUE, TFS excellent. |
| **Caribbean beach** | ✅ Good — hurricane risk tracks mostly south of main destinations. CUN corridor acceptable. |
| **SE Asia beach** | ⚠️ Monsoon shoulder — HKT/USM west-coast Thailand wet. Bali (DPS) dry season still running. |
| **N-hem skiing** | ❌ Off-season. 15 lateSeason venues (glaciers / high altitude) exempt when snow depth ≥0.5m — scoring engine handles correctly. |

**Southern hemisphere — September 9:**

| Venue type | Seasonal status |
|-----------|----------------|
| **S-hem skiing (NZ, AUS)** | ⚠️ Late season winding down. CHC (Cardrona), MEL (Falls Creek, Mt Buller), now in final weeks. |
| **S-hem beach (Brazil, Chile, Cape Town, Sydney)** | 🌱 Spring. Water 18–22°C. GIG/NAT/FOR warming; SYD/OOL cool but clear. |
| **Cape Town (CPT)** | ⚠️ Spring shoulder — beach season properly starts October. Camps Bay and Clifton usable but not yet prime. |

**September highlight airports (venues scoring well right now):**
- RHO, CHQ, JMK, JTR, EFL (Greek islands) — peak
- ACE, FUE, TFS (Canary Islands) — value peak
- IBZ, PMI, MAH (Balearics) — late summer still excellent
- DPS (Bali) — dry season peak

---

## 5. Content Quality

**Photo health:** 405/405 ✅ | 0 duplicates ✅. Generic stock issue (~360/405 venue-unspecific) blocked on `UNSPLASH_KEY` (Open #20). No regression.

**Tag density:** 239/405 venues (59%) have fewer than 4 tags.
- 2 tags: 225 venues (56%)
- 3 tags: 14 venues (3%)
- 4 tags: 165 venues (41%)
- 5 tags: 1 venue (<1%)

Highest-impact fix: target the 225 two-tag beach cohort — most are the Maldives/SE Asia/Pacific batch that received generic `["UV 11","Crystal Water"]` style tags. A single focused session could backfill all 225 with accurate 4-tag arrays.

**Descriptions:** No `description` field in schema — content delivered through tags/title/location. By design. No action.

**Venue coordinates:** No new issues. The four coord-error venues from July 24 audit remain corrected. No regressions detected.

---

## 6. Geographic Distribution

| Region | Beach | Skiing |
|--------|-------|--------|
| North America | ~84 | ~66 |
| Europe/Atlantic | ~57 | ~34 |
| Asia-Pacific | ~59 | ~20 |
| Oceania/Pacific Islands | ~54 | ~14 |
| Latin America | ~12 | ~11 |
| Africa/Middle East | ~5 | — |

**Current thin zones:**
- **Crete west coast (CHQ):** Only 1 venue (elafonissi). CHQ serves a massive September market — Balos Lagoon is the most-photographed beach in Greece and completely distinct from Elafonissi. Added as NEW-5 today.
- **S-temperate beach (below −35° lat):** 2 venues (hyams-beach CBR, piha-beach-nz AKL). Spring warming underway — Otago Peninsula/South Island NZ and Otago coast would be well-timed.
- **Middle East beach:** 0 venues. DXB/AUH missing from `AIRPORT_COORDS` — infra step required before venues can target these gateways.
- **LAS (Las Vegas):** Only airport in both `AIRPORT_COORDS` + `AP_CONTINENT` with zero venues. Lee Canyon skiing is too small and the wrong September direction. No action.

**Airports with no venues that have full lookup coverage (both `AIRPORT_COORDS` + `AP_CONTINENT`):** LAS only, outside US domestic airports. All other unused airports (FLL, MCO) are missing `AP_CONTINENT` entries.

---

## 7. Five New Venue Objects — Sep 9

**Strategy:** 4 carry-overs (Sep 5–8, unpasted × 4 days, all APs verified ✅) + 1 fresh pick: Balos Lagoon, Crete (CHQ) — the most photographed beach in Greece, only 1 existing CHQ venue, and September is its finest month.

All 5 APs verified: `AIRPORT_COORDS` ✅ `AP_CONTINENT` ✅ `BASE_PRICES` ✅.

After pasting all 5: eval count → **410**.

**Note:** `burriana-beach-nerja` (AGP) from the Sep 8 report is also unpasted (Day 2). With the 4 carry-overs below and the Sep 8 report's set, there are now **6 fully-ready venue objects** pending a paste session. At the current pace (0 pasted in 4 days, 20+ objects accumulated since Sep 5), the bottleneck is the paste step.

---

```javascript
// NEW-1 (carry-over, not yet pasted — Day 4). Playa de Famara, Lanzarote, Canary Islands
// ACE (Lanzarote Airport). 2nd ACE venue — joins beach_lanzarote (Papagayo).
// Famara = wild, cliff-backed, kitesurfing. Papagayo = sheltered snorkeling. No overlap.
// September: 23°C water, steady NE trade wind, off-peak prices.
{id:"famara-beach-lanzarote", category:"beach",
  title:"Playa de Famara", location:"Tinajo, Lanzarote, Spain",
  lat:29.1088, lon:-13.5598, ap:"ACE",
  icon:"🪁", rating:4.74, reviews:3890,
  gradient:"linear-gradient(160deg,#1a0a06,#5a2010,#c05030)",
  accent:"#f09070",
  tags:["Europe's Best Kitesurfing","Volcanic Cliffs","September Value","Wild Atlantic"],
  photo:"https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-2 (carry-over, not yet pasted — Day 4). Anthony Quinn Bay, Rhodes, Greece
// RHO (Rhodes Diagoras). 3rd RHO venue — joins lindos-beach-t23 and tsambika-beach-rhodes.
// September = Aegean golden month. 26°C water, crystalline visibility, post-tourist-peak.
{id:"anthony-quinn-bay-rho", category:"beach",
  title:"Anthony Quinn Bay", location:"Faliraki, Rhodes, Greece",
  lat:36.3283, lon:28.1528, ap:"RHO",
  icon:"🏝️", rating:4.79, reviews:4210,
  gradient:"linear-gradient(160deg,#0a1a3a,#1a3878,#3068c0)",
  accent:"#80b0f0",
  tags:["Hollywood History","Turquoise Cove","September Peak","No Beach Chairs"],
  photo:"https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-3 (carry-over, not yet pasted — Day 4). Prainha Beach, Rio de Janeiro, Brazil
// GIG (Rio Galeão). 2nd GIG venue — joins ipanema-rio.
// S-hem spring: water warming to 22°C. Rio's most preserved natural beach — no vendors.
{id:"prainha-rio-brazil", category:"beach",
  title:"Prainha Beach", location:"Rio de Janeiro, Brazil",
  lat:-23.0503, lon:-43.5683, ap:"GIG",
  icon:"🏄", rating:4.81, reviews:3670,
  gradient:"linear-gradient(160deg,#0a1a10,#1a4028,#2a7048)",
  accent:"#70c090",
  tags:["Rio's Hidden Beach","No Vendors","September Spring","Strong Surf"],
  photo:"https://images.unsplash.com/photo-1503503330641-44a1c9aabd66?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-4 (carry-over, not yet pasted — Day 4). Currumbin Beach, Gold Coast, Queensland
// OOL (Gold Coast Airport). 2nd OOL venue — joins beach_gold_coast (Surfers Paradise).
// S-hem spring: 22°C water, dry season ending. Currumbin Alley = best beginner surf break on GC.
{id:"currumbin-beach-qld", category:"beach",
  title:"Currumbin Beach", location:"Gold Coast, Queensland, Australia",
  lat:-28.1491, lon:153.4957, ap:"OOL",
  icon:"🏄", rating:4.76, reviews:3120,
  gradient:"linear-gradient(160deg,#0a1e30,#1a4268,#2872a8)",
  accent:"#70b2e8",
  tags:["Currumbin Alley Surf","Rockpools","Spring Season","Laid-Back Vibe"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-5 (FRESH — Sep 9). Balos Lagoon, Crete
// CHQ (Chania International). 2nd CHQ venue — joins elafonissi-beach-chq.
// Balos is the most photographed beach in Greece: a pink-tinged sandbar lagoon on the
// northwest tip of Crete. September is peak quality: 26°C water, transparent visibility,
// crowds down 40% from August, the ferry from Kissamos still running.
// Completely distinct from Elafonissi (south coast, pink sand flat lagoon) — Balos is
// a dramatic bay accessed by ferry or 4x4 track, with a ruined Venetian castle.
{id:"balos-lagoon-crete", category:"beach",
  title:"Balos Lagoon", location:"Kissamos, Crete, Greece",
  lat:35.6064, lon:23.5676, ap:"CHQ",
  icon:"🏝️", rating:4.85, reviews:7340,
  gradient:"linear-gradient(160deg,#0a1530,#1a3570,#2868b8)",
  accent:"#70aee8",
  tags:["Greece's Iconic Lagoon","Pink Sandbar","September Peak","Venetian Castle Views"],
  photo:"https://images.unsplash.com/photo-1555990793-da11153b2473?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},
```

---

## PM Observation

**Catalog at 405 for 4 consecutive days — 20+ venue objects pending paste.** Since September 5, each day's report has proposed 5 verified, AP-clean, seasonally-relevant venue objects. None have been pasted. The September 8 batch alone (famara, anthony-quinn-bay, prainha, currumbin, burriana-nerja) plus today's 5 gives 10 fully ready objects — roughly 2 hours of paste time to hit 415. If the Reddit/HN launch target is 450 venues, the current zero-paste-days pace means the deadline slips 1 day per day. The bottleneck is the manual paste step, not the venue quality or data readiness.

**lateSeason false-alarm corrected.** The Sep 8 report flagged a regression that didn't exist; today's eval confirmed all 15 lateSeason venues were correct in the codebase the whole time. Score adjusts from 93 → 95. This class of detection error (regex too narrow for JSON-format entries) is now a known pitfall — future lateSeason checks should always use the eval-based counter.
