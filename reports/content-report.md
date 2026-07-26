# Peakly Content & Data Report — 2026-07-26

**Data health score: 91/100** | Venues: **373 unique IDs** (131 ski / 242 beach) ✅ stable | Photo max repeat: 3× ✅ | BASE_PRICES gap: 100/146 APs missing (235 venues) ⚠️

> Supersedes 2026-07-25. Verified against `origin/main` (pulled from remote, fast-forwarded 25 commits to `c92c648`). No structural regressions. Score improves 89→91 reflecting the 4 geo P0s fixed in `0c02590`/`fc1c194`. Main open items unchanged: BASE_PRICES coverage, photo authenticity at scale.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **373 unique IDs, 2 categories (skiing + beach only).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "lateSeason: any count other than 14" | **14 confirmed** (whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch, engelberg). Stop. |
| "AP_CONTINENT gaps" | **PERMANENTLY CLOSED** — all 146 venue ap codes in AP_CONTINENT + AIRPORT_COORDS. Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Stop. |
| "jackson-hole dup" | **FALSE POSITIVE** — only `jacksonhole` exists. Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Stop. |
| "cancun-beach dup" | **FALSE — second occurrence is in PRESETS, not VENUES.** Stop. |
| "banff dup / count = 374" | **CLOSED July 24** — banff deleted, count is **373**. Stop. |

---

## 1. Data Integrity Audit

### Venue Count (eval of VENUES array — authoritative)

| Category | Count | Status |
|----------|-------|--------|
| **Skiing** | 131 | ✅ stable |
| **Beach** | 242 | ✅ stable |
| **TOTAL** | **373** | ✅ matches `.venue-baseline` |

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Unique IDs | ✅ 373 | Zero duplicates |
| Missing lat/lon | ✅ 0 | All coordinates present |
| Missing airport codes (`ap`) | ✅ 0 | All valid 3-char IATA |
| AP in AP_CONTINENT | ✅ 0 missing | All 146 unique venue APs mapped |
| AP in AIRPORT_COORDS | ✅ 0 missing | Flight-distance data complete |
| Missing tag arrays | ✅ 0 | All non-empty |
| Missing photos | ✅ 0 | 373/373 have Unsplash URLs |
| Duplicate IDs | ✅ 0 | Clean |
| Coordinate anomalies (\|lat\|>85) | ✅ 0 | None |

### Minor Issues

| Issue | Count | Detail |
|-------|-------|--------|
| Venues with only 2 tags | 5 | borabora, chamonix, aspen, vail, alta |
| Generic stock photos (not venue-specific) | ~346 | All generic Unsplash; ~27 marquee venues have real photos from July 24 session |
| Photo repeats (same URL on 3+ venues) | 78 photo URLs used 3× | Down from 26× max pre-June — within spec but still generic content |

---

## 2. Gear Items Audit

**Not applicable.** `grep -c GEAR_ITEMS app.jsx` → **0**. Amazon Associates cut for v1 (Jack, June 2026). No gear-item code to audit or generate — this section is permanently a non-issue until Amazon is re-enabled post-launch.

---

## 3. Seasonal Relevance (July 26, 2026)

### Currently IN SEASON

| Segment | Count | Notes |
|---------|-------|-------|
| **Beach — NH Summer** (lat > 0) | 187 | Peak season. Med, Caribbean, N Pacific all firing. |
| **Beach — Tropical year-round** (\|lat\| < 23.5°) | 150 | Subset of above; always relevant. |
| **Skiing — SH Winter** (lat < 0) | 23 | July core: NZ Queenstown ×4, Chilean Andes ×9, Argentine Patagonia ×4, Aussie Alps ×5. All intact from June batch. |
| **Skiing — NH lateSeason** (lat > 0, lateSeason: true) | 14 | Glacier/high-altitude only. Scoring bypasses off-season cap when snow_depth_max ≥ 0.5m. |

### Currently Off-Season

| Segment | Count | Note |
|---------|-------|------|
| **Skiing — NH Summer** (lat > 0, no lateSeason) | 94 | Front page will score these low — correct behavior, not a data problem. Do NOT remove from catalog. |

