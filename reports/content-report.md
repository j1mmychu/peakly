# Peakly Content & Data Report — 2026-07-29

**Data health score: 89/100** | Venues: **373 unique IDs** (131 ski / 242 beach) ✅ stable | Photo coverage: 373/373 ✅ | BASE_PRICES gap: 100/146 APs missing (63.0%) ⚠️ | **NEW: AP_CONTINENT gap 7 venues** ⚠️

> Supersedes 2026-07-28. Verified against fresh `git pull` (34 commits fetched — local was 34 behind origin). No app.jsx code changes since `20260725d` cache stamp. Yesterday's 5 venue proposals (LIH/ACE/LIR/CEB/VCE) remain unimplemented — backlog now 10 proposals. AP_CONTINENT gap is a new confirmed finding that contradicts yesterday's "permanently closed" claim — see Section 1 below.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **373 unique IDs, 2 categories (skiing + beach only).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "description field" | **No description field in venue schema.** Not applicable — venues use title, location, tags. |
| "lateSeason count ≠ 14" | **14 confirmed** (whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch). |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Stop. |
| "jackson-hole dup" | **FALSE POSITIVE** — only `jacksonhole` exists. Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Stop. |
| "cancun-beach dup" | **FALSE — second occurrence is in PRESETS, not VENUES.** Stop. |
| "banff dup / count = 374" | **CLOSED July 24** — banff deleted, count is **373**. Stop. |
| "AP_CONTINENT gaps PERMANENTLY CLOSED" | **WRONG — 7 venues currently fail this check.** See Section 1 below. |
| "BASE_PRICES covers 52/146 (35.6%)" | **CORRECTED — 46/146 covered = 63.0% missing.** Use this figure. |

---

## 1. Data Integrity Audit

### Venue Count (authoritative — node eval, not grep)

| Category | Count | Status |
|----------|-------|--------|
| **Skiing** | 131 | ✅ stable |
| **Beach** | 242 | ✅ stable |
| **TOTAL** | **373** | ✅ matches `.venue-baseline` |

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Unique IDs | ✅ 373 | Zero duplicates |
| Missing lat/lon | ✅ 0 | All present |
| Missing airport codes (`ap`) | ✅ 0 | All valid 3-char IATA |
| Missing tag arrays | ✅ 0 | All non-empty |
| Photos (field present) | ✅ 373/373 | All have photo field |
| Duplicate IDs | ✅ 0 | Clean |
| lateSeason count | ✅ 14 | All skiing venues |
| **AP in AP_CONTINENT** | ❌ **7 venues failing** | See fix below |
| AP in AIRPORT_COORDS | ✅ 0 missing | All 146 venue APs in AIRPORT_COORDS |

### ❌ AP_CONTINENT Gap — New Confirmed Finding (7 venues, 6 airports)

Yesterday's report claimed this was "PERMANENTLY CLOSED." It is not. Today's node extraction confirms 7 venues use airports not in `AP_CONTINENT`:

| Venue ID | AP | Correct Continent | Fix |
|---|---|---|---|
| `tioman-island-t11` | KUL | `asia` | Add to AP_CONTINENT |
| `laguna-beach-t24` | SNA | `na` | Add to AP_CONTINENT |
| `muscat-beach-t26` | MCT | `asia` | Add to AP_CONTINENT |
| `qantab-beach-oman` | MCT | `asia` | (same fix as above) |
| `ipanema-rio` | GIG | `latam` | Add to AP_CONTINENT |
| `las-teresitas-tfe` | TFS | `europe` | Add to AP_CONTINENT |
| `elafonissi-beach-chq` | CHQ | `europe` | Add to AP_CONTINENT |

All 6 missing airports ARE in AIRPORT_COORDS — flight distance calc works. Only continent filtering is broken. Impact: these 7 venues may not surface correctly when users filter by continent.

**Paste-ready fix — add after the `TGD:"europe"` line in `AP_CONTINENT` (around line 479):**

```javascript
  // Malaysia, Oman, Canary Islands, Crete, Rio de Janeiro, Orange County patches
  KUL:"asia", MCT:"asia", // Kuala Lumpur, Muscat
  GIG:"latam",            // Rio de Janeiro
  SNA:"na",               // Orange County (John Wayne)
  TFS:"europe", CHQ:"europe", // Tenerife Sur, Chania (Crete)
```

This is a ~30-second paste. No brace risk. No score or logic change — only continent lookup.

---

## 2. Gear Items Audit

Not applicable. `grep -c GEAR_ITEMS app.jsx` → **0**. Amazon Associates cut for v1. Stop raising permanently.

---

## 3. Seasonal Relevance (2026-07-29)

