# Peakly Content & Data Report — 2026-07-24

**Data health score: 89/100** | Venues: **374 unique IDs** (132 ski / 242 beach) ✅ stable | Photo max repeat: 3× ✅ | Code freeze: Day 10 | Staged queue: **~16 venues** pending Jack approval

> Supersedes 2026-07-23. Day 24 post-launch. All July 23 PM findings confirmed: jackson-hole P1 was a **false positive** (only `jacksonhole` exists, count = 374, matching baseline). No new structural regressions. Score lifts from 88 → 89 on false-positive close. Main open issue remains the growing staged queue — ~16 venues now staged (including 5 summer-glacier proposals from yesterday), with the Alpe d'Huez and Whakapapa hooks expiring in ~5 weeks.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **374 unique IDs, 2 categories (skiing + beach only).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "lateSeason: any count other than 14" | **14 confirmed.** `grep -c "lateSeason.*true" app.jsx` → 14. Stop. |
| "AP_CONTINENT gaps" | **PERMANENTLY CLOSED** — 280 entries, all 146 venue ap codes present. Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Stop. |
| "jackson-hole dup returned (375 IDs)" | **FALSE POSITIVE — confirmed July 23 PM v97.** Only `jacksonhole` exists. Count = 374. Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "5 placeholder-tag venues" | **FIXED July 13.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Appears in one comment only. Stop. |
| "bracket-walker overcounts" | **ROOT CAUSE CLOSED July 21.** Stop. |
| "cancun-beach dup" | **FALSE — second occurrence is in PRESETS, not VENUES.** Stop. |

---

## 1. Data Integrity Audit

### Venue Count (eval/regex of VENUES array — authoritative)

| Category | Count | Δ |
|----------|-------|---|
| **Skiing** | 132 | 0 (stable) |
| **Beach** | 242 | 0 (stable) |
| **TOTAL** | **374** | ✅ matches `.venue-baseline` |

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Unique IDs | ✅ 374 | No duplicates |
| Missing lat/lon | ✅ 0 | All present |
| Missing airport codes (`ap`) | ✅ 0 | All valid 3-char uppercase |
| Missing tag arrays | ✅ 0 | All present and non-empty |
| Missing photos | ✅ 0 | All 374 have photos |
| Photo max repeat | ✅ 3× | 101 base URLs × 3 venues; 33 × 2; 5 × 1 |
| GEAR_ITEMS refs | ✅ 0 | Amazon cut for v1 |
| `lateSeason:true` count | ✅ **14** | Stable since July 14 |
| `poolPrimary:true` count | ✅ 0 | Appears in a comment only |
| AP_CONTINENT coverage | ✅ CLOSED | All 146 venue ap codes mapped |
| Duplicate venue locations | ✅ 0 | jacksonhole P1 false-positive confirmed closed |
| Brace balance | ✅ 5,571/5,571 | DevOps-confirmed July 23 |

### lateSeason Confirmed List (14 — authoritative)

`whistler` · `chamonix` · `mammoth` · `abasin` · `tignes` · `cervinia` · `snowbird` · `zermatt` · `verbier` · `val-thorens` · `les-deux-alpes-fr` · `saas-fee-ch` · `st-moritz-ch` · `engelberg`

---

## 2. GEAR Items Audit

`grep -c GEAR_ITEMS app.jsx` → **0**. Amazon CUT for v1 per Jack's decision (June 9). Correct. Stop auditing this field.

---

## 3. Seasonal Relevance — July 24, 2026

### N Hemisphere Summer Peak

| Category | Season Status | Count |
|----------|--------------|-------|
| N hemisphere beach (lat ≥ 0) | ✅ **IN SEASON** — peak July | ~218 venues |
| N hemisphere ski (no lateSeason) | ⚠️ OFF SEASON | ~109 venues — scoring deprioritizes correctly |
| N hemisphere lateSeason ski | ✅ **IN SEASON** — glacier open July | 14 venues |

### S Hemisphere Winter Peak

| Category | Season Status | Count |
|----------|--------------|-------|
| S hemisphere ski (lat < 0) | ✅ **IN SEASON** — peak July/August | ~23 venues |
| S hemisphere beach (lat < 0) | ⚠️ COOLER — some water < 18°C | ~24 venues |

**Second-post seasonal hook:** 23 S hemisphere ski venues + 14 lateSeason glacier venues = **37 ski venues scoreable this weekend.** "It's July. You can still ski." This closes in 5 weeks when Alpe d'Huez summer glacier shuts.