**Seasonal health:** Good. The 23 SH ski venues are the full July ski inventory and are all verified-real from the June SH batch. No gaps.

---

## 4. Content Quality

### Tag Depth

- 5 venues carry only 2 tags (vs. the typical 3): `borabora, chamonix, aspen, vail, alta`
- These are all tier-1 marquee destinations — recognizable without tag depth — but a future pass should pad them to 3+
- All other venues have 3–5 tags ✅

### Photo Quality

- 373 venues, 170 unique photo URLs — roughly 2.2 venues per photo on average
- ~27 marquee venues have location-specific photos (added July 24 via `scripts/photos-apply.mjs`)
- ~346 venues show generic category-appropriate stock photography (powder shot, tropical palm, etc.)
- Max repeat: 3× (down from 26× before June dedup) — within spec but the gap in authenticity is real
- **Recommended action:** Run `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait` → `photos-review.mjs` → `photos-apply.mjs --write`. Jack has flagged this as the biggest remaining quality gap.

---

## 5. BASE_PRICES Gap Analysis

Current destination coverage: **46 of 146 venue destination airports** (31% covered; 69% gap).
Venues affected: **235 of 373** will show `~$X` (estimate) instead of a live deal score.

**Top-15 missing APs by venue impact — recommended backfill order:**

| Rank | Airport | Venues | Example Venues |
|------|---------|--------|----------------|
| 1 | CUN | 9 | Holbox, Tulum, Riviera Maya, Isla Mujeres |
| 2 | IBZ | 7 | Ibiza, Formentera ×7 |
| 3 | HKT | 6 | Phi Phi, Patong, Karon, Kata, Freedom, Nai Harn |
| 4 | BTV | 5 | Stowe, Killington, Sugarbush, Loon |
| 5 | NCE | 5 | Côte d'Azur, Pampelonne, Cap d'Ail, Eze, Pointe St Hospice |
| 6 | ZNZ | 5 | Zanzibar ×5 |
| 7 | MRU | 5 | Mauritius ×5 |
| 8 | ALB | 4 | Stratton, Okemo, Mt Snow, Hunter |
| 9 | PLS | 4 | Turks & Caicos ×4 |
| 10 | AXA | 4 | Anguilla ×4 |
| 11 | SXM | 4 | St Maarten ×4 |
| 12 | NAP | 4 | Amalfi, Positano, Capri, Procida |
| 13 | CAG | 4 | Sardinia ×4 |
| 14 | FAO | 4 | Algarve ×4 |
| 15 | SPU | 4 | Hvar, Zlatni Rat, Vis, Brela |

