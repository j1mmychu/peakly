# Peakly Content & Data Quality Report — 2026-06-28

**Data health score: 97/100** ↑1 | Build: `20260627a` | Venues: **370** (131 ski / 239 beach) | Max photo repeat: 3×

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

**None.** Verification pass only. All content gates confirmed green.

---

## 1. Data Integrity Audit

### Venue Counts

| Category | Count | In Season (Jun 28, N. Hemi Summer) |
|----------|-------|-------------------------------------|
| **beach** | 239 | ~184 N.hemi firing (PEAK) · ~55 S.hemi suppressed by <18°C cap |
| **skiing** | 131 | 23 S.hemi in-season · 83 N.hemi off-season · 25 `lateSeason:true` glaciers eligible |
| **TOTAL** | **370** | Venue freeze active. No additions this run. |

### Structural Integrity

| Check | Result | Δ from Jun 27 |
|-------|--------|--------------|
| Duplicate IDs | ✅ 0 | — |
| Missing lat/lon | ✅ 0 | — |
| Missing airport codes (`ap`) | ✅ 0 | — |
| Missing tags | ✅ 0 | — |
| Missing photos | ✅ 0 | — |
| AP_CONTINENT coverage | ✅ 279 entries, 0 gaps | — |
| AIRPORT_COORDS coverage | ✅ 185 entries, 0 gaps | — |
| Max photo repeat | ✅ 3× | — |
| `lateSeason:true` venues | ✅ 25 | — |
| GEAR_ITEMS refs | ✅ 0 | — |
| Build stamp | `20260627a` | No bump (no app.jsx edits today) |
| skiPass coverage | ✅ **131/131** | **NEW closure — was 43/67 on Jun 4** |
| Brace balance | ✅ 5565/5565 | — |
| Single-tag venues | ✅ 0 | — |

---

## 2. Photo Audit

- 370 photo entries, **135 unique photo IDs**
- Max repeat: **3×** — stable since June 13 photo-dedup script
- 0 photos exceeding 3× threshold

No action needed.

---

## 3. GEAR_ITEMS Audit

`GEAR_ITEMS = 0 occurrences` — correct. Amazon cut for v1, code matches.

---

## 4. Seasonal Relevance — June 28 (N. Hemisphere Peak Summer)

### Actively Scoring

**Beach N. Hemisphere (~184 venues):** PEAK season. Full scoring confidence. Hurricane season began June 1 — Open-Meteo precip data dynamically suppresses Gulf/Atlantic venues during storm windows.

**Ski S. Hemisphere (23 venues):** NZ (Cardrona, Mt Hutt, Coronet Peak, Remarkables, Treble Cone), AUS (Falls Creek, Mt Buller, Hotham, Perisher, Charlotte Pass), Chilean/Argentine Andes (Portillo, Valle Nevado, La Parva, El Colorado, Nevados de Chillán, Corralco, Cerro Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor) — peak winter ops. Hemisphere flag `isNorth = lat >= 0` gates all 23 correctly.

**Ski N. Hemisphere lateSeason (25 venues):** Zermatt/Cervinia, Tignes, Val Thorens, Engelberg, Verbier, Mammoth, Whistler, and 18 others eligible for glacier bypass when `snow_depth_max >= 0.5m`.

### Suppressed (Correct)

- Ski N. Hemisphere, no lateSeason (83 venues): off-season cap applied ✅
- Beach S. Hemisphere (~55 venues): below 18°C hard cap ✅

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

Tag enrichment from June 26 held. ~64% of catalog has 2 tags — functional but thin for discovery browsing. Post-launch sprint item pending Plausible filter-click data.

---

## 6. skiPass Coverage — Full Closure Confirmed

**131/131 skiing venues now have skiPass populated.** As recently as June 4, only 43 of 67 ski venues had this field. The catalog expansion to 131 venues brought full coverage. Epic/Ikon filter now works across the entire skiing catalog.

skiPass values in use: `"epic"`, `"ikon"`, `"independent"`.

---

## 7. New Venue Additions — NONE THIS RUN

Venue freeze in effect (PM v68, June 24). Stale harness prompt requests 5 new venues — contradicts active PM directive. No venues added.

---

## One Observation for the PM

**48 ski venues are actively scoreable today** (23 S-hemisphere + 25 lateSeason glaciers), up from 12 on June 4. NZ and AUS resorts are at peak mid-season opening; Andes in full swing. If the Reddit/HN post drops this week, "find the best ski weekend right now — Queenstown, Bariloche, Portillo" is a live, accurate hook backed by real Open-Meteo scores. The skiPass full-closure (131/131) also means an Epic or Ikon passholder filtering the ski catalog now sees the complete picture, not the old US-only 43-venue subset.

---

*Content agent — 2026-06-28 UTC | Repo: 0fa4622*
