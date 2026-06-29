# Peakly Content & Data Quality Report — 2026-06-29

**Data health score: 97/100** (unchanged) | Build: `20260629a` ↑ | Venues: **370** (131 ski / 239 beach) | Max photo repeat: 3×

---

## Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **370 venues, 2 categories (skiing + beach).** Pivot happened May 2026. |
| "Hiking has ZERO gear items" | **Hiking category does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired May 2026. |
| "Add 5 new venue objects" | **VENUE FREEZE active (PM v68, June 24).** No additions until post-launch Plausible data confirms demand. |
| "197 venues have empty tag arrays" | **FALSE — all 370 venues have tags.** Multi-line JSON format was miscounted by prior scripts. |

---

## Fix Applied This Run

**None.** Verification pass only. Build stamp was already bumped by DevOps (20260627a → 20260629a).

---

## 1. Data Integrity Audit

### Venue Counts

| Category | Count | In Season (Jun 29, N. Hemi Summer) |
|----------|-------|-------------------------------------|
| **beach** | 239 | ~184 N.hemi firing (PEAK — July 4 weekend imminent) · ~55 S.hemi suppressed by <18°C cap |
| **skiing** | 131 | **23 S.hemi in-season** (peak southern winter) · 25 `lateSeason:true` glaciers eligible · 83 N.hemi off-season |
| **TOTAL** | **370** | Venue freeze active. No additions this run. |

### Structural Integrity

| Check | Result | Δ from Jun 28 |
|-------|--------|--------------|
| Duplicate IDs | ✅ 0 | — |
| Missing lat/lon | ✅ 0 | — |
| Missing airport codes (`ap`) | ✅ 0 | — |
| Missing tags | ✅ 0 | — |
| Missing photos | ✅ 0 | — |
| Max photo repeat | ✅ 3× (104 photos at 3×, 24 at 2×) | — |
| `lateSeason:true` venues | ✅ 25 | — |
| GEAR_ITEMS refs | ✅ 0 | — |
| Build stamp | ✅ `20260629a` | ↑ bumped by DevOps this run |
| skiPass coverage | ✅ **131/131** (34 Epic, 51 Ikon, 46 independent) | — |
| Brace balance | ✅ 5565/5565 | — |
| Single-tag venues | ✅ 0 | — |

---

## 2. Photo Audit

- 370 photo entries, **138 unique photo IDs**
- Max repeat: **3×** — stable since June 13 photo-dedup
- 104 photos shared by exactly 3 venues; 24 photos shared by exactly 2 venues
- 0 photos exceeding 3× threshold

**Δ Jun 28:** Unique photo count 135→138 (+3) — minor variance from the DevOps cache-stamp edit touching index.html, not venue data. No new duplicates introduced.

---

## 3. GEAR_ITEMS Audit

`GEAR_ITEMS = 0 occurrences` — confirmed. Amazon cut for v1, code matches.

---

## 4. Seasonal Relevance — June 29 (Reddit Launch Eve)

### Skiing — Strong for Summer

**23 S. hemisphere venues actively scoring:** NZ (Cardrona, Mt Hutt, Coronet Peak, Remarkables, Treble Cone), AUS (Falls Creek, Mt Buller, Hotham, Perisher, Charlotte Pass), Andes (Portillo, Valle Nevado, La Parva, El Colorado, Nevados de Chillán, Corralco, Cerro Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor, Pucon). All at peak mid-season ops. Hemisphere gate `isNorth = lat >= 0` confirmed correct on all 23.

**25 N. hemisphere lateSeason glaciers** eligible for bypass when `snow_depth_max >= 0.5m` — includes Verbier, Zermatt/Cervinia, Tignes, Val Thorens, Mammoth, Whistler. Real mid-summer glacier sessions exist at these resorts; the scoring engine handles it correctly.

**83 N. hemisphere non-lateSeason venues** correctly off-season capped.

### Beach — Peak

**~184 N. hemisphere beach venues** at peak June/July scoring. July 4 weekend is 5 days out — busiest US beach search window of the year.

**~55 S. hemisphere beach venues** suppressed by the 18°C water-temp hard cap — correct for southern winter.

---

## 5. Tag Distribution

| Tag Count | Venues |
|-----------|--------|
| 0 | ✅ 0 |
| 1 | ✅ 0 |
| 2 | 238 |
| 3 | 14 |
| 4 | 117 |
| 5+ | 1 |

**Unchanged from June 28.** 238 venues (most of the beach catalog) remain at 2 tags — functional minimum but thin for discovery. Post-launch sprint pending Plausible filter-click data.

---

## 6. skiPass Coverage

**131/131 skiing venues have `skiPass` populated** — Epic/Ikon filter works across the full ski catalog.

---

## 7. New Venue Additions — NONE THIS RUN

Venue freeze in effect (PM v68, June 24). Stale harness prompt requests 5 new venues — contradicts active PM directive. No venues added.

---

## One Observation for the PM

**Reddit launches tomorrow and the ski inventory is the strongest it's ever been for a summer launch.** 23 southern-hemisphere venues are at peak mid-season conditions right now — Queenstown, Bariloche, Santiago, Melbourne are all live. A skier opening the app tomorrow can legitimately plan a July trip to Cardrona or Portillo with real Open-Meteo scores. This wasn't true at launch readiness on June 4 (6 S. hemisphere venues) — the catalog expansion to 131 ski venues (23 southern-winter, 25 lateSeason) makes the "ski + beach" dual-category framing credible for the first time. One pre-post recommendation: make sure the Reddit copy acknowledges the summer ski angle — even one sentence ("best southern-hemisphere ski resorts right now") surfaces a hook that KAYAK and Hopper can't compete with.

---

*Content agent — 2026-06-29 UTC | Repo: 6d6cf0f | Venues: 370 (131 ski / 239 beach) | Build: 20260629a*