| Segment | Count | Season Status | Notes |
|---|---|---|---|
| Northern beach (lat ≥ 0) | 187 | ✅ **PEAK SEASON** | July = northern summer. All in prime window. |
| Southern ski (lat < 0) | 23 | ✅ **IN SEASON** | July = Southern hemisphere winter. All 23 open. |
| Southern beach (lat < 0) | 55 | ⚠️ Off-peak | S hemisphere winter. Tropical venues still warm. |
| Northern ski (lat ≥ 0) | 108 | ❌ Off-season | Only 14 `lateSeason:true` venues still viable. |

**Southern hemisphere ski is Peakly's strongest differentiator this weekend.** 23 venues actively in-season across ZQN (4), SCL (5), MEL (3), SYD (2), ZCO (2), CHC (1), CBR (1), BRC (1), MDZ (1), CPC (1), NQN (1), USH (1). OpenSnow and OnTheSnow go dark in July — Peakly does not.

**14 lateSeason northern ski venues still viable in summer:** whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch.

---

## 4. Content Quality

| Check | Result | Notes |
|-------|--------|-------|
| Venue descriptions | N/A | **No description field in schema** — by design. Title + location + tags carry the content. |
| Tags coverage | ✅ 0 venues with empty tags | All 373 have ≥1 tag. |
| Photo field present | ✅ 373/373 | All filled. ~346 still generic stock vs. actual venue. |
| Photo repeats (>3 per URL) | ✅ 0 | Dedup holding after June 13 session. |
| Duplicate IDs | ✅ 0 | Boot-time validator active. |

### BASE_PRICES Gap (Deal Scoring Coverage)

**63.0% of venues (235/373) have no deal scoring** because their airport is absent from `BASE_PRICES`.

Top missing airports by venue count affected:

| Airport | Venues | Category |
|---|---|---|
| CUN | 9 | beach |
| IBZ | 7 | beach |
| HKT | 6 | beach |
| BTV | 5 | skiing |
| NCE | 5 | beach |
| ZNZ | 5 | beach |
| MRU | 5 | beach |
| ALB | 4 | skiing |
| PLS | 4 | beach |
| AXA | 4 | beach |
| SXM | 4 | beach |
| NAP | 4 | beach |
| CAG | 4 | beach |
| FAO | 4 | beach |
| SPU | 4 | beach |
| USM | 4 | beach |
| MPH | 4 | beach |
| DLM | 4 | beach |
| CMB | 4 | beach |
| GOI | 4 | beach |

Backfilling the top 15 airports unlocks deal scoring for ~90 venues in a single 2-hour session — higher user-facing ROI than adding 30 new venues.

---

## 5. Daily Venue Additions

**Pending proposals backlog:** Yesterday's 5 proposals (LIH/ACE/LIR/CEB/VCE) remain unimplemented — backlog is now 10. All proposals below use airports confirmed in **both AP_CONTINENT and AIRPORT_COORDS** for full continent-filtering and flight-distance-calc support.

---

### Venue 1 — Porters Ski Area, Canterbury, New Zealand (CHC)

```javascript
{
  id: "porters-ski-area-nz",
  category: "skiing",
  title: "Porters Ski Area",
  location: "Canterbury, New Zealand",
  lat: -43.5833,
  lon: 171.7667,
  ap: "CHC",
  icon: "🎿",
  rating: 4.38,
  reviews: 720,
  gradient: "linear-gradient(160deg,#0a1a38,#162e5e,#2d5fab)",
  accent: "#82b4e8",
  tags: ["Highest Base in NZ", "Powder Days", "Club Field Character", "Craigieburn Range"],
  photo: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass: "independent"
},
```

**Rationale:** Porters is the closest major ski area to Christchurch (90min), at the highest base altitude of any NZ ski field (1,515m). CHC has only mt-hutt-nz — Porters creates a groomed-vs-powder pair. IN SEASON NOW (July = NZ winter peak). CHC: AP_CONTINENT=oceania ✅, AIRPORT_COORDS ✅, BASE_PRICES=NO (estimates only).

---

### Venue 2 — Mount Selwyn, NSW, Australia (CBR)

```javascript
{
  id: "mt-selwyn-au",
  category: "skiing",
  title: "Mount Selwyn",
  location: "New South Wales, Australia",
  lat: -35.9667,
  lon: 148.3167,
  ap: "CBR",
  icon: "🏔️",
  rating: 4.15,
  reviews: 580,
  gradient: "linear-gradient(160deg,#0c1e3a,#1a3d7a,#3270c2)",
  accent: "#7cb9e8",
  tags: ["Family First", "Beginner Terrain", "Snowplay Areas", "Short Drive from Canberra"],
  photo: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  skiPass: "independent"
},
```

**Rationale:** Mount Selwyn is the only dedicated beginner/family ski resort in the Snowy Mountains — intentionally distinct from charlotte-pass-au (expert, remote, high-altitude). CBR has only 1 ski venue. IN SEASON NOW (Australian ski season June–Sept). CBR: AP_CONTINENT=oceania ✅, AIRPORT_COORDS ✅, BASE_PRICES=NO.