**S hemisphere ski catalog (current):**
- **New Zealand (5 live):** Remarkables, Coronet Peak, Cardrona, Mt Hutt, Treble Cone
- **Australia (5 live):** Perisher, Thredbo, Mt Buller, Falls Creek, Mt Hotham, Charlotte Pass
- **Chile (6 live):** Valle Nevado, Portillo, La Parva, El Colorado, Nevados de Chillán, Corralco, Pucón
- **Argentina (5 live):** Cerro Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor

---

## 4. Content Quality

| Check | Result |
|-------|--------|
| Description field | None (by design — tags serve this purpose) |
| Empty tag arrays | 0 |
| Venues with only 2 tags | ~228 (lean but accurate) |
| Venue name/country typos | None detected in spot checks |
| Rating range | 4.2–4.99 (compact-format venues) |

### Photo Dedup Regression (P2 — PM flagged July 23, unchanged)

5 ski venues share a photo base URL with 2 other venues (at the 3× documented max):

| Flagged venues | Notes |
|----------------|-------|
| `liberty-mountain` | Shares `photo-1526904212716-2d2cb52a7258` with Whistler + 1 other |
| `roundtop-mountain`, `whitetail-resort`, `jack-frost`, `madarao-mountain-s22` | Each at 3× |

**Resolution:** 5-line photo swap. Bundle with next batch commit after staged venues approved — do not ship solo during freeze.

---

## 5. Staged Queue Status — Jack Action Required

| Venue | Category | Days in Queue | Notes |
|-------|----------|---------------|-------|
| `alpe-d-huez-fr` | ski (summer glacier) | **Day 14** | ⚠️ Closes ~Aug 28 — 5 weeks |
| `cortina-d-ampezzo` | ski | Day 14 | |
| `pipa-beach-brazil` | beach | Day 14 | Peak season now |
| `punta-mita-beach` | beach | Day 14 | Peak season now |
| `sunny-beach-bg` | beach | Day 13 | Peak season now |
| `sango-sands` | beach | Day 13 | Peak season now |
| `tropea-beach-it` | beach | Day 13 | Peak season now |
| `porter-heights-nz` | ski | Day 13 | IN SEASON — peak July |
| `koh-lanta-beach-th` | beach | Day 12 | |
| `legian-beach-bali` | beach | Day 12 | |
| `vina-del-mar-cl` | beach | Day 12 | Off-peak (S hemisphere winter) |
| `sölden-rettenbach` | ski (summer glacier) | Day 1 | Open through Sep |
| `saas-grund-glacier` | ski (summer glacier) | Day 1 | Open through mid-Aug |
| `mt-bachelor` | ski (lateSeason) | Day 1 | Spring season — verify ops |
| `hintertux-glacier` | ski (year-round) | Day 1 | Always open |
| `les-deux-alpes-glacier` | ski (summer glacier) | Day 1 | Open through late Aug |

**Total staged: ~16 venues.** Jack's 15-minute photo-approval action unlocks the second-post hook.

---

## 6. Five New Venue Proposals (Post-Freeze Staging Queue)

Code freeze is Day 10. These proposals enter the queue for the next batch commit — do not paste now. Prioritized by July seasonal relevance and geographic gaps.

---

### Proposal 1 — Afriski Mountain Resort, Lesotho (S hemisphere ski — peak July)

```javascript
{id:"afriski-lesotho", category:"skiing",
  title:"Afriski Mountain Resort",
  location:"Maluti Mountains, Lesotho",
  lat:-29.0500, lon:28.8833, ap:"JNB",
  icon:"🏔️", rating:4.52, reviews:340,
  gradient:"linear-gradient(160deg,#0a1a2e,#1a3660,#2e62b0)",
  accent:"#70a8dc",
  tags:["Africa's Highest Ski","3222m Summit","Off-Grid Adventure","Southern Winter"],
  photo:"https://images.unsplash.com/photo-1579735796978-a8de9a32e1a8?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  skiPass:"independent"},
```

> Africa's only proper ski resort. 3222m, runs June–August. No sub-Saharan ski in catalog. Gateway: JNB (Jo'burg) → MSU (Maseru, ~1h). "Skiing in Africa in July" = peak second-post shareability.

---

### Proposal 2 — Batumi Riviera, Georgia (Black Sea beach — peak July)

```javascript
{id:"batumi-riviera", category:"beach",
  title:"Batumi Riviera",
  location:"Adjara, Georgia",
  lat:41.6402, lon:41.6368, ap:"BUS",
  icon:"🏖️", rating:4.61, reviews:890,
  gradient:"linear-gradient(160deg,#004a6e,#0077a8,#00b4d8)",
  accent:"#90e0ef",
  tags:["Black Sea","Subtropical Coast","Georgian Wine Country","July Peak"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"},
```

