# Peakly Content & Data Quality Report — 2026-06-30

**Data health score: 97/100** | Build: `20260629a` (unchanged — freeze, no app.jsx edits) | Venues: **370** (131 ski / 239 beach) | Max photo repeat: 3×

---

## Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **370 venues, 2 categories (skiing + beach).** Pivot happened May 2026. |
| "Hiking has ZERO gear items" | **Hiking category does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired May 2026. |
| "Add 5 new venue objects" | **VENUE FREEZE active (PM v68, June 24 → July 3).** No additions until post-launch Plausible data confirms demand. |
| "197 venues have empty tag arrays" | **FALSE — all 370 venues have tags.** Multi-line JSON format was miscounted by prior scripts. |

---

## Fix Applied This Run

**None.** Venue freeze active through July 3 — verification pass only.

---

## 1. Data Integrity Audit

### Venue Counts

| Category | Count | In Season (Jun 30, N. Hemi Summer) |
|----------|-------|-------------------------------------|
| **beach** | 239 | ~215 N.hemi firing (PEAK — July 4 weekend) · ~24 S.hemi suppressed by <18°C cap |
| **skiing** | 131 | **23 S.hemi in-season** (peak southern winter) · **25 lateSeason glaciers** eligible · 83 N.hemi off-season capped |
| **TOTAL** | **370** | Venue freeze active. No changes this run. |

### Structural Integrity

| Check | Result | Δ from Jun 29 |
|-------|--------|--------------|
| Duplicate IDs | ✅ 0 | — |
| Missing lat/lon | ✅ 0 | — |
| Missing airport codes (`ap`) | ✅ 0 | — |
| Missing tags | ✅ 0 | — |
| Missing photos | ✅ 0 | — |
| Max photo repeat | ✅ 3× (104×3, 24×2, 10×1 = 138 unique) | — |
| `lateSeason:true` venues | ✅ 25 (6 compact + 19 JSON-format) | — |
| GEAR_ITEMS refs | ✅ 0 | — |
| Build stamp lockstep | ✅ `20260629a` in app.jsx / sw.js / index.html | — |
| skiPass coverage | ✅ **131/131** (34 Epic / 51 Ikon / 46 independent) | — |
| Brace balance | ✅ 5565/5565 | — |
| Airport coverage (AP_CONTINENT) | ✅ 131 unique airports, all mapped | — |
| Airport coverage (AIRPORT_COORDS) | ✅ 131 unique airports, all have coords | — |

### Logical Duplicate Venues (different IDs, same physical location) — DEFERRED

These were introduced when batch-format venues were added on top of existing compact-format entries. The boot-time validator (which checks IDs only) does not catch these. **Do not remove during freeze.** Flag for post-launch triage.

| Compact ID | Batch ID | Location | Impact |
|-----------|---------|----------|--------|
| `bigsky` (lat 45.2865) | `big-sky-montana` (lat 45.2851) | Big Sky Resort, Montana | Two cards for same mountain; user could wishlist both |
| `beach_grace` (lat 21.7918) | `grace-bay-turks` (lat 21.8027) | Grace Bay, Turks & Caicos | Slight coord difference; both serve PLS airport |
| `beach_miami` (lat 25.7907, 42,800 reviews) | `south-beach-miami` (lat 25.7907, 21,400 reviews) | South Beach Miami | Identical coords; different review counts |

**Recommended fix post-launch:** remove the lower-quality compact entry in each pair (`bigsky`, `beach_grace`, `beach_miami`) — the batch-format versions have richer tags.

---

## 2. Photo Audit

- 370 photo entries, **138 unique photo IDs**
- Distribution: 104 photos used 3× · 24 photos used 2× · 10 photos used 1×
- Max repeat: **3×** — stable since June 13 photo-dedup (commit `a143e4c`)
- `"Surf Breaks"` tag on 15 beach venues — **legitimate** (describes waves visible from beach, not a surfing category leak)

---

## 3. GEAR_ITEMS Audit

`GEAR_ITEMS = 0 occurrences` — confirmed. Amazon cut for v1 (Jack's call, 2026-06-09), reaffirmed 2026-06-10. Code matches.

---

## 4. Seasonal Relevance — June 30

**Beach (239 venues): PEAK Northern Hemisphere summer.**
July 4 weekend is effectively here. North-hemisphere beach venues are all in peak scoring window. ~24 S.hemisphere beach venues (south of −15°) will score poorly due to winter water temps — the <18°C hard cap correctly suppresses them. No scoring fix needed; this is intended behavior.

**Skiing (131 venues):** Mixed picture is healthy for summer UX.
- **23 S. hemisphere venues IN season** (peak southern winter): NZ (Remarkables, Treble Cone), AUS (Thredbo), Andes (Portillo, Pucon, Cerro Castor, Valle Nevado, and 16 others added June 2026).
- **25 N. hemisphere lateSeason glaciers** eligible when `snow_depth_max ≥ 0.5m`: Whistler, Chamonix, Tignes/Val d'Isère, Cervinia, Mammoth, Zermatt, Val Thorens, Verbier, and 17 batch additions. Real summer glacier sessions exist at most of these.
- **83 N. hemisphere standard ski** correctly off-season capped by the hemisphere gate.

**⚠️ UX note for PM:** On July 4 weekend, a user in NYC choosing "Skiing" will see ~48 venues max (23 S-hemi + up to 25 lateSeason qualifying on snow depth). Grid will look lean vs beach's 215. The pill still shows valid results — this is correct behavior — but get ahead of it: first Reddit comments might say "skiing tab is empty." No code change needed; just have a reply ready.

---

## 5. Content Quality Checks

| Check | Result |
|-------|--------|
| Descriptions | No `description` field — venues use title + location + tags. N/A. |
| Tags under 2 | ✅ 0 venues |
| Ratings in range 4.0–5.0 | ✅ All in range (lowest: 4.51 Laguna Beach, highest: 4.99 Fernando de Noronha) |
| Cross-category tag contamination | ✅ 0 ski tags on beach / 0 beach tags on ski |
| `Powder Day` on beach venues | ✅ 0 |
| Suspicious review counts | ✅ None — highest is 42,800 (South Beach Miami, plausible TripAdvisor scale) |

---

## 6. New Venue Additions

**SKIPPED — Venue freeze active until July 3 (PM v68/v72 decision).**

Post-launch priority queue (to be built from Plausible data):
1. S. hemisphere ski (23 now — if Reddit shows demand, add Whakapapa NZ, La Molina Spain, Bariloche City)
2. Caribbean long-tail (St. Kitts, Dominica, Grenada — underrepresented vs PR/Barbados density)
3. Middle East beach (only Muscat MCT today; Dubai/Abu Dhabi beaches missing)

---

## One Observation for PM

**Three logical duplicate venue pairs exist** (Big Sky Resort, Grace Bay, South Beach Miami — same location, two different IDs each). The boot-time validator catches duplicate IDs but not duplicate locations. At 370 venues the UX impact is invisible, but a user could wishlist "Grace Bay" (ID: `beach_grace`) and "Grace Bay Beach" (ID: `grace-bay-turks`) separately, creating two Supabase rows for the same resort. Low urgency. Post-launch content sprint, one-minute `VENUES.filter()` fix: remove the three compact-format duplicates (`bigsky`, `beach_grace`, `beach_miami`). No scoring logic changes.