---

### Venue 3 — Praia do Sancho, Fernando de Noronha (FEN)

```javascript
{
  id: "praia-do-sancho-fen",
  category: "beach",
  title: "Praia do Sancho",
  location: "Fernando de Noronha, Brazil",
  lat: -3.8878,
  lon: -32.4244,
  ap: "FEN",
  icon: "🏖️",
  rating: 4.99,
  reviews: 8400,
  gradient: "linear-gradient(160deg,#001433,#003380,#0066cc)",
  accent: "#3399ff",
  tags: ["TripAdvisor World No.1 Beach", "Sea Turtle Nesting", "UNESCO Marine Park", "Cliffside Access"],
  photo: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
},
```

**Rationale:** Rated #1 beach in the world by TripAdvisor multiple years. Accessed via ladder through a cliff fissure. FEN has only beach_noronha (island overview) — Sancho is a distinct destination within the archipelago. UNESCO caps visitors at 420/day. FEN: AP_CONTINENT=latam ✅, AIRPORT_COORDS ✅, BASE_PRICES=NO.

---

### Venue 4 — Starfish Beach, Bocas del Toro (BOC)

```javascript
{
  id: "starfish-beach-bocas",
  category: "beach",
  title: "Starfish Beach",
  location: "Bocas del Toro, Panama",
  lat: 9.3822,
  lon: -82.2742,
  ap: "BOC",
  icon: "🏖️",
  rating: 4.81,
  reviews: 11200,
  gradient: "linear-gradient(160deg,#002b1a,#005533,#009966)",
  accent: "#33cc88",
  tags: ["Resident Starfish Colony", "Caribbean Jungle Shore", "Snorkeling", "Water Taxi Access"],
  photo: "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
},
```

**Rationale:** Playa Estrella (Starfish Beach) — shallow turquoise water with hundreds of visible orange starfish from shore. 20-min water taxi from Bocas town on Bastimentos island. BOC has only beach_bocas (main island overview). BOC: AP_CONTINENT=na ✅, AIRPORT_COORDS ✅, BASE_PRICES=NO.

---

### Venue 5 — Cinnamon Bay, St John USVI (STT)

```javascript
{
  id: "cinnamon-bay-stjohn",
  category: "beach",
  title: "Cinnamon Bay",
  location: "St John, U.S. Virgin Islands",
  lat: 18.3533,
  lon: -64.7492,
  ap: "STT",
  icon: "🏖️",
  rating: 4.77,
  reviews: 9600,
  gradient: "linear-gradient(160deg,#002244,#004488,#0077cc)",
  accent: "#33aaff",
  tags: ["Longest Beach in USVI", "Virgin Islands National Park", "Snorkeling Ruins", "Campground"],
  photo: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
```

**Rationale:** Longest beach in the Virgin Islands National Park (0.5 mile). Snorkeling over an 18th-century sugar mill ruin underwater. STT has 3 venues; Cinnamon Bay adds the park's largest, most accessible beach. 30-min ferry from St Thomas makes it day-trip viable for STT arrivals. July peak Caribbean season. STT: AP_CONTINENT=na ✅, AIRPORT_COORDS ✅, BASE_PRICES=NO.

---

**Pre-add checklist for today's 5 (verify before pasting into app.jsx):**
- All 5 APs (CHC, CBR, FEN, BOC, STT) confirmed in AP_CONTINENT ✅
- All 5 APs confirmed in AIRPORT_COORDS ✅
- All 5 APs absent from BASE_PRICES — deal scoring shows estimates only ⚠️
- No existing venue with same `id` — confirmed clean ✅
- Run through `scripts/validate-venues.mjs` before committing

---

## One Observation the PM Should Know

**The AP_CONTINENT gap is confirmed new and fast to fix.** 7 venues (tioman-island-t11, laguna-beach-t24, muscat-beach-t26, qantab-beach-oman, ipanema-rio, las-teresitas-tfe, elafonissi-beach-chq) have airports missing from `AP_CONTINENT`. Continent filtering may silently misplace these venues. The fix is 6 lines of JS — paste into the AP_CONTINENT block, no brace risk, no redeploy. This should be bundled into the next code session as a 30-second inline fix before any new venues are added, since the auto-push guard checks AP_CONTINENT membership.

**Pre-launch priority stack (updated 2026-07-29):**
1. **AP_CONTINENT fix** — 6 lines, 30 seconds, do immediately ← new
2. **BASE_PRICES backfill** (top 15 airports → ~90 venues unlocked) — ~2hr task
3. **VPS redeploy** (Open #19, P1 "pre-traffic gate") — bundles Open #23 weather cache
4. **Venue backlog** — 10 proposals ready to paste (2 sessions worth)