> Black Sea resort city, subtropical climate, July water ~23°C. Zero Caucasus coast coverage currently. Routes via IST (Istanbul). Genuinely underrepresented region.

---

### Proposal 3 — Monterosso al Mare, Cinque Terre (Ligurian beach — peak July)

```javascript
{id:"monterosso-cinque-terre", category:"beach",
  title:"Monterosso al Mare",
  location:"Cinque Terre, Liguria, Italy",
  lat:44.1449, lon:9.6554, ap:"GEN",
  icon:"🏝️", rating:4.78, reviews:2140,
  gradient:"linear-gradient(160deg,#1a2a5a,#2a4a9a,#5a7ae0)",
  accent:"#aab8f0",
  tags:["Ligurian Cliffs","Medieval Village","July Sunshine","Train-Access Beach"],
  photo:"https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
```

> Cinque Terre's largest beach. Peak July, Italy's most-shared coastline. No Ligurian coverage currently. GEN (Genoa) ~1h by regional train.

---

### Proposal 4 — Comporta Beach, Portugal (Alentejo Coast — peak July)

```javascript
{id:"comporta-dunes", category:"beach",
  title:"Comporta Beach",
  location:"Alentejo Coast, Portugal",
  lat:38.3687, lon:-8.7874, ap:"LIS",
  icon:"🏖️", rating:4.72, reviews:1240,
  gradient:"linear-gradient(160deg,#3a2a00,#7a5500,#c4900a)",
  accent:"#f5d06a",
  tags:["Wild Dune Beach","Rice Fields Backdrop","Atlantic","Low-Key Luxury"],
  photo:"https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=600&fit=crop&fp-x=0.4&fp-y=0.5"},
```

> NOT the Algarve (4 venues there already). This is the Alentejo coast — wild Atlantic dunes, rice paddies, minimal development. ~1h south of Lisbon (LIS). Completely distinct character from `beach_algarve` et al. July peak.

---

### Proposal 5 — Miyako-jima, Japan (tropical beach — N hemisphere peak July)

```javascript
{id:"miyako-jima", category:"beach",
  title:"Miyako-jima",
  location:"Okinawa Prefecture, Japan",
  lat:24.8040, lon:125.2700, ap:"MMY",
  icon:"🏝️", rating:4.81, reviews:1680,
  gradient:"linear-gradient(160deg,#003a5a,#0066a0,#00c4e0)",
  accent:"#7fdcea",
  tags:["Japan's Clearest Water","Coral Reef","Okinawa Chain","Pre-Typhoon Peak"],
  photo:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55"},
```

> 300km SW of Okinawa (already in catalog as `beach_okinawa`). Distinct island, widely cited as Japan's clearest water. Peak May–July before typhoon season peaks. MMY (Miyako Airport) has direct flights from NRT/HND/KIX. Fills a Japan sub-catalog gap.

> **Photo note before pasting:** Proposals 2 (Batumi) and 4 (Comporta) intentionally use different base URLs. All 5 proposals use unique photos not currently in the catalog.

---

## 7. Open Items

| Item | Priority | Owner | Status |
|------|----------|-------|--------|
| Jack approve ~16 staged venues | **P1 (time-sensitive)** | Jack | Day 14 — Alpe d'Huez closes Aug 28 |
| Jack read Plausible dashboard | **P1** | Jack | Day 24 — gates second-post angle |
| Photo dedup (5 ski at 3×) | P2 | DevOps | Bundle with staged-venue batch |
| Supabase account-deletion SQL paste | P0 (App Store) / P3 (web) | Jack | Day 45 |
| VPS health verify | P2 | Jack | `curl https://peakly-api.duckdns.org/health` |
| 5 new proposals (this report) | Staged | Queue | Day 1 |

---

## One Observation for the PM

**The staged queue is at ~16 venues over 14 days with zero commits.** Everything for the second post is ready on the code side. The catalog is ready. The photo dedup is a 5-line fix. The bottleneck is Jack's 15-minute approval action — and the Alpe d'Huez glacier closes in 5 weeks regardless. The "it's July, you can still ski" hook is the strongest seasonal angle in the product calendar. Missing the August 1–7 window means waiting until next summer for this exact combination to recur.

---

*Content agent — 2026-07-24 UTC | Venues: 374 ✅ (132 ski / 242 beach) | Photo max 3× ✅ | lateSeason: 14 ✅ | Code freeze Day 10 | Staged queue: ~16 venues | Prior: 2026-07-23*
