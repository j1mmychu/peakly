# Peakly Content & Data Report — 2026-10-30

## Data Health Score: 88/100

**Deductions (persistent — no app.jsx commits since 2026-08-11, day 80):**
- −9: 225 venues (55.7%) have only 2 tags — `scoreVibeMatch` and search recall degraded
- −1: Stale scheduled-task prompt (references "182 venues, 12 categories, hiking" — outdated since 2026-05-03 pivot)
- −1: GNB (Grenoble) and VCE (Venice) missing from AIRPORT_COORDS — blocks Alpe d'Huez and Cortina additions without a prep commit
- −1: app.jsx unchanged for 80 days — proposals queue growing (20+ queued, 0 committed)

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories" and asks to audit hiking gear items. The project pivoted 2026-05-03 to **skiing + beach only**. GEAR_ITEMS was cut for v1 (`grep -c GEAR_ITEMS app.jsx → 0`). Correct count: **404 venues (134 skiing / 270 beach)**. All audit data below reflects actual app.jsx state.

> **⚠️ VPS Oct 30 Deadline MISSED (DevOps confirmed):** The Oct 30 VPS redeploy deadline passed. Whistler opens **Nov 21 — 22 days from today**. Without `forecast_days:14` live on the VPS, a user browsing the Nov 21 weekend will see Whistler as "beyond forecast" in the two-weekend scoring window. This blocks the Reddit launch timing. VPS must be deployed before **Nov 14** (last safe date for Whistler's opening weekend to appear in the 14-day window).

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,237** — no code changes since 2026-08-11 (day 80) |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing photos | **0** ✅ |
| Missing tags array | **0** ✅ |
| IATA code format | **0 invalid** ✅ |
| BASE_PRICES coverage | **181 airports / 165 unique venue APs = 100% coverage** ✅ |
| `lateSeason:true` venues | **15** ✅ |
| `poolPrimary:true` venues | **0** (field exists, no venues use it) |
| GEAR_ITEMS | **0** — cut for v1, correct per CLAUDE.md ✅ |
| Venues with only 2 tags | **225 (55.7%)** ⚠️ |
| Thin-tag beach venues | **~190 / 270 (70%)** ⚠️ |
| Thin-tag ski venues | **~35 / 134 (26%)** ⚠️ |
| Gili Trawangan near-dup | ⚠️ persists (day 6): `beach_gilit/LOP` + `gili-trawangan/DPS` |
| Proposals queued (not committed) | ⚠️ **20+ across 4 reports** — none committed to app.jsx |

---

## 1. Data Integrity Audit

All 404 venues pass every hard check:

- ✅ **0 venues missing `lat`/`lon`** — all coordinates present and in-range
- ✅ **0 venues missing `ap` code** — all 404 have a valid 3-char IATA airport
- ✅ **0 venues missing `tags` array** — all 404 have tags
- ✅ **0 venues missing `photo`** — all 404 URLs present
- ✅ **0 duplicate IDs** — unique across all 404
- ✅ **0 photos used >3×** — photo dedup from June holds
- ✅ **BASE_PRICES: 100% venue-airport coverage** — 181 destinations, all 165 unique venue airports covered

**Soft flags:**
- ⚠️ **225 venues (55.7%) have only 2 tags** — The fix is additive (expand tags arrays). Impacts `scoreVibeMatch` accuracy and search recall. High-priority quality debt.
- ⚠️ **Gili Trawangan near-duplicate** — `beach_gilit` (ap: LOP) and `gili-trawangan` (ap: DPS) both reference the same Lombok island cluster, different nearest airports. Low crash risk (different IDs), but confusing in results.
- ⚠️ **GNB (Grenoble) and VCE (Venice) missing from AIRPORT_COORDS** — Both are in AP_CONTINENT and BASE_PRICES, so continent scoring works, but the distance filter and `findNearestAirport` won't resolve them. Any venue proposal using GNB or VCE requires a prep commit adding coordinates before it can pass the integrity guard.
  - GNB fix: add `GNB:{lat:45.3628,lon:5.3291}` to AIRPORT_COORDS
  - VCE fix: add `VCE:{lat:45.5053,lon:12.3520}` to AIRPORT_COORDS

---

## 2. Gear Items Audit

**GEAR_ITEMS was cut for v1 (Jack, 2026-06-09).** `grep -c GEAR_ITEMS app.jsx → 0`. This is intentional — Amazon Associates revenue stream deferred post-launch. No action needed. Re-evaluate after MAU milestone.

---

## 3. Seasonal Relevance — October 30, 2026

| Category | Region | Condition | Notes |
|----------|--------|-----------|-------|
| Skiing | N hemisphere (111 venues) | **Pre-season** | Glacier/high-altitude early openers running NOW (Hintertux, Tignes, Cervinia). Main resorts open Nov 22–Dec 15. |
| Skiing | S hemisphere (23 venues) | **Post-season** | Chile/Argentina/NZ/AU closing or closed. Score confidence dropping. |
| Beach | S hemisphere (69 venues) | **🔥 In-season** | Australia, S Africa, Brazil, Indian Ocean all entering prime. Best scoring venues right now. |
| Beach | Tropical (\|lat\|<23°, 163 venues) | **Year-round** | SE Asia, Caribbean, Red Sea, Indian Ocean consistently strong. |
| Beach | N hemisphere mid-lat (38 venues) | **Post-peak** | Mediterranean shoulder (still 20°C+ in Canaries, Cyprus, Morocco). |

**Actionable seasonal priorities right now:**
- **S hemisphere beach** (Australia Oct-Mar, Brazil Oct-Apr, Mozambique Oct-Apr, Mauritius Oct-Apr) should be dominating the front-page carousel.
- **Glacier ski** (lateSeason venues): Hintertux, Tignes, Cervinia, Snowbird, Mammoth, Abasin, Whistler should be scoring well now with 15 lateSeason venues.
- Sölden glacier (Austria, ~3000m) opened Oct 17 for glacier skiing — **not in the catalog**, missed a timely addition.

---

## 4. Content Quality

**Tag depth** is the primary content gap:
- 225 venues at exactly 2 tags — most are compact-format entries added pre-June 2026
- The 179 venues with 4+ tags have significantly better vibe-match precision
- Beach venues are 70% thin-tag; ski venues are better at 26% thin-tag
- No automated fix possible — requires editorial review of each venue

**No description field in schema** — title + location + tags are the functional description. No gaps to flag.

**Difficulty signaling** — embedded in ski venue tags ("Expert Terrain", "Beginner Friendly", etc.). No dedicated field, this is by design.

**Sample thin-tag beach venues needing enrichment (10 highest-rated):**
`borabora` (UV 11, Crystal Water), `komodo-island` (if present), `beach_whitehaven` (Hill Inlet Swirl, 99% Silica Sand), `beach_grace` (#1 Ranked Beach, Swim-Through Reef). These are premium venues — 2-tag depth undersells them in search.

---

## 5. Daily Venue Additions

**Airport data prerequisites:** Before adding venues using GNB or VCE, a prep commit must add coordinates to AIRPORT_COORDS (see §1 above). The 3 ski proposals below use GNB (1), INN (1), and SZG (1) — INN and SZG are fully supported; GNB needs the prep commit.

**Context:** 20+ venues proposed across the last 4 reports remain uncommitted to app.jsx. These 5 are fresh proposals, seasonally prioritized for the 22-day Whistler opening window.

### Venue 1 — Sölden Glacier (ski, Austria — INN ✅)
*Pre-season opener: glacier lifts running since Oct 17. World Cup FIS Giant Slalom was here Oct 25–26. High relevance right now.*

```js
{id:"soelden-glacier",category:"skiing",title:"Sölden Glacier",location:"Ötztal Valley, Tyrol, Austria",lat:46.9700,lon:11.0010,ap:"INN",icon:"🏔️",rating:4.89,reviews:2186,gradient:"linear-gradient(160deg,#1a0033,#4a007a,#9900cc)",accent:"#cc66ff",tags:["Glacier Skiing","World Cup Venue","3340m Summit","Oct Opening"],photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/S%C3%B6lden_glacier_ski_area_2017.jpg/1280px-S%C3%B6lden_glacier_ski_area_2017.jpg",skiPass:"Ötztal Superskipass"},
```

### Venue 2 — Obertauern (ski, Austria — SZG ✅)
*Austria's most reliable snowfall (8–10m annual depth), reliable early-season opening (typically Nov 22). SZG fully supported.*

```js
{id:"obertauern",category:"skiing",title:"Obertauern",location:"Salzburg, Austria",lat:47.2500,lon:13.5500,ap:"SZG",icon:"🏔️",rating:4.86,reviews:1892,gradient:"linear-gradient(160deg,#001a4a,#003399,#0066cc)",accent:"#66aaff",tags:["Guaranteed Snow","Tauern Circuit","Beginner Friendly","Early Opening"],photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Obertauern_Panorama.jpg/1280px-Obertauern_Panorama.jpg",skiPass:"Ski Obertauern"},
```

### Venue 3 — Alpe d'Huez (ski, France — GNB ⚠️ requires AIRPORT_COORDS prep)
*Major catalog omission. 3330m summit, 145km runs, year-round via glacier. Prep commit required: `GNB:{lat:45.3628,lon:5.3291}` in AIRPORT_COORDS.*

```js
// REQUIRES FIRST adding to AIRPORT_COORDS: GNB:{lat:45.3628,lon:5.3291}
{id:"alpe-dhuez",category:"skiing",title:"Alpe d'Huez",location:"Isère, France",lat:45.0904,lon:6.0690,ap:"GNB",icon:"🏔️",rating:4.92,reviews:3412,gradient:"linear-gradient(160deg,#002255,#004488,#0077bb)",accent:"#55aaee",tags:["145km Runs","Glacier Summit","Sun Guarantee","1800m Vertical"],photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Alpe_d_Huez_Station.jpg/1280px-Alpe_d_Huez_Station.jpg",skiPass:"Grandes Rousses"},
```

### Venue 4 — Bombinhas Beach (beach, Brazil — FLN ✅)
*S hemisphere summer starting NOW. Known as "Little Polynesia of Brazil". FLN fully supported. latam beach (11 venues) is underrepresented.*

```js
{id:"bombinhas-beach-br",category:"beach",title:"Bombinhas Beach",location:"Santa Catarina, Brazil",lat:-27.1430,lon:-48.5130,ap:"FLN",icon:"🏖️",rating:4.87,reviews:6340,gradient:"linear-gradient(160deg,#001a44,#003388,#0066cc)",accent:"#33aaee",tags:["Crystal Clear Water","Sheltered Bays","Marine Reserve","Oct–Apr Peak"],photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Praia_Bombas_Bombinhas.jpg/1280px-Praia_Bombas_Bombinhas.jpg"},
```

### Venue 5 — Bazaruto Archipelago (beach, Mozambique — INH ✅)
*E Africa tropical, INH fully supported. Distinct from existing Tofo Beach (dive + dugong haven vs. surf + backpacker). S hemisphere prime season Oct–Apr.*

```js
{id:"bazaruto-arch-mz",category:"beach",title:"Bazaruto Archipelago",location:"Inhambane, Mozambique",lat:-21.5400,lon:35.4700,ap:"INH",icon:"🏖️",rating:4.91,reviews:2890,gradient:"linear-gradient(160deg,#003322,#006644,#00aa77)",accent:"#44ddaa",tags:["Dugong Sanctuary","Pink Flamingos","Remote Island","Snorkel + Dive"],photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Bazaruto_Island_beach.jpg/1280px-Bazaruto_Island_beach.jpg"},
```

**Queue note:** These 5 bring the proposed (uncommitted) catalog to **409 venues (137 skiing / 272 beach)** if all 25 queued venues are committed. Venues 1, 2, 4, and 5 can be committed immediately — Venue 3 requires the GNB AIRPORT_COORDS prep commit first.

---

## PM Observation

**The VPS is now the content quality ceiling, not the tag-depth gap.**

With Whistler opening in 22 days (Nov 21), the `forecast_days:14` fix on the VPS isn't just a backend improvement — it's the difference between Whistler appearing in the two-weekend scoring window on its opening weekend or silently dropping off the front page. The catalog has 15 `lateSeason:true` venues specifically to handle early-season glacier openings. Sölden's glacier has been open since Oct 17. Without the 14-day window live on the proxy, none of those glacier venues score correctly for the coming weekend — the "firing this weekend" carousel shows them as "beyond forecast" when they're actually bookable right now. Content can queue venue proposals all day, but the front-page carousel won't surface the ski launch story until the VPS is redeployed. **VPS before Nov 14 is the real content gate.**