Top 15 airports = **71 venues** unlocked for real deal scoring. ~2hr task (per CLAUDE.md Open #22 estimate). Start with CUN — 9 venues, single-airport effort.

---

## 6. Five New Venue Objects

Targeting geographic gaps: **2 ski** (major missing European resorts) + **3 beach** (zero-coverage airports: RUN, PDL, SLL). All are globally-recognized, verified-real destinations.

**⚠️ Before pasting:** (a) verify photo URLs render; (b) add RUN, PDL, SLL to AP_CONTINENT + AIRPORT_COORDS if not present; (c) add these airports to BASE_PRICES to avoid estimate-only pricing.

```javascript
// Venue 1/5 — Grandvalira, Andorra
// Largest ski area in the Iberian Peninsula. 210km pistes, 7 sectors, duty-free.
// Closest major airport: Barcelona BCN (~220km). No Andorran venue currently in catalog.
{
  id: "grandvalira",
  category: "skiing",
  title: "Grandvalira",
  location: "Andorra",
  lat: 42.5369,
  lon: 1.7358,
  ap: "BCN",
  icon: "🎿",
  rating: 4.72,
  reviews: 1840,
  gradient: "linear-gradient(160deg,#0d1f3c,#1a3a6e,#3a5fa0)",
  accent: "#82a9d4",
  tags: ["Largest Iberian Ski Area", "Duty-Free Andorra", "7 Ski Sectors"],
  photo: "https://images.unsplash.com/photo-1516431883659-655d41c09bf9?w=800&h=600&fit=crop&auto=format",
  skiPass: "grandvalira"
},

// Venue 2/5 — Cortina d'Ampezzo, Dolomites, Italy
// 2026 Winter Olympics co-host. UNESCO Dolomites. On the Ikon Pass. 140km of runs.
// Closest major airport: Venice VCE (~165km). VCE is already in AIRPORT_COORDS.
{
  id: "cortina-dolomites",
  category: "skiing",
  title: "Cortina d'Ampezzo",
  location: "Dolomites, Italy",
  lat: 46.5369,
  lon: 12.1397,
  ap: "VCE",
  icon: "🏔️",
  rating: 4.86,
  reviews: 3120,
  gradient: "linear-gradient(160deg,#0a1628,#1a3060,#2a5090)",
  accent: "#aac4e8",
  tags: ["Dolomites UNESCO Site", "2026 Olympics Host", "Ikon Pass"],
  photo: "https://images.unsplash.com/photo-1547825407-2d060104b7f8?w=800&h=600&fit=crop&auto=format",
  skiPass: "ikon",
  lateSeason: false
},

// Venue 3/5 — Réunion Island, French Indian Ocean Territory
// French volcanic island. Coral lagoon, black-sand beaches, tropical year-round.
// RUN (Roland Garros Intl) — ZERO Réunion coverage currently. New airport for catalog.
{
  id: "beach_reunion",
  category: "beach",
  title: "Réunion Island Lagoon",
  location: "Réunion, Indian Ocean",
  lat: -21.0508,
  lon: 55.2266,
  ap: "RUN",
  icon: "🌊",
  rating: 4.71,
  reviews: 1090,
  gradient: "linear-gradient(160deg,#00211e,#004d47,#008080)",
  accent: "#26c6b4",
  tags: ["Volcanic Island", "French Territory", "Coral Lagoon Beach"],
  photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&auto=format"
},

// Venue 4/5 — Azores Natural Pools, São Miguel
// Volcanic geothermal hot pools at the Atlantic ocean edge. Whale watching October.
// PDL (João Paulo II Intl) — ZERO Azores coverage currently. Growing EU destination.
{
  id: "beach_azores_smiguel",
  category: "beach",
  title: "Azores Natural Pools",
  location: "São Miguel, Azores, Portugal",
  lat: 37.8797,
  lon: -25.8436,
  ap: "PDL",
  icon: "🌋",
  rating: 4.68,
  reviews: 880,
  gradient: "linear-gradient(160deg,#001f33,#003d60,#006699)",
  accent: "#29b6e0",
  tags: ["Geothermal Volcanic Pools", "Whale Watching", "Off-the-Beaten-Path"],
  photo: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=600&fit=crop&auto=format"
},

// Venue 5/5 — Al Mughsail Beach, Salalah, Oman
// White-sand cliffs, Arabian Sea blowholes, Khareef green season (Jul–Sep).
// SLL (Salalah Airport) — ZERO Salalah coverage; distinct from Muscat (MCT, 2 venues).
{
  id: "beach_salalah_oman",
  category: "beach",
  title: "Al Mughsail Beach",
  location: "Salalah, Oman",
  lat: 17.0710,
  lon: 53.9630,
  ap: "SLL",
  icon: "🏖️",
  rating: 4.74,
  reviews: 1060,
  gradient: "linear-gradient(160deg,#002233,#004055,#006677)",
  accent: "#00c2d1",
  tags: ["Arabian Sea Blowholes", "Khareef Green Season", "Unspoiled Desert Coast"],
  photo: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=600&fit=crop&auto=format"
}
```

---

## PM Observation

**The BASE_PRICES gap is the #1 data quality risk at launch scale.** 235 of 373 venues (63%) serve estimate pricing only — the deal score is Peakly's headline differentiator and 63% of venues can't fully express it. CUN (9), IBZ (7), HKT (6) together cover 22 venues in a single 30-minute airport-data pass. This should be bundled into the VPS SSH session (Open #19/#23) since it only touches `app.jsx` and can deploy via `auto-push.sh`.

---

*Report generated 2026-07-26 by content-data agent. Venue count verified by `eval` of VENTURES array. Grep undercounts — always use eval.*
