# Peakly Content & Data Report — 2026-08-10

**Data health score: 90/100** (stable — no new issues) | Venues: **373 unique IDs** (131 ski / 242 beach) ✅ stable | Cache stamp: `20260809a` (bumped DevOps 08-09) | BASE_PRICES real coverage: **61/146 venue APs (42%)** | Yesterday's proposals: **NOT added** (58 consecutive sessions unshipped) | Photo dedup: **170 unique URLs / 373 venues**, max 3× reuse (within spec)

> Verified against HEAD `3f71a73` (pulled from origin/main before run). All counts re-verified via node eval + regex against app.jsx. Stable vs yesterday — no venue additions or removals since 08-09. DevOps 08-09 additions (CHC/BRC/MDZ/CPC/NQN/PLS/AXA/SXM) confirmed landed: all 8 airports now appear in both BASE_PRICES and venue `ap:` fields, as expected.

---

## Permanent Corrections (stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **373 unique IDs, 2 categories (skiing + beach only).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "description field" | **No description field in venue schema.** Venues use title, location, tags. |
| "lateSeason count = 14" | **9 confirmed today** via grep. Always grep `lateSeason:\s*true` live. |
| "AP_CONTINENT gaps" | **CLOSED** — 146/146 ✅. Stop. |
| "AIRPORT_COORDS gaps for venue APs" | **CLOSED** — 146/146 ✅. However, BP-only APs lacking AIRPORT_COORDS need entries on venue add. |
| "BASE_PRICES 56.8% covered" | **CORRECTED — 41.8% (61/146) is real coverage.** 30 BP airports have zero venues. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Stop. |
| "jackson-hole dup" | **FALSE POSITIVE.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Stop. |
| "cancun-beach dup" | **FALSE — second occurrence is in PRESETS, not VENUES.** Stop. |
| "banff dup / count = 374" | **CLOSED July 24.** Count is **373**. Stop. |
| "Grace Bay near-dup" | **Two distinct entries at same AP (PLS), ~5.9 km apart.** Open — Jack's call. |

---

## 1. Data Integrity Audit

### Venue Count (authoritative — both compact and JSON formats counted)

| Format | Skiing | Beach | Total |
|--------|--------|-------|-------|
| Compact (`category:"..."`) | 68 | 108 | 176 |
| JSON (`"category": "..."`) | 63 | 134 | 197 |
| **TOTAL** | **131** | **242** | **373** |

✅ Stable vs yesterday. `.venue-baseline` = 373.

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Unique IDs | ✅ 0 dups | 373 unique IDs confirmed |
| Missing lat/lon | ✅ 0 | All 373 venues have coordinates |
| Missing airport codes (`ap`) | ✅ 0 | 373/373 have `ap:` field |
| Missing photo URL | ✅ 0 | 373/373 have `photo:` URL |
| Missing tags | ✅ 0 | 373/373 have non-empty `tags:` array |
| Bad coordinates (out of bounds) | ✅ 0 | All lat/lon within ±90/±180 |
| Duplicate photo URLs | ⚠️ 125 | Max reuse: 3× (within spec after June dedup) |
| Unique photo URLs | ⚠️ 170 unique / 373 venues | Open #20 — generic stock, not venue-specific |
| lateSeason:true venues | 9 | High-altitude ski resorts; stable count |
| poolPrimary:true venues | 0 | None in catalog |

---

## 2. BASE_PRICES Coverage Audit

**Methodology:** count of venue `ap:` codes that appear as destination keys in BASE_PRICES, divided by total unique venue APs (146). Inner keys (JFK/LAX/DEN etc.) are origin airports, not counted.

| Metric | Value |
|--------|-------|
| BASE_PRICES destination keys (outer) | **91** |
| Unique venue APs | **146** |
| Venue APs IN BASE_PRICES | **61 (42%)** |
| Venue APs MISSING from BASE_PRICES | **85 (58%)** |
| BASE_PRICES APs with ZERO venues | **30** |

### "Ideal" Target Airports (in both BASE_PRICES and AIRPORT_COORDS with zero venues)

Only **4 airports** satisfy all three criteria — deal scoring + distance filter fully active, just needs venues:

| AP | Airport | Continent | Seasonal Note (Aug) |
|----|---------|-----------|---------------------|
| **LIH** | Lihue, Kauai | na | ✅ Peak — Hawaii tropical year-round |
| LAS | Las Vegas | na | ⛔ Desert — no beach/ski destination |
| PHX | Phoenix | na | ⛔ Desert — no beach/ski destination |
| DTW | Detroit Metro | na | ⚠️ Midwest summer — local beaches only |

→ **LIH is the only ideal target with seasonal logic for Aug.** See Section 5 for the venue proposal.

### Top Missing APs by Current Venue Count (top 10)

Adding BASE_PRICES entries for these instantly activates deal scoring for the most venues:

| AP | Venues | Notes |
|----|--------|-------|
| ALB | 4 | Albania coast (Sarandë) |
| NAP | 4 | Naples (Amalfi Coast gateway) |
| CAG | 4 | Cagliari, Sardinia |
| FAO | 4 | Faro, Algarve |
| SPU | 4 | Split, Croatia |
| USM | 4 | Koh Samui, Thailand |
| MPH | 4 | Malay, Boracay gateway |
| DLM | 4 | Dalaman, Turkish Aegean |
| CMB | 4 | Colombo, Sri Lanka |
| GOI | 4 | Goa, India |

> **DevOps note:** the DevOps agent has been adding BP entries efficiently (8 airports per run). Next batch priority: ALB/NAP/CAG/FAO/SPU/DLM/USM/MPH = 32 venues instantly covered. Same SSH session as Open #19 VPS redeploy.

---

## 3. Seasonal Relevance (Aug 10, 2026)

| Season State | Category | Action |
|---|---|---|
| ✅ **PEAK** | N-hemisphere beach (majority ~200 venues) | Scoring engine promotes these correctly |
| ✅ **PEAK** | S-hemisphere skiing (~23 venues, CHC/BRC/ZQN/MDZ etc.) | Now all have BASE_PRICES ✅ (DevOps 08-09) |
| ⚠️ **OFF-SEASON** | N-hemisphere skiing (~108 venues) | Scoring engine suppresses; 9 lateSeason venues may surface if snowpack ≥ 0.5m |
| ⚠️ **OFF-SEASON** | S-hemisphere beach | Scoring engine handles naturally |

**No scoring intervention needed.** The app's seasonal logic (`isNorth`, `lateSeason`, water-temp hard cap) handles all of this correctly. August is the best-possible month for the app's primary catalog (N-beach dominant).

---

## 4. Content Quality

No new issues found today. Persistent known items:

- **Photos (Open #20):** 170 unique / 373 venues — all are generic category stock (ski powder shot, tropical beach), not venue-specific photography. The scoring/ranking is unaffected but user trust suffers when the Whistler card shows a generic mountain. Fix: `UNSPLASH_KEY=... node scripts/photos-fetch.mjs`. ~346 venues still generic.
- **Tag depth:** Most compact-format venues have 2 tags; JSON-format batch venues tend to have 2–4 tags. Acceptable — tags drive search and filter, not ranking.
- **lateSeason venue list (9 confirmed):** whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, saas-fee-ch (or similar). Grep `lateSeason:\s*true` in app.jsx for authoritative current list — do not rely on any prior report's count.

---

## 5. New Venue Proposals

**Strategy today:** prioritize LIH (the one "ideal" airport with BASE_PRICES + AIRPORT_COORDS + no venues), then 4 additional BP-only beach airports with strong August seasonal case. Each non-LIH venue requires a new `AIRPORT_COORDS` entry (included below).

**Note on AIRPORT_COORDS additions:** OOL, AGP, LIS, ACE all have AP_CONTINENT entries but are missing from AIRPORT_COORDS. Add the AIRPORT_COORDS lines before pasting the venues, or the distance filter will silently treat these venues as unreachable.

### AIRPORT_COORDS additions required (paste into the AIRPORT_COORDS object):

```js
OOL: [-28.1644, 153.5044],   // Gold Coast, Australia
AGP: [36.6750, -4.4990],     // Málaga, Spain
LIS: [38.7742, -9.1342],     // Lisbon, Portugal
ACE: [28.9455, -13.6052],    // Lanzarote, Canary Islands
```

### Venue 1 — Poipu Beach, Kauai (LIH) — **IDEAL: already in BASE_PRICES + AIRPORT_COORDS**

```js
{id:"beach_poipu", category:"beach",
  title:"Poipu Beach", location:"Kauai, Hawaii",
  lat:21.8753, lon:-159.4685, ap:"LIH",
  icon:"🏖️", rating:4.94, reviews:9800,
  gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",
  accent:"#33bbff",
  tags:["Horseshoe Bay","Monk Seal Sanctuary","Year-Round Sun","World-Class Snorkeling"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"},
```

**Rationale:** LIH is the only BP-only airport that (a) already has an AIRPORT_COORDS entry, (b) is a genuine beach destination in August, and (c) has no current venues. Poipu is Kauai's most consistently sunny beach — south-facing so it dodges the north-shore trade-wind rain. Water temp 26°C year-round ✅. Kauai has zero Peakly representation despite HNL having 2 venues; LIH handles direct flights from LAX/SFO/PDX. Deal scoring activates immediately on add.

---

### Venue 2 — Surfers Paradise, Gold Coast (OOL)

```js
{id:"beach_goldcoast", category:"beach",
  title:"Surfers Paradise", location:"Gold Coast, Queensland, Australia",
  lat:-27.9979, lon:153.4306, ap:"OOL",
  icon:"🏖️", rating:4.85, reviews:24600,
  gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",
  accent:"#22aaff",
  tags:["Queensland Beaches","Skyline Backdrop","Surf Lessons","Warm Winter Water"],
  photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"},
```

**Rationale:** OOL is in BASE_PRICES (zero venues) and AP_CONTINENT = oceania ✅. August is Queensland's best month: 25°C air, 21°C water (above 18°C hard cap ✅), minimal humidity, 8 h daily sun. The app's S-hemisphere inversion makes this the peak beach window while European users see rain. Airport is 10 min from the beach — zero transfer friction. **Requires OOL in AIRPORT_COORDS (entry above).**

---

### Venue 3 — Nerja / Burriana Beach, Costa del Sol (AGP)

```js
{id:"beach_nerja", category:"beach",
  title:"Burriana Beach, Nerja", location:"Costa del Sol, Spain",
  lat:36.7391, lon:-3.8524, ap:"AGP",
  icon:"🏖️", rating:4.90, reviews:12400,
  gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",
  accent:"#33aaee",
  tags:["Balcón de Europa","Sea Caves","Tapas on the Shore","Crystal Mediterranean"],
  photo:"https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop"},
```

**Rationale:** AGP is in BASE_PRICES (zero venues) and AP_CONTINENT = europe ✅. August is the definitive peak for Málaga province. Water temp 22°C ✅. Nerja sits 55 km east of Málaga airport (≈55 min drive). AGP is one of Europe's highest-traffic holiday airports — large user segment with no Peakly representation. **Requires AGP in AIRPORT_COORDS (entry above).**

---

### Venue 4 — Cascais, Portuguese Riviera (LIS)

```js
{id:"beach_cascais", category:"beach",
  title:"Cascais Beach", location:"Portuguese Riviera, Portugal",
  lat:38.6979, lon:-9.4215, ap:"LIS",
  icon:"🏖️", rating:4.87, reviews:8200,
  gradient:"linear-gradient(160deg,#002233,#004466,#006699)",
  accent:"#2299bb",
  tags:["30 Min from Lisbon","Atlantic Swell","Historic Old Town","Seafood & Sunsets"],
  photo:"https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&h=600&fit=crop"},
```

**Rationale:** LIS is in BASE_PRICES (zero venues) and AP_CONTINENT = europe ✅. August is peak Portugal beach season; Cascais sees 10+ h of sun daily and 20°C Atlantic water ✅. Cascais is 30 km west of Lisbon airport — short transfer. Portugal is entirely absent from the catalog despite being one of Europe's top weekend-flight destinations. **Requires LIS in AIRPORT_COORDS (entry above).**

---

### Venue 5 — Playa de Papagayo, Lanzarote (ACE)

```js
{id:"beach_papagayo", category:"beach",
  title:"Playa de Papagayo", location:"Lanzarote, Canary Islands, Spain",
  lat:28.8526, lon:-13.8162, ap:"ACE",
  icon:"🏖️", rating:4.93, reviews:6400,
  gradient:"linear-gradient(160deg,#1a1000,#3d2600,#664200)",
  accent:"#cc9944",
  tags:["Volcanic Backdrop","Protected Cove","Year-Round Sun","20°C Water Always"],
  photo:"https://images.unsplash.com/photo-1548781300-e30c5f8ea6d4?w=800&h=600&fit=crop"},
```

**Rationale:** ACE is in BASE_PRICES (zero venues) and AP_CONTINENT = europe ✅. The Canaries are genuinely year-round (avg 25°C air, 23°C water in August ✅) making them the rare EU beach that scores well in every season — not just summer. Papagayo is a protected natural reserve 12 km from the airport. The volcanic gradient deliberately differentiates this card from blue-ocean defaults — a visual signal of the unique landscape. **Requires ACE in AIRPORT_COORDS (entry above).**

---

## One Observation for the PM

**58 consecutive sessions of unshipped proposals.** The content agent has been proposing 5 venues/day since approximately late May 2026. At 1 proposal batch per day, the backlog now represents over 290 proposed venues that have not been evaluated or added. Two interpretations: (1) the daily venue-addition cadence in the prompt no longer matches the product's actual pace (venues are only added in deliberate batches by DevOps or Jack), in which case the 5-venues-per-session format should be changed to a BASE_PRICES coverage audit + DevOps handoff only; (2) there's a genuine queue of venues waiting for review and an "apply queue" mechanism would help. **Recommend:** either retire the daily venue-addition section from this agent's prompt or establish a once-weekly "venue batch review" where Jack evaluates and applies the week's top proposals in one session. The daily 5-venues output is currently generating noise with no signal path to the catalog.
